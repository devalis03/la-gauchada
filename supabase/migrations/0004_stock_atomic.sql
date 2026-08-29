create or replace function public.decrement_product_stock(p_id text, p_quantity integer)
returns table(id text, stock integer) as $$
begin
  return query
  update public.products
  set stock = products.stock - p_quantity
  where products.id = p_id and products.stock >= p_quantity
  returning products.id, products.stock;
end;
$$ language plpgsql;

create or replace function public.increment_product_stock(p_id text, p_quantity integer)
returns table(id text, stock integer) as $$
begin
  return query
  update public.products
  set stock = products.stock + p_quantity
  where products.id = p_id
  returning products.id, products.stock;
end;
$$ language plpgsql;

alter table public.orders
  add column if not exists stock_restored boolean not null default false;

create or replace function public.restore_order_stock(p_order_id text)
returns boolean as $$
declare
  order_items jsonb;
  already_restored boolean;
begin
  select items, stock_restored
    into order_items, already_restored
    from public.orders
   where id = p_order_id
   for update;

  if not found or already_restored then
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
     set stock_restored = true
   where id = p_order_id;

  return true;
end;
$$ language plpgsql;
