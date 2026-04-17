import { Flame, MessageSquare, Share2, Bookmark, Activity, TrendingUp, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n';
import type { CommunityPost } from '../../../types/social';
import type { UnitSystem } from '../../food/utils/units';
import ProgressPostCard from './ProgressPostCard';

interface PostCardProps {
  post: CommunityPost;
  isLiked: boolean;
  isSaved?: boolean;
  isOwn: boolean;
  unitSystem?: UnitSystem;
  /**
   * Hide the inline comments panel. Used by PostDetail to avoid rendering the
   * same list twice (Wave 3 dedup — PostDetail owns the canonical comment view).
   */
  hideComments?: boolean;
  onLike: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onComment?: (text: string) => void;
  onNavigateToProfile?: (authorId: string) => void;
  onNavigateToPost?: () => void;
  onNavigateToRecipe?: (recipe: any) => void;
}

export default function PostCard({
  post, isLiked, isSaved, isOwn, unitSystem = 'metric', hideComments = false,
  onLike, onSave, onShare, onDelete, onComment,
  onNavigateToProfile, onNavigateToPost, onNavigateToRecipe,
}: PostCardProps) {
  const { t } = useI18n();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const submitComment = () => {
    if (commentText.trim() && onComment) {
      onComment(commentText);
      setCommentText('');
      setShowComments(false);
    }
  };

  const handleRecipeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.recipe && onNavigateToRecipe) {
      onNavigateToRecipe(post.recipe);
    }
  };

  return (
    <article className="bg-surface-container-low rounded-sm border border-outline-variant/20 overflow-hidden">
      {/* Author header */}
      <div className="p-4 flex items-center justify-between border-b border-outline-variant/10">
        <button type="button"
          onClick={() => post.author?.id && onNavigateToProfile?.(post.author.id)}
          className="flex items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
          aria-label={post.author?.name}
        >
          <img src={post.author.img} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
          <div>
            <p className="font-headline font-bold text-body-sm text-tertiary uppercase tracking-tight hover:text-primary transition-colors">{post.author.name}</p>
            <p className="font-label text-micro text-on-surface-variant tracking-widest uppercase">{post.author.role} · {post.author.time}</p>
          </div>
        </button>
        {isOwn && onDelete && (
          <button type="button"
            onClick={onDelete}
            aria-label={t.common.delete}
            className="w-11 h-11 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content — stretched-link to post detail; inner recipe card has its own
          z-10 button with stopPropagation so tapping the recipe still navigates
          to the recipe (not the post). */}
      <div className="relative">
        {onNavigateToPost && (
          <button type="button"
            onClick={onNavigateToPost}
            aria-label={post.content?.slice(0, 80) || 'Post'}
            className="absolute inset-0 w-full h-full rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary z-0"
          />
        )}
        <div className="relative p-5 pointer-events-none">
          <p className="text-body-sm text-on-surface-variant mb-4 font-body leading-relaxed">{post.content}</p>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.hashtags.map(tag => (
                <span key={tag} className="text-micro font-bold text-primary tracking-widest uppercase">#{tag}</span>
              ))}
            </div>
          )}

          {/* Image */}
          {post.images && post.images.length > 0 && (
            <div className="rounded-sm overflow-hidden border border-outline-variant/20 mb-3">
              <img src={post.images[0]} alt="Post" className="w-full max-h-80 object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}

          {/* Progress card — body-snapshot share (delta + optional photo) */}
          {post.type === 'progress' && post.progress && (
            <div className="mb-2">
              <ProgressPostCard
                post={post}
                unitSystem={unitSystem}
                currentLabel={t.progress.current}
                sinceLabel={t.progress.since}
              />
            </div>
          )}

          {/* Performance card */}
          {post.type === 'performance' && post.performance && (
            <div className="bg-background rounded-sm border border-outline-variant/20 p-4 grid grid-cols-2 gap-4 mb-2">
              <div className="flex flex-col items-center justify-center text-center p-2">
                <Activity className="w-6 h-6 text-primary mb-2" />
                <span className="font-headline text-2xl font-bold text-tertiary">{post.performance.recovery}%</span>
                <span className="font-label text-caption tracking-widest text-primary uppercase mt-1">{t.community.recovery}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-2 border-l border-outline-variant/20">
                <TrendingUp className="w-6 h-6 text-brand-secondary mb-2" />
                <span className="font-headline text-2xl font-bold text-tertiary">{post.performance.strain}</span>
                <span className="font-label text-caption tracking-widest text-brand-secondary uppercase mt-1">{t.community.strain}</span>
              </div>
            </div>
          )}

          {/* Recipe card — own button, sits on top of the stretched-link */}
          {post.type === 'recipe' && post.recipe && (
            <button type="button"
              onClick={handleRecipeClick}
              aria-label={`${t.postCard.viewRecipe}: ${post.recipe.title}`}
              className="relative z-10 pointer-events-auto block w-full text-left bg-background rounded-sm border border-outline-variant/20 overflow-hidden group hover:border-primary/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div className="h-32 w-full relative">
                <img src={post.recipe.img} alt={post.recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).className = 'w-full h-full bg-gradient-to-br from-primary/20 to-tertiary/20'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="bg-primary text-on-primary text-micro font-black px-2 py-1 tracking-widest uppercase rounded-sm mb-1 inline-block">{post.recipe.tag}</span>
                  <h4 className="font-headline font-bold text-lg uppercase text-tertiary">{post.recipe.title}</h4>
                </div>
                {/* "View recipe" hint on hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-primary text-on-primary text-micro font-bold px-2 py-1 tracking-widest uppercase rounded-sm">{t.postCard.viewRecipe}</span>
                </div>
              </div>
              <div className="p-3 grid grid-cols-5 gap-2 bg-surface-container-highest/30">
                <div className="text-center"><span className="block text-micro font-bold text-on-surface-variant tracking-widest uppercase">KCAL</span><span className="text-body-sm font-headline font-bold text-tertiary">{post.recipe.cal}</span></div>
                <div className="text-center border-l border-outline-variant/20"><span className="block text-micro font-bold text-on-surface-variant tracking-widest uppercase">PRO</span><span className="text-body-sm font-headline font-bold text-tertiary">{post.recipe.pro}g</span></div>
                <div className="text-center border-l border-outline-variant/20"><span className="block text-micro font-bold text-on-surface-variant tracking-widest uppercase">C</span><span className="text-body-sm font-headline font-bold text-tertiary">{post.recipe.carbs || 0}g</span></div>
                <div className="text-center border-l border-outline-variant/20"><span className="block text-micro font-bold text-on-surface-variant tracking-widest uppercase">F</span><span className="text-body-sm font-headline font-bold text-tertiary">{post.recipe.fats || 0}g</span></div>
                <div className="text-center border-l border-outline-variant/20"><span className="block text-micro font-bold text-on-surface-variant tracking-widest uppercase">{t.common.time}</span><span className="text-body-sm font-headline font-bold text-tertiary">{post.recipe.time}</span></div>
              </div>
            </button>
          )}

          {/* Repost attribution */}
          {post.type === 'repost' && (
            <div className="text-micro text-on-surface-variant tracking-widest uppercase flex items-center gap-1 mb-2">
              <Share2 className="w-3 h-3" /> {t.community.reposted}
            </div>
          )}
        </div>
      </div>

      {/* Action bar — counters read `post.likes` / `post.saves` directly. The
          toggleLikePost/toggleSavePost handlers in AppStateContext mutate the
          canonical counter on the post, so no `+1` cosmetic offset is needed. */}
      <div className="px-5 py-3 bg-surface-container-highest/50 flex gap-6 border-t border-outline-variant/10">
        <button type="button" onClick={onLike} aria-label={isLiked ? t.postCard.unlikeLabel : t.postCard.likeLabel} className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
          <Flame className={`w-5 h-5 ${isLiked ? 'fill-primary' : ''}`} />
          <span className="font-label text-caption font-bold">{post.likes || 0}</span>
        </button>
        {!hideComments && (
          <button type="button" onClick={() => setShowComments(!showComments)} aria-label={t.postCard.commentsLabel} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span className="font-label text-caption font-bold">{post.comments}</span>
          </button>
        )}
        {onSave && (
          <button type="button" onClick={onSave} aria-label={isSaved ? t.postCard.unsaveLabel : t.postCard.saveLabel} className={`flex items-center gap-2 transition-colors ${isSaved ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary' : ''}`} />
            <span className="font-label text-caption font-bold">{post.saves || 0}</span>
          </button>
        )}
        <button type="button" onClick={onShare} aria-label={t.postCard.shareLabel} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors ml-auto">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Comment section — suppressed when hideComments=true (PostDetail owns it) */}
      {!hideComments && showComments && (
        <div className="px-5 py-3 bg-surface-container-low border-t border-outline-variant/10">
          {post.commentsList && post.commentsList.length > 0 && (
            <div className="mb-4 space-y-3">
              {post.commentsList.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-micro font-bold text-tertiary shrink-0 overflow-hidden">
                    {comment.authorImg ? (
                      <img src={comment.authorImg} alt={comment.author} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      comment.author.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline text-caption font-bold text-tertiary">{comment.author}</span>
                      <span className="font-label text-micro tracking-widest text-on-surface-variant uppercase">{comment.time}</span>
                    </div>
                    <p className="text-caption text-on-surface-variant mt-0.5">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t.common.addComment}
              className="flex-1 bg-surface-container-highest border border-outline-variant/30 min-h-11 px-3 text-caption font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-sm text-tertiary placeholder:text-on-surface-variant/50"
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
            />
            <button type="button"
              onClick={submitComment}
              disabled={!commentText.trim()}
              aria-label={t.common.send || t.common.publish}
              className="w-11 h-11 rounded-sm bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
