'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      })
      if (error) setError(error.message)
      else setMessage('Account created successfully! You can now login.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Wrong Email or password!')
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>InvoicePK</div>
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>Professional Invoice Generator</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', marginBottom: '1.5rem', background: 'var(--surface2)', borderRadius: 8, padding: 4 }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} className="btn" style={{
                flex: 1, justifyContent: 'center', padding: '8px',
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--muted)',
                border: 'none', borderRadius: 6,
              }}>
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: '1rem' }}>
                <label>Your Name</label>
                <input type="text" placeholder="Ahmed Ali" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label>Email</label>
              <input type="email" placeholder="ahmed@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: '1rem' }}>{error}</div>}
            {message && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#4ade80', marginBottom: '1rem' }}>{message}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
