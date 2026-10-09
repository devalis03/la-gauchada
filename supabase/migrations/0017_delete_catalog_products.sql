-- Remove products that should no longer be part of the catalog.
-- Existing orders keep their denormalized product snapshots in orders.items.
delete from public.products
where id in ('bombilla-004', 'bombilla-005', 'mate-015')
   or category = 'otros';
