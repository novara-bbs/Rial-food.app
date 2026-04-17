# ADR-009 — Bottom-sheet anatomy

- Status: Accepted
- Date: 2026-04-17
- Supersedes: —
- Related: ADR-001 (primitives), ADR-003 (HIG 44×44), playbook `docs/market/bevel-design-playbook.md` §4.4

## Context

RIAL hoy usa `src/components/ui/sheet.tsx` (shadcn new-york, radix-ui dialog bajo capó) como base para sheets — `MealSlotMultiSelect`, `RecipeDaySelectorSheet`, `PhotoUploader`, `LogSnapshotModal`, `AddMeal`, `BarcodeScanner`, `ImportRecipeURL`. El primitive shadcn ofrece `side="bottom"` pero:

1. **No limita altura** → el sheet crece a 100 vh en contenido largo, cubriendo status bar y dynamic island.
2. **Overlay `bg-black/50`** → contraste excesivo con el contenido detrás; rompe el sense of place.
3. **Sin handle bar visible** → el swipe-to-close no es descubrible; el único cierre visible es tap overlay o X custom.
4. **Sticky header no estandarizado** → cada consumer reinventa el par close + title + action.

Análisis Bevel (50 capturas) muestra una anatomía consistente (ver playbook §4.4 + IMG_0984/0985/0995/1004) que resuelve los 4 puntos:

- Status bar y dynamic island **siempre visibles** detrás del sheet.
- Overlay atenuado (20–30% opacity) — el contenido detrás se adivina, no se borra.
- Handle pill visible arriba del sheet — swipe-to-close descubrible.
- Header sticky con X izquierda, título centrado, acción slot derecha.
- Rounded top prominente (`rounded-t-3xl`).

El mismo patrón es estándar iOS 17+ native sheets (detents) y Material 3 modal bottom sheets. RIAL **no** debe reinventar — debe estandarizar.

## Decision

Todos los nuevos bottom-sheets en RIAL usan un primitive `<BottomSheet>` wrapper sobre shadcn `Sheet side="bottom"` con los siguientes defaults no opcionales:

### Anatomy

| Slot | Valor | Token |
|---|---|---|
| **Max height** | 88 vh | `max-h-[88vh]` |
| **Top radius** | 24 px | `rounded-t-3xl` (ver ADR-007) |
| **Bottom radius** | 0 | none |
| **Handle bar** | pill 4×32 px, centrado, 8 px del borde top | `bg-outline-variant/60 rounded-full` |
| **Overlay** | 25% black | `bg-black/25` (no 50%) |
| **Header sticky** | X izq · título · acción slot der · padding 16 px vertical | slot-based |
| **Content** | scrollable dentro del sheet | `overflow-y-auto flex-1` |
| **Cierre** | tap overlay + swipe down handle + botón X | radix nativo + handle custom |
| **Stacking** | nativo radix (un sheet sobre otro) | unchanged |

### API mínima (sketch)

```tsx
<BottomSheet
  open={open}
  onOpenChange={setOpen}
  title="Objetivos de nutrientes"
  actionSlot={<IconButton icon={Settings} ... />}
>
  <div>…contenido scrollable…</div>
</BottomSheet>
```

El componente provee:
- `title: string` (obligatorio, accesibilidad).
- `actionSlot?: ReactNode` (opcional, renderiza en header derecho).
- `children: ReactNode` (contenido scrollable).
- `onOpenChange`, `open` (controlled, mismo API shadcn).

Props adicionales (`description`, `defaultOpen`, etc.) se heredan del shadcn Sheet.

### Cuándo usar `<BottomSheet>` vs alternativas

| Caso | Primitive |
|---|---|
| Acción secundaria contextual (picker, editor, detalle drill-down) | **`<BottomSheet>`** |
| Confirmación destructiva / diálogo corto con 2 CTAs | `<ConfirmDialog>` |
| Flow completo multi-step (onboarding, checkout) | pantalla full screen (`<PageShell>`) |
| Tooltip / hint < 3 líneas | `<Popover>` o `<Tooltip>` |
| System native (HealthKit permissions, StoreKit) | iOS/Android nativo, no custom |

### Migration path

- `src/components/ui/sheet.tsx` queda intacto (legacy). Marcar en doc "use `<BottomSheet>` for new code".
- Consumers existentes migran progresivamente (2 en PR 2, 5 más en PR 4 del roadmap playbook).
- Test `src/test/conventions/bottom-sheet.test.ts` assert defaults (max-h, rounded, handle presence, overlay opacity).

## Consequences

- Nuevo código que necesita un bottom-sheet usa `<BottomSheet>`; revisores rechazan `<Sheet side="bottom">` inline.
- Los consumers migrados dejan de implementar su propio header close + title + action → reducción de LOC y consistencia UX inmediata.
- **Status bar + dynamic island visibles detrás** mejora sense of place (estilo iOS 17 detents). El user nunca siente que "entró a otra pantalla".
- Overlay 25% mantiene contexto visual — reduce fricción cognitiva vs overlay 50%.
- Stacking (sheet sobre sheet, ej. buscador dentro de editor) sigue funcionando por herencia radix.
- Tests de convención bloquean regresiones: un sheet sin handle, sin max-h o con overlay 50% falla CI.
- Cambios de theming (`.theme-light` vs dark) no requieren touch en `<BottomSheet>` — todos los tokens (`bg-black/25`, `bg-outline-variant/60`, `rounded-t-3xl`) se resuelven desde design system.
- No retroactivo: los sheets actuales siguen funcionando hasta ser migrados. No breaking change.
- El primitive es **wrapper**, no fork — radix primitive sigue siendo la source of truth; `<BottomSheet>` solo impone defaults + slot layout.

## Open items

- **Detents iOS-style** (sheet con 3 alturas: 33 / 66 / 88 vh) — **defer**. Requiere gesture state que radix no expone directamente. Evaluar `vaul` (drawer library) en Q17 si el user lo pide.
- **Swipe-to-dismiss animation** — radix lo provee nativamente; verificar que el handle tap también cierra.
- **Keyboard-aware padding** — si el sheet contiene `<input>` (buscador, CreateRecipe), el keyboard no debe tapar el field. Requiere `padding-bottom: env(keyboard-inset-height)` o similar. Validar en PR 2 durante migration piloto.
