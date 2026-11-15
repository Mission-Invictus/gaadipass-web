"""Builds the GaadiPass static pages (index + policies) from one template.
Run: python build.py   (writes *.html next to this file)
"""
from pathlib import Path

ROOT = Path(__file__).parent
UPDATED = "15 November 2026"
EMAIL = "founder@missioninvictus.com"
PHONE = "+91 97955 58442"
PHONE_TEL = "+919795558442"

NAV = ('<nav><a class="brand" href="/">GaadiPass</a><a href="/#how">How it works</a>'
       '<a href="/#price">Price</a><a href="/contact.html">Contact</a></nav>')
FOOT = ('<footer><div><a href="/">Home</a><a href="/terms.html">Terms</a><a href="/privacy.html">Privacy</a>'
        '<a href="/refund.html">Refund &amp; Cancellation</a><a href="/shipping.html">Shipping</a>'
        '<a href="/contact.html">Contact</a></div>'
        f'<p>© 2026 Mission Invictus (proprietor: Ajay Singh) · Bengaluru, Karnataka, India · '
        f'Udyam Reg. No. UDYAM-KR-03-0789449 · <a href="mailto:{EMAIL}">{EMAIL}</a> · <a href="tel:{PHONE_TEL}">{PHONE}</a></p></footer>')


def page(name, title, body, desc="GaadiPass — a car sticker so anyone can reach you without seeing your phone number."):
    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} — GaadiPass</title>
<meta name="description" content="{desc}">
<link rel="stylesheet" href="/style.css">
</head>
<body><main class="wrap">
{NAV}
{body}
{FOOT}
</main></body>
</html>
"""
    (ROOT / name).write_text(html, encoding="utf-8")


page("index.html", "Aapki gaadi ka digital passport", f"""
<span class="tag">GaadiPass · by Mission Invictus</span>
<h1>Gaadi block hai aur owner ka pata nahi?<br><span>GaadiPass fixes that.</span></h1>
<p class="lead">A smart sticker for your car. Anyone can reach you when your car needs attention — <b>your phone number stays private</b>.</p>
<div class="grid">
  <div class="card"><b>🔒 Number stays private</b><small>Calls are connected through a masked number. Nobody sees yours.</small></div>
  <div class="card"><b>📞 Works without a smartphone</b><small>Scan the QR — or dial the number printed on the sticker and enter the tag code.</small></div>
  <div class="card"><b>👨‍👩‍👧 Family backup</b><small>If you don't pick up, we try your family contact next.</small></div>
  <div class="card"><b>🏢 Made for societies</b><small>Basement parking, double parking, blocked gates — sorted in seconds.</small></div>
</div>
<h2 id="how">How it works</h2>
<ol>
  <li>Order GaadiPass and stick it on your windshield.</li>
  <li>Activate it with your mobile number (OTP).</li>
  <li>Someone needs you? They scan the QR or dial the number on the sticker.</li>
  <li>Your phone rings — both numbers stay hidden.</li>
</ol>
<div class="price" id="price">
  <div class="tag">Pre-order · Launch offer</div>
  <div class="amt">₹399</div>
  <div>for <b>2 GaadiPass stickers</b> · inclusive of all taxes</div>
  <ul>
    <li>Waterproof, UV-laminated vinyl stickers with a unique QR + tag code</li>
    <li>Masked calling &amp; alerts to your number — no monthly fee</li>
    <li>Free delivery in Bengaluru · pan-India delivery available</li>
  </ul>
  <a class="btn" href="mailto:{EMAIL}?subject=GaadiPass%20pre-order">Pre-order now</a>
  <p class="muted">Pre-orders open in Bengaluru — the first batch ships in about 2–3 weeks. Payment by UPI or online payment. Full refund if you cancel before dispatch.</p>
</div>
<h2>FAQ</h2>
<p><b>Will people see my phone number?</b> No. Calls go through a masked number; neither side sees the other's number.</p>
<p><b>What if the person has no smartphone?</b> They can call the number printed on the sticker from any phone and enter the tag code.</p>
<p><b>Is there a monthly charge?</b> No.</p>
""", desc="GaadiPass: a smart car sticker. Anyone can reach you when your car needs attention — your number stays private. Works even without a smartphone. ₹399 for 2.")

page("terms.html", "Terms & Conditions", f"""
<h1>Terms &amp; Conditions</h1><p class="muted">Last updated: {UPDATED}</p>
<p>These terms govern your use of gaadipass.missioninvictus.com and the GaadiPass product and service ("GaadiPass"), offered by <b>Mission Invictus</b>, a proprietorship of Ajay Singh, Bengaluru, Karnataka, India (Udyam Reg. No. UDYAM-KR-03-0789449) ("we", "us"). By placing an order or using GaadiPass you agree to these terms.</p>
<h2>1. The product</h2><p>GaadiPass is a vehicle sticker carrying a unique QR code and tag code. When activated, it lets other people contact the vehicle owner through a masked call or alert without either party seeing the other's phone number.</p>
<h2>2. Orders and payment</h2><p>Prices are in Indian Rupees and include applicable taxes. An order is confirmed once payment is received. We may refuse or cancel an order (with a full refund) if the product is unavailable or details are incorrect.</p>
<h2>3. Activation and acceptable use</h2><p>You must activate the sticker with a mobile number you own, verified by OTP. You must not use GaadiPass to harass, spam or threaten anyone. We may block callers or suspend tags that are misused.</p>
<h2>4. Service availability</h2><p>Calls depend on telecom networks and third-party providers. We aim for reliable service but do not guarantee that every call or alert will be delivered. GaadiPass is not an emergency service — in an emergency, call 112.</p>
<h2>5. Liability</h2><p>To the extent permitted by law, our total liability for any claim is limited to the amount you paid for the order. We are not liable for indirect losses such as fines, towing charges or damage to vehicles.</p>
<h2>6. Refunds, shipping and privacy</h2><p>See our <a href="/refund.html">Refund &amp; Cancellation Policy</a>, <a href="/shipping.html">Shipping Policy</a> and <a href="/privacy.html">Privacy Policy</a>.</p>
<h2>7. Governing law</h2><p>These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have exclusive jurisdiction.</p>
<h2>8. Contact</h2><p><a href="mailto:{EMAIL}">{EMAIL}</a></p>
""")

page("privacy.html", "Privacy Policy", f"""
<h1>Privacy Policy</h1><p class="muted">Last updated: {UPDATED}</p>
<p>This policy explains how Mission Invictus ("we") handles personal data for GaadiPass.</p>
<h2>What we collect</h2>
<ul>
  <li><b>Order details:</b> name, delivery address, phone number, email, vehicle number (optional).</li>
  <li><b>Activation:</b> the mobile number linked to your tag and any backup contact you add.</li>
  <li><b>Call and alert logs:</b> time, duration and tag of each call/alert. Caller numbers are stored only to prevent abuse.</li>
  <li><b>Payment:</b> processed by our payment partner. We do not store card details or UPI PINs.</li>
</ul>
<h2>How we use it</h2><p>To deliver orders, connect masked calls and alerts, prevent abuse, provide support and meet legal obligations. We never show your number to callers and we never sell your data.</p>
<h2>Sharing</h2><p>Only with service providers needed to run GaadiPass (telephony, payments, delivery, hosting) under confidentiality, or when required by law.</p>
<h2>Retention</h2><p>Order data is kept as long as accounting and tax law requires. Call logs are kept for up to 12 months. You can ask us to delete your tag and data at any time.</p>
<h2>Your rights</h2><p>You may request access to, correction of, or deletion of your data by writing to <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>
<h2>Contact</h2><p>Mission Invictus, Bengaluru, Karnataka, India · <a href="mailto:{EMAIL}">{EMAIL}</a></p>
""")

page("refund.html", "Refund & Cancellation Policy", f"""
<h1>Refund &amp; Cancellation Policy</h1><p class="muted">Last updated: {UPDATED}</p>
<h2>Cancellation</h2><p>You can cancel an order any time <b>before it is dispatched</b> for a full refund. Once dispatched, the order cannot be cancelled.</p>
<h2>Damaged or wrong item</h2><p>If your stickers arrive damaged, defective or wrong, tell us within <b>7 days of delivery</b> with a photo. We will send a free replacement or give a full refund.</p>
<h2>Service not working</h2><p>If the QR code or calling does not work for your tag within 7 days of delivery and we cannot fix it, we will refund the order in full.</p>
<h2>Non-returnable</h2><p>Stickers that have already been applied to a vehicle cannot be returned, except in the cases above.</p>
<h2>Refund timeline</h2><p>Approved refunds are processed within <b>5–7 working days</b> to the original payment method.</p>
<h2>How to request</h2><p>Email <a href="mailto:{EMAIL}">{EMAIL}</a> with your order details.</p>
""")

page("shipping.html", "Shipping Policy", f"""
<h1>Shipping Policy</h1><p class="muted">Last updated: {UPDATED}</p>
<table>
  <tr><th>Area</th><th>Dispatch</th><th>Delivery time</th><th>Charge</th></tr>
  <tr><td>Bengaluru</td><td>Within 1–2 working days (pre-orders: when the batch is ready, ~2–3 weeks)</td><td>1–3 working days</td><td>Free</td></tr>
  <tr><td>Rest of India</td><td>Within 1–2 working days</td><td>3–7 working days</td><td>Included in price</td></tr>
</table>
<p>Orders are shipped by courier or India Post to the address given when ordering. You will receive tracking details by WhatsApp, SMS or email once dispatched.</p>
<p>Delays caused by courier partners, weather or incorrect addresses are outside our control; we will help track and resolve any delay. If a parcel is lost in transit, we will re-ship it free of charge.</p>
<p>Questions: <a href="mailto:{EMAIL}">{EMAIL}</a></p>
""")

page("contact.html", "Contact Us", f"""
<h1>Contact Us</h1>
<table>
  <tr><td>Business</td><td>Mission Invictus (proprietor: Ajay Singh)</td></tr>
  <tr><td>Product</td><td>GaadiPass</td></tr>
  <tr><td>Email</td><td><a href="mailto:{EMAIL}">{EMAIL}</a></td></tr>
  <tr><td>Phone / WhatsApp</td><td><a href="tel:{PHONE_TEL}">{PHONE}</a></td></tr>
  <tr><td>Address</td><td>Kasavanahalli, Sarjapur Road, Bengaluru, Karnataka 560035, India</td></tr>
  <tr><td>Udyam Reg. No.</td><td>UDYAM-KR-03-0789449</td></tr>
  <tr><td>Support hours</td><td>Mon–Sat, 10:00 AM – 7:00 PM IST</td></tr>
</table>
<p>We reply to emails within 24 hours on working days.</p>
""")

print("built:", ", ".join(sorted(p.name for p in ROOT.glob("*.html"))))
