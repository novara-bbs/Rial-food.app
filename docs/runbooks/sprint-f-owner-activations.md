# Sprint F — Owner Activations (Supabase + PostHog)

> **Estimación total**: ~1h de trabajo (sólo owner, no developer).
> **Por qué importa**: desbloquea sync cross-device + analytics + flags runtime para todos los sprints siguientes (G-O).
> **Riesgo**: bajo. Si algo sale mal, la app sigue funcionando (offline-first); sólo no hay sync ni analytics.

---

## Pre-flight (5 min)

### Lo que ya está listo en el repo

✅ `supabase/migrations/001_initial_schema.sql` — 2 tablas (`profiles`, `user_data`) + 6 RLS policies + 1 trigger
✅ `src/lib/supabase.ts` — client wired vía `SUPABASE_URL` + `SUPABASE_ANON_KEY` (no-ops si están vacíos)
✅ `src/lib/analytics.ts` — wrapper PostHog con stub + 11 `track.*` helpers tipados (no-op si `POSTHOG_KEY` está vacío)
✅ `src/config/env.ts` — todas las env vars tipadas + accessors
✅ `vercel.json` — security headers + CSP listos
✅ Vercel project: `rial.app.v1.5` (id `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`)

### Lo que falta (acciones del owner)

❌ Aplicar migración a Supabase production
❌ Añadir `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` en Vercel
❌ Crear cuenta PostHog
❌ Añadir `VITE_POSTHOG_KEY` en Vercel
❌ Instalar `posthog-js` + uncomment block en `analytics.ts` (esto sí es código, lo hago yo después)
❌ Redeploy en Vercel para aplicar env vars

---

## Parte 1 — Supabase activation (40 min)

### 1.1. Verificar acceso al proyecto Supabase (2 min)

1. Abrir https://supabase.com/dashboard
2. Login con la cuenta del owner
3. Localizar el proyecto RIAL production (debería existir; si no, crearlo:)
   - **Si NO existe**: click "New project"
     - Name: `rial-production`
     - Database password: generar contraseña fuerte y guardar en password manager
     - Region: `eu-west-1` (Ireland) — para latencia EU y compliance GDPR
     - Pricing plan: Free para empezar (500MB DB + 1GB storage + 2GB bandwidth/mes)
   - Esperar ~2 minutos a que el proyecto se inicialice

4. Una vez con el proyecto abierto, anotar:
   - **Project URL**: aparece en Settings → API → "Project URL" — formato `https://xxxx.supabase.co`
   - **anon public key**: Settings → API → "Project API keys" → `anon` `public` — empieza con `eyJ...`

⚠️ La `anon key` es pública (se incluye en el bundle del cliente). La `service_role` key es secret — NUNCA pegarla en código cliente, NUNCA en Vercel client-side env vars.

### 1.2. Aplicar migración inicial (15 min)

**Opción A — Supabase CLI (recomendado, reproducible)**:

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Login
supabase login
# Abrirá el navegador para autenticación

# Link al proyecto remoto (desde la raíz del repo)
cd "C:\Users\Vicente CM\Documents\projects\RIAL\rial.app.v1.5"
supabase link --project-ref <REF>
# <REF> es el slug del proyecto, lo ves en la URL del dashboard:
# https://supabase.com/dashboard/project/<REF>/...

# Verificar conexión
supabase db remote list

# Aplicar la migración
supabase db push

# Output esperado: "Linked migrations applied successfully."
```

**Opción B — SQL Editor (más visual, si el CLI da problemas)**:

1. Dashboard → SQL Editor → "New query"
2. Abrir `supabase/migrations/001_initial_schema.sql` en VS Code (130 líneas)
3. Copiar TODO el contenido
4. Pegar en el SQL Editor
5. Click "Run" (Ctrl+Enter)
6. Verificar mensaje verde "Success. No rows returned"

### 1.3. Verificar que las tablas + RLS se crearon (3 min)

1. Dashboard → Table Editor → debes ver **2 tablas**:
   - `profiles` (mirror de auth.users con metadata pública)
   - `user_data` (key-value para sync de localStorage)

2. Para cada tabla, click en el icono 🔒 (RLS) y verifica que las policies aparecen:
   - `profiles`: `profiles_select_public`, `profiles_update_own`
   - `user_data`: `user_data_select_own`, `user_data_insert_own`, `user_data_update_own`, `user_data_delete_own`

3. Si las policies NO aparecen → la migración no se aplicó completa. Re-ejecutar la sección 1.2.

### 1.4. Configurar Auth providers (5 min — opcional pero recomendado)

Dashboard → Authentication → Providers:

- **Email/Password**: ya activado por defecto (con magic links)
- **Apple**: para Sign In with Apple (necesario para App Store guidelines)
  - Requiere Apple Developer account; configurar después si todavía no lo tienes
- **Google**: para Sign In with Google
  - Requiere OAuth credentials de Google Cloud Console; configurar después si todavía no lo tienes

Por ahora, **dejar sólo Email/Password activado** es suficiente para los primeros tests.

### 1.5. Añadir env vars a Vercel (10 min)

1. Abrir https://vercel.com/dashboard
2. Seleccionar proyecto `rial.app.v1.5`
3. Settings → Environment Variables → "Add New"
4. Crear estas 2 variables:

| Key | Value | Environments |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` (de la sección 1.1) | Production + Preview + Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon public key) | Production + Preview + Development |

5. Save

⚠️ **Importante**: marcar las 3 environments. Sin "Preview" los PR deployments no tendrán sync; sin "Development" `vercel dev` local no funciona.

### 1.6. Redeploy + verificación (5 min)

1. Vercel dashboard → proyecto `rial.app.v1.5` → "Deployments"
2. Último deployment activo → menú "..." → "Redeploy"
3. Marcar "Use existing Build Cache" → "Redeploy"
4. Esperar ~2-3 min al green check

5. Abrir https://rial.app (o el dominio production) en una pestaña incognito
6. Crear una cuenta nueva (Sign up con email)
7. Completar onboarding
8. Hacer log de una comida
9. Abrir Supabase Dashboard → Table Editor → `user_data` → debe haber al menos 1 row con tu user_id

✅ **Si la row aparece**: sync está activo. Sprint F-1 completo.
❌ **Si no aparece**: revisar:
- DevTools → Console: errores de Supabase?
- DevTools → Network: requests a `xxxx.supabase.co` devuelven 200? 401? 403?
- Verificar env vars en Vercel → Settings → Environment Variables (typo común: `VITE_SUPABASE_URL` vs `SUPABASE_URL`)

---

## Parte 2 — PostHog activation (20 min)

### 2.1. Crear cuenta PostHog (5 min)

1. Abrir https://eu.posthog.com/signup
   - ⚠️ Usar el endpoint **EU** (eu.posthog.com), NO US, para compliance GDPR
2. Sign up con email del owner
3. Click "Create new project":
   - Project name: `RIAL Production`
   - Anonymous tracking: **OFF** (queremos identified-only para GDPR)
4. Después de crear, en el "Onboarding wizard":
   - Skip "Install snippet" (lo haremos via npm)
   - Skip "Capture an event"
   - Skip "Invite team"

### 2.2. Copiar Project API Key (2 min)

1. Settings → Project → "Project API Key"
2. Copiar el key — empieza con `phc_...`
3. ⚠️ Este key es **público** (se incluye en el bundle client-side). La distinción importante: el "Personal API key" es secret, el "Project API key" es OK exponer.

### 2.3. Añadir env var a Vercel (3 min)

Vercel → proyecto `rial.app.v1.5` → Settings → Environment Variables → "Add New":

| Key | Value | Environments |
|---|---|---|
| `VITE_POSTHOG_KEY` | `phc_...` (de la sección 2.2) | Production + Preview |

⚠️ NO añadir a "Development" para evitar que tu desarrollo local meta eventos de test al dashboard production. Si quieres analytics locales, crear un segundo project PostHog para dev.

### 2.4. Instalar posthog-js + uncomment el block (10 min)

**Esto es código — yo lo hago en cuanto me confirmes que las dos primeras partes están done**. Yo ejecutaré:

```bash
cd "C:\Users\Vicente CM\Documents\projects\RIAL\rial.app.v1.5"
npm install posthog-js
# Después, edito src/lib/analytics.ts para descomentar el block real
# y reemplazar los stubs no-op con la implementación PostHog
# Después corro release:preflight y commit
```

El cambio será: el bloque comentado en `analytics.ts` (líneas 50-95) se activa. Resultado: cuando hay `POSTHOG_KEY` en env, los `track.*` helpers envían eventos reales; cuando no hay key, siguen siendo no-op.

### 2.5. Redeploy + verificación (5 min)

Después de que yo haga el commit + push:

1. Vercel se autodeploya con el nuevo bundle
2. Abrir https://rial.app en pestaña incognito
3. Completar onboarding (genera `onboarding_complete` event)
4. Loguear una comida (genera `meal_logged` event)
5. PostHog dashboard → "Live events" → debes ver los 2 events apareciendo en <30s

✅ **Si aparecen**: analytics activo.
❌ **Si no aparecen**:
- DevTools → Network → buscar `eu.i.posthog.com` — los requests deberían devolver 200
- Verificar `VITE_POSTHOG_KEY` en Vercel sin typos
- Verificar la fecha del último deploy en Vercel (post-instalación del package)

---

## Parte 3 — Después de Sprint F (qué desbloqueamos)

Una vez Supabase + PostHog activos, los siguientes sprints pueden empezar:

| Capability desbloqueada | Sprint que la usa |
|---|---|
| Sync cross-device de recetas, preferencias, planner | Sprint G+ |
| RLS (multi-tenant data isolation) | Sprint H (visibility) |
| Edge functions deploy via `supabase functions deploy` | Sprint K+ |
| Storage buckets (foto upload) | Sprint M+ |
| Runtime feature flags vía PostHog | Sprint L |
| A/B testing sin redeploy | Sprint L |
| Funnel analytics + retention dashboards | Continuo |

---

## Parte 4 — Rollback procedures

### Si Supabase falla post-activation

**Síntoma**: la app no carga / errores 401 en Network tab / sync no funciona.

**Mitigación inmediata** (5 min):

1. Vercel → Settings → Environment Variables → eliminar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
2. Redeploy
3. La app vuelve a modo offline-first puro (como estaba antes de Sprint F)

**Investigación**:

- Supabase dashboard → "Logs" → buscar errores
- Verificar que las RLS policies no están bloqueando legítimos reads
- Revisar `src/lib/sync.ts` por si hay bugs de schema mismatch

### Si PostHog falla

**Síntoma**: app sigue funcionando pero PostHog no recibe events / events duplicados / errores en console.

**Mitigación**:

1. Vercel → eliminar `VITE_POSTHOG_KEY` env var
2. Redeploy
3. Los `track.*` helpers vuelven a no-op (la app sigue funcionando perfectamente)

### Si todo se rompe

Git revert al commit `[1.5.219]` (último estado conocido bueno):

```bash
git revert <SHA-del-commit-problemático>
git push rial-food main
```

---

## Parte 5 — Costes esperados (Sprint F = $0)

| Servicio | Plan | Coste | Cuándo upgrade |
|---|---|---|---|
| Supabase | Free | $0/mes | Cuando DB >500MB o bandwidth >2GB/mes |
| PostHog | Free | $0/mes | Cuando events >1M/mes |
| Vercel | Hobby (current) | $0/mes | Cuando builds >100/mes o bandwidth >100GB/mes |

Estimación: free tier dura ~6-12 meses con tracción inicial (<1000 DAU). Cuando upgrade, presupuesto ~$50-100/mes total.

---

## Checklist final de Sprint F

Marcar conforme se completa:

### Supabase
- [ ] Proyecto creado en supabase.com (region EU)
- [ ] Migración `001_initial_schema.sql` aplicada
- [ ] 2 tablas + 6 policies verificadas en Table Editor
- [ ] `VITE_SUPABASE_URL` añadido a Vercel
- [ ] `VITE_SUPABASE_ANON_KEY` añadido a Vercel
- [ ] Vercel redeploy completado
- [ ] Test end-to-end: crear cuenta → sync row aparece en `user_data`

### PostHog
- [ ] Cuenta creada en eu.posthog.com
- [ ] Proyecto `RIAL Production` creado
- [ ] `VITE_POSTHOG_KEY` añadido a Vercel (Production + Preview)
- [ ] Owner notifica al developer (yo) para instalar posthog-js + uncomment
- [ ] Vercel redeploy post-instalación
- [ ] Test end-to-end: onboarding completado → event aparece en PostHog Live events

### Post-Sprint F
- [ ] `docs/ai/state.md` actualizado: Sprint F closed
- [ ] `CHANGELOG.md` entry `[1.5.220]` (cuando se haga el code commit de PostHog)
- [ ] Riesgo "owner action requerida — Supabase no activado" eliminado de state.md
- [ ] Próximo sprint: **G — Monorepo + packages extraction**
