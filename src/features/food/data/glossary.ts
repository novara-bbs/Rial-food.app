/**
 * P10 `[1.5.67]` — glosario técnico para subcategorías botánicas / culinarias.
 *
 * Owner directive 2026-04-21: mantenemos la jerga técnica (crucíferas,
 * solanáceas, alliums, pseudocereales, …) porque el usuario **quiere
 * aprender**, pero ofrecemos ayuda accesible con un botón (i) junto al
 * header de subcategoría que abre un popover con ejemplos concretos y
 * definición corta.
 *
 * Solo las subcategorías que *necesitan* explicación tienen entrada. Labels
 * auto-explicativos (`yogur`, `leche`, `frutos-secos`) NO aparecen aquí —
 * el GlossaryButton sólo renderiza cuando `GLOSSARY[slug]` existe.
 *
 * Las definiciones bilingües viven en i18n (`foodDictionary.glossary.*`)
 * para consistencia con el resto del sistema. El archivo aquí mantiene los
 * ejemplos-cara (productos conocidos) porque son lista plana de strings que
 * no requieren traducción (son nombres de alimento ya cubiertos por las
 * families del diccionario).
 */

export interface GlossaryEntry {
  slug: string;
  /** Alimentos reconocibles que pertenecen a la categoría — 3-5 ejemplos. */
  examples: string[];
}

/**
 * Map subcategory slug → glossary entry. Only entries that need explanation.
 * Keys must match `FAMILY_SUBCATEGORY` values in `food-families.ts`.
 */
export const GLOSSARY: Record<string, GlossaryEntry> = {
  'cruciferas': {
    slug: 'cruciferas',
    examples: ['Col', 'Brócoli', 'Coliflor', 'Col rizada', 'Rúcula'],
  },
  'solanaceas': {
    slug: 'solanaceas',
    examples: ['Tomate', 'Pimiento', 'Berenjena', 'Patata'],
  },
  'alliums': {
    slug: 'alliums',
    examples: ['Cebolla', 'Ajo', 'Puerro', 'Cebolleta'],
  },
  'cucurbitaceas': {
    slug: 'cucurbitaceas',
    examples: ['Calabaza', 'Pepino', 'Melón', 'Calabacín', 'Sandía'],
  },
  'pseudocereales': {
    slug: 'pseudocereales',
    examples: ['Quinoa', 'Trigo sarraceno', 'Amaranto'],
  },
  'raices-tuberculos': {
    slug: 'raices-tuberculos',
    examples: ['Patata', 'Zanahoria', 'Remolacha', 'Boniato'],
  },
  'pescado-azul': {
    slug: 'pescado-azul',
    examples: ['Salmón', 'Atún', 'Sardina', 'Caballa'],
  },
  'pescado-blanco': {
    slug: 'pescado-blanco',
    examples: ['Merluza', 'Bacalao', 'Lubina', 'Dorada'],
  },
  'grasas-lacteas': {
    slug: 'grasas-lacteas',
    examples: ['Mantequilla', 'Nata', 'Ghee'],
  },
  'mantecas-pastas': {
    slug: 'mantecas-pastas',
    examples: ['Crema de cacahuete', 'Tahini', 'Crema de almendra'],
  },
};

/** Returns the glossary entry for a subcategory slug, or `undefined`. */
export function getGlossaryEntry(slug: string): GlossaryEntry | undefined {
  return GLOSSARY[slug];
}
