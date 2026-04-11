import { Send } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import PostCard from '../components/PostCard';
import PageHeader from '../../../components/patterns/PageHeader';

export default function PostDetail({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { communityPosts, selectedPostId, userProfile, setSelectedCreatorId, setSelectedPostId, handleAddComment, likedPosts, toggleLikePost, savedPosts, toggleSavePost, savedRecipes, navigateToRecipe } = useAppState();
  const { navigateTo } = useNavigation();
  const [commentText, setCommentText] = useState('');

  const post = useMemo(() => communityPosts.find((p: any) => p.id === selectedPostId), [communityPosts, selectedPostId]);

  const isOwn = post?.author?.name === userProfile.name || post?.author?.name === 'Tú';

  const handleSubmitComment = () => {
    if (!commentText.trim() || !post) return;
    handleAddComment(post.id, commentText);
    setCommentText('');
  };

  const morePosts = useMemo(() => {
    if (!post) return [];
    return communityPosts
      .filter((p: any) => p.id !== post.id && p.author?.id === post.author?.id)
      .slice(0, 3);
  }, [communityPosts, post]);

  if (!post) {
    return (
      <div className="px-6 max-w-2xl mx-auto pt-8 space-y-4">
        <PageHeader onBack={onBack} label="" title={t.postDetail?.title || 'Post'} />
        <p className="text-center text-on-surface-variant mt-8">{t.postDetail?.notFound || 'Post not found'}</p>
      </div>
    );
  }

  return (
    <div className="px-6 max-w-2xl mx-auto space-y-6 pb-24">
      <PageHeader onBack={onBack} title={t.postDetail?.title || 'Post'} />

      {/* Post */}
      <PostCard
        post={post}
        isLiked={likedPosts.includes(post.id)}
        isSaved={savedPosts.includes(post.id)}
        isOwn={isOwn}
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
          const full = savedRecipes.find((r: any) => String(r.id) === String(recipe.id));
          navigateToRecipe(full || { ...recipe, macros: { calories: recipe.cal, protein: recipe.pro, carbs: recipe.carbs, fats: recipe.fats } });
        }}
      />

      {/* All comments */}
      {post.commentsList && post.commentsList.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-headline font-bold text-xs uppercase text-tertiary tracking-widest">{t.postDetail?.allComments || 'All comments'} ({post.commentsList.length})</h3>
          {post.commentsList.map((comment: any) => (
            <div key={comment.id} className="flex gap-3 p-3 bg-surface-container-low border border-outline-variant/20 rounded-sm">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[11px] font-bold text-tertiary shrink-0">
                {comment.authorImg ? (
                  <img src={comment.authorImg} alt={comment.author} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  comment.author.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-headline text-xs font-bold text-tertiary">{comment.author}</span>
                  <span className="font-label text-[9px] tracking-widest text-on-surface-variant uppercase">{comment.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fixed comment input */}
      <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/20 rounded-sm p-3">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={t.common.addComment}
          className="flex-1 bg-surface-container-highest border border-outline-variant/30 py-2.5 px-3 text-xs font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-sm text-tertiary placeholder:text-on-surface-variant/50"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
        />
        <button type="button"
          onClick={handleSubmitComment}
          disabled={!commentText.trim()}
          className="w-10 h-10 rounded-sm bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* More from creator */}
      {morePosts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-headline font-bold text-xs uppercase text-tertiary tracking-widest">{t.postDetail?.moreFromCreator || 'More from this creator'}</h3>
          {morePosts.map((p: any) => (
            <div key={p.id} className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => {
              setSelectedPostId(p.id);
              navigateTo('post-detail');
            }}>
              <p className="text-sm text-on-surface-variant line-clamp-2">{p.content}</p>
              <span className="font-label text-[9px] tracking-widest text-on-surface-variant uppercase mt-2 block">{p.author?.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
