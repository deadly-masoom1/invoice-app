'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LayoutDashboard, FileText, Users, LogOut, Plus } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <aside style={{ width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>InvoicePK</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Invoice Generator</div>
      </div>

      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
        <Link href="/dashboard/invoices/new" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <Plus size={16} /> New Invoice
        </Link>
      </div>

      <nav style={{ flex: 1, padding: '0.75rem' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
              color: active ? 'var(--text)' : 'var(--muted)',
              background: active ? 'var(--surface2)' : 'transparent',
              textDecoration: 'none', fontSize: 14, fontWeight: active ? 500 : 400,
              marginBottom: 2, transition: 'all 0.15s',
            }}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  )
}
