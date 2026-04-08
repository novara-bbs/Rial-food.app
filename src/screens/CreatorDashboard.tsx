import { ArrowLeft, Eye, Bookmark, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAppState } from '../contexts/AppStateContext';

const MOCK_ANALYTICS = {
  totalViews: 12_480,
  totalSaves: 1_320,
  totalRevenue: 847.50,
  revenueGrowth: 12.3,
  topRecipes: [
    { name: 'Bowl Proteico Mediterráneo', views: 3_200, saves: 420, revenue: 189.00 },
    { name: 'Wrap Thai de Pollo', views: 2_800, saves: 310, revenue: 142.50 },
    { name: 'Smoothie Recovery Verde', views: 2_100, saves: 280, revenue: 98.00 },
    { name: 'Overnight Oats Tropical', views: 1_900, saves: 190, revenue: 78.50 },
  ],
  monthlyRevenue: [
    { month: 'Ene', amount: 120 },
    { month: 'Feb', amount: 145 },
    { month: 'Mar', amount: 198 },
    { month: 'Abr', amount: 384 },
  ],
};

export default function CreatorDashboard({ onBack }: { onBack: () => void }) {
  const { savedRecipes } = useAppState();

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-surface-container-highest rounded-sm transition-colors" aria-label="Volver">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">RIAL</span>
          <h1 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">Panel Creador</h1>
        </div>
        <Badge variant="default" className="ml-auto">Verificado</Badge>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-surface-container-low border-outline-variant/20">
          <CardContent className="p-4 text-center">
            <Eye className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="font-headline font-black text-2xl text-tertiary">{(MOCK_ANALYTICS.totalViews / 1000).toFixed(1)}k</p>
            <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Vistas</p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-low border-outline-variant/20">
          <CardContent className="p-4 text-center">
            <Bookmark className="w-5 h-5 text-brand-secondary mx-auto mb-1" />
            <p className="font-headline font-black text-2xl text-tertiary">{(MOCK_ANALYTICS.totalSaves / 1000).toFixed(1)}k</p>
            <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Guardados</p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-low border-outline-variant/20">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="font-headline font-black text-2xl text-tertiary">{MOCK_ANALYTICS.totalRevenue.toFixed(0)}€</p>
            <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">Ingresos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="analytics" className="font-headline text-xs font-bold uppercase tracking-widest">Analítica</TabsTrigger>
          <TabsTrigger value="recipes" className="font-headline text-xs font-bold uppercase tracking-widest">Recetas</TabsTrigger>
          <TabsTrigger value="revenue" className="font-headline text-xs font-bold uppercase tracking-widest">Ingresos</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <Card className="bg-surface-container-low border-outline-variant/20">
            <CardHeader className="pb-2">
              <CardTitle className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Crecimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-on-surface-variant">Vistas este mes</span>
                <Badge variant="outline" className="text-primary border-primary/30">+{MOCK_ANALYTICS.revenueGrowth}%</Badge>
              </div>
              <Progress value={68} className="h-2" />
              <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">68% del objetivo mensual (20k vistas)</p>

              <Separator className="my-3" />

              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-on-surface-variant">Recetas publicadas</span>
                <span className="font-headline font-black text-lg text-tertiary">{savedRecipes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-on-surface-variant">Tasa de guardado</span>
                <span className="font-headline font-black text-lg text-primary">10.6%</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-3 mt-4">
          {MOCK_ANALYTICS.topRecipes.map((recipe, i) => (
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
                <BarChart3 className="w-4 h-4 text-primary" /> Desglose
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_ANALYTICS.monthlyRevenue.map((m, i) => (
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
                <p className="font-label text-[9px] uppercase tracking-widest text-primary font-bold">Reparto de ingresos</p>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-on-surface-variant">Tu parte (75%)</span>
                  <span className="font-headline font-black text-tertiary">{(MOCK_ANALYTICS.totalRevenue * 0.75).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-on-surface-variant">RIAL (25%)</span>
                  <span className="font-headline font-bold text-on-surface-variant">{(MOCK_ANALYTICS.totalRevenue * 0.25).toFixed(2)}€</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
