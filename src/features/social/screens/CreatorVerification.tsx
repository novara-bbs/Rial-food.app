import { Check, Clock, ChevronRight, BadgeCheck, Utensils, Heart, Trophy, Home } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAppState } from '../../../contexts/AppStateContext';
import { useI18n } from '../../../i18n';
import PageHeader from '../../../components/patterns/PageHeader';

interface Requirement {
  label: string;
  current: number;
  target: number;
  met: boolean;
}

export default function CreatorVerification({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { savedRecipes, communityPosts } = useAppState();

  const BADGES = [
    { id: 'chef', label: t.creator.badges.chef, icon: Utensils, desc: t.creator.badges.chefDesc },
    { id: 'nutricionista', label: t.creator.badges.nutritionist, icon: Heart, desc: t.creator.badges.nutritionistDesc },
    { id: 'atleta', label: t.creator.badges.athlete, icon: Trophy, desc: t.creator.badges.athleteDesc },
    { id: 'home-cook', label: t.creator.badges.homeCook, icon: Home, desc: t.creator.badges.homeCookDesc },
  ];
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const recipesCount = savedRecipes.length;
  const postsCount = communityPosts.filter((p: any) => p.author?.name !== undefined).length;

  // Compute real metrics from available data
  const followedCreators: string[] = JSON.parse(localStorage.getItem('followedCreators') || '[]');
  const followersCount = followedCreators.length; // simplified: counts how many creators user follows as proxy
  const firstPostDate = communityPosts.length > 0 ? new Date(communityPosts[communityPosts.length - 1]?.date || Date.now()) : new Date();
  const daysActive = Math.max(1, Math.floor((Date.now() - firstPostDate.getTime()) / 86_400_000));

  const requirements: Requirement[] = [
    { label: t.creator.reqs.recipes, current: recipesCount, target: 10, met: recipesCount >= 10 },
    { label: t.creator.reqs.followers, current: followersCount, target: 5, met: followersCount >= 5 },
    { label: t.creator.reqs.rating, current: postsCount, target: 5, met: postsCount >= 5 },
    { label: t.creator.reqs.daysActive, current: daysActive, target: 7, met: daysActive >= 7 },
  ];

  const metCount = requirements.filter(r => r.met).length;
  const allMet = metCount === requirements.length;

  const handleApply = () => {
    if (!selectedBadge) {
      toast.error(t.creator.selectBadgeError);
      return;
    }
    setSubmitted(true);
    toast.success(t.creator.applicationSent, { duration: 5000 });
  };

  if (submitted) {
    return (
      <div className="px-6 max-w-2xl mx-auto space-y-8 pb-24">
        <PageHeader onBack={onBack} label="" title={t.creator.verification} />
        <div className="text-center py-16 space-y-6">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h2 className="font-headline text-2xl font-bold uppercase text-tertiary">{t.creator.underReview}</h2>
          <p className="text-on-surface-variant font-body text-sm max-w-sm mx-auto leading-relaxed">
            {t.creator.reviewDescription}
          </p>
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 max-w-xs mx-auto text-left space-y-2">
            <p className="font-label text-[9px] uppercase tracking-widest text-primary font-bold">{t.creator.applicationSummary}</p>
            <p className="text-sm font-body text-on-surface">
              {t.creator.badge}: <span className="font-bold">{BADGES.find(b => b.id === selectedBadge)?.label}</span>
            </p>
            <p className="text-sm font-body text-on-surface">
              {t.creator.requirementsMet}: <span className="font-bold text-primary">{metCount}/4</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 max-w-2xl mx-auto space-y-6 pb-24">
      <PageHeader onBack={onBack} title={t.creator.verificationCreator} />

      {/* Progress bar */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary">{t.creator.progress}</span>
          <span className="font-headline text-sm font-black text-primary">{metCount}/4 {t.creator.requirementsCount}</span>
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
        <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">{t.creator.requirements}</h3>
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
                    : t.creator.notMet}
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
        <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">{t.creator.selectBadge}</h3>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map(badge => (
            <button type="button"
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
          {t.creator.aboutYou} <span className="text-on-surface-variant font-normal normal-case">{t.creator.optional}</span>
        </label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder={t.creator.bioPlaceholder}
          rows={4}
          className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary resize-none"
        />
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <button type="button"
          onClick={handleApply}
          disabled={!allMet && metCount < 2}
          className="w-full py-4 bg-primary text-on-primary rounded-sm font-headline font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <BadgeCheck className="w-5 h-5" />
          {allMet ? t.creator.applyVerification : `${t.creator.apply} (${metCount}/4 ${t.creator.requirementsCount})`}
        </button>
        {!allMet && (
          <p className="text-center text-[10px] text-on-surface-variant font-label uppercase tracking-widest">
            {t.creator.applyMinimum}
          </p>
        )}
      </div>
    </div>
  );
}
