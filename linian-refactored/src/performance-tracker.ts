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
