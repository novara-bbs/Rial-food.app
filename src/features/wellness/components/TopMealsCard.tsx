import { UtensilsCrossed } from 'lucide-react';
import SectionCard from '@/components/SectionCard';
import type { calcTopMeals } from '../utils/top-meals';

type TopMeal = ReturnType<typeof calcTopMeals>[number];

export interface TopMealsCardProps {
  meals: TopMeal[];
  title: string;
  viewAllLabel: string;
  onViewAll: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function TopMealsCard({ meals, title, viewAllLabel, onViewAll }: TopMealsCardProps) {
  if (meals.length === 0) return null;

  return (
    <SectionCard
      title={title}
      icon={<UtensilsCrossed className="w-4 h-4 text-primary" />}
    >
      <div className="space-y-2">
        {meals.map((meal, i) => (
          <div key={meal.name} className="flex items-center gap-3 p-2.5 bg-surface-container rounded-sm">
            <span className="text-base shrink-0">{MEDALS[i] || ''}</span>
            <span className="flex-1 font-headline text-micro font-bold uppercase text-tertiary truncate">{meal.name}</span>
            <span className="font-label text-micro text-on-surface-variant shrink-0">×{meal.count}</span>
            <span className="font-label text-micro font-bold text-primary shrink-0">{Math.round(meal.totalCal / meal.count)} kcal</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onViewAll}
        className="w-full text-center text-micro font-bold text-primary uppercase tracking-widest hover:underline pt-2 border-t border-outline-variant/10"
      >
        {viewAllLabel}
      </button>
    </SectionCard>
  );
}
