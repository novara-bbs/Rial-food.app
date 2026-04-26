# RIAL — Tu primer día

> Checklist secuencial para que cualquier persona nueva (developer, PM, diseñador)
> esté navegando, entendiendo y modificando RIAL en menos de 2 horas.

Si algo falla, abre un issue o pinga al owner — y **edita este doc** para que el siguiente no tropiece.

---

## Pre-requisitos

| Herramienta | Versión mínima | Cómo verificar |
|---|---|---|
| Node | 20.x | `node -v` |
| npm | 10.x | `npm -v` |
| Git | 2.40+ | `git --version` |
| Editor | VS Code recomendado (settings ya configurados) | — |
| (opcional) Xcode | 15+ | iOS native build |
| (opcional) Android Studio | Hedgehog+ | Android native build |
| (opcional) Supabase CLI | latest | Ver [SUPABASE-LOCAL.md](./SUPABASE-LOCAL.md) |

Sistema operativo: macOS, Linux o Windows. En Windows preferimos **bash** (Git Bash, WSL) por los scripts de release.

---

## Hora 1 — Setup y tour visual

### Paso 1 — Clone & install (5 min)

```bash
git clone <url-del-repo>
cd rial.app.v1.5
npm install
```

Si ves warnings de peer deps de React 19 — son aceptables, no bloquean.

### Paso 2 — Env mínimo (2 min)

```bash
cp .env.example .env.local
```

**No edites nada todavía.** La app funciona vacía (offline-first). Detalles en [SUPABASE-LOCAL.md](./SUPABASE-LOCAL.md) si más adelante necesitas auth.

### Paso 3 — Dev server (1 min)

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). En DevTools, **activa el modo responsive a 375px** (iPhone) — RIAL es mobile-first, en desktop se ve "raro" intencionalmente.

### Paso 4 — Tour completo (15 min)

Toca todo. Si algo no funciona, anótalo.

1. **Onboarding** (5 pasos): selecciona objetivo → introduce datos corporales → confirma macros → elige tema → nombre.
2. **Tab Hoy**: ve tu hero diario, registra una comida (FAB del centro → "Registrar comida").
3. **Tab Cocina**: explora recetas seed, abre una con detalle, vuelve atrás (verifica que el scroll se restaura).
4. **Tab Explorar**: 3 sub-tabs (Discovery, Social, Creators). Aplica un filtro.
5. **Tab Mas**: abre Settings, cambia idioma a English, vuelve a Español.
6. **Tab Mas → AI Coach**: pregunta algo trivial (necesitas `VITE_GEMINI_API_KEY` en `.env.local` — opcional).
7. **Cambia tema**: Settings → Apariencia → prueba `Neutral`, `Volt`, `Ocean`, `Ember` × `dark`/`light`.

### Paso 5 — Console tricks útiles (5 min)

DevTools → Console:

```js
// Reset onboarding (volver al wizard)
localStorage.setItem('isFirstTime', 'true'); location.reload();

// Toggle Pro (RIAL+)
localStorage.setItem('isPro', 'true'); location.reload();

// Limpia todo y empieza de cero
localStorage.clear(); location.reload();

// Genera 14 días de Real Feel para ver gráficos
const logs = []; for (let i=0;i<14;i++) { const d=new Date(); d.setDate(d.getDate()-i); logs.push({ id:Date.now()+i, date:d.toISOString(), level:Math.floor(Math.random()*3)+2, tags:[['energy','bloating','clarity'][i%3]] }); }
localStorage.setItem('realFeelLogs', JSON.stringify(logs)); location.reload();
```

Más en [QUICKSTART.md](./QUICKSTART.md).

### Paso 6 — Verificación de salud (2 min)

```bash
npx tsc --noEmit          # debe terminar sin errores
npm run rial:status       # snapshot del repo
```

Si ambos pasan, tu setup está OK.

---

## Hora 2 — Entender el repo

Lee en este orden (cada uno es 5-10 min):

1. **[README.md](../README.md)** — el qué.
2. **[GLOSSARY.md](./GLOSSARY.md)** — los términos. RIAL tiene jerga propia (ICP, Real Feel, Cocina vs Discovery, NutritionHero…).
3. **[SITEMAP.md](./SITEMAP.md)** — cómo funciona la navegación. **Sin React Router**. Crítico.
4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — capas, data model, engines.
5. **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)** — tokens, themes, do/don't.
6. **[PRIMITIVES.md](./PRIMITIVES.md)** — componentes canónicos. **Antes de crear cualquier cosa nueva, busca si ya existe.**
7. **[CONTRIBUTING.md](./CONTRIBUTING.md)** — workflow + checklist por feature.

Si vas a tocar:

- **Una pantalla nueva** → [NEW-SCREEN-CHECKLIST.md](./NEW-SCREEN-CHECKLIST.md) **es obligatorio**.
- **Una feature** → [HOW-TO-ADD-FEATURE.md](./HOW-TO-ADD-FEATURE.md).
- **Reglas de negocio** → [RULES.md](./RULES.md).
- **Release** → [RELEASE.md](./RELEASE.md).
- **Decisiones arquitectónicas** → [docs/adr/](./adr/).

---

## Tu primer cambio (sugerido)

Para validar que tienes todo OK, intenta esto:

1. Cambia un string visible. Por ejemplo, en `src/i18n/locales/es.ts` busca `goodMorning: 'Buenos Dias'` y cámbialo a `'¡Hola!'`. Recarga la app.
2. **Importante**: cambia el equivalente en `src/i18n/locales/en.ts`.
3. Corre `npm run check:i18n` — debe pasar.
4. Corre `npm run lint:code` — debe pasar.
5. Revierte el cambio (`git checkout src/i18n/`).

Si los 4 pasos funcionaron, estás operativo.

---

## Cuándo pedir ayuda

- **Antes de crear un componente nuevo**: ¿existe un primitive que ya hace eso? Mira `docs/PRIMITIVES.md`. Si dudas, pregunta.
- **Antes de añadir una librería**: revisa si la stack ya cubre el caso. Tenemos: Recharts (gráficos), motion (animaciones), date-fns (fechas), lucide-react (iconos), zod (validación), idb (IndexedDB), html5-qrcode (barcodes), sonner (toasts).
- **Antes de tocar `AppStateContext`**: pregunta. Es el wiring central, fácil de romper.
- **Antes de pushear a `rial-food/main`**: necesitas autorización explícita del owner. Nunca lo hagas sin un "continua".

---

## Checklist final del primer día

- [ ] La app corre en `localhost:3000` y se ve a 375px.
- [ ] He completado onboarding al menos una vez.
- [ ] He cambiado idioma EN ↔ ES sin errores en console.
- [ ] He probado al menos 2 themes distintas.
- [ ] He leído README, GLOSSARY, SITEMAP, ARCHITECTURE.
- [ ] `npx tsc --noEmit` pasa.
- [ ] `npm run rial:status` me devuelve un snapshot.
- [ ] Sé dónde están: features (`src/features/`), primitives (`src/components/ui/`, `src/components/patterns/`), i18n (`src/i18n/locales/`), tokens de diseño (`src/index.css`).
- [ ] He hecho mi primer cambio dummy y revertido.

Si alguno falló, **edita este doc** describiendo dónde te trabaste y cómo lo resolviste. Ese es tu primer aporte al repo.
