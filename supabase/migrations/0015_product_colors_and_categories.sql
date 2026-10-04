alter table public.products
add column if not exists colors text[] not null default '{}';

alter table public.products
drop constraint if exists products_category_check;

alter table public.products
drop constraint if exists products_subcategory_check;

update public.products
set category = case
  when category = 'boinas-ponchos' and lower(name) like '%poncho%' then 'ponchos'
  when category = 'boinas-ponchos' then 'sombreros-boinas'
  else category
end
where category = 'boinas-ponchos';

update public.products
set subcategory = case
  when lower(name) like '%cuero crudo%' then 'cuero-crudo'
  when lower(name) like '%algarrobo%' then 'algarrobo'
  when lower(name) like '%criollo%' then 'criollos'
  else 'tradicionales'
end
where category = 'mates' and subcategory is not null;

alter table public.products
add constraint products_category_check
check (
  category in (
    'promos',
    'mates',
    'materas',
    'yerberos',
    'cuchillos-tablas',
    'ponchos',
    'sombreros-boinas',
    'termos',
    'bombillas',
    'otros'
  )
);

alter table public.products
add constraint products_subcategory_check
check (
  (category = 'mates' and subcategory in ('cuero-crudo', 'tradicionales', 'algarrobo', 'criollos'))
  or (category <> 'mates' and subcategory is null)
);

create or replace function public.next_product_id(p_category text)
returns text as $$
declare
  prefix text;
  next_number integer;
begin
  prefix := case p_category
    when 'promos' then 'promo'
    when 'mates' then 'mate'
    when 'materas' then 'matera'
    when 'yerberos' then 'yerbero'
    when 'cuchillos-tablas' then 'cuchillo'
    when 'ponchos' then 'poncho'
    when 'sombreros-boinas' then 'sombrero'
    when 'termos' then 'termo'
    when 'bombillas' then 'bombilla'
    when 'otros' then 'otro'
    else null
  end;

  if prefix is null then
    raise exception 'Categoría inválida';
  end if;

  perform pg_advisory_xact_lock(hashtext('product-id:' || prefix));

  select coalesce(max((substring(id from '[0-9]+$'))::integer), 0) + 1
    into next_number
    from public.products
   where id ~ ('^' || prefix || '-[0-9]+$');

  return prefix || '-' || lpad(next_number::text, 3, '0');
end;
$$ language plpgsql;
