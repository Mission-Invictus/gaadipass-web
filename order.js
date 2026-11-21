// GaadiPass order flow: 1) details  2) pay (Razorpay via common pay.js, or UPI + 3) screenshot)  -> done
(function () {
  'use strict'
  const API = ((window.MIPay && window.MIPay.base) || 'https://api.missioninvictus.com') + '/api/v1/gaadipass'
  const MAX_FILE = 5 * 1024 * 1024
  const $ = (id) => document.getElementById(id)
  const $$ = (sel) => Array.prototype.slice.call(document.querySelectorAll(sel))

  let cfg = { pricePerPack: 399, stickersPerPack: 2, currency: 'INR', upiId: null, payeeName: 'Mission Invictus' }
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isPhone = isIOS || /Android/i.test(navigator.userAgent)
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const rupees = (n) => '₹' + Number(n).toLocaleString('en-IN')
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many)
  const packs = () => {
    const c = document.querySelector('input[name="packs"]:checked')
    return c ? Number(c.value) : 1
  }
  const total = () => packs() * cfg.pricePerPack
  const stickers = () => packs() * cfg.stickersPerPack

  // ---------- config ----------
  const cfgReady = (function () {
    const ctrl = window.AbortController ? new AbortController() : null
    const t = setTimeout(() => ctrl && ctrl.abort(), 8000)
    return fetch(API + '/config', ctrl ? { signal: ctrl.signal } : undefined)
      .then((r) => r.json())
      .then((j) => { if (j && j.data && j.data.data) cfg = Object.assign({}, cfg, j.data.data) })
      .catch(() => {})
      .then(() => { clearTimeout(t); renderPrices() })
  })()

  // ---------- prices / summary ----------
  function renderPrices () {
    $$('.js-price').forEach((el) => { el.textContent = rupees(cfg.pricePerPack) })
    $$('.js-per').forEach((el) => { el.textContent = cfg.stickersPerPack })
    $$('.js-st').forEach((el) => { el.textContent = Number(el.dataset.packs) * cfg.stickersPerPack })
    $$('.js-pp').forEach((el) => { el.textContent = rupees(Number(el.dataset.packs) * cfg.pricePerPack) })
    renderSummary()
  }
  function renderSummary () {
    const p = packs(); const s = stickers(); const t = rupees(total())
    $('sumPacks').textContent = p
    $('sumStickers').textContent = s
    $('sumTotal').textContent = t
    $('artCount').textContent = '×' + s
    $('inlineTotal').textContent = t
    $('inlineStickers').textContent = plural(s, 'sticker', 'stickers')
    $('btnTotal').textContent = t
  }
  $$('input[name="packs"]').forEach((r) => r.addEventListener('change', renderSummary))

  // ---------- steps ----------
  const STEPS = ['step1', 'step2', 'step3', 'done']
  const STEP_STATUS = {
    step1: 'Step 1 of 3: your details',
    step2: 'Step 2 of 3: pay',
    step3: 'Step 3 of 3: upload payment screenshot',
    done: 'Order received'
  }
  function show (step) {
    STEPS.forEach((s) => { $(s).hidden = s !== step })
    const idx = STEPS.indexOf(step)
    $$('.bay').forEach((b, i) => {
      const current = b.dataset.step === step
      if (current) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current')
      b.classList.toggle('is-done', i < idx)
      b.querySelector('.bay-state').textContent = i < idx ? ', done' : ''
    })
    $('stepStatus').textContent = STEP_STATUS[step]
    const top = $('orderTop')
    if (top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    $('h-' + step).focus({ preventScroll: true })
  }

  // ---------- field validation ----------
  const cleanPhone = (v) => {
    let p = v.replace(/[\s\-().]/g, '')
    if (/^0[6-9]\d{9}$/.test(p)) p = p.slice(1)
    if (/^91[6-9]\d{9}$/.test(p)) p = '+' + p
    return p
  }
  const RULES = {
    name: (v) => (v.length >= 2 ? '' : 'Enter your full name.'),
    phone: (v) => {
      if (!v) return 'Enter your mobile number.'
      return /^(\+91)?[6-9]\d{9}$/.test(cleanPhone(v)) ? '' : 'Enter a valid 10-digit mobile number, like 98765 43210.'
    },
    email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'This email looks incomplete. Fix it or leave it empty.'),
    addressLine: (v) => (v.length >= 3 ? '' : 'Enter your house / flat number, building and street.'),
    city: (v) => (v ? '' : 'Enter your city.'),
    pincode: (v) => {
      if (!v) return 'Enter your PIN code.'
      return /^\d{6}$/.test(v) ? '' : 'Enter a valid 6-digit PIN code, like 560102.'
    }
  }
  function setFieldError (id, msg) {
    const input = $(id); const e = $(id + '-err')
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid')
    if (e) { e.textContent = msg; e.hidden = !msg }
  }
  function checkField (id) {
    const msg = RULES[id]($(id).value.trim())
    setFieldError(id, msg)
    return msg
  }
  Object.keys(RULES).forEach((id) => {
    const input = $(id)
    // clear an error as soon as it is fixed; check a filled field when the user leaves it
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') checkField(id) })
    input.addEventListener('blur', () => { if (input.value.trim()) checkField(id) })
  })
  $('pincode').addEventListener('input', (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6)
    if (v !== e.target.value) e.target.value = v
  })
  $('carNumber').addEventListener('input', (e) => {
    const el = e.target; const pos = el.selectionStart
    el.value = el.value.toUpperCase()
    try { el.setSelectionRange(pos, pos) } catch (_) {}
  })

  const LABELS = { name: 'Full name', phone: 'Mobile number', email: 'Email', addressLine: 'Address', city: 'City', pincode: 'PIN code' }
  function alertBox (id, msg) { $(id).textContent = msg || ''; $(id).hidden = !msg }

  // ---------- step 1 -> 2 ----------
  $('form1').addEventListener('submit', async (e) => {
    e.preventDefault()
    const bad = Object.keys(RULES).filter((id) => checkField(id))
    if (bad.length) {
      alertBox('err1', bad.length === 1
        ? 'Please check ' + LABELS[bad[0]] + '.'
        : 'Please check ' + bad.length + ' fields: ' + bad.map((id) => LABELS[id]).join(', ') + '.')
      $(bad[0]).focus()
      return
    }
    alertBox('err1', '')
    const btn = $('toPay')
    btn.disabled = true
    await cfgReady
    btn.disabled = false
    renderPay()
    renderAddress()
    show('step2')
    window.gpTrack && gpTrack('InitiateCheckout', { currency: 'INR' })
  })

  function renderAddress () {
    const v = (id) => $(id).value.trim()
    const lines = [v('name') + ' · ' + cleanPhone(v('phone')), v('addressLine')]
    if (v('area')) lines.push(v('area'))
    lines.push(v('city') + ' ' + v('pincode'))
    $('sumAddrText').textContent = lines.join('\n')
    $('sumAddr').hidden = false
  }

  // ---------- step 2: pay ----------
  function renderPay () {
    const amount = total()
    $('payAmount').textContent = rupees(amount)
    $('payMeta').textContent = plural(packs(), 'pack', 'packs') + ' · ' + plural(stickers(), 'sticker', 'stickers') + ' · to ' + cfg.payeeName
    if (cfg.upiId) {
      const link = `upi://pay?pa=${encodeURIComponent(cfg.upiId)}&pn=${encodeURIComponent(cfg.payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('GaadiPass order')}`
      const q = link.split('?')[1]
      $('upiId').textContent = cfg.upiId
      payLinks = {
        phonepe: 'phonepe://pay?' + q,
        gpay: (isIOS ? 'gpay://upi/pay?' : 'tez://upi/pay?') + q,
        paytm: 'paytmmp://pay?' + q,
        other: link
      }
      $('payNowAmt').textContent = rupees(amount)
      // iPhone has no UPI app chooser: hide "Any UPI app" there, show a hint instead
      $('pickOther').hidden = isIOS
      if (isIOS && pickedApp() === 'other') document.querySelector('input[name="app"][value="phonepe"]').checked = true
      renderPayButton()
      $('iosHint').hidden = !isIOS
      // phones pay through the app, then the upload button appears; computers pay by QR, so show it straight away
      $('paidBox').hidden = isPhone
      $('payWait').hidden = true
      $('qr').innerHTML = ''
      if (window.QRCode) new window.QRCode($('qr'), { text: link, width: 200, height: 200 })
      $('qrBox').hidden = !window.QRCode
      if (finePointer && !isIOS) $('qrBox').open = true
      $('payBox').hidden = false
      $('noUpi').hidden = true
    } else {
      $('payBox').hidden = true
      $('noUpi').hidden = false
    }
    if (!cfg.upiId) $('paidBox').hidden = true
    // Razorpay first when the server has keys; the UPI + screenshot flow stays behind a toggle
    const online = !!(cfg.razorpay && window.MIPay)
    $('rzpBox').hidden = !online
    $('rzpAmt').textContent = rupees(amount)
    alertBox('errPay', '')
    setUpiOpen(!online)
  }

  // ---------- step 2: Razorpay (common pay.js) ----------
  function setUpiOpen (open) {
    $('upiManual').hidden = !open
    $('upiToggle').setAttribute('aria-expanded', String(open))
  }
  $('upiToggle').addEventListener('click', () => {
    const open = $('upiManual').hidden
    setUpiOpen(open)
    if (open) $('payNow').focus()
  })
  function orderData () {
    const d = {}
    for (const id of ['name', 'email', 'addressLine', 'area', 'city', 'pincode', 'carNumber']) d[id] = $(id).value.trim()
    d.phone = cleanPhone($('phone').value.trim())
    d.packs = packs()
    return d
  }
  $('rzpPay').addEventListener('click', async () => {
    const btn = $('rzpPay')
    if (btn.getAttribute('aria-busy') === 'true') return
    alertBox('errPay', '')
    btn.setAttribute('aria-busy', 'true')
    btn.disabled = true
    window.gpTrack && gpTrack('AddPaymentInfo', { currency: 'INR' })
    try {
      const paid = await window.MIPay.checkout({ product: 'gaadipass', data: orderData(), theme: '#FFC400' })
      const o = paid.result || {}
      renderDone({ orderNo: o.orderNo || '', amount: o.amount || paid.amount }, true)
    } catch (e) {
      alertBox('errPay', e.code === 'dismissed'
        ? 'Payment not completed. Tap Pay to try again, or pay to our UPI ID below.'
        : e.message || 'Something went wrong. Please try again.')
    } finally {
      btn.removeAttribute('aria-busy')
      btn.disabled = false
    }
  })

  // ---------- step 2: choose app → Pay → wait → upload ----------
  let payLinks = {}
  let waitTimer = null
  let leftForApp = false
  const APP_NAME = { phonepe: 'PhonePe', gpay: 'Google Pay', paytm: 'Paytm', other: 'your UPI app' }
  const pickedApp = () => { const r = document.querySelector('input[name="app"]:checked'); return r ? r.value : 'phonepe' }
  function renderPayButton () {
    const app = pickedApp()
    $('payNowApp').textContent = app === 'other' ? 'with any UPI app' : 'with ' + APP_NAME[app]
  }
  $$('input[name="app"]').forEach((r) => r.addEventListener('change', renderPayButton))

  function endWait () {
    clearTimeout(waitTimer)
    waitTimer = null
    if ($('payWait').hidden) return
    $('payWait').hidden = true
    $('payNow').disabled = false
    $('paidBox').hidden = false
    $('stepStatus').textContent = 'Payment done? Upload the screenshot.'
    $('paidBox').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
  }

  $('payNow').addEventListener('click', () => {
    const app = pickedApp()
    const href = payLinks[app]
    if (!href) return
    $('waitTitle').textContent = 'Opening ' + APP_NAME[app] + '…'
    $('waitText').textContent = 'Complete the payment of ' + $('payAmount').textContent + ' in the app, then come back here.'
    $('payWait').hidden = false
    $('paidBox').hidden = true
    $('payNow').disabled = true
    leftForApp = false
    window.gpTrack && gpTrack('AddPaymentInfo', { currency: 'INR' })
    window.location.href = href
    // the screenshot step appears after a few seconds, or as soon as the customer returns from the app
    clearTimeout(waitTimer)
    waitTimer = setTimeout(endWait, 4500)
  })
  document.addEventListener('visibilitychange', () => {
    if ($('payWait').hidden) return
    if (document.hidden) { leftForApp = true; clearTimeout(waitTimer); return }
    if (leftForApp) setTimeout(endWait, 700)
  })
  $('payAgain').addEventListener('click', () => {
    $('paidBox').hidden = true
    $('payNow').focus()
  })

  // ---------- copy ----------
  function copyText (text, btn, label, said) {
    const ok = () => {
      btn.textContent = 'Copied'
      $('stepStatus').textContent = said
      setTimeout(() => { btn.textContent = label }, 1800)
    }
    const fallback = () => {
      const ta = document.createElement('textarea')
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta); ta.select()
      try { if (document.execCommand('copy')) ok() } catch (_) {}
      ta.remove()
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback)
    else fallback()
  }
  $('copyUpi').addEventListener('click', () => copyText(cfg.upiId || '', $('copyUpi'), 'Copy UPI ID', 'UPI ID copied'))
  $('copyOrder').addEventListener('click', () => copyText($('orderNo').textContent, $('copyOrder'), 'Copy order number', 'Order number copied'))

  $('back1').addEventListener('click', () => show('step1'))
  $('sumEdit').addEventListener('click', () => show('step1'))
  $('paid').addEventListener('click', () => show('step3'))
  $('back2').addEventListener('click', () => show('step2'))

  // ---------- step 3: screenshot ----------
  let chosen = null
  let previewUrl = null
  const fmtSize = (b) => (b < 1024 * 1024 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / (1024 * 1024)).toFixed(1) + ' MB')
  function shotError (msg) {
    setFieldError('screenshot', msg)
    $('dropZone').classList.toggle('is-invalid', !!msg)
  }
  function takeFile (file) {
    if (!file) return
    const looksImage = file.type ? /^image\//.test(file.type) : /\.(png|jpe?g|webp|heic|heif|gif)$/i.test(file.name)
    if (!looksImage) { chosen = null; clearPreview(); return shotError('That file is not an image. Choose the screenshot of your payment.') }
    if (file.size > MAX_FILE) { chosen = null; clearPreview(); return shotError('This screenshot is ' + fmtSize(file.size) + '. Choose one under 5 MB, or crop it.') }
    chosen = file
    shotError('')
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    previewUrl = URL.createObjectURL(file)
    const img = new Image()
    img.alt = 'Your payment screenshot'
    img.src = previewUrl
    $('shotThumb').replaceChildren(img)
    $('shotName').textContent = file.name || 'Screenshot'
    $('shotSize').textContent = fmtSize(file.size)
    $('shotEmpty').hidden = true
    $('shotPreview').hidden = false
  }
  function clearPreview () {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    previewUrl = null
    $('shotThumb').replaceChildren()
    $('shotEmpty').hidden = false
    $('shotPreview').hidden = true
  }
  const shot = $('screenshot')
  shot.addEventListener('change', () => { if (shot.files && shot.files[0]) takeFile(shot.files[0]) })
  const zone = $('dropZone')
  ;['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('is-over') }))
  ;['dragleave', 'dragend'].forEach((ev) => zone.addEventListener(ev, () => zone.classList.remove('is-over')))
  zone.addEventListener('drop', (e) => {
    e.preventDefault(); zone.classList.remove('is-over')
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
    if (!f) return
    try { const dt = new DataTransfer(); dt.items.add(f); shot.files = dt.files } catch (_) {}
    takeFile(f)
  })

  $('form3').addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!chosen) {
      shotError('Add the screenshot of your payment to place the order.')
      alertBox('err3', '')
      shot.focus()
      return
    }
    alertBox('err3', '')
    const fd = new FormData()
    for (const id of ['name', 'email', 'addressLine', 'area', 'city', 'pincode', 'carNumber', 'upiTxnId']) {
      fd.append(id, $(id).value.trim())
    }
    fd.append('phone', cleanPhone($('phone').value.trim()))
    fd.append('packs', String(packs()))
    fd.append('screenshot', chosen, chosen.name || 'screenshot.jpg')
    const btn = $('submitBtn')
    btn.disabled = true
    btn.textContent = 'Placing order…'
    $('form3').setAttribute('aria-busy', 'true')
    try {
      let r
      try { r = await fetch(API + '/orders', { method: 'POST', body: fd }) } catch (_) {
        throw new Error('Could not reach our server. Check your internet and tap Place order again.')
      }
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((j.data && j.data.info) || j.message || 'Something went wrong. Please try again.')
      renderDone(j.data.data)
    } catch (ex) {
      alertBox('err3', ex.message)
    } finally {
      btn.disabled = false
      btn.textContent = 'Place order'
      $('form3').removeAttribute('aria-busy')
    }
  })

  // ---------- done ----------
  function renderDone (o, paidOnline) {
    window.gpTrack && gpTrack('Purchase', { value: Number(o.amount) || 0, currency: 'INR' })
    $('orderNo').textContent = o.orderNo
    $('nextPay').innerHTML = paidOnline
      ? '<span><b>Payment confirmed.</b> We will message you on WhatsApp.</span>'
      : '<span><b>We verify your payment</b> by hand, usually within a few hours, and confirm on WhatsApp.</span>'
    $('doneAmount').textContent = rupees(o.amount)
    const wa = $('doneWa')
    wa.href = wa.href.split('?')[0] + '?text=' + encodeURIComponent('Hi, my GaadiPass order number is ' + o.orderNo)
    $('sumAddr').hidden = true
    show('done')
  }

  renderSummary()
})()
