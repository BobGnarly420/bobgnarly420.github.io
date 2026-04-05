# BobGnarly420 Portfolio

Developer portfolio showcasing OSINT tools, security research, cryptography, and performance optimization.

**Live Site:** [bobgnarly420.github.io](https://bobgnarly420.github.io)

## Featured Projects

- **🔍 OSINT Toolchain** - 30+ intelligence gathering tools (domain analysis, social media OSINT, hash analysis)
- **🔐 Steganography** - AES-256-GCM encrypted message hiding in images via LSB encoding
- **📡 Network Analyzer** - Real-time HTTP header and performance monitoring
- **🔬 Bundle Analyzer** - JavaScript bundle size analysis and CI/CD enforcement
- **🎯 Lighthouse Enforcer** - Performance budget validation for Core Web Vitals
- **🤖 Agentic DAO Blueprint** - LangChain + Solidity autonomous governance scaffold

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

### 3. OSINT Toolchain (GHOST_CHAIN)
Comprehensive Open Source Intelligence gathering suite with 30+ tools.

- **Location:** `osint.html`
- **Live Demo:** [Launch Toolchain](https://bobgnarly420.github.io/osint.html)
- **Categories:** Domain/IP intelligence, social media OSINT, email intelligence, hash analysis, network tools, metadata extraction
- **Privacy:** 100% client-side, no backend, no data transmission

### 4. Steganography Tool (WHISPER_KEY)
Image steganography with AES-256-GCM encryption for hiding encrypted messages in PNG images.

- **Location:** `stego.html`
- **Live Demo:** [Launch Tool](https://bobgnarly420.github.io/stego.html)
- **Encryption:** AES-256-GCM via Web Crypto API, PBKDF2 key derivation (100,000 iterations)
- **Method:** LSB (Least Significant Bit) encoding
- **Features:** Encode/decode, password protection, client-side only

### 5. Network Analyzer (NET_INTERCEPT)
Real-time network traffic analyzer for HTTP headers and performance metrics.

- **Location:** `network.html`
- **Live Demo:** [Launch Analyzer](https://bobgnarly420.github.io/network.html)
- **Features:** HTTP header inspection, performance metrics, request logging, resource monitoring
- **APIs:** Fetch API, Performance API

### 6. Agentic Autonomous DAO (AGENT_DAO)
LangChain + Solidity implementation scaffold for autonomous governance, with agent orchestration, simulation/adversarial checks, and on-chain timelocked execution controls.

- **Location:** `dao.html`, `projects/agentic-dao/`
- **Live Demo:** [Launch Blueprint](https://bobgnarly420.github.io/dao.html)
- **Implementation:** Solidity contract + LangChain orchestration agent
- **Focus:** Agent orchestration, quorum logic, treasury safety, rollback protocols

---

## Tech Stack

- **Languages:** JavaScript (ES6+), Node.js, HTML/CSS, React
- **Web APIs:** Web Crypto API (AES-256-GCM), Canvas API, Performance API, Fetch API
- **Tools:** Git, GitHub Actions, Tailwind CSS
- **Focus:** OSINT, security tools, build tools, performance, CI/CD automation

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
