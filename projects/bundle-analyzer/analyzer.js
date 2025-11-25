#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * Bundle Analyzer
 * Analyzes JavaScript bundles and provides size metrics
 */

export class BundleAnalyzer {
  constructor(options = {}) {
    this.budget = options.budget || null;
    this.threshold = options.threshold || 50; // KB
    this.results = null;
  }

  /**
   * Analyze a bundle file
   * @param {string} filePath - Path to bundle file
   * @returns {Object} Analysis results
   */
  analyze(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');

    const sizeBytes = stats.size;
    const sizeKB = (sizeBytes / 1024).toFixed(2);

    // Analyze content
    const lines = content.split('\n').length;
    const imports = this.extractImports(content);
    const functions = this.countFunctions(content);
    const comments = this.analyzeComments(content);

    // Calculate metrics
    const codeWithoutComments = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    const effectiveSize = Buffer.byteLength(codeWithoutComments, 'utf-8');
    const effectiveSizeKB = (effectiveSize / 1024).toFixed(2);
    const commentRatio = ((1 - effectiveSize / sizeBytes) * 100).toFixed(1);

    // Identify large patterns
    const largeFunctions = this.findLargeFunctions(content);
    const duplicates = this.findDuplicates(content);

    this.results = {
      file: path.basename(filePath),
      path: filePath,
      size: {
        bytes: sizeBytes,
        kb: parseFloat(sizeKB),
        effective_kb: parseFloat(effectiveSizeKB),
        comment_overhead: parseFloat(commentRatio)
      },
      structure: {
        lines,
        imports: imports.length,
        functions,
        comments
      },
      analysis: {
        large_functions: largeFunctions,
        duplicate_patterns: duplicates.length,
        import_list: imports
      },
      budget: this.budget ? {
        limit_kb: this.budget,
        actual_kb: parseFloat(sizeKB),
        over_budget: parseFloat(sizeKB) > this.budget,
        diff_kb: (parseFloat(sizeKB) - this.budget).toFixed(2)
      } : null,
      recommendations: this.generateRecommendations()
    };

    return this.results;
  }

  /**
   * Extract import statements
   */
  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({ type: 'import', module: match[1] });
    }
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push({ type: 'require', module: match[1] });
    }

    return imports;
  }

  /**
   * Count function declarations
   */
  countFunctions(content) {
    const functionRegex = /function\s+\w+|const\s+\w+\s*=\s*(?:\([^)]*\)|[^=]+)\s*=>|class\s+\w+/g;
    const matches = content.match(functionRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Analyze comments
   */
  analyzeComments(content) {
    const blockComments = content.match(/\/\*[\s\S]*?\*\//g) || [];
    const lineComments = content.match(/\/\/.*/g) || [];
    return {
      block: blockComments.length,
      line: lineComments.length,
      total: blockComments.length + lineComments.length
    };
  }

  /**
   * Find large functions (> 50 lines)
   */
  findLargeFunctions(content) {
    const functions = [];
    const lines = content.split('\n');
    let inFunction = false;
    let functionStart = 0;
    let functionName = '';
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect function start
      if (!inFunction && /function\s+(\w+)|const\s+(\w+)\s*=|class\s+(\w+)/.test(line)) {
        inFunction = true;
        functionStart = i;
        const match = line.match(/function\s+(\w+)|const\s+(\w+)\s*=|class\s+(\w+)/);
        functionName = match[1] || match[2] || match[3] || 'anonymous';
        braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        continue;
      }

      if (inFunction) {
        braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

        if (braceCount === 0) {
          const functionLength = i - functionStart + 1;
          if (functionLength > 50) {
            functions.push({
              name: functionName,
              lines: functionLength,
              start_line: functionStart + 1
            });
          }
          inFunction = false;
        }
      }
    }

    return functions;
  }

  /**
   * Find duplicate code patterns
   */
  findDuplicates(content) {
    const lines = content.split('\n').filter(l => l.trim().length > 20);
    const seen = new Map();
    const duplicates = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (seen.has(trimmed)) {
        seen.set(trimmed, seen.get(trimmed) + 1);
      } else {
        seen.set(trimmed, 1);
      }
    }

    for (const [line, count] of seen.entries()) {
      if (count > 2) {
        duplicates.push({ line: line.substring(0, 60), count });
      }
    }

    return duplicates;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (!this.results) return recommendations;

    const { size, structure, analysis } = this.results;

    // Size recommendations
    if (size.kb > 100) {
      recommendations.push({
        priority: 'high',
        category: 'size',
        message: `Bundle is ${size.kb}KB. Consider code splitting or tree shaking.`,
        impact: 'high'
      });
    }

    // Comment overhead
    if (size.comment_overhead > 10) {
      recommendations.push({
        priority: 'medium',
        category: 'compression',
        message: `${size.comment_overhead}% of bundle is comments. Strip in production.`,
        impact: 'medium'
      });
    }

    // Large functions
    if (analysis.large_functions.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'maintainability',
        message: `Found ${analysis.large_functions.length} functions over 50 lines. Consider refactoring.`,
        impact: 'low',
        details: analysis.large_functions.map(f => `${f.name} (${f.lines} lines)`)
      });
    }

    // Duplicate code
    if (analysis.duplicate_patterns > 5) {
      recommendations.push({
        priority: 'medium',
        category: 'duplication',
        message: `Found ${analysis.duplicate_patterns} duplicate code patterns. Extract to functions.`,
        impact: 'medium'
      });
    }

    // Import analysis
    const externalImports = analysis.import_list.filter(i => !i.module.startsWith('.'));
    if (externalImports.length > 10) {
      recommendations.push({
        priority: 'high',
        category: 'dependencies',
        message: `${externalImports.length} external dependencies. Review if all are needed.`,
        impact: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Generate JSON report
   */
  toJSON() {
    return JSON.stringify(this.results, null, 2);
  }

  /**
   * Generate human-readable report
   */
  toText() {
    if (!this.results) return '';

    const { file, size, structure, analysis, budget, recommendations } = this.results;

    let report = `
╔═══════════════════════════════════════════════════════════════
║ Bundle Analysis: ${file}
╚═══════════════════════════════════════════════════════════════

📦 SIZE METRICS
  Total Size:      ${size.kb} KB (${size.bytes.toLocaleString()} bytes)
  Effective Size:  ${size.effective_kb} KB (without comments)
  Comment Overhead: ${size.comment_overhead}%

📊 STRUCTURE
  Lines of Code:   ${structure.lines.toLocaleString()}
  Functions:       ${structure.functions}
  Imports:         ${structure.imports}
  Comments:        ${structure.comments.total} (${structure.comments.block} block, ${structure.comments.line} line)

🔍 ANALYSIS
  Large Functions: ${analysis.large_functions.length}
  Duplicate Patterns: ${analysis.duplicate_patterns}
  External Imports: ${analysis.import_list.filter(i => !i.module.startsWith('.')).length}
`;

    if (budget) {
      const status = budget.over_budget ? '❌ OVER BUDGET' : '✅ WITHIN BUDGET';
      report += `
💰 BUDGET CHECK: ${status}
  Budget Limit:    ${budget.limit_kb} KB
  Actual Size:     ${budget.actual_kb} KB
  Difference:      ${budget.over_budget ? '+' : ''}${budget.diff_kb} KB
`;
    }

    if (recommendations.length > 0) {
      report += `\n🎯 RECOMMENDATIONS\n`;
      recommendations.forEach((rec, i) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        report += `  ${priority} [${rec.category.toUpperCase()}] ${rec.message}\n`;
        if (rec.details) {
          rec.details.forEach(detail => {
            report += `     • ${detail}\n`;
          });
        }
      });
    }

    report += `\n${'═'.repeat(65)}\n`;

    return report;
  }

  /**
   * Check if bundle passes budget
   */
  passesBudget() {
    if (!this.budget || !this.results) return true;
    return !this.results.budget.over_budget;
  }
}
