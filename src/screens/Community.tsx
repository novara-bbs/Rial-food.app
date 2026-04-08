import { Flame, MessageSquare, Share2, Activity, TrendingUp, Plus, Send } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../i18n';
import EmptyState from '../components/EmptyState';

export default function Community({ communityPosts = [], onAddComment }: { communityPosts?: any[], onAddComment?: (postId: number, comment: string) => void }) {
  const { t } = useI18n();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [activeCommentPost, setActiveCommentPost] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const toggleLike = (id: number) => {
    setLikedPosts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const creators = [
    { name: t.community.yourStory, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', isUser: true },
    { name: 'Marcus V.', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80', active: true },
    { name: 'Elara K.', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80', active: true },
    { name: 'Dr. Huberman', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', active: false },
    { name: 'Coach Ali', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', active: false },
  ];

  const handleCommentSubmit = (postId: number) => {
    if (commentText.trim() && onAddComment) {
      onAddComment(postId, commentText);
      setCommentText('');
      setActiveCommentPost(null);
    }
  };

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8 pb-24">
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{t.community.globalCommunity}</span>
            <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase text-tertiary mt-1">{t.community.title}</h2>
          </div>
          <button className="bg-primary/10 text-primary border border-primary/30 px-4 py-2 font-label text-[10px] font-bold tracking-widest uppercase rounded-sm hover:bg-primary/20 transition-colors flex items-center gap-2">
            <Plus className="w-3 h-3" /> {t.common.publish}
          </button>
        </div>
        
        {/* Story Rings */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-6 border-b border-outline-variant/10">
          {creators.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
              <div className={`relative p-1 rounded-full transition-all duration-300 group-hover:scale-105 ${c.active ? 'bg-gradient-to-tr from-primary to-secondary' : 'bg-surface-container-highest'}`}>
                <div className="bg-background p-0.5 rounded-full">
                  <img src={c.img} alt={c.name} className="w-16 h-16 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                </div>
                {c.isUser && (
                  <div className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full p-1 border-2 border-background">
                    <Plus className="w-3 h-3" />
                  </div>
                )}
              </div>
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase group-hover:text-primary transition-colors">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

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
            <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">Retos de la Comunidad</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background p-4 rounded-sm border border-outline-variant/20 flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-colors">
              <div>
                <h4 className="font-headline font-bold text-sm uppercase text-tertiary">Reto Verde de 7 Días</h4>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">1,240 Participantes • Quedan 3 Días</p>
                <div className="h-1 w-32 bg-surface-container-highest mt-3 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '65%' }}></div>
                </div>
              </div>
              <button className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-sm font-label text-[9px] font-bold tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-all">
                Unirse
              </button>
            </div>
            
            <div className="bg-background p-4 rounded-sm border border-outline-variant/20 flex justify-between items-center group cursor-pointer hover:border-secondary/50 transition-colors">
              <div>
                <h4 className="font-headline font-bold text-sm uppercase text-tertiary">Reto de Hidratación: 3L/Día</h4>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">850 Participantes • En Curso</p>
                <div className="h-1 w-32 bg-surface-container-highest mt-3 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: '40%' }}></div>
                </div>
              </div>
              <button className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-sm font-label text-[9px] font-bold tracking-widest uppercase hover:bg-secondary hover:text-on-secondary transition-all">
                Unirse
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {communityPosts.length === 0 && (
          <EmptyState
            icon="👥"
            title={t.community.title}
            description={t.empty.socialEmpty}
          />
        )}
        {communityPosts.map((post) => (
          <div key={post.id} className="bg-surface-container-low rounded-sm border border-outline-variant/20 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <img src={post.author.img} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <p className="font-headline font-bold text-sm text-tertiary uppercase tracking-tight">{post.author.name}</p>
                  <p className="font-label text-[10px] text-on-surface-variant tracking-widest uppercase">{post.author.role} • {post.author.time}</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-on-surface-variant mb-4 font-body leading-relaxed">{post.content}</p>
              
              {post.type === 'performance' && post.performance && (
                <div className="bg-background rounded-sm border border-outline-variant/20 p-4 grid grid-cols-2 gap-4 mb-2">
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <Activity className="w-6 h-6 text-primary mb-2" />
                    <span className="font-headline text-2xl font-bold text-tertiary">{post.performance.recovery}%</span>
                    <span className="font-label text-xs tracking-widest text-primary uppercase mt-1">Recuperación</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center p-2 border-l border-outline-variant/20">
                    <TrendingUp className="w-6 h-6 text-secondary mb-2" />
                    <span className="font-headline text-2xl font-bold text-tertiary">{post.performance.strain}</span>
                    <span className="font-label text-xs tracking-widest text-secondary uppercase mt-1">Esfuerzo</span>
                  </div>
                </div>
              )}

              {post.type === 'recipe' && post.recipe && (
                <div className="bg-background rounded-sm border border-outline-variant/20 overflow-hidden group cursor-pointer">
                  <div className="h-32 w-full relative">
                    <img src={post.recipe.img} alt="Recipe" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80"></div>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-primary text-on-primary text-[10px] font-black px-2 py-1 tracking-widest uppercase rounded-sm mb-1 inline-block">{post.recipe.tag}</span>
                      <h4 className="font-headline font-bold text-lg uppercase text-tertiary">{post.recipe.title}</h4>
                    </div>
                  </div>
                  <div className="p-3 grid grid-cols-5 gap-2 bg-surface-container-highest/30">
                    <div className="text-center">
                      <span className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">KCAL</span>
                      <span className="text-sm font-headline font-bold text-tertiary">{post.recipe.cal}</span>
                    </div>
                    <div className="text-center border-l border-outline-variant/20">
                      <span className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">PRO</span>
                      <span className="text-sm font-headline font-bold text-tertiary">{post.recipe.pro}g</span>
                    </div>
                    <div className="text-center border-l border-outline-variant/20">
                      <span className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">C</span>
                      <span className="text-sm font-headline font-bold text-tertiary">{post.recipe.carbs || 0}g</span>
                    </div>
                    <div className="text-center border-l border-outline-variant/20">
                      <span className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">F</span>
                      <span className="text-sm font-headline font-bold text-tertiary">{post.recipe.fats || 0}g</span>
                    </div>
                    <div className="text-center border-l border-outline-variant/20">
                      <span className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">TIEMPO</span>
                      <span className="text-sm font-headline font-bold text-tertiary">{post.recipe.time}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-3 bg-surface-container-highest/50 flex gap-6 border-t border-outline-variant/10">
              <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-2 transition-colors ${likedPosts.includes(post.id) ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                <Flame className={`w-5 h-5 ${likedPosts.includes(post.id) ? 'fill-primary' : ''}`} /> 
                <span className="font-label text-xs font-bold">{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
              </button>
              <button 
                onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <MessageSquare className="w-5 h-5" /> <span className="font-label text-xs font-bold">{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors ml-auto">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            
            {activeCommentPost === post.id && (
              <div className="px-5 py-3 bg-surface-container-low border-t border-outline-variant/10">
                {post.commentsList && post.commentsList.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {post.commentsList.map((comment: any) => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-tertiary shrink-0">
                          {comment.author.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-headline text-xs font-bold text-tertiary">{comment.author}</span>
                            <span className="font-label text-[9px] tracking-widest text-on-surface-variant uppercase">{comment.time}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5">{comment.text}</p>
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
                    className="flex-1 bg-surface-container-highest border border-outline-variant/30 py-2 px-3 text-xs font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-sm text-tertiary placeholder:text-on-surface-variant/50"
                    onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                  />
                  <button 
                    onClick={() => handleCommentSubmit(post.id)}
                    disabled={!commentText.trim()}
                    className="w-8 h-8 rounded-sm bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
