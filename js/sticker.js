/* GaadiPass sticker artwork — one source for print PDFs and the site's sticker images.
 * Size: 75 × 100 mm. Drawn on a canvas at 300 dpi (886 × 1181 px).
 * FRONT faces outside the windshield (anyone can scan / read it).
 * BACK faces inside the car (the owner sees it).
 * Needs: window.qrcode (vendor/qrcode-generator.min.js) and the site fonts "Stencil" + "Barlow".
 */
(function (root) {
  const W = 886, H = 1181          // 75 × 100 mm at 300 dpi
  const MM = { w: 75, h: 100 }
  const SITE = 'gaadipass.missioninvictus.com'
  const C = {
    yellow: '#ffc400', ink: '#121314', paper: '#ffffff', paint: '#e9ebe7',
    concrete: '#24272a', concrete2: '#2f3336', text: '#eef0ec', dim: '#b4b9b5', soft: '#3a3d3f', red: '#d7261e'
  }
  const ALPHA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // no 0/O/1/I — easy to read aloud

  // ---------- tag codes: deterministic from the order number, so they can always be recomputed ----------
  async function sha256 (text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return new Uint8Array(buf)
  }
  async function tagFor (orderNo, i) {
    const b = await sha256(orderNo + ':' + i)
    let s = ''
    for (let k = 0; k < 6; k++) s += ALPHA[b[k] % 32]
    return 'GP-' + s
  }
  async function tagsFor (orderNo, count) {
    const out = []
    for (let i = 0; i < count; i++) out.push(await tagFor(orderNo, i))
    return out
  }
  const scanUrl = (tag) => `https://${SITE}/t.html?c=${tag.replace(/^GP-?/, '')}`

  // ---------- fonts ----------
  let fontsReady = null
  function loadFonts () {
    if (!fontsReady) {
      fontsReady = Promise.all([
        document.fonts.load('900 80px Stencil'), document.fonts.load('700 30px Barlow'),
        document.fonts.load('600 30px Barlow'), document.fonts.load('500 30px Barlow')
      ]).catch(() => {})
    }
    return fontsReady
  }

  // ---------- drawing helpers ----------
  function hazard (ctx, x, y, w, h, gap) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
    ctx.fillStyle = C.yellow; ctx.fillRect(x, y, w, h)
    ctx.fillStyle = C.ink
    const g = gap || h * 1.4
    for (let s = x - h * 2; s < x + w + h * 2; s += g * 2) {
      ctx.beginPath(); ctx.moveTo(s, y + h); ctx.lineTo(s + g, y + h); ctx.lineTo(s + g + h, y); ctx.lineTo(s + h, y); ctx.closePath(); ctx.fill()
    }
    ctx.restore()
  }
  function brand (ctx, x, baseY, size, onDark) {
    ctx.font = `900 ${size}px Stencil`
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = onDark ? C.text : C.ink
    ctx.fillText('GAADI', x, baseY)
    const gw = ctx.measureText('GAADI').width + size * 0.08
    const pw = ctx.measureText('PASS').width
    const pad = size * 0.1
    ctx.fillStyle = onDark ? C.yellow : C.ink
    ctx.fillRect(x + gw, baseY - size * 0.86, pw + pad * 2, size * 0.98)
    ctx.fillStyle = onDark ? C.ink : C.yellow
    ctx.fillText('PASS', x + gw + pad, baseY)
    return gw + pw + pad * 2
  }
  function centerText (ctx, text, y, font, color) {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText(text, W / 2, y); ctx.textAlign = 'left'
  }
  function wrap (ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ')
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y); y += lineH; line = w } else line = test
    }
    if (line) { ctx.fillText(line, x, y); y += lineH }
    return y
  }
  function qrMatrix (text) {
    const q = root.qrcode(0, 'M')
    q.addData(text); q.make()
    const n = q.getModuleCount()
    return { n, dark: (r, c) => q.isDark(r, c) }
  }
  function drawQR (ctx, text, x, y, size) {
    const m = qrMatrix(text)
    const quiet = 2
    const cell = Math.floor(size / (m.n + quiet * 2))
    const real = cell * (m.n + quiet * 2)
    const ox = x + Math.floor((size - real) / 2), oy = y + Math.floor((size - real) / 2)
    ctx.fillStyle = C.paper; ctx.fillRect(ox, oy, real, real)
    ctx.fillStyle = C.ink
    for (let r = 0; r < m.n; r++) for (let c = 0; c < m.n; c++) if (m.dark(r, c)) ctx.fillRect(ox + (c + quiet) * cell, oy + (r + quiet) * cell, cell, cell)
  }
  function corners (ctx, x, y, s, len, t, color) {
    ctx.fillStyle = color
    ;[[x, y, 1, 1], [x + s, y, -1, 1], [x, y + s, 1, -1], [x + s, y + s, -1, -1]].forEach(([cx, cy, dx, dy]) => {
      ctx.fillRect(dx > 0 ? cx : cx - len, dy > 0 ? cy : cy - t, len, t)
      ctx.fillRect(dx > 0 ? cx : cx - t, dy > 0 ? cy : cy - len, t, len)
    })
  }
  function stepRow (ctx, n, text, x, y, h) {
    ctx.fillStyle = C.yellow; ctx.fillRect(x, y - h * 0.72, h * 0.86, h * 0.86)
    ctx.fillStyle = C.ink; ctx.font = `700 ${Math.round(h * 0.62)}px Barlow`; ctx.textAlign = 'center'
    ctx.fillText(String(n), x + h * 0.43, y - h * 0.08); ctx.textAlign = 'left'
    ctx.fillStyle = C.text; ctx.font = `600 ${Math.round(h * 0.52)}px Barlow`
    ctx.fillText(text, x + h * 1.1, y - h * 0.08)
  }
  function spaced (ctx, text, x, y, px, align) {
    const has = 'letterSpacing' in ctx
    if (has) ctx.letterSpacing = px + 'px'
    ctx.textAlign = align || 'left'; ctx.fillText(text, x, y); ctx.textAlign = 'left'
    if (has) ctx.letterSpacing = '0px'
  }
  // simple use-case icons, drawn so they print crisp at any size
  function icon (ctx, kind, cx, cy, r) {
    ctx.save(); ctx.lineWidth = r * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    if (kind === 'parking') {
      ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill()
      ctx.fillStyle = C.ink; ctx.font = `700 ${r * 1.25}px Barlow`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('P', cx, cy + r * 0.06)
      ctx.strokeStyle = C.red; ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, 0, 7); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx - r * 0.64, cy - r * 0.64); ctx.lineTo(cx + r * 0.64, cy + r * 0.64); ctx.stroke()
    } else if (kind === 'lights') {
      ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink
      ctx.beginPath(); ctx.moveTo(cx - r * 0.15, cy - r * 0.6); ctx.quadraticCurveTo(cx - r * 0.95, cy, cx - r * 0.15, cy + r * 0.6); ctx.closePath(); ctx.fill()
      for (const dy of [-0.5, -0.17, 0.17, 0.5]) { ctx.beginPath(); ctx.moveTo(cx + r * 0.12, cy + r * dy); ctx.lineTo(cx + r * 0.85, cy + r * dy); ctx.stroke() }
    } else if (kind === 'alert') {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.9); ctx.lineTo(cx + r, cy + r * 0.78); ctx.lineTo(cx - r, cy + r * 0.78); ctx.closePath(); ctx.fill()
      ctx.fillStyle = C.yellow; ctx.font = `700 ${r * 1.1}px Barlow`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('!', cx, cy + r * 0.26)
    } else if (kind === 'tow') {
      ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink
      ctx.fillRect(cx - r * 0.95, cy - r * 0.2, r * 1.3, r * 0.55)          // truck body
      ctx.fillRect(cx - r * 0.95, cy - r * 0.62, r * 0.55, r * 0.5)         // cab
      ctx.beginPath(); ctx.moveTo(cx + r * 0.1, cy - r * 0.2); ctx.lineTo(cx + r * 0.75, cy - r * 0.75); ctx.lineTo(cx + r * 0.75, cy + r * 0.05); ctx.stroke() // boom + hook
      ctx.fillStyle = C.paper
      for (const wx of [-0.6, 0.05]) { ctx.beginPath(); ctx.arc(cx + r * wx, cy + r * 0.42, r * 0.2, 0, 7); ctx.fillStyle = C.ink; ctx.fill() }
    }
    ctx.restore()
  }

  // ---------- FRONT (faces outside) ----------
  function drawFront (canvas, tag, opts) {
    opts = opts || {}
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H)

    // brand band (the logo keeps the brand stencil; everything else is plain and easy to read)
    ctx.fillStyle = C.yellow; ctx.fillRect(0, 0, W, 128)
    const bs = 92
    const bw = (() => { ctx.font = `900 ${bs}px Stencil`; return ctx.measureText('GAADI').width + ctx.measureText('PASS').width + bs * 0.28 })()
    brand(ctx, (W - bw) / 2, 102, bs, false)
    hazard(ctx, 0, 128, W, 20, 28)

    // headline
    ctx.fillStyle = C.ink; ctx.font = '700 74px Barlow'; ctx.textAlign = 'center'
    ctx.fillText('Gaadi block hai?', W / 2, 234)
    ctx.font = '700 48px Barlow'
    const l2 = 'Scan to reach the owner'
    const l2w = ctx.measureText(l2).width
    ctx.fillStyle = C.yellow; ctx.fillRect((W - l2w) / 2 - 6, 282, l2w + 12, 16)
    ctx.fillStyle = C.ink; ctx.fillText(l2, W / 2, 290); ctx.textAlign = 'left'

    // QR
    const qs = 372, qx = (W - qs) / 2, qy = 322
    drawQR(ctx, scanUrl(tag), qx, qy, qs)
    corners(ctx, qx - 12, qy - 12, qs + 24, 52, 11, C.ink)
    centerText(ctx, 'Phone camera, Google Lens or any QR app', 752, '600 29px Barlow', C.soft)

    // when to scan
    const items = [['parking', 'Wrong parking'], ['lights', 'Lights on'], ['tow', 'Towing'], ['alert', 'Emergency']]
    const colW = (W - 64) / 4
    items.forEach(([k, label], i) => {
      const cx = 32 + colW * i + colW / 2
      icon(ctx, k, cx, 812, 36)
      ctx.fillStyle = C.ink; ctx.font = '700 25px Barlow'; ctx.textAlign = 'center'; ctx.fillText(label, cx, 882); ctx.textAlign = 'left'
    })

    // steps
    const sy = 904, sh = 172
    ctx.fillStyle = C.ink; ctx.fillRect(0, sy, W, sh)
    const call = (opts.callNumber || '').trim()
    stepRow(ctx, 1, 'Scan the QR code above', 48, sy + 60, 52)
    stepRow(ctx, 2, 'We alert the owner for you', 48, sy + 112, 52)
    stepRow(ctx, 3, call ? 'No smartphone? Call ' + call : "Owner's number stays private", 48, sy + 164, 52)

    // code bar
    ctx.fillStyle = C.yellow; ctx.fillRect(0, sy + sh, W, 74)
    ctx.fillStyle = C.ink; ctx.font = '700 26px Barlow'; spaced(ctx, 'STICKER CODE', 48, sy + sh + 48, 2)
    ctx.font = '700 58px Barlow'; spaced(ctx, tag, W - 48, sy + sh + 56, 4, 'right')

    // footer
    centerText(ctx, SITE, H - 10, '600 22px Barlow', C.soft)
    return canvas
  }

  // ---------- BACK (faces inside the car) ----------
  function drawBack (canvas, tag) {
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = C.concrete; ctx.fillRect(0, 0, W, H)
    // faint aggregate texture
    ctx.fillStyle = 'rgba(255,255,255,.035)'
    for (let y = 4; y < H; y += 14) for (let x = (y / 14) % 2 ? 4 : 11; x < W; x += 14) ctx.fillRect(x, y, 2, 2)

    hazard(ctx, 0, 0, W, 34, 34)
    brand(ctx, 56, 170, 96, true)

    ctx.fillStyle = C.text; ctx.font = '700 66px Barlow'
    ctx.fillText('This car is', 56, 290); ctx.fillText('on GaadiPass', 56, 362)

    ctx.font = '500 34px Barlow'; ctx.fillStyle = C.text
    let y = 440
    y = wrap(ctx, 'When someone needs this car moved, they scan the sticker on the outside.', 56, y, W - 112, 46)
    y += 14
    y = wrap(ctx, 'We reach you on the mobile number from your order. Your number is never shown to them.', 56, y, W - 112, 46)

    // tips plate
    y += 26
    ctx.fillStyle = C.concrete2; ctx.fillRect(40, y, W - 80, 226)
    ctx.fillStyle = C.yellow; ctx.font = '700 28px Barlow'; ctx.fillText('KEEP IN MIND', 72, y + 52)
    ctx.fillStyle = C.text; ctx.font = '500 30px Barlow'
    ctx.fillText('• Stick on the inside of the windshield', 72, y + 100)
    ctx.fillText('• This side faces you, the front faces out', 72, y + 142)
    ctx.fillText('• Help: ' + SITE + '/contact', 72, y + 184)

    // code plate
    const cy = H - 236
    ctx.fillStyle = C.paint; ctx.fillRect(40, cy, W - 80, 132)
    ctx.fillStyle = C.soft; ctx.font = '700 26px Barlow'; ctx.fillText('YOUR STICKER CODE', 72, cy + 48)
    ctx.fillStyle = C.ink; ctx.font = '700 62px Barlow'; spaced(ctx, tag, 72, cy + 110, 4)

    ctx.fillStyle = C.dim; ctx.font = '600 22px Barlow'; ctx.fillText('Mission Invictus · Bengaluru', 56, H - 60)
    hazard(ctx, 0, H - 34, W, 34, 34)
    return canvas
  }

  // ---------- PDF: packing slip + front sheet(s) + back sheet(s) per order ----------
  // A4 portrait, 4 stickers per sheet (2 × 2), crop marks; back sheets mirror the columns for long-edge duplex.
  const SHEET = { cols: 2, rows: 2, gap: 10 }
  function slots () {
    const w = MM.w, h = MM.h, g = SHEET.gap
    const x0 = (210 - (w * 2 + g)) / 2, y0 = (297 - (h * 2 + g)) / 2
    const out = []
    for (let r = 0; r < SHEET.rows; r++) for (let c = 0; c < SHEET.cols; c++) out.push({ c, r, x: x0 + c * (w + g), y: y0 + r * (h + g) })
    return out
  }
  function cropMarks (pdf, x, y, w, h) {
    pdf.setDrawColor(120); pdf.setLineWidth(0.15)
    const m = 4, o = 1.5
    ;[[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([cx, cy]) => {
      const dx = cx === x ? -1 : 1, dy = cy === y ? -1 : 1
      pdf.line(cx + dx * o, cy, cx + dx * (o + m), cy)
      pdf.line(cx, cy + dy * o, cx, cy + dy * (o + m))
    })
  }
  function pageHeader (pdf, text) {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(90)
    pdf.text(text, 105, 12, { align: 'center' })
  }
  const PER = SHEET.cols * SHEET.rows

  async function addOrder (pdf, order, opts, first) {
    await loadFonts()
    const count = Math.max(1, (Number(order.packs) || 1) * 2)
    const tags = await tagsFor(order.orderNo, count)
    // packing slip
    if (!first) pdf.addPage()
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(20); pdf.setTextColor(18)
    pdf.text('GaadiPass order ' + order.orderNo, 20, 28)
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11)
    const when = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : ''
    const lines = [
      'Date: ' + when,
      'Packs: ' + order.packs + '  (' + count + ' stickers)   Amount: Rs ' + order.amount + '   Status: ' + (order.status || ''),
      '',
      'Ship to:',
      order.name || '',
      [order.addressLine, order.area].filter(Boolean).join(', '),
      [order.city, order.pincode].filter(Boolean).join(' '),
      'Phone: ' + (order.phone || '') + (order.carNumber ? '    Car: ' + order.carNumber : ''),
      '',
      'Sticker codes (QR → ' + SITE + '/t.html?c=CODE):'
    ]
    let y = 40
    lines.forEach((l) => { pdf.text(l, 20, y); y += 6.5 })
    pdf.setFont('courier', 'bold'); pdf.setFontSize(13)
    tags.forEach((t, i) => { pdf.text((i + 1) + '.  ' + t, 26, y); y += 7 })
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(80)
    y += 6
    ;['PRINT NOTES', 'Print at 100% / actual size (no "fit to page"). Each sticker is 75 × 100 mm; cut on the crop marks.',
      'Material: clear or white waterproof vinyl, UV-laminated. FRONT faces outside the windshield, BACK faces inside.',
      'Double-sided print: FRONT sheet then BACK sheet, flip on the long edge (back sheets are mirrored for this).',
      'Check every QR scans before packing.'].forEach((l, i) => { if (i === 0) pdf.setFont('helvetica', 'bold'); else pdf.setFont('helvetica', 'normal'); pdf.text(l, 20, y); y += 5.5 })

    // sheets
    const canvas = document.createElement('canvas')
    const pos = slots()
    for (let s = 0; s < tags.length; s += PER) {
      const chunk = tags.slice(s, s + PER)
      const sheetNo = s / PER + 1, sheets = Math.ceil(tags.length / PER)
      // FRONT
      pdf.addPage(); pageHeader(pdf, `GaadiPass · ${order.orderNo} · FRONT (faces outside) · sheet ${sheetNo}/${sheets} · print at 100%`)
      chunk.forEach((tag, i) => {
        drawFront(canvas, tag, opts)
        const p = pos[i]
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', p.x, p.y, MM.w, MM.h, undefined, 'FAST')
        cropMarks(pdf, p.x, p.y, MM.w, MM.h)
      })
      // BACK (columns mirrored so it lines up when the sheet is flipped on the long edge)
      pdf.addPage(); pageHeader(pdf, `GaadiPass · ${order.orderNo} · BACK (faces inside) · sheet ${sheetNo}/${sheets} · long-edge flip`)
      chunk.forEach((tag, i) => {
        drawBack(canvas, tag)
        const p = pos[i]
        const mx = pos.find((q) => q.r === p.r && q.c === SHEET.cols - 1 - p.c)
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', mx.x, mx.y, MM.w, MM.h, undefined, 'FAST')
        cropMarks(pdf, mx.x, mx.y, MM.w, MM.h)
      })
    }
    return tags
  }

  async function pdfForOrders (orders, opts, filename) {
    const { jsPDF } = root.jspdf
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
    for (let i = 0; i < orders.length; i++) await addOrder(pdf, orders[i], opts || {}, i === 0)
    pdf.save(filename)
  }

  root.GPSticker = { W, H, MM, tagFor, tagsFor, scanUrl, loadFonts, drawFront, drawBack, pdfForOrders }
})(window)
