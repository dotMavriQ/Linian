#!/bin/bash

# Linian Plugin Release Script
# This script handles the complete release process:
# 1. Build the plugin
# 2. Create release assets
# 3. Push to main branch
# 4. Deploy built files to release branch
# 5. Create GitHub release with proper assets

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PLUGIN_NAME="linian"
MAIN_BRANCH="main"
RELEASE_BRANCH="release"

echo -e "${BLUE}🚀 Starting Linian Release Process${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"

# Check if we're in the right directory
if [ ! -f "manifest.json" ] || [ ! -f "main.ts" ]; then
    echo -e "${RED}❌ Error: Not in the Linian plugin directory${NC}"
    echo -e "${RED}   Please run this script from the Linian project root${NC}"
    exit 1
fi

# Get version from manifest.json
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
if [ -z "$VERSION" ]; then
    echo -e "${RED}❌ Error: Could not extract version from manifest.json${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Release Information:${NC}"
echo -e "   Version: ${GREEN}$VERSION${NC}"
echo -e "   Plugin: ${GREEN}$PLUGIN_NAME${NC}"
echo ""

# Confirm release
read -p "$(echo -e "${YELLOW}Continue with release v$VERSION? (y/N): ${NC}")" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Release cancelled${NC}"
    exit 0
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

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -f main.js main.js.map
rm -rf release-temp

# Build the plugin
echo -e "${YELLOW}🔨 Building plugin...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completed${NC}"

# Verify build artifacts exist
REQUIRED_FILES=("main.js" "manifest.json" "styles.css")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required files after build:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo -e "   • $file"
    done
    exit 1
fi

# Create release assets
echo -e "${YELLOW}📦 Creating release assets...${NC}"
mkdir -p release-temp

# Copy files for release branch (in linian folder)
mkdir -p "release-temp/$PLUGIN_NAME"
cp main.js manifest.json styles.css "release-temp/$PLUGIN_NAME/"
if [ -f "versions.json" ]; then
    cp versions.json "release-temp/$PLUGIN_NAME/"
fi

# Create zip for GitHub release (files directly in root)
cd release-temp
zip "${PLUGIN_NAME}-${VERSION}.zip" ../main.js ../manifest.json ../styles.css
if [ -f "../versions.json" ]; then
    zip "${PLUGIN_NAME}-${VERSION}.zip" ../versions.json
fi
cd ..

echo -e "${GREEN}✅ Release assets created${NC}"

# Commit and push changes to main branch
echo -e "${YELLOW}📤 Committing changes to main branch...${NC}"
git add -A
git commit -m "🚀 Release v${VERSION}

- Built plugin files updated
- Release assets prepared" || echo "No changes to commit"

git push origin $MAIN_BRANCH
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push to main branch${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Changes pushed to main branch${NC}"

# Deploy to release branch
echo -e "${YELLOW}🌿 Deploying to release branch...${NC}"

# Check if release branch exists
git ls-remote --exit-code --heads origin $RELEASE_BRANCH > /dev/null 2>&1
RELEASE_BRANCH_EXISTS=$?

if [ $RELEASE_BRANCH_EXISTS -eq 0 ]; then
    # Release branch exists, update it
    git fetch origin $RELEASE_BRANCH
    git checkout -B $RELEASE_BRANCH origin/$RELEASE_BRANCH
else
    # Create new release branch
    git checkout -b $RELEASE_BRANCH
fi

# Clear release branch and add only the plugin folder
git rm -rf . > /dev/null 2>&1 || true
cp -r "release-temp/$PLUGIN_NAME"/* .
git add .
git commit -m "Deploy built plugin files for v${VERSION}

Generated from commit: $(git rev-parse $MAIN_BRANCH)"

git push origin $RELEASE_BRANCH --force
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push to release branch${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Deployed to release branch${NC}"

# Switch back to main branch
git checkout $MAIN_BRANCH

# Create and push tag
echo -e "${YELLOW}🏷️  Creating release tag...${NC}"
git tag -a "$VERSION" -m "Release v${VERSION}"
git push origin "$VERSION"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push tag${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Tag v${VERSION} created and pushed${NC}"

# Display results
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Release v${VERSION} completed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"

echo -e "${CYAN}📍 What was created:${NC}"
echo -e "   • ${GREEN}Main branch:${NC} Updated with built files"
echo -e "   • ${GREEN}Release branch:${NC} Contains plugin files in root"
echo -e "   • ${GREEN}Tag v${VERSION}:${NC} Created for this release"
echo -e "   • ${GREEN}Release assets:${NC} ${PLUGIN_NAME}-${VERSION}.zip"

echo -e "${CYAN}📂 Release branch structure:${NC}"
echo -e "   https://github.com/$(git config remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^.]*\).*/\1/')/tree/${RELEASE_BRANCH}"

echo -e "${CYAN}📦 Release assets location:${NC}"
echo -e "   $(pwd)/release-temp/${PLUGIN_NAME}-${VERSION}.zip"

echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "   1. Create GitHub Release manually at:"
echo -e "      https://github.com/$(git config remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^.]*\).*/\1/')/releases/new"
echo -e "   2. Use tag: ${GREEN}${VERSION}${NC}"
echo -e "   3. Upload: ${GREEN}release-temp/${PLUGIN_NAME}-${VERSION}.zip${NC}"
echo -e "   4. Add release notes from CHANGELOG.md"

echo ""
echo -e "${GREEN}🎯 Users can now:${NC}"
echo -e "   • Download from release branch: individual files"
echo -e "   • Download from GitHub release: ${PLUGIN_NAME}-${VERSION}.zip"
echo -e "   • Install by extracting zip to .obsidian/plugins/${PLUGIN_NAME}/"

echo ""
echo -e "${BLUE}Release complete! 🚀${NC}"
