// GaadiPass admin: list orders, view payment screenshots, update status.
// Contract: GET API[?status=] -> json.data.data rows · GET API/:orderNo/screenshot (blob)
//           PATCH API/:orderNo {status} · header x-admin-key · key in sessionStorage 'gpAdminKey'
(function () {
  const API = 'https://api.missioninvictus.com/api/v1/gaadipass/admin/orders'
  const $ = (id) => document.getElementById(id)
  const STATUSES = ['submitted', 'verified', 'shipped', 'delivered', 'cancelled']
  const LABEL = { '': 'All', submitted: 'Submitted', verified: 'Verified', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }
  let key = ''
  try { key = sessionStorage.getItem('gpAdminKey') || '' } catch (e) {}

  // viewer image is created here so the page ships no src-less <img>
  const shotImg = document.createElement('img')
  shotImg.id = 'shot'
  shotImg.alt = 'Payment screenshot'
  $('shotStage').appendChild(shotImg)

  let orders = []      // every order (server caps at 500, newest first)
  let filter = ''      // '' = all
  let shotUrl = ''
  let shotReturn = null

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const call = (url, opts = {}) => fetch(url, { ...opts, headers: { ...(opts.headers || {}), 'x-admin-key': key } })
  const telHref = (p) => String(p == null ? '' : p).replace(/[^\d+]/g, '')
  const rupees = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN')
  const when = (d) => {
    const t = new Date(d)
    if (isNaN(t)) return ''
    return t.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  }
  const addressText = (o) => [
    o.name,
    [o.addressLine, o.area].filter(Boolean).join(', '),
    [o.city, o.pincode].filter(Boolean).join(' '),
    o.phone
  ].filter(Boolean).join('\n')
  const find = (no) => orders.find((o) => o.orderNo === no)

  // ---------- states ----------
  function setState (kind, text, retry) {
    const box = $('msg')
    box.className = 'state' + (kind ? ' state-' + kind : '')
    box.innerHTML = text ? `<p>${esc(text)}</p>${retry ? '<button type="button" class="tool" data-retry>Try again</button>' : ''}` : ''
  }

  function showLogin (err) {
    $('login').hidden = false
    $('panel').hidden = true
    $('tools').hidden = true
    $('loginErr').hidden = !err
    $('loginErr').textContent = err || ''
    if (err) $('key').setAttribute('aria-invalid', 'true')
    else $('key').removeAttribute('aria-invalid')
    $('key').focus()
  }

  function badKey (msg) {
    key = ''
    try { sessionStorage.removeItem('gpAdminKey') } catch (e) {}
    showLogin(msg)
  }

  function showPanel () {
    $('login').hidden = true
    $('panel').hidden = false
    $('tools').hidden = false
  }

  // ---------- render ----------
  function renderFilters () {
    const count = (s) => (s ? orders.filter((o) => o.status === s).length : orders.length)
    $('filters').innerHTML = ['', ...STATUSES].map((s) => `
      <button type="button" class="seg-btn" data-filter="${s}" aria-pressed="${s === filter}">
        <span>${LABEL[s]}</span><span class="seg-n">${count(s)}</span>
      </button>`).join('')
  }

  function rowHtml (o) {
    const no = esc(o.orderNo)
    const addr = [esc(o.addressLine), o.area ? esc(o.area) : ''].filter(Boolean).join(', ')
    return `
      <li class="order" data-no="${no}">
        <div class="o-head">
          <p class="o-no">${no}</p>
          <span class="chip chip-${esc(o.status)}" data-chip>${esc(LABEL[o.status] || o.status)}</span>
        </div>
        <p class="o-when">${esc(when(o.createdAt))}</p>
        <div class="o-body">
          <div class="o-who">
            <p class="o-name">${esc(o.name)}</p>
            <p><a class="o-tel" href="tel:${esc(telHref(o.phone))}">${esc(o.phone)}</a></p>
            ${o.email ? `<p class="o-email">${esc(o.email)}</p>` : ''}
          </div>
          <address class="o-addr">${addr}<br>${esc(o.city)} ${esc(o.pincode)}<br><span class="o-car">Car: ${esc(o.carNumber) || '–'}</span></address>
          <dl class="o-pay">
            <div><dt>Packs</dt><dd>${esc(o.packs)} × 2</dd></div>
            <div><dt>Amount</dt><dd class="o-amt">${esc(rupees(o.amount))}</dd></div>
            <div class="o-utr"><dt>UTR</dt><dd>${esc(o.upiTxnId) || '–'}</dd></div>
          </dl>
        </div>
        <div class="o-actions">
          <button type="button" class="tool" data-shot="${no}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18"/><path d="m4 16 5-5 4 4 2-2 5 5"/><path d="M14.5 8.5h.01"/></svg>
            View screenshot
          </button>
          <button type="button" class="tool" data-copy="${no}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12"/><path d="M16 8V4H4v12h4"/></svg>
            Copy address
          </button>
          <label class="o-status">
            <span>Status</span>
            <select data-status="${no}">${STATUSES.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${LABEL[s]}</option>`).join('')}</select>
          </label>
        </div>
        <p class="o-msg" data-rowmsg role="status" aria-live="polite"></p>
      </li>`
  }

  function renderOrders (list) {
    if (Array.isArray(list)) orders = list
    renderFilters()
    const shown = filter ? orders.filter((o) => o.status === filter) : orders
    $('rows').innerHTML = shown.map(rowHtml).join('')
    if (!orders.length) setState('empty', 'No orders yet')
    else if (!shown.length) setState('empty', `No ${LABEL[filter].toLowerCase()} orders`)
    else setState('', '')
  }

  // ---------- data ----------
  async function load () {
    showPanel()
    $('rows').setAttribute('aria-busy', 'true')
    if (!orders.length) $('rows').innerHTML = ''
    setState('loading', 'Loading orders…')
    $('refresh').disabled = true
    try {
      const r = await call(API) // all orders; filtered locally so every status shows its count
      if (r.status === 401) { orders = []; $('rows').innerHTML = ''; $('filters').innerHTML = ''; setState('', ''); return badKey('Wrong admin key. Check it and try again.') }
      if (!r.ok) throw new Error(`The server answered ${r.status}.`)
      const j = await r.json()
      renderOrders((j.data && j.data.data) || [])
    } catch (err) {
      const offline = err instanceof TypeError
      setState('error', offline ? 'Could not reach the server. Check your connection.' : `Could not load orders. ${err.message}`, true)
    } finally {
      $('rows').removeAttribute('aria-busy')
      $('refresh').disabled = false
    }
  }

  const rowMsg = (li, text, kind) => {
    const p = li && li.querySelector('[data-rowmsg]')
    if (!p) return
    p.textContent = text
    p.className = 'o-msg' + (kind ? ' o-msg-' + kind : '')
  }

  // ---------- screenshot viewer ----------
  async function openShot (btn, no) {
    const li = btn.closest('.order')
    const label = btn.lastChild.textContent
    btn.disabled = true
    btn.lastChild.textContent = ' Loading…'
    rowMsg(li, '')
    try {
      const r = await call(`${API}/${encodeURIComponent(no)}/screenshot`)
      if (r.status === 401) return badKey('Your admin key stopped working. Enter it again.')
      if (!r.ok) { rowMsg(li, r.status === 404 ? 'Screenshot not found for this order.' : `Could not load the screenshot (${r.status}).`, 'error'); return }
      if (shotUrl) URL.revokeObjectURL(shotUrl)
      shotUrl = URL.createObjectURL(await r.blob())
      $('shot').src = shotUrl
      $('shot').alt = `Payment screenshot for order ${no}`
      $('shotTitle').textContent = `Payment · ${no}`
      shotReturn = btn
      $('shotBox').hidden = false
      document.body.classList.add('viewer-open')
      $('shotClose').focus()
    } catch (e) {
      rowMsg(li, 'Could not reach the server for the screenshot.', 'error')
    } finally {
      btn.disabled = false
      btn.lastChild.textContent = label
    }
  }

  function closeShot () {
    if ($('shotBox').hidden) return
    $('shotBox').hidden = true
    document.body.classList.remove('viewer-open')
    $('shot').removeAttribute('src')
    if (shotUrl) { URL.revokeObjectURL(shotUrl); shotUrl = '' }
    if (shotReturn && document.contains(shotReturn)) shotReturn.focus()
    shotReturn = null
  }

  // ---------- copy ----------
  async function copyText (text) {
    try { await navigator.clipboard.writeText(text); return true } catch (e) {}
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch (e) {}
    ta.remove()
    return ok
  }

  // ---------- events ----------
  $('rows').addEventListener('click', async (e) => {
    const shot = e.target.closest('[data-shot]')
    if (shot) return openShot(shot, shot.getAttribute('data-shot'))
    const copy = e.target.closest('[data-copy]')
    if (copy) {
      const o = find(copy.getAttribute('data-copy'))
      const li = copy.closest('.order')
      if (!o) return
      const ok = await copyText(addressText(o))
      rowMsg(li, ok ? 'Address copied.' : 'Could not copy. Select the address and copy it by hand.', ok ? 'ok' : 'error')
    }
  })

  $('rows').addEventListener('change', async (e) => {
    const sel = e.target.closest('[data-status]')
    if (!sel) return
    const no = sel.getAttribute('data-status')
    const o = find(no)
    const li = sel.closest('.order')
    const prev = o ? o.status : ''
    const next = sel.value
    sel.disabled = true
    rowMsg(li, 'Saving…')
    try {
      const r = await call(`${API}/${encodeURIComponent(no)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
      if (r.status === 401) { sel.value = prev; return badKey('Your admin key stopped working. Enter it again.') }
      if (!r.ok) throw new Error(String(r.status))
      if (o) o.status = next
      const chip = li.querySelector('[data-chip]')
      chip.className = 'chip chip-' + next
      chip.textContent = LABEL[next]
      renderFilters()
      rowMsg(li, `Saved: ${LABEL[next]}.`, 'ok')
    } catch (err) {
      sel.value = prev
      rowMsg(li, `Update failed${/^\d+$/.test(err.message) ? ' (' + err.message + ')' : ''}. Status left as ${LABEL[prev] || prev}.`, 'error')
    } finally {
      sel.disabled = false
    }
  })

  $('filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]')
    if (!b) return
    filter = b.getAttribute('data-filter')
    renderOrders()
    const again = $('filters').querySelector(`[data-filter="${filter}"]`)
    if (again) again.focus()
  })

  $('msg').addEventListener('click', (e) => { if (e.target.closest('[data-retry]')) load() })
  $('refresh').addEventListener('click', load)

  $('logout').addEventListener('click', () => {
    key = ''
    try { sessionStorage.removeItem('gpAdminKey') } catch (e) {}
    orders = []
    filter = ''
    $('rows').innerHTML = ''
    $('key').value = ''
    setState('', '')
    showLogin('')
  })

  $('loginForm').addEventListener('submit', (e) => {
    e.preventDefault()
    const v = $('key').value.trim()
    if (!v) return showLogin('Enter the admin key.')
    key = v
    try { sessionStorage.setItem('gpAdminKey', key) } catch (e2) {}
    $('loginErr').hidden = true
    $('key').removeAttribute('aria-invalid')
    load()
  })

  $('shotClose').addEventListener('click', closeShot)
  $('shotStage').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeShot() })
  document.addEventListener('keydown', (e) => {
    if ($('shotBox').hidden) return
    if (e.key === 'Escape') { e.preventDefault(); closeShot() }
    if (e.key === 'Tab') { e.preventDefault(); $('shotClose').focus() } // only one control in the viewer
  })

  // For layout checks from the console with sample rows (renders only; sends nothing).
  window.gpAdmin = { renderOrders: (list) => { showPanel(); renderOrders(list) } }

  if (key) load()
  else showLogin('')
})()
