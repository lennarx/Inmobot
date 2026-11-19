alter table public.apartments
  add column meeting_place text check (meeting_place in ('depto','inmobiliaria')),
  add column agency_address text;
