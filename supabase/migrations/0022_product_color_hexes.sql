alter table public.products
  add column if not exists color_hexes jsonb not null default '{}'::jsonb;
