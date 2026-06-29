'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Users } from 'lucide-react'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addClient(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('clients').insert({ ...form, user_id: user!.id })
    setForm({ name: '', email: '', phone: '', address: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function deleteClient(id: string) {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    await supabase.from('clients').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Clients</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{clients.length} clients registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add a New Client
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: '1rem' }}>New Client</h2>
          <form onSubmit={addClient}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><label>Naam *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Wales Traders" /></div>
              <div><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+44 7911 123456" /></div>
              <div><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="client@example.com" /></div>
              <div><label>Address</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="London, England(UK)" /></div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save it'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading...</div>
      ) : clients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users size={40} style={{ color: 'var(--muted)', marginBottom: 12 }} />
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>There are no clients right now.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} />Add the first client.</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {clients.map(client => (
            <div key={client.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, color: '#fff', flexShrink: 0 }}>
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <button onClick={() => deleteClient(client.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}>
                  <Trash2 size={15} />
                </button>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{client.name}</div>
                {client.phone && <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{client.phone}</div>}
                {client.email && <div style={{ color: 'var(--muted)', fontSize: 13 }}>{client.email}</div>}
                {client.address && <div style={{ color: 'var(--muted)', fontSize: 13 }}>{client.address}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
