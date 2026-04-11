/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, Calendar, BookOpen, Mic, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import Recipes from './components/Recipes';
import Logger from './components/Logger';
import Profile from './components/Profile';
import { AppProvider, useAppContext } from './context/AppContext';

function AppContent() {
  const { activeTab, setActiveTab } = useAppContext();

  return (
    <div className="min-h-screen bg-[#1a0f0a] text-slate-100 font-sans selection:bg-[#ec5b13]/30">
      {/* Main Content Area */}
      <div className="pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <Dashboard />
            </motion.div>
          )}
          {activeTab === 'planner' && (
            <motion.div key="planner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <Planner />
            </motion.div>
          )}
          {activeTab === 'recipes' && (
            <motion.div key="recipes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <Recipes />
            </motion.div>
          )}
          {activeTab === 'logger' && (
            <motion.div key="logger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <Logger />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <Profile />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a0f0a]/90 backdrop-blur-lg border-t border-[#ec5b13]/20 px-4 pb-6 pt-3">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavItem icon={<Activity />} label="Stats" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Calendar />} label="Plan" isActive={activeTab === 'planner'} onClick={() => setActiveTab('planner')} />
          
          <div className="relative -top-8">
            <button 
              onClick={() => setActiveTab('logger')}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-[#ec5b13]/40 border-4 border-[#1a0f0a] hover:scale-105 transition-transform ${activeTab === 'logger' ? 'bg-white text-[#ec5b13]' : 'bg-[#ec5b13] text-white'}`}
            >
              <Mic className="w-6 h-6" />
            </button>
          </div>

          <NavItem icon={<BookOpen />} label="Recipes" isActive={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
          <NavItem icon={<User />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactElement, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 w-16 ${isActive ? 'text-[#ec5b13]' : 'text-slate-500 hover:text-slate-300'} transition-colors`}
    >
      {React.cloneElement(icon, { className: `w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}` })}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

