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
