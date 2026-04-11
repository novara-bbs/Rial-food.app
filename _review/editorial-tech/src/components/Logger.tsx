import React, { useState, useEffect } from 'react';
import { Mic, X, Zap, Camera, ScanLine, Loader2, CheckCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export default function Logger() {
  const [mode, setMode] = useState<'voice' | 'tactical'>('voice');
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'analyzing' | 'done'>('idle');
  const { addFoodToLog } = useAppContext();
  const [isPublished, setIsPublished] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');

  // Tactical Entry State
  const [tacticalTitle, setTacticalTitle] = useState('PROTEIN POWER BOWL');
  const [tacticalCals, setTacticalCals] = useState('650');
  const [tacticalMacros, setTacticalMacros] = useState('40/30/30');

  const handleMicClick = () => {
    if (recordingState === 'idle') {
      setRecordingState('recording');
      setTimeout(() => {
        setRecordingState('analyzing');
        setTimeout(() => {
          setRecordingState('done');
        }, 2000);
      }, 3000);
    } else {
      setRecordingState('idle');
      setIsPublished(false);
    }
  };

  const handleConfirmVoice = () => {
    addFoodToLog({
      name: 'Quinoa Bowl with Avocado & Eggs',
      desc: 'Voice Entry',
      cals: 450,
      macros: { p: 18, c: 45, f: 22 },
      mealType: selectedMealType,
      status: 'logged'
    });
    setIsPublished(true);
    setTimeout(() => {
      setRecordingState('idle');
      setIsPublished(false);
    }, 2000);
  };

  const handlePublishTactical = () => {
    const [p, c, f] = tacticalMacros.split('/').map(Number);
    addFoodToLog({
      name: tacticalTitle,
      desc: 'Tactical Entry',
      cals: parseInt(tacticalCals) || 0,
      macros: { p: p || 0, c: c || 0, f: f || 0 },
      mealType: selectedMealType,
      status: 'logged'
    });
    setIsPublished(true);
    setTimeout(() => {
      setIsPublished(false);
      setMode('voice');
    }, 2000);
  };

  if (mode === 'tactical') {
    return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-md mx-auto w-full flex flex-col min-h-screen bg-[#1a0f0a]"
        >
            <div className="flex items-center p-4 pb-2 justify-between border-b border-[#ec5b13]/10">
                <button onClick={() => setMode('voice')} className="text-slate-100 flex size-12 shrink-0 items-center justify-start">
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-slate-100 text-lg font-bold leading-tight flex-1 text-center uppercase tracking-widest">Tactical Entry</h2>
                <div className="flex w-20 items-center justify-end">
                    <button 
                      onClick={handlePublishTactical}
                      disabled={isPublished}
                      className={`text-sm font-bold transition-colors ${isPublished ? 'text-emerald-500' : 'text-[#ec5b13] hover:text-[#ec5b13]/80'}`}
                    >
                      {isPublished ? 'PUBLISHED' : 'PUBLISH'}
                    </button>
                </div>
            </div>
            
            <div className="px-4 py-2">
                <div className="flex items-center justify-between bg-[#ec5b13]/10 border border-[#ec5b13]/20 rounded-lg px-3 py-2">
                    <h4 className="text-[#ec5b13] text-xs font-bold tracking-[0.1em] uppercase">High Performance Mode</h4>
                    <Zap className="w-4 h-4 text-[#ec5b13]" />
                </div>
            </div>

            <div className="p-4">
                <div className="relative w-full bg-slate-800 rounded-xl min-h-[200px] border border-[#ec5b13]/30 overflow-hidden flex items-center justify-center group">
                    <div className="absolute inset-0 bg-cover bg-center opacity-50 transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800&h=600')" }}></div>
                    <div className="relative z-10 flex gap-2">
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center rounded-xl h-10 px-4 bg-[#ec5b13] text-white gap-2 text-sm font-bold shadow-lg"
                        >
                            <Camera className="w-5 h-5" /> REPLACE
                        </motion.button>
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center rounded-xl h-10 px-4 bg-black/80 text-white gap-2 text-sm font-bold backdrop-blur-md border border-white/10"
                        >
                            <ScanLine className="w-5 h-5" /> SCAN
                        </motion.button>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Recipe Header</label>
                        <input 
                          type="text" 
                          value={tacticalTitle}
                          onChange={(e) => setTacticalTitle(e.target.value)}
                          className="w-full rounded-xl text-slate-100 border border-[#ec5b13]/20 bg-[#ec5b13]/5 focus:border-[#ec5b13] focus:ring-1 focus:ring-[#ec5b13] h-14 p-4 text-lg font-bold transition-all" 
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#ec5b13]/5 border border-[#ec5b13]/20 p-3 rounded-xl transition-colors focus-within:border-[#ec5b13]/50">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Prep Time</p>
                            <input className="bg-transparent border-none p-0 text-[#ec5b13] font-bold text-lg focus:ring-0 w-full outline-none" defaultValue="12m" />
                        </div>
                        <div className="bg-[#ec5b13]/5 border border-[#ec5b13]/20 p-3 rounded-xl transition-colors focus-within:border-[#ec5b13]/50">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Calories</p>
                            <input 
                              type="text"
                              value={tacticalCals}
                              onChange={(e) => setTacticalCals(e.target.value)}
                              className="bg-transparent border-none p-0 text-[#ec5b13] font-bold text-lg focus:ring-0 w-full outline-none" 
                            />
                        </div>
                        <div className="bg-[#ec5b13]/5 border border-[#ec5b13]/20 p-3 rounded-xl transition-colors focus-within:border-[#ec5b13]/50">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Macros</p>
                            <input 
                              type="text"
                              value={tacticalMacros}
                              onChange={(e) => setTacticalMacros(e.target.value)}
                              className="bg-transparent border-none p-0 text-[#ec5b13] font-bold text-lg focus:ring-0 w-full outline-none" 
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex justify-between items-end">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ingredients (Auto-Parse)</p>
                            <span className="text-[#ec5b13] text-[10px] font-mono animate-pulse">AI ENGINE ACTIVE</span>
                        </div>
                        <textarea className="w-full rounded-xl text-slate-100 border border-[#ec5b13]/20 bg-[#ec5b13]/5 focus:border-[#ec5b13] focus:ring-1 focus:ring-[#ec5b13] min-h-[120px] p-4 text-sm font-mono leading-relaxed transition-all outline-none resize-none" defaultValue="200g Chicken breast, grilled&#10;100g Quinoa, cooked&#10;1/2 Avocado, sliced" />
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                        <label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Meal Type</label>
                        <div className="relative">
                          <select 
                            value={selectedMealType}
                            onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                            className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold uppercase tracking-widest rounded-xl py-4 pl-4 pr-8 focus:outline-none focus:border-[#ec5b13]/50"
                          >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snacks">Snacks</option>
                          </select>
                          <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-md mx-auto w-full flex flex-col min-h-screen bg-black"
    >
      <header className="pt-12 px-6 pb-4 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Editorial Tech</span>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100">Smart Logger</h1>
        </div>
        <button onClick={() => setMode('tactical')} className="text-xs text-[#ec5b13] underline hover:text-[#ec5b13]/80 transition-colors">Manual Entry</button>
      </header>

      <main className="flex-1 px-6 flex flex-col justify-between pb-12">
        <section className="mt-8 flex flex-col items-center justify-center space-y-8 flex-1">
          <div className="relative flex items-center justify-center">
            <AnimatePresence>
              {recordingState === 'recording' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="absolute w-48 h-48 rounded-full border border-[#ec5b13]/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                  <div className="absolute w-56 h-56 rounded-full border border-[#ec5b13]/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(236,91,19,0.15)] cursor-pointer transition-colors duration-300 ${recordingState === 'recording' ? 'bg-[#ec5b13]' : 'bg-white'}`}
              onClick={handleMicClick}
            >
              <AnimatePresence mode="wait">
                {recordingState === 'analyzing' ? (
                  <motion.div key="analyzing" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                    <Loader2 className="w-12 h-12 text-black animate-spin" />
                  </motion.div>
                ) : recordingState === 'done' ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }}>
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </motion.div>
                ) : (
                  <motion.div key="mic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Mic className={`w-12 h-12 transition-colors duration-300 ${recordingState === 'recording' ? 'text-white' : 'text-black'}`} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          
          <div className="text-center max-w-xs mx-auto h-24">
            <AnimatePresence mode="wait">
              {recordingState === 'idle' && (
                <motion.p key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm font-medium text-slate-400 mt-8 uppercase tracking-widest">Tap to speak</motion.p>
              )}
              {recordingState === 'recording' && (
                <motion.div key="recording" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <p className="text-xl font-light text-slate-200 italic leading-relaxed">
                    "Un bol de quinoa con aguacate y dos huevos poché..."
                  </p>
                  <p className="text-xs text-[#ec5b13] mt-3 font-bold tracking-wide uppercase animate-pulse">Escuchando...</p>
                </motion.div>
              )}
              {recordingState === 'analyzing' && (
                <motion.p key="analyzing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm font-medium text-[#ec5b13] mt-8 uppercase tracking-widest animate-pulse">Analizando Macros...</motion.p>
              )}
              {recordingState === 'done' && (
                <motion.p key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm font-medium text-green-500 mt-8 uppercase tracking-widest">Análisis Completado</motion.p>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className={`mt-auto space-y-4 transition-all duration-500 ${recordingState === 'done' ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Análisis IA en tiempo real</span>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-400">Real Match Score</h3>
                <p className="text-2xl font-bold mt-1 text-white">94<span className="text-zinc-500 text-sm ml-1">/100</span></p>
              </div>
              <div className="h-10 w-10 rounded-full border-4 border-[#ec5b13] border-t-white"></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Proteína</p>
                <div className="flex items-baseline space-x-1 text-white">
                  <span className="text-lg font-semibold">18</span>
                  <span className="text-[10px] text-zinc-400">g</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: recordingState === 'done' ? '75%' : 0 }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-[#ec5b13]"></motion.div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Grasas</p>
                <div className="flex items-baseline space-x-1 text-white">
                  <span className="text-lg font-semibold">22</span>
                  <span className="text-[10px] text-zinc-400">g</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: recordingState === 'done' ? '50%' : 0 }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-[#ec5b13]"></motion.div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Carbo</p>
                <div className="flex items-baseline space-x-1 text-white">
                  <span className="text-lg font-semibold">45</span>
                  <span className="text-[10px] text-zinc-400">g</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: recordingState === 'done' ? '66%' : 0 }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-[#ec5b13]"></motion.div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select 
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-xl py-4 pl-4 pr-8 focus:outline-none focus:border-[#ec5b13]/50"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirmVoice}
              disabled={isPublished}
              className={`flex-[2] font-bold py-4 rounded-xl text-sm uppercase tracking-widest transition-colors ${isPublished ? 'bg-emerald-500 text-white' : 'bg-[#ec5b13] text-white'}`}
            >
              {isPublished ? 'Confirmada' : 'Confirmar'}
            </motion.button>
          </div>
        </section>
      </main>
    </motion.div>
  );
}
