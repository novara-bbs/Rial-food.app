import { Send } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import SectionCard from '../../../components/SectionCard';
import { BUTTON_CARD_SURFACE_CLASSES, INPUT_SURFACE_CLASSES } from '../../../components/ui/surface';
import { useState, useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import PostCard from '../components/PostCard';
import PageHeader from '../../../components/patterns/PageHeader';
import { Heading } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import type { PostComment } from '../../../types/social';
import type { Recipe } from '../../../types';

export default function PostDetail({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { communityPosts, selectedPostId, userProfile, setSelectedCreatorId, setSelectedPostId, handleAddComment, likedPosts, toggleLikePost, savedPosts, toggleSavePost, savedRecipes, navigateToRecipe } = useAppState();
  const { navigateTo } = useNavigation();
  const [commentText, setCommentText] = useState('');

  const post = useMemo(() => communityPosts.find((p) => p.id === selectedPostId), [communityPosts, selectedPostId]);

  // Id-based ownership check. Name-based compare broke in EN locale (`'Tú'`
  // literal never matches) and whenever the user changed their display name.
  const isOwn = post?.author?.id === 'self';
  const unitSystem = userProfile?.unitSystem ?? 'metric';

  const handleSubmitComment = () => {
    if (!commentText.trim() || !post) return;
    handleAddComment(post.id, commentText);
    setCommentText('');
  };

  const morePosts = useMemo(() => {
    if (!post) return [];
    return communityPosts
      .filter((p) => p.id !== post.id && p.author?.id === post.author?.id)
      .slice(0, 3);
  }, [communityPosts, post]);

  if (!post) {
    return (
      <div className="px-6 max-w-2xl mx-auto pt-8 space-y-4">
        <PageHeader onBack={onBack} label="" title={t.postDetail.title} />
        <p className="text-center text-on-surface-variant mt-8">{t.postDetail.notFound}</p>
      </div>
    );
  }

  return (
    <PageShell maxWidth="narrow" spacing="md">
      <PageHeader onBack={onBack} title={t.postDetail.title} />

      {/* Post — hideComments: PostDetail renders the canonical comments list
          below, so PostCard should not duplicate it. Wave 3 dedup. */}
      <PostCard
        post={post}
        isLiked={likedPosts.includes(post.id)}
        isSaved={savedPosts.includes(post.id)}
        isOwn={isOwn}
        unitSystem={unitSystem}
        hideComments
        onLike={() => toggleLikePost(post.id)}
        onSave={() => toggleSavePost(post.id)}
        onComment={(text) => handleAddComment(post.id, text)}
        onShare={() => {
          if (navigator.share) { navigator.share({ text: post.content }).catch(() => {}); }
          else { navigator.clipboard.writeText(post.content); }
        }}
        onNavigateToProfile={(authorId) => {
          setSelectedCreatorId(authorId);
          navigateTo('creator-profile');
        }}
        onNavigateToRecipe={(recipe) => {
          const full = savedRecipes.find((r) => String(r.id) === String(recipe.id));
          navigateToRecipe(full || { ...recipe, macros: { calories: recipe.cal, protein: recipe.pro, carbs: recipe.carbs, fats: recipe.fats } } as unknown as Recipe);
        }}
      />

      {/* All comments */}
      {post.commentsList && post.commentsList.length > 0 && (
        <div className="space-y-3">
          <Heading level="h3" variant="overline" className="text-caption">{t.postDetail.allComments} ({post.commentsList.length})</Heading>
          {post.commentsList.map((comment: PostComment) => (
            <SectionCard key={comment.id} padding="none" spacing="none" className="flex gap-3 p-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-caption font-bold text-tertiary shrink-0">
                {comment.authorImg ? (
                  <img src={comment.authorImg} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} alt={comment.author} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  comment.author.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-headline text-caption font-bold text-tertiary">{comment.author}</span>
                  <span className="font-label text-micro tracking-widest text-on-surface-variant uppercase">{comment.time}</span>
                </div>
                <p className="text-caption text-on-surface-variant mt-1 leading-relaxed">{comment.text}</p>
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      {/* Fixed comment input */}
      <div className={`flex items-center gap-2 ${INPUT_SURFACE_CLASSES} p-3`}>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={t.common.addComment}
          className="flex-1 bg-surface-container-highest border border-outline-variant/30 min-h-11 px-3 text-caption font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-sm text-tertiary placeholder:text-on-surface-variant/50"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
        />
        <Button
          variant="default"
          size="icon"
          onClick={handleSubmitComment}
          disabled={!commentText.trim()}
          aria-label={t.common.send}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* More from creator — card converted to <button> to fix nested-button
          a11y issue (was clickable div inside a page). */}
      {morePosts.length > 0 && (
        <div className="space-y-3">
          <Heading level="h3" variant="overline" className="text-caption">{t.postDetail.moreFromCreator}</Heading>
          {morePosts.map((p) => (
            <button type="button"
              key={p.id}
              onClick={() => {
                setSelectedPostId(p.id);
                navigateTo('post-detail');
              }}
              className={`w-full text-left ${BUTTON_CARD_SURFACE_CLASSES} p-4 hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors`}
              aria-label={p.content?.slice(0, 80)}
            >
              <p className="text-body-sm text-on-surface-variant line-clamp-2">{p.content}</p>
              <span className="font-label text-micro tracking-widest text-on-surface-variant uppercase mt-2 block">{p.author?.time}</span>
            </button>
          ))}
        </div>
      )}
    </PageShell>
  );
}
