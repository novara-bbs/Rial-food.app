import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Camera, BookOpen, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const location = useLocation();
  
  const navItems = [
    { path: '/journal', icon: LayoutDashboard, label: 'Journal' },
    { path: '/planner', icon: Calendar, label: 'Planner' },
    { path: '/analyze', icon: Camera, label: 'Analyze', isFab: true },
    { path: '/cookbook', icon: BookOpen, label: 'Cookbook' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pb-20">
      <Outlet />
      
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-lg border-t border-zinc-800 px-6 py-3 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            if (item.isFab) {
              return (
                <Link key={item.path} to={item.path} className="relative -top-6">
                  <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform">
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                </Link>
              );
            }
            
            return (
              <Link key={item.path} to={item.path} className={cn("flex flex-col items-center gap-1 transition-colors", isActive ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300")}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
