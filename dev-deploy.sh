#!/bin/bash

# Linian Plugin Development Deployment Script
# This script builds the plugin in watch mode and auto-deploys changes

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PLUGIN_NAME="linian"
# Default path - can be overridden with environment variable
OBSIDIAN_PLUGINS_DIR="${OBSIDIAN_PLUGINS_DIR:-$HOME/.obsidian/plugins}"
TARGET_DIR="$OBSIDIAN_PLUGINS_DIR/$PLUGIN_NAME"

echo -e "${BLUE}🔄 Starting Linian Development Mode${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"

# Check if we're in the right directory
if [ ! -f "manifest.json" ] || [ ! -f "main.ts" ]; then
    echo -e "${RED}❌ Error: Not in the Linian plugin directory${NC}"
    echo -e "${RED}   Please run this script from the Linian project root${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Function to deploy static files
deploy_static() {
    echo -e "${YELLOW}📋 Deploying static files...${NC}"
    cp manifest.json "$TARGET_DIR/" 2>/dev/null && echo -e "   ✓ manifest.json" || true
    cp styles.css "$TARGET_DIR/" 2>/dev/null && echo -e "   ✓ styles.css" || true
    cp versions.json "$TARGET_DIR/" 2>/dev/null && echo -e "   ✓ versions.json" || true
    chmod 644 "$TARGET_DIR"/* 2>/dev/null || true
}

# Deploy static files initially
deploy_static

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping development mode...${NC}"
    # Kill background processes
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}✅ Development mode started${NC}"
echo -e "${BLUE}Plugin Location:${NC} $TARGET_DIR"
echo -e "${YELLOW}Watching for changes... (Press Ctrl+C to stop)${NC}"
echo ""

# Start build in watch mode in background
npm run dev &
BUILD_PID=$!

# Function to copy main.js when it changes
copy_main_js() {
    if [ -f "main.js" ]; then
        cp main.js "$TARGET_DIR/"
        echo -e "${GREEN}🔄 Updated main.js at $(date +'%H:%M:%S')${NC}"
    fi
}

# Watch for changes to main.js and copy it
if command -v inotifywait >/dev/null 2>&1; then
    # Use inotifywait if available (more efficient)
    while true; do
        inotifywait -e modify main.js 2>/dev/null && copy_main_js
    done &
    WATCH_PID=$!
else
    # Fallback to polling
    echo -e "${YELLOW}⚠️  inotifywait not found, using polling (install inotify-tools for better performance)${NC}"
    while true; do
        sleep 2
        if [ -f "main.js" ] && [ "main.js" -nt "$TARGET_DIR/main.js" ]; then
            copy_main_js
        fi
    done &
    WATCH_PID=$!
fi

# Watch for changes to static files
while true; do
    sleep 5
    
    # Check if static files have changed
    if [ "manifest.json" -nt "$TARGET_DIR/manifest.json" ] || \
       [ "styles.css" -nt "$TARGET_DIR/styles.css" ] || \
       [ "versions.json" -nt "$TARGET_DIR/versions.json" ]; then
        echo -e "${BLUE}📱 Static files updated at $(date +'%H:%M:%S')${NC}"
        deploy_static
    fi
done
