'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type InvoiceItem } from '@/lib/supabase'
import { Plus, Trash2, Save } from 'lucide-react'

const CURRENCIES = ['PKR', 'USD', 'GBP', 'EUR', 'AED']
const CURRENCY_SYMBOLS: Record<string, string> = { PKR: 'Rs.', USD: '$', GBP: '£', EUR: '€', AED: 'AED' }

function fmt(n: number, cur: string) {
  return `${CURRENCY_SYMBOLS[cur] || cur} ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [userInfo, setUserInfo] = useState({ from_name: '', from_email: '', from_phone: '', from_address: '' })
  const [invoice, setInvoice] = useState({
    invoice_number: 'INV-001',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    currency: 'PKR',
    tax_rate: 0,
    notes: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
  })
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', qty: 1, rate: 0, total: 0 }])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserInfo({ from_name: user.user_metadata?.full_name || '', from_email: user.email || '', from_phone: '', from_address: '' })
      }
      const { data } = await supabase.from('clients').select('*').order('name')
      setClients(data || [])
      const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true })
      setInvoice(prev => ({ ...prev, invoice_number: `INV-${String((count || 0) + 1).padStart(3, '0')}` }))
    }
    load()
  }, [])

  function updateItem(i: number, field: keyof InvoiceItem, val: string | number) {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item
      const updated = { ...item, [field]: val }
      updated.total = updated.qty * updated.rate
      return updated
    }))
  }

  function fillClient(id: string) {
    const c = clients.find(c => c.id === id)
    if (c) setInvoice(prev => ({ ...prev, client_name: c.name, client_email: c.email || '', client_phone: c.phone || '', client_address: c.address || '' }))
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0)
  const taxAmount = subtotal * invoice.tax_rate / 100
  const total = subtotal + taxAmount

  async function saveInvoice() {
    if (!invoice.client_name) return alert('Client name is required')
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('invoices').insert({
      ...invoice,
      ...userInfo,
      user_id: user!.id,
      items,
      subtotal,
      tax_amount: taxAmount,
      total,
    }).select().single()
    if (!error && data) router.push(`/dashboard/invoices/${data.id}`)
    else { alert('Error: ' + error?.message); setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>New Invoice</h1>
        <button className="btn btn-primary" onClick={saveInvoice} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="card">
          <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Details</h2>
          {[['from_name','Your Naam','Ahmed Ali'],['from_email','Email','ahmed@example.com'],['from_phone','Phone','0300-1234567'],['from_address','Address','Gujranwala, Punjab']].map(([k,l,p]) => (
            <div key={k} style={{ marginBottom: '0.75rem' }}>
              <label>{l}</label>
              <input value={(userInfo as any)[k]} onChange={e => setUserInfo(prev => ({ ...prev, [k]: e.target.value }))} placeholder={p} />
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client Details</h2>
          {clients.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <label>Fill it using saved clients.</label>
              <select onChange={e => fillClient(e.target.value)} defaultValue="">
                <option value="">— Select Client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          {[['client_name','Client Name *','Wales Traders'],['client_email','Email','client@example.com'],['client_phone','Phone','+44 7911 123456'],['client_address','Address','London, England (UK)']].map(([k,l,p]) => (
            <div key={k} style={{ marginBottom: '0.75rem' }}>
              <label>{l}</label>
              <input value={(invoice as any)[k]} onChange={e => setInvoice(prev => ({ ...prev, [k]: e.target.value }))} placeholder={p} />
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div><label>Invoice #</label><input value={invoice.invoice_number} onChange={e => setInvoice(p => ({ ...p, invoice_number: e.target.value }))} /></div>
          <div><label>Date</label><input type="date" value={invoice.invoice_date} onChange={e => setInvoice(p => ({ ...p, invoice_date: e.target.value }))} /></div>
          <div><label>Due Date</label><input type="date" value={invoice.due_date} onChange={e => setInvoice(p => ({ ...p, due_date: e.target.value }))} /></div>
          <div><label>Currency</label>
            <select value={invoice.currency} onChange={e => setInvoice(p => ({ ...p, currency: e.target.value }))}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label>Tax %</label><input type="number" value={invoice.tax_rate} onChange={e => setInvoice(p => ({ ...p, tax_rate: parseFloat(e.target.value) || 0 }))} min="0" max="100" /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items / Services</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Description', 'Qty', 'Rate', 'Total', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px', color: 'var(--muted)', fontSize: 12, fontWeight: 500 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px', width: '45%' }}><input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Service or product" /></td>
                <td style={{ padding: '8px', width: '12%' }}><input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', parseFloat(e.target.value) || 0)} min="1" /></td>
                <td style={{ padding: '8px', width: '20%' }}><input type="number" value={item.rate} onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)} min="0" /></td>
                <td style={{ padding: '8px', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(item.qty * item.rate, invoice.currency)}</td>
                <td style={{ padding: '8px' }}>
                  <button onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }} disabled={items.length === 1}>
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-ghost" style={{ marginTop: '0.75rem' }} onClick={() => setItems(prev => [...prev, { description: '', qty: 1, rate: 0, total: 0 }])}>
          <Plus size={15} /> Add an item.
        </button>
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ minWidth: 220 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}><span>Subtotal</span><span>{fmt(subtotal, invoice.currency)}</span></div>
            {invoice.tax_rate > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}><span>Tax ({invoice.tax_rate}%)</span><span>{fmt(taxAmount, invoice.currency)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: 10 }}><span>Total</span><span style={{ color: 'var(--accent)' }}>{fmt(total, invoice.currency)}</span></div>
          </div>
        </div>
      </div>

      <div className="card">
        <label>Notes (optional)</label>
        <textarea value={invoice.notes} onChange={e => setInvoice(p => ({ ...p, notes: e.target.value }))} placeholder="Payment instructions, bank details..." style={{ height: 80 }} />
      </div>
    </div>
  )
}
