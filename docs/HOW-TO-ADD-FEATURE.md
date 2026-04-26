# Cómo añadir una feature en RIAL

> Receta paso-a-paso para extender el producto sin romper convenciones.
> Si tu cambio es **una pantalla nueva**, lee también [NEW-SCREEN-CHECKLIST.md](./NEW-SCREEN-CHECKLIST.md).

---

## 0. Antes de empezar

Pregúntate: **¿esto es una feature, una pantalla, o un componente?**

| Si es… | Lee | Tamaño típico |
|---|---|---|
| Un componente reutilizable nuevo | [PRIMITIVES.md § "Adding a primitive"](./PRIMITIVES.md) | 1 archivo |
| Una pantalla nueva | [NEW-SCREEN-CHECKLIST.md](./NEW-SCREEN-CHECKLIST.md) | 1 screen + handlers + i18n |
| Una feature de dominio (con state, handlers, varios screens) | **este doc** | 1 carpeta `src/features/foo/` |

**Antes de crear cualquier cosa**: busca si ya existe. Mira `src/components/ui/`, `src/components/patterns/`, `src/features/*/components/`. Si encuentras algo aproximado, **úsalo o extiéndelo** — no dupliques.

---

## 1. Anatomía de una feature

Convención: feature-based folder layout.

```
src/features/<dominio>/
├── screens/        ← Componentes pantalla, lazy-loaded en src/config/routes.ts
├── components/     ← Sub-componentes específicos del dominio (no reutilizables fuera)
├── handlers/       ← Funciones factory createHandleX(deps) que mutan state
├── utils/          ← Lógica pura testeable (cálculos, transformaciones, validación)
├── data/           ← Seeds estáticos, constantes (food families, etc.)
└── hooks/          ← Hooks custom del dominio (opcional — solo si > 1 screen los comparte)
```

**Reglas**:
- **No barrel files**. Solo `src/types/index.ts` está autorizado. Importa por ruta directa.
- **No** mezcles dominios. Si tu feature necesita lógica de otra, **importa**, no copies.
- **utils/** solo lógica pura (sin React, sin hooks). Es lo que más tests recibe.
- **handlers/** son `createHandleX(deps)` que retornan funciones; el wiring vive en `AppStateContext`.

---

## 2. Receta — añadir una feature "tracker de hidratación"

Ejemplo concreto: queremos que el usuario registre vasos de agua.

### Paso 1 — Decide el dominio

¿Es nuevo (`features/hydration/`) o vive dentro de uno existente (`features/wellness/`)? **Prefiere reusar** un dominio si encaja.

En este caso, hidratación encaja en `wellness/`. Trabajamos ahí.

### Paso 2 — Tipos (si aplica)

Si introduces nuevos modelos, añádelos en `src/types/`:

```ts
// src/types/hydration.ts
export interface HydrationLog {
  id: string;
  date: string;        // ISO
  amount: number;      // ml
}
```

Y exporta desde el barrel autorizado [src/types/index.ts](../src/types/index.ts).

### Paso 3 — Lógica pura en utils

```ts
// src/features/wellness/utils/hydration.ts
import type { HydrationLog } from '@/types';

export function totalToday(logs: HydrationLog[], today: string): number {
  return logs
    .filter(l => l.date.startsWith(today))
    .reduce((sum, l) => sum + l.amount, 0);
}

export function targetForUser(weightKg: number): number {
  return Math.round(weightKg * 35); // 35 ml/kg
}
```

Y el test en `src/features/wellness/utils/hydration.test.ts`. **Toda función pura debe tener test.** Para hooks y componentes consulta los patterns en [`docs/TESTING-PATTERNS.md`](TESTING-PATTERNS.md).

### Paso 4 — Handler factory

```ts
// src/features/wellness/handlers/hydration-handlers.ts
import type { HydrationLog } from '@/types';

interface Deps {
  setHydrationLogs: (updater: (prev: HydrationLog[]) => HydrationLog[]) => void;
}

export function createLogWaterHandler({ setHydrationLogs }: Deps) {
  return (amount: number) => {
    const log: HydrationLog = {
      id: `h-${Date.now()}`,
      date: new Date().toISOString(),
      amount,
    };
    setHydrationLogs(prev => [...prev, log]);
  };
}
```

### Paso 5 — Wirear en AppStateContext

```tsx
// src/contexts/AppStateContext.tsx (extracto)
const [hydrationLogs, setHydrationLogs] = useLocalStorageState<HydrationLog[]>(
  'hydrationLogs', []
);

const handleLogWater = useMemo(
  () => createLogWaterHandler({ setHydrationLogs }),
  [setHydrationLogs]
);

// añade al value: { ..., hydrationLogs, handleLogWater }
```

> ⚠️ Si tocas `AppStateContext` recuerda actualizar también el tipo del context value y el `useMemo` exterior si lo hubiera. Está creciendo — si tu feature añade más de 3 entries, considera el split previsto en el roadmap (ver `docs/ai/state.md`).

### Paso 6 — Componente de UI

```tsx
// src/features/wellness/components/HydrationCard.tsx
import { useI18n } from '@/i18n';
import { useAppState } from '@/contexts/AppStateContext';
import { SectionCard, Heading, Text } from '@/components/ui';
import { totalToday, targetForUser } from '../utils/hydration';

export function HydrationCard() {
  const { t } = useI18n();
  const { hydrationLogs, handleLogWater, userProfile } = useAppState();
  const today = new Date().toISOString().slice(0, 10);
  const total = totalToday(hydrationLogs, today);
  const target = targetForUser(userProfile.weight ?? 70);

  return (
    <SectionCard title={t.wellness.hydration.title}>
      <Heading level="h3">{total} / {target} ml</Heading>
      <Text variant="body-sm">{t.wellness.hydration.description}</Text>
      <button onClick={() => handleLogWater(250)}>
        {t.wellness.hydration.addGlass}
      </button>
    </SectionCard>
  );
}
```

**Nota**: usa primitives (`SectionCard`, `Heading`, `Text`). No reinventes layout.

### Paso 7 — i18n en ES + EN

```ts
// src/i18n/locales/es.ts
wellness: {
  hydration: {
    title: 'Hidratación',
    description: 'Llevas {total}ml de {target}ml hoy',
    addGlass: 'Añadir vaso (250 ml)',
  },
  // ...
}
```

```ts
// src/i18n/locales/en.ts
wellness: {
  hydration: {
    title: 'Hydration',
    description: '{total}ml of {target}ml today',
    addGlass: 'Add glass (250 ml)',
  },
  // ...
}
```

Verifica simetría:

```bash
npm run check:i18n
```

Más detalle en [i18n-dictionary.md](./i18n-dictionary.md).

### Paso 8 — Render donde toque

Si la feature aparece en Home, edita `src/features/home/screens/Home.tsx` y añade `<HydrationCard />` donde corresponda según ICP-adaptive layout.

### Paso 9 — Validación local

```bash
npx tsc --noEmit
npm run lint:code
npm run test
```

Y prueba en navegador a 375px.

### Paso 10 — Antes de cerrar el cambio

```bash
npm run release:preflight
```

Si el cambio es user-visible o arquitectónico, actualiza:
- [CHANGELOG.md](../CHANGELOG.md) con `## [1.5.XX] — YYYY-MM-DD`.
- [docs/ai/state.md](./ai/state.md) si cambia la línea de release o aparece un riesgo nuevo.

---

## 3. Cuándo crear un nuevo dominio (vs extender uno existente)

Crea `src/features/<nuevo-dominio>/` cuando:

- Es **conceptualmente distinto** de los existentes (ej. tracker de medicación, no encaja en wellness/recipes/social/etc.).
- Va a tener **mínimo 2 screens propios + state propio**.
- Su vocabulario en i18n es disjunto.

Si es solo "una pantalla más" en un dominio que ya existe, **extiende ese dominio**.

Dominios actuales: `home`, `recipes`, `food`, `wellness`, `social`, `planner`, `profile`, `auth`, `legal`, `ai`, `dev`.

---

## 4. Anti-patterns frecuentes

| ❌ No hagas | ✅ Hazlo así |
|---|---|
| Handler inline en JSX que muta state | Extrae a `createHandleX` factory |
| `<div className="bg-zinc-900 rounded-lg p-4">` | `<SectionCard>` o token semánticos |
| Hardcodear `'Hidratación'` en JSX | `{t.wellness.hydration.title}` |
| `text-[14px]` | `text-body` |
| `dark:bg-black` | Token de surface (`bg-background`) |
| Crear `src/features/foo/index.ts` re-exportando todo | Imports directos |
| `import { ... } from '../../../components'` | Usa alias `@components/...` |
| Saltar `npm run check:i18n` | Es 2 segundos. Hazlo. |

---

## 5. Quick reference de aliases

| Alias | Path |
|---|---|
| `@/...` | `src/...` |
| `@features/...` | `src/features/...` |
| `@components/...` | `src/components/...` |
| `@hooks/...` | `src/hooks/...` |
| `@i18n` | `src/i18n` |

Configurados en [tsconfig.json](../tsconfig.json) y [vite.config.ts](../vite.config.ts).
