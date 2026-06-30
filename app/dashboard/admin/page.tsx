'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Shield, CheckCircle, XCircle, Users } from 'lucide-react'

const ADMIN_EMAIL = 'abdullahnaseer0319@gmail.com'

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/dashboard'); return }
      const { data: profiles } = await supabase.from('admin_users').select('*')
      const { data: invoices } = await supabase.from('invoices').select('user_id')
      const invoiceCount: Record<string, number> = {}
      invoices?.forEach((inv: any) => { invoiceCount[inv.user_id] = (invoiceCount[inv.user_id] || 0) + 1 })
      const merged = profiles?.map((p: any) => ({ ...p, invoice_count: invoiceCount[p.id] || 0 })) || []
      setUsers(merged)
      setLoading(false)
    }
    load()
  }, [])

  async function togglePro(userId: string, currentStatus: boolean) {
    setUpdating(userId)
    const expiresAt = !currentStatus ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
    await supabase.from('profiles').update({
      is_pro: !currentStatus,
      pro_since: !currentStatus ? new Date().toISOString() : null,
      pro_expires_at: expiresAt
    }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_pro: !currentStatus, pro_expires_at: expiresAt } : u))
    setUpdating(null)
  }

  function daysLeft(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={20} color="var(--accent)" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Admin Panel</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>{users.length} total users</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading...</div>
      ) : users.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users size={40} style={{ color: 'var(--muted)', marginBottom: 12 }} />
          <p style={{ color: 'var(--muted)' }}>No users yet</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                {['Email', 'Name', 'Invoices', 'Status', 'Expires In', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const days = user.pro_expires_at ? daysLeft(user.pro_expires_at) : null
                const expiringSoon = days !== null && days <= 3
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>{user.email || '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>{user.full_name || '—'}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{user.invoice_count}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {user.is_pro ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.1)', color: '#4ade80', padding: '3px 10px', borderRadius: 999, fontSize: 12 }}>
                          <CheckCircle size={12} /> Pro
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(136,136,160,0.1)', color: 'var(--muted)', padding: '3px 10px', borderRadius: 999, fontSize: 12 }}>
                          <XCircle size={12} /> Free
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: expiringSoon ? '#f59e0b' : 'var(--muted)' }}>
                      {days !== null ? (
                        <span style={{ fontWeight: expiringSoon ? 600 : 400 }}>
                          {days <= 0 ? 'Expired!' : `${days} days`}
                          {expiringSoon && ' ⚠️'}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => togglePro(user.id, user.is_pro)} disabled={updating === user.id}
                        style={{
                          background: user.is_pro ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                          color: user.is_pro ? '#f87171' : '#4ade80',
                          border: `1px solid ${user.is_pro ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                          borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer',
                          fontFamily: 'inherit', opacity: updating === user.id ? 0.5 : 1
                        }}>
                        {updating === user.id ? '...' : user.is_pro ? 'Remove Pro' : 'Make Pro'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
