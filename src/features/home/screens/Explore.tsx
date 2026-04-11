import { useState } from 'react';
import { useI18n } from '../../../i18n';
import TabNav from '../../../components/patterns/TabNav';
import Discovery from './Discovery';
import Community from '../../social/screens/Community';
import Discover from './Discover';

export default function Explore({ onNavigateToRecipe, savedRecipes, onSaveRecipe, communityPosts, onAddComment }: { onNavigateToRecipe: (r: any) => void, savedRecipes?: any[], onSaveRecipe?: (r: any) => void, communityPosts?: any[], onAddComment?: (postId: number, comment: string) => void }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'recipes' | 'feed' | 'discover'>('recipes');

  const tabs = [
    { id: 'recipes' as const, label: t.tabs.recipes },
    { id: 'feed' as const, label: t.tabs.feed || 'Feed' },
    { id: 'discover' as const, label: t.tabs.discover || 'Descubrir' },
  ];

  return (
    <div className="flex flex-col h-full">
      <TabNav tabs={tabs} active={activeTab} onChange={(id) => setActiveTab(id as typeof activeTab)} />
      <div className="flex-1 overflow-y-auto pt-4">
        {activeTab === 'recipes' && <Discovery onNavigateToRecipe={onNavigateToRecipe} savedRecipes={savedRecipes} onSaveRecipe={onSaveRecipe} />}
        {activeTab === 'feed' && <Community communityPosts={communityPosts} onAddComment={onAddComment} />}
        {activeTab === 'discover' && <Discover />}
      </div>
    </div>
  );
}
