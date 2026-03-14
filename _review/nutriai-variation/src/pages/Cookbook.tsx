import React, { useState } from 'react';
import { Search, Plus, X, Loader2, Sparkles, Info, Edit2, Check, Book, Database, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const INITIAL_RECIPES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&q=80",
    time: "15M",
    category: "High Protein",
    title: "Blueberry Overnight Protein Oats",
    macros: { p: 25, c: 40, f: 8 },
    vitamins: ["Vitamin C", "Iron"],
    ingredients: ["1/2 cup rolled oats", "1 scoop vanilla protein powder", "1/2 cup almond milk", "1/4 cup blueberries", "1 tbsp chia seeds"]
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80",
    time: "20M",
    category: "Quick Dinners",
    title: "Spicy Sesame Chicken Stir Fry",
    macros: { p: 35, c: 15, f: 12 },
    vitamins: ["Vitamin B6", "Zinc"],
    ingredients: ["150g chicken breast", "1 cup broccoli", "1 tbsp soy sauce", "1 tsp sesame oil", "1 tsp chili flakes"]
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80",
    time: "45M",
    category: "Batch Prep",
    title: "Herby Turkey Meatballs",
    macros: { p: 28, c: 5, f: 10 },
    vitamins: ["B12", "Niacin"],
    ingredients: ["200g ground turkey", "1/4 cup parsley", "1/4 cup parmesan", "1 egg", "Garlic powder"]
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    time: "12M",
    category: "Quick Dinners",
    title: "Honey Glazed Air Fryer Salmon",
    macros: { p: 32, c: 8, f: 18 },
    vitamins: ["Omega-3", "Vitamin D"],
    ingredients: ["1 salmon fillet (150g)", "1 tbsp honey", "1 tsp soy sauce", "1/2 tsp garlic powder"]
  }
];

const CATEGORIES = ["All Recipes", "Batch Prep", "High Protein", "Quick Dinners", "Healthy Snacks"];

const COMMON_INGREDIENTS = [
  "Chicken Breast", "Salmon", "Eggs", "Tofu", "Beef", "Pork", "Turkey",
  "Broccoli", "Spinach", "Avocado", "Tomato", "Onion", "Garlic", "Bell Pepper", "Carrot",
  "Rice", "Quinoa", "Oats", "Pasta", "Sourdough Bread", "Sweet Potato", "Potato",
  "Olive Oil", "Butter", "Almond Milk", "Milk", "Cheese", "Yogurt",
  "Salt", "Black Pepper", "Soy Sauce", "Honey", "Maple Syrup", "Chia Seeds",
  "Protein Powder", "Peanut Butter", "Almonds", "Walnuts", "Lemon", "Lime"
];

export default function Cookbook() {
  const [activeTab, setActiveTab] = useState<"recipes" | "dictionary">("recipes");
  
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [activeCategory, setActiveCategory] = useState("All Recipes");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add/Edit Recipe State
  const [isAdding, setIsAdding] = useState(false);
  const [recipeInput, setRecipeInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedRecipe, setAnalyzedRecipe] = useState<any>(null);

  // Recipe Detail & Edit State
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  // Dictionary State
  const [dictSearch, setDictSearch] = useState("");
  const [dictResult, setDictResult] = useState<any>(null);
  const [isSearchingDict, setIsSearchingDict] = useState(false);

  // Autocomplete State
  const [newIngredient, setNewIngredient] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = activeCategory === "All Recipes" || recipe.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      recipe.title.toLowerCase().includes(searchLower) || 
      recipe.category.toLowerCase().includes(searchLower) ||
      (recipe.ingredients && recipe.ingredients.some((ing: string) => ing.toLowerCase().includes(searchLower)));
    return matchesCategory && matchesSearch;
  });

  const analyzeRecipe = async () => {
    if (!recipeInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze this recipe or list of ingredients: "${recipeInput}". Provide a title, estimated prep/cook time (e.g., "25M"), a category (choose from: "High Protein", "Quick Dinners", "Batch Prep", or "Healthy Snacks"), calculated macros (protein, carbs, fat in grams) for one serving, 2 key vitamins/minerals it provides, and a clean list of ingredients. Return ONLY valid JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              time: { type: Type.STRING },
              category: { type: Type.STRING },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              vitamins: { type: Type.ARRAY, items: { type: Type.STRING } },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "time", "category", "protein", "carbs", "fat", "vitamins", "ingredients"]
          }
        }
      });
      if (response.text) {
        setAnalyzedRecipe(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("Error analyzing recipe:", error);
      alert("Failed to analyze recipe. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const searchIngredient = async () => {
    if (!dictSearch.trim()) return;
    setIsSearchingDict(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze this ingredient/food item: "${dictSearch}". Provide standard nutritional info for a typical serving. Return ONLY valid JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              servingSize: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER }
            },
            required: ["name", "servingSize", "calories", "protein", "carbs", "fat"]
          }
        }
      });
      if (response.text) {
        setDictResult(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("Error searching ingredient:", error);
    } finally {
      setIsSearchingDict(false);
    }
  };

  const saveRecipe = () => {
    if (!analyzedRecipe) return;
    const newRecipe = {
      id: Date.now(),
      // Use a generic healthy food image for user-uploaded recipes
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
      time: analyzedRecipe.time,
      category: analyzedRecipe.category,
      title: analyzedRecipe.title,
      macros: { 
        p: analyzedRecipe.protein, 
        c: analyzedRecipe.carbs, 
        f: analyzedRecipe.fat 
      },
      vitamins: analyzedRecipe.vitamins,
      ingredients: analyzedRecipe.ingredients || []
    };
    setRecipes([newRecipe, ...recipes]);
    setIsAdding(false);
    setRecipeInput("");
    setAnalyzedRecipe(null);
  };

  const saveEditedRecipe = () => {
    const exists = recipes.some(r => r.id === editForm.id);
    if (exists) {
      setRecipes(recipes.map(r => r.id === editForm.id ? editForm : r));
    } else {
      setRecipes([editForm, ...recipes]);
    }
    setSelectedRecipe(editForm);
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-md mx-auto space-y-6"
    >
      <header className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400 block mb-1">Food Database</span>
          <h1 className="text-2xl font-bold tracking-tight">Cookbook & Ingredients</h1>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-emerald-500 text-zinc-950 rounded-2xl flex items-center justify-center hover:scale-105 hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
          aria-label="Add new recipe"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex bg-zinc-900/50 backdrop-blur-sm p-1.5 rounded-2xl border border-zinc-800/50">
        <button
          onClick={() => setActiveTab("recipes")}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'recipes' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
        >
          <Book size={18} strokeWidth={2.5} /> My Recipes
        </button>
        <button
          onClick={() => setActiveTab("dictionary")}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'dictionary' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
        >
          <Database size={18} strokeWidth={2.5} /> Dictionary
        </button>
      </div>

      {activeTab === "recipes" ? (
        <>
          <div className="relative" role="search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} aria-hidden="true" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, ingredient, or category..." 
              aria-label="Search recipes"
              aria-controls="recipe-results"
              className="w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-all shadow-inner"
            />
          </div>

          <div 
            className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" 
            role="tablist" 
            aria-label="Recipe categories"
          >
            {CATEGORIES.map(category => (
              <button 
                key={category}
                role="tab"
                aria-selected={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap border transition-all active:scale-95 ${
                  activeCategory === category 
                    ? "bg-emerald-500 text-zinc-950 border-emerald-500 shadow-lg shadow-emerald-500/20" 
                    : "bg-zinc-900/50 text-zinc-400 border-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <motion.div 
            layout 
            id="recipe-results"
            className="grid grid-cols-2 gap-4"
            aria-live="polite"
            aria-relevant="additions removals"
            aria-atomic="true"
          >
            <AnimatePresence>
              {filteredRecipes.map(recipe => (
                <motion.div
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredRecipes.length === 0 && (
              <div className="col-span-2 text-center py-12 text-zinc-500" role="status">
                <p>No recipes found.</p>
              </div>
            )}
          </motion.div>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in">
          <div className="relative" role="search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} aria-hidden="true" />
            <input 
              type="text" 
              value={dictSearch}
              onChange={(e) => setDictSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchIngredient()}
              placeholder="Search any ingredient (e.g., 100g Chicken Breast)" 
              aria-label="Search ingredients dictionary"
              className="w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={searchIngredient}
            disabled={isSearchingDict || !dictSearch.trim()}
            className="w-full py-4 rounded-2xl bg-zinc-800 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-zinc-700 active:scale-[0.98] transition-all"
          >
            {isSearchingDict ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
            Search Engine
          </button>

          {dictResult && (
            <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800/50 space-y-6 animate-in slide-in-from-bottom-4 shadow-xl">
              <div>
                <h3 className="text-2xl font-bold">{dictResult.name}</h3>
                <p className="text-zinc-400 text-sm font-medium">Serving: {dictResult.servingSize}</p>
              </div>
              <div className="flex items-center justify-between bg-zinc-950/50 p-5 rounded-2xl border border-zinc-800/50">
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-1">Cals</p>
                  <p className="font-black text-2xl">{dictResult.calories}</p>
                </div>
                <div className="w-px h-10 bg-zinc-800" />
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-1">Pro</p>
                  <p className="font-bold text-emerald-400 text-lg">{dictResult.protein}g</p>
                </div>
                <div className="w-px h-10 bg-zinc-800" />
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-1">Carbs</p>
                  <p className="font-bold text-blue-400 text-lg">{dictResult.carbs}g</p>
                </div>
                <div className="w-px h-10 bg-zinc-800" />
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-1">Fat</p>
                  <p className="font-bold text-amber-400 text-lg">{dictResult.fat}g</p>
                </div>
              </div>
              <button className="w-full py-4 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20">
                <PlusCircle size={20} strokeWidth={2.5} /> Log to Today
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Recipe Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-end sm:items-center justify-center overflow-y-auto"
          >
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800/50 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative space-y-6">
              <header className="flex justify-between items-center">
                <h2 className="text-2xl font-black">Add Recipe</h2>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setAnalyzedRecipe(null);
                    setRecipeInput("");
                  }}
                  className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  aria-label="Close add recipe modal"
                >
                  <X size={20} />
                </button>
              </header>

              {!analyzedRecipe ? (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-400">
                    Paste your recipe, ingredients list, or a link. Our AI will automatically calculate macros, vitamins, and categorize it for your weekly planner.
                  </p>
                  <textarea 
                    value={recipeInput}
                    onChange={(e) => setRecipeInput(e.target.value)}
                    placeholder="e.g., 2 eggs, 1 avocado, 2 slices of sourdough bread..."
                    className="w-full h-48 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 text-sm focus:outline-none focus:border-emerald-500 focus:bg-zinc-900 transition-all resize-none shadow-inner"
                    aria-label="Recipe ingredients or instructions"
                  />
                  <button 
                    onClick={analyzeRecipe}
                    disabled={isAnalyzing || !recipeInput.trim()}
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-xl shadow-emerald-500/20"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="animate-spin" /> Calculating Macros...</>
                    ) : (
                      <><Sparkles size={20} /> Generate Recipe Info</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-6 border border-zinc-800/50 space-y-6 shadow-lg">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-black mb-1 block">{analyzedRecipe.category} • {analyzedRecipe.time}</span>
                      <h3 className="text-2xl font-black leading-tight">{analyzedRecipe.title}</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 text-center">
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-1">Protein</p>
                        <p className="font-bold text-emerald-400 text-lg">{analyzedRecipe.protein}g</p>
                      </div>
                      <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 text-center">
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-1">Carbs</p>
                        <p className="font-bold text-blue-400 text-lg">{analyzedRecipe.carbs}g</p>
                      </div>
                      <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 text-center">
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-1">Fat</p>
                        <p className="font-bold text-amber-400 text-lg">{analyzedRecipe.fat}g</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                        <Info size={16} /> Key Vitamins
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analyzedRecipe.vitamins.map((vit: string, idx: number) => (
                          <span key={idx} className="bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-xs font-medium px-4 py-1.5 rounded-full">
                            {vit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={saveRecipe}
                      className="w-full py-4 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-lg flex items-center justify-center gap-2 hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-xl shadow-emerald-500/20"
                    >
                      Save to Cookbook
                    </button>
                    <button 
                      onClick={() => {
                      const newRecipe = {
                        id: Date.now(),
                        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
                        time: analyzedRecipe.time,
                        category: analyzedRecipe.category,
                        title: analyzedRecipe.title,
                        macros: { p: analyzedRecipe.protein, c: analyzedRecipe.carbs, f: analyzedRecipe.fat },
                        vitamins: analyzedRecipe.vitamins,
                        ingredients: analyzedRecipe.ingredients || []
                      };
                      setEditForm(newRecipe);
                      setSelectedRecipe(newRecipe);
                      setIsEditing(true);
                      setIsAdding(false);
                      setAnalyzedRecipe(null);
                      setRecipeInput("");
                    }}
                    className="w-full py-4 rounded-2xl bg-transparent text-zinc-400 font-bold text-sm flex items-center justify-center transition-all hover:text-white hover:bg-zinc-900 active:scale-[0.98]"
                  >
                    Edit Recipe Details & Ingredients
                  </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Recipe Detail & Edit Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-zinc-950 overflow-y-auto"
          >
            <div className="relative h-64">
              <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
              <button 
                onClick={() => {
                  setSelectedRecipe(null);
                  setIsEditing(false);
                }}
                className="absolute top-6 right-6 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pb-24 -mt-10 relative z-10 space-y-6 max-w-md mx-auto">
              {isEditing ? (
                <div className="space-y-4 bg-zinc-900/50 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800/50 shadow-lg">
                  <h3 className="font-bold text-lg mb-4">Edit Recipe</h3>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold">Title</label>
                    <input 
                      type="text" 
                      value={editForm.title}
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                      className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3 mt-1 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-500 uppercase font-bold">Time</label>
                      <input 
                        type="text" 
                        value={editForm.time}
                        onChange={e => setEditForm({...editForm, time: e.target.value})}
                        className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3 mt-1 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 uppercase font-bold">Category</label>
                      <input 
                        type="text" 
                        value={editForm.category}
                        onChange={e => setEditForm({...editForm, category: e.target.value})}
                        className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3 mt-1 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-emerald-400 uppercase font-bold">Protein (g)</label>
                      <input 
                        type="number" 
                        value={editForm.macros.p}
                        onChange={e => setEditForm({...editForm, macros: {...editForm.macros, p: Number(e.target.value)}})}
                        className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3 mt-1 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-blue-400 uppercase font-bold">Carbs (g)</label>
                      <input 
                        type="number" 
                        value={editForm.macros.c}
                        onChange={e => setEditForm({...editForm, macros: {...editForm.macros, c: Number(e.target.value)}})}
                        className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3 mt-1 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-amber-400 uppercase font-bold">Fat (g)</label>
                      <input 
                        type="number" 
                        value={editForm.macros.f}
                        onChange={e => setEditForm({...editForm, macros: {...editForm.macros, f: Number(e.target.value)}})}
                        className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3 mt-1 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Ingredients Edit Section */}
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Ingredients</label>
                    <ul className="space-y-2 mb-3">
                      {editForm.ingredients?.map((ing: string, i: number) => (
                        <li key={i} className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 text-sm">
                          <span>{ing}</span>
                          <button 
                            onClick={() => setEditForm({...editForm, ingredients: editForm.ingredients.filter((_:any, idx:number) => idx !== i)})} 
                            className="text-zinc-500 hover:text-red-400"
                          >
                            <X size={16}/>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="relative">
                      <input
                        type="text"
                        value={newIngredient}
                        onChange={(e) => {
                          setNewIngredient(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Add ingredient (e.g., Chicken)..."
                        className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newIngredient.trim()) {
                            setEditForm({...editForm, ingredients: [...(editForm.ingredients || []), newIngredient.trim()]});
                            setNewIngredient("");
                            setShowSuggestions(false);
                          }
                        }}
                      />
                      <AnimatePresence>
                        {showSuggestions && newIngredient.trim() && (
                          <motion.ul
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-20 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-40 overflow-y-auto"
                          >
                            {COMMON_INGREDIENTS.filter(ing => ing.toLowerCase().includes(newIngredient.toLowerCase())).map((ing, i) => (
                              <li
                                key={i}
                                className="px-4 py-2 text-sm hover:bg-zinc-700 cursor-pointer text-zinc-200"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setEditForm({...editForm, ingredients: [...(editForm.ingredients || []), ing]});
                                  setNewIngredient("");
                                  setShowSuggestions(false);
                                }}
                              >
                                {ing}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-4 rounded-2xl bg-zinc-800 text-white font-bold text-sm hover:bg-zinc-700 active:scale-[0.98] transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={saveEditedRecipe}
                      className="flex-1 py-4 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Check size={18} /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1 block">{selectedRecipe.category} • {selectedRecipe.time}</span>
                      <h2 className="text-3xl font-bold leading-tight">{selectedRecipe.title}</h2>
                    </div>
                    <button 
                      onClick={() => {
                        setEditForm(selectedRecipe);
                        setIsEditing(true);
                      }}
                      className="w-12 h-12 bg-zinc-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 shrink-0 border border-zinc-800/50 transition-all active:scale-95 shadow-md"
                    >
                      <Edit2 size={20} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-900/50 backdrop-blur-sm p-5 rounded-3xl border border-zinc-800/50 shadow-lg">
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 uppercase font-bold">Protein</p>
                      <p className="font-bold text-emerald-400 text-lg">{selectedRecipe.macros?.p}g</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-800" />
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 uppercase font-bold">Carbs</p>
                      <p className="font-bold text-blue-400 text-lg">{selectedRecipe.macros?.c}g</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-800" />
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 uppercase font-bold">Fat</p>
                      <p className="font-bold text-amber-400 text-lg">{selectedRecipe.macros?.f}g</p>
                    </div>
                  </div>

                  {selectedRecipe.vitamins && selectedRecipe.vitamins.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                        <Info size={14} /> Key Vitamins & Minerals
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipe.vitamins.map((vit: string, idx: number) => (
                          <span key={idx} className="bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-xs font-medium px-4 py-1.5 rounded-full">
                            {vit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRecipe.ingredients && (
                    <div>
                      <h3 className="font-bold text-lg mb-3">Ingredients</h3>
                      <ul className="space-y-2">
                        {selectedRecipe.ingredients.map((ing: string, i: number) => (
                          <li key={i} className="flex items-center gap-3 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 text-sm shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button className="w-full py-4 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-lg flex items-center justify-center gap-2 hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-xl shadow-emerald-500/20">
                    <PlusCircle size={20} /> Log to Today's Journal
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RecipeCard({ recipe }: { recipe: any }) {
  return (
    <article 
      className="group cursor-pointer flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl"
      tabIndex={0}
      aria-label={`${recipe.title}. Category: ${recipe.category}. Time: ${recipe.time}. ${recipe.macros ? `Macros: ${recipe.macros.p} grams protein, ${recipe.macros.c} grams carbs, ${recipe.macros.f} grams fat.` : ''}`}
    >
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-3 bg-zinc-900 border border-zinc-800 shadow-lg" aria-hidden="true">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
        <div className="absolute top-2 right-2 px-2 py-1 bg-zinc-950/80 backdrop-blur-sm rounded text-[9px] font-bold uppercase tracking-wider text-white border border-zinc-800">
          {recipe.time}
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold mb-1 block">{recipe.category}</span>
        <h3 className="text-sm font-bold leading-snug mb-2 flex-1">{recipe.title}</h3>
        
        {recipe.macros && (
          <div className="flex gap-2 text-[10px] font-bold mt-auto pt-2 border-t border-zinc-800/50">
            <span className="text-emerald-400">{recipe.macros.p}g P</span>
            <span className="text-zinc-600">•</span>
            <span className="text-blue-400">{recipe.macros.c}g C</span>
            <span className="text-zinc-600">•</span>
            <span className="text-amber-400">{recipe.macros.f}g F</span>
          </div>
        )}
      </div>
    </article>
  );
}
