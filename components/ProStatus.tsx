'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Crown, AlertTriangle } from 'lucide-react'

export default function ProStatus() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('is_pro, pro_expires_at').eq('id', user.id).single()
      if (data) setProfile(data)
    }
    load()
  }, [])

  if (!profile) return null

  function daysLeft() {
    if (!profile.pro_expires_at) return null
    const diff = new Date(profile.pro_expires_at).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const days = daysLeft()
  const expiringSoon = days !== null && days <= 3

  if (!profile.is_pro) return (
    <div style={{ margin: '0 1rem 0.5rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Free Plan</div>
      <a href="/dashboard/invoices/new" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
        Upgrade to Pro →
      </a>
    </div>
  )

  return (
    <div style={{ margin: '0 1rem 0.5rem', background: expiringSoon ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${expiringSoon ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)'}`, borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        {expiringSoon ? <AlertTriangle size={12} color="#f59e0b" /> : <Crown size={12} color="#4ade80" />}
        <span style={{ fontSize: 12, fontWeight: 600, color: expiringSoon ? '#f59e0b' : '#4ade80' }}>Pro Plan</span>
      </div>
      {days !== null && (
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          {days <= 0 ? '❌ Expired' : expiringSoon ? `⚠️ Expires in ${days} days` : `✓ ${days} days remaining`}
        </div>
      )}
    </div>
  )
}
