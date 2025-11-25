# Lighthouse Budget Enforcer

**Problem → Constraint → Lever → Result**

Lighthouse audits generate reports, but without enforcement they're just numbers. **Constraint:** Must integrate with existing CI/CD without external services. **Lever:** JSON-based budget validation with configurable thresholds. **Result:** Automated performance gates that fail builds on regression, zero dependencies.

---

## Problem Statement

Performance monitoring without enforcement leads to:
- **Silent regression:** Metrics degrade slowly, unnoticed until user complaints
- **Inconsistent standards:** Different teams use different "good enough" thresholds
- **Manual reviews:** Developers must remember to check Lighthouse scores
- **No accountability:** No automatic gate prevents shipping slow experiences

Teams need:
1. Automated budget enforcement in CI/CD
2. Configurable thresholds per metric (LCP, FID, CLS, scores)
3. Clear failure reasons when budgets violated
4. Historical trend tracking (future: compare against baseline)

---

## Architecture

```
┌──────────────────┐
│ Lighthouse CLI   │  (external tool)
│ or CI service    │
└────────┬─────────┘
         │
         ▼  generates
    ┌─────────┐
    │ report  │
    │ .json   │
    └────┬────┘
         │
         │  read()
         ▼
┌──────────────────────┐      ┌─────────────┐
│ LighthouseEnforcer   │◄─────┤ budget.json │
│ • extract metrics    │      │ thresholds  │
│ • compare vs budget  │      └─────────────┘
│ • calculate severity │
│ • generate report    │
└──────────┬───────────┘
           │
           ├──► text report
           ├──► json report
           └──► exit code (0/1)
                     │
                     ▼
              ┌────────────┐
              │ CI/CD      │
              │ pass/fail  │
              └────────────┘
```

### Decision: Post-Audit Validation (Not Runner)

**Why?**
- Lighthouse already has excellent CLI and CI integrations
- Running Lighthouse requires Chrome/Puppeteer (250MB+ dependencies)
- Separating audit from enforcement allows different tooling choices

**Trade-off:**
- Requires two-step process (run Lighthouse, then enforce)
- Could miss real-time issues if Lighthouse not run

**Measured impact:**
- Tool size: 8KB vs 250MB+ (Lighthouse + Chrome)
- Flexibility: Works with any Lighthouse source (CLI, CI service, PageSpeed API)

---

## Key Metrics

Enforcer validates these Lighthouse metrics:

| Category | Metric | Budget Example | Threshold Basis |
|----------|--------|----------------|-----------------|
| **Core Web Vitals** | LCP | 2.5s | Google Core Web Vitals |
| | FID | 100ms | Google Core Web Vitals |
| | CLS | 0.1 | Google Core Web Vitals |
| **Performance** | FCP | 1.5s | Lighthouse scoring |
| | TTI | 3.5s | Lighthouse scoring |
| | TBT | 200ms | Lighthouse scoring |
| | Speed Index | 3.0s | Lighthouse scoring |
| **Scores** | Performance | 90/100 | Target threshold |
| | Accessibility | 90/100 | WCAG compliance |
| | Best Practices | 85/100 | Security/reliability |
| | SEO | 95/100 | Search visibility |
| **Resources** | Total Byte Weight | 500KB | Network cost |
| | DOM Size | 1000 elements | Render performance |

---

## Usage

### Step 1: Generate Lighthouse Report

```bash
# Using Lighthouse CLI
npx lighthouse https://example.com --output json --output-path report.json

# Or in CI (GitHub Actions)
- uses: treosh/lighthouse-ci-action@v9
  with:
    urls: https://example.com
    uploadArtifacts: true
```

### Step 2: Create Budget File

`budget.json`:
```json
{
  "performance_score": 90,
  "lcp": 2500,
  "fid": 100,
  "cls": 0.1,
  "total_byte_weight": 512000
}
```

### Step 3: Enforce Budget

```bash
node cli.js --report report.json --budget budget.json
```

**Output:**
```
╔═══════════════════════════════════════════════════════════════
║ Lighthouse Budget Enforcement
╚═══════════════════════════════════════════════════════════════

🌐 URL: https://example.com
📊 Overall Score: 91/100
✅ Status: PASSED

📈 CORE WEB VITALS
  LCP (Largest Contentful Paint):  1.85s
  FID (First Input Delay):          65ms
  CLS (Cumulative Layout Shift):    0.045

⚡ PERFORMANCE METRICS
  Performance Score:    92.0/100
  FCP:                  1.25s
  TTI:                  3.20s
  TBT:                  180ms
  Speed Index:          2.10s

📦 RESOURCES
  Total Byte Weight:    415.0 KB
  DOM Size:             850 elements

🎯 OTHER SCORES
  Accessibility:        95.0/100
  Best Practices:       88.0/100
  SEO:                  100.0/100

✅ All metrics within budget

═════════════════════════════════════════════════════════════════
```

### CI Integration (Exit on Fail)

```bash
node cli.js --report report.json --budget budget.json --exit-on-fail
```

**Behavior:**
- Exit code 0: All budgets passed
- Exit code 1: One or more budgets violated

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Performance Budget

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://staging.example.com
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Enforce Budget
        run: |
          node projects/lighthouse-enforcer/cli.js \
            --report .lighthouseci/lighthouse-*.json \
            --budget projects/lighthouse-enforcer/demo/budget.json \
            --exit-on-fail
```

### GitLab CI

```yaml
performance_budget:
  stage: test
  image: node:18
  script:
    - npx lighthouse $CI_ENVIRONMENT_URL --output json --output-path report.json
    - node projects/lighthouse-enforcer/cli.js -r report.json -b budget.json --exit-on-fail
  artifacts:
    when: always
    paths:
      - report.json
```

---

## Violation Severity

Violations are categorized by impact:

| Severity | Score Diff | Time/Size Ratio | Action |
|----------|------------|-----------------|--------|
| 🔴 **Critical** | >20 points | >2x budget | Block deployment |
| 🟠 **High** | 10-20 points | 1.5-2x budget | Require review |
| 🟡 **Medium** | <10 points | 1-1.5x budget | Log warning |

Example violations:
```
❌ BUDGET VIOLATIONS (3)
  🔴 PERFORMANCE SCORE: 72.0 < 90
  🟠 LCP: 3800 > 2500
  🟡 TOTAL BYTE WEIGHT: 540000 > 512000
```

---

## Demo

Run the included sample:

```bash
cd projects/lighthouse-enforcer
npm run demo
```

This validates `demo/sample-report.json` (good metrics) against `demo/budget.json`.

**Expected result:** ✅ All budgets passed

---

## Budget Configuration

Budget files are JSON with metric names as keys and thresholds as values.

### Recommended Budgets

**Aggressive (High-performance site):**
```json
{
  "performance_score": 95,
  "lcp": 2000,
  "fid": 50,
  "cls": 0.05,
  "total_byte_weight": 300000
}
```

**Moderate (E-commerce/SaaS):**
```json
{
  "performance_score": 90,
  "lcp": 2500,
  "fid": 100,
  "cls": 0.1,
  "total_byte_weight": 512000
}
```

**Baseline (Content site):**
```json
{
  "performance_score": 80,
  "lcp": 3000,
  "fid": 150,
  "cls": 0.15,
  "total_byte_weight": 1000000
}
```

---

## Future Enhancements

**Planned features:**
1. **Historical tracking:** Compare against baseline from previous run
2. **Trend detection:** Alert if metric degrades over multiple builds
3. **Custom scoring:** Weight metrics differently based on site type
4. **Budget templates:** Pre-built configs for common scenarios

**Not planned:**
- Running Lighthouse itself (use official CLI)
- Analyzing HTML/JS directly (use bundle-analyzer for that)
- Real-time monitoring (use RUM tools)

---

## Dependencies

**Runtime:** None (pure Node.js)
**External:** Requires Lighthouse report (generated separately)
**Node version:** >=14.0.0

---

## License

MIT
