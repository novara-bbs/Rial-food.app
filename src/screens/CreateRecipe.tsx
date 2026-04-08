import { ArrowLeft, Camera, Plus, Save, Search, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Ingredient, RecipeIngredient, Micronutrients } from '../types';
import { useI18n } from '../i18n';

export default function CreateRecipe({ onBack, onCreateRecipe, dictionary = [] }: { onBack: () => void, onCreateRecipe?: (recipe: any) => void, dictionary?: Ingredient[] }) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Medio' | 'Difícil'>('Fácil');
  const [instructions, setInstructions] = useState(['']);
  
  // New structured ingredients
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [supplements, setSupplements] = useState<string[]>(['']);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Auto-calculate macros and micros
  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fats = 0, saturatedFat = 0, transFat = 0, sugar = 0;
    const micros: Micronutrients = { 
      vitamins: {}, 
      minerals: {}, 
      others: {} 
    };

    recipeIngredients.forEach(ri => {
      const ing = dictionary.find(i => i.id === ri.ingredientId);
      if (ing) {
        const ratio = ri.amount / ing.baseAmount;
        calories += ing.macros.calories * ratio;
        protein += ing.macros.protein * ratio;
        carbs += ing.macros.carbs * ratio;
        fats += ing.macros.fats * ratio;
        saturatedFat += (ing.macros.saturatedFat || 0) * ratio;
        transFat += (ing.macros.transFat || 0) * ratio;
        sugar += (ing.macros.sugar || 0) * ratio;

        if (ing.micros) {
          Object.entries(ing.micros.vitamins).forEach(([key, val]) => {
            micros.vitamins[key as keyof typeof micros.vitamins] = ((micros.vitamins[key as keyof typeof micros.vitamins] || 0) + (val as number) * ratio);
          });
          Object.entries(ing.micros.minerals).forEach(([key, val]) => {
            micros.minerals[key as keyof typeof micros.minerals] = ((micros.minerals[key as keyof typeof micros.minerals] || 0) + (val as number) * ratio);
          });
          Object.entries(ing.micros.others).forEach(([key, val]) => {
            micros.others[key as keyof typeof micros.others] = ((micros.others[key as keyof typeof micros.others] || 0) + (val as number) * ratio);
          });
        }
      }
    });

    return { 
      macros: { 
        calories: Math.round(calories), 
        protein: Math.round(protein), 
        carbs: Math.round(carbs), 
        fats: Math.round(fats),
        saturatedFat: Math.round(saturatedFat),
        transFat: Math.round(transFat),
        sugar: Math.round(sugar)
      }, 
      micros 
    };
  }, [recipeIngredients, dictionary]);

  const addInstruction = () => setInstructions([...instructions, '']);
  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const addSupplement = () => setSupplements([...supplements, '']);
  const updateSupplement = (index: number, value: string) => {
    const newSupplements = [...supplements];
    newSupplements[index] = value;
    setSupplements(newSupplements);
  };

  const handleAddIngredient = (ing: Ingredient) => {
    setRecipeIngredients([...recipeIngredients, {
      id: Date.now().toString(),
      ingredientId: ing.id,
      amount: ing.baseAmount,
      unit: ing.baseUnit,
      ingredient: ing
    }]);
    setSearchQuery('');
    setIsSearching(false);
  };

  const updateRecipeIngredientAmount = (id: string, amount: string) => {
    setRecipeIngredients(prev => prev.map(ri => ri.id === id ? { ...ri, amount: Number(amount) || 0 } : ri));
  };

  const removeRecipeIngredient = (id: string) => {
    setRecipeIngredients(prev => prev.filter(ri => ri.id !== id));
  };

  const handleSave = () => {
    if (onCreateRecipe) {
      onCreateRecipe({
        title: title || 'Receta sin título',
        description: description || '',
        prepTime: prepTime || '15M',
        cookTime: cookTime || '15M',
        difficulty: difficulty,
        macros: totals.macros,
        micros: totals.micros,
        supplements: supplements.filter(s => s.trim() !== ''),
        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        recipeIngredients,
        instructions: instructions.filter(i => i.trim() !== '')
      });
    }
  };

  const filteredDictionary = dictionary.filter(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-tertiary hover:bg-surface-container-highest transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">Estudio</span>
            <h2 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">Nueva Receta</h2>
          </div>
        </div>
        <button onClick={handleSave} className="bg-primary text-on-primary px-4 py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-primary-container transition-colors">
          <Save className="w-4 h-4" /> Guardar
        </button>
      </header>

      {/* Photo Upload */}
      <section>
        <div className="w-full h-48 md:h-64 bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-lg flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Camera className="w-6 h-6" />
          </div>
          <span className="font-headline font-bold text-sm uppercase tracking-widest">Subir Foto de Portada</span>
        </div>
      </section>

      {/* Basic Info */}
      <section className="space-y-4">
        <div>
          <label className="font-label text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">Título de la Receta</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ej., Bol de Poder Anabólico" className="w-full bg-surface-container-low border border-outline-variant/30 p-4 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary focus:bg-surface-container transition-all placeholder:text-outline-variant" />
        </div>
        
        <div>
          <label className="font-label text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe tu receta..." className="w-full bg-surface-container-low border border-outline-variant/30 p-4 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary focus:bg-surface-container transition-all placeholder:text-outline-variant" rows={3} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="font-label text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">Prep.</label>
            <input type="text" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="15M" className="w-full bg-surface-container-low border border-outline-variant/30 p-4 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary focus:bg-surface-container transition-all placeholder:text-outline-variant" />
          </div>
          <div>
            <label className="font-label text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">Cocción</label>
            <input type="text" value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="15M" className="w-full bg-surface-container-low border border-outline-variant/30 p-4 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary focus:bg-surface-container transition-all placeholder:text-outline-variant" />
          </div>
          <div>
            <label className="font-label text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-2 block">Dificultad</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'Fácil' | 'Medio' | 'Difícil')} className="w-full bg-surface-container-low border border-outline-variant/30 p-4 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary focus:bg-surface-container transition-all">
              <option value="Fácil">Fácil</option>
              <option value="Medio">Medio</option>
              <option value="Difícil">Difícil</option>
            </select>
          </div>
        </div>
      </section>

      {/* Auto-Calculated Macros */}
      <section className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
        <h3 className="font-headline text-sm font-bold tracking-widest uppercase text-tertiary mb-3">Macros Calculados</h3>
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="bg-surface-container-highest p-3 rounded-sm text-center">
            <span className="block text-[10px] font-label tracking-widest uppercase text-on-surface-variant mb-1">Cal</span>
            <span className="font-headline font-bold text-lg text-tertiary">{totals.macros.calories}</span>
          </div>
          <div className="bg-surface-container-highest p-3 rounded-sm text-center">
            <span className="block text-[10px] font-label tracking-widest uppercase text-on-surface-variant mb-1">Pro</span>
            <span className="font-headline font-bold text-lg text-primary">{totals.macros.protein}g</span>
          </div>
          <div className="bg-surface-container-highest p-3 rounded-sm text-center">
            <span className="block text-[10px] font-label tracking-widest uppercase text-on-surface-variant mb-1">Carb</span>
            <span className="font-headline font-bold text-lg text-brand-secondary">{totals.macros.carbs}g</span>
          </div>
          <div className="bg-surface-container-highest p-3 rounded-sm text-center">
            <span className="block text-[10px] font-label tracking-widest uppercase text-on-surface-variant mb-1">Gra</span>
            <span className="font-headline font-bold text-lg text-error">{totals.macros.fats}g</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface-container-highest p-3 rounded-sm text-center">
            <span className="block text-[10px] font-label tracking-widest uppercase text-on-surface-variant mb-1">Grasa Sat.</span>
            <span className="font-headline font-bold text-md text-tertiary">{totals.macros.saturatedFat}g</span>
          </div>
          <div className="bg-surface-container-highest p-3 rounded-sm text-center">
            <span className="block text-[10px] font-label tracking-widest uppercase text-on-surface-variant mb-1">Grasa Trans</span>
            <span className="font-headline font-bold text-md text-tertiary">{totals.macros.transFat}g</span>
          </div>
          <div className="bg-surface-container-highest p-3 rounded-sm text-center">
            <span className="block text-[10px] font-label tracking-widest uppercase text-on-surface-variant mb-1">Azúcar</span>
            <span className="font-headline font-bold text-md text-tertiary">{totals.macros.sugar}g</span>
          </div>
        </div>
      </section>

      {/* Detailed Micronutrients */}
      <section className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
        <h3 className="font-headline text-sm font-bold tracking-widest uppercase text-tertiary mb-3">Micronutrientes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-label text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-2">Vitaminas</h4>
            <div className="space-y-1">
              {Object.entries(totals.micros.vitamins).map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="capitalize text-tertiary">{key}</span>
                  <span className="font-bold text-tertiary">{Math.round(val as number)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-label text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-2">Minerales</h4>
            <div className="space-y-1">
              {Object.entries(totals.micros.minerals).map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="capitalize text-tertiary">{key}</span>
                  <span className="font-bold text-tertiary">{Math.round(val as number)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-label text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-2">Otros</h4>
            <div className="space-y-1">
              {Object.entries(totals.micros.others).map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="capitalize text-tertiary">{key}</span>
                  <span className="font-bold text-tertiary">{Math.round(val as number)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Supplements */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary">Suplementos</h3>
        </div>
        <div className="space-y-3">
          {supplements.map((sup, idx) => (
            <input 
              key={idx}
              value={sup}
              onChange={(e) => updateSupplement(idx, e.target.value)}
              placeholder={`Suplemento ${idx + 1}...`} 
              className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant"
            />
          ))}
          <button onClick={addSupplement} className="w-full border-2 border-dashed border-outline-variant/30 p-3 rounded-sm flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors font-label text-xs font-bold tracking-widest uppercase mt-2">
            <Plus className="w-4 h-4" /> Añadir Suplemento
          </button>
        </div>
      </section>

      {/* Ingredients Builder */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary">Ingredientes</h3>
        </div>
        
        <div className="space-y-3 mb-4">
          {recipeIngredients.map((ri) => {
            const ing = dictionary.find(i => i.id === ri.ingredientId);
            return (
              <div key={ri.id} className="flex items-center gap-3 bg-surface-container-low border border-outline-variant/30 p-3 rounded-sm">
                <div className="flex-1">
                  <h4 className="font-headline font-bold text-sm text-tertiary">{ing?.name}</h4>
                  <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                    {Math.round((ing?.macros.calories || 0) * (ri.amount / (ing?.baseAmount || 1)))} kcal
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={ri.amount} 
                    onChange={(e) => updateRecipeIngredientAmount(ri.id, e.target.value)} 
                    className="w-20 bg-surface-container-highest border border-outline-variant/30 p-2 font-headline text-sm text-center text-tertiary rounded-sm focus:outline-none focus:border-primary transition-colors" 
                  />
                  <span className="text-xs font-label uppercase text-on-surface-variant w-6">{ri.unit}</span>
                  <button onClick={() => removeRecipeIngredient(ri.id)} className="p-2 text-error hover:bg-error/10 rounded-sm transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Ingredient Search */}
        <div className="relative">
          {isSearching ? (
            <div className="bg-surface-container-highest border border-outline-variant/50 rounded-sm p-2">
              <div className="flex items-center gap-2 px-2 border-b border-outline-variant/20 pb-2 mb-2">
                <Search className="w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text" 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en la base de datos..." 
                  className="flex-1 bg-transparent border-none text-sm font-body text-tertiary focus:outline-none placeholder:text-on-surface-variant"
                />
                <button onClick={() => setIsSearching(false)} className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-tertiary">Cancelar</button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredDictionary.map(ing => (
                  <button 
                    key={ing.id}
                    onClick={() => handleAddIngredient(ing)}
                    className="w-full text-left px-3 py-2 hover:bg-surface-container transition-colors flex justify-between items-center rounded-sm"
                  >
                    <div>
                      <span className="block font-headline font-bold text-sm text-tertiary">{ing.name}</span>
                      <span className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{ing.macros.calories} kcal / {ing.baseAmount}{ing.baseUnit}</span>
                    </div>
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                ))}
                {filteredDictionary.length === 0 && (
                  <div className="p-4 text-center text-sm text-on-surface-variant font-body">No se encontraron ingredientes.</div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={() => setIsSearching(true)} className="w-full border-2 border-dashed border-outline-variant/30 p-3 rounded-sm flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors font-label text-xs font-bold tracking-widest uppercase">
              <Plus className="w-4 h-4" /> Añadir Ingrediente de la Base de Datos
            </button>
          )}
        </div>
      </section>

      {/* Instructions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary">Instrucciones</h3>
        </div>
        <div className="space-y-3">
          {instructions.map((inst, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest text-primary font-headline font-bold flex items-center justify-center shrink-0 mt-1">
                {idx + 1}
              </div>
              <textarea 
                value={inst}
                onChange={(e) => updateInstruction(idx, e.target.value)}
                placeholder={`Descripción del paso ${idx + 1}...`} 
                className="flex-1 bg-surface-container-low border border-outline-variant/30 p-3 font-body text-sm text-tertiary rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-outline-variant min-h-[80px] resize-none"
              />
            </div>
          ))}
          <button onClick={addInstruction} className="w-full border-2 border-dashed border-outline-variant/30 p-3 rounded-sm flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors font-label text-xs font-bold tracking-widest uppercase mt-2">
            <Plus className="w-4 h-4" /> Añadir Paso
          </button>
        </div>
      </section>
    </div>
  );
}
