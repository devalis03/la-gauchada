alter table public.orders
  alter column subtotal type numeric(12, 2) using subtotal::numeric(12, 2),
  alter column shipping type numeric(12, 2) using shipping::numeric(12, 2),
  alter column total type numeric(12, 2) using total::numeric(12, 2);