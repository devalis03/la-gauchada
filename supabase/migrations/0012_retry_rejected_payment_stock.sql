create or replace function public.rereserve_order_stock(p_order_id text)
returns boolean as $$
declare
  order_items jsonb;
  already_reserved boolean;
  requested_items jsonb;
  reserved_items jsonb;
begin
  select items, not stock_restored
    into order_items, already_reserved
    from public.orders
   where id = p_order_id
   for update;

  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  if already_reserved then
    return true;
  end if;

  select jsonb_agg(jsonb_build_object(
    'productId', item->'product'->>'id',
    'quantity', (item->>'quantity')::integer
  ))
    into requested_items
    from jsonb_array_elements(order_items) as item;

  if requested_items is null or jsonb_array_length(requested_items) = 0 then
    raise exception 'El pedido no contiene productos';
  end if;

  reserved_items := public.reserve_order_stock(requested_items);

  update public.orders
     set items = jsonb_set(order_items, '{0,stockItems}', reserved_items, true),
         stock_restored = false
   where id = p_order_id;

  return true;
end;
$$ language plpgsql;
