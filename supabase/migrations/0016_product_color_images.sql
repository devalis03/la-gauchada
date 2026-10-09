alter table public.products
add column if not exists color_images jsonb not null default '{}'::jsonb;

comment on column public.products.color_images is 'JSON map of product color labels to image URLs';