# bobgnarly420.github.io

Personal research site — **[bobgnarly420.github.io](https://bobgnarly420.github.io)**

Static single-file site, no build step. Styled in **Incision**, the design
language defined in [`mottled/design_tokens.py`](https://github.com/BobGnarly420/mottled/blob/main/design_tokens.py):
dark navy void, one precision-blue accent, 1px borders, near-sharp corners,
monospace for every data value. Colours here mirror those tokens — change them
there first.

---

## Research direction

Measurement tools for high-dimensional processes that are usually described
rather than observed. Two substrates, one problem: a trajectory through a state
space nobody can see directly, and the question of how much of any picture of it
survived the projection.

### 1. Mechanistic interpretability — [Mottled](https://github.com/BobGnarly420/mottled)

Interactive latent trajectory explorer for transformer forward passes. Captures
the residual stream after every block, projects it, estimates the local
manifold, and animates how a prompt moves, turns and settles through the layers.
Not a neuron inspector — the object of study is the dynamics.

- Real SAE features, fetched and then *measured* for fit rather than assumed
- Logit-lens readouts, attention patterns, exact attn/MLP residual decomposition
- Model-agnostic and verified: GPT-2 and Qwen2.5-1.5B-Instruct on one terrain
- Live: [explorer + WebGL viewer](https://bobgnarly420.github.io/mottled/)

### 2. Computational neuropharmacology — [meth-neurodiv-model](https://github.com/BobGnarly420/meth-neurodiv-model)

Six-layer simulation of methamphetamine perturbations in neurodivergent reward
and arousal networks, from millisecond dopamine terminal kinetics to months of
chronic neuroadaptation. Temperature acts as a bifurcation parameter for
neurotoxicity, not a linear risk multiplier.

- RL layer rebuilt on ANCCR (Jeong et al. 2022) with IRI-scaling per Burke et al. 2026
- Neurotypical / ADHD-C / ADHD-I architectures under identical exposure
- DOI: [10.5281/zenodo.19625787](https://doi.org/10.5281/ZENODO.19625787)

### 3. Agent-native trust infrastructure — [EVT-1](https://github.com/BobGnarly420/evt-1)

TLS certificates, but for product claims. Deterministic canonical URNs for
product identity plus Ed25519-signed trust assertions that agents verify
locally — the server stores and serves, it is not a trust root. Ships an MCP
server so the full workflow is available as agent tools.

---

## What lives in this repo

| Path | What it is | Status |
| --- | --- | --- |
| `index.html` | The site itself — static HTML/CSS, no framework | Live |
| `osint.html` | GHOST_CHAIN — client-side OSINT toolchain | Archive |
| `stego.html` | WHISPER_KEY — LSB steganography, AES-256-GCM via Web Crypto | Archive |
| `network.html` | NET_INTERCEPT — HTTP header and timing inspector | Archive |
| `projects/bundle-analyzer/` | Zero-dependency JS bundle size CLI | Archive |
| `projects/lighthouse-enforcer/` | Core Web Vitals budget enforcement for CI | Archive |

The browser tools are fully client-side: no backend, nothing leaves the tab.
"Archive" means working and still hosted, but no longer the direction of the
work — see [TESTING.md](TESTING.md) for their manual test procedures.

The research code lives in its own repositories, linked above.

---

## Running locally

```bash
git clone https://github.com/BobGnarly420/bobgnarly420.github.io.git
cd bobgnarly420.github.io

python3 -m http.server 8000     # then open http://localhost:8000

npm test                        # runs both archived CLI test suites
```

CI ([`.github/workflows/test.yml`](.github/workflows/test.yml)) runs those suites
on every push; [`deploy.yml`](.github/workflows/deploy.yml) publishes the site to
GitHub Pages from `main`.

## License

MIT — see [LICENSE](LICENSE). Individual projects carry their own.
