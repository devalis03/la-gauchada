create or replace function public.reserve_order_stock(p_items jsonb)
returns jsonb as $$
declare
  required_stock jsonb;
  updated_count integer;
  required_count integer;
begin
  with requested as (
    select item."productId" as product_id, item.quantity
      from jsonb_to_recordset(p_items) as item("productId" text, quantity integer)
  ), expanded as (
    select r.product_id, r.quantity
      from requested r
     where not exists (
       select 1 from public.product_bundles b where b.product_id = r.product_id
     )
    union all
    select component."productId" as product_id,
           r.quantity * component.quantity
      from requested r
      join public.product_bundles b on b.product_id = r.product_id
      cross join lateral jsonb_to_recordset(b.components)
        as component("productId" text, quantity integer)
  ), required as (
    select product_id, sum(quantity)::integer as quantity
      from expanded
     group by product_id
  )
  select jsonb_agg(jsonb_build_object('productId', product_id, 'quantity', quantity))
    into required_stock
    from required;

  if required_stock is null or jsonb_array_length(required_stock) = 0 then
    raise exception 'No se pudieron resolver los productos del pedido';
  end if;

  with required as (
    select item."productId" as product_id, item.quantity
      from jsonb_to_recordset(required_stock) as item("productId" text, quantity integer)
  )
  select count(*) into required_count from required;

  with required as (
    select item."productId" as product_id, item.quantity
      from jsonb_to_recordset(required_stock) as item("productId" text, quantity integer)
  )
  update public.products as products
     set stock = products.stock - required.quantity
    from required
   where products.id = required.product_id
     and products.stock >= required.quantity;

  get diagnostics updated_count = row_count;

  if updated_count <> required_count then
    raise exception 'Stock insuficiente';
  end if;

  return required_stock;
end;
$$ language plpgsql;
