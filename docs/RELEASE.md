# Release Workflow

> End-to-end de cómo va una línea de código desde tu editor hasta los usuarios.
> Web (Vercel) y nativo (iOS/Android via Capacitor) tienen flujos distintos.

---

## TL;DR

```
local main → preflight verde → git push rial-food main → Vercel auto-deploy
                                                       ↓
                                                  npm run cap:sync
                                                       ↓
                                            Xcode/Android Studio archive
                                                       ↓
                                              TestFlight / Play Internal
```

Web tarda ~3 min (auto). iOS/Android es manual y depende del owner.

---

## 1. Branch & remote

| Concepto | Valor |
|---|---|
| Branch de release | `main` |
| Remote de release | `rial-food` → `novara-bbs/Rial-food.app` |
| Remote de origen (NO usar para release) | `origin` (cuando exista) |
| Vercel project | `rial.app.v1.5` (id `prj_t11VHYQjptazjUx7Y2hWLz0IDAjg`) |

**Regla**: trabajamos directamente en `main`. No usamos feature branches por default — el repo es vibe-coding y los PRs son raros. Cuando entren humanos esto cambiará (PRs vía GitHub).

---

## 2. Preflight — el gate

Antes de cualquier push a `rial-food/main`:

```bash
npm run release:preflight
```

Qué hace (en orden):
1. `tsc --noEmit` — type check
2. `eslint src/` — design system + convenciones
3. `node scripts/check-i18n-symmetry.mjs` — ES ↔ EN simétrico
4. `vitest run` — 1188+ tests
5. `vite build` — build prod
6. `node scripts/check-bundle-size.mjs` — budget de chunks

**Si falla cualquier paso**, no se pushea. No hay `--no-verify` aceptado.

Slash command equivalente para Claude Code: `/rial-ship` (también propone el commit message).

---

## 3. Push & deploy web

### Opción A — push manual (humano o agente con permisos)

```bash
npm run release:push
# = preflight + git push rial-food main
```

Solo se ejecuta tras autorización explícita del owner. La palabra mágica en chat es **"continua"** después de un preflight verde.

### Opción B — dry-run (recomendado antes de un push grande)

```bash
npm run release:push:dry
# = preflight + git push --dry-run rial-food main
```

Verifica que no haya divergencia ni conflictos.

### Vercel auto-deploy

`rial-food/main` está conectado al proyecto Vercel `rial.app.v1.5`. Tras el push:

1. Vercel detecta el push en ~10 s.
2. Build con `vite build` (ver [vercel.json](../vercel.json)).
3. Deploy a producción (~2-3 min total).
4. URL pública: la del proyecto Vercel (configurada en su dashboard).

**Verificar**: Vercel dashboard → último deployment debe estar `Ready` y verde.

### Variables de entorno en Vercel

Las gestiona el owner desde el dashboard. Settings → Environment Variables. Variables esperadas: ver [.env.example](../.env.example), bloque "client".

⚠️ **Bloqueo activo** (estado al `2026-04-26`): `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` no están seteadas en Vercel. La app funciona pero esconde "Mi Cuenta". Owner action pendiente.

---

## 4. Native build (iOS / Android via Capacitor)

El web build es la fuente de verdad. Capacitor empaqueta `dist/` dentro del proyecto nativo.

### Preparar el bundle nativo

```bash
npm run cap:sync
# = npm run build && npx cap sync
# Copia dist/ a ios/App/App/public y android/app/src/main/assets/public
```

### iOS

Requiere macOS + Xcode + cuenta Apple Developer.

```bash
npm run cap:ios
# Abre el workspace en Xcode
```

En Xcode:
1. Bump build number (Target App → General → Build).
2. Product → Archive.
3. Cuando el archive esté listo: Distribute App → App Store Connect → Upload.
4. App Store Connect → TestFlight: añade el build a un grupo de testers.

### Android

Requiere Android Studio + cuenta Google Play.

```bash
npm run cap:android
# Abre el proyecto en Android Studio
```

En Android Studio:
1. Bump `versionCode` y `versionName` en `android/app/build.gradle`.
2. Build → Generate Signed Bundle/APK → AAB.
3. Sube el `.aab` a Play Console → Internal testing track.

### Setup inicial (solo primera vez por developer)

```bash
npm run cap:setup:ios       # añade plataforma iOS + scripts
npm run cap:setup:android   # añade plataforma Android
```

---

## 5. Después del deploy

### Smoke test obligatorio

1. Abre la URL prod en móvil (no solo desktop).
2. Cambia idioma a EN, verifica nada hardcodeado.
3. Tour de las 4 tabs.
4. Si tocaste recipes/social/wellness, prueba el flujo concreto.

### Update CHANGELOG

```markdown
## [1.5.XX] — YYYY-MM-DD
- feat(...): ...
- fix(...): ...
```

Convención: bump patch para fixes y refactors, minor para features visibles, major para cambios breaking. Hoy estamos en `1.5.x` — el `1.5` es la línea actual del producto.

### Update `docs/ai/state.md`

Si el release cambia: la línea de release activa, una nueva métrica de calidad, un riesgo nuevo o resuelto, o el siguiente sprint candidate. Si solo es un bug-fix puntual, no toques `state.md`.

---

## 6. Rollback

### Web (Vercel)

1. Vercel dashboard → Deployments.
2. Encuentra el último deployment estable.
3. ⋯ → **Promote to Production**.
4. ~30 s y los usuarios reciben la versión vieja.

### Git (revertir cambio en main)

```bash
git revert <sha-malo>          # crea un commit que deshace
npm run release:preflight       # verifica que sigue verde
git push rial-food main         # auto-deploy del revert
```

**No usar `git reset --hard` + force-push** salvo emergencia y con autorización explícita del owner. Reescribir history en el remote de release rompe a cualquiera que haya basado trabajo encima.

### Native

iOS y Android **no se pueden rollbackear** una vez aprobados — solo subir un build nuevo. Por eso el smoke test pre-archive es crítico.

TestFlight/Play Internal sí permiten esconder un build defectuoso (Expire / Halt rollout) — eso es lo más cercano a un rollback nativo.

---

## 7. CI

Ver [.github/workflows/ci.yml](../.github/workflows/ci.yml). Jobs activos:

| Job | Cuando | Qué hace |
|---|---|---|
| `type-check + unit` | PR + push main | tsc + vitest |
| `build` | PR + push main | vite build + size:check |
| `e2e` | PR + push main | Playwright mobile-chrome |
| `lint` | PR + push main | eslint + i18n symmetry |
| CodeQL | weekly + on push | Security scan JS/TS |

CI **no** hace deploy. El deploy lo dispara el push a `rial-food/main` (lo recoge Vercel).

---

## 8. Quien hace qué

| Acción | Quien puede |
|---|---|
| `npm run release:preflight` | Cualquier developer / agente |
| `npm run release:push:dry` | Cualquier developer / agente |
| `npm run release:push` (real) | Solo con autorización explícita del owner ("continua") |
| Vercel env vars / domain | Owner |
| iOS Xcode archive + upload | Owner (cuenta Apple Developer) |
| Android AAB upload | Owner (cuenta Google Play) |
| Supabase prod migration | Owner (con `supabase db push` + acceso al proyecto) |
