import { Heart, Eye, Sparkles, Flame, Users, Compass } from "lucide-react";

export function DiscoverView() {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Header & Tabs */}
      <div className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 pt-4">
        <div className="flex items-center gap-3 px-4 mb-4">
          <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-display">Discover</h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">Explore RIAL Ecosystem</p>
          </div>
        </div>
        
        <div className="flex px-4 overflow-x-auto hide-scrollbar">
          <button className="px-5 py-3 border-b-2 border-primary text-white font-bold text-sm whitespace-nowrap transition-colors">For You</button>
          <button className="px-5 py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 font-medium text-sm whitespace-nowrap transition-colors">Social Pulse</button>
          <button className="px-5 py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 font-medium text-sm whitespace-nowrap transition-colors">Pro Series</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-2">
        {/* Avatars */}
        <div className="flex gap-5 px-4 py-6 overflow-x-auto hide-scrollbar">
          {[
            { name: "Chef Leo", img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop" },
            { name: "@amy_k", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
            { name: "Morning Fit", img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop" },
            { name: "Elena S.", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" },
          ].map((user, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-primary to-primary-dark group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                <div className="w-full h-full rounded-full border-2 border-background-dark overflow-hidden bg-surface-dark">
                  <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-white transition-colors">{user.name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 bg-surface-dark flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary transition-colors">
              <span className="text-2xl font-light">+</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-primary transition-colors">Add Post</span>
          </div>
        </div>

        {/* Featured Card */}
        <div className="px-4 mb-10">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] group cursor-pointer border border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1469&auto=format&fit=crop" 
              alt="Steak" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
            
            <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
              <div className="bg-background-dark/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">Rial Pro Routine</span>
              </div>
              <div className="bg-primary text-background-dark rounded-2xl px-4 py-3 text-center shadow-[0_0_20px_rgba(20,184,166,0.4)] border border-primary/50">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-80 mb-0.5">Match</p>
                <p className="text-2xl font-bold font-display leading-none">98%</p>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-4xl font-bold text-white font-display mb-2 leading-tight">Aged Wagyu & Chimichurri</h2>
              <p className="text-slate-300 text-sm mb-6 font-medium flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center">
                  <span className="text-[8px]">👨‍🍳</span>
                </span>
                By Master Chef Julian Vane
              </p>
              
              <div className="flex items-center justify-between">
                <button className="bg-white text-background-dark px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all shadow-lg">
                  View Routine
                </button>
                <div className="flex items-center -space-x-3">
                  <img src="https://i.pravatar.cc/100?img=1" className="w-10 h-10 rounded-full border-2 border-background-dark" alt="user" />
                  <img src="https://i.pravatar.cc/100?img=2" className="w-10 h-10 rounded-full border-2 border-background-dark" alt="user" />
                  <div className="w-10 h-10 rounded-full border-2 border-background-dark bg-surface-dark text-primary flex items-center justify-center text-[10px] font-mono font-bold backdrop-blur-md">
                    +12k
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Pulse */}
        <div className="px-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <h3 className="text-2xl font-bold font-display text-white">Social Pulse</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-3 group cursor-pointer">
              <div className="relative rounded-3xl overflow-hidden aspect-square border border-white/5 shadow-lg group-hover:border-primary/30 transition-colors">
                <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="food" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-primary/50 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                  <span className="text-[10px] font-mono font-bold text-background-dark flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    84% MATCH
                  </span>
                </div>
                <button className="absolute bottom-3 right-3 p-2 bg-background-dark/60 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/20 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="font-bold text-white text-sm leading-tight font-display">Quick Mediterranean</p>
                <p className="text-[10px] font-mono text-slate-500 mt-1">@jess_kitchen</p>
              </div>
            </div>
            
            <div className="space-y-3 group cursor-pointer">
              <div className="relative rounded-3xl overflow-hidden aspect-square border border-white/5 shadow-lg group-hover:border-primary/30 transition-colors">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="food" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-primary/50 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                  <span className="text-[10px] font-mono font-bold text-background-dark flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    91% MATCH
                  </span>
                </div>
                <button className="absolute bottom-3 right-3 p-2 bg-background-dark/60 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/20 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="font-bold text-white text-sm leading-tight font-display">Power Grain Bowl</p>
                <p className="text-[10px] font-mono text-slate-500 mt-1">@health_hub</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden aspect-video border border-white/5 shadow-xl group cursor-pointer mt-6">
            <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=450&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="food" />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
            
            <div className="absolute top-4 left-4 flex gap-2">
               <div className="bg-background-dark/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="text-[10px] font-mono font-bold text-slate-300">67% MATCH</span>
                </div>
                <div className="bg-red-500/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-mono font-bold text-white tracking-widest">TRENDING</span>
                </div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <h4 className="font-bold text-white text-xl leading-tight font-display mb-1">Midnight Sourdough</h4>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">The 'Raw' Community Take</p>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 text-[10px] font-mono font-bold bg-background-dark/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10">
                <Eye className="w-3.5 h-3.5" /> 1.4K
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
