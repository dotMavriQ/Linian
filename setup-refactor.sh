#!/bin/bash

# Linian Refactoring Setup Script
# Creates a safe parallel development environment

set -e

echo "🔄 Setting up Linian Refactoring Environment"
echo "=============================================="

# Create refactored plugin structure
echo "📁 Creating refactored plugin structure..."
mkdir -p linian-refactored/src

# Copy source files for refactoring
echo "📋 Copying files for refactoring..."
cp -r src/* linian-refactored/src/
cp main.ts linian-refactored/
cp package.json linian-refactored/
cp tsconfig.json linian-refactored/
cp esbuild.config.mjs linian-refactored/
cp styles.css linian-refactored/
cp versions.json linian-refactored/

# Create refactored manifest
echo "⚙️  Creating refactored manifest..."
cat > linian-refactored/manifest.json << 'EOF'
{
    "id": "linian-refactored",
    "name": "Linian (Refactored v2)",
    "version": "2.0.0-alpha.1",
    "minAppVersion": "0.15.0",
    "description": "Refactored version of Linear issue integration - TESTING/COMPARISON ONLY",
    "author": "Jonatan Jansson",
    "authorUrl": "https://github.com/dotMavriQ",
    "fundingUrl": "https://liberapay.com/dotMavriQ/",
    "isDesktopOnly": false
}
EOF

# Update package.json for refactored version
echo "📦 Updating package.json for refactored version..."
cd linian-refactored
npm pkg set name="linian-refactored"
npm pkg set version="2.0.0-alpha.1"
npm pkg set description="Refactored Linear issue integration for Obsidian - TESTING VERSION"
cd ..

# Create performance tracking
echo "📊 Creating performance tracking tools..."
cat > linian-refactored/src/performance-tracker.ts << 'EOF'
/**
 * Performance tracking for comparing original vs refactored versions
 */
export class PerformanceTracker {
    private metrics: Map<string, number[]> = new Map();
    
    track(operation: string, startTime: number) {
        const duration = Date.now() - startTime;
        
        if (!this.metrics.has(operation)) {
            this.metrics.set(operation, []);
        }
        
        this.metrics.get(operation)!.push(duration);
        
        // Log to console for debugging
        console.log(`[REFACTORED] ${operation}: ${duration}ms`);
    }
    
    getReport(): Record<string, any> {
        const report: Record<string, any> = {};
        
        for (const [operation, times] of this.metrics.entries()) {
            report[operation] = {
                avg: times.reduce((a, b) => a + b, 0) / times.length,
                min: Math.min(...times),
                max: Math.max(...times),
                count: times.length,
                total: times.reduce((a, b) => a + b, 0)
            };
        }
        
        return report;
    }
    
    exportReport() {
        const report = this.getReport();
        console.log('📊 REFACTORED VERSION PERFORMANCE REPORT:');
        console.table(report);
        
        // Store in localStorage for comparison
        localStorage.setItem('linian-refactored-performance', JSON.stringify(report));
    }
}

// Global instance for tracking
export const performanceTracker = new PerformanceTracker();

// Auto-export report every 30 seconds
setInterval(() => {
    performanceTracker.exportReport();
}, 30000);
EOF

# Create comparison deployment script
echo "🚀 Creating dual deployment script..."
cat > compare-deploy.sh << 'EOF'
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
EOF

chmod +x compare-deploy.sh

# Create refactoring plan
echo "📋 Creating refactoring plan..."
cat > REFACTORING_PLAN.md << 'EOF'
# Linian Refactoring Plan v2

## Current Analysis Results
- **Total lines**: 1,188
- **Files**: 8 TypeScript files
- **Functions**: 39 total
- **Issues**: Console logging, some 'any' types, large main.ts file

## Refactoring Phases

### Phase 1: Code Organization & Architecture
- [ ] Split main.ts (319 lines) into smaller, focused modules
- [ ] Implement proper service/controller pattern
- [ ] Extract interfaces to separate files
- [ ] Remove empty/unused files (api2.ts)

### Phase 2: Type Safety & Error Handling
- [ ] Replace 'any' types with proper TypeScript interfaces
- [ ] Implement comprehensive error boundaries
- [ ] Add proper error handling patterns
- [ ] Improve async/await patterns

### Phase 3: Performance & Memory Management
- [ ] Implement proper widget lifecycle management
- [ ] Add performance tracking and monitoring
- [ ] Optimize API calls and caching
- [ ] Improve DOM manipulation efficiency

### Phase 4: Developer Experience
- [ ] Replace console.log with proper logging
- [ ] Add unit tests for core functionality
- [ ] Implement development/debugging tools
- [ ] Add comprehensive documentation

### Phase 5: Modern Patterns
- [ ] Consider dependency injection
- [ ] Implement observer/event patterns
- [ ] Add state management if needed
- [ ] Consider composition over inheritance

## Testing Strategy
1. Deploy both versions simultaneously
2. Compare performance metrics
3. Test identical functionality
4. Monitor memory usage
5. User experience comparison

## Success Criteria
- [ ] Reduced memory usage
- [ ] Improved performance metrics
- [ ] Better code maintainability
- [ ] Zero functionality regressions
- [ ] Improved developer experience
EOF

echo ""
echo "✅ REFACTORING ENVIRONMENT READY!"
echo "=================================="
echo ""
echo "📁 Structure created:"
echo "  ./linian-refactored/     - Refactored plugin files"
echo "  ./compare-deploy.sh      - Deploy both versions"
echo "  ./REFACTORING_PLAN.md    - Detailed refactoring plan"
echo "  ./analyze-codebase.js    - Code analysis tool"
echo ""
echo "🚀 Next steps:"
echo "  1. Run './compare-deploy.sh' to test current setup"
echo "  2. Start refactoring in ./linian-refactored/"
echo "  3. Use analysis results to guide improvements"
echo "  4. Deploy and compare after each phase"
echo ""
echo "📊 Both versions will track performance for comparison!"
