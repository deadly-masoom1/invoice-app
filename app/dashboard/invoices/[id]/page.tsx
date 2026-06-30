'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Printer, Trash2 } from 'lucide-react'

const CURRENCY_SYMBOLS: Record<string, string> = { PKR: 'Rs.', USD: '$', GBP: '£', EUR: '€', AED: 'AED' }
function fmt(n: number, cur: string) { return `${CURRENCY_SYMBOLS[cur] || cur} ${Number(n).toLocaleString('en-PK', { maximumFractionDigits: 0 })}` }

export default function InvoiceViewPage() {
  const { id } = useParams()
  const router = useRouter()
  const [inv, setInv] = useState<any>(null)
  const [isPro, setIsPro] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('invoices').select('*').eq('id', id).single().then(async ({ data }) => {
      setInv(data)
      if (data) {
        const { data: profile } = await supabase.from('profiles').select('is_pro').eq('id', data.user_id).single()
        if (profile?.is_pro) setIsPro(true)
      }
    })
  }, [id])

  async function deleteInvoice() {
    if (!confirm('Delete karna chahte ho?')) return
    await supabase.from('invoices').delete().eq('id', id)
    router.push('/dashboard/invoices')
  }

  function printInvoice() { window.print() }

  if (!inv) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading...</div>

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link href="/dashboard/invoices" className="btn btn-ghost"><ArrowLeft size={16} /> Back</Link>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span className={`badge badge-${inv.status}`} style={{ fontSize: 13, padding: '6px 14px' }}>{inv.status}</span>
          <button className="btn btn-ghost" onClick={printInvoice}><Printer size={16} /> Print / PDF</button>
          <button className="btn btn-danger" onClick={deleteInvoice}><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      <div ref={printRef} style={{ background: '#fff', color: '#111', borderRadius: 12, padding: '3rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: `2px solid ${inv.brand_color || '#111'}` }}>
          <div>
            {inv.logo_url ? (
              <img src={inv.logo_url} alt="Logo" style={{ height: 60, marginBottom: 12, objectFit: 'contain' }} />
            ) : (
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -2, color: inv.brand_color || '#111' }}>INVOICE</div>
            )}
            <div style={{ fontSize: 16, color: '#888', fontFamily: 'serif', direction: 'rtl', marginTop: 4 }}>بل / رسید</div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>{inv.from_name || 'Your Business'}</div>
              {inv.from_phone && <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{inv.from_phone}</div>}
              {inv.from_email && <div style={{ fontSize: 13, color: '#555' }}>{inv.from_email}</div>}
              {inv.from_address && <div style={{ fontSize: 13, color: '#555' }}>{inv.from_address}</div>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#888' }}>Invoice Number</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{inv.invoice_number}</div>
            <div style={{ marginTop: '0.75rem', fontSize: 13, color: '#555' }}>Date: {new Date(inv.invoice_date).toLocaleDateString('en-PK')}</div>
            {inv.due_date && <div style={{ fontSize: 13, color: '#555' }}>Due: {new Date(inv.due_date).toLocaleDateString('en-PK')}</div>}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', marginBottom: 6 }}>Bill To</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>{inv.client_name}</div>
          {inv.client_phone && <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{inv.client_phone}</div>}
          {inv.client_email && <div style={{ fontSize: 13, color: '#555' }}>{inv.client_email}</div>}
          {inv.client_address && <div style={{ fontSize: 13, color: '#555' }}>{inv.client_address}</div>}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: '1.5rem' }}>
          <thead>
            <tr style={{ background: inv.brand_color || '#111' }}>
              {['Description', 'Qty', 'Rate', 'Total'].map(h => (
                <th key={h} style={{ color: '#fff', padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(inv.items || []).map((item: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '11px 14px', color: '#222' }}>{item.description}</td>
                <td style={{ padding: '11px 14px', color: '#555' }}>{item.qty}</td>
                <td style={{ padding: '11px 14px', color: '#555' }}>{fmt(item.rate, inv.currency)}</td>
                <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111' }}>{fmt(item.qty * item.rate, inv.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ minWidth: 240 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', padding: '5px 0' }}><span>Subtotal</span><span>{fmt(inv.subtotal, inv.currency)}</span></div>
            {inv.tax_rate > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', padding: '5px 0' }}><span>Tax ({inv.tax_rate}%)</span><span>{fmt(inv.tax_amount, inv.currency)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800, color: '#111', borderTop: `2px solid ${inv.brand_color || '#111'}`, paddingTop: 10, marginTop: 6 }}><span>Total</span><span>{fmt(inv.total, inv.currency)}</span></div>
          </div>
        </div>

        {inv.notes && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f8f8', borderRadius: 8, fontSize: 13, color: '#555' }}>
            <strong style={{ color: '#111', display: 'block', marginBottom: 4 }}>Notes</strong>
            {inv.notes}
          </div>
        )}

        {!isPro && (
          <div style={{ marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: 12, color: '#aaa', textAlign: 'center' }}>
            Generated with InvoicePK · invoicepk.com
          </div>
        )}
      </div>
    </div>
  )
}
