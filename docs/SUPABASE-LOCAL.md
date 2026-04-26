# Supabase — Local development & environment

> Cómo desarrollar contra Supabase **sin** ser owner del proyecto cloud, y qué pasa
> cuando las env vars no están seteadas (spoiler: la app sigue funcionando offline-first).

---

## TL;DR

RIAL es **offline-first**. Toda la persistencia primaria es `localStorage`. Supabase
es **opcional**: añade auth, sync entre dispositivos y borrado GDPR. Sin él la app
funciona, pero esconde la sección "Mi Cuenta" en Settings.

```bash
# Modo cero-config (sin Supabase) — la mayoría del trabajo de UI/feature
cp .env.example .env.local
# Deja VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY vacíos
npm run dev
# La app funciona; isSupabaseEnabled = false
```

---

## 1. Cuándo necesitas Supabase configurado

| Tarea | Necesitas Supabase? |
|---|---|
| UI / componentes / design system | ❌ No |
| Lógica de cálculo (TDEE, correlations, gamification) | ❌ No |
| Recetas, planning, wellness offline-first | ❌ No |
| Probar AI Coach (Gemini local key) | ❌ No |
| Probar **auth** (login / signup / signout) | ✅ Sí |
| Probar **sync** entre dos dispositivos | ✅ Sí |
| Probar **borrado GDPR** end-to-end | ✅ Sí |
| Probar el flujo "Mi Cuenta" en Settings | ✅ Sí |
| Trabajar en `supabase/functions/gemini-proxy` | ✅ Sí (Supabase CLI) |

---

## 2. Setup A — Sin Supabase (default recomendado)

```bash
cp .env.example .env.local
npm install
npm run dev
```

En `.env.local` deja:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Comportamiento:
- `src/lib/supabase.ts` exporta `isSupabaseEnabled = false`.
- `src/contexts/AuthContext` actúa como stub: usuario nunca está autenticado.
- Settings esconde la sección "Mi Cuenta".
- Push/pull a `user_data` se silencian (no-op).
- Todo lo demás funciona normal contra `localStorage`.

Este es el modo de trabajo de cualquier developer **que no esté tocando auth o sync**.

---

## 3. Setup B — Con tu propio Supabase free-tier

Si necesitas probar auth/sync, crea un proyecto Supabase tuyo (tier gratis es suficiente para dev):

1. Ve a [https://supabase.com](https://supabase.com) → **New project**.
2. Nombre: `rial-dev-<tu-nombre>`. Región: la más cercana.
3. Espera a que esté ready (~2 min).
4. **Project Settings → API** → copia:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
5. Pega ambos en `.env.local`.
6. Aplica el schema:
   ```bash
   # Opción A: Supabase CLI (recomendado)
   npx supabase link --project-ref <tu-project-ref>
   npx supabase db push
   ```
   ```sql
   -- Opción B: pegar a mano en Supabase SQL Editor:
   -- abre supabase/migrations/001_initial_schema.sql y ejecútalo
   ```
7. Reinicia `npm run dev`. Settings → "Mi Cuenta" debe aparecer.

**Esquema mínimo** que crea `001_initial_schema.sql`:
- `profiles` — fila por usuario auth
- `user_data` — JSON blob por usuario (estado serializado de localStorage)
- RLS policies para que cada usuario solo lea/escriba su fila

---

## 4. Setup C — Supabase corriendo localmente (Docker)

Solo necesario si vas a tocar Edge Functions o quieres trabajar offline. Requiere Docker Desktop.

```bash
npm install -g supabase

# En la raíz del repo (donde vive supabase/)
supabase start          # spinea Postgres + Auth + Storage + Functions en local
supabase status         # imprime URLs y keys locales
```

`supabase start` te dará algo como:

```
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOi...
service_role key: eyJhbGciOi...
```

Pega las dos primeras en `.env.local`:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Comandos útiles:
- `supabase db reset` — borra y reconstruye con todas las migraciones.
- `supabase functions serve gemini-proxy` — corre la edge function local.
- `supabase stop` — para todo.

---

## 5. Variables de entorno — referencia completa

Fuente de verdad: [.env.example](../.env.example) y [src/config/env.ts](../src/config/env.ts).

| Variable | Bundle? | Necesaria | Uso |
|---|---|---|---|
| `VITE_GEMINI_API_KEY` | client | dev only | AI Coach + recipe import locales (NO usar en prod). [Get key](https://aistudio.google.com/apikey) |
| `VITE_SUPABASE_URL` | client | opcional | Habilita auth y sync. Vacío → app offline-first |
| `VITE_SUPABASE_ANON_KEY` | client | opcional | Pareja de la URL. Vacío → app offline-first |
| `VITE_RC_APPLE_API_KEY` | client | iOS native | RevenueCat in-app subscriptions iOS |
| `VITE_RC_GOOGLE_API_KEY` | client | Android native | RevenueCat in-app subscriptions Android |
| `VITE_SENTRY_DSN` | client | opcional | Crash reporting |
| `APP_URL` | local | dev only | Solo para enlaces locales que necesiten URL absoluta |
| `GEMINI_API_KEY` | server | prod | Secret de la Edge Function `gemini-proxy`. **NUNCA** en `.env.local` ni en client bundle |

**Reglas**:
- Cualquier var prefijo `VITE_` se shipea al bundle del navegador. Solo secrets safe-to-expose.
- `GEMINI_API_KEY` (sin prefijo) vive **solo** en Supabase Edge Function secrets (`supabase secrets set ...`).
- Nunca commitear `.env.local`. Está en `.gitignore`.

---

## 6. Owner actions pendientes (estado actual)

> Bloqueo conocido en `state.md` — el owner debe ejecutar estos dos pasos en el proyecto Supabase de **producción** para que sync funcione en la app pública.

1. **Aplicar el schema en prod**: `supabase db push` contra el proyecto cloud `rial-food`.
2. **Setear env vars en Vercel**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` en el proyecto `rial.app.v1.5`. Sin esto, la app en producción funciona pero esconde "Mi Cuenta".

Si eres developer y ves estos bloqueos resueltos en el commit log o en `state.md`, actualiza este doc.

---

## 7. Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| "Mi Cuenta" no aparece en Settings | `isSupabaseEnabled === false` | Setea `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` en `.env.local` y reinicia dev |
| Login dice "invalid credentials" siempre | Schema no aplicado en tu proyecto Supabase | `supabase db push` o pega `001_initial_schema.sql` a mano |
| Pull-on-sign-in no trae nada | RLS mal configurada o user no tiene fila en `user_data` | Mira la console de Supabase → Logs → Postgres |
| Push silenciado en `savedRecipes` | Hay fotos como data URLs (>1 MB) — guard Q6 | Esperado hasta que se haga Q6-B (Storage bucket) |
| Edge Function no responde local | `supabase functions serve` no está corriendo | Lánzalo en otra terminal |
