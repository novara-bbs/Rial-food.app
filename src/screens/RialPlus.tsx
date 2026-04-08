import { ArrowLeft, Check, Crown, Sparkles, Brain, ShoppingCart, Zap, Lock, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAppState } from '../contexts/AppStateContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useI18n } from '../i18n';

const FEATURES = [
  { icon: '🤖', label: 'AI Coach personalizado', free: false, pro: true },
  { icon: '📊', label: 'Real Feel diary ilimitado', free: false, pro: true },
  { icon: '🛒', label: 'Lista de compras inteligente', free: '3 artículos', pro: 'Ilimitada' },
  { icon: '📱', label: 'Importar recetas de URL', free: '2/mes', pro: 'Ilimitado' },
  { icon: '🔬', label: 'Correlaciones avanzadas', free: false, pro: true },
  { icon: '🗄️', label: 'Despensa y planificación', free: false, pro: true },
  { icon: '📋', label: 'Reflexión semanal', free: false, pro: true },
  { icon: '🌍', label: 'Acceso a creadores premium', free: false, pro: true },
  { icon: '⏱️', label: 'Timer de ayuno avanzado', free: 'Básico', pro: 'Todos los protocolos' },
  { icon: '🎯', label: 'Objetivos personalizados', free: '1', pro: 'Ilimitados' },
];

const PLANS = [
  { id: 'monthly', label: 'Mensual', price: '5,99€', period: '/mes', savings: null },
  { id: 'yearly', label: 'Anual', price: '39,99€', period: '/año', savings: 'Ahorra 44%' },
];

export default function RialPlus({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { isPro, setIsPro } = useAppState();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = () => {
    setIsUpgrading(true);
    // Simulate payment flow
    setTimeout(() => {
      setIsPro(true);
      setIsUpgrading(false);
      toast.success('¡Bienvenido a RIAL+! Disfruta de todas las funciones.', { duration: 4000 });
      onBack();
    }, 2000);
  };

  if (isPro) {
    return (
      <div className="px-6 max-w-4xl mx-auto space-y-8 pb-24">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-surface-container-highest rounded-sm transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">RIAL+</h1>
        </div>
        <div className="text-center py-16 space-y-6">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Crown className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-headline text-3xl font-bold uppercase text-tertiary">¡Ya eres miembro Pro!</h2>
          <p className="text-on-surface-variant max-w-md mx-auto font-body">
            Tienes acceso completo a todas las funciones de RIAL+. Sigue construyendo hábitos de alto rendimiento.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-sm p-4 max-w-xs mx-auto">
            <p className="font-label text-xs uppercase tracking-widest text-primary font-bold">Plan activo: Anual</p>
            <p className="font-headline text-lg font-bold text-tertiary mt-1">Renovación: Jul 2027</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Hero */}
      <div className="relative bg-primary/10 border-b border-primary/20 px-6 pt-6 pb-12">
        <button onClick={onBack} className="absolute top-6 left-6 p-2 hover:bg-surface-container-highest rounded-sm transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center pt-10 space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-headline text-4xl font-black tracking-tighter uppercase text-tertiary">RIAL+</h1>
          <p className="text-on-surface-variant max-w-sm mx-auto font-body text-sm leading-relaxed">
            Desbloquea el análisis completo de tu bienestar y todas las herramientas de alto rendimiento.
          </p>
        </div>
      </div>

      <div className="px-6 max-w-2xl mx-auto mt-8 space-y-8">
        {/* Plan selector */}
        <div className="grid grid-cols-2 gap-3">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id as any)}
              className={`relative p-5 rounded-sm border-2 transition-all text-left ${
                selectedPlan === plan.id
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant/20 bg-surface-container-low hover:border-primary/50'
              }`}
            >
              {plan.savings && (
                <span className="absolute -top-3 left-4 bg-primary text-on-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {plan.savings}
                </span>
              )}
              <p className="font-headline font-bold text-sm uppercase text-tertiary">{plan.label}</p>
              <p className="font-headline font-black text-2xl text-primary mt-1">{plan.price}</p>
              <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{plan.period}</p>
              {selectedPlan === plan.id && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-on-primary" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Feature comparison */}
        <div>
          <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-4">¿Qué incluye?</h3>
          <div className="space-y-2">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-outline-variant/10 last:border-0">
                <span className="text-lg shrink-0">{f.icon}</span>
                <span className="flex-1 text-sm font-body text-on-surface">{f.label}</span>
                <div className="flex gap-6 shrink-0">
                  <div className="text-center w-14">
                    {f.free === false ? (
                      <Lock className="w-4 h-4 text-on-surface-variant mx-auto" />
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-on-surface-variant">{f.free === true ? '✓' : f.free}</span>
                    )}
                  </div>
                  <div className="text-center w-14">
                    {f.pro === true ? (
                      <Check className="w-4 h-4 text-primary mx-auto" />
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-primary">{f.pro}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-6 mt-2">
            <div className="text-center w-14">
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Free</span>
            </div>
            <div className="text-center w-14">
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Pro</span>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5">
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 text-primary fill-primary" />)}
          </div>
          <p className="text-sm font-body text-on-surface-variant italic leading-relaxed">
            "Desde que uso RIAL+ mi digestión mejoró notablemente. Las correlaciones me mostraron que el gluten me afectaba sin que yo lo supiera."
          </p>
          <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant mt-3">— María T., Atleta Amateur</p>
        </div>

        {/* CTA */}
        <div className="fixed bottom-8 left-0 right-0 px-6 z-50">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full py-5 bg-primary text-on-primary rounded-sm font-headline font-black text-lg uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-primary/30"
            >
              {isUpgrading ? (
                <><Sparkles className="w-6 h-6 animate-pulse" /> Procesando...</>
              ) : (
                <><Crown className="w-6 h-6" /> Empezar RIAL+ — {selectedPlan === 'yearly' ? '39,99€/año' : '5,99€/mes'}</>
              )}
            </button>
            <p className="text-center text-[9px] text-on-surface-variant uppercase tracking-widest mt-3">
              Cancela cuando quieras · Sin compromisos · Datos seguros
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
