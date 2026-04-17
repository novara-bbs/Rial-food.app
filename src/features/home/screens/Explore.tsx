import { useI18n } from '../../../i18n';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import TabNav from '../../../components/patterns/TabNav';
import Discovery from './Discovery';
import Community from '../../social/screens/Community';
import Discover from '../../social/screens/Discover';

/**
 * Explore tab host — three subtabs (recipes / feed / discover) share the
 * container. Subtab selection persists via `rial_exploreActiveTab` so switching
 * away to Home and back lands the user on the same view (Wave 3).
 *
 * Discover was relocated from `features/home/screens/` to `features/social/
 * screens/` in Wave 3 — feature-first alignment, since Discover is purely a
 * social discovery surface.
 */
export default function Explore({
  onNavigateToRecipe,
  savedRecipes,
  onSaveRecipe,
  communityPosts,
  onAddComment,
}: {
  onNavigateToRecipe: (r: any) => void;
  savedRecipes?: any[];
  onSaveRecipe?: (r: any) => void;
  communityPosts?: any[];
  onAddComment?: (postId: number, comment: string) => void;
}) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useLocalStorageState<'recipes' | 'feed' | 'discover'>('exploreActiveTab', 'recipes');

  const tabs = [
    { id: 'recipes' as const, label: t.tabs.forYou },
    { id: 'feed' as const, label: t.tabs.feed },
    { id: 'discover' as const, label: t.tabs.discover },
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
