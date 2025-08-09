#!/bin/bash

# Dual Deployment Script for Linian Comparison
# Deploys both original and refactored versions side-by-side

set -e

echo "🚀 Building and deploying BOTH versions for comparison..."

OBSIDIAN_DIR="$HOME/Documents/LIFE/.obsidian/plugins"

# Build original version
echo "🔨 Building original Linian..."
npm run build
echo "✅ Original build complete"

# Build refactored version
echo "🔨 Building refactored Linian..."
cd linian-refactored
npm install --silent
npm run build
echo "✅ Refactored build complete"
cd ..

# Deploy original version
echo "📦 Deploying original version..."
mkdir -p "$OBSIDIAN_DIR/linian"
cp main.js "$OBSIDIAN_DIR/linian/"
cp manifest.json "$OBSIDIAN_DIR/linian/"
cp styles.css "$OBSIDIAN_DIR/linian/"
cp versions.json "$OBSIDIAN_DIR/linian/"

# Deploy refactored version
echo "📦 Deploying refactored version..."
mkdir -p "$OBSIDIAN_DIR/linian-refactored"
cp linian-refactored/main.js "$OBSIDIAN_DIR/linian-refactored/"
cp linian-refactored/manifest.json "$OBSIDIAN_DIR/linian-refactored/"
cp linian-refactored/styles.css "$OBSIDIAN_DIR/linian-refactored/"
cp linian-refactored/versions.json "$OBSIDIAN_DIR/linian-refactored/"

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "========================"
echo ""
echo "📍 Plugin Locations:"
echo "  Original: $OBSIDIAN_DIR/linian"
echo "  Refactored: $OBSIDIAN_DIR/linian-refactored"
echo ""
echo "🔧 Next Steps:"
echo "  1. Open Obsidian"
echo "  2. Go to Settings → Community Plugins"
echo "  3. Enable BOTH 'Linian' and 'Linian (Refactored v2)'"
echo "  4. Test both versions side-by-side"
echo "  5. Check browser console for performance comparisons"
echo ""
echo "📊 Performance data will be logged to console and localStorage"
echo "🎯 Both plugins can run simultaneously for direct comparison!"
