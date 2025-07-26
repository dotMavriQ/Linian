#!/bin/bash

# Linian Plugin Deployment Script
# This script builds the plugin and deploys it to your Obsidian vault for testing

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
BUILD_DIR="$(pwd)"

echo -e "${BLUE}🚀 Starting Linian Plugin Deployment${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"

# Check if we're in the right directory
if [ ! -f "manifest.json" ] || [ ! -f "main.ts" ]; then
    echo -e "${RED}❌ Error: Not in the Linian plugin directory${NC}"
    echo -e "${RED}   Please run this script from the Linian project root${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Build the plugin
echo -e "${YELLOW}🔨 Building plugin...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completed${NC}"

# Check if build artifacts exist
if [ ! -f "main.js" ]; then
    echo -e "${RED}❌ Error: main.js not found after build${NC}"
    exit 1
fi

# Create Obsidian plugins directory if it doesn't exist
if [ ! -d "$OBSIDIAN_PLUGINS_DIR" ]; then
    echo -e "${YELLOW}📁 Creating Obsidian plugins directory...${NC}"
    mkdir -p "$OBSIDIAN_PLUGINS_DIR"
fi

# Create target directory if it doesn't exist
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}📁 Creating plugin directory...${NC}"
    mkdir -p "$TARGET_DIR"
fi

# Copy required files
echo -e "${YELLOW}📋 Deploying plugin files...${NC}"

# Copy manifest.json
cp manifest.json "$TARGET_DIR/"
echo -e "   ✓ manifest.json"

# Copy main.js
cp main.js "$TARGET_DIR/"
echo -e "   ✓ main.js"

# Copy styles.css
cp styles.css "$TARGET_DIR/"
echo -e "   ✓ styles.css"

# Copy versions.json if it exists
if [ -f "versions.json" ]; then
    cp versions.json "$TARGET_DIR/"
    echo -e "   ✓ versions.json"
fi

# Set appropriate permissions
chmod 644 "$TARGET_DIR"/*
echo -e "   ✓ Set file permissions"

# Display deployment summary
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Plugin Location:${NC} $TARGET_DIR"
echo -e "${BLUE}Files Deployed:${NC}"
ls -la "$TARGET_DIR" | tail -n +2 | while read line; do
    echo -e "   ${GREEN}✓${NC} $line"
done

echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "   1. Open Obsidian"
echo -e "   2. Go to Settings → Community Plugins"
echo -e "   3. Make sure 'Safe mode' is OFF"
echo -e "   4. Find 'Linian' in the installed plugins list"
echo -e "   5. Enable the plugin"
echo -e "   6. Configure your Linear API key in Settings → Linian"
echo ""
echo -e "${BLUE}🔧 For development:${NC}"
echo -e "   • Run 'npm run dev' for auto-rebuild during development"
echo -e "   • Re-run this script to deploy changes"
echo -e "   • Check Obsidian's Developer Console (Ctrl+Shift+I) for errors"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
