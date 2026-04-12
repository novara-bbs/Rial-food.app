import { ArrowLeft, Check, Crown, Sparkles, Brain, ShoppingCart, Zap, Lock, Star, BarChart3, Download, Microscope, Archive, ClipboardList, Globe, Timer, Target, type LucideIcon } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useI18n } from '../../../i18n';
import PageHeader from '../../../components/patterns/PageHeader';

export default function RialPlus({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const f = t.rialPlus.screen;
  const p = t.rialPlus.plans;

  const FEATURES: { icon: LucideIcon; label: string; free: boolean | string; pro: boolean | string }[] = [
    { icon: Brain, label: f.aiCoach, free: false, pro: true },
    { icon: BarChart3, label: f.realFeelDiary, free: false, pro: true },
    { icon: ShoppingCart, label: f.smartShoppingList, free: f.threeItems, pro: f.unlimited },
    { icon: Download, label: f.importRecipes, free: f.twoPerMonth, pro: f.unlimitedMasc },
    { icon: Microscope, label: f.advancedCorrelations, free: false, pro: true },
    { icon: Archive, label: f.pantryPlanning, free: false, pro: true },
    { icon: ClipboardList, label: f.weeklyReflection, free: false, pro: true },
    { icon: Globe, label: f.premiumCreators, free: false, pro: true },
    { icon: Timer, label: f.fastingTimer, free: f.basic, pro: f.allProtocols },
    { icon: Target, label: f.customGoals, free: '1', pro: f.unlimitedPlural },
  ];

  const PLANS = [
    { id: 'monthly', label: p.monthly, price: p.monthlyPrice, period: p.monthlyPeriod, savings: null },
    { id: 'yearly', label: p.yearly, price: p.yearlyPrice, period: p.yearlyPeriod, savings: p.yearlySavings },
  ];
  const { isPro, setIsPro } = useAppState();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = () => {
    setIsUpgrading(true);
    // Simulate payment flow
    setTimeout(() => {
      setIsPro(true);
      setIsUpgrading(false);
      toast.success(t.rialPlus.welcomePro, { duration: 4000 });
      onBack();
    }, 2000);
  };

  if (isPro) {
    return (
      <PageShell maxWidth="default" spacing="lg">
        <PageHeader onBack={onBack} label="" title="RIAL+" />
        <div className="text-center py-16 space-y-6">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Crown className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-headline text-3xl font-bold uppercase text-tertiary">{t.rialPlus.alreadyPro}</h2>
          <p className="text-on-surface-variant max-w-md mx-auto font-body">
            {t.rialPlus.proDescription}
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-sm p-4 max-w-xs mx-auto">
            <p className="font-label text-xs uppercase tracking-widest text-primary font-bold">{t.rialPlus.activePlan}</p>
            <p className="font-headline text-lg font-bold text-tertiary mt-1">{t.rialPlus.renewal}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative bg-primary/10 border-b border-primary/20 px-6 pt-6 pb-12">
        <button type="button" onClick={onBack} className="absolute top-6 left-6 p-2 hover:bg-surface-container-highest rounded-sm transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center pt-10 space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-headline text-4xl font-black tracking-tighter uppercase text-tertiary">RIAL+</h1>
          <p className="text-on-surface-variant max-w-sm mx-auto font-body text-sm leading-relaxed">
            {t.rialPlus.heroDescription}
          </p>
        </div>
      </div>

      <div className="px-6 max-w-2xl mx-auto mt-8 space-y-8">
        {/* Plan selector */}
        <div className="grid grid-cols-2 gap-3">
          {PLANS.map(plan => (
            <button type="button"
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id as 'monthly' | 'yearly')}
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
          <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary mb-4">{t.rialPlus.whatsIncluded}</h3>
          <div className="space-y-2">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-outline-variant/10 last:border-0">
                <f.icon className="w-5 h-5 text-primary shrink-0" />
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
            {t.rialPlus.testimonial}
          </p>
          <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant mt-3">{t.rialPlus.testimonialAuthor}</p>
        </div>

        {/* CTA */}
        <div className="fixed left-0 right-0 px-6 z-50" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}>
          <div className="max-w-2xl mx-auto">
            <button type="button"
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full py-5 bg-primary text-on-primary rounded-sm font-headline font-black text-lg uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-primary/30"
            >
              {isUpgrading ? (
                <><Sparkles className="w-6 h-6 animate-pulse" /> {t.rialPlus.processing}</>
              ) : (
                <><Crown className="w-6 h-6" /> {t.rialPlus.startRialPlus} — {selectedPlan === 'yearly' ? `${p.yearlyPrice}${p.yearlyPeriod}` : `${p.monthlyPrice}${p.monthlyPeriod}`}</>
              )}
            </button>
            <p className="text-center text-[9px] text-on-surface-variant uppercase tracking-widest mt-3">
              {t.rialPlus.cancelAnytime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
