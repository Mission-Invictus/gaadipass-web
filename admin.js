// GaadiPass admin: list orders, view payment screenshots, update status.
(function () {
  const API = 'https://api.missioninvictus.com/api/v1/gaadipass/admin/orders'
  const $ = (id) => document.getElementById(id)
  const STATUSES = ['submitted', 'verified', 'shipped', 'delivered', 'cancelled']
  let key = ''
  try { key = sessionStorage.getItem('gpAdminKey') || '' } catch (e) {}

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const call = (url, opts = {}) => fetch(url, { ...opts, headers: { ...(opts.headers || {}), 'x-admin-key': key } })

  async function load () {
    $('msg').textContent = 'Loading…'
    const status = $('filter').value
    const r = await call(API + (status ? `?status=${status}` : ''))
    if (r.status === 401) { $('msg').textContent = 'Wrong admin key.'; $('login').hidden = false; $('panel').hidden = true; return }
    const j = await r.json()
    const rows = (j.data && j.data.data) || []
    $('msg').textContent = `${rows.length} order(s)`
    $('rows').innerHTML = rows.map((o) => `
      <tr>
        <td><b>${esc(o.orderNo)}</b><br><small>${new Date(o.createdAt).toLocaleString('en-IN')}</small></td>
        <td>${esc(o.name)}<br><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a><br><small>${esc(o.email)}</small></td>
        <td>${esc(o.addressLine)}${o.area ? ', ' + esc(o.area) : ''}<br>${esc(o.city)} ${esc(o.pincode)}<br><small>Car: ${esc(o.carNumber) || '-'}</small></td>
        <td>${o.packs} × 2<br><b>₹${o.amount}</b><br><small>Txn: ${esc(o.upiTxnId) || '-'}</small></td>
        <td><button data-shot="${esc(o.orderNo)}">View</button></td>
        <td><select data-status="${esc(o.orderNo)}">${STATUSES.map((s) => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
      </tr>`).join('')
  }

  $('rows').addEventListener('click', async (e) => {
    const no = e.target.getAttribute('data-shot')
    if (!no) return
    const r = await call(`${API}/${encodeURIComponent(no)}/screenshot`)
    if (!r.ok) return alert('Screenshot not found')
    const url = URL.createObjectURL(await r.blob())
    $('shot').src = url
    $('shotBox').hidden = false
  })
  $('shotBox').addEventListener('click', () => { $('shotBox').hidden = true })

  $('rows').addEventListener('change', async (e) => {
    const no = e.target.getAttribute('data-status')
    if (!no) return
    const r = await call(`${API}/${encodeURIComponent(no)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: e.target.value }) })
    $('msg').textContent = r.ok ? `${no} → ${e.target.value}` : 'Update failed'
  })

  $('loginForm').addEventListener('submit', (e) => {
    e.preventDefault()
    key = $('key').value.trim()
    try { sessionStorage.setItem('gpAdminKey', key) } catch (e2) {}
    $('login').hidden = true
    $('panel').hidden = false
    load()
  })
  $('filter').addEventListener('change', load)
  $('refresh').addEventListener('click', load)

  if (key) { $('login').hidden = true; $('panel').hidden = false; load() }
})()
