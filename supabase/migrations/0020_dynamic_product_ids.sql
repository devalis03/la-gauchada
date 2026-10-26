create or replace function public.next_product_id(p_category text)
returns text as $$
declare
  prefix text;
  next_number integer;
begin
  if not exists (
    select 1
      from public.categories
     where id = p_category
  ) then
    raise exception 'Categoría inválida';
  end if;

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
    else regexp_replace(p_category, '[^a-z0-9]+', '', 'g')
  end;

  if prefix is null or prefix = '' then
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
