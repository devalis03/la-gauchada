alter table public.orders
  add column if not exists reservation_expires_at timestamptz;

create index if not exists idx_orders_expiring_card_reservations
  on public.orders(reservation_expires_at)
  where payment_method = 'tarjeta'
    and payment_status = 'pending'
    and payment_id is null
    and stock_restored = false;

create or replace function public.expire_card_order_stock(p_order_id text)
returns boolean as $$
declare
  order_items jsonb;
begin
  select items
    into order_items
    from public.orders
   where id = p_order_id
     and payment_method = 'tarjeta'
     and payment_status = 'pending'
     and payment_id is null
     and stock_restored = false
     and reservation_expires_at is not null
     and reservation_expires_at <= now()
   for update;

  if not found then
    return false;
  end if;

  update public.products as products
     set stock = products.stock + restored.quantity
    from (
      select item->'product'->>'id' as product_id,
             sum((item->>'quantity')::integer) as quantity
        from jsonb_array_elements(order_items) as item
       group by item->'product'->>'id'
    ) as restored
   where products.id = restored.product_id;

  update public.orders
     set stock_restored = true,
         status = 'cancelled'
   where id = p_order_id;

  return true;
end;
$$ language plpgsql;

create or replace function public.expire_card_order_reservations()
returns integer as $$
declare
  expired_count integer := 0;
  order_id text;
begin
  for order_id in
    select id
      from public.orders
     where payment_method = 'tarjeta'
       and payment_status = 'pending'
       and payment_id is null
       and stock_restored = false
       and reservation_expires_at is not null
       and reservation_expires_at <= now()
     for update skip locked
  loop
    if public.expire_card_order_stock(order_id) then
      expired_count := expired_count + 1;
    end if;
  end loop;

  return expired_count;
end;
$$ language plpgsql;