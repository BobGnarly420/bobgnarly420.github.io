"""Generate the site's favicon set and Open Graph card from the Incision tokens.

The palette lives in one place (below, mirroring index.html and
mottled/design_tokens.py) rather than being baked into hand-drawn files, so a
colour change is a one-line edit plus a re-run. Regenerate only when the accent
changes; the output is committed.

    pip install Pillow
    python3 assets/fetch_fonts.py     # DM Sans + JetBrains Mono TTFs -> assets/.fonts
    python3 assets/generate.py        # from the repo root

assets/favicon.svg is maintained by hand and is the authoritative mark; the
icon() geometry here mirrors it.
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, ".fonts")
OUT = HERE

BASE        = (8, 11, 24)
SURFACE_0   = (12, 16, 32)
BORDER      = (30, 37, 64)
BORDER_STR  = (40, 48, 80)
FG_1        = (237, 240, 250)
FG_2        = (129, 143, 184)
ACCENT      = (75, 124, 243)
TEAL        = (0, 204, 168)

def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name + ".ttf"), size)

def blend(fg, bg, a):
    return tuple(round(f * a + b * (1 - a)) for f, b in zip(fg, bg))


# ── favicon: the masthead glyph, a precision-blue square in the void ──────
def icon(px, pad_ratio=0.0, bg=BASE):
    """Render the mark at px, supersampled 8x. pad_ratio insets the mark
    (apple-touch-icon needs breathing room inside its rounded mask)."""
    S = px * 8
    img = Image.new("RGB", (S, S), bg)
    d = ImageDraw.Draw(img)

    pad = S * pad_ratio
    inner = S - 2 * pad

    # glow ring: accent at low alpha, the .08 accent-subtle token
    ring = inner * 0.62
    r0 = (S - ring) / 2
    d.rounded_rectangle([r0, r0, r0 + ring, r0 + ring],
                        radius=ring * 0.14, fill=blend(ACCENT, bg, 0.16))
    # the mark itself
    sq = inner * 0.36
    s0 = (S - sq) / 2
    d.rounded_rectangle([s0, s0, s0 + sq, s0 + sq],
                        radius=sq * 0.16, fill=ACCENT)
    return img.resize((px, px), Image.LANCZOS)


# ── Open Graph card ──────────────────────────────────────────────────────
def og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), BASE)
    d = ImageDraw.Draw(img)

    # radial glow over the top edge — the same wash as body::before.
    # Built small and scaled up so it stays a gradient, not a set of rings.
    LW, LH = 120, 63
    glow = Image.new("RGB", (LW, LH), BASE)
    gp = glow.load()
    for gy in range(LH):
        for gx in range(LW):
            dx = (gx - LW / 2) / (LW * 0.42)
            dy = (gy + LH * 0.10) / (LH * 0.58)
            r = (dx * dx + dy * dy) ** 0.5
            gp[gx, gy] = blend(ACCENT, BASE, 0.11 * max(0.0, 1 - r) ** 1.7)
    img = glow.resize((W, H), Image.BICUBIC)
    d = ImageDraw.Draw(img)

    # faint grid — the manifold, not decoration; fades out down the card.
    # Sample the glow from a pristine copy: reading back from img would
    # re-blend accent onto pixels an earlier segment already tinted.
    bg = img.copy()
    for x in range(0, W + 1, 72):
        for y0 in range(0, H, 6):
            a = 0.16 * max(0.0, 1 - y0 / 430)
            if a > 0.004:
                d.line([x, y0, x, y0 + 6],
                       fill=blend(ACCENT, bg.getpixel((min(x, W - 1), y0)), a))
    for y in range(0, H + 1, 72):
        a = 0.16 * max(0.0, 1 - y / 430)
        if a > 0.004:
            d.line([0, y, W, y],
                   fill=blend(ACCENT, bg.getpixel((W // 2, min(y, H - 1))), a))

    d.rectangle([0, 0, W - 1, H - 1], outline=BORDER)

    PAD = 72

    # masthead
    d.rounded_rectangle([PAD, 60, PAD + 13, 73], radius=3, fill=ACCENT)
    d.text((PAD + 26, 54), "Evelyn Campbell", font=font("dmsans700", 21), fill=FG_1)
    dom = font("jbmono400", 17)
    url = "enactedvolition.github.io"
    d.text((W - PAD - d.textlength(url, font=dom), 56), url, font=dom, fill=FG_2)

    # eyebrow
    eb = font("jbmono500", 15)
    label = "LATENT DYNAMICS — ARTIFICIAL AND BIOLOGICAL"
    d.text((PAD, 146), label, font=eb, fill=ACCENT)
    x = PAD + d.textlength(label, font=eb) + 18
    for i in range(0, 240, 4):
        a = 1 - i / 240
        d.line([x + i, 154, x + i + 4, 154],
               fill=blend(BORDER_STR, BASE, a * 2.2))

    # headline — accent carries the clause the site is named for
    h = font("dmsans700", 62)
    lines = [[("Instruments for systems", FG_1)],
             [("that ", FG_1), ("will not hold still", ACCENT), (".", FG_1)]]
    y = 200
    for line in lines:
        x = PAD
        for text, colour in line:
            d.text((x, y), text, font=h, fill=colour)
            x += d.textlength(text, font=h)
        y += 76

    # lede
    sub = font("dmsans400", 23)
    for i, line in enumerate([
            "Measurement tools for high-dimensional processes that are",
            "usually described rather than observed."]):
        d.text((PAD, 382 + i * 34), line, font=sub, fill=FG_2)

    # footer strip — three threads and the domain
    d.line([PAD, 500, W - PAD, 500], fill=BORDER)
    m = font("jbmono400", 16)
    x = PAD
    for colour, text in ((ACCENT, "Mechanistic interpretability"),
                         (TEAL, "Computational neuropharmacology"),
                         (FG_2, "Agent-native protocols")):
        d.ellipse([x, 538, x + 8, 546], fill=colour)
        d.text((x + 18, 531), text, font=m, fill=FG_2)
        x += 18 + d.textlength(text, font=m) + 40
    return img


if __name__ == "__main__":
    icon(180, pad_ratio=0.10, bg=SURFACE_0).save(f"{OUT}/apple-touch-icon.png")
    icon(512).save(f"{OUT}/icon-512.png")
    icon(192).save(f"{OUT}/icon-192.png")
    icon(64).save(f"{OUT}/favicon.ico",
                  sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    og().save(f"{OUT}/og-image.png", optimize=True)
    print("assets written")
