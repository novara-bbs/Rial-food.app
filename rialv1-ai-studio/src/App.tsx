import { useState } from "react";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { HomeView } from "./views/HomeView";
import { DiscoverView } from "./views/DiscoverView";
import { InsightsView } from "./views/InsightsView";
import { PlannerView } from "./views/PlannerView";
import { ProfileView } from "./views/ProfileView";
import SettingsView from "./views/SettingsView";
import { JournalView } from "./views/JournalView";
import { ShoppingListView } from "./views/ShoppingListView";
import { RecipeView } from "./views/RecipeView";
import { DictionaryView } from "./views/DictionaryView";
import { HealthIntelligenceView } from "./views/HealthIntelligenceView";
import { KitchenHubView } from "./views/KitchenHubView";
import { RialHealthIntelView } from "./views/RialHealthIntelView";
import { RialMasterView } from "./views/RialMasterView";
import { BiometricMatchView } from "./views/BiometricMatchView";
import { RealMatchScanView } from "./views/RealMatchScanView";
import { RealMatchResultView } from "./views/RealMatchResultView";
import { PlanDiscoveryView } from "./views/PlanDiscoveryView";
import { KitchenInventoryView } from "./views/KitchenInventoryView";
import { ChallengeDetailView } from "./views/ChallengeDetailView";
import { BiometricLabView } from "./views/BiometricLabView";
import { HumanEdgeProfileView } from "./views/HumanEdgeProfileView";
import { ThemeProvider } from "./contexts/ThemeContext";

function AppContent() {
  const [currentView, setCurrentView] = useState("home");

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomeView setCurrentView={setCurrentView} />;
      case "explore":
        return <DiscoverView />;
      case "insights":
        return <InsightsView />;
      case "planner":
        return <PlannerView />;
      case "profile":
        return <ProfileView />;
      case "settings":
        return <SettingsView />;
      case "journal":
        return <JournalView />;
      case "shopping":
        return <ShoppingListView />;
      case "recipe":
        return <RecipeView />;
      case "dictionary":
        return <DictionaryView />;
      case "health":
        return <HealthIntelligenceView />;
      case "kitchen":
        return <KitchenHubView />;
      case "healthintel":
        return <RialHealthIntelView />;
      case "master":
        return <RialMasterView />;
      case "biometric":
        return <BiometricMatchView />;
      case "scan":
        return <RealMatchScanView />;
      case "result":
        return <RealMatchResultView />;
      case "plandiscovery":
        return <PlanDiscoveryView />;
      case "kitcheninventory":
        return <KitchenInventoryView />;
      case "challengedetail":
        return <ChallengeDetailView />;
      case "biometriclab":
        return <BiometricLabView />;
      case "humanedgeprofile":
        return <HumanEdgeProfileView />;
      default:
        return <HomeView setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden transition-colors duration-300">
      <Header view={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        {renderView()}
      </div>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
