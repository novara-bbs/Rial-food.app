import type { Story } from '../../../types/social';

const now = Date.now();
const h = (hours: number) => new Date(now - hours * 3600000).toISOString();
const future = (hours: number) => new Date(now + hours * 3600000).toISOString();

export const SEED_STORIES: Story[] = [
  {
    id: 'story-marcus-1',
    authorId: 'marcus-vance',
    authorName: 'Marcus V.',
    authorAvatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80',
    slides: [
      { id: 's1-1', type: 'text', content: 'Semana 12 de entrenamiento. ¡Nuevo récord personal en sentadilla! 💪', backgroundColor: '#1a1a2e' },
      { id: 's1-2', type: 'performance', performance: { recovery: 98, strain: 18.4 } },
    ],
    createdAt: h(6),
    expiresAt: future(18),
    viewedBy: [],
  },
  {
    id: 'story-elara-1',
    authorId: 'elara-k',
    authorName: 'Elara K.',
    authorAvatar: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80',
    slides: [
      { id: 's2-1', type: 'recipe', recipe: { id: 'bol-energetico', title: 'Bol de Nutrientes Energético', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80', cal: 680, pro: 55 } },
      { id: 's2-2', type: 'text', content: '¡Hoy probé esto y cambió mi mañana! Proteína + fibra = energía todo el día.', backgroundColor: '#0d3b66' },
    ],
    createdAt: h(3),
    expiresAt: future(21),
    viewedBy: [],
  },
  {
    id: 'story-chef-marta',
    authorId: 'chef-marta',
    authorName: 'ChefMarta',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    slides: [
      { id: 's3-1', type: 'text', content: 'Nueva receta esta tarde. Preparad vuestras sartenes 🍳', backgroundColor: '#2d6a4f' },
    ],
    createdAt: h(1),
    expiresAt: future(23),
    viewedBy: [],
  },
];
