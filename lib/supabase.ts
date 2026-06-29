import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  invoices: {
    id: string
    user_id: string
    invoice_number: string
    client_name: string
    client_email: string
    client_phone: string
    client_address: string
    from_name: string
    from_email: string
    from_phone: string
    from_address: string
    items: InvoiceItem[]
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
    currency: string
    notes: string
    status: 'draft' | 'sent' | 'paid'
    invoice_date: string
    due_date: string
    created_at: string
  }
  clients: {
    id: string
    user_id: string
    name: string
    email: string
    phone: string
    address: string
    created_at: string
  }
}

export type InvoiceItem = {
  description: string
  qty: number
  rate: number
  total: number
}
