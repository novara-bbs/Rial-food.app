import { ArrowLeft, Search, Plus, Camera, Barcode, Loader2, BookOpen, Leaf, Globe } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Ingredient, Recipe } from '../types';
import { useI18n } from '../i18n';
import { getFoodQuality, FOOD_QUALITY_EMOJI } from '../utils/nutrition';
import BarcodeScanner from '../components/BarcodeScanner';
import EmptyState from '../components/EmptyState';

// Open Food Facts API search
async function searchOpenFoodFacts(query: string): Promise<any[]> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=id,product_name,brands,nutriments`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    return (data.products || [])
      .filter((p: any) => p.product_name)
      .map((p: any) => ({
        id: `off_${p.id}`,
        title: p.product_name + (p.brands ? ` (${p.brands})` : ''),
        cal: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
        pro: parseFloat((p.nutriments?.proteins_100g || 0).toFixed(1)),
        carbs: parseFloat((p.nutriments?.carbohydrates_100g || 0).toFixed(1)),
        fats: parseFloat((p.nutriments?.fat_100g || 0).toFixed(1)),
        isApiResult: true,
      }));
  } catch {
    return [];
  }
}

export default function AddMeal({ onBack, onLogMeal, dailyMacros, savedRecipes = [], dictionary = [] }: { onBack: () => void, onLogMeal?: (meal: any) => void, dailyMacros?: any, savedRecipes?: Recipe[], dictionary?: Ingredient[] }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'recipes' | 'ingredients'>('recipes');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced API search for ingredients tab
  useEffect(() => {
    if (activeTab !== 'ingredients' || !searchQuery.trim() || searchQuery.length < 3) {
      setApiResults([]);
      return;
    }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      setIsSearchingApi(true);
      const results = await searchOpenFoodFacts(searchQuery);
      setApiResults(results);
      setIsSearchingApi(false);
    }, 500);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery, activeTab]);

  const macros = dailyMacros || {
    consumed: { cal: 840, pro: 45, carbs: 110, fats: 25 },
    target: { cal: 2400, pro: 180, carbs: 250, fats: 65 }
  };

  const getPercentage = (consumed: number, target: number) => Math.min(100, Math.round((consumed / target) * 100));

  let localFoods: any[] = [];
  if (activeTab === 'recipes') {
    localFoods = savedRecipes;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      localFoods = localFoods.filter(r => r.title.toLowerCase().includes(query));
    }
  } else {
    localFoods = dictionary;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      localFoods = localFoods.filter(i => i.name.toLowerCase().includes(query));
    }
  }

  // Merge local + API results (local first)
  const displayFoods = activeTab === 'ingredients' ? [...localFoods, ...apiResults] : localFoods;

  const handleAiVisionClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      // Simulate AI analysis delay
      setTimeout(() => {
        setIsAnalyzing(false);
        if (onLogMeal) {
          onLogMeal({
            id: Date.now(),
            title: 'Detectado por IA: Salmón a la Parrilla y Espárragos',
            cal: 420,
            pro: 38,
            carbs: 12,
            fats: 22,
            time: 'Justo ahora'
          });
        }
      }, 2000);
    }
  };

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-6 pb-24">
      <header className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-tertiary hover:bg-surface-container-highest transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">{t.home.registered}</span>
          <h2 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">{t.home.addMeal}</h2>
        </div>
      </header>

      {/* Intelligent Macro Context */}
      <section className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="font-headline font-bold text-lg uppercase text-tertiary">Restante Hoy</h3>
            <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-1">Objetivo: {macros.target.cal} KCAL</p>
          </div>
          <div className="text-right">
            <span className="font-headline text-3xl font-bold text-primary">{Math.max(0, macros.target.cal - macros.consumed.cal)}</span>
            <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase ml-1">KCAL</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-label font-bold tracking-widest uppercase mb-1">
              <span className="text-on-surface-variant">Proteína</span>
              <span className="text-tertiary">{Math.max(0, macros.target.pro - macros.consumed.pro)}g restantes</span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${getPercentage(macros.consumed.pro, macros.target.pro)}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-label font-bold tracking-widest uppercase mb-1">
              <span className="text-on-surface-variant">Carbohidratos</span>
              <span className="text-tertiary">{Math.max(0, macros.target.carbs - macros.consumed.carbs)}g restantes</span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-brand-secondary rounded-full transition-all duration-1000" style={{ width: `${getPercentage(macros.consumed.carbs, macros.target.carbs)}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onClose={() => setShowScanner(false)}
          onProductFound={(product) => {
            setShowScanner(false);
            if (onLogMeal) {
              onLogMeal({
                id: Date.now(),
                title: `${product.name}${product.brand ? ` (${product.brand})` : ''}`,
                cal: product.calories,
                pro: product.protein,
                carbs: product.carbs,
                fats: product.fats,
                macros: { calories: product.calories, protein: product.protein, carbs: product.carbs, fats: product.fats },
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
            }
          }}
        />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowScanner(true)}
          className="bg-surface-container-high text-tertiary border border-outline-variant/30 p-4 font-label text-xs font-bold tracking-widest uppercase flex flex-col items-center justify-center gap-3 rounded-2xl hover:bg-surface-container-highest transition-colors group"
        >
          <Barcode className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
          {t.fab.scanBarcode}
        </button>
        <button 
          onClick={handleAiVisionClick}
          disabled={isAnalyzing}
          className="bg-surface-container-high text-tertiary border border-outline-variant/30 p-4 font-label text-xs font-bold tracking-widest uppercase flex flex-col items-center justify-center gap-3 rounded-2xl hover:bg-surface-container-highest transition-colors group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {isAnalyzing ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin relative z-10" />
          ) : (
            <Camera className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors relative z-10" />
          )}
          <span className="relative z-10">{isAnalyzing ? t.common.loading : t.fab.photoAI}</span>
        </button>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="BUSCAR ALIMENTOS, RECETAS..." 
          className="w-full bg-surface-container-low border border-outline-variant/30 py-4 pl-12 pr-4 text-sm font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-2xl text-tertiary placeholder:text-on-surface-variant/50"
        />
      </div>

      <div className="flex border-b border-outline-variant/20">
        <button 
          onClick={() => setActiveTab('recipes')}
          className={`flex-1 py-3 font-headline text-sm font-bold tracking-widest uppercase transition-colors border-b-2 ${
            activeTab === 'recipes' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-tertiary'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" /> Recetas
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('ingredients')}
          className={`flex-1 py-3 font-headline text-sm font-bold tracking-widest uppercase transition-colors border-b-2 ${
            activeTab === 'ingredients' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-tertiary'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Leaf className="w-4 h-4" /> Ingredientes
          </div>
        </button>
      </div>

      <div className="space-y-3">
        {/* API loading indicator */}
        {isSearchingApi && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label uppercase tracking-widest py-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Buscando en Open Food Facts...
          </div>
        )}

        {displayFoods.length === 0 && !isSearchingApi && searchQuery.trim() && (
          <EmptyState
            icon="🔍"
            title={t.common.noResults}
            description={t.empty.searchEmpty}
          />
        )}
        {displayFoods.map(food => (
          <div key={food.id} className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 flex items-center justify-between group hover:border-primary/30 transition-colors cursor-pointer">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-headline font-bold text-base uppercase text-tertiary">{food.title || food.name}</h4>
                {food.isApiResult && (
                  <span className="text-[8px] font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Globe className="w-2 h-2" /> API
                  </span>
                )}
                {!food.isApiResult && food.macros && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">✓</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs font-label tracking-widest uppercase text-on-surface-variant">
                <span className="text-primary">{food.cal || food.macros?.calories || 0} {t.common.kcal}</span>
                <span>•</span>
                <span>{food.pro || food.macros?.protein || 0}{t.common.g} P</span>
                {food.macros && <span>{FOOD_QUALITY_EMOJI[getFoodQuality(food.macros, food.micros?.others?.fiber)]}</span>}
              </div>
            </div>
            <button
              onClick={() => onLogMeal && onLogMeal(food)}
              className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
