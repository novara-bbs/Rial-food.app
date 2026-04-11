import React from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { Check, Palette, Layout, Moon, Sun, Smartphone, ChevronRight, User, Bell, Shield, HelpCircle, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsView() {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; name: string; description: string; color: string; bg: string }[] = [
    { id: 'default', name: 'RIAL Default', description: 'High-contrast slate and lime.', color: '#d4ff00', bg: '#0f172a' },
    { id: 'blue', name: 'Calm Modern Blue', description: 'Clean, trustworthy, and modern.', color: '#3b82f6', bg: '#0f172a' },
    { id: 'earth', name: 'Earth & Data', description: 'Warm terracotta and deep forest.', color: '#e2725b', bg: '#2a2421' },
    { id: 'nature', name: 'Soft Nature', description: 'Organic emerald and deep greens.', color: '#10b981', bg: '#064e3b' },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background-dark text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight font-display text-white">Settings</h1>
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">Customize your experience</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-10 mt-4">
        {/* Brand & Theme */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <h3 className="text-xl font-bold font-display text-white">Brand & Theme</h3>
          </div>
          
          <div className="grid gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center justify-between p-5 rounded-3xl border transition-all group relative overflow-hidden ${
                  theme === t.id 
                    ? 'border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(20,184,166,0.1)]' 
                    : 'border-white/5 bg-surface-dark hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {theme === t.id && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
                )}
                <div className="flex items-center gap-5 relative z-10">
                  <div 
                    className="size-12 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden"
                    style={{ backgroundColor: t.bg, border: `1px solid ${t.color}40` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: t.color }} />
                  </div>
                  <div className="text-left">
                    <p className={`font-bold font-display text-lg mb-1 transition-colors ${theme === t.id ? 'text-primary' : 'text-white group-hover:text-slate-200'}`}>{t.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{t.description}</p>
                  </div>
                </div>
                {theme === t.id && (
                  <div className="size-8 rounded-full bg-primary text-background-dark flex items-center justify-center shadow-[0_0_10px_rgba(20,184,166,0.5)] relative z-10">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Display Mode */}
        <section className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <h3 className="text-xl font-bold font-display text-white">Display Mode</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <button className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-primary/5 border border-primary/30 text-primary shadow-[0_0_15px_rgba(20,184,166,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-full blur-xl" />
              <Moon className="w-6 h-6 relative z-10" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest relative z-10">Dark</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-surface-dark border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-colors">
              <Sun className="w-6 h-6" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Light</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-surface-dark border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-colors">
              <Smartphone className="w-6 h-6" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">System</span>
            </button>
          </div>
        </section>

        {/* Account & Preferences */}
        <section className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <h3 className="text-xl font-bold font-display text-white">Account & Preferences</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: User, label: 'Profile Settings' },
              { icon: Bell, label: 'Notifications' },
              { icon: Shield, label: 'Privacy & Security' },
              { icon: HelpCircle, label: 'Help & Support' },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-5 rounded-3xl bg-surface-dark border border-white/5 hover:border-white/20 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4 text-slate-300 group-hover:text-white transition-colors">
                  <div className="size-10 rounded-xl bg-background-dark flex items-center justify-center border border-white/5 group-hover:border-white/10 group-hover:bg-white/5 transition-colors">
                    <item.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-bold font-display text-lg">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
