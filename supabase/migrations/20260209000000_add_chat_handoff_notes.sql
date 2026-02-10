alter table public.chat_handoffs
  add column if not exists notes text;
