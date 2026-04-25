import { useI18n } from '../../../i18n';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface FeedTabsProps {
  forYouContent: React.ReactNode;
  followingContent: React.ReactNode;
  trendingContent: React.ReactNode;
}

/**
 * @deprecated Use the canonical `TabNav` primitive from
 * `components/patterns/TabNav` with controlled state (ADR-013). This
 * hardcodes 3 specific feeds and has no callers after `[1.5.86]`; kept only
 * as a reference until the next cleanup sprint.
 */
export default function FeedTabs({ forYouContent, followingContent, trendingContent }: FeedTabsProps) {
  const { t } = useI18n();
  const feed = t.feed;

  return (
    <Tabs defaultValue="forYou">
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="forYou" className="font-headline text-micro font-bold uppercase tracking-widest">{feed.forYou || 'For You'}</TabsTrigger>
        <TabsTrigger value="following" className="font-headline text-micro font-bold uppercase tracking-widest">{feed.following || 'Following'}</TabsTrigger>
        <TabsTrigger value="trending" className="font-headline text-micro font-bold uppercase tracking-widest">{feed.trending || 'Trending'}</TabsTrigger>
      </TabsList>
      <TabsContent value="forYou" className="mt-4">{forYouContent}</TabsContent>
      <TabsContent value="following" className="mt-4">{followingContent}</TabsContent>
      <TabsContent value="trending" className="mt-4">{trendingContent}</TabsContent>
    </Tabs>
  );
}
