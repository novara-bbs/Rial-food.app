import { useMemo, useState } from 'react';
import { Heading } from '@/components/ui/Typography';
import PageShell from '../../../components/PageShell';
import { Plus } from 'lucide-react';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useI18n } from '../../../i18n';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useAppState } from '../../../contexts/AppStateContext';
import EmptyState from '../../../components/EmptyState';
import TabNav from '../../../components/patterns/TabNav';
import PostCard from '../components/PostCard';
import StoryRingsRow from '../components/StoryRingsRow';
import { rankFeed, getFollowingFeed, getTrendingFeed } from '../utils/feed-algorithm';

type FeedMode = 'forYou' | 'following' | 'trending';

export default function Community({ communityPosts = [], onAddComment }: { communityPosts?: any[], onAddComment?: (postId: number, comment: string) => void }) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const {
    userProfile,
    setCommunityPosts,
    setSelectedCreatorId,
    setSelectedPostId,
    likedPosts,
    toggleLikePost,
    savedPosts,
    toggleSavePost,
    savedRecipes,
    navigateToRecipe,
    followedCreators,
  } = useAppState();
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

  // `followedCreators` now comes from AppStateContext (Wave 3 factory handler)
  // so toggling follow from Discover/CreatorProfile updates here live — no
  // stale snapshot until unmount.

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
            <span className="font-mono text-micro font-bold tracking-[0.3em] text-primary uppercase">{t.community.globalCommunity}</span>
            <Heading level="h2" className="text-headline md:text-display mt-1">{t.community.title}</Heading>
          </div>
          <button type="button"
            onClick={() => navigateTo('create-post')}
            aria-label={t.common.publish}
            className="bg-primary/10 text-primary border border-primary/30 px-4 min-h-11 font-label text-micro font-bold tracking-widest uppercase rounded-sm hover:bg-primary/20 transition-colors flex items-center gap-2"
          >
            <Plus className="w-3 h-3" /> {t.common.publish}
          </button>
        </div>

        {/* Story Rings */}
        <StoryRingsRow />
      </section>

      {/* Feed source tabs — FOR YOU / FOLLOWING / TRENDING are distinct
          feed axes (navigation), not facets. ADR-013: navigation → TabNav. */}
      <TabNav
        tabs={[
          { id: 'forYou', label: feed.forYou || 'Para Ti' },
          { id: 'following', label: feed.following || 'Siguiendo' },
          { id: 'trending', label: feed.trending || 'Trending' },
        ]}
        active={feedMode}
        onChange={(id) => setFeedMode(id as FeedMode)}
        className="-mx-4 mb-2"
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
