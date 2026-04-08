import { ArrowLeft, Clock, Flame, Droplet, Activity, CheckCircle2, Circle, Minus, Plus, MessageSquare, Bookmark, Search, X, Users, ShoppingCart } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Micronutrients } from '../types';
import { toast } from 'sonner';
import { getFoodQuality, FOOD_QUALITY_EMOJI } from '../utils/nutrition';
import { useI18n } from '../i18n';

export default function RecipeDetail({ recipe, onBack, onSaveRecipe, isSaved, onAddToPlan, onLogMealNow, onAddToShoppingList, dictionary = [], userProfile }: { recipe: any, onBack: () => void, onSaveRecipe?: (r: any) => void, isSaved?: boolean, onAddToPlan?: (recipe: any, dayIndex: number) => void, onLogMealNow?: (recipe: any, servings: number) => void, onAddToShoppingList?: (items: any[]) => void, dictionary?: any[], userProfile?: any }) {
  const { t } = useI18n();
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [servings, setServings] = useState(1);
  const [selectedFamily, setSelectedFamily] = useState<string[]>([]);
  
  const familyMembers = userProfile?.family || [];

  const toggleFamilyMember = (id: string) => {
    setSelectedFamily(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const totalDiners = 1 + selectedFamily.length; // User + selected family members
  const scaleFactor = totalDiners / (recipe?.servings || 1);
  const [showDaySelector, setShowDaySelector] = useState(false);
  
  // Extra ingredients state
  const [extraIngredients, setExtraIngredients] = useState<any[]>([]);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback data if no recipe is passed
  const data = recipe || {
    title: 'Electric Salmon Bowl',
    description: 'A delicious and healthy salmon bowl.',
    prepTime: '10M',
    cookTime: '20M',
    difficulty: 'Fácil',
    macros: { calories: 740, protein: 52, carbs: 45, fats: 20 },
    micros: { vitamins: {}, minerals: {}, others: {} },
    img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80',
    tag: 'HIGH PROTEIN'
  };

  const baseIngredients = [
    { name: 'Wild-caught Salmon', amount: 6, unit: 'oz' },
    { name: 'Quinoa (dry)', amount: 0.5, unit: 'cup' },
    { name: 'Edamame, shelled', amount: 1, unit: 'cup' },
    { name: 'Avocado, sliced', amount: 0.5, unit: 'ea' },
    { name: 'Soy Sauce (Low Sodium)', amount: 2, unit: 'tbsp' },
    { name: 'Sesame Oil', amount: 1, unit: 'tbsp' },
    { name: 'Sriracha', amount: 1, unit: 'tsp' },
    { name: 'Sesame seeds for garnish', amount: 0, unit: '' }
  ];

  const instructions = recipe?.instructions || [
    'Rinse quinoa and cook according to package instructions.',
    'Preheat oven to 400°F (200°C). Season salmon with salt, pepper, and a drizzle of sesame oil.',
    'Bake salmon for 12-15 minutes until flaky.',
    'Whisk soy sauce, remaining sesame oil, and sriracha in a small bowl to create the dressing.',
    'Assemble the bowl: base of quinoa, topped with salmon, edamame, and avocado.',
    'Drizzle with dressing and garnish with sesame seeds.'
  ];

  const calculatedTotals = useMemo(() => {
    let cal = data.macros?.calories || 0;
    let pro = data.macros?.protein || 0;
    let carbs = data.macros?.carbs || 0;
    let fats = data.macros?.fats || 0;
    let micros = data.micros || { vitamins: {}, minerals: {}, others: {} };

    let extraCal = 0, extraPro = 0, extraCarbs = 0, extraFats = 0;
    let extraMicros: Micronutrients = { vitamins: {}, minerals: {}, others: {} };

    extraIngredients.forEach(ri => {
      const ing = dictionary.find(d => d.id === ri.ingredientId);
      if (ing) {
        const ratio = ri.amount / ing.baseAmount;
        extraCal += ing.macros.calories * ratio;
        extraPro += ing.macros.protein * ratio;
        extraCarbs += ing.macros.carbs * ratio;
        extraFats += ing.macros.fats * ratio;

        if (ing.micros) {
          Object.entries(ing.micros.vitamins).forEach(([key, value]) => {
            extraMicros.vitamins[key as keyof typeof extraMicros.vitamins] = ((extraMicros.vitamins[key as keyof typeof extraMicros.vitamins] || 0) + (value as number) * ratio);
          });
          Object.entries(ing.micros.minerals).forEach(([key, value]) => {
            extraMicros.minerals[key as keyof typeof extraMicros.minerals] = ((extraMicros.minerals[key as keyof typeof extraMicros.minerals] || 0) + (value as number) * ratio);
          });
          Object.entries(ing.micros.others).forEach(([key, value]) => {
            extraMicros.others[key as keyof typeof extraMicros.others] = ((extraMicros.others[key as keyof typeof extraMicros.others] || 0) + (value as number) * ratio);
          });
        }
      }
    });

    const combinedMicros: Micronutrients = {
      vitamins: { ...micros.vitamins },
      minerals: { ...micros.minerals },
      others: { ...micros.others }
    };
    
    Object.entries(extraMicros.vitamins).forEach(([key, value]) => {
      combinedMicros.vitamins[key as keyof typeof combinedMicros.vitamins] = ((combinedMicros.vitamins[key as keyof typeof combinedMicros.vitamins] || 0) + (value as number));
    });
    Object.entries(extraMicros.minerals).forEach(([key, value]) => {
      combinedMicros.minerals[key as keyof typeof combinedMicros.minerals] = ((combinedMicros.minerals[key as keyof typeof combinedMicros.minerals] || 0) + (value as number));
    });
    Object.entries(extraMicros.others).forEach(([key, value]) => {
      combinedMicros.others[key as keyof typeof combinedMicros.others] = ((combinedMicros.others[key as keyof typeof combinedMicros.others] || 0) + (value as number));
    });

    return {
      cal: Math.round(cal + extraCal),
      pro: Math.round(pro + extraPro),
      carbs: Math.round(carbs + extraCarbs),
      fats: Math.round(fats + extraFats),
      micros: combinedMicros
    };
  }, [data, extraIngredients, dictionary]);

  const allIngredientsToDisplay = [
    ...(data.recipeIngredients ? data.recipeIngredients.map((ri: any) => ({
      id: ri.id,
      name: ri.ingredient?.name || 'Unknown',
      amount: ri.amount,
      unit: ri.unit,
      isExtra: false
    })) : (data.ingredients ? data.ingredients.map((ing: string, idx: number) => ({
      id: `old-${idx}`,
      name: ing,
      amount: 0,
      unit: '',
      isExtra: false
    })) : baseIngredients.map((ing, idx) => ({
      id: `base-${idx}`,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      isExtra: false
    })))),
    ...extraIngredients.map(ri => ({
      id: ri.id,
      name: ri.ingredient?.name || 'Unknown',
      amount: ri.amount,
      unit: ri.unit,
      isExtra: true
    }))
  ];

  const toggleIngredient = (id: string) => {
    if (checkedIngredients.includes(id)) {
      setCheckedIngredients(checkedIngredients.filter(i => i !== id));
    } else {
      setCheckedIngredients([...checkedIngredients, id]);
    }
  };

  const formatAmount = (amount: number) => {
    if (!amount || amount === 0) return '';
    const total = amount * servings * scaleFactor;
    return total % 1 === 0 ? total : total.toFixed(1);
  };

  const filteredDictionary = dictionary.filter(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const addExtraIngredient = (ing: any) => {
    setExtraIngredients(prev => [...prev, {
      id: `extra-${Date.now()}`,
      ingredientId: ing.id,
      amount: ing.baseAmount,
      unit: ing.baseUnit,
      ingredient: ing
    }]);
    setSearchQuery('');
    setIsAddingIngredient(false);
  };

  const updateExtraIngredientAmount = (id: string, amount: string) => {
    setExtraIngredients(prev => prev.map(ri => ri.id === id ? { ...ri, amount: Number(amount) || 0 } : ri));
  };

  const removeExtraIngredient = (id: string) => {
    setExtraIngredients(prev => prev.filter(ri => ri.id !== id));
  };

  const getModifiedRecipe = () => {
    return {
      ...data,
      cal: calculatedTotals.cal,
      pro: calculatedTotals.pro,
      carbs: calculatedTotals.carbs,
      fats: calculatedTotals.fats,
      micros: calculatedTotals.micros,
      recipeIngredients: [
        ...(data.recipeIngredients || []),
        ...extraIngredients
      ]
    };
  };

  const handleAddToShoppingList = () => {
    if (!onAddToShoppingList) return;
    
    const itemsToAdd = allIngredientsToDisplay
      .filter(ing => !checkedIngredients.includes(ing.id))
      .map(ing => ({
        id: Date.now() + Math.random(),
        name: `${ing.name} ${ing.amount ? `(${formatAmount(ing.amount)} ${ing.unit})` : ''}`.trim(),
        category: 'Otros', // Default category, could be improved with dictionary
        checked: false
      }));

    if (itemsToAdd.length > 0) {
      onAddToShoppingList(itemsToAdd);
      toast.success(`${itemsToAdd.length} ingredientes añadidos a la lista`);
    } else {
      toast.info('Todos los ingredientes ya están marcados');
    }
  };

  return (
    <div className="pb-8">
      {/* Header Image & Back Button */}
      <div className="relative h-64 md:h-80 w-full">
        <img src={data.img} alt={data.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-tertiary hover:bg-primary hover:text-on-primary transition-colors z-10"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button 
          onClick={() => onSaveRecipe && onSaveRecipe(getModifiedRecipe())}
          className="absolute top-4 right-4 w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-tertiary hover:bg-primary hover:text-on-primary transition-colors z-10"
          aria-label={isSaved ? "Quitar de Bóveda" : "Guardar en Bóveda"}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
        </button>

        <div className="absolute bottom-4 left-6 right-6">
          <span className="bg-primary text-on-primary text-xs font-black px-2 py-1 tracking-widest uppercase rounded-sm mb-3 inline-block">
            {data.tag}
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary leading-tight">
            {data.title}
          </h2>
          <div className="flex items-center gap-4 mt-2 text-on-surface-variant text-xs font-label uppercase tracking-widest">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {data.prepTime} Prep / {data.cookTime} Cocción</span>
            <span>•</span>
            <span>{data.difficulty}</span>
          </div>
        </div>
      </div>

      <div className="px-6 max-w-4xl mx-auto space-y-8 mt-6">
        <p className="text-sm font-body text-on-surface-variant leading-relaxed">{data.description}</p>
        
        {/* Dynamic Macros */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 flex flex-col items-center justify-center text-center">
            <Flame className="w-6 h-6 text-primary mb-2" />
            <span className="font-headline text-2xl font-bold text-tertiary">{Math.round(calculatedTotals.cal * servings * scaleFactor)}</span>
            <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-1">Kcal</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 flex flex-col items-center justify-center text-center">
            <Activity className="w-6 h-6 text-primary mb-2" />
            <span className="font-headline text-2xl font-bold text-tertiary">{Math.round(calculatedTotals.pro * servings * scaleFactor)}g</span>
            <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-1">Protein</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 flex flex-col items-center justify-center text-center">
            <Droplet className="w-6 h-6 text-secondary mb-2" />
            <span className="font-headline text-2xl font-bold text-tertiary">{Math.round(calculatedTotals.carbs * servings * scaleFactor)}g</span>
            <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-1">Carbs</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 flex flex-col items-center justify-center text-center">
            <span className="font-headline text-2xl font-bold text-tertiary">{Math.round(calculatedTotals.fats * servings * scaleFactor)}g</span>
            <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-1">Fats</span>
          </div>
        </div>

        {/* Food Quality Badge */}
        {data.macros && (() => {
          const quality = getFoodQuality(data.macros, data.micros?.others?.fiber);
          return (
            <div className={`flex items-center gap-3 p-3 rounded-sm border ${
              quality === 'good' ? 'bg-green-500/10 border-green-500/20' : quality === 'neutral' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'
            }`}>
              <span className="text-2xl">{FOOD_QUALITY_EMOJI[quality]}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t.recipes.foodQuality[quality]}</span>
            </div>
          );
        })()}

        {/* Detailed Nutrition */}
        <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/20">
          <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary mb-4">Información Nutricional</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex justify-between border-b border-outline-variant/20 py-1"><span>Grasas Saturadas</span><span className="font-bold">{Math.round((data.macros?.saturatedFat || 0) * servings * scaleFactor)}g</span></div>
            <div className="flex justify-between border-b border-outline-variant/20 py-1"><span>Grasas Trans</span><span className="font-bold">{Math.round((data.macros?.transFat || 0) * servings * scaleFactor)}g</span></div>
            <div className="flex justify-between border-b border-outline-variant/20 py-1"><span>Azúcar</span><span className="font-bold">{Math.round((data.macros?.sugar || 0) * servings * scaleFactor)}g</span></div>
            <div className="flex justify-between border-b border-outline-variant/20 py-1"><span>Fibra</span><span className="font-bold">{Math.round((data.micros?.others?.fiber || 0) * servings * scaleFactor)}g</span></div>
            <div className="flex justify-between border-b border-outline-variant/20 py-1"><span>Colesterol</span><span className="font-bold">{Math.round((data.micros?.others?.cholesterol || 0) * servings * scaleFactor)}mg</span></div>
            <div className="flex justify-between border-b border-outline-variant/20 py-1"><span>Sodio</span><span className="font-bold">{Math.round((data.micros?.minerals?.sodium || 0) * servings * scaleFactor)}mg</span></div>
          </div>
        </div>

        {/* Micronutrients */}
        {(Object.keys(calculatedTotals.micros.vitamins).length > 0 || Object.keys(calculatedTotals.micros.minerals).length > 0 || Object.keys(calculatedTotals.micros.others).length > 0) && (
          <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
            <h4 className="font-headline text-sm font-bold tracking-tight uppercase text-tertiary mb-3">Micronutrientes (por porción)</h4>
            
            {Object.keys(calculatedTotals.micros.vitamins).length > 0 && (
                <div className="mb-3">
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Vitaminas</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(calculatedTotals.micros.vitamins).map(([key, value]) => (
                            <div key={key} className="bg-surface-container-highest px-2 py-1 rounded-sm flex items-center gap-2">
                                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{key}</span>
                                <span className="font-mono text-xs text-tertiary">{Math.round((value as number) * servings * scaleFactor)}mcg</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {Object.keys(calculatedTotals.micros.minerals).length > 0 && (
                <div className="mb-3">
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Minerales</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(calculatedTotals.micros.minerals).map(([key, value]) => (
                            <div key={key} className="bg-surface-container-highest px-2 py-1 rounded-sm flex items-center gap-2">
                                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{key}</span>
                                <span className="font-mono text-xs text-tertiary">{Math.round((value as number) * servings * scaleFactor)}mg</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {Object.keys(calculatedTotals.micros.others).length > 0 && (
                <div>
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Otros</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(calculatedTotals.micros.others).map(([key, value]) => (
                            <div key={key} className="bg-surface-container-highest px-2 py-1 rounded-sm flex items-center gap-2">
                                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{key}</span>
                                <span className="font-mono text-xs text-tertiary">{Math.round((value as number) * servings * scaleFactor)}g</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}

        {/* Real Match Score Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-sm p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <p className="font-headline text-lg font-bold text-tertiary uppercase">Puntuación de Coincidencia</p>
              </div>
              <span className="text-primary font-headline text-3xl font-bold">92%</span>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
              Esta receta tiene una <span className="font-bold text-tertiary">coincidencia del 92%</span> con tu objetivo de <span className="text-primary font-bold">Máximo Rendimiento</span>. 
              Se alinea perfectamente con tu ventana de proteínas objetivo y tu inventario actual de <span className="italic">Salmón Salvaje</span>.
            </p>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[92%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
            </div>
          </div>
        </div>

        {/* Smart Swapper Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-xl font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Sustituto Inteligente
            </h3>
            <span className="text-primary text-[10px] font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-sm">IA Activa</span>
          </div>
          
          <div className="space-y-4">
            <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-sm bg-surface-container-highest overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80" alt="Quinoa" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  <p className="text-primary text-[10px] font-bold tracking-widest uppercase">Coincidencia de Inventario</p>
                </div>
                <p className="text-tertiary font-headline font-bold text-sm leading-tight">Quinoa por Arroz Blanco</p>
                <p className="text-on-surface-variant text-[10px] mt-1">
                  +4g Fibra • Coincide con objetivo de peso • En stock (2.4kg)
                </p>
              </div>
              <button className="bg-primary/10 hover:bg-primary text-primary hover:text-on-primary px-3 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all">
                Sustituir
              </button>
            </div>

            <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-sm bg-surface-container-highest overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1524179524541-1aa169b6a63f?auto=format&fit=crop&w=200&q=80" alt="Kale" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="w-3 h-3 text-secondary" />
                  <p className="text-secondary text-[10px] font-bold tracking-widest uppercase">Impulso de Objetivo</p>
                </div>
                <p className="text-tertiary font-headline font-bold text-sm leading-tight">Kale por Lechuga Iceberg</p>
                <p className="text-on-surface-variant text-[10px] mt-1">
                  3x Vitamina K • Más Antioxidantes • Usar hoy
                </p>
              </div>
              <button className="bg-secondary/10 hover:bg-secondary text-secondary hover:text-on-secondary px-3 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all">
                Sustituir
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-sm border border-dashed border-outline-variant/40 bg-surface-container-highest/30">
            <p className="text-on-surface-variant text-xs italic text-center">
              Aplicar estas sustituciones aumentará tu puntuación al <span className="text-primary font-bold">98%</span>.
            </p>
          </div>
        </section>

        {/* Serving Multiplier */}
        <div className="flex items-center justify-between bg-surface-container-highest/50 p-4 rounded-sm border border-outline-variant/10">
          <span className="font-headline font-bold text-sm uppercase text-tertiary tracking-tight">Multiplicador de Porciones</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20"
              aria-label="Disminuir porciones"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-headline font-bold text-xl text-tertiary w-4 text-center" aria-live="polite">{servings}</span>
            <button 
              onClick={() => setServings(servings + 1)}
              className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20"
              aria-label="Aumentar porciones"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Family Scaling Section */}
        {familyMembers.length > 0 && (
          <div className="mb-8 p-4 bg-surface-container-low rounded-sm border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-label text-[10px] font-bold tracking-widest uppercase text-tertiary">Escalado de Porciones Familiares</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1.5 rounded-sm font-label text-[10px] font-bold tracking-widest uppercase border transition-all ${
                  selectedFamily.length === 0 
                    ? 'bg-primary text-on-primary border-primary' 
                    : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'
                }`}
                onClick={() => setSelectedFamily([])}
                aria-pressed={selectedFamily.length === 0}
              >
                Solo Yo
              </button>
              {familyMembers.map((member: any) => (
                <button 
                  key={member.id}
                  className={`px-3 py-1.5 rounded-sm font-label text-[10px] font-bold tracking-widest uppercase border transition-all ${
                    selectedFamily.includes(member.id) 
                      ? 'bg-primary text-on-primary border-primary' 
                      : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20'
                  }`}
                  onClick={() => toggleFamilyMember(member.id)}
                  aria-pressed={selectedFamily.includes(member.id)}
                >
                  + {member.name}
                </button>
              ))}
            </div>
            <p className="mt-3 font-label text-[9px] text-on-surface-variant uppercase tracking-wider">
              Escalando para {totalDiners} {totalDiners === 1 ? 'persona' : 'personas'}
            </p>
          </div>
        )}

        {/* Ingredients */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-xl font-bold tracking-tight uppercase text-tertiary">Ingredientes</h3>
            <div className="flex gap-2">
              {onAddToShoppingList && (
                <button 
                  onClick={handleAddToShoppingList}
                  className="text-tertiary text-sm font-bold uppercase tracking-widest hover:text-primary flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/20 transition-colors"
                  aria-label="Añadir ingredientes faltantes a la lista de compras"
                >
                  <ShoppingCart className="w-4 h-4" /> Añadir a Lista
                </button>
              )}
              <button 
                onClick={() => setIsAddingIngredient(!isAddingIngredient)}
                className="text-primary text-sm font-bold uppercase tracking-widest hover:text-primary-container flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/20 transition-colors"
                aria-label="Añadir ingrediente extra"
                aria-expanded={isAddingIngredient}
              >
                <Plus className="w-4 h-4" /> Extra
              </button>
            </div>
          </div>

          {isAddingIngredient && (
            <div className="mb-4 bg-surface-container-highest p-4 rounded-sm border border-outline-variant/20">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="text"
                  placeholder="Buscar ingredientes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 pl-10 pr-4 text-tertiary placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              {searchQuery && (
                <div className="max-h-48 overflow-y-auto space-y-1 bg-surface-container-low p-2 rounded-sm border border-outline-variant/10">
                  {filteredDictionary.length > 0 ? (
                    filteredDictionary.map(ing => (
                      <button
                        key={ing.id}
                        onClick={() => addExtraIngredient(ing)}
                        className="w-full text-left px-3 py-2 rounded-sm hover:bg-surface-container-highest flex justify-between items-center group"
                      >
                        <span className="text-sm text-tertiary font-medium">{ing.name}</span>
                        <span className="text-xs text-on-surface-variant group-hover:text-primary transition-colors">
                          + Añadir ({ing.baseAmount}{ing.baseUnit})
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-on-surface-variant text-center py-2">No se encontraron ingredientes.</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {allIngredientsToDisplay.map((ing) => (
              <div key={ing.id} className="flex items-center gap-2">
                <button 
                  onClick={() => toggleIngredient(ing.id)}
                  className="flex-1 flex items-center gap-4 p-3 bg-surface-container-low rounded-sm border border-outline-variant/10 hover:border-primary/30 transition-colors text-left group"
                >
                  {checkedIngredients.includes(ing.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-on-surface-variant shrink-0 group-hover:text-primary/50 transition-colors" />
                  )}
                  <span className={`text-sm flex-1 ${checkedIngredients.includes(ing.id) ? 'text-on-surface-variant line-through' : 'text-tertiary'}`}>
                    {ing.isExtra ? (
                      <span className="text-primary font-bold mr-2">[EXTRA]</span>
                    ) : null}
                    {ing.amount === 0 ? '' : formatAmount(ing.amount)} {ing.unit} {ing.name}
                  </span>
                </button>
                
                {ing.isExtra && (
                  <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-sm border border-outline-variant/10">
                    <input
                      type="number"
                      value={ing.amount}
                      onChange={(e) => updateExtraIngredientAmount(ing.id, e.target.value)}
                      className="w-16 bg-surface-container-highest border-none rounded-sm py-1 px-2 text-sm text-tertiary text-center focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-xs text-on-surface-variant">{ing.unit}</span>
                    <button 
                      onClick={() => removeExtraIngredient(ing.id)}
                      className="p-1 text-outline hover:text-error transition-colors"
                      aria-label={`Remove ${ing.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <section>
          <h3 className="font-headline text-xl font-bold tracking-tight uppercase text-tertiary mb-4">Instrucciones</h3>
          <div className="space-y-4">
            {instructions.map((step: string, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest text-primary font-headline font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <p className="text-sm text-on-surface pt-1 leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Community Notes */}
        <section className="border-t border-outline-variant/20 pt-8">
          <h3 className="font-headline text-xl font-bold tracking-tight uppercase text-tertiary mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Notas de la Comunidad
          </h3>
          <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-2">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
              <span className="font-headline font-bold text-xs uppercase text-tertiary">Sarah J.</span>
              <span className="font-label text-[10px] text-on-surface-variant tracking-widest uppercase">Colaborador Principal</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              "Si preparas esto para la semana, mantén el aderezo separado hasta que vayas a comer. De lo contrario, la quinoa lo absorbe y se ablanda."
            </p>
          </div>
        </section>

        {/* Action Button */}
        {showDaySelector ? (
          <div className="mt-8 bg-surface-container-low p-6 rounded-sm border border-outline-variant/20 shadow-xl">
            <p className="font-label text-xs tracking-widest text-on-surface-variant uppercase mb-4 text-center">Seleccionar Día para Planificar</p>
            <div className="flex justify-between gap-2 mb-6">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (onAddToPlan) onAddToPlan(getModifiedRecipe(), idx);
                    setShowDaySelector(false);
                  }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-sm bg-surface-container-highest text-tertiary font-headline font-bold hover:bg-primary hover:text-on-primary transition-colors"
                >
                  {day}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowDaySelector(false)}
              className="w-full py-2 text-on-surface-variant font-label text-xs tracking-widest uppercase hover:text-tertiary"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => {
                if (onLogMealNow) onLogMealNow(getModifiedRecipe(), servings);
              }}
              className="flex-1 bg-primary text-on-primary py-4 rounded-sm font-headline font-bold text-lg uppercase tracking-widest hover:bg-primary-container transition-colors"
            >
              Registrar Comida Ahora
            </button>
            <button 
              onClick={() => setShowDaySelector(true)}
              className="flex-1 bg-surface-container-highest text-tertiary border border-outline-variant/20 py-4 rounded-sm font-headline font-bold text-lg uppercase tracking-widest hover:bg-surface-container-low transition-colors"
            >
              Añadir al Planificador
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

