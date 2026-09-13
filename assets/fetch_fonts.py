"""Fetch the two brand TTFs that generate.py rasterises text with.

Google Fonts serves woff2 to a modern browser and plain TTF to an old one, and
Pillow can only read the TTF — hence the ancient user agent. The files land in
assets/.fonts/ and are not committed: they are Google's to distribute, and the
generated PNGs are what the site actually ships.
"""
import os
import re
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, ".fonts")

# An Android 4 UA is what still gets TrueType rather than woff2.
UA = ("Mozilla/5.0 (Linux; U; Android 4.0.3; en-us; Galaxy Nexus Build/IML74K) "
      "AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30")

FACES = [
    ("dmsans400", "DM+Sans", 400),
    ("dmsans500", "DM+Sans", 500),
    ("dmsans700", "DM+Sans", 700),
    ("jbmono400", "JetBrains+Mono", 400),
    ("jbmono500", "JetBrains+Mono", 500),
]


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req) as r:
        return r.read()


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, family, weight in FACES:
        css = get(f"https://fonts.googleapis.com/css?family={family}:{weight}").decode()
        href = re.search(r"https://[^)]+", css).group(0)
        path = os.path.join(OUT, name + ".ttf")
        with open(path, "wb") as f:
            f.write(get(href))
        print("fetched", name, os.path.getsize(path), "bytes")
