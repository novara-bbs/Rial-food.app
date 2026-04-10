import { useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import AvatarRing from './AvatarRing';
import { cleanExpiredStories } from '../handlers/story-handlers';
import type { Story } from '../../../types/social';

export default function StoryRingsRow() {
  const { t } = useI18n();
  const { communityStories } = useAppState();
  const { navigateTo } = useNavigation();

  const activeStories = useMemo(() => cleanExpiredStories(communityStories), [communityStories]);

  // Group by author — one ring per author (latest story)
  const authorStories = useMemo(() => {
    const map = new Map<string, Story>();
    for (const s of activeStories) {
      if (!map.has(s.authorId)) map.set(s.authorId, s);
    }
    // Sort: unviewed first
    return Array.from(map.values()).sort((a, b) => {
      const aViewed = a.viewedBy.includes('self');
      const bViewed = b.viewedBy.includes('self');
      if (aViewed !== bViewed) return aViewed ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [activeStories]);

  return (
    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-6 border-b border-outline-variant/10">
      {/* Your Story */}
      <AvatarRing
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        name={t.community.yourStory}
        showPlus
        onClick={() => navigateTo('create-story')}
      />
      {/* Other users' stories */}
      {authorStories.map(story => (
        <AvatarRing
          key={story.authorId}
          src={story.authorAvatar}
          name={story.authorName}
          hasStory
          storyViewed={story.viewedBy.includes('self')}
          onClick={() => {
            // store which story to view, then navigate
            navigateTo('story-viewer');
          }}
        />
      ))}
    </div>
  );
}
