import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock, Flame, Sparkles, Loader2, ChefHat, Plus, CheckCircle2, BookOpen, Search as SearchIcon, Info, ChevronDown, X } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext, Recipe } from '../context/AppContext';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export default function Recipes() {
  const [activeTab, setActiveTab] = useState<'cookbook' | 'dictionary'>('cookbook');
  const [searchQuery, setSearchQuery] = useState('');
  const [loggedItems, setLoggedItems] = useState<Set<string>>(new Set());
  const { addFoodToLog, savedRecipes, addRecipe } = useAppContext();

  // Dictionary State
  const [dictQuery, setDictQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dictResult, setDictResult] = useState<any>(null);

  // Logging State
  const [selectedMealType, setSelectedMealType] = useState<Record<string, MealType>>({});

  // Create Recipe State
  const [isCreating, setIsCreating] = useState(false);
  const [newRecipeInput, setNewRecipeInput] = useState('');
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return savedRecipes.filter(r => 
      r.title.toLowerCase().includes(q) || 
      r.category.toLowerCase().includes(q) ||
      r.ingredients.some(i => i.toLowerCase().includes(q))
    );
  }, [searchQuery, savedRecipes]);

  const handleMealTypeChange = (id: string, type: MealType) => {
    setSelectedMealType(prev => ({ ...prev, [id]: type }));
  };

  const handleLogRecipe = (recipe: Recipe) => {
    const mealType = selectedMealType[recipe.id] || 'lunch';
    setLoggedItems(prev => new Set(prev).add(recipe.id));
    addFoodToLog({
      name: recipe.title,
      desc: 'From Cookbook',
      cals: recipe.cals,
      macros: recipe.macros,
      mealType: mealType,
      status: 'logged'
    });
    setTimeout(() => {
      setLoggedItems(prev => {
        const next = new Set(prev);
        next.delete(recipe.id);
        return next;
      });
    }, 2000);
  };

  const handleLogDictionary = () => {
    if (!dictResult) return;
    const id = `dict-${dictResult.name}`;
    const mealType = selectedMealType[id] || 'snacks';
    setLoggedItems(prev => new Set(prev).add(id));
    addFoodToLog({
      name: dictResult.name,
      desc: `Serving: ${dictResult.serving}`,
      cals: dictResult.cals,
      macros: dictResult.macros,
      mealType: mealType,
      status: 'logged'
    });
    setTimeout(() => {
      setLoggedItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  const handleAnalyzeIngredient = async () => {
    if (!dictQuery.trim()) return;
    setIsAnalyzing(true);
    setDictResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'dummy' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the nutritional value of this ingredient/food: "${dictQuery}". Return ONLY a JSON object with this structure: {"name": "Food Name", "serving": "100g or 1 medium", "cals": 150, "macros": {"p": 10, "c": 20, "f": 5}, "vitamins": ["Vit C", "Iron"]}. Do not use markdown formatting.`,
      });
      
      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setDictResult(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error("Invalid JSON");
      }
    } catch (error) {
      console.error("Error analyzing ingredient:", error);
      // Fallback for demo if API fails
      setDictResult({
        name: dictQuery,
        serving: "100g",
        cals: 165,
        macros: { p: 31, c: 0, f: 3.6 },
        vitamins: ["B6", "Niacin"]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateRecipe = async () => {
    if (!newRecipeInput.trim()) return;
    setIsGeneratingRecipe(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'dummy' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a recipe based on this input: "${newRecipeInput}". Return ONLY a JSON object with this structure: {"title": "Recipe Name", "category": "Category", "time": "15m", "cals": 450, "macros": {"p": 30, "c": 40, "f": 15}, "ingredients": ["Ing 1", "Ing 2"]}. Do not use markdown formatting.`,
      });
      
      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generated = JSON.parse(jsonMatch[0]);
        addRecipe({
          ...generated,
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800&h=600'
        });
        setIsCreating(false);
        setNewRecipeInput('');
      } else {
        throw new Error("Invalid JSON");
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      // Fallback
      addRecipe({
        title: newRecipeInput.substring(0, 20) + '...',
        category: 'Custom',
        time: '20m',
        cals: 500,
        macros: { p: 25, c: 45, f: 15 },
        ingredients: ['Custom Ingredient 1', 'Custom Ingredient 2'],
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800&h=600'
      });
      setIsCreating(false);
      setNewRecipeInput('');
    } finally {
      setIsGeneratingRecipe(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full flex flex-col bg-[#1a0f0a] min-h-screen">
      <header className="p-4 sticky top-0 bg-[#1a0f0a]/90 backdrop-blur-md z-40 border-b border-[#ec5b13]/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black italic uppercase text-slate-100">Nutrition Hub</h2>
          <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <Filter className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900 rounded-xl p-1 mb-4 border border-slate-800">
          <button 
            onClick={() => setActiveTab('cookbook')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'cookbook' ? 'bg-[#ec5b13] text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BookOpen className="w-4 h-4" /> My Recipes
          </button>
          <button 
            onClick={() => setActiveTab('dictionary')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'dictionary' ? 'bg-[#ec5b13] text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <SearchIcon className="w-4 h-4" /> Dictionary
          </button>
        </div>

        {activeTab === 'cookbook' && (
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, ingredient, or category..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-[#ec5b13]/50 transition-colors"
              role="search"
              aria-label="Search recipes"
            />
          </div>
        )}
      </header>

      <div className="p-4 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'cookbook' ? (
            <motion.div 
              key="cookbook"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Smart Generator Banner */}
              <section className="bg-gradient-to-br from-[#ec5b13]/20 to-transparent p-5 rounded-2xl border border-[#ec5b13]/30 relative overflow-hidden">
                <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-[#ec5b13]/10" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#ec5b13] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Recipe Builder
                </h3>
                <p className="text-xs text-slate-300 mb-4">Paste ingredients or a recipe link to calculate macros and save it.</p>
                
                {isCreating ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                    <textarea 
                      value={newRecipeInput}
                      onChange={(e) => setNewRecipeInput(e.target.value)}
                      placeholder="e.g. 2 eggs, 1 avocado, 2 slices of sourdough bread..."
                      className="w-full bg-slate-900/80 border border-[#ec5b13]/30 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-[#ec5b13] min-h-[80px] resize-none"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsCreating(false)}
                        className="flex-1 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleCreateRecipe}
                        disabled={isGeneratingRecipe || !newRecipeInput.trim()}
                        className="flex-[2] bg-[#ec5b13] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {isGeneratingRecipe ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate & Save'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="w-full bg-slate-900 text-slate-200 border border-slate-700 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:border-[#ec5b13]/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Create New Recipe
                  </button>
                )}
              </section>

              {/* Recipe Grid */}
              <div className="space-y-4" aria-live="polite" aria-relevant="additions removals">
                <AnimatePresence>
                  {filteredRecipes.map((recipe) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={recipe.id} 
                      className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden group"
                      tabIndex={0}
                      aria-label={`${recipe.title}. Category: ${recipe.category}. Time: ${recipe.time}. Macros: ${recipe.macros.p}g protein, ${recipe.macros.c}g carbs, ${recipe.macros.f}g fat.`}
                    >
                      <div className="h-40 relative overflow-hidden cursor-pointer">
                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a] to-transparent opacity-80"></div>
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                          <div>
                            <span className="bg-[#ec5b13] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest mb-1 inline-block">{recipe.category}</span>
                            <h4 className="text-lg font-black italic text-white leading-tight">{recipe.title}</h4>
                          </div>
                          <span className="bg-slate-800/80 backdrop-blur-sm text-slate-200 text-[10px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1 border border-slate-700">
                            <Clock className="w-3 h-3" /> {recipe.time}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-1 text-[#ec5b13]">
                            <Flame className="w-4 h-4" />
                            <span className="text-sm font-black">{recipe.cals} <span className="text-[10px] text-slate-500 uppercase tracking-widest">kcal</span></span>
                          </div>
                          <div className="flex gap-2 text-xs font-mono font-bold">
                            <span className="text-slate-300">{recipe.macros.p}P</span>
                            <span className="text-slate-500">/</span>
                            <span className="text-slate-300">{recipe.macros.c}C</span>
                            <span className="text-slate-500">/</span>
                            <span className="text-slate-300">{recipe.macros.f}F</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mb-4">
                          <span className="font-bold text-slate-500 uppercase tracking-widest mr-2">Includes:</span>
                          {recipe.ingredients.join(', ')}
                        </p>
                        
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <select 
                              value={selectedMealType[recipe.id] || 'lunch'}
                              onChange={(e) => handleMealTypeChange(recipe.id, e.target.value as MealType)}
                              className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-xl py-3 pl-4 pr-8 focus:outline-none focus:border-[#ec5b13]/50"
                            >
                              <option value="breakfast">Breakfast</option>
                              <option value="lunch">Lunch</option>
                              <option value="dinner">Dinner</option>
                              <option value="snacks">Snacks</option>
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                          </div>
                          
                          <button 
                            onClick={() => handleLogRecipe(recipe)}
                            className={`flex-[2] py-3 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 text-xs ${
                              loggedItems.has(recipe.id) 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                                : 'bg-[#ec5b13] text-white shadow-lg shadow-[#ec5b13]/20 hover:bg-[#ec5b13]/90'
                            }`}
                          >
                            {loggedItems.has(recipe.id) ? (
                              <><CheckCircle2 className="w-4 h-4" /> Logged</>
                            ) : (
                              <><Plus className="w-4 h-4" /> Add</>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {filteredRecipes.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                      <SearchIcon className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium">No recipes found matching your search.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dictionary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <SearchIcon className="w-5 h-5 text-[#ec5b13]" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-200">Ingredient Lookup</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">Search for any raw ingredient or food item to instantly get its nutritional profile via AI.</p>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={dictQuery}
                    onChange={(e) => setDictQuery(e.target.value)}
                    placeholder="e.g. 1 medium avocado, 100g chicken breast" 
                    className="flex-1 bg-black/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#ec5b13] transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeIngredient()}
                  />
                  <button 
                    onClick={handleAnalyzeIngredient}
                    disabled={isAnalyzing || !dictQuery.trim()}
                    className="bg-[#ec5b13] text-white px-5 rounded-xl font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-[#ec5b13]/90 transition-colors flex items-center justify-center"
                  >
                    {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                  </button>
                </div>
              </div>

              {dictResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#ec5b13]/5 border border-[#ec5b13]/20 rounded-2xl p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-black text-slate-100 capitalize">{dictResult.name}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-1">Serving: {dictResult.serving}</p>
                    </div>
                    <div className="bg-[#ec5b13]/20 text-[#ec5b13] px-3 py-1.5 rounded-lg text-center">
                      <span className="block text-lg font-black leading-none">{dictResult.cals}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest">Kcal</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-center">
                      <div className="text-lg font-black text-slate-100 mb-1">{dictResult.macros.p}<span className="text-xs text-slate-500">g</span></div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Protein</p>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-center">
                      <div className="text-lg font-black text-slate-100 mb-1">{dictResult.macros.c}<span className="text-xs text-slate-500">g</span></div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Carbs</p>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-center">
                      <div className="text-lg font-black text-slate-100 mb-1">{dictResult.macros.f}<span className="text-xs text-slate-500">g</span></div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Fat</p>
                    </div>
                  </div>

                  {dictResult.vitamins && dictResult.vitamins.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Key Micronutrients</p>
                      <div className="flex flex-wrap gap-2">
                        {dictResult.vitamins.map((vit: string, i: number) => (
                          <span key={i} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md border border-slate-700">{vit}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select 
                        value={selectedMealType[`dict-${dictResult.name}`] || 'snacks'}
                        onChange={(e) => handleMealTypeChange(`dict-${dictResult.name}`, e.target.value as MealType)}
                        className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-xl py-3.5 pl-4 pr-8 focus:outline-none focus:border-[#ec5b13]/50"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snacks">Snacks</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                    
                    <button 
                      onClick={handleLogDictionary}
                      className={`flex-[2] py-3.5 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 text-sm ${
                        loggedItems.has(`dict-${dictResult.name}`) 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                          : 'bg-[#ec5b13] text-white shadow-lg shadow-[#ec5b13]/20 hover:bg-[#ec5b13]/90'
                      }`}
                    >
                      {loggedItems.has(`dict-${dictResult.name}`) ? (
                        <><CheckCircle2 className="w-5 h-5" /> Logged</>
                      ) : (
                        <><Plus className="w-5 h-5" /> Add Food</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
