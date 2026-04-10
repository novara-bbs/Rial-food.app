import { Search, CheckCircle2, Users, BookOpen, TrendingUp, Flame, MessageSquare, Compass, Activity, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useAppState } from '../../../contexts/AppStateContext';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { MOCK_CREATORS } from '../../social/data/seed-creators';
import { getTrendingFeed } from '../../social/utils/feed-algorithm';

export default function Discover() {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const { communityPosts, setSelectedCreatorId, setSelectedPostId } = useAppState();
  const [followedCreators] = useLocalStorageState<string[]>('followedCreators', []);
  const [joinedChallenges, setJoinedChallenges] = useLocalStorageState<string[]>('joinedChallenges', []);
  const [searchQuery, setSearchQuery] = useState('');

  const disc = t.discover;

  // Recommended creators (not followed yet)
  const recommendedCreators = useMemo(() =>
    MOCK_CREATORS.filter(c => !followedCreators.includes(c.id)),
    [followedCreators],
  );

  // Followed creators
  const followedCreatorsList = useMemo(() =>
    MOCK_CREATORS.filter(c => followedCreators.includes(c.id)),
    [followedCreators],
  );

  // Trending posts
  const trendingPosts = useMemo(() =>
    getTrendingFeed(communityPosts).slice(0, 5),
    [communityPosts],
  );

  // Search filtering
  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return recommendedCreators;
    const q = searchQuery.toLowerCase();
    return MOCK_CREATORS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.badge.toLowerCase().includes(q) ||
      c.bio.toLowerCase().includes(q)
    );
  }, [searchQuery, recommendedCreators]);

  const toggleChallenge = (id: string) => {
    setJoinedChallenges((prev: string[]) =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const openCreatorProfile = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    navigateTo('creator-profile');
  };

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <section>
        <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{disc.engineTitle || 'Descubrir'}</span>
        <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase text-tertiary mt-1">{disc.title || 'Descubrir'}</h2>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={disc.searchPlaceholder || 'Buscar creadores, retos...'}
            className="w-full bg-surface-container-low border border-outline-variant/30 py-3.5 pl-12 pr-4 text-sm font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-sm text-tertiary placeholder:text-on-surface-variant/50 transition-all"
          />
        </div>
      </section>

      {/* Recommended Creators */}
      {filteredCreators.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-4 h-4 text-primary" />
            <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{disc.recommendedCreators || 'Creadores Recomendados'}</h3>
          </div>
          <div className="space-y-3">
            {filteredCreators.map(creator => {
              const isFollowing = followedCreators.includes(creator.id);
              return (
                <div
                  key={creator.id}
                  onClick={() => openCreatorProfile(creator.id)}
                  className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full object-cover border-2 border-outline-variant/20" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-headline font-bold text-sm uppercase text-tertiary">@{creator.name}</h4>
                        {creator.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded inline-block mt-0.5">{creator.badge}</span>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">{creator.bio}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-3 text-[9px] text-on-surface-variant">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(creator.followers / 1000).toFixed(1)}K</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {creator.recipes}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest ${
                        isFollowing
                          ? 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/30'
                          : 'bg-primary text-on-primary'
                      }`}>
                        {isFollowing ? (t.explore?.creators?.following || 'Siguiendo') : (t.explore?.creators?.follow || 'Seguir')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Active Challenges */}
      <section className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
          <Activity className="w-48 h-48 text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{t.challenges?.title || 'Desafios'}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background p-4 rounded-sm border border-outline-variant/20 flex justify-between items-center hover:border-primary/50 transition-colors">
              <div>
                <h4 className="font-headline font-bold text-sm uppercase text-tertiary">{t.community?.greenChallenge || 'Reto Verde de 7 Dias'}</h4>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">{(t.community?.challengeParticipants || '{count} Participantes').replace('{count}', '1,240')} · {(t.community?.challengeDaysLeft || 'Quedan {count} Dias').replace('{count}', '3')}</p>
                <div className="h-1 w-32 bg-surface-container-highest mt-3 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '65%' }} />
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleChallenge('green-7'); }}
                className={`px-3 py-1.5 rounded-sm font-label text-[9px] font-bold tracking-widest uppercase transition-all flex items-center gap-1 ${
                  joinedChallenges.includes('green-7')
                    ? 'bg-primary text-on-primary'
                    : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-on-primary'
                }`}
              >
                {joinedChallenges.includes('green-7') ? <><Check className="w-3 h-3" /> {t.community?.joined || 'Unido'}</> : (t.community?.join || 'Unirse')}
              </button>
            </div>

            <div className="bg-background p-4 rounded-sm border border-outline-variant/20 flex justify-between items-center hover:border-brand-secondary/50 transition-colors">
              <div>
                <h4 className="font-headline font-bold text-sm uppercase text-tertiary">{t.community?.hydrationChallenge || 'Reto Hidratacion 3L/Dia'}</h4>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">{(t.community?.challengeParticipants || '{count} Participantes').replace('{count}', '850')} · {t.community?.challengeOngoing || 'En Curso'}</p>
                <div className="h-1 w-32 bg-surface-container-highest mt-3 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-secondary" style={{ width: '40%' }} />
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleChallenge('hydration-3l'); }}
                className={`px-3 py-1.5 rounded-sm font-label text-[9px] font-bold tracking-widest uppercase transition-all flex items-center gap-1 ${
                  joinedChallenges.includes('hydration-3l')
                    ? 'bg-brand-secondary text-on-secondary'
                    : 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 hover:bg-brand-secondary hover:text-on-secondary'
                }`}
              >
                {joinedChallenges.includes('hydration-3l') ? <><Check className="w-3 h-3" /> {t.community?.joined || 'Unido'}</> : (t.community?.join || 'Unirse')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Posts */}
      {trendingPosts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{disc.trendingPosts || 'Trending'}</h3>
          </div>
          <div className="space-y-3">
            {trendingPosts.map(post => (
              <div
                key={post.id}
                onClick={() => { setSelectedPostId(post.id); navigateTo('post-detail'); }}
                className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <img src={post.author.img} alt={post.author.name} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline text-xs font-bold text-tertiary uppercase">{post.author.name}</span>
                      <span className="font-label text-[9px] tracking-widest text-on-surface-variant uppercase">{post.author.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 font-body">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-on-surface-variant"><Flame className="w-3 h-3" /> {post.likes}</span>
                      <span className="flex items-center gap-1 text-[10px] text-on-surface-variant"><MessageSquare className="w-3 h-3" /> {post.comments}</span>
                    </div>
                  </div>
                  {post.images && post.images[0] && (
                    <img src={post.images[0]} alt="" className="w-16 h-16 rounded-sm object-cover shrink-0" referrerPolicy="no-referrer" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Followed Creators (if any) */}
      {followedCreatorsList.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{disc.yourCreators || 'Tus Creadores'}</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {followedCreatorsList.map(creator => (
              <div
                key={creator.id}
                onClick={() => openCreatorProfile(creator.id)}
                className="shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
              >
                <img src={creator.avatar} alt={creator.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/30 group-hover:border-primary transition-colors" referrerPolicy="no-referrer" />
                <span className="font-headline text-[10px] font-bold text-tertiary uppercase tracking-tight">@{creator.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popular Hashtags */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-primary font-bold text-sm">#</span>
          <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{disc.popularTags || 'Hashtags Populares'}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['mealprep', 'altaproteina', 'realfood', 'fitness', 'recetassanas', 'bulking', 'vegan', 'singluten'].map(tag => (
            <span key={tag} className="bg-surface-container-highest px-3 py-2 rounded-sm text-[10px] font-bold text-on-surface-variant tracking-widest uppercase hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
