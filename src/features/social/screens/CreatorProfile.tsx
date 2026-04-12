import { CheckCircle2, Calendar, ChefHat, Flame, Settings, UserPlus, UserCheck, Instagram, Youtube, Globe, Music2 } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EmptyState from '../../../components/EmptyState';
import PageHeader from '../../../components/patterns/PageHeader';
import RecipeCard from '../../../components/patterns/RecipeCard';
import { CREATORS_MAP } from '../data/seed-creators';

export default function CreatorProfile({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { communityPosts, savedRecipes, userProfile, selectedCreatorId, setSelectedPostId, navigateToRecipe } = useAppState();
  const { navigateTo } = useNavigation();
  const [followedCreators, setFollowedCreators] = useLocalStorageState<string[]>('followedCreators', []);
  const cp = t.creatorProfile;

  const isSelf = !selectedCreatorId || selectedCreatorId === 'self';

  const creator = useMemo(() => {
    if (isSelf) {
      return {
        id: 'self',
        name: userProfile.name || 'User',
        badge: '',
        verified: false,
        followers: followedCreators.length,
        recipes: savedRecipes.length,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        streak: 0,
        bio: userProfile.bio || '',
        socialLinks: userProfile.socialLinks || {},
      };
    }
    return CREATORS_MAP[selectedCreatorId] || CREATORS_MAP['chef-marta'];
  }, [isSelf, selectedCreatorId, userProfile, savedRecipes.length, followedCreators.length]);

  const isFollowing = followedCreators.includes(creator.id);

  const toggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFollowing = followedCreators.includes(creator.id);
    setFollowedCreators((prev: string[]) =>
      prev.includes(creator.id) ? prev.filter(c => c !== creator.id) : [...prev, creator.id]
    );
    toast.success(wasFollowing ? (t.social?.unfollowed || 'Dejaste de seguir') : (t.social?.followed || 'Siguiendo'));
  };

  const creatorPosts = useMemo(() => {
    if (isSelf) {
      return communityPosts.filter((p: any) => p.author?.name === userProfile.name || p.author?.name === 'Tú');
    }
    return communityPosts.filter((p: any) => p.author?.id === creator.id || p.author?.name === creator.name);
  }, [communityPosts, isSelf, creator, userProfile.name]);

  const creatorRecipes = useMemo(() => {
    if (isSelf) return savedRecipes;
    return savedRecipes.filter((r: any) => r.publishedBy === creator.id);
  }, [isSelf, savedRecipes, creator.id]);

  return (
    <PageShell maxWidth="narrow" spacing="md">
      <PageHeader onBack={onBack} title={cp.title} />

      {/* Profile card */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
        <div className="flex items-start gap-5">
          <img src={creator.avatar} alt={creator.name} className="w-20 h-20 rounded-full object-cover border-2 border-primary/30" referrerPolicy="no-referrer" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-headline font-bold text-lg uppercase text-tertiary truncate">@{creator.name}</h2>
              {creator.verified && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
            </div>
            {creator.badge && (
              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded inline-block mt-1">{creator.badge}</span>
            )}
            {creator.bio && (
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{creator.bio}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-outline-variant/10">
          <div className="text-center">
            <span className="font-headline font-black text-lg text-tertiary">{creator.followers >= 1000 ? `${(creator.followers / 1000).toFixed(1)}K` : creator.followers}</span>
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-0.5">{cp.followers}</span>
          </div>
          <div className="text-center">
            <span className="font-headline font-black text-lg text-tertiary">{creatorPosts.length}</span>
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-0.5">{cp.posts}</span>
          </div>
          <div className="text-center">
            <span className="font-headline font-black text-lg text-tertiary">{creator.recipes}</span>
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-0.5">{cp.recipes}</span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-5">
          {isSelf ? (
            <button type="button"
              onClick={() => navigateTo('settings')}
              className="w-full py-2.5 bg-surface-container-highest text-on-surface-variant rounded-sm font-headline text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:text-primary transition-colors"
            >
              <Settings className="w-4 h-4" /> {cp.editProfile}
            </button>
          ) : (
            <button type="button"
              onClick={toggleFollow}
              className={`w-full py-2.5 rounded-sm font-headline text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                isFollowing
                  ? 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 hover:border-error/50 hover:text-error'
                  : 'bg-primary text-on-primary hover:opacity-90'
              }`}
            >
              {isFollowing ? <><UserCheck className="w-4 h-4" /> {cp.following}</> : <><UserPlus className="w-4 h-4" /> {cp.follow}</>}
            </button>
          )}
        </div>
      </div>

      {/* Tabs: Posts | Recipes | About */}
      <Tabs defaultValue="posts">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="posts" className="font-headline text-xs font-bold uppercase tracking-widest">{cp.posts}</TabsTrigger>
          <TabsTrigger value="recipes" className="font-headline text-xs font-bold uppercase tracking-widest">{cp.recipes}</TabsTrigger>
          <TabsTrigger value="about" className="font-headline text-xs font-bold uppercase tracking-widest">{cp.about}</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-4">
          {creatorPosts.length === 0 ? (
            <EmptyState icon="📝" title={cp.noPosts} description={isSelf ? cp.noPostsSelf : cp.noPosts} />
          ) : (
            creatorPosts.map((post: any) => (
              <div key={post.id}
                onClick={() => { setSelectedPostId(post.id); navigateTo('post-detail'); }}
                className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <p className="text-sm text-on-surface-variant font-body leading-relaxed">{post.content}</p>
                {post.type === 'recipe' && post.recipe && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      const full = savedRecipes.find((r: any) => String(r.id) === String(post.recipe.id));
                      navigateToRecipe(full || { ...post.recipe, macros: { calories: post.recipe.cal, protein: post.recipe.pro, carbs: post.recipe.carbs, fats: post.recipe.fats } });
                    }}
                    className="mt-3 bg-background border border-outline-variant/20 rounded-sm p-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors"
                  >
                    {post.recipe.img ? (
                      <img src={post.recipe.img} alt={post.recipe.title} className="w-12 h-12 rounded-sm object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-primary/10 to-tertiary/10 flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-on-surface-variant/30" />
                      </div>
                    )}
                    <div>
                      <span className="font-headline font-bold text-xs uppercase text-tertiary">{post.recipe.title}</span>
                      <span className="font-label text-[9px] tracking-widest text-on-surface-variant block mt-0.5">{post.recipe.cal} kcal · {post.recipe.pro}g P</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {post.likes}</span>
                  <span className="font-label text-[9px] tracking-widest uppercase">{post.author?.time || ''}</span>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="recipes" className="mt-4">
          {creatorRecipes.length === 0 ? (
            <EmptyState icon="🍳" title={cp.noRecipes} description={cp.noRecipes} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {creatorRecipes.slice(0, 8).map((recipe: any, i: number) => (
                <RecipeCard
                  key={recipe.id || i}
                  recipe={{ ...recipe, cal: recipe.macros?.calories || recipe.cal || 0, pro: recipe.macros?.protein || recipe.pro || 0 }}
                  variant="grid"
                  onPress={() => navigateToRecipe(recipe)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="about" className="space-y-4 mt-4">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-4">
            {creator.bio && (
              <div>
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-1">{cp.bio}</span>
                <p className="text-sm text-on-surface font-body leading-relaxed">{creator.bio}</p>
              </div>
            )}
            {creator.badge && (
              <div className="flex items-center gap-2">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{cp.badge}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">{creator.badge}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-outline-variant/10">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-headline font-bold text-sm text-tertiary">{creator.streak}</span>
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{cp.streakDays}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-on-surface-variant" />
                <div>
                  <span className="font-headline font-bold text-sm text-tertiary">{creator.recipes}</span>
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">{cp.recipes}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {creator.socialLinks && (
              creator.socialLinks.instagram || creator.socialLinks.youtube || creator.socialLinks.tiktok || creator.socialLinks.website
            ) && (
              <div className="pt-3 border-t border-outline-variant/10">
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-3">{cp.socialLinks}</span>
                <div className="flex flex-wrap gap-2">
                  {creator.socialLinks.instagram && (
                    <a href={`https://instagram.com/${creator.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-surface-container-highest px-3 py-2 rounded-sm hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label={`Instagram: @${creator.socialLinks.instagram}`}>
                      <Instagram className="w-4 h-4" /> <span className="text-xs">@{creator.socialLinks.instagram}</span>
                    </a>
                  )}
                  {creator.socialLinks.youtube && (
                    <a href={creator.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-surface-container-highest px-3 py-2 rounded-sm hover:bg-error/10 hover:text-error transition-colors"
                      aria-label="YouTube">
                      <Youtube className="w-4 h-4" /> <span className="text-xs">YouTube</span>
                    </a>
                  )}
                  {creator.socialLinks.tiktok && (
                    <a href={`https://tiktok.com/@${creator.socialLinks.tiktok}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-surface-container-highest px-3 py-2 rounded-sm hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label={`TikTok: @${creator.socialLinks.tiktok}`}>
                      <Music2 className="w-4 h-4" /> <span className="text-xs">@{creator.socialLinks.tiktok}</span>
                    </a>
                  )}
                  {creator.socialLinks.website && (
                    <a href={creator.socialLinks.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-surface-container-highest px-3 py-2 rounded-sm hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label={creator.socialLinks.website}>
                      <Globe className="w-4 h-4" /> <span className="text-xs">{(() => { try { return new URL(creator.socialLinks.website).hostname; } catch { return creator.socialLinks.website; } })()}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
