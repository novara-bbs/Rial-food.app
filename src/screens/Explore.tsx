import { useState } from 'react';
import { useI18n } from '../i18n';
import Discovery from './Discovery';
import Community from './Community';
import Creadores from './Creadores';

export default function Explore({ onNavigateToRecipe, savedRecipes, onSaveRecipe, communityPosts, onAddComment }: { onNavigateToRecipe: (r: any) => void, savedRecipes?: any[], onSaveRecipe?: (r: any) => void, communityPosts?: any[], onAddComment?: (postId: number, comment: string) => void }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'recipes' | 'creators' | 'social'>('recipes');

  const tabs = [
    { id: 'recipes' as const, label: t.tabs.recipes },
    { id: 'creators' as const, label: t.tabs.creators },
    { id: 'social' as const, label: t.tabs.social },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-outline-variant/20 px-6 pt-2 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 font-headline text-xs font-bold tracking-widest uppercase transition-colors border-b-2 ${
              activeTab === tab.id ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-tertiary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto pt-4">
        {activeTab === 'recipes' && <Discovery onNavigateToRecipe={onNavigateToRecipe} savedRecipes={savedRecipes} onSaveRecipe={onSaveRecipe} />}
        {activeTab === 'creators' && <Creadores />}
        {activeTab === 'social' && <Community communityPosts={communityPosts} onAddComment={onAddComment} />}
      </div>
    </div>
  );
}
