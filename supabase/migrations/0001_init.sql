create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null,
  price integer not null check (price >= 0),
  image text not null,
  category text not null check (category in ('promos', 'mates', 'materas', 'yerberos', 'termos', 'bombillas', 'otros')),
  subcategory text null check (subcategory in ('mates-imperiales', 'mates-tradicionales', 'mates-torpedos')),
  stock integer not null default 0 check (stock >= 0),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category);

create trigger trg_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create table if not exists public.orders (
  id text primary key,
  items jsonb not null,
  customer jsonb not null,
  subtotal integer not null check (subtotal >= 0),
  shipping integer not null check (shipping >= 0),
  total integer not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null check (payment_method in ('efectivo', 'tarjeta', 'transferencia')),
  transference_status text null check (transference_status in ('pendiente', 'confirmado', 'rechazado')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'approved', 'rejected', 'in_process', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_method_transfer on public.orders(payment_method, transference_status);

create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_users_email on public.admin_users(email);

create trigger trg_admin_users_updated_at
before update on public.admin_users
for each row
execute function public.set_updated_at();
