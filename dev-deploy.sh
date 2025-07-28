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
# Set OBSIDIAN_PLUGINS_DIR to your specific vault's plugins directory
OBSIDIAN_PLUGINS_DIR="${OBSIDIAN_PLUGINS_DIR:-$HOME/Documents/LIFE/.obsidian/plugins}"
TARGET_DIR="$OBSIDIAN_PLUGINS_DIR/$PLUGIN_NAME"

# Function to find existing plugin directory (case-insensitive)
find_existing_plugin_dir() {
    if [ -d "$OBSIDIAN_PLUGINS_DIR" ]; then
        # Look for any case variation of linian
        for dir in "$OBSIDIAN_PLUGINS_DIR"/[Ll]inian*; do
            if [ -d "$dir" ]; then
                echo "$dir"
                return 0
            fi
        done
    fi
    return 1
}

echo -e "${BLUE}🔄 Starting Linian Development Mode${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"

# Check for existing plugin installations
EXISTING_DIR=$(find_existing_plugin_dir)
if [ -n "$EXISTING_DIR" ] && [ "$EXISTING_DIR" != "$TARGET_DIR" ]; then
    echo -e "${YELLOW}⚠️  Found existing plugin at: $EXISTING_DIR${NC}"
    echo -e "${YELLOW}   Moving to correct location: $TARGET_DIR${NC}"
    
    # Create target directory if needed
    mkdir -p "$TARGET_DIR"
    
    # Move files from old location
    if [ -d "$EXISTING_DIR" ]; then
        cp -r "$EXISTING_DIR"/* "$TARGET_DIR/" 2>/dev/null || true
        rm -rf "$EXISTING_DIR"
        echo -e "${GREEN}✅ Moved existing installation${NC}"
    fi
fi

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
    
    # Verify files exist before copying
    local files_deployed=0
    
    if [ -f "manifest.json" ]; then
        cp manifest.json "$TARGET_DIR/" && echo -e "   ✓ manifest.json" && ((files_deployed++))
    else
        echo -e "${RED}   ❌ manifest.json not found${NC}"
    fi
    
    if [ -f "styles.css" ]; then
        cp styles.css "$TARGET_DIR/" && echo -e "   ✓ styles.css" && ((files_deployed++))
    else
        echo -e "${RED}   ❌ styles.css not found${NC}"
    fi
    
    if [ -f "versions.json" ]; then
        cp versions.json "$TARGET_DIR/" && echo -e "   ✓ versions.json" && ((files_deployed++))
    else
        echo -e "${YELLOW}   ⚠️  versions.json not found (optional)${NC}"
    fi
    
    # Set permissions only on existing files
    chmod 644 "$TARGET_DIR"/*.json "$TARGET_DIR"/*.css 2>/dev/null || true
    
    if [ $files_deployed -eq 0 ]; then
        echo -e "${RED}❌ No static files deployed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Deployed $files_deployed static files${NC}"
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
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}🔄 Updated main.js at $(date +'%H:%M:%S')${NC}"
            # Verify the file was copied correctly
            if [ -f "$TARGET_DIR/main.js" ]; then
                local source_size=$(stat -f%z "main.js" 2>/dev/null || stat -c%s "main.js" 2>/dev/null)
                local target_size=$(stat -f%z "$TARGET_DIR/main.js" 2>/dev/null || stat -c%s "$TARGET_DIR/main.js" 2>/dev/null)
                if [ "$source_size" = "$target_size" ]; then
                    echo -e "   ✓ File integrity verified (${source_size} bytes)"
                else
                    echo -e "${RED}   ⚠️  File size mismatch: source=${source_size}, target=${target_size}${NC}"
                fi
            fi
        else
            echo -e "${RED}❌ Failed to copy main.js${NC}"
        fi
    else
        echo -e "${RED}❌ main.js not found${NC}"
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
