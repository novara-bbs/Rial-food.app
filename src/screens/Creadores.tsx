import { CheckCircle2, Users, BookOpen } from 'lucide-react';
import { useI18n } from '../i18n';

const MOCK_CREATORS = [
  { id: 1, name: 'ChefMarta', badge: 'Chef', verified: true, followers: 12400, recipes: 48, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', streak: 45, bio: 'Nutricionista y chef. Recetas sanas que saben bien.' },
  { id: 2, name: 'FitCarlos', badge: 'Atleta', verified: true, followers: 8900, recipes: 32, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', streak: 67, bio: 'Entrenador personal. Alto proteína, bajo esfuerzo.' },
  { id: 3, name: 'VeganLucia', badge: 'Home Cook', verified: true, followers: 5600, recipes: 25, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', streak: 30, bio: 'Cocina vegana para toda la familia.' },
  { id: 4, name: 'NutriAlex', badge: 'Nutricionista', verified: false, followers: 2100, recipes: 15, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', streak: 12, bio: 'Dietista. Comida real para gente real.' },
];

export default function Creadores() {
  const { t } = useI18n();

  return (
    <div className="px-6 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Featured creators */}
      <div className="space-y-3">
        {MOCK_CREATORS.map(creator => (
          <div key={creator.id} className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 hover:border-primary/50 transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <img src={creator.avatar} alt={creator.name} className="w-14 h-14 rounded-full object-cover border-2 border-outline-variant/20" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-sm uppercase text-tertiary">@{creator.name}</h3>
                  {creator.verified && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded inline-block mt-1">{creator.badge}</span>
                <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{creator.bio}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {(creator.followers / 1000).toFixed(1)}K {t.explore.creators.followers}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {creator.recipes} {t.explore.creators.recipes}</span>
                  <span>🔥 {creator.streak} {t.home.days}</span>
                </div>
              </div>
              <button className="shrink-0 px-4 py-2 bg-primary text-on-primary rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                {t.explore.creators.follow}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
