#!/usr/bin/env node

/**
 * Linian Codebase Analysis Tool
 * Analyzes the current codebase to identify refactoring opportunities
 */

const fs = require("fs");
const path = require("path");

class CodebaseAnalyzer {
  constructor() {
    this.analysis = {
      files: [],
      complexity: {},
      dependencies: new Set(),
      issues: [],
      suggestions: [],
      metrics: {},
    };
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    // Skip empty files
    if (content.trim().length === 0) {
      return {
        complexity: {
          lines: 0,
          functions: 0,
          classes: 0,
          imports: 0,
          exports: 0,
          todos: 0,
          console: 0,
          anyTypes: 0,
        },
        issues: ["File is empty"],
      };
    }

    // Basic complexity metrics
    const complexity = {
      lines: lines.length,
      functions: (content.match(/function|=>/g) || []).length,
      classes: (content.match(/class\s+\w+/g) || []).length,
      imports: (content.match(/import.*from/g) || []).length,
      exports: (content.match(/export/g) || []).length,
      todos: (content.match(/TODO|FIXME|XXX/g) || []).length,
      console: (content.match(/console\./g) || []).length,
      anyTypes: (content.match(/:\s*any/g) || []).length,
    };

    // Extract dependencies
    const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g);
    if (importMatches) {
      importMatches.forEach((imp) => {
        const dep = imp.match(/from\s+['"]([^'"]+)['"]/)[1];
        this.analysis.dependencies.add(dep);
      });
    }

    // Identify potential issues
    const issues = [];
    if (complexity.anyTypes > 0) {
      issues.push(
        `${complexity.anyTypes} 'any' types found - consider stronger typing`
      );
    }
    if (complexity.console > 0) {
      issues.push(
        `${complexity.console} console statements found - consider proper logging`
      );
    }
    if (complexity.todos > 0) {
      issues.push(`${complexity.todos} TODO/FIXME comments found`);
    }
    if (complexity.lines > 300) {
      issues.push(`File is ${complexity.lines} lines - consider splitting`);
    }

    return { complexity, issues };
  }

  analyzeDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && file !== "node_modules" && file !== ".git") {
        this.analyzeDirectory(filePath);
      } else if (file.endsWith(".ts") || file.endsWith(".js")) {
        this.analysis.files.push(filePath);
        const result = this.analyzeFile(filePath);
        this.analysis.complexity[filePath] = result.complexity;
        this.analysis.issues.push(
          ...result.issues.map((issue) => `${filePath}: ${issue}`)
        );
      }
    });
  }

  generateReport() {
    console.log("🔍 LINIAN CODEBASE ANALYSIS REPORT");
    console.log("=====================================\n");

    // File overview
    console.log("📁 FILES ANALYZED:");
    this.analysis.files.forEach((file) => {
      const rel = path.relative(process.cwd(), file);
      const complexity = this.analysis.complexity[file];
      if (complexity) {
        console.log(
          `  ${rel} (${complexity.lines} lines, ${complexity.functions} functions)`
        );
      } else {
        console.log(`  ${rel} (not analyzed)`);
      }
    });

    // Dependencies
    console.log("\n📦 DEPENDENCIES:");
    Array.from(this.analysis.dependencies)
      .sort()
      .forEach((dep) => {
        console.log(`  ${dep}`);
      });

    // Complexity metrics
    console.log("\n📊 COMPLEXITY METRICS:");
    let totalLines = 0;
    let totalFunctions = 0;
    let totalAnyTypes = 0;

    Object.values(this.analysis.complexity).forEach((c) => {
      totalLines += c.lines;
      totalFunctions += c.functions;
      totalAnyTypes += c.anyTypes;
    });

    console.log(`  Total lines: ${totalLines}`);
    console.log(`  Total functions: ${totalFunctions}`);
    console.log(`  'any' types: ${totalAnyTypes}`);
    console.log(
      `  Average file size: ${Math.round(
        totalLines / this.analysis.files.length
      )} lines`
    );

    // Issues
    console.log("\n⚠️  POTENTIAL ISSUES:");
    if (this.analysis.issues.length === 0) {
      console.log("  No major issues detected! 🎉");
    } else {
      this.analysis.issues.forEach((issue) => {
        console.log(`  ${issue}`);
      });
    }

    // Refactoring suggestions
    console.log("\n🔄 REFACTORING SUGGESTIONS:");
    const suggestions = [
      "Consider implementing dependency injection for better testability",
      "Extract interface definitions to separate files",
      "Implement proper error boundaries and error handling",
      "Add comprehensive TypeScript types to replace any types",
      "Consider using a state management pattern (Observer/MobX/Zustand)",
      "Split large files into smaller, focused modules",
      "Implement proper logging instead of console statements",
      "Add unit tests for core functionality",
      "Consider using composition over inheritance patterns",
      "Implement proper cleanup patterns for memory management",
    ];

    suggestions.forEach((suggestion, i) => {
      console.log(`  ${i + 1}. ${suggestion}`);
    });

    console.log(
      "\n✅ Analysis complete! Use this report to guide refactoring efforts."
    );
  }

  run() {
    console.log("🔍 Analyzing Linian codebase...\n");

    // Analyze source files
    if (fs.existsSync("./src")) {
      this.analyzeDirectory("./src");
    }

    // Analyze main files
    const mainFiles = ["main.ts", "esbuild.config.mjs", "version-bump.mjs"];
    mainFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        this.analysis.files.push(file);
        if (file.endsWith(".ts") || file.endsWith(".js")) {
          const result = this.analyzeFile(file);
          this.analysis.complexity[file] = result.complexity;
          this.analysis.issues.push(
            ...result.issues.map((issue) => `${file}: ${issue}`)
          );
        }
      }
    });

    this.generateReport();
  }
}

// Run the analysis
const analyzer = new CodebaseAnalyzer();
analyzer.run();
