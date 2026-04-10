import type { SocialLinks } from '../../../types/social';

export interface Creator {
  id: string;
  name: string;
  badge: string;
  verified: boolean;
  followers: number;
  recipes: number;
  avatar: string;
  streak: number;
  bio: string;
  socialLinks?: SocialLinks;
}

export const MOCK_CREATORS: Creator[] = [
  {
    id: 'chef-marta',
    name: 'ChefMarta',
    badge: 'Chef',
    verified: true,
    followers: 12400,
    recipes: 48,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    streak: 45,
    bio: 'Nutricionista y chef. Recetas sanas que saben bien.',
    socialLinks: { instagram: 'chefmarta', youtube: 'https://youtube.com/@chefmarta', website: 'https://chefmarta.com' },
  },
  {
    id: 'fit-carlos',
    name: 'FitCarlos',
    badge: 'Atleta',
    verified: true,
    followers: 8900,
    recipes: 32,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    streak: 67,
    bio: 'Entrenador personal. Alto proteína, bajo esfuerzo.',
    socialLinks: { instagram: 'fitcarlos', youtube: 'https://youtube.com/@fitcarlos', tiktok: 'fitcarlos' },
  },
  {
    id: 'vegan-lucia',
    name: 'VeganLucia',
    badge: 'Home Cook',
    verified: true,
    followers: 5600,
    recipes: 25,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    streak: 30,
    bio: 'Cocina vegana para toda la familia.',
    socialLinks: { instagram: 'veganlucia', tiktok: 'veganlucia' },
  },
  {
    id: 'nutri-alex',
    name: 'NutriAlex',
    badge: 'Nutricionista',
    verified: false,
    followers: 2100,
    recipes: 15,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    streak: 12,
    bio: 'Dietista. Comida real para gente real.',
    socialLinks: { instagram: 'nutrialex', website: 'https://nutrialex.blog' },
  },
  {
    id: 'elara-k',
    name: 'Elara K.',
    badge: 'Atleta',
    verified: false,
    followers: 3200,
    recipes: 12,
    avatar: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80',
    streak: 22,
    bio: 'Atleta de CrossFit. Combustible real para rendimiento real.',
    socialLinks: { instagram: 'elarak', tiktok: 'elarak' },
  },
  {
    id: 'marcus-vance',
    name: 'Marcus Vance',
    badge: 'Health Coach',
    verified: false,
    followers: 4700,
    recipes: 8,
    avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80',
    streak: 90,
    bio: 'Entrenador de salud holistica. Nutricion + mente + movimiento.',
    socialLinks: { instagram: 'marcusvance', youtube: 'https://youtube.com/@marcusvance' },
  },
];

export const CREATORS_MAP: Record<string, Creator> = Object.fromEntries(
  MOCK_CREATORS.map(c => [c.id, c])
);
