'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { FileText, Users, DollarSign, TrendingUp, Plus, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ invoices: 0, clients: 0, totalPaid: 0, totalPending: 0 })
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')

      const [{ count: invCount }, { count: clientCount }, { data: invoices }] = await Promise.all([
        supabase.from('invoices').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      const totalPaid = invoices?.filter(i => i.status === 'paid').reduce((s: number, i: any) => s + i.total, 0) || 0
      const totalPending = invoices?.filter(i => i.status !== 'paid').reduce((s: number, i: any) => s + i.total, 0) || 0

      setStats({ invoices: invCount || 0, clients: clientCount || 0, totalPaid, totalPending })
      setRecentInvoices(invoices || [])
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Invoices', value: stats.invoices, icon: FileText, color: '#6366f1' },
    { label: 'Total Clients', value: stats.clients, icon: Users, color: '#22c55e' },
    { label: 'Total Received', value: `PKR ${stats.totalPaid.toLocaleString()}`, icon: DollarSign, color: '#f59e0b' },
    { label: 'Pending Amount', value: `PKR ${stats.totalPending.toLocaleString()}`, icon: TrendingUp, color: '#ef4444' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Hey, {userName}! 👋</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Aapka invoice dashboard</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
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

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent Invoices</h2>
          <Link href="/dashboard/invoices" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            Sab dekho <ArrowRight size={14} />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
            <FileText size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontSize: 14, marginBottom: '1rem' }}>Abhi koi invoice nahi hai</p>
            <Link href="/dashboard/invoices/new" className="btn btn-primary">
              <Plus size={16} /> Pehla Invoice Banao
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
