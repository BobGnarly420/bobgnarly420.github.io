import fs from 'fs';

/**
 * Lighthouse Budget Enforcer
 * Validates Lighthouse audit reports against performance budgets
 */

export class LighthouseEnforcer {
  constructor(budgetConfig) {
    this.budget = budgetConfig;
    this.results = null;
  }

  /**
   * Enforce budget against a Lighthouse report
   * @param {string} reportPath - Path to Lighthouse JSON report
   * @returns {Object} Enforcement results
   */
  enforce(reportPath) {
    if (!fs.existsSync(reportPath)) {
      throw new Error(`Report not found: ${reportPath}`);
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

    // Extract metrics from Lighthouse report
    const metrics = this.extractMetrics(report);

    // Check against budgets
    const violations = this.checkBudgets(metrics);

    // Generate summary
    this.results = {
      url: report.finalUrl || report.requestedUrl,
      timestamp: report.fetchTime,
      metrics,
      budget: this.budget,
      violations,
      passed: violations.length === 0,
      score: this.calculateScore(metrics)
    };

    return this.results;
  }

  /**
   * Extract relevant metrics from Lighthouse report
   */
  extractMetrics(report) {
    const audits = report.audits || {};
    const categories = report.categories || {};

    return {
      // Performance score
      performance_score: categories.performance?.score * 100 || 0,

      // Core Web Vitals
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      fid: audits['max-potential-fid']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,

      // Loading metrics
      fcp: audits['first-contentful-paint']?.numericValue || 0,
      tti: audits['interactive']?.numericValue || 0,
      tbt: audits['total-blocking-time']?.numericValue || 0,
      si: audits['speed-index']?.numericValue || 0,

      // Resource metrics
      total_byte_weight: audits['total-byte-weight']?.numericValue || 0,
      dom_size: audits['dom-size']?.numericValue || 0,

      // Accessibility
      accessibility_score: categories.accessibility?.score * 100 || 0,

      // Best Practices
      best_practices_score: categories['best-practices']?.score * 100 || 0,

      // SEO
      seo_score: categories.seo?.score * 100 || 0
    };
  }

  /**
   * Check metrics against budget thresholds
   */
  checkBudgets(metrics) {
    const violations = [];

    for (const [key, threshold] of Object.entries(this.budget)) {
      const actual = metrics[key];

      if (actual === undefined) {
        continue;
      }

      let violated = false;
      let comparison = '';

      // Scores should be >= threshold
      if (key.endsWith('_score')) {
        if (actual < threshold) {
          violated = true;
          comparison = `${actual.toFixed(1)} < ${threshold}`;
        }
      }
      // Times/sizes should be <= threshold
      else {
        if (actual > threshold) {
          violated = true;
          comparison = `${Math.round(actual)} > ${threshold}`;
        }
      }

      if (violated) {
        violations.push({
          metric: key,
          actual: key.endsWith('_score') ? actual.toFixed(1) : Math.round(actual),
          threshold,
          comparison,
          severity: this.getSeverity(key, actual, threshold)
        });
      }
    }

    return violations;
  }

  /**
   * Determine violation severity
   */
  getSeverity(metric, actual, threshold) {
    // Score violations
    if (metric.endsWith('_score')) {
      const diff = threshold - actual;
      if (diff > 20) return 'critical';
      if (diff > 10) return 'high';
      return 'medium';
    }

    // Time/size violations
    const ratio = actual / threshold;
    if (ratio > 2) return 'critical';
    if (ratio > 1.5) return 'high';
    return 'medium';
  }

  /**
   * Calculate overall passing score
   */
  calculateScore(metrics) {
    const weights = {
      performance_score: 0.3,
      lcp: 0.2,
      fid: 0.1,
      cls: 0.1,
      tbt: 0.1,
      accessibility_score: 0.1,
      best_practices_score: 0.05,
      seo_score: 0.05
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [metric, weight] of Object.entries(weights)) {
      if (metrics[metric] !== undefined) {
        // Normalize time-based metrics (lower is better)
        let normalizedValue;
        if (metric.endsWith('_score')) {
          normalizedValue = metrics[metric];
        } else if (metric === 'lcp') {
          normalizedValue = Math.max(0, 100 - (metrics[metric] / 25));
        } else if (metric === 'fid') {
          normalizedValue = Math.max(0, 100 - (metrics[metric] / 1));
        } else if (metric === 'cls') {
          normalizedValue = Math.max(0, 100 - (metrics[metric] * 1000));
        } else if (metric === 'tbt') {
          normalizedValue = Math.max(0, 100 - (metrics[metric] / 2));
        } else {
          normalizedValue = 50; // neutral
        }

        weightedSum += normalizedValue * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  /**
   * Generate text report
   */
  toText() {
    if (!this.results) return '';

    const { url, metrics, violations, passed, score } = this.results;

    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const statusIcon = passed ? '✅' : '❌';

    let report = `
╔═══════════════════════════════════════════════════════════════
║ Lighthouse Budget Enforcement
╚═══════════════════════════════════════════════════════════════

🌐 URL: ${url}
📊 Overall Score: ${score}/100
${statusIcon} Status: ${status}

📈 CORE WEB VITALS
  LCP (Largest Contentful Paint):  ${(metrics.lcp / 1000).toFixed(2)}s
  FID (First Input Delay):          ${Math.round(metrics.fid)}ms
  CLS (Cumulative Layout Shift):    ${metrics.cls.toFixed(3)}

⚡ PERFORMANCE METRICS
  Performance Score:    ${metrics.performance_score.toFixed(1)}/100
  FCP:                  ${(metrics.fcp / 1000).toFixed(2)}s
  TTI:                  ${(metrics.tti / 1000).toFixed(2)}s
  TBT:                  ${Math.round(metrics.tbt)}ms
  Speed Index:          ${(metrics.si / 1000).toFixed(2)}s

📦 RESOURCES
  Total Byte Weight:    ${(metrics.total_byte_weight / 1024).toFixed(1)} KB
  DOM Size:             ${metrics.dom_size} elements

🎯 OTHER SCORES
  Accessibility:        ${metrics.accessibility_score.toFixed(1)}/100
  Best Practices:       ${metrics.best_practices_score.toFixed(1)}/100
  SEO:                  ${metrics.seo_score.toFixed(1)}/100
`;

    if (violations.length > 0) {
      report += `\n❌ BUDGET VIOLATIONS (${violations.length})\n`;
      violations.forEach(v => {
        const icon = v.severity === 'critical' ? '🔴' : v.severity === 'high' ? '🟠' : '🟡';
        const label = v.metric.replace(/_/g, ' ').toUpperCase();
        report += `  ${icon} ${label}: ${v.comparison}\n`;
      });
    } else {
      report += `\n✅ All metrics within budget\n`;
    }

    report += `\n${'═'.repeat(65)}\n`;

    return report;
  }

  /**
   * Generate JSON report
   */
  toJSON() {
    return JSON.stringify(this.results, null, 2);
  }

  /**
   * Check if all budgets passed
   */
  passed() {
    return this.results ? this.results.passed : false;
  }
}
