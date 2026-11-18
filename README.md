# Inmobot 🏠

PWA para loguear y comparar deptos en visitas: ubicación, preguntas globales, contacto, fotos y "Living IA" (reacomoda tus muebles en el living del depto vía OpenRouter).

## Stack
Next.js 16 (App Router) · Tailwind 4 · Supabase (Postgres + Storage) · Vercel · OpenRouter.

## Env vars (Vercel)
Ver `.env.example`. `APP_PIN` protege la app; `OPENROUTER_API_KEY` habilita Living IA.

## DB
`supabase/migrations/0001_init.sql` (tablas, RLS sin policies, bucket privado `photos`, preguntas seed).
