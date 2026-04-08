import { Search, Filter, Bookmark, Clock, Flame, Share2, Plus, Activity, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../i18n';
import EmptyState from '../components/EmptyState';

export default function Discovery({ onNavigateToRecipe, savedRecipes = [], onSaveRecipe }: { onNavigateToRecipe?: (recipe: any) => void, savedRecipes?: any[], onSaveRecipe?: (recipe: any) => void }) {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [minProtein, setMinProtein] = useState<number>(0);
  const [minVitaminD, setMinVitaminD] = useState<number>(0);

  const toggleSave = (e: React.MouseEvent, recipe: any) => {
    e.stopPropagation();
    if (onSaveRecipe) {
      onSaveRecipe(recipe);
    }
  };

  const shareRecipe = (e: React.MouseEvent, recipe: any) => {
    e.stopPropagation();
    toast.success(`¡${recipe.title} compartido en la Comunidad!`);
  };

  const openStory = (creator: any) => {
    if (creator.active) {
      setSelectedStory(creator);
    }
  };

  const trending = [
    { id: 1, title: 'Bowl de Salmón Energético', cal: 740, pro: 52, carbs: 45, fats: 20, time: '30M', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80', tag: t.discovery.highProteinFilter, micros: { vitamins: { vitaminD: 25 } } },
    { id: 2, title: 'Pollo al Estilo Keto', cal: 512, pro: 42, carbs: 10, fats: 30, time: '20M', img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80', tag: t.discovery.lowCarbFilter, micros: { vitamins: { vitaminD: 5 } } },
    { id: 3, title: 'Bowl de Quinoa y Vegetales', cal: 482, pro: 22, carbs: 60, fats: 15, time: '15M', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', tag: t.discovery.plantBased, micros: { vitamins: { vitaminD: 0 } } },
  ];

  const quickMeals = [
    { id: 4, title: 'Avena Energética con Frutos', cal: 450, pro: 35, carbs: 50, fats: 10, time: '10M', img: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=600&q=80', tag: 'DESAYUNO', micros: { vitamins: { vitaminD: 2 } } },
    { id: 5, title: 'Wrap de Ensalada de Atún', cal: 380, pro: 32, carbs: 20, fats: 15, time: '5M', img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80', tag: 'ALMUERZO', micros: { vitamins: { vitaminD: 10 } } },
    { id: 6, title: 'Tortitas de Proteína', cal: 410, pro: 40, carbs: 30, fats: 12, time: '12M', img: 'https://images.unsplash.com/photo-1528207776546-384cb11362fc?auto=format&fit=crop&w=600&q=80', tag: 'DESAYUNO', micros: { vitamins: { vitaminD: 8 } } },
  ];

  const filterRecipes = (recipes: any[]) => {
    let filtered = recipes;
    if (activeFilter !== 'ALL') {
      filtered = filtered.filter(r => r.tag === activeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => r.title.toLowerCase().includes(query) || r.tag.toLowerCase().includes(query));
    }
    // Advanced filters
    filtered = filtered.filter(r => (r.pro || 0) >= minProtein);
    filtered = filtered.filter(r => (r.micros?.vitamins?.vitaminD || 0) >= minVitaminD);
    
    return filtered;
  };

  const creators = [
    { id: 1, name: 'Chef Leo', img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80', active: true },
    { id: 2, name: 'Elena S.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80', active: true },
    { id: 3, name: 'Marcus T.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', active: false },
    { id: 4, name: 'Sarah J.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', active: true },
    { id: 5, name: 'Bio Kitchen', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80', active: false },
  ];

  const editorialPick = {
    id: 99,
    title: 'Bowl de Cosecha de Verano',
    author: 'Chef Julianne Thorne',
    cal: 420,
    pro: 18,
    time: '15M',
    match: 98,
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
    tag: 'SELECCIÓN EDITORIAL'
  };

  const renderSwimlane = (title: string, recipes: any[]) => {
    const filteredRecipes = filterRecipes(recipes);
    if (filteredRecipes.length === 0) return null;

    return (
      <section className="mb-10">
        <div className="flex justify-between items-end mb-4 px-6">
          <h3 className="font-headline text-xl font-bold tracking-tight uppercase text-tertiary">{title}</h3>
          <button className="text-primary font-label text-[10px] font-bold tracking-widest uppercase hover:underline">{t.common.seeAll}</button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto hide-scrollbar px-6 pb-4">
          {filteredRecipes.map(recipe => (
            <div 
              key={recipe.id} 
              onClick={() => onNavigateToRecipe && onNavigateToRecipe(recipe)} 
              className="relative shrink-0 w-64 h-80 rounded-lg overflow-hidden group cursor-pointer"
            >
            <img src={recipe.img} alt={recipe.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
            
            {/* Top Actions */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="bg-surface/80 backdrop-blur-md text-primary text-[10px] font-black px-2 py-1 tracking-widest uppercase rounded-sm">
                  {recipe.tag}
                </span>
                <span className="bg-primary text-on-primary text-[9px] font-black px-1.5 py-0.5 rounded-sm w-fit uppercase tracking-tighter">
                  {Math.floor(Math.random() * 15 + 80)}% Coincidencia
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => shareRecipe(e, recipe)}
                  className="w-8 h-8 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={`Compartir ${recipe.title}`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => toggleSave(e, recipe)}
                  className="w-8 h-8 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={savedRecipes.some(r => r.id === recipe.id) ? `Eliminar ${recipe.title} de la Bóveda` : `Guardar ${recipe.title} en la Bóveda`}
                >
                  <Bookmark className={`w-4 h-4 ${savedRecipes.some(r => r.id === recipe.id) ? 'fill-primary text-primary' : ''}`} />
                </button>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <h4 className="font-headline font-bold text-lg text-tertiary leading-tight tracking-tight mb-3 uppercase">{recipe.title}</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-2 py-1 rounded-sm">
                  <Flame className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-headline font-bold text-tertiary">{recipe.cal}</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-2 py-1 rounded-sm">
                  <span className="text-[9px] font-label font-bold text-on-surface-variant tracking-widest">PRO</span>
                  <span className="text-[10px] font-headline font-bold text-tertiary">{recipe.pro}g</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-2 py-1 rounded-sm">
                  <span className="text-[9px] font-label font-bold text-on-surface-variant tracking-widest">C</span>
                  <span className="text-[10px] font-headline font-bold text-tertiary">{recipe.carbs || 0}g</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-2 py-1 rounded-sm">
                  <span className="text-[9px] font-label font-bold text-on-surface-variant tracking-widest">G</span>
                  <span className="text-[10px] font-headline font-bold text-tertiary">{recipe.fats || 0}g</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-sm px-2 py-1 rounded-sm ml-auto">
                  <Clock className="w-3 h-3 text-outline" />
                  <span className="text-[10px] font-headline font-bold text-tertiary">{recipe.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-2 pb-20">
      <section className="px-6 pt-2">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{t.discovery.engineTitle}</span>
            <h2 className="font-headline text-3xl md:text-5xl font-black tracking-tighter uppercase text-tertiary mt-1">Descubrir</h2>
          </div>
          <div className="text-right hidden sm:block">
            <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest">Planes Activos: 04</p>
            <p className="font-mono text-[9px] text-primary uppercase tracking-widest">Estado de Sincronización: Óptimo</p>
          </div>
        </div>
        
        {/* Story Rings (Creator Pulse) */}
        <div className="flex w-full overflow-x-auto hide-scrollbar gap-4 mb-8">
          {creators.map(creator => (
            <button 
              key={creator.id} 
              onClick={() => openStory(creator)}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className={`size-16 rounded-full p-0.5 transition-transform group-hover:scale-110 ${creator.active ? 'bg-gradient-to-tr from-primary to-secondary' : 'border-2 border-outline-variant/30'}`}>
                <div className="w-full h-full rounded-full border-2 border-background bg-surface-container-highest overflow-hidden">
                  <img src={creator.img} alt={creator.name} className={`w-full h-full object-cover ${!creator.active && 'grayscale opacity-60'}`} referrerPolicy="no-referrer" />
                </div>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-tighter transition-colors ${creator.active ? 'text-tertiary' : 'text-on-surface-variant'}`}>{creator.name}</p>
            </button>
          ))}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <button 
              className="size-16 rounded-full border-2 border-dashed border-outline-variant/50 flex items-center justify-center text-outline hover:text-primary hover:border-primary transition-all"
              aria-label="Añadir nueva publicación"
            >
              <Plus className="w-6 h-6" />
            </button>
            <p className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">Añadir Publicación</p>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.discovery.searchPlaceholder} 
            className="w-full bg-surface-container-low border border-outline-variant/30 py-4 pl-12 pr-4 text-sm font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-sm text-tertiary placeholder:text-on-surface-variant/50 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-6">
          <button 
            onClick={() => setActiveFilter('ALL')}
            className={`px-5 py-2 font-label text-xs font-bold tracking-widest whitespace-nowrap rounded-sm flex items-center gap-2 transition-colors ${activeFilter === 'ALL' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-tertiary border border-outline-variant/30 hover:bg-surface-container-highest'}`}
          >
            <Filter className="w-3 h-3" /> {t.discovery.allFilters}
          </button>
          <button
            onClick={() => setActiveFilter(t.discovery.highProteinFilter)}
            className={`px-5 py-2 font-label text-xs font-bold tracking-widest whitespace-nowrap rounded-sm transition-colors ${activeFilter === t.discovery.highProteinFilter ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-tertiary border border-outline-variant/30 hover:bg-surface-container-highest'}`}
          >
            {t.discovery.highProteinFilter}
          </button>
          <button
            onClick={() => setActiveFilter(t.discovery.lowCarbFilter)}
            className={`px-5 py-2 font-label text-xs font-bold tracking-widest whitespace-nowrap rounded-sm transition-colors ${activeFilter === t.discovery.lowCarbFilter ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-tertiary border border-outline-variant/30 hover:bg-surface-container-highest'}`}
          >
            {t.discovery.lowCarbFilter}
          </button>
          <button
            onClick={() => setActiveFilter(t.discovery.plantBased)}
            className={`px-5 py-2 font-label text-xs font-bold tracking-widest whitespace-nowrap rounded-sm transition-colors ${activeFilter === t.discovery.plantBased ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-tertiary border border-outline-variant/30 hover:bg-surface-container-highest'}`}
          >
            {t.discovery.plantBased}
          </button>
        </div>

        {/* Advanced Filters */}
        <div className="flex gap-4 overflow-x-auto pb-6">
            <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Min Proteína (g)</span>
                <input type="number" value={minProtein} onChange={(e) => setMinProtein(Number(e.target.value))} className="w-12 bg-transparent text-xs font-bold text-tertiary outline-none" />
            </div>
            <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Min Vit D (mcg)</span>
                <input type="number" value={minVitaminD} onChange={(e) => setMinVitaminD(Number(e.target.value))} className="w-12 bg-transparent text-xs font-bold text-tertiary outline-none" />
            </div>
        </div>
      </section>

      {/* Editorial Pick Hero */}
      <section className="px-6 mb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-1">Selección Destacada</p>
            <h3 className="font-headline text-2xl font-bold tracking-tight uppercase text-tertiary">Mejor Receta</h3>
          </div>
          <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Ciclo 24 / Fase 08</div>
        </div>

        <div 
          onClick={() => onNavigateToRecipe && onNavigateToRecipe(editorialPick)}
          className="relative rounded-sm overflow-hidden aspect-[4/5] md:aspect-video group cursor-pointer shadow-2xl"
        >
          <img src={editorialPick.img} alt={editorialPick.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
          
          <div className="absolute top-4 left-4">
            <span className="bg-primary text-on-primary text-[10px] font-black px-3 py-1 tracking-widest uppercase rounded-sm shadow-lg">
              Subiendo Rápido
            </span>
          </div>

          <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md rounded-sm p-2 flex flex-col items-center border border-outline-variant/20">
            <span className="text-[9px] font-black text-on-surface-variant leading-none uppercase tracking-tighter">Coincidencia Real</span>
            <span className="text-xl font-black text-primary leading-none mt-1">{editorialPick.match}%</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <p className="text-primary text-[10px] font-black tracking-[0.3em] mb-3 uppercase">{editorialPick.author}</p>
            <h3 className="text-tertiary text-4xl md:text-7xl font-headline font-black leading-[0.85] tracking-tighter uppercase mb-6 drop-shadow-2xl">
              {editorialPick.title}
            </h3>
            <div className="flex items-center gap-6 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><Clock className="w-3 h-3 text-primary" /> {editorialPick.time}</span>
              <span className="flex items-center gap-2"><Flame className="w-3 h-3 text-primary" /> {editorialPick.cal} KCAL</span>
              <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-primary" /> 4.9 (2.1k)</span>
            </div>
          </div>
        </div>
      </section>

      {filterRecipes(trending).length === 0 && filterRecipes(quickMeals).length === 0 && (
        <div className="px-6 py-12">
          <EmptyState
            icon="🔍"
            title={t.common.noResults}
            description={t.empty.searchEmpty}
          />
        </div>
      )}
      {renderSwimlane('Tendencias de esta Semana', trending)}
      {renderSwimlane('Menos de 15 Minutos', quickMeals)}
      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg aspect-[9/16] bg-surface-container-highest rounded-sm overflow-hidden shadow-2xl">
            <img 
              src={selectedStory.img} 
              alt="Story Content" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 blur-xl scale-110" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex flex-col p-6 z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                    <img src={selectedStory.img} alt={selectedStory.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-white uppercase text-sm">{selectedStory.name}</h4>
                    <p className="text-[10px] text-white/60 uppercase tracking-widest">Hace 2h • Inteligencia de Salud</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStory(null)}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  aria-label="Cerrar historia"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content Placeholder */}
              <div className="flex-1 flex flex-col justify-end pb-12">
                <div className="bg-black/40 backdrop-blur-xl p-6 rounded-sm border border-white/10">
                  <span className="bg-primary text-on-primary text-[10px] font-black px-2 py-1 tracking-widest uppercase rounded-sm mb-3 inline-block">
                    Nueva Receta
                  </span>
                  <h3 className="font-headline text-3xl font-bold text-white uppercase tracking-tighter leading-tight mb-4">
                    La Rutina de <br/> Bienestar Matutina
                  </h3>
                  <button className="w-full bg-white text-black py-4 rounded-sm font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary transition-colors">
                    Ver Receta Completa
                  </button>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex gap-1 z-20">
              <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/2"></div>
              </div>
              <div className="h-1 flex-1 bg-white/20 rounded-full"></div>
              <div className="h-1 flex-1 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
