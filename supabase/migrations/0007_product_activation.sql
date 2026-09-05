alter table public.products
  add column if not exists active boolean not null default true;

create index if not exists idx_products_active_category
  on public.products(active, category);