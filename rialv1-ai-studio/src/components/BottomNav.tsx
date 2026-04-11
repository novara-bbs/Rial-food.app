import { Home, Compass, Plus, Users, User } from "lucide-react";
import { cn } from "../lib/utils";

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function BottomNav({ currentView, setCurrentView }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "explore", icon: Compass, label: "Discover" },
    { id: "add", icon: Plus, label: "Add", isFab: true },
    { id: "insights", icon: Users, label: "Pulse" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-6 py-3 pb-safe z-50 transition-colors duration-300">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          if (item.isFab) {
            return (
              <div key={item.id} className="relative -top-6">
                <button
                  onClick={() => setCurrentView("planner")}
                  className="size-14 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-white dark:border-background-dark transition-transform active:scale-95"
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
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-slate-400 hover:text-primary"
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
