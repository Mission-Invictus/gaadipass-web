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
    "index": ("GaadiPass — Car parking QR sticker | Reach the owner, number hidden",
              "Windshield QR sticker for your car. Anyone who needs it moved scans it and we reach you. Your number stays hidden. ₹399 for 2, Bengaluru delivery.",
              ["css/home.css"], '<script src="/js/home.js" defer></script>', ""),
    "order": ("Order — GaadiPass", "Order 2 GaadiPass car QR stickers for ₹399. Pay by UPI with PhonePe, Google Pay or Paytm. Delivered in Bengaluru.",
              ["css/order.css"],
              '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" defer></script><script src="/order.js" defer></script>', ""),
    "terms": ("Terms & Conditions — GaadiPass", "GaadiPass terms and conditions.", ["css/pages.css"], "", ""),
    "privacy": ("Privacy Policy — GaadiPass", "How GaadiPass handles your data.", ["css/pages.css"], "", ""),
    "refund": ("Refund & Cancellation — GaadiPass", "GaadiPass refund and cancellation policy.", ["css/pages.css"], "", ""),
    "shipping": ("Shipping Policy — GaadiPass", "GaadiPass delivery times and charges.", ["css/pages.css"], "", ""),
    "contact": ("Contact Us — GaadiPass", "Contact Mission Invictus about GaadiPass.", ["css/pages.css"], "", ""),
    "t": ("Reach this car's owner — GaadiPass", "Contact the owner of a car with a GaadiPass sticker.", ["css/scan.css"], "",
          '<meta name="robots" content="noindex">'),
    "admin": ("Orders admin — GaadiPass", "Admin.", ["css/pages.css", "css/admin.css"], '<script src="/vendor/qrcode-generator.min.js" defer></script><script src="/vendor/jspdf.umd.min.js" defer></script><script src="/js/sticker.js" defer></script><script src="/admin.js" defer></script>',
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


SITE = "gaadipass.missioninvictus.com"
# Meta Pixel: paste the Pixel ID from Events Manager here and rebuild. Empty = no pixel loads.
META_PIXEL_ID = ""
# Microsoft Clarity project ID (clarity.microsoft.com). Empty = off.
CLARITY_ID = ""

JSONLD = """<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
 {"@type":"Organization","@id":"https://gaadipass.missioninvictus.com/#org","name":"GaadiPass","url":"https://gaadipass.missioninvictus.com/","logo":"https://gaadipass.missioninvictus.com/assets/icon-512.png","parentOrganization":{"@type":"Organization","name":"Mission Invictus","url":"https://www.missioninvictus.com/"}},
 {"@type":"WebSite","name":"GaadiPass","url":"https://gaadipass.missioninvictus.com/"},
 {"@type":"Product","name":"GaadiPass car QR sticker (pack of 2)","image":"https://gaadipass.missioninvictus.com/assets/sticker/front-sample.png","description":"Windshield QR sticker. Anyone who needs your car moved scans it and GaadiPass reaches you without showing your phone number.","brand":{"@type":"Brand","name":"GaadiPass"},"offers":{"@type":"Offer","price":"399","priceCurrency":"INR","availability":"https://schema.org/InStock","url":"https://gaadipass.missioninvictus.com/order.html","areaServed":"Bengaluru"}}
]}
</script>"""


def clarity_head(name):
    if not CLARITY_ID or name == "admin":
        return ""
    return f"""<script>(function(c,l,a,r,i,t,y){{c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)}})(window,document,"clarity","script","{CLARITY_ID}");</script>"""


def pixel_head(name):
    if not META_PIXEL_ID or name in ("admin", "t"):
        return '<script>window.gpTrack=function(){}</script>'
    return f"""<script>
!function(f,b,e,v,n,t,s){{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','{META_PIXEL_ID}');fbq('track','PageView');
window.gpTrack=function(ev,p){{try{{fbq('track',ev,p||{{}})}}catch(e){{}}}};
</script>
<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id={META_PIXEL_ID}&ev=PageView&noscript=1"></noscript>"""


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
<link rel="canonical" href="https://{SITE}/{'' if name == 'index' else name + '.html'}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GaadiPass">
<meta property="og:locale" content="en_IN">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="https://{SITE}/{'' if name == 'index' else name + '.html'}">
<meta property="og:image" content="https://{SITE}/assets/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
{JSONLD if name == 'index' else ''}
{pixel_head(name)}
{clarity_head(name)}
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
