import type { ToleranceLog } from '../../../types/wellness';

export const SEED_TOLERANCE_LOGS: ToleranceLog[] = [
  {
    id: 'seed-tol-1',
    userId: 'seed',
    date: '2026-04-01',
    food: 'Avena Cortada en Acero',
    reaction: 'Mild',
    symptoms: 'Energía sostenida durante más de 4 horas. Sin hinchazón.',
  },
  {
    id: 'seed-tol-2',
    userId: 'seed',
    date: '2026-04-05',
    food: 'Concentrado de Suero',
    reaction: 'Moderate',
    symptoms: 'Leve malestar digestivo y letargo post-consumo.',
  },
  {
    id: 'seed-tol-3',
    userId: 'seed',
    date: '2026-04-10',
    food: 'Mantequilla de Almendras',
    reaction: 'Mild',
    symptoms: 'Buena energía, pero pesada si se consume muy cerca del entrenamiento.',
  },
];
