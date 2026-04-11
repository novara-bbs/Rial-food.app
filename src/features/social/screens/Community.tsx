import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useAppState } from '../../../contexts/AppStateContext';
import EmptyState from '../../../components/EmptyState';
import FilterRow from '../../../components/patterns/FilterRow';
import PostCard from '../components/PostCard';
import StoryRingsRow from '../components/StoryRingsRow';
import { rankFeed, getFollowingFeed, getTrendingFeed } from '../utils/feed-algorithm';

type FeedMode = 'forYou' | 'following' | 'trending';

export default function Community({ communityPosts = [], onAddComment }: { communityPosts?: any[], onAddComment?: (postId: number, comment: string) => void }) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const { userProfile, setCommunityPosts, setSelectedCreatorId, setSelectedPostId, likedPosts, toggleLikePost, savedPosts, toggleSavePost, savedRecipes, navigateToRecipe } = useAppState();
  const [feedMode, setFeedMode] = useState<FeedMode>('forYou');

  const deletePost = (postId: number) => {
    if (confirm(t.community.deleteConfirm)) {
      setCommunityPosts((prev: any[]) => prev.filter(p => p.id !== postId));
    }
  };

  const isOwnPost = (post: any) => post.author?.name === userProfile.name || post.author?.name === 'Tu' || post.author?.id === 'self';

  const [followedCreators] = [useMemo(() => {
    try { return JSON.parse(localStorage.getItem('followedCreators') || '[]'); } catch { return []; }
  }, [])];

  const userCtx = useMemo(() => ({
    followedCreators,
    likedPosts,
    savedPosts,
  }), [followedCreators, likedPosts, savedPosts]);

  const forYouFeed = useMemo(() => rankFeed(communityPosts, userCtx), [communityPosts, userCtx]);
  const followingFeed = useMemo(() => getFollowingFeed(communityPosts, followedCreators), [communityPosts, followedCreators]);
  const trendingFeed = useMemo(() => getTrendingFeed(communityPosts), [communityPosts]);

  const feed = t.feed;

  const activeFeed = feedMode === 'forYou' ? forYouFeed : feedMode === 'following' ? followingFeed : trendingFeed;

  const renderPost = (post: any) => (
    <PostCard
      key={post.id}
      post={post}
      isLiked={likedPosts.includes(post.id)}
      isSaved={savedPosts.includes(post.id)}
      isOwn={isOwnPost(post)}
      onLike={() => toggleLikePost(post.id)}
      onSave={() => toggleSavePost(post.id)}
      onShare={() => {
        if (navigator.share) { navigator.share({ text: post.content }).catch(() => {}); }
        else { navigator.clipboard.writeText(post.content); }
      }}
      onDelete={() => deletePost(post.id)}
      onComment={(text) => onAddComment?.(post.id, text)}
      onNavigateToProfile={(authorId) => { setSelectedCreatorId(authorId); navigateTo('creator-profile'); }}
      onNavigateToPost={() => { setSelectedPostId(post.id); navigateTo('post-detail'); }}
      onNavigateToRecipe={(recipe) => {
        const full = savedRecipes.find((r: any) => String(r.id) === String(recipe.id));
        navigateToRecipe(full || { ...recipe, macros: { calories: recipe.cal, protein: recipe.pro, carbs: recipe.carbs, fats: recipe.fats } });
      }}
    />
  );

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header + Create */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{t.community.globalCommunity}</span>
            <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase text-tertiary mt-1">{t.community.title}</h2>
          </div>
          <button
            onClick={() => navigateTo('create-post')}
            aria-label={t.common.publish}
            className="bg-primary/10 text-primary border border-primary/30 px-4 py-2 font-label text-[10px] font-bold tracking-widest uppercase rounded-sm hover:bg-primary/20 transition-colors flex items-center gap-2"
          >
            <Plus className="w-3 h-3" /> {t.common.publish}
          </button>
        </div>

        {/* Story Rings */}
        <StoryRingsRow />
      </section>

      {/* Feed Mode Chips */}
      <FilterRow
        options={[
          { id: 'forYou', label: feed.forYou || 'Para Ti' },
          { id: 'following', label: feed.following || 'Siguiendo' },
          { id: 'trending', label: feed.trending || 'Trending' },
        ]}
        active={feedMode}
        onChange={(id) => setFeedMode(id as FeedMode)}
        variant="pill"
      />

      {/* Posts feed */}
      <section className="space-y-6">
        {activeFeed.length === 0 && (
          <EmptyState
            icon="👥"
            title={feedMode === 'following' ? (feed.following || 'Siguiendo') : t.community.title}
            description={feedMode === 'following' ? (feed.noFollowingPosts || 'Sigue a creadores para ver sus publicaciones aqui') : t.empty.socialEmpty}
          />
        )}
        {activeFeed.map(renderPost)}
      </section>
    </div>
  );
}
