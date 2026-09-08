create table if not exists public.product_bundles (
  product_id text primary key references public.products(id) on delete cascade,
  components jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_bundles_components_array check (jsonb_typeof(components) = 'array')
);

create or replace function public.validate_product_bundle()
returns trigger as $$
declare
  component jsonb;
  bundle_category text;
  component_category text;
begin
  select category into bundle_category from public.products where id = new.product_id;
  if bundle_category is distinct from 'promos' then
    raise exception 'Solo los productos de categoría promos pueden tener componentes';
  end if;

  if jsonb_array_length(new.components) = 0 then
    raise exception 'La promo debe tener al menos un componente';
  end if;

  for component in select value from jsonb_array_elements(new.components)
  loop
    if component->>'productId' is null
       or (component->>'quantity')::integer < 1 then
      raise exception 'Componente de promo inválido';
    end if;

    if component->>'productId' = new.product_id then
      raise exception 'Una promo no puede contenerse a sí misma';
    end if;

    select category into component_category
      from public.products
     where id = component->>'productId';

    if component_category is null or component_category = 'promos' then
      raise exception 'Las promos solo pueden contener productos simples';
    end if;
  end loop;

  return new;
end;
$$ language plpgsql;

drop trigger if exists validate_product_bundle_trigger on public.product_bundles;
create trigger validate_product_bundle_trigger
before insert or update on public.product_bundles
for each row execute function public.validate_product_bundle();

create or replace function public.prevent_bundle_category_change()
returns trigger as $$
begin
  if new.category is distinct from 'promos'
     and exists (select 1 from public.product_bundles where product_id = new.id) then
    raise exception 'No se puede cambiar una promo con componentes a producto simple';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists prevent_bundle_category_change_trigger on public.products;
create trigger prevent_bundle_category_change_trigger
before update on public.products
for each row execute function public.prevent_bundle_category_change();

create or replace function public.reserve_order_stock(p_items jsonb)
returns jsonb as $$
declare
  required_stock jsonb;
  updated_count integer;
  required_count integer;
begin
  with requested as (
    select item.product_id, item.quantity
      from jsonb_to_recordset(p_items) as item(product_id text, quantity integer)
  ), expanded as (
    select r.product_id, r.quantity
      from requested r
     where not exists (
       select 1 from public.product_bundles b where b.product_id = r.product_id
     )
    union all
    select component.product_id,
           r.quantity * (component.quantity)::integer
      from requested r
      join public.product_bundles b on b.product_id = r.product_id
      cross join lateral jsonb_to_recordset(b.components)
        as component(product_id text, quantity integer)
  ), required as (
    select product_id, sum(quantity)::integer as quantity
      from expanded
     group by product_id
  )
  select jsonb_agg(jsonb_build_object('productId', product_id, 'quantity', quantity))
    into required_stock
    from required;

  if required_stock is null then
    raise exception 'No se pudieron resolver los productos del pedido';
  end if;

  with required as (
    select item.product_id, item.quantity
      from jsonb_to_recordset(required_stock) as item(product_id text, quantity integer)
  )
  select count(*) into required_count from required;

  with required as (
    select item.product_id, item.quantity
      from jsonb_to_recordset(required_stock) as item(product_id text, quantity integer)
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
      select stock_item->>'productId' as product_id,
             sum((stock_item->>'quantity')::integer) as quantity
        from jsonb_array_elements(order_items) as item
        cross join lateral jsonb_array_elements(
          case when exists (
            select 1 from jsonb_array_elements(order_items) as snapshot_item
            where snapshot_item ? 'stockItems'
          ) then coalesce(item->'stockItems', '[]'::jsonb)
          else jsonb_build_array(jsonb_build_object(
            'productId', item->'product'->>'id', 'quantity', item->>'quantity'
          )) end
        ) as stock_item
       group by stock_item->>'productId'
    ) as restored
   where products.id = restored.product_id;

  update public.orders
     set stock_restored = true
   where id = p_order_id;

  return true;
end;
$$ language plpgsql;

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
      select stock_item->>'productId' as product_id,
             sum((stock_item->>'quantity')::integer) as quantity
        from jsonb_array_elements(order_items) as item
        cross join lateral jsonb_array_elements(
          case when exists (
            select 1 from jsonb_array_elements(order_items) as snapshot_item
            where snapshot_item ? 'stockItems'
          ) then coalesce(item->'stockItems', '[]'::jsonb)
          else jsonb_build_array(jsonb_build_object(
            'productId', item->'product'->>'id', 'quantity', item->>'quantity'
          )) end
        ) as stock_item
       group by stock_item->>'productId'
    ) as restored
   where products.id = restored.product_id;

  update public.orders
     set stock_restored = true,
         status = 'cancelled'
   where id = p_order_id;

  return true;
end;
$$ language plpgsql;
