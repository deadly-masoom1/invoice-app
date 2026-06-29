'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, FileText, Search } from 'lucide-react'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('invoices').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setInvoices(data || []); setLoading(false) })
  }, [])

  const filtered = invoices.filter(inv =>
    inv.client_name.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoice_number.toLowerCase().includes(search.toLowerCase())
  )

  async function updateStatus(id: string, status: string) {
    await supabase.from('invoices').update({ status }).eq('id', id)
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Invoices</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{invoices.length} total invoices</p>
        </div>
        <Link href="/dashboard/invoices/new" className="btn btn-primary"><Plus size={16} /> New Invoice</Link>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
        <input placeholder="Invoice ya client search karo..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FileText size={40} style={{ color: 'var(--muted)', marginBottom: 12 }} />
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Koi invoice nahi mila</p>
          <Link href="/dashboard/invoices/new" className="btn btn-primary"><Plus size={16} /> Invoice Banao</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                {['Invoice #', 'Client', 'Amount', 'Status', 'Date', 'Due Date', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--accent)' }}>{inv.invoice_number}</td>
                  <td style={{ padding: '14px 16px' }}>{inv.client_name}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{inv.currency} {Number(inv.total).toLocaleString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value)}
                      style={{ width: 'auto', padding: '4px 8px', fontSize: 12, borderRadius: 6 }}>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                    </select>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{new Date(inv.invoice_date).toLocaleDateString('en-PK')}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-PK') : '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={`/dashboard/invoices/${inv.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13, marginRight: 12 }}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
