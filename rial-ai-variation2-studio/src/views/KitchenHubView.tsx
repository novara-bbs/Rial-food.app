import React from 'react';
import { Search, Bell, ChevronDown, Users, Bookmark, Clock, Utensils, ChevronRight, Play, Shield, Target, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface KitchenHubViewProps {
  setCurrentView?: (view: string) => void;
}

export function KitchenHubView({ setCurrentView }: KitchenHubViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 h-20 max-w-3xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#ddff00]/10 flex items-center justify-center text-[#ddff00] border border-[#ddff00]/20 shadow-[0_0_20px_rgba(221,255,0,0.1)]">
            <Utensils className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tighter">Kitchen Hub</h1>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Bell className="w-6 h-6" />
          </motion.button>
        </div>
      </header>

      <div className="px-6 mt-8 space-y-12 max-w-3xl mx-auto">
        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-[#ddff00]/20 rounded-[24px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-[#ddff00] transition-colors" />
            <input 
              type="text" 
              placeholder="Search recipes, creators, or plans" 
              className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-base text-white placeholder:text-white/20 shadow-2xl focus:outline-none focus:border-[#ddff00]/50 focus:ring-1 focus:ring-[#ddff00]/50 transition-all font-medium"
            />
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-[#ddff00] text-black px-6 py-3 rounded-2xl text-sm font-black whitespace-nowrap shadow-[0_0_20px_rgba(221,255,0,0.3)] font-mono uppercase tracking-widest"
          >
            Trending <ChevronDown className="w-4 h-4" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 px-6 py-3 rounded-2xl text-sm font-bold text-white whitespace-nowrap shadow-xl transition-colors"
          >
            Family-Size <Users className="w-4 h-4 text-white/40" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 px-6 py-3 rounded-2xl text-sm font-bold text-white whitespace-nowrap shadow-xl transition-colors"
          >
            Pro Creators <Shield className="w-4 h-4 text-white/40" />
          </motion.button>
        </div>

        {/* Community Favorites */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-display flex items-center gap-3 text-white tracking-tighter">
              <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
              Community Favorites
            </h2>
            <button className="text-[#ddff00] text-[10px] font-mono font-black uppercase tracking-[0.2em] hover:text-[#ddff00]/80 transition-colors">View All</button>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white/5 rounded-[40px] overflow-hidden shadow-2xl border border-white/10 group hover:border-[#ddff00]/30 transition-all cursor-pointer"
          >
            <div className="relative h-72">
              <img 
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" 
                alt="Mediterranean Power Bowl" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-black text-white shadow-2xl">
                <span className="text-[#ddff00]">★</span> 4.9
              </div>
              <div className="absolute bottom-6 left-6 flex gap-3">
                <span className="bg-[#ddff00] text-black border border-[#ddff00]/50 text-[10px] font-mono font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(221,255,0,0.4)]">Pro Creator</span>
                <span className="bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-mono font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/40" /> Family-Size
                </span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-3xl font-bold font-display text-white tracking-tighter">Mediterranean Power Bowl</h3>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Bookmark className="w-5 h-5 text-white/40" />
                </motion.button>
              </div>
              <div className="flex items-center gap-6 text-sm font-mono font-bold text-white/40 mb-8 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-[#ddff00]" /> 25 min</span>
                <span className="flex items-center gap-2"><Utensils className="w-5 h-5 text-[#ddff00]" /> 4-6 servings</span>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#ddff00]/10 border border-[#ddff00]/20 flex items-center justify-center text-[#ddff00] shadow-[0_0_15px_rgba(221,255,0,0.1)]">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-white block">Chef Elena Russo</span>
                    <span className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em]">Elite Creator</span>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView?.('recipe')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-2xl text-sm font-black transition-colors font-mono uppercase tracking-widest"
                >
                  View Recipe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Leftover Logic */}
        <motion.section 
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-[#ddff00]/20 to-white/5 rounded-[40px] p-10 border border-[#ddff00]/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Target className="w-40 h-40 text-[#ddff00]" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-[#ddff00] animate-pulse" />
              <h2 className="text-2xl font-bold font-display text-white tracking-tighter">Leftover Logic</h2>
            </div>
            <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-md font-medium">
              You have ingredients from <strong className="text-white font-black">Roast Chicken Sunday</strong>. Here's a shared plan to use them up:
            </p>
            
            <motion.div 
              whileHover={{ x: 5 }}
              className="bg-black/40 backdrop-blur-xl rounded-[32px] p-5 flex items-center gap-6 shadow-2xl border border-white/10 mb-8 hover:border-[#ddff00]/30 transition-colors cursor-pointer group/item"
            >
              <img 
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=200" 
                alt="Soup" 
                className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <h4 className="font-bold text-lg text-white group-hover/item:text-[#ddff00] transition-colors tracking-tight">Creamy Chicken & Herb Soup</h4>
                <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em] mt-2">Uses 4 leftover items • 15 min</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mr-2 group-hover/item:bg-[#ddff00]/20 transition-colors">
                <ChevronRight className="w-6 h-6 text-[#ddff00]" />
              </div>
            </motion.div>
            
            <div className="flex items-center gap-5">
              <div className="flex -space-x-4">
                {[1, 2].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/10 border-4 border-black shadow-xl" />
                ))}
                <div className="w-10 h-10 rounded-full bg-[#ddff00] text-black flex items-center justify-center text-[10px] font-black border-4 border-black shadow-[0_0_20px_rgba(221,255,0,0.3)] font-mono">
                  +12
                </div>
              </div>
              <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em]">324 families planning this today</p>
            </div>
          </div>
        </motion.section>

        {/* Pro Creator Stories */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-display flex items-center gap-3 text-white tracking-tighter">
              <span className="w-2 h-2 rounded-full bg-white/20"></span>
              Pro Creator Stories
            </h2>
            <button className="text-[#ddff00] text-[10px] font-mono font-black uppercase tracking-[0.2em] hover:text-[#ddff00]/80 transition-colors">Explore</button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar">
            {/* Story 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="min-w-[180px] group cursor-pointer"
            >
              <div className="relative h-64 rounded-[32px] overflow-hidden mb-4 border border-white/10 group-hover:border-[#ddff00]/50 transition-colors shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400" 
                  alt="Pasta" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-4 right-4 w-10 h-10 bg-[#ddff00] backdrop-blur-md rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(221,255,0,0.5)] group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-1 fill-current" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">Pasta Week</span>
                </div>
              </div>
              <h4 className="font-bold text-base text-white group-hover:text-[#ddff00] transition-colors tracking-tight">Chef Marcus</h4>
              <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em] mt-1.5">124k Followers</p>
            </motion.div>
            
            {/* Story 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="min-w-[180px] group cursor-pointer"
            >
              <div className="relative h-64 rounded-[32px] overflow-hidden mb-4 border border-white/10 group-hover:border-amber-500/50 transition-colors shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400" 
                  alt="Prep" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-4 right-4 w-10 h-10 bg-amber-500 backdrop-blur-md rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-1 fill-current" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">Meal Prep</span>
                </div>
              </div>
              <h4 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors tracking-tight">Sarah's Kitchen</h4>
              <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em] mt-1.5">89k Followers</p>
            </motion.div>
            
            {/* Story 3 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="min-w-[180px] group cursor-pointer"
            >
              <div className="relative h-64 rounded-[32px] overflow-hidden mb-4 border border-white/10 group-hover:border-rose-500/50 transition-colors shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400" 
                  alt="Grill" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-4 right-4 w-10 h-10 bg-rose-500 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-1 fill-current" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">Grill Master</span>
                </div>
              </div>
              <h4 className="font-bold text-base text-white group-hover:text-rose-400 transition-colors tracking-tight">Big Dave BBQ</h4>
              <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.2em] mt-1.5">45k Followers</p>
            </motion.div>
          </div>
        </section>

        {/* Popular Tags */}
        <section className="pb-12">
          <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-3 text-white tracking-tighter">
            <span className="w-2 h-2 rounded-full bg-white/20"></span>
            Popular Tags
          </h2>
          <div className="flex flex-wrap gap-4">
            {['#SchoolLunches', '#VeganFamily', '#QuickBake', '#BudgetFriendly', '#LowCarb'].map(tag => (
              <motion.span 
                key={tag} 
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(221,255,0,0.1)', borderColor: 'rgba(221,255,0,0.3)' }}
                className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl text-xs font-mono font-black text-white/60 shadow-2xl cursor-pointer transition-all uppercase tracking-widest"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
