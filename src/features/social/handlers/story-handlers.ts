import type { Story, StorySlide } from '../../../types/social';

interface UserProfileLike {
  name?: string;
  avatar?: string | null;
}

interface StoryT {
  social: { anonymousUser: string };
}

export function createHandlePublishStory(deps: {
  setCommunityStories: (fn: Story[] | ((prev: Story[]) => Story[])) => void;
  navigateTo: (screen: string) => void;
  getUserProfile: () => UserProfileLike;
  getT: () => StoryT;
}) {
  return (slides: StorySlide[]) => {
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 3600000);
    const profile = deps.getUserProfile();
    const t = deps.getT();
    const authorName = (profile.name && profile.name.trim()) || t.social.anonymousUser;
    const authorAvatar = profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
    const story: Story = {
      id: `story-self-${Date.now()}`,
      authorId: 'self',
      authorName,
      authorAvatar,
      slides,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      viewedBy: [],
    };
    deps.setCommunityStories((prev: Story[]) => [story, ...prev]);
    deps.navigateTo('explore');
  };
}

export function createHandleMarkStoryViewed(deps: { setCommunityStories: (fn: Story[] | ((prev: Story[]) => Story[])) => void }) {
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
