import { useState } from "react";
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
        return <DiscoverView setCurrentView={setCurrentView} />;
      case "insights":
        return <InsightsView setCurrentView={setCurrentView} />;
      case "planner":
        return <PlannerView setCurrentView={setCurrentView} />;
      case "profile":
        return <ProfileView setCurrentView={setCurrentView} />;
      case "settings":
        return <SettingsView setCurrentView={setCurrentView} />;
      case "journal":
        return <JournalView setCurrentView={setCurrentView} />;
      case "shopping":
        return <ShoppingListView setCurrentView={setCurrentView} />;
      case "recipe":
        return <RecipeView setCurrentView={setCurrentView} />;
      case "dictionary":
        return <DictionaryView setCurrentView={setCurrentView} />;
      case "health":
        return <HealthIntelligenceView setCurrentView={setCurrentView} />;
      case "kitchen":
        return <KitchenHubView setCurrentView={setCurrentView} />;
      case "healthintel":
        return <RialHealthIntelView setCurrentView={setCurrentView} />;
      case "master":
        return <RialMasterView setCurrentView={setCurrentView} />;
      case "biometric":
        return <BiometricMatchView setCurrentView={setCurrentView} />;
      case "scan":
        return <RealMatchScanView setCurrentView={setCurrentView} />;
      case "result":
        return <RealMatchResultView setCurrentView={setCurrentView} />;
      case "plandiscovery":
        return <PlanDiscoveryView setCurrentView={setCurrentView} />;
      case "kitcheninventory":
        return <KitchenInventoryView setCurrentView={setCurrentView} />;
      case "challengedetail":
        return <ChallengeDetailView setCurrentView={setCurrentView} />;
      case "biometriclab":
        return <BiometricLabView setCurrentView={setCurrentView} />;
      case "humanedgeprofile":
        return <HumanEdgeProfileView setCurrentView={setCurrentView} />;
      default:
        return <HomeView setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden transition-colors duration-300">
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
