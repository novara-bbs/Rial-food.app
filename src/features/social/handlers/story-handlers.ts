import type { Story, StorySlide } from '../../../types/social';

export function createHandlePublishStory(deps: { setCommunityStories: (fn: any) => void; navigateTo: (screen: string) => void }) {
  return (slides: StorySlide[]) => {
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 3600000);
    const story: Story = {
      id: `story-self-${Date.now()}`,
      authorId: 'self',
      authorName: 'Tú',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      slides,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      viewedBy: [],
    };
    deps.setCommunityStories((prev: Story[]) => [story, ...prev]);
    deps.navigateTo('explore');
  };
}

export function createHandleMarkStoryViewed(deps: { setCommunityStories: (fn: any) => void }) {
  return (storyId: string) => {
    deps.setCommunityStories((prev: Story[]) =>
      prev.map(s => s.id === storyId && !s.viewedBy.includes('self')
        ? { ...s, viewedBy: [...s.viewedBy, 'self'] }
        : s
      )
    );
  };
}

export function cleanExpiredStories(stories: Story[]): Story[] {
  const now = new Date().toISOString();
  return stories.filter(s => s.expiresAt > now);
}
