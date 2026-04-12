import { Eye, Bookmark, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAppState } from '../../../contexts/AppStateContext';
import { useI18n } from '../../../i18n';
import { getCreatorAnalytics } from '../utils/analytics';
import PageHeader from '../../../components/patterns/PageHeader';

export default function CreatorDashboard({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { savedRecipes, communityPosts, userProfile } = useAppState();
  const cd = t.creatorDashboard;

  // Derive real analytics from recipeAnalytics localStorage
  const analytics = getCreatorAnalytics(savedRecipes);
  const userPosts = communityPosts.filter((p: any) => p.author?.name === userProfile.name || p.author?.name === 'Tú' || p.author?.id === 'self');
  const totalRecipes = savedRecipes.length;
  const totalPosts = userPosts.length;
  const totalViews = analytics.totalViews;
  const totalSaves = analytics.totalSaves;

  const topRecipes = analytics.topRecipes.slice(0, 4).map((r, i) => ({
    name: r.title || `Recipe ${i + 1}`,
    views: r.views,
    saves: Math.floor(r.views * 0.1),
    revenue: 0,
  }));
  // Fill with remaining recipes if fewer than 4 have analytics
  while (topRecipes.length < Math.min(4, savedRecipes.length)) {
    const idx = topRecipes.length;
    const r = savedRecipes[idx];
    if (r && !topRecipes.find(tr => tr.name === r.title)) {
      topRecipes.push({ name: r.title || `Recipe ${idx + 1}`, views: 0, saves: 0, revenue: 0 });
    } else break;
  }

  return (
    <PageShell maxWidth="default" spacing="md">
      <PageHeader
        onBack={onBack}
        title={cd.title}
        rightAction={<Badge variant="default">{cd.verified}</Badge>}
      />

      {/* Overview cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-surface-container-low border-outline-variant/20">
          <CardContent className="p-4 text-center">
            <Eye className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="font-headline font-black text-2xl text-tertiary">{(totalViews / 1000).toFixed(1)}k</p>
            <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{cd.views}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-low border-outline-variant/20">
          <CardContent className="p-4 text-center">
            <Bookmark className="w-5 h-5 text-brand-secondary mx-auto mb-1" />
            <p className="font-headline font-black text-2xl text-tertiary">{(totalSaves / 1000).toFixed(1)}k</p>
            <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{cd.saves}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-low border-outline-variant/20">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="font-headline font-black text-2xl text-tertiary">0€</p>
            <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{cd.revenue}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="analytics" className="font-headline text-xs font-bold uppercase tracking-widest">{cd.analytics}</TabsTrigger>
          <TabsTrigger value="recipes" className="font-headline text-xs font-bold uppercase tracking-widest">{cd.recipes}</TabsTrigger>
          <TabsTrigger value="revenue" className="font-headline text-xs font-bold uppercase tracking-widest">{cd.revenue}</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <Card className="bg-surface-container-low border-outline-variant/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> {cd.growth}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-on-surface-variant">{cd.viewsThisMonth}</span>
                <Badge variant="outline" className="text-primary border-primary/30">+{0}%</Badge>
              </div>
              <Progress value={68} className="h-2" />
              <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{cd.monthlyGoal}</p>

              <Separator className="my-3" />

              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-on-surface-variant">{cd.publishedRecipes}</span>
                <span className="font-headline font-black text-lg text-tertiary">{savedRecipes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-on-surface-variant">{cd.saveRate}</span>
                <span className="font-headline font-black text-lg text-primary">10.6%</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-3 mt-4">
          {topRecipes.map((recipe, i) => (
            <Card key={i} className="bg-surface-container-low border-outline-variant/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-sm flex items-center justify-center shrink-0">
                  <span className="font-headline font-black text-sm text-primary">#{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-on-surface truncate">{recipe.name}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {(recipe.views / 1000).toFixed(1)}k
                    </span>
                    <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                      <Bookmark className="w-3 h-3" /> {recipe.saves}
                    </span>
                  </div>
                </div>
                <span className="font-headline font-black text-sm text-primary shrink-0">{recipe.revenue.toFixed(0)}€</span>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4 mt-4">
          <Card className="bg-surface-container-low border-outline-variant/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> {cd.breakdown}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[{ month: 'Abr', amount: 0 }].map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{m.month} 2026</span>
                    <span className="font-headline font-bold text-sm text-tertiary">{m.amount}€</span>
                  </div>
                  <Progress value={(m.amount / 400) * 100} className="h-1.5" />
                </div>
              ))}

              <Separator className="my-3" />

              <div className="bg-primary/10 border border-primary/20 rounded-sm p-4 space-y-2">
                <p className="font-label text-[9px] uppercase tracking-widest text-primary font-bold">{cd.revenueShare}</p>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-on-surface-variant">{cd.yourShare}</span>
                  <span className="font-headline font-black text-tertiary">0.00€</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-on-surface-variant">{cd.rialShare}</span>
                  <span className="font-headline font-bold text-on-surface-variant">0.00€</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
