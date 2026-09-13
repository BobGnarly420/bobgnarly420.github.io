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
- **First external result:** an autonomous agent (Manus AI) used Mottled's unmodified
  capture path for a preregistered residual-state transplant study on Qwen2.5-0.5B and
  found its compatibility hypothesis *reversed* — unrelated-relation donor states were
  more causally portable than same-relation ones (mid-band difference −0.290, p = 3.05e-5),
  surviving raw-logit, distance-rematching, norm and permutation controls.
  [Write-up](portability.html).

### 2. Computational neuropharmacology — [meth-neurodiv-model](https://github.com/BobGnarly420/meth-neurodiv-model)

Six-layer simulation of methamphetamine perturbations in neurodivergent reward
and arousal networks, from millisecond dopamine terminal kinetics to months of
chronic neuroadaptation. Temperature acts as a bifurcation parameter for
neurotoxicity, not a linear risk multiplier.

- RL layer rebuilt on ANCCR (Jeong et al. 2022) with IRI-scaling per Burke et al. 2026
- Neurotypical / ADHD-C / ADHD-I architectures under identical exposure
- DOI: [10.5281/zenodo.19625787](https://doi.org/10.5281/ZENODO.19625787)

### Side study — [measuring a generated catalogue](catalogue.html)

155 generated tracks reduced to 20 features each, then audited: `n_sections` is a
segmenter cap, `mean_seg_s` reproduces duration to within 0.05 s, and
`novelty_peaks` correlates with duration at r = 0.979. Rate-corrected, the
generator emits novelty at 34.4 ± 2.6 peaks/min regardless of track length.
What survives: a 3.65 ± 0.89 s lead-in on every track, a median repetition score
of 0.973, and brightness correlating with repetition at r = +0.474.

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
| `portability.html` | Write-up of an external preregistered transplant study run on Mottled | Live |
| `catalogue.html` | Audio-feature analysis of 155 generated tracks; hand-built SVG charts | Live |
| `osint.html` | GHOST_CHAIN — client-side OSINT toolchain | Archive |
| `stego.html` | WHISPER_KEY — LSB steganography, AES-256-GCM via Web Crypto | Archive |
| `network.html` | NET_INTERCEPT — HTTP header and timing inspector | Archive |
| `404.html` | Custom not-found page; GitHub Pages serves it for any unmatched path | Live |
| `privacy.html` | What the site stores and what it sends elsewhere | Live |
| `terms.html` | Licensing, no-warranty position, authorised-use condition on the tools | Live |
| `thanks.html` | Post-submit page for the contact form | Live |
| `assets/` | Favicon set, Open Graph card, shared page CSS, consent script | Live |
| `projects/bundle-analyzer/` | Zero-dependency JS bundle size CLI | Archive |
| `projects/lighthouse-enforcer/` | Core Web Vitals budget enforcement for CI | Archive |

The browser tools are fully client-side: no backend, nothing leaves the tab.
"Archive" means working and still hosted, but no longer the direction of the
work — see [TESTING.md](TESTING.md) for their manual test procedures.

The research code lives in its own repositories, linked above.

---

## Analytics and consent

The site currently counts nothing. [`assets/consent.js`](assets/consent.js)
holds the whole mechanism and one switch:

```js
var ENDPOINT = '';   // e.g. 'https://YOURCODE.goatcounter.com/count'
```

While it is empty no analytics script is fetched and no banner is shown —
there would be nothing to consent to. Set it to a
[GoatCounter](https://www.goatcounter.com/) count URL and three things turn on
together: the consent banner, the beacon (loaded only after a visitor allows
it), and the live allow/decline control on the privacy page. Declining is
remembered and never re-asked.

The only thing the site writes to a browser is that answer, under the
`localStorage` key `bg420:analytics-consent`. There are no cookies.

### Contact

The contact form on the home page has no backend. It validates client-side and
composes a prefilled GitHub issue, which the sender submits themselves; with
JavaScript off the plain form GET lands on the same prefilled form. To use an
email address instead, point the form's `action` at a `mailto:` and drop the
submit handler.

---

## Regenerating the brand assets

`assets/icon-*.png`, `assets/apple-touch-icon.png`, `assets/favicon.ico` and
`assets/og-image.png` are generated from the Incision tokens rather than drawn
by hand, so a palette change is one edit and a re-run:

```bash
pip install Pillow
python3 assets/fetch_fonts.py    # DM Sans + JetBrains Mono -> assets/.fonts (gitignored)
python3 assets/generate.py       # rewrites the PNGs and the .ico
```

[`assets/favicon.svg`](assets/favicon.svg) is maintained by hand and is the
authoritative mark; `generate.py` mirrors its geometry. The output is committed,
so this only needs running when the accent colour changes.

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
