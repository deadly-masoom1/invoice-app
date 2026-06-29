-- Run this in Supabase SQL Editor

create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  invoice_number text not null,
  client_name text not null,
  client_email text,
  client_phone text,
  client_address text,
  from_name text,
  from_email text,
  from_phone text,
  from_address text,
  items jsonb default '[]',
  subtotal numeric default 0,
  tax_rate numeric default 0,
  tax_amount numeric default 0,
  total numeric default 0,
  currency text default 'PKR',
  notes text,
  status text default 'draft' check (status in ('draft','sent','paid')),
  invoice_date date default current_date,
  due_date date,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table clients enable row level security;
alter table invoices enable row level security;

-- Policies: users can only see their own data
create policy "Users see own clients" on clients for all using (auth.uid() = user_id);
create policy "Users see own invoices" on invoices for all using (auth.uid() = user_id);
