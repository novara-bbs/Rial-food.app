import { CheckCircle2, Users, BookOpen, TrendingUp, Flame, MessageSquare, Compass, Activity, Check } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import SearchInput from '../../../components/patterns/SearchInput';
import { BUTTON_CARD_SURFACE_CLASSES } from '../../../components/ui/surface';
import { useState, useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useAppState } from '../../../contexts/AppStateContext';
import { MOCK_CREATORS } from '../data/seed-creators';
import { getTrendingFeed } from '../utils/feed-algorithm';
import { Heading } from '@/components/ui/Typography';

/**
 * Discover — recommends creators, challenges, trending posts and hashtags.
 *
 * Wave 3 migration: dropped inline `useLocalStorageState('followedCreators')`
 * and `useLocalStorageState('joinedChallenges')` in favour of the factory
 * handlers registered in AppStateContext. This fixes the stale-snapshot bug
 * where toggling follow here wouldn't propagate to Community/CreatorProfile
 * until remount. Also migrated card patterns away from `<div onClick>` to
 * proper `<button>` elements with stopPropagation for nested CTAs (a11y).
 */
export default function Discover() {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const {
    communityPosts,
    setSelectedCreatorId,
    setSelectedPostId,
    followedCreators,
    joinedChallenges,
    handleToggleChallenge,
  } = useAppState();
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

  const openCreatorProfile = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    navigateTo('creator-profile');
  };

  return (
    <PageShell maxWidth="default" spacing="lg">
      {/* Header */}
      <section>
        <span className="font-mono text-micro font-bold tracking-[0.3em] text-primary uppercase">{disc.engineTitle}</span>
        <Heading level="h2" className="text-headline md:text-display mt-1">{disc.title}</Heading>

        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={disc.searchPlaceholder}
          className="mt-6"
        />
      </section>

      {/* Recommended Creators */}
      {filteredCreators.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-4 h-4 text-primary" />
            <Heading level="h3" className="text-body-lg">{disc.recommendedCreators}</Heading>
          </div>
          <div className="space-y-3">
            {filteredCreators.map(creator => {
              const isFollowing = followedCreators.includes(creator.id);
              return (
                <button
                  key={creator.id}
                  type="button"
                  onClick={() => openCreatorProfile(creator.id)}
                  className={`w-full text-left ${BUTTON_CARD_SURFACE_CLASSES} p-4 hover:border-primary/50 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
                  aria-label={`@${creator.name}`}
                >
                  <div className="flex items-center gap-4">
                    <img src={creator.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-outline-variant/20" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Heading level="h4" className="text-body-sm">@{creator.name}</Heading>
                        {creator.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </div>
                      <span className="badge-card bg-primary/10 text-primary uppercase tracking-wide mt-0.5">{creator.badge}</span>
                      <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-1">{creator.bio}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-3 text-micro text-on-surface-variant">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(creator.followers / 1000).toFixed(1)}K</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {creator.recipes}</span>
                      </div>
                      <span className={`badge-card uppercase tracking-wide ${
                        isFollowing
                          ? 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/30'
                          : 'bg-primary text-on-primary'
                      }`}>
                        {isFollowing ? t.explore.creators.following : t.explore.creators.follow}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Active Challenges */}
      <section className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700" aria-hidden="true">
          <Activity className="w-48 h-48 text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              <Activity className="w-4 h-4" />
            </div>
            <Heading level="h3" className="text-body-lg">{t.challenges.title}</Heading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background p-4 rounded-sm border border-outline-variant/20 flex justify-between items-center hover:border-primary/50 transition-colors">
              <div>
                <Heading level="h4" className="text-body-sm">{t.community.greenChallenge}</Heading>
                <p className="text-micro text-on-surface-variant uppercase tracking-widest mt-1">{t.community.challengeParticipants.replace('{count}', '1,240')} · {t.community.challengeDaysLeft.replace('{count}', '3')}</p>
                <div className="h-1 w-32 bg-surface-container-highest mt-3 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '65%' }} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleChallenge('green-7')}
                aria-pressed={joinedChallenges.includes('green-7')}
                className={`px-3 min-h-11 rounded-sm font-label text-micro font-bold tracking-widest uppercase transition-all flex items-center gap-1 ${
                  joinedChallenges.includes('green-7')
                    ? 'bg-primary text-on-primary'
                    : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-on-primary'
                }`}
              >
                {joinedChallenges.includes('green-7') ? <><Check className="w-3 h-3" /> {t.community.joined}</> : t.community.join}
              </button>
            </div>

            <div className="bg-background p-4 rounded-sm border border-outline-variant/20 flex justify-between items-center hover:border-brand-secondary/50 transition-colors">
              <div>
                <Heading level="h4" className="text-body-sm">{t.community.hydrationChallenge}</Heading>
                <p className="text-micro text-on-surface-variant uppercase tracking-widest mt-1">{t.community.challengeParticipants.replace('{count}', '850')} · {t.community.challengeOngoing}</p>
                <div className="h-1 w-32 bg-surface-container-highest mt-3 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-secondary" style={{ width: '40%' }} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleChallenge('hydration-3l')}
                aria-pressed={joinedChallenges.includes('hydration-3l')}
                className={`px-3 min-h-11 rounded-sm font-label text-micro font-bold tracking-widest uppercase transition-all flex items-center gap-1 ${
                  joinedChallenges.includes('hydration-3l')
                    ? 'bg-brand-secondary text-on-secondary'
                    : 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 hover:bg-brand-secondary hover:text-on-secondary'
                }`}
              >
                {joinedChallenges.includes('hydration-3l') ? <><Check className="w-3 h-3" /> {t.community.joined}</> : t.community.join}
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
            <Heading level="h3" className="text-body-lg">{disc.trendingPosts}</Heading>
          </div>
          <div className="space-y-3">
            {trendingPosts.map(post => (
              <button
                key={post.id}
                type="button"
                onClick={() => { setSelectedPostId(post.id); navigateTo('post-detail'); }}
                className={`w-full text-left ${BUTTON_CARD_SURFACE_CLASSES} p-4 hover:border-primary/50 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
              >
                <div className="flex items-start gap-3">
                  <img src={post.author.img} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline text-body-sm font-bold text-tertiary uppercase">{post.author.name}</span>
                      <span className="font-label text-micro tracking-widest text-on-surface-variant uppercase">{post.author.time}</span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-2 font-body">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-micro text-on-surface-variant"><Flame className="w-3 h-3" /> {post.likes}</span>
                      <span className="flex items-center gap-1 text-micro text-on-surface-variant"><MessageSquare className="w-3 h-3" /> {post.comments}</span>
                    </div>
                  </div>
                  {post.images && post.images[0] && (
                    <img src={post.images[0]} alt="" className="w-16 h-16 rounded-sm object-cover shrink-0" referrerPolicy="no-referrer" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Followed Creators (if any) */}
      {followedCreatorsList.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <Heading level="h3" className="text-body-lg">{disc.yourCreators}</Heading>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {followedCreatorsList.map(creator => (
              <button
                key={creator.id}
                type="button"
                onClick={() => openCreatorProfile(creator.id)}
                className="shrink-0 flex flex-col items-center gap-2 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
                aria-label={`@${creator.name}`}
              >
                <img src={creator.avatar} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-primary/30 group-hover:border-primary transition-colors" referrerPolicy="no-referrer" />
                <span className="font-headline text-micro font-bold text-tertiary uppercase tracking-tight">@{creator.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Popular Hashtags */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-primary font-bold text-body-sm" aria-hidden="true">#</span>
          <Heading level="h3" className="text-body-lg">{disc.popularTags}</Heading>
        </div>
        <div className="flex flex-wrap gap-2">
          {['mealprep', 'altaproteina', 'realfood', 'fitness', 'recetassanas', 'bulking', 'vegan', 'singluten'].map(tag => (
            <button
              key={tag}
              type="button"
              className="bg-surface-container-highest px-3 min-h-11 rounded-sm text-micro font-bold text-on-surface-variant tracking-widest uppercase hover:bg-primary/10 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              #{tag}
            </button>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
