// 21 RealFeel log entries spread over 2026-04-02 → 2026-04-15 (14 days, 1-2 per day)
// Shape mirrors createHandleRealFeelLog output in wellness-handlers.ts

export const SEED_REAL_FEEL_LOGS = [
  // 2026-04-15 — two entries (good start to the day, heavier afternoon)
  {
    id: 1714168200000,
    date: '2026-04-15T08:30:00.000Z',
    level: 4,
    tags: ['energy', 'clarity'],
    note: 'Desperté descansado, el desayuno de avena sentó perfecto.',
    mealIds: [],
    ingredientIds: [],
  },
  {
    id: 1714186800000,
    date: '2026-04-15T13:40:00.000Z',
    level: 3,
    tags: ['heaviness'],
    note: 'Almuerzo copioso, un poco pesado después.',
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-14 — one entry
  {
    id: 1714089600000,
    date: '2026-04-14T09:00:00.000Z',
    level: 5,
    tags: ['energy', 'clarity', 'lightness'],
    note: 'Semana empezando con mucha energía y mente despejada.',
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-13 — two entries
  {
    id: 1714003200000,
    date: '2026-04-13T08:15:00.000Z',
    level: 4,
    tags: ['energy', 'lightness'],
    note: undefined,
    mealIds: [],
    ingredientIds: [],
  },
  {
    id: 1714021800000,
    date: '2026-04-13T13:30:00.000Z',
    level: 3,
    tags: ['bloating'],
    note: 'Un poco de hinchazón después del almuerzo de legumbres.',
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-12 — one entry (weekend)
  {
    id: 1713952800000,
    date: '2026-04-12T11:00:00.000Z',
    level: 2,
    tags: ['bloating', 'heaviness', 'drowsiness'],
    note: 'Comí demasiado en el brunch del domingo, me sentí muy pesado.',
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-11 — two entries
  {
    id: 1713862800000,
    date: '2026-04-11T09:30:00.000Z',
    level: 3,
    tags: ['energy'],
    note: undefined,
    mealIds: [],
    ingredientIds: [],
  },
  {
    id: 1713880800000,
    date: '2026-04-11T14:20:00.000Z',
    level: 4,
    tags: ['lightness', 'clarity'],
    note: 'La ensalada de salmón estuvo genial, me siento ágil.',
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-10 — one entry
  {
    id: 1713780000000,
    date: '2026-04-10T08:00:00.000Z',
    level: 3,
    tags: ['energy'],
    note: undefined,
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-09 — two entries
  {
    id: 1713693600000,
    date: '2026-04-09T09:00:00.000Z',
    level: 4,
    tags: ['energy', 'lightness'],
    note: undefined,
    mealIds: [],
    ingredientIds: [],
  },
  {
    id: 1713718800000,
    date: '2026-04-09T15:40:00.000Z',
    level: 3,
    tags: ['headache'],
    note: 'Poca hidratación hoy, leve dolor de cabeza por la tarde.',
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-08 — one entry
  {
    id: 1713607200000,
    date: '2026-04-08T08:30:00.000Z',
    level: 4,
    tags: ['energy', 'clarity'],
    note: 'Buena noche de sueño, el smoothie matutino ayudó.',
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-07 — two entries
  {
    id: 1713520800000,
    date: '2026-04-07T08:00:00.000Z',
    level: 3,
    tags: ['energy'],
    note: undefined,
    mealIds: [],
    ingredientIds: [],
  },
  {
    id: 1713542400000,
    date: '2026-04-07T14:00:00.000Z',
    level: 2,
    tags: ['cramps', 'bloating'],
    note: 'Malestar digestivo después del almuerzo, posible intolerancia al suero.',
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-06 — one entry (weekend)
  {
    id: 1713448800000,
    date: '2026-04-06T10:30:00.000Z',
    level: 3,
    tags: ['heaviness', 'drowsiness'],
    note: 'Día relajado, comí bien pero bastante.',
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-05 — two entries
  {
    id: 1713358800000,
    date: '2026-04-05T09:00:00.000Z',
    level: 5,
    tags: ['energy', 'clarity', 'lightness'],
    note: 'Semana perfecta hasta ahora, sigo mi plan al 100%.',
    mealIds: [],
    ingredientIds: [],
  },
  {
    id: 1713384000000,
    date: '2026-04-05T16:00:00.000Z',
    level: 4,
    tags: ['energy'],
    note: undefined,
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-04 — one entry
  {
    id: 1713272400000,
    date: '2026-04-04T08:30:00.000Z',
    level: 3,
    tags: ['energy'],
    note: undefined,
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-03 — one entry
  {
    id: 1713186000000,
    date: '2026-04-03T09:15:00.000Z',
    level: 4,
    tags: ['clarity', 'lightness'],
    note: 'Cenar ligero la noche anterior marcó la diferencia.',
    mealIds: [],
    ingredientIds: [],
  },

  // 2026-04-02 — two entries
  {
    id: 1713099600000,
    date: '2026-04-02T08:00:00.000Z',
    level: 3,
    tags: ['energy'],
    note: undefined,
    mealIds: [],
    ingredientIds: [],
  },
  {
    id: 1713124800000,
    date: '2026-04-02T15:00:00.000Z',
    level: 2,
    tags: ['bloating', 'heaviness'],
    note: 'Almuerzo fuera de lo habitual, salsa cremosa me cayó pesado.',
    mealIds: [],
    ingredientIds: [],
  },
];
