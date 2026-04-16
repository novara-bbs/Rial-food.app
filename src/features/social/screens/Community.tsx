import { useMemo, useState } from 'react';
import PageShell from '../../../components/PageShell';
import { Plus } from 'lucide-react';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useI18n } from '../../../i18n';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useAppState } from '../../../contexts/AppStateContext';
import EmptyState from '../../../components/EmptyState';
import FilterRow from '../../../components/patterns/FilterRow';
import PostCard from '../components/PostCard';
import StoryRingsRow from '../components/StoryRingsRow';
import { rankFeed, getFollowingFeed, getTrendingFeed } from '../utils/feed-algorithm';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';

type FeedMode = 'forYou' | 'following' | 'trending';

export default function Community({ communityPosts = [], onAddComment }: { communityPosts?: any[], onAddComment?: (postId: number, comment: string) => void }) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const { userProfile, setCommunityPosts, setSelectedCreatorId, setSelectedPostId, likedPosts, toggleLikePost, savedPosts, toggleSavePost, savedRecipes, navigateToRecipe } = useAppState();
  const [feedMode, setFeedMode] = useState<FeedMode>('forYou');

  const [pendingDeletePostId, setPendingDeletePostId] = useState<number | null>(null);
  const deletePost = (postId: number) => {
    setPendingDeletePostId(postId);
  };
  const confirmDeletePost = () => {
    if (pendingDeletePostId !== null) {
      setCommunityPosts((prev: any[]) => prev.filter(p => p.id !== pendingDeletePostId));
      setPendingDeletePostId(null);
    }
  };

  // Ownership must be id-based. The old name compare (`'Tu'`, `'Tú'`, or
  // `userProfile.name`) broke in EN locale and whenever the user changed their
  // display name. `createHandleCreatePost` always tags `author.id === 'self'`.
  const isOwnPost = (post: any) => post.author?.id === 'self';

  // Canonical persistence hook. Replaces a stale `JSON.parse(localStorage)`
  // snapshot inside a `useMemo([])` that never refreshed after the component
  // mounted — toggling follow from other screens wouldn't surface here until
  // full remount. Cross-screen live propagation will land in Wave 3 when this
  // moves to a factory handler in AppStateContext.
  // `followedCreators` stores creator ids — ids are strings (`'creator-1'`,
  // `'self'`, etc.) across the app, not numbers. The previous `number[]`
  // generic caused a type mismatch against `UserContext.followedCreators` in
  // the feed ranker. Wave 3 will unify this under a factory handler.
  const [followedCreators] = useLocalStorageState<string[]>('followedCreators', []);

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

  const unitSystem = userProfile?.unitSystem ?? 'metric';

  const renderPost = (post: any) => (
    <PostCard
      key={post.id}
      post={post}
      isLiked={likedPosts.includes(post.id)}
      isSaved={savedPosts.includes(post.id)}
      isOwn={isOwnPost(post)}
      unitSystem={unitSystem}
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
    <PageShell maxWidth="default" spacing="md">
      {/* Header + Create */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{t.community.globalCommunity}</span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary mt-1">{t.community.title}</h2>
          </div>
          <button type="button"
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

      <ConfirmDialog
        open={pendingDeletePostId !== null}
        onOpenChange={(open) => { if (!open) setPendingDeletePostId(null); }}
        title={t.community.deletePost || 'Eliminar publicación'}
        description={t.community.deleteConfirm}
        variant="destructive"
        onConfirm={confirmDeletePost}
      />
    </PageShell>
  );
}
