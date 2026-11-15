// GaadiPass order flow: 1) details  2) pay by UPI  3) upload payment screenshot
(function () {
  const API = 'https://api.missioninvictus.com/api/v1/gaadipass'
  const $ = (id) => document.getElementById(id)
  let cfg = { pricePerPack: 399, stickersPerPack: 2, upiId: null, payeeName: 'Mission Invictus' }

  const show = (step) => {
    ['step1', 'step2', 'step3', 'done'].forEach((s) => { $(s).hidden = s !== step })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const total = () => Number($('packs').value || 1) * cfg.pricePerPack
  const updateTotal = () => {
    const p = Number($('packs').value || 1)
    $('total').textContent = `₹${total()} · ${p * cfg.stickersPerPack} stickers`
  }
  const err = (id, msg) => { $(id).textContent = msg || ''; $(id).hidden = !msg }

  fetch(API + '/config').then((r) => r.json()).then((j) => {
    if (j && j.data && j.data.data) cfg = { ...cfg, ...j.data.data }
    updateTotal()
  }).catch(() => updateTotal())

  $('packs').addEventListener('change', updateTotal)

  // Step 1 → 2
  $('form1').addEventListener('submit', (e) => {
    e.preventDefault()
    const phone = $('phone').value.replace(/\s|-/g, '')
    if (!/^(\+91)?[6-9]\d{9}$/.test(phone)) return err('err1', 'Enter a valid 10-digit mobile number')
    if (!/^\d{6}$/.test($('pincode').value.trim())) return err('err1', 'Enter a valid 6-digit PIN code')
    err('err1', '')
    const amount = total()
    $('payAmount').textContent = `₹${amount}`
    if (cfg.upiId) {
      const link = `upi://pay?pa=${encodeURIComponent(cfg.upiId)}&pn=${encodeURIComponent(cfg.payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('GaadiPass order')}`
      $('upiId').textContent = cfg.upiId
      const q = link.split('?')[1]
      $('payBtn').href = link
      $('payPhonePe').href = 'phonepe://pay?' + q
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      $('payGPay').href = (isIOS ? 'gpay://upi/pay?' : 'tez://upi/pay?') + q
      // iPhone has no UPI app chooser: hide the generic button there, show a hint instead
      $('payBtn').hidden = isIOS
      $('iosHint').hidden = !isIOS
      $('payPaytm').href = 'paytmmp://pay?' + q
      $('qr').innerHTML = ''
      if (window.QRCode) new window.QRCode($('qr'), { text: link, width: 200, height: 200 })
      $('payBox').hidden = false
      $('noUpi').hidden = true
    } else {
      $('payBox').hidden = true
      $('noUpi').hidden = false
    }
    show('step2')
  })

  $('copyUpi').addEventListener('click', () => {
    navigator.clipboard && navigator.clipboard.writeText(cfg.upiId || '')
    $('copyUpi').textContent = 'Copied ✓'
    setTimeout(() => { $('copyUpi').textContent = 'Copy' }, 1500)
  })
  $('back1').addEventListener('click', () => show('step1'))
  $('paid').addEventListener('click', () => show('step3'))
  $('back2').addEventListener('click', () => show('step2'))

  // Step 3 → submit
  $('form3').addEventListener('submit', async (e) => {
    e.preventDefault()
    const file = $('screenshot').files[0]
    if (!file) return err('err3', 'Please upload the payment screenshot')
    if (file.size > 5 * 1024 * 1024) return err('err3', 'Screenshot is too large (max 5 MB)')
    err('err3', '')
    const fd = new FormData()
    for (const id of ['name', 'phone', 'email', 'addressLine', 'area', 'city', 'pincode', 'carNumber', 'packs', 'upiTxnId']) {
      fd.append(id, $(id).value.trim())
    }
    fd.set('phone', $('phone').value.replace(/\s|-/g, ''))
    fd.append('screenshot', file)
    $('submitBtn').disabled = true
    $('submitBtn').textContent = 'Placing order…'
    try {
      const r = await fetch(API + '/orders', { method: 'POST', body: fd })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((j.data && j.data.info) || j.message || 'Something went wrong, please try again')
      const o = j.data.data
      $('orderNo').textContent = o.orderNo
      $('doneAmount').textContent = `₹${o.amount}`
      show('done')
    } catch (ex) {
      err('err3', ex.message)
    } finally {
      $('submitBtn').disabled = false
      $('submitBtn').textContent = 'Place order'
    }
  })
})()
