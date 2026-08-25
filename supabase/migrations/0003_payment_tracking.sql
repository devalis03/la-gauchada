alter table public.orders
  add column if not exists payment_id text,
  add column if not exists external_reference text;

create unique index if not exists idx_orders_payment_id
  on public.orders(payment_id)
  where payment_id is not null;

create unique index if not exists idx_orders_external_reference
  on public.orders(external_reference)
  where external_reference is not null;

create table if not exists public.payment_notifications (
  payment_id text primary key,
  processed_at timestamptz not null default now()
);

alter table public.payment_notifications enable row level security;
