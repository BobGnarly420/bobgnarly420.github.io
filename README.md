# BobGnarly420 Portfolio

Developer portfolio showcasing build tools, performance optimization, and web development projects.

**Live Site:** [bobgnarly420.github.io](https://bobgnarly420.github.io)

---

## Projects

### 1. Bundle Analyzer
CLI tool for analyzing JavaScript bundle sizes and enforcing size budgets in CI/CD.

- **Location:** `projects/bundle-analyzer/`
- **Features:** Zero dependencies, detects optimization opportunities, configurable budgets
- **Tests:** `npm test` (all passing)
- **Demo:** `node cli.js --input demo/sample-bundle.js --budget 100`

[View README](projects/bundle-analyzer/README.md)

### 2. Lighthouse Budget Enforcer
Tool for validating Lighthouse audit reports against performance budgets.

- **Location:** `projects/lighthouse-enforcer/`
- **Features:** Core Web Vitals validation, severity categorization, CI/CD integration
- **Tests:** `npm test` (all passing)
- **Demo:** `node cli.js --report demo/sample-report.json --budget demo/budget.json`

[View README](projects/lighthouse-enforcer/README.md)

### 3. Interactive Data Dashboard
Real-time analytics dashboard with multiple visualization types.

- **Location:** `data-viz.html`
- **Live Demo:** [View Dashboard](https://bobgnarly420.github.io/data-viz.html)
- **Tech:** Chart.js, vanilla JavaScript

---

## Tech Stack

- **Languages:** JavaScript (ES6+), Node.js, HTML/CSS
- **Tools:** Git, GitHub Actions, Chart.js
- **Focus:** Build tools, performance, CI/CD automation

---

## Running Locally

```bash
# Clone repository
git clone https://github.com/BobGnarly420/bobgnarly420.github.io.git
cd bobgnarly420.github.io

# Test tools
cd projects/bundle-analyzer && npm test
cd ../lighthouse-enforcer && npm test

# Run demos
cd projects/bundle-analyzer && npm run demo
cd ../lighthouse-enforcer && npm run demo

# View portfolio
open index.html
```

---

## CI/CD

GitHub Actions runs tests on every push:
- Bundle Analyzer tests
- Lighthouse Enforcer tests
- Demo commands

See [.github/workflows/test.yml](.github/workflows/test.yml)

---

## License

MIT - See individual project LICENSE files

---

## Contact

- GitHub: [@BobGnarly420](https://github.com/BobGnarly420)
- Portfolio: [bobgnarly420.github.io](https://bobgnarly420.github.io)
