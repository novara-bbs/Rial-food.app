import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Activity, BookOpen, Calendar } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-12 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 mb-6 shadow-2xl shadow-emerald-500/30">
            <Sparkles size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black tracking-tight">NutriAI</h1>
          <p className="text-lg text-zinc-400 font-medium leading-relaxed">Your intelligent companion for nutrition, meal planning, and recipe tracking.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FeatureCard icon={Activity} title="Track" desc="Daily macros & calories" color="text-emerald-400" />
          <FeatureCard icon={BookOpen} title="Cookbook" desc="AI-powered recipes" color="text-blue-400" />
          <FeatureCard icon={Calendar} title="Plan" desc="Weekly meal prep" color="text-amber-400" />
          <FeatureCard icon={Sparkles} title="Analyze" desc="Food from photos" color="text-purple-400" />
        </div>

        <Link 
          to="/journal" 
          className="group relative flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-zinc-50 text-zinc-950 font-black text-lg overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-zinc-50/10 active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
          Get Started
          <ArrowRight size={20} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-3xl flex flex-col items-center text-center gap-3 backdrop-blur-sm transition-transform hover:scale-105">
      <div className={`p-3 rounded-2xl bg-zinc-950 border border-zinc-800 ${color}`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="font-bold text-zinc-200">{title}</h3>
        <p className="text-xs text-zinc-500 font-medium mt-1">{desc}</p>
      </div>
    </div>
  );
}
