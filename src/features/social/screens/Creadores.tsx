import { CheckCircle2, Users, BookOpen } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useAppState } from '../../../contexts/AppStateContext';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { MOCK_CREATORS } from '../data/seed-creators';

export default function Creadores() {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const { setSelectedCreatorId } = useAppState();
  const [followedCreators, setFollowedCreators] = useLocalStorageState<string[]>('followedCreators', []);

  const openProfile = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    navigateTo('creator-profile');
  };

  const toggleFollow = (creatorId: string) => {
    setFollowedCreators((prev: string[]) =>
      prev.includes(creatorId) ? prev.filter(c => c !== creatorId) : [...prev, creatorId]
    );
  };

  return (
    <div className="px-6 max-w-5xl mx-auto space-y-6 pb-24">
      <div className="space-y-3">
        {MOCK_CREATORS.map(creator => {
          const isFollowing = followedCreators.includes(creator.id);
          return (
            <div key={creator.id} onClick={() => openProfile(creator.id)} className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <img src={creator.avatar} alt={creator.name} className="w-14 h-14 rounded-full object-cover border-2 border-outline-variant/20" referrerPolicy="no-referrer" />
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
                  </div>
                </div>
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); toggleFollow(creator.id); }}
                  aria-label={`${isFollowing ? t.explore.creators.following : t.explore.creators.follow} @${creator.name}`}
                  className={`shrink-0 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isFollowing
                      ? 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 hover:border-error/50 hover:text-error'
                      : 'bg-primary text-on-primary hover:opacity-90'
                  }`}
                >
                  {isFollowing ? t.explore.creators.following : t.explore.creators.follow}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
