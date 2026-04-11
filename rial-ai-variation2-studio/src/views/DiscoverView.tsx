import React from 'react';
import { Heart, Eye, Sparkles, Flame, Users, Compass, Share2, MoreHorizontal, MessageCircle } from "lucide-react";
import { motion } from 'motion/react';

interface DiscoverViewProps {
  setCurrentView?: (view: string) => void;
}

export function DiscoverView({ setCurrentView }: DiscoverViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black selection:bg-[#ddff00] selection:text-black">
      {/* Header & Tabs */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 pt-4">
        <div className="flex items-center justify-between px-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#ddff00]/10 p-2.5 rounded-xl border border-[#ddff00]/20 shadow-[0_0_15px_rgba(221,255,0,0.2)]">
              <Compass className="w-5 h-5 text-[#ddff00]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-display">Discover</h1>
              <p className="text-[10px] text-[#ddff00] font-mono font-black uppercase tracking-[0.2em] mt-0.5">Explore RIAL Ecosystem</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="flex px-6 overflow-x-auto hide-scrollbar gap-6">
          <button className="pb-3 border-b-2 border-[#ddff00] text-white font-bold text-sm whitespace-nowrap transition-all">For You</button>
          <button className="pb-3 border-b-2 border-transparent text-white/40 hover:text-white/80 font-bold text-sm whitespace-nowrap transition-all">Social Pulse</button>
          <button className="pb-3 border-b-2 border-transparent text-white/40 hover:text-white/80 font-bold text-sm whitespace-nowrap transition-all">Pro Series</button>
          <button className="pb-3 border-b-2 border-transparent text-white/40 hover:text-white/80 font-bold text-sm whitespace-nowrap transition-all">Bio-Sync</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Avatars / Stories */}
        <div className="flex gap-6 px-6 py-8 overflow-x-auto hide-scrollbar">
          {[
            { name: "Chef Leo", img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop", active: true },
            { name: "@amy_k", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop", active: true },
            { name: "Morning Fit", img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop", active: false },
            { name: "Elena S.", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop", active: true },
            { name: "Marcus", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop", active: false },
          ].map((user, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer"
            >
              <div className={`size-20 rounded-full p-1 transition-all duration-500 ${user.active ? 'bg-gradient-to-tr from-[#ddff00] via-emerald-400 to-[#ddff00] shadow-[0_0_20px_rgba(221,255,0,0.4)]' : 'bg-white/10'} group-hover:scale-110`}>
                <div className="w-full h-full rounded-full border-[3px] border-black overflow-hidden bg-white/5">
                  <img src={user.img} alt={user.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                </div>
              </div>
              <span className="text-[10px] font-mono font-black text-white/40 group-hover:text-white transition-colors uppercase tracking-[0.2em]">{user.name}</span>
            </motion.div>
          ))}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group"
          >
            <div className="size-20 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center text-white/40 group-hover:border-[#ddff00] group-hover:text-[#ddff00] group-hover:bg-[#ddff00]/5 transition-all group-hover:scale-110">
              <span className="text-3xl font-light">+</span>
            </div>
            <span className="text-[10px] font-mono font-black text-white/40 group-hover:text-[#ddff00] transition-colors uppercase tracking-[0.2em]">Add Post</span>
          </motion.div>
        </div>

        {/* Featured Card */}
        <section className="px-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[40px] overflow-hidden shadow-2xl aspect-[4/5] group cursor-pointer border border-white/10"
          >
            <img 
              src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1469&auto=format&fit=crop" 
              alt="Steak" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xl">
                <div className="size-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                <span className="text-[10px] font-mono font-black text-white tracking-[0.2em] uppercase">Rial Pro Routine</span>
              </div>
              <div className="bg-[#ddff00]/90 backdrop-blur-xl text-black rounded-[24px] px-5 py-4 text-center shadow-[0_0_30px_rgba(221,255,0,0.5)] border border-[#ddff00]/50">
                <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] opacity-70 mb-1">Match</p>
                <p className="text-3xl font-bold font-display leading-none tracking-tighter">98%</p>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <h2 className="text-5xl font-bold text-white font-display mb-3 leading-tight tracking-tighter">Aged Wagyu &<br />Chimichurri</h2>
              <div className="flex items-center gap-3 mb-8">
                <div className="size-8 rounded-full border border-white/20 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100" alt="Chef" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                  Master Chef Julian Vane
                  <span className="size-1.5 rounded-full bg-[#ddff00]"></span>
                  <span className="text-[#ddff00] text-xs">Verified</span>
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView?.('recipe')}
                  className="bg-white text-black px-8 h-14 rounded-2xl font-bold text-sm hover:bg-white/90 transition-all shadow-2xl flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  View Routine
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Social Pulse Section */}
        <section className="px-6 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#ddff00] shadow-[0_0_10px_#ddff00]"></span>
              <h3 className="text-2xl font-bold font-display text-white tracking-tighter">Social Pulse</h3>
            </div>
            <button className="text-[#ddff00] font-mono text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#ddff00]/80 transition-colors">View Feed</button>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            {[
              { title: "Quick Mediterranean", author: "@jess_kitchen", match: "84%", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop" },
              { title: "Power Grain Bowl", author: "@health_hub", match: "91%", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop" }
            ].map((post, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="space-y-4 group cursor-pointer"
              >
                <div className="relative rounded-[32px] overflow-hidden aspect-square border border-white/10 shadow-xl group-hover:border-[#ddff00]/30 transition-all duration-500">
                  <img src={post.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={post.title} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-4 left-4 bg-[#ddff00]/90 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-[#ddff00]/50 shadow-2xl">
                    <span className="text-[10px] font-mono font-black text-black flex items-center gap-1.5 tracking-widest">
                      <Sparkles className="w-3 h-3" />
                      {post.match} MATCH
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <button className="size-10 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="size-10 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="px-2">
                  <p className="font-bold text-white text-lg leading-tight font-display group-hover:text-[#ddff00] transition-colors tracking-tight">{post.title}</p>
                  <p className="text-[10px] font-mono font-black text-white/40 mt-1 uppercase tracking-[0.2em]">{post.author}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Large Trending Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative rounded-[40px] overflow-hidden aspect-video border border-white/10 shadow-2xl group cursor-pointer"
          >
            <img 
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=450&fit=crop" 
              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
              alt="Trending" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute top-6 left-6 flex gap-3">
               <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
                  <span className="text-[10px] font-mono font-black text-white/80 tracking-[0.2em] uppercase">67% MATCH</span>
                </div>
                <div className="bg-red-500/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-red-500/50 shadow-2xl flex items-center gap-2">
                  <Flame className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-[10px] font-mono font-black text-white tracking-[0.2em] uppercase">TRENDING</span>
                </div>
            </div>
            
            <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
              <div>
                <h4 className="font-bold text-white text-3xl leading-tight font-display mb-2 tracking-tighter group-hover:text-[#ddff00] transition-colors">Midnight Sourdough</h4>
                <p className="text-[10px] font-mono font-black text-white/60 uppercase tracking-[0.2em]">The 'Raw' Community Take</p>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-[10px] font-mono font-black bg-black/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 shadow-2xl tracking-widest">
                <Eye className="w-4 h-4" /> 1.4K VIEWS
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
