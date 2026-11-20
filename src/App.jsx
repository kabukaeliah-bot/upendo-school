import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
export default function App() {
  const [page, setPage] = useState('home')
  const [students, setStudents] = useState([])
 const [matangazo, setMatangazo] = useState([]);
const [title, setTitle] = useState("");
const [message, setMessage] = useState("");
  const [payments, setPayments] = useState([])
  const [structures, setStructures] = useState([])
  const [invoices, setInvoices] = useState([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [tab, setTab] = useState('malipo')
  const [viewAsHead, setViewAsHead] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newClass, setNewClass] = useState('')
  const [hmEmail, setHmEmail] = useState('')
  const [hmPass, setHmPass] = useState('')
  const [hmUser, setHmUser] = useState(null)
  const [hmMsg, setHmMsg] = useState('')
  const [acEmail, setAcEmail] = useState('')
  const [acPass, setAcPass] = useState('')
  const [acUser, setAcUser] = useState(null)
  const [acMsg, setAcMsg] = useState('')
  async function headmasterLogin(e) { e.preventDefault(); setHmMsg('Inaingia...'); const { data, error } = await supabase.auth.signInWithPassword({ email: hmEmail, password: hmPass }); if (error) setHmMsg('Imeshindwa: ' + error.message); else { setHmUser(data.user); setHmMsg('') } }
  async function headmasterLogout() { await supabase.auth.signOut(); setHmUser(null); setViewAsHead(false); setPage('home') }
  async function accountantLogin(e) { e.preventDefault(); setAcMsg('Inaingia...'); const { data, error } = await supabase.auth.signInWithPassword({ email: acEmail, password: acPass }); if (error) setAcMsg('Imeshindwa: ' + error.message); else { setAcUser(data.user); setAcMsg('') } }
  async function accountantLogout() { await supabase.auth.signOut(); setAcUser(null); setPage('home') }
  async function loadAll() {
    const s = await supabase.from('students').select('*').order('id', { ascending: false }); if (s.data) setStudents(s.data)
    const p = await supabase.from('fee_payments').select('*').order('id', { ascending: false }); if (p.data) setPayments(p.data)
    const st = await supabase.from('fee_structures').select('*').order('id', { ascending: false }); if (st.data) setStructures(st.data)
    const inv = await supabase.from('fee_invoices').select('*').order('id', { ascending: false }); if (inv.data) setInvoices(inv.data)
  }
  useEffect(() => { loadAll(); supabase.from('matangazo').select('*').order('created_at', { ascending: false }).then(({data}) => { if(data) setMatangazo(data); }); }, []);
  async function addStudent(e) {
    e.preventDefault(); if (!newFirst || !newLast) return alert('Jaza Jina la Kwanza na la Mwisho')
    const { error } = await supabase.from('students').insert([{ first_name: newFirst, last_name: newLast, class_name: newClass || 'Darasa 1', class: newClass || 'Darasa 1' }])
    if (error) alert('Imeshindwa: ' + error.message); else { alert(newFirst + ' ' + newLast + ' amesavewa!'); setNewFirst(''); setNewLast(''); setNewClass(''); loadAll() }
  }
  async function addPayment(e) {
    e.preventDefault(); if (!name || !amount) return alert('Jaza jina na kiasi')
    const found = students.find(s => (`${s.first_name || ''} ${s.last_name || ''}`).toLowerCase().includes(name.toLowerCase()))
    const today = new Date().toISOString().slice(0, 10)
    const { error } = await supabase.from('fee_payments').insert([{ student_id: found ? found.id : null, student_name: name, amount: Number(amount), payment_date: today, paid_date: today, payment_method: 'Cash', received_by: 'Accountant', notes: 'Malipo kutoka App', payment_reference: 'PAY-' + Date.now() }])
    if (error) alert('Imeshindwa: ' + error.message); else { alert('Malipo yamerekodiwa!'); setName(''); setAmount(''); loadAll() }
  }
  async function deletePayment(id, n) { if (!confirm('Ufute malipo ya ' + n + ' ?')) return; const { error } = await supabase.from('fee_payments').delete().eq('id', id); if (error) alert(error.message); else { alert('Malipo yamefutwa'); loadAll() } }
  async function deleteStudentCompletely(student) {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`; if (!confirm('UNA UHAKIKA? Kumfuta kabisa ' + fullName + ' ?')) return
    await supabase.from('fee_payments').delete().eq('student_id', student.id); await supabase.from('fee_payments').delete().eq('student_name', fullName)
    await supabase.from('fee_invoices').delete().eq('student_id', student.id); await supabase.from('fee_invoices').delete().eq('student_name', fullName)
    const { error } = await supabase.from('students').delete().eq('id', student.id); if (error) alert(error.message); else { alert(fullName + ' amefutwa kabisa!'); loadAll() }
  }
  async function deleteInvoice(id, n) { if (!confirm('Ufute deni la ' + n + ' ?')) return; const { error } = await supabase.from('fee_invoices').delete().eq('id', id); if (error) alert(error.message); else { alert('Deni limefutwa'); loadAll() } }
  function printInvoice(type, item) {
    const studentName = item.student_name || 'Mwanafunzi'; const kiasi = Number(item.amount || 0).toLocaleString(); const tarehe = item.payment_date || item.paid_date || new Date().toISOString().slice(0, 10); const namba = item.payment_reference || item.id; const isReceipt = type === 'risiti'; const title = isReceipt ? 'RISITI YA MALIPO' : 'INVOICE YA ADA'
    const w = window.open('', '_blank', 'width=600,height=700'); w.document.write('<html><head><title>' + title + '</title><style>body{font-family:Arial;padding:30px}h1{color:#16a34a;text-align:center}.t{background:#16a34a;color:white;padding:12px;text-align:center;border-radius:10px}.total{background:#f0fdf4;padding:15px;text-align:right;font-size:22px;font-weight:bold;color:#16a34a}</style></head><body><h1>Upendo School</h1><div class="t">' + title + '</div><p><b>Jina:</b> ' + studentName + '</p><p><b>Namba:</b> ' + namba + '</p><p><b>Tarehe:</b> ' + tarehe + '</p><p><b>Status:</b> ' + (isReceipt ? 'AMELIPA' : (item.status || 'Hajalipa')) + '</p><div class="total">Jumla: Tsh ' + kiasi + '</div><div style="text-align:center;margin-top:20px"><button onclick="window.print()">Print Sasa</button></div></body></html>'); w.document.close()
  }
  function printList(listType) {
    setMenuOpen(false); let title = ''; let rows = ''; let total = 0; let tarehe = new Date().toISOString().slice(0, 10)
    if (listType === 'malipo') { title = 'ORODHA YA MALIPO YOTE'; total = payments.reduce((s, f) => s + Number(f.amount || 0), 0); rows = payments.map((f, i) => '<tr><td>' + (i + 1) + '</td><td>' + (f.student_name || '') + '</td><td>' + (f.payment_date || '') + '</td><td>Tsh ' + Number(f.amount || 0).toLocaleString() + '</td></tr>').join('') }
    if (listType === 'muundo') { title = 'MUUNDO WA ADA'; total = structures.reduce((s, f) => s + Number(f.amount || 0), 0); rows = structures.map((f, i) => '<tr><td>' + (i + 1) + '</td><td>' + (f.class_name || f.name || '') + '</td><td>-</td><td>Tsh ' + Number(f.amount || 0).toLocaleString() + '</td></tr>').join('') }
    if (listType === 'madeni') { title = 'ORODHA YA MADENI'; total = invoices.reduce((s, f) => s + Number(f.amount || 0), 0); rows = invoices.map((f, i) => '<tr><td>' + (i + 1) + '</td><td>' + (f.student_name || '') + '</td><td>' + (f.status || '') + '</td><td>Tsh ' + Number(f.amount || 0).toLocaleString() + '</td></tr>').join('') }
    if (listType === 'wanafunzi') { title = 'ORODHA YA WANAFUNZI'; rows = students.map((f, i) => '<tr><td>' + (i + 1) + '</td><td>' + (f.first_name || '') + ' ' + (f.last_name || '') + '</td><td>' + (f.class_name || '') + '</td><td>-</td></tr>').join('') }
    const w = window.open('', '_blank', 'width=700,height=800'); w.document.write('<html><head><title>' + title + '</title><style>body{font-family:Arial;padding:30px}table{width:100%;border-collapse:collapse}th{background:#16a34a;color:white;padding:10px;text-align:left}td{padding:10px;border-bottom:1px solid #ddd}</style></head><body><h1 style="text-align:center;color:#16a34a">Upendo School</h1><p style="text-align:center">Tarehe: ' + tarehe + '</p><h2 style="text-align:center">' + title + '</h2><table><tr><th>#</th><th>Jina</th><th>Tarehe</th><th>Kiasi</th></tr>' + rows + '</table><h3 style="text-align:right">Jumla: Tsh ' + total.toLocaleString() + '</h3><div style="text-align:center"><button onclick="window.print()">Print Sasa</button></div></body></html>'); w.document.close()
  }
  function openMenuTab(t) { setTab(t); setSearch(''); setMenuOpen(false) }
  const roles = [
    { name: 'Headmaster', desc: 'Angalia kila kitu', color: '#2563eb', icon: '👨🏾‍💼' },
    { name: 'Accountant', desc: 'Ada, Malipo na Mahesabu', color: '#16a34a', icon: '🧾' },
    { name: 'Teachers', desc: 'Walimu na Masomo', color: '#dc2626', icon: '👩🏾‍🏫' },
    { name: 'Pupils', desc: 'Wanafunzi', color: '#db2777', icon: '🧒🏾' },
    { name: 'Academic', desc: 'Mitihani na Matokeo', color: '#2563eb', icon: '📚' },
    { name: 'Teacher on Duty', desc: 'Mwalimu wa zamu leo', color: '#dc2626', icon: '🔔' },
    { name: 'Parents', desc: 'Ada ya mtoto wako', color: '#0284c7', icon: '👨‍👩‍👧' },
  ]
  function goToPage(roleName) { if (roleName === 'Accountant') setViewAsHead(false); setPage(roleName) }
  if (page === 'Headmaster') {
    if (!hmUser) {
      return (<div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 400, margin: '0 auto', textAlign: 'center' }}><button onClick={() => setPage('home')} style={{ padding: '10px 20px', borderRadius: 20, border: 'none', background: '#eee', cursor: 'pointer' }}>← Rudi Menu</button><h1>👨🏾‍💼 Headmaster</h1><form onSubmit={headmasterLogin} style={{ background: 'white', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 12 }}><input value={hmEmail} onChange={e => setHmEmail(e.target.value)} placeholder="Email ya Headmaster" type="email" style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }} /><input value={hmPass} onChange={e => setHmPass(e.target.value)} placeholder="Password" type="password" style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }} /><button style={{ background: '#2563eb', color: 'white', padding: 12, border: 'none', borderRadius: 10 }}>Ingia</button>{hmMsg && <p style={{ color: 'red' }}>{hmMsg}</p>}</form></div>)
    }
    const total = payments.reduce((sum, f) => sum + Number(f.amount || 0), 0)
    return (<div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 650, margin: '0 auto' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><button onClick={() => setPage('home')} style={{ padding: '10px 20px', borderRadius: 20, border: 'none', background: '#eee' }}>← Rudi Menu</button><button onClick={headmasterLogout} style={{ padding: '10px 20px', borderRadius: 20, border: 'none', background: '#dc2626', color: 'white' }}>Toka</button></div><h1>👨🏾‍💼 Karibu Headmaster</h1><p>Umeingia kama: <b>{hmUser.email}</b></p><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div style={{ background: 'white', padding: 20, borderRadius: 15 }}><h2>{students.length}</h2><p>Wanafunzi</p></div><div style={{ background: 'white', padding: 20, borderRadius: 15 }}><h2>Tsh {total.toLocaleString()}</h2><p>Jumla ya Ada</p></div><div style={{ background: 'white', padding: 20, borderRadius: 15 }}><h2>{payments.length}</h2><p>Malipo</p></div><div style={{ background: 'white', padding: 20, borderRadius: 15 }}><h2>{invoices.length}</h2><p>Madeni</p></div></div><button onClick={() => { setViewAsHead(true); setPage('Accountant') }} style={{ width: '100%', marginTop: 15, padding: 14, borderRadius: 10, border: 'none', background: '#16a34a', color: 'white' }}>Angalia Accountant →</button></div>)
  }
  if (page === 'Accountant') {
    if (!viewAsHead && !acUser) {
      return (<div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 400, margin: '0 auto', textAlign: 'center' }}><button onClick={() => setPage('home')} style={{ padding: '10px 20px', borderRadius: 20, border: 'none', background: '#eee' }}>← Rudi Menu</button><h1>🧾 Accountant</h1><form onSubmit={accountantLogin} style={{ background: 'white', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 12 }}><input value={acEmail} onChange={e => setAcEmail(e.target.value)} placeholder="Email ya Accountant" type="email" style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }} /><input value={acPass} onChange={e => setAcPass(e.target.value)} placeholder="Password" type="password" style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }} /><button style={{ background: '#16a34a', color: 'white', padding: 12, border: 'none', borderRadius: 10 }}>Ingia</button>{acMsg && <p style={{ color: 'red' }}>{acMsg}</p>}<p style={{ fontSize: 12, color: '#666' }}>Jaribu: Kabukaeliah@gmail.com</p></form></div>)
    }
    const total = payments.reduce((sum, f) => sum + Number(f.amount || 0), 0)
    const filteredPayments = payments.filter(f => (f.student_name || '').toLowerCase().includes(search.toLowerCase()))
    const filteredInvoices = invoices.filter(f => (f.student_name || '').toLowerCase().includes(search.toLowerCase()))
    const filteredStudents = students.filter(s => `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase().includes(search.toLowerCase()))
    const filteredStructures = structures.filter(s => `${s.class_name || s.name || ''}`.toLowerCase().includes(search.toLowerCase()))
    return (
      <div style={{ padding: 0, fontFamily: 'sans-serif', maxWidth: 650, margin: '0 auto' }}>
        <div style={{ background: '#16a34a', color: 'white', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setMenuOpen(true)} style={{ background: 'white', color: '#16a34a', border: 'none', fontSize: 22, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>☰</button>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 'bold', fontSize: 18 }}>🧾 Accountant</div><div style={{ fontSize: 12 }}>{tab === 'malipo' ? 'Malipo' : tab === 'muundo' ? 'Muundo wa Ada' : tab === 'madeni' ? 'Madeni' : 'Wanafunzi'}</div></div>
          <button onClick={() => { if (viewAsHead) setPage('Headmaster'); else setPage('home') }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 20 }}>← Rudi</button>
        </div>
        {menuOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={() => setMenuOpen(false)}>
            <div style={{ background: 'white', width: '85%', maxWidth: 320, height: '100vh', padding: 16, boxSizing: 'border-box', overflowY: 'auto', paddingBottom: 40 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><h2 style={{ margin: 0, fontSize: 20 }}>☰ Menu</h2><button onClick={() => setMenuOpen(false)} style={{ background: '#eee', border: 'none', padding: '8px 12px', borderRadius: 20 }}>✕ Funga</button></div>
              <div style={{ background: '#f0fdf4', padding: 10, borderRadius: 12, marginBottom: 12 }}><b>🧾 Accountant</b><br /><small>{!viewAsHead && acUser ? acUser.email : 'Headmaster - Kuona tu'}</small><br /><small style={{ color: 'green', fontWeight: 'bold' }}>Jumla: Tsh {total.toLocaleString()}</small></div>
              <p style={{ fontSize: 12, color: '#999' }}>ANGALIA</p>
              <button onClick={() => openMenuTab('malipo')} style={{ width: '100%', textAlign: 'left', padding: 12, marginBottom: 6, borderRadius: 12, border: '1px solid #ddd', background: 'white' }}>💰 1. Malipo →</button>
              <button onClick={() => openMenuTab('muundo')} style={{ width: '100%', textAlign: 'left', padding: 12, marginBottom: 6, borderRadius: 12, border: '1px solid #ddd', background: 'white' }}>📋 2. Muundo wa Ada →</button>
              <button onClick={() => openMenuTab('madeni')} style={{ width: '100%', textAlign: 'left', padding: 12, marginBottom: 6, borderRadius: 12, border: '1px solid #ddd', background: 'white' }}>🧾 3. Madeni →</button>
              <button onClick={() => openMenuTab('wanafunzi')} style={{ width: '100%', textAlign: 'left', padding: 12, marginBottom: 6, borderRadius: 12, border: '1px solid #ddd', background: 'white' }}>🧒🏾 4. Wanafunzi →</button>
              <p style={{ fontSize: 12, color: '#999', marginTop: 14 }}>🖨️ PRINT - NDANI YA MENU</p>
              <button onClick={() => printList('malipo')} style={{ width: '100%', textAlign: 'left', padding: 12, marginBottom: 6, borderRadius: 12, border: '1px solid #2563eb', background: '#eff6ff' }}>🖨️ Print Malipo Yote</button>
              <button onClick={() => printList('madeni')} style={{ width: '100%', textAlign: 'left', padding: 12, marginBottom: 6, borderRadius: 12, border: '1px solid #2563eb', background: '#eff6ff' }}>🖨️ Print Madeni Yote</button>
              <button onClick={() => printList('muundo')} style={{ width: '100%', textAlign: 'left', padding: 12, marginBottom: 6, borderRadius: 12, border: '1px solid #2563eb', background: '#eff6ff' }}>🖨️ Print Muundo Wote</button>
              <button onClick={() => printList('wanafunzi')} style={{ width: '100%', textAlign: 'left', padding: 12, marginBottom: 6, borderRadius: 12, border: '1px solid #2563eb', background: '#eff6ff' }}>🖨️ Print Wanafunzi Wote</button>
              <hr /><button onClick={() => { setMenuOpen(false); setPage('home') }} style={{ width: '100%', textAlign: 'left', padding: 12, marginBottom: 6, borderRadius: 12, border: '1px solid #ddd', background: '#eef6ff' }}>🏠 Rudi Menu Kuu</button>
              {!viewAsHead && <button onClick={accountantLogout} style={{ width: '100%', textAlign: 'left', padding: 12, borderRadius: 12, border: 'none', background: '#dc2626', color: 'white' }}>🚪 Toka / Logout</button>}
            </div>
          </div>
        )}
        <div style={{ padding: 20 }}>
          {viewAsHead && <div style={{ background: '#fef3c7', padding: 12, borderRadius: 10, marginBottom: 10 }}><b>👁️ Unaangalia kama Headmaster - Unaona tu</b></div>}
          <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: 12, padding: 8, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}><span style={{ fontSize: 20 }}>🔍</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Tafuta jina..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, padding: 8 }} />{search && <button onClick={() => setSearch('')} style={{ background: '#eee', border: 'none', padding: '6px 10px', borderRadius: 20 }}>✕</button>}</div>
          <h2 style={{ color: 'green' }}>Jumla: Tsh {total.toLocaleString()}</h2>
          {tab === 'malipo' && (<div>{!viewAsHead && (<form onSubmit={addPayment} style={{ background: '#f0fdf4', padding: 15, borderRadius: 15, display: 'flex', flexDirection: 'column', gap: 10 }}><h3>Rekodi Malipo Mpya</h3><input value={name} onChange={e => setName(e.target.value)} placeholder="Jina la mwanafunzi" style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }} /><input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Kiasi - mf 50000" style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }} /><button style={{ background: '#16a34a', color: 'white', padding: 12, border: 'none', borderRadius: 10 }}>Rekodi Malipo</button></form>)}<h3>Malipo ({filteredPayments.length})</h3>{filteredPayments.map(f => (<div key={f.id} style={{ background: 'white', border: '1px solid #ddd', padding: 12, borderRadius: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span><b>{f.student_name}</b><br /><small>{f.payment_date || ''}</small><br /><b style={{ color: 'green' }}>Tsh {Number(f.amount || 0).toLocaleString()}</b></span><span style={{ display: 'flex', gap: 6, flexDirection: 'column' }}><button onClick={() => printInvoice('risiti', f)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 8 }}>🖨️ Print Risiti</button>{!viewAsHead && <button onClick={() => deletePayment(f.id, f.student_name)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 8 }}>🗑️ Futa</button>}</span></div>))}</div>)}
          {tab === 'muundo' && (<div><h3>Muundo wa Ada ({filteredStructures.length})</h3>{filteredStructures.map(s => (<div key={s.id} style={{ background: 'white', border: '1px solid #ddd', padding: 12, borderRadius: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}><b>{s.class_name || s.name}</b><b>Tsh {Number(s.amount || 0).toLocaleString()}</b></div>))}</div>)}
          {tab === 'madeni' && (<div><h3>Madeni ({filteredInvoices.length})</h3>{filteredInvoices.map(inv => (<div key={inv.id} style={{ background: 'white', border: '1px solid #ddd', padding: 12, borderRadius: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span><b>{inv.student_name}</b><br /><small>{inv.status || ''}</small><br /><b style={{ color: 'red' }}>Tsh {Number(inv.amount || 0).toLocaleString()}</b></span><span style={{ display: 'flex', gap: 6, flexDirection: 'column' }}><button onClick={() => printInvoice('invoice', inv)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 8 }}>🖨️ Print Invoice</button>{!viewAsHead && <button onClick={() => deleteInvoice(inv.id, inv.student_name)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 8 }}>🗑️ Futa</button>}</span></div>))}</div>)}
          {tab === 'wanafunzi' && (<div>{!viewAsHead && (<form onSubmit={addStudent} style={{ background: '#eef6ff', padding: 15, borderRadius: 15, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 15, border: '2px solid #2563eb' }}><h3 style={{ margin: 0 }}>➕ Ongeza Mwanafunzi Mpya - Save Hapa</h3><input value={newFirst} onChange={e => setNewFirst(e.target.value)} placeholder="Jina la Kwanza - mf Salha" style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }} /><input value={newLast} onChange={e => setNewLast(e.target.value)} placeholder="Jina la Mwisho - mf Juma" style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }} /><input value={newClass} onChange={e => setNewClass(e.target.value)} placeholder="Darasa - mf Darasa 1" style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }} /><button style={{ background: '#2563eb', color: 'white', padding: 12, border: 'none', borderRadius: 10, fontWeight: 'bold' }}>💾 Save Mwanafunzi</button></form>)}<h3>Wanafunzi ({filteredStudents.length})</h3>{filteredStudents.map(s => (<div key={s.id} style={{ background: 'white', border: '1px solid #ddd', padding: 12, borderRadius: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span><b>{s.first_name} {s.last_name}</b><br /><small>{s.class_name || ''}</small></span>{!viewAsHead && <button onClick={() => deleteStudentCompletely(s)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 8 }}>🗑️ Futa Kabisa</button>}</div>))}</div>)}
        </div>
      </div>
    )
  }
  if (page === 'Pupils') { return (<div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}><button onClick={() => setPage('home')} style={{ padding: '10px 20px', borderRadius: 20, border: 'none', background: '#eee' }}>← Rudi</button><h1>🧒🏾 Pupils ({students.length})</h1>{students.map(s => (<div key={s.id} style={{ padding: 12, background: 'white', border: '1px solid #ddd', borderRadius: 10, marginBottom: 8 }}>{s.first_name} {s.last_name}</div>))}</div>) }
  if (page !== 'home') { return (<div style={{ padding: 20, fontFamily: 'sans-serif' }}><button onClick={() => setPage('home')} style={{ padding: '10px 20px', borderRadius: 20, border: 'none', background: '#eee' }}>← Rudi Menu</button><h1>{page}</h1><p>Ukurasa wa {page} - bado tunautengeneza.</p></div>) }
  return (
    <div style={{ minHeight: '100vh', background: '#eef6ff', padding: 20, fontFamily: 'sans-serif', textAlign: 'center' }}>
<img src="/logo.png" alt="Upendo School Logo" style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: 620, height: 'auto', borderRadius: 15, background: 'white', padding: 10 }} />      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, maxWidth: 700, margin: '0 auto' }}>
  <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
  <h2>📢 Matangazo</h2>
  {matangazo.length === 0 ? <p>Hakuna tangazo jipya sasa.</p> : matangazo.map(m => (
    <div key={m.id} style={{ background: 'white', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
      <b>{m.title}</b><p>{m.message}</p>
    </div>
  ))}
  <input style={{ width: '100%', padding: '8px', marginTop: '8px' }} placeholder="Kichwa cha tangazo" value={title} onChange={e => setTitle(e.target.value)} />
  <input style={{ width: '100%', padding: '8px', marginTop: '5px' }} placeholder="Andika tangazo..." value={message} onChange={e => setMessage(e.target.value)} />
  <button onClick={async () => { await supabase.from('matangazo').insert([{ title, message }]); setTitle(""); setMessage(""); window.location.reload(); }} style={{ marginTop: '8px', background: '#ffc107', padding: '8px 15px', border: 'none', borderRadius: '8px' }}>Tuma Tangazo</button>
</div>
{viewAsHead && (
  <div style={{ background: '#e0f2fe', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '2px solid #0284c7' }}>
    <h2>👨‍💼 Dashboard ya Headmaster</h2>
    <p>1. Wanafunzi: {students.length}</p>
    <p>2. Ada: Headmaster anaona nani amelipa / ana deni</p>
    <p>3. Matangazo: {matangazo.length} - likiwemo la Graduation 28/11/2026</p>
    <p>4. Results / Matokeo:</p>
    {students.slice(0, 5).map((s, i) => (
      <p key={i}>- {s.name || s.full_name} | {s.class_name || '-'} | {s.average || 'Bado'}</p>
    ))}
  </div>
)}
        {roles.map(r => (<div key={r.name} onClick={() => goToPage(r.name)} style={{ background: 'white', padding: 20, borderRadius: 20, cursor: 'pointer' }}><div style={{ fontSize: 40 }}>{r.icon}</div><h3>{r.name}</h3><p style={{ fontSize: 13, color: '#666' }}>{r.desc}</p><button style={{ background: r.color, color: 'white', border: 'none', padding: '8px 20px', borderRadius: 20 }}>Ingia</button></div>))}
      </div>
    </div>
  )
}