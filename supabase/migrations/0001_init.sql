-- Inmobot schema. All access is server-side with the service role key;
-- RLS is enabled with no policies so anon/authenticated roles get nothing.

create table public.apartments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat double precision,
  lng double precision,
  price numeric,
  expensas numeric,
  currency text not null default 'ARS',
  contact_name text,
  contact_phone text,
  contact_email text,
  agency text,
  listing_url text,
  rating smallint check (rating between 1 and 5),
  notes text,
  visit_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  type text not null default 'boolean' check (type in ('boolean','text','number','rating')),
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.answers (
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  value text,
  updated_at timestamptz not null default now(),
  primary key (apartment_id, question_id)
);
create index answers_question_idx on public.answers(question_id);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid references public.apartments(id) on delete cascade,
  kind text not null check (kind in ('living','other','my_living')),
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index photos_apartment_idx on public.photos(apartment_id);

create table public.redesigns (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  result_path text not null,
  explanation text,
  model text,
  created_at timestamptz not null default now()
);
create index redesigns_apartment_idx on public.redesigns(apartment_id);

alter table public.apartments enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.photos enable row level security;
alter table public.redesigns enable row level security;

insert into public.questions (label, type, position) values
  ('¿Tiene cochera?', 'boolean', 1),
  ('¿Tiene balcón / terraza?', 'boolean', 2),
  ('¿Tiene ascensor?', 'boolean', 3),
  ('¿Aceptan mascotas?', 'boolean', 4),
  ('Luminosidad', 'rating', 5),
  ('Ruido (5 = silencioso)', 'rating', 6),
  ('Metros cuadrados', 'number', 7),
  ('Ambientes', 'number', 8),
  ('Orientación (frente/contrafrente, N/S/E/O)', 'text', 9),
  ('Calefacción', 'text', 10),
  ('¿Tiene aire acondicionado?', 'boolean', 11),
  ('Lugar para lavarropas', 'boolean', 12),
  ('Estado general', 'rating', 13),
  ('Seguridad / portería', 'text', 14),
  ('Requisitos (garantía, seguro de caución, meses de depósito)', 'text', 15);

insert into storage.buckets (id, name, public) values ('photos', 'photos', false)
  on conflict (id) do nothing;
