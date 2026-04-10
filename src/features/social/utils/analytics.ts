/**
 * Track recipe view count.
 */
export function trackRecipeView(recipeId: string) {
  const key = 'recipeAnalytics';
  const raw = localStorage.getItem(key);
  const analytics: Record<string, { views: number; saves: number; likes: number }> = raw ? JSON.parse(raw) : {};
  if (!analytics[recipeId]) analytics[recipeId] = { views: 0, saves: 0, likes: 0 };
  analytics[recipeId].views++;
  localStorage.setItem(key, JSON.stringify(analytics));
}

/**
 * Track recipe save count.
 */
export function trackRecipeSave(recipeId: string) {
  const key = 'recipeAnalytics';
  const raw = localStorage.getItem(key);
  const analytics: Record<string, { views: number; saves: number; likes: number }> = raw ? JSON.parse(raw) : {};
  if (!analytics[recipeId]) analytics[recipeId] = { views: 0, saves: 0, likes: 0 };
  analytics[recipeId].saves++;
  localStorage.setItem(key, JSON.stringify(analytics));
}

/**
 * Get aggregate analytics for a creator's recipes.
 */
export function getCreatorAnalytics(recipes: any[]): { totalViews: number; totalSaves: number; topRecipes: { id: string; title: string; views: number }[] } {
  const raw = localStorage.getItem('recipeAnalytics');
  const analytics: Record<string, { views: number; saves: number; likes: number }> = raw ? JSON.parse(raw) : {};

  let totalViews = 0;
  let totalSaves = 0;
  const recipeStats: { id: string; title: string; views: number }[] = [];

  for (const recipe of recipes) {
    const id = String(recipe.id);
    const stats = analytics[id];
    if (stats) {
      totalViews += stats.views;
      totalSaves += stats.saves;
      recipeStats.push({ id, title: recipe.title, views: stats.views });
    }
  }

  recipeStats.sort((a, b) => b.views - a.views);

  return { totalViews, totalSaves, topRecipes: recipeStats.slice(0, 5) };
}
