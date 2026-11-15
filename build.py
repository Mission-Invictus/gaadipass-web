"""Builds the GaadiPass static site.

Each page body lives in src/<name>.html; this script wraps it in the shared
frame (head, nav, footer) and writes <name>.html at the repo root.
Placeholders in bodies: {{EMAIL}} {{PHONE}} {{PHONE_TEL}} {{WA}} {{UDYAM}} {{UPDATED}}
Run: python build.py
"""
from pathlib import Path

ROOT = Path(__file__).parent
VALUES = {
    "EMAIL": "founder@missioninvictus.com",
    "PHONE": "+91 97955 58442",
    "PHONE_TEL": "+919795558442",
    "WA": "919795558442",
    "UDYAM": "UDYAM-KR-03-0789449",
    "UPDATED": "15 November 2026",
}

# name: (title, description, extra css files, scripts html, extra head)
PAGES = {
    "index": ("GaadiPass — Aapki gaadi ka digital passport",
              "A smart windshield sticker: anyone can reach you when your car needs attention, without seeing your phone number. Works even without a smartphone. ₹399 for 2.",
              ["css/home.css"], '<script src="/js/home.js" defer></script>', ""),
    "order": ("Order — GaadiPass", "Order GaadiPass stickers and pay by UPI.",
              ["css/order.css"],
              '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" defer></script><script src="/order.js" defer></script>', ""),
    "terms": ("Terms & Conditions — GaadiPass", "GaadiPass terms and conditions.", ["css/pages.css"], "", ""),
    "privacy": ("Privacy Policy — GaadiPass", "How GaadiPass handles your data.", ["css/pages.css"], "", ""),
    "refund": ("Refund & Cancellation — GaadiPass", "GaadiPass refund and cancellation policy.", ["css/pages.css"], "", ""),
    "shipping": ("Shipping Policy — GaadiPass", "GaadiPass delivery times and charges.", ["css/pages.css"], "", ""),
    "contact": ("Contact Us — GaadiPass", "Contact Mission Invictus about GaadiPass.", ["css/pages.css"], "", ""),
    "admin": ("Orders admin — GaadiPass", "Admin.", ["css/pages.css", "css/admin.css"], '<script src="/admin.js" defer></script>',
              '<meta name="robots" content="noindex,nofollow">'),
}

NAV = """<header class="wrap site-nav">
  <a class="brand" href="/" aria-label="GaadiPass home">GAADI<b>PASS</b></a>
  <nav class="links" aria-label="Main">
    <a class="opt" href="/#how">How it works</a>
    <a class="opt" href="/#price">Price</a>
    <a href="/contact.html">Contact</a>
  </nav>
</header>"""

ADMIN_NAV = """<header class="wrap site-nav">
  <a class="brand" href="/" aria-label="GaadiPass home">GAADI<b>PASS</b></a>
  <nav class="links" aria-label="Main"><a href="/">View site</a></nav>
</header>"""

FOOT = """<footer class="site-foot">
  <div class="hazard" aria-hidden="true"></div>
  <div class="wrap foot-in">
    <nav aria-label="Policies">
      <a href="/">Home</a><a href="/order.html">Order</a><a href="/terms.html">Terms</a><a href="/privacy.html">Privacy</a>
      <a href="/refund.html">Refund &amp; Cancellation</a><a href="/shipping.html">Shipping</a><a href="/contact.html">Contact</a>
    </nav>
    <p>© 2026 Mission Invictus · Bengaluru, Karnataka, India · Udyam Reg. No. {{UDYAM}}</p>
    <p><a href="mailto:{{EMAIL}}">{{EMAIL}}</a> · <a href="https://wa.me/{{WA}}">WhatsApp us</a> · <a href="tel:{{PHONE_TEL}}">Call us</a></p>
  </div>
</footer>"""


def fill(text):
    for k, v in VALUES.items():
        text = text.replace("{{" + k + "}}", v)
    return text


def build(name, cfg):
    title, desc, css, scripts, head = cfg
    src = ROOT / "src" / f"{name}.html"
    if not src.exists():
        return None
    links = "\n".join(f'<link rel="stylesheet" href="/{c}">' for c in ["css/base.css", *css] if (ROOT / c).exists())
    if name == "index" and not (ROOT / "js" / "home.js").exists():
        scripts = ""
    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#24272a">
<link rel="preload" href="/fonts/stencil-display.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/barlow-400.woff2" as="font" type="font/woff2" crossorigin>
{links}
{head}
</head>
<body class="page-{name}">
{ADMIN_NAV if name == "admin" else NAV}
<main id="main">
{src.read_text(encoding="utf-8")}
</main>
{FOOT}
{scripts}
</body>
</html>
"""
    (ROOT / f"{name}.html").write_text(fill(html), encoding="utf-8")
    return name


built = [n for n, c in PAGES.items() if build(n, c)]
print("built:", ", ".join(built))
