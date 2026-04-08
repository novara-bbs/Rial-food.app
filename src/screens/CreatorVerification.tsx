import { ArrowLeft, Check, Clock, ChevronRight, BadgeCheck, Utensils, Heart, Trophy, Home } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAppState } from '../contexts/AppStateContext';

const BADGES = [
  { id: 'chef', label: 'Chef Profesional', icon: Utensils, desc: 'Formación culinaria o experiencia profesional' },
  { id: 'nutricionista', label: 'Nutricionista', icon: Heart, desc: 'Titulación en nutrición o dietética' },
  { id: 'atleta', label: 'Atleta / Entrenador', icon: Trophy, desc: 'Enfoque en rendimiento deportivo y nutrición' },
  { id: 'home-cook', label: 'Home Cook', icon: Home, desc: 'Cocinero apasionado con recetas propias' },
];

interface Requirement {
  label: string;
  current: number;
  target: number;
  met: boolean;
}

export default function CreatorVerification({ onBack }: { onBack: () => void }) {
  const { savedRecipes, communityPosts } = useAppState();
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Simulated stats (in production these would come from backend)
  const recipesCount = savedRecipes.length;
  const postsCount = communityPosts.length;
  const simulatedFollowers = 12;
  const simulatedRating = 3.8;
  const simulatedDaysActive = 18;

  const requirements: Requirement[] = [
    { label: '10 recetas publicadas', current: recipesCount, target: 10, met: recipesCount >= 10 },
    { label: '100 seguidores', current: simulatedFollowers, target: 100, met: simulatedFollowers >= 100 },
    { label: 'Valoración ≥ 4.0', current: simulatedRating, target: 4.0, met: simulatedRating >= 4.0 },
    { label: '30 días activo', current: simulatedDaysActive, target: 30, met: simulatedDaysActive >= 30 },
  ];

  const metCount = requirements.filter(r => r.met).length;
  const allMet = metCount === requirements.length;

  const handleApply = () => {
    if (!selectedBadge) {
      toast.error('Selecciona una insignia para continuar');
      return;
    }
    setSubmitted(true);
    toast.success('¡Solicitud enviada! Te notificaremos en 3-5 días.', { duration: 5000 });
  };

  if (submitted) {
    return (
      <div className="px-6 max-w-2xl mx-auto space-y-8 pb-24">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-surface-container-highest rounded-sm transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">Verificación</h1>
        </div>
        <div className="text-center py-16 space-y-6">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h2 className="font-headline text-2xl font-bold uppercase text-tertiary">Solicitud en revisión</h2>
          <p className="text-on-surface-variant font-body text-sm max-w-sm mx-auto leading-relaxed">
            Nuestro equipo revisará tu perfil en los próximos 3-5 días hábiles. Te notificaremos por la app cuando tengamos una respuesta.
          </p>
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 max-w-xs mx-auto text-left space-y-2">
            <p className="font-label text-[9px] uppercase tracking-widest text-primary font-bold">Resumen de solicitud</p>
            <p className="text-sm font-body text-on-surface">
              Insignia: <span className="font-bold">{BADGES.find(b => b.id === selectedBadge)?.label}</span>
            </p>
            <p className="text-sm font-body text-on-surface">
              Requisitos cumplidos: <span className="font-bold text-primary">{metCount}/4</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 max-w-2xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-surface-container-highest rounded-sm transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">RIAL</span>
          <h1 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">Verificación Creador</h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary">Progreso</span>
          <span className="font-headline text-sm font-black text-primary">{metCount}/4 requisitos</span>
        </div>
        <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(metCount / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-3">
        <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">Requisitos</h3>
        {requirements.map((req, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 p-4 rounded-sm border transition-colors ${
              req.met
                ? 'bg-primary/5 border-primary/30'
                : 'bg-surface-container-low border-outline-variant/20'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${req.met ? 'bg-primary' : 'bg-surface-container-highest'}`}>
              {req.met
                ? <Check className="w-4 h-4 text-on-primary" />
                : <span className="font-headline font-black text-xs text-on-surface-variant">{i + 1}</span>
              }
            </div>
            <div className="flex-1">
              <p className={`font-body text-sm font-medium ${req.met ? 'text-primary' : 'text-on-surface'}`}>{req.label}</p>
              {!req.met && (
                <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant mt-0.5">
                  {typeof req.current === 'number' && req.current < req.target
                    ? `${req.current} / ${req.target}`
                    : 'No cumplido'}
                </p>
              )}
            </div>
            {!req.met && (
              <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Badge selection */}
      <div className="space-y-3">
        <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">Selecciona tu insignia</h3>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map(badge => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge.id)}
              className={`p-4 rounded-sm border-2 text-left transition-all ${
                selectedBadge === badge.id
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant/20 bg-surface-container-low hover:border-primary/40'
              }`}
            >
              <badge.icon className={`w-6 h-6 mb-2 ${selectedBadge === badge.id ? 'text-primary' : 'text-on-surface-variant'}`} />
              <p className={`font-headline font-bold text-sm uppercase ${selectedBadge === badge.id ? 'text-primary' : 'text-tertiary'}`}>
                {badge.label}
              </p>
              <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant mt-1 leading-relaxed">
                {badge.desc}
              </p>
              {selectedBadge === badge.id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-on-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary block mb-2">
          Cuéntanos sobre ti <span className="text-on-surface-variant font-normal normal-case">(opcional)</span>
        </label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="¿Por qué quieres ser creador verificado en RIAL? ¿Cuál es tu especialidad?"
          rows={4}
          className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary resize-none"
        />
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <button
          onClick={handleApply}
          disabled={!allMet && metCount < 2}
          className="w-full py-4 bg-primary text-on-primary rounded-sm font-headline font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <BadgeCheck className="w-5 h-5" />
          {allMet ? 'Solicitar Verificación' : `Aplicar (${metCount}/4 requisitos)`}
        </button>
        {!allMet && (
          <p className="text-center text-[10px] text-on-surface-variant font-label uppercase tracking-widest">
            Puedes aplicar con al menos 2 requisitos cumplidos. La verificación puede demorar más.
          </p>
        )}
      </div>
    </div>
  );
}
