import { Search, Bell, Settings, ChevronLeft } from "lucide-react";

interface HeaderProps {
  view: string;
  setCurrentView: (view: string) => void;
}

export function Header({ view, setCurrentView }: HeaderProps) {
  if (view === "home") {
    return (
      <header className="sticky top-0 z-40 bg-slate-50 dark:bg-background-dark px-4 py-4 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xl leading-none">
              ∞
            </div>
            <h1 className="text-xl font-bold font-display tracking-tight">RIAL</h1>
          </div>
          <button onClick={() => setCurrentView('settings')} className="text-slate-900 dark:text-white hover:text-primary transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>
    );
  }

  if (view === "explore") {
    return (
      <header className="sticky top-0 z-40 bg-white dark:bg-background-dark px-4 py-4 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button className="text-primary">
            <Search className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold font-display leading-none">RIAL</h1>
            <p className="text-[10px] font-bold text-primary tracking-widest uppercase mt-0.5">Discovery</p>
          </div>
          <button className="text-slate-900 dark:text-white relative">
            <Bell className="w-6 h-6" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark" />
          </button>
        </div>
      </header>
    );
  }

  if (view === "settings") {
    return (
      <header className="sticky top-0 z-40 bg-slate-50 dark:bg-background-dark px-4 py-4 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button onClick={() => setCurrentView('home')} className="text-slate-900 dark:text-white hover:text-primary transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold font-display tracking-tight">Settings</h1>
          <div className="w-6 h-6" /> {/* Spacer for centering */}
        </div>
      </header>
    );
  }

  if (view === "profile") {
    return (
      <header className="sticky top-0 z-40 bg-slate-50 dark:bg-background-dark px-4 py-4 transition-colors duration-300">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="w-6 h-6" /> {/* Spacer */}
          <h1 className="text-lg font-bold font-display tracking-tight">Profile</h1>
          <button onClick={() => setCurrentView('settings')} className="text-slate-900 dark:text-white hover:text-primary transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>
    );
  }

  // Default header
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 transition-colors duration-300">
      <div className="flex items-center justify-center max-w-md mx-auto">
        <h1 className="text-lg font-bold font-display tracking-tight capitalize">{view}</h1>
      </div>
    </header>
  );
}
