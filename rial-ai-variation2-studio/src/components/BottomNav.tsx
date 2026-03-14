import { Home, Flame, Plus, Activity, User } from "lucide-react";
import { cn } from "../lib/utils";

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function BottomNav({ currentView, setCurrentView }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "kitchen", icon: Flame, label: "Fuel" },
    { id: "planner", icon: Plus, label: "Protocol", isFab: true },
    { id: "biometriclab", icon: Activity, label: "Lab" },
    { id: "humanedgeprofile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 pb-safe z-50 transition-colors duration-300">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          if (item.isFab) {
            return (
              <div key={item.id} className="relative -top-6">
                <button
                  onClick={() => setCurrentView("planner")}
                  className="size-14 bg-[#ddff00] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(221,255,0,0.3)] border-4 border-black transition-transform active:scale-95 hover:scale-105"
                >
                  <Icon className="text-black w-8 h-8" strokeWidth={2.5} />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-colors",
                isActive ? "text-[#ddff00]" : "text-white/40 hover:text-white/80"
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-mono font-black uppercase tracking-widest">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
