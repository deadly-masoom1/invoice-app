'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { FileText, Users, DollarSign, TrendingUp, Plus, ArrowRight } from 'lucide-react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Dashboard() {
  const [allInvoices, setAllInvoices] = useState<any[]>([])
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [clientCount, setClientCount] = useState(0)
  const [userName, setUserName] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')

      const [{ count: cCount }, { data: invoices }] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      ])

      setClientCount(cCount || 0)
      setAllInvoices(invoices || [])
      setRecentInvoices((invoices || []).slice(0, 5))
    }
    load()
  }, [])

  // Filter invoices for selected month/year, only counted ones for "paid"
  const monthInvoices = allInvoices.filter(inv => {
    const d = new Date(inv.invoice_date)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  })

  const totalReceived = monthInvoices
    .filter(i => i.status === 'paid' && i.include_in_total !== false)
    .reduce((s, i) => s + Number(i.total), 0)

  const totalPending = monthInvoices
    .filter(i => i.status !== 'paid')
    .reduce((s, i) => s + Number(i.total), 0)

  const excludedCount = monthInvoices.filter(i => i.status === 'paid' && i.include_in_total === false).length

  const years = Array.from(new Set(allInvoices.map(i => new Date(i.invoice_date).getFullYear())))
  if (!years.includes(new Date().getFullYear())) years.push(new Date().getFullYear())
  years.sort((a, b) => b - a)

  const statCards = [
    { label: 'Total Invoices', value: allInvoices.length, icon: FileText, color: '#6366f1' },
    { label: 'Total Clients', value: clientCount, icon: Users, color: '#22c55e' },
    { label: `Received (${MONTHS[selectedMonth].slice(0,3)})`, value: `PKR ${totalReceived.toLocaleString()}`, icon: DollarSign, color: '#f59e0b' },
    { label: `Pending (${MONTHS[selectedMonth].slice(0,3)})`, value: `PKR ${totalPending.toLocaleString()}`, icon: TrendingUp, color: '#ef4444' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Hey, {userName}! 👋</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Welcome to your invoice dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} style={{ width: 'auto', fontSize: 13 }}>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={{ width: 'auto', fontSize: 13 }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {excludedCount > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: '1.5rem', fontSize: 13, color: '#f59e0b' }}>
          ⓘ {excludedCount} paid invoice{excludedCount > 1 ? 's' : ''} excluded from this total. Manage this in the Invoices page.
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent Invoices</h2>
          <Link href="/dashboard/invoices" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
            <FileText size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontSize: 14, marginBottom: '1rem' }}>No invoices yet</p>
            <Link href="/dashboard/invoices/new" className="btn btn-primary">
              <Plus size={16} /> Create First Invoice
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Invoice #', 'Client', 'Amount', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>{inv.invoice_number}</td>
                  <td style={{ padding: '12px' }}>{inv.client_name}</td>
                  <td style={{ padding: '12px', fontWeight: 500 }}>{inv.currency} {Number(inv.total).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                  <td style={{ padding: '12px', color: 'var(--muted)' }}>{new Date(inv.invoice_date).toLocaleDateString('en-PK')}</td>
                  <td style={{ padding: '12px' }}>
                    <Link href={`/dashboard/invoices/${inv.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
