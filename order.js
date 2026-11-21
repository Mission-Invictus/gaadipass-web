// GaadiPass order flow: 1) details  2) pay with Razorpay (common pay.js from api.missioninvictus.com)  -> done
(function () {
  'use strict'
  const API = ((window.MIPay && window.MIPay.base) || 'https://api.missioninvictus.com') + '/api/v1/gaadipass'
  const $ = (id) => document.getElementById(id)
  const $$ = (sel) => Array.prototype.slice.call(document.querySelectorAll(sel))

  let cfg = { pricePerPack: 399, stickersPerPack: 2, currency: 'INR', payeeName: 'Mission Invictus', razorpay: false }
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
  const STEPS = ['step1', 'step2', 'done']
  const STEP_STATUS = {
    step1: 'Step 1 of 2: your details',
    step2: 'Step 2 of 2: pay',
    done: 'Order confirmed'
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

  // ---------- step 2: pay with Razorpay ----------
  function renderPay () {
    const amount = total()
    $('payAmount').textContent = rupees(amount)
    $('payMeta').textContent = plural(packs(), 'pack', 'packs') + ' · ' + plural(stickers(), 'sticker', 'stickers') + ' · to ' + cfg.payeeName
    $('rzpAmt').textContent = rupees(amount)
    alertBox('errPay', '')
    const online = !!(cfg.razorpay && window.MIPay)
    $('rzpBox').hidden = !online
    $('noPay').hidden = online
  }

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
      renderDone({ orderNo: o.orderNo || '', amount: o.amount || paid.amount })
    } catch (e) {
      alertBox('errPay', e.code === 'dismissed'
        ? 'Payment not completed. Tap Pay to try again.'
        : e.message || 'Something went wrong. Please try again.')
    } finally {
      btn.removeAttribute('aria-busy')
      btn.disabled = false
    }
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
  $('copyOrder').addEventListener('click', () => copyText($('orderNo').textContent, $('copyOrder'), 'Copy order number', 'Order number copied'))

  $('back1').addEventListener('click', () => show('step1'))
  $('sumEdit').addEventListener('click', () => show('step1'))

  // ---------- done ----------
  function renderDone (o) {
    window.gpTrack && gpTrack('Purchase', { value: Number(o.amount) || 0, currency: 'INR' })
    $('orderNo').textContent = o.orderNo
    $('doneAmount').textContent = rupees(o.amount)
    const wa = $('doneWa')
    wa.href = wa.href.split('?')[0] + '?text=' + encodeURIComponent('Hi, my GaadiPass order number is ' + o.orderNo)
    $('sumAddr').hidden = true
    show('done')
  }

  renderSummary()
})()
