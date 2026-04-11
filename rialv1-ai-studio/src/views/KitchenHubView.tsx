import React from 'react';
import { Search, Bell, ChevronDown, Users, Bookmark, Clock, Utensils, ChevronRight, Play, Shield, Target } from 'lucide-react';

export function KitchenHubView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <Utensils className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold font-display text-white">Kitchen Hub</h1>
        <div className="w-10 h-10 rounded-full bg-surface-dark border border-white/5 flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
        </div>
      </header>

      <div className="px-4 mt-6 space-y-8 max-w-3xl mx-auto">
        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search recipes, creators, or plans" 
              className="w-full bg-surface-dark border border-white/10 rounded-full py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 shadow-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          <button className="flex items-center gap-2 bg-primary text-background-dark px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
            Trending <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 bg-surface-dark border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap shadow-lg transition-colors">
            Family-Size <Users className="w-4 h-4 text-slate-400" />
          </button>
          <button className="flex items-center gap-2 bg-surface-dark border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap shadow-lg transition-colors">
            Pro Creators <Shield className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Community Favorites */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-display flex items-center gap-2 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Community Favorites
            </h2>
            <button className="text-primary text-xs font-mono uppercase tracking-wider hover:text-primary/80 transition-colors">View All</button>
          </div>
          
          <div className="bg-surface-dark rounded-3xl overflow-hidden shadow-lg border border-white/5 group hover:border-primary/30 transition-colors cursor-pointer">
            <div className="relative h-56">
              <img 
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" 
                alt="Mediterranean Power Bowl" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent" />
              <div className="absolute top-4 right-4 bg-background-dark/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-sm font-bold text-white shadow-lg">
                <span className="text-primary">★</span> 4.9
              </div>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="bg-primary/90 backdrop-blur-md text-background-dark border border-primary/50 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(20,184,166,0.3)]">Pro Creator</span>
                <span className="bg-background-dark/80 backdrop-blur-md text-white border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-slate-400" /> Family-Size
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold font-display text-white">Mediterranean Power Bowl</h3>
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Bookmark className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="flex items-center gap-5 text-sm font-mono text-slate-400 mb-6">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-500" /> 25 min</span>
                <span className="flex items-center gap-1.5"><Utensils className="w-4 h-4 text-slate-500" /> 4-6 servings</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">Chef Elena Russo</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Elite Creator</span>
                  </div>
                </div>
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                  View Recipe
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Leftover Logic */}
        <section className="bg-gradient-to-br from-primary/10 to-surface-dark rounded-3xl p-6 border border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Target className="w-32 h-32 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary text-xl animate-pulse">✨</span>
              <h2 className="text-lg font-bold font-display text-white">Leftover Logic</h2>
            </div>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed max-w-[280px]">
              You have ingredients from <strong className="text-white font-bold">Roast Chicken Sunday</strong>. Here's a shared plan to use them up:
            </p>
            
            <div className="bg-background-dark/80 backdrop-blur-md rounded-2xl p-3 flex items-center gap-4 shadow-lg border border-white/5 mb-5 hover:border-primary/30 transition-colors cursor-pointer group/item">
              <img 
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=200" 
                alt="Soup" 
                className="w-16 h-16 rounded-xl object-cover border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <h4 className="font-bold text-sm text-white group-hover/item:text-primary transition-colors">Creamy Chicken & Herb Soup</h4>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1.5">Uses 4 leftover items • 15 min</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-2 group-hover/item:bg-primary/20 transition-colors">
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-background-dark" />
                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-background-dark" />
                <div className="w-8 h-8 rounded-full bg-primary text-background-dark flex items-center justify-center text-[10px] font-bold border-2 border-background-dark shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                  +12
                </div>
              </div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">324 families planning this today</p>
            </div>
          </div>
        </section>

        {/* Pro Creator Stories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-display flex items-center gap-2 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              Pro Creator Stories
            </h2>
            <button className="text-primary text-xs font-mono uppercase tracking-wider hover:text-primary/80 transition-colors">Explore</button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {/* Story 1 */}
            <div className="min-w-[140px] group cursor-pointer">
              <div className="relative h-48 rounded-2xl overflow-hidden mb-3 border border-white/5 group-hover:border-primary/50 transition-colors">
                <img 
                  src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400" 
                  alt="Pasta" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent" />
                <div className="absolute top-3 right-3 w-8 h-8 bg-primary/90 backdrop-blur-md rounded-full flex items-center justify-center text-background-dark shadow-[0_0_15px_rgba(20,184,166,0.5)] group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider bg-black/50 backdrop-blur-md px-2 py-1 rounded-md">Pasta Week</span>
                </div>
              </div>
              <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors">Chef Marcus</h4>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-1">124k Followers</p>
            </div>
            
            {/* Story 2 */}
            <div className="min-w-[140px] group cursor-pointer">
              <div className="relative h-48 rounded-2xl overflow-hidden mb-3 border border-white/5 group-hover:border-amber-500/50 transition-colors">
                <img 
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400" 
                  alt="Prep" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent" />
                <div className="absolute top-3 right-3 w-8 h-8 bg-amber-500/90 backdrop-blur-md rounded-full flex items-center justify-center text-background-dark shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider bg-black/50 backdrop-blur-md px-2 py-1 rounded-md">Meal Prep</span>
                </div>
              </div>
              <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">Sarah's Kitchen</h4>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-1">89k Followers</p>
            </div>
            
            {/* Story 3 */}
            <div className="min-w-[140px] group cursor-pointer">
              <div className="relative h-48 rounded-2xl overflow-hidden mb-3 border border-white/5 group-hover:border-rose-500/50 transition-colors">
                <img 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400" 
                  alt="Grill" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/20 to-transparent" />
                <div className="absolute top-3 right-3 w-8 h-8 bg-rose-500/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider bg-black/50 backdrop-blur-md px-2 py-1 rounded-md">Grill Master</span>
                </div>
              </div>
              <h4 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors">Big Dave BBQ</h4>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-1">45k Followers</p>
            </div>
          </div>
        </section>

        {/* Popular Tags */}
        <section className="pb-8">
          <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            Popular Tags
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {['#SchoolLunches', '#VeganFamily', '#QuickBake', '#BudgetFriendly', '#LowCarb'].map(tag => (
              <span key={tag} className="bg-surface-dark border border-white/10 hover:border-white/30 hover:bg-white/5 px-4 py-2 rounded-xl text-xs font-mono text-slate-300 shadow-lg cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
