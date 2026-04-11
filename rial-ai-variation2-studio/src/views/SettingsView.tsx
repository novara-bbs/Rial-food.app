import React from 'react';
import { ChevronRight, User, Bell, Shield, HelpCircle, Settings as SettingsIcon, Activity, Watch, Smartphone, Moon, Database, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  setCurrentView?: (view: string) => void;
}

export default function SettingsView({ setCurrentView }: SettingsViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-black text-white selection:bg-[#ddff00] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-6">
        <div className="flex items-center gap-4 max-w-3xl mx-auto">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentView?.('profile')}
            className="flex size-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold leading-tight font-display text-white tracking-tight">System Config</h1>
            <p className="text-[10px] text-[#ddff00] font-mono font-black uppercase tracking-widest mt-1">Global Preferences</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-12 mt-4">
        {/* Biometric Sync */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-[#ddff00]" />
            <h3 className="text-xl font-bold font-display text-white">Telemetry Sync</h3>
          </div>
          
          <div className="grid gap-4">
            {[
              { id: 'oura', name: 'Oura Ring', status: 'Connected', icon: Watch, active: true },
              { id: 'apple', name: 'Apple Health', status: 'Connected', icon: Smartphone, active: true },
              { id: 'whoop', name: 'Whoop', status: 'Not Connected', icon: Activity, active: false },
            ].map((device) => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={device.id}
                className={`flex items-center justify-between p-5 rounded-[24px] border transition-all group ${
                  device.active 
                    ? 'border-[#ddff00]/30 bg-[#ddff00]/5' 
                    : 'border-white/5 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`size-12 rounded-2xl flex items-center justify-center ${device.active ? 'bg-[#ddff00]/20 text-[#ddff00]' : 'bg-white/10 text-white/50'}`}>
                    <device.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold font-display text-lg text-white mb-1">{device.name}</p>
                    <p className={`text-[10px] font-mono font-black uppercase tracking-widest ${device.active ? 'text-[#ddff00]' : 'text-white/40'}`}>
                      {device.status}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${device.active ? 'bg-[#ddff00]' : 'bg-white/20'}`}>
                  <div className={`w-4 h-4 rounded-full bg-black transition-transform ${device.active ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Protocol Preferences */}
        <section className="space-y-6 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-[#ddff00]" />
            <h3 className="text-xl font-bold font-display text-white">Protocol Preferences</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
              <p className="text-[10px] font-mono font-black uppercase tracking-widest text-white/50 mb-2">Unit System</p>
              <div className="flex bg-black rounded-xl p-1 border border-white/10">
                <button className="flex-1 py-2 text-sm font-bold bg-white/10 rounded-lg text-white">Metric</button>
                <button className="flex-1 py-2 text-sm font-bold text-white/50 hover:text-white transition-colors">Imperial</button>
              </div>
            </div>
            <div className="p-5 rounded-[24px] bg-white/5 border border-white/10">
              <p className="text-[10px] font-mono font-black uppercase tracking-widest text-white/50 mb-2">Time Format</p>
              <div className="flex bg-black rounded-xl p-1 border border-white/10">
                <button className="flex-1 py-2 text-sm font-bold bg-white/10 rounded-lg text-white">24h</button>
                <button className="flex-1 py-2 text-sm font-bold text-white/50 hover:text-white transition-colors">12h</button>
              </div>
            </div>
          </div>
        </section>

        {/* Account & Security */}
        <section className="space-y-6 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-[#ddff00]" />
            <h3 className="text-xl font-bold font-display text-white">Account & Security</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: User, label: 'Identity & Profile' },
              { icon: Bell, label: 'Alerts & Notifications' },
              { icon: Database, label: 'Data Export & Privacy' },
              { icon: HelpCircle, label: 'Support & Documentation' },
            ].map((item, i) => (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={i} 
                className="w-full flex items-center justify-between p-5 rounded-[24px] bg-white/5 border border-white/10 hover:border-[#ddff00]/30 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-4 text-white/70 group-hover:text-white transition-colors">
                  <div className="size-12 rounded-2xl bg-black flex items-center justify-center border border-white/10 group-hover:border-[#ddff00]/50 transition-colors">
                    <item.icon className="w-6 h-6 text-white/50 group-hover:text-[#ddff00] transition-colors" />
                  </div>
                  <span className="font-bold font-display text-lg">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#ddff00] transition-colors" />
              </motion.button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

