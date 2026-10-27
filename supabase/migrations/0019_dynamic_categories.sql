create table if not exists public.categories (
  id text primary key,
  name text not null,
  description text not null default '',
  image text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.categories (id, name, description, image)
values
  ('promos', 'Promos', 'Ofertas y paquetes especiales', '/images/Promos.jpg'),
  ('mates', 'Mates', 'Todos los mates', '/images/calabaza-natural.jpg'),
  ('materas', 'Materas', 'Bolsas para llevar', '/images/Materas.jpg'),
  ('yerberos', 'Yerberos', 'Contenedores de yerba', '/images/Yerberos.jpg'),
  ('cuchillos-tablas', 'Cuchillos y Tablas', 'Cuchillos y tablas para compartir', '/images/Cuchillos.jpg'),
  ('ponchos', 'Ponchos', 'Ponchos tradicionales', '/images/Ponchos.jpg'),
  ('sombreros-boinas', 'Sombreros y Boinas', 'Sombreros y boinas tradicionales', '/images/Boinas.jpg'),
  ('termos', 'Termos', 'Termos para agua caliente', '/images/Termo.jpg'),
  ('bombillas', 'Bombillas', 'Bombillas', '/images/Bombillas.jpg'),
  ('otros', 'Otros', 'Otros accesorios', '/images/cepillo-bombilla.jpg')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  updated_at = now();

alter table public.products drop constraint if exists products_category_check;
