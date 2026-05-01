import { CheckCheck, Flame, MessageSquare, UserPlus, Repeat2, Bookmark, Trophy } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import EmptyState from '../../../components/EmptyState';
import PageHeader from '../../../components/patterns/PageHeader';
import type { Notification as NotificationType } from '../../../types/social';
import { Heading } from '@/components/ui/Typography';

const ICON_MAP: Record<string, React.ReactNode> = {
  like: <Flame className="w-4 h-4 text-primary" />,
  comment: <MessageSquare className="w-4 h-4 text-brand-secondary" />,
  follow: <UserPlus className="w-4 h-4 text-primary" />,
  repost: <Repeat2 className="w-4 h-4 text-on-surface-variant" />,
  recipe_save: <Bookmark className="w-4 h-4 text-primary" />,
  challenge: <Trophy className="w-4 h-4 text-brand-secondary" />,
};

export default function Notifications({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const {
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    setSelectedPostId,
    setSelectedCreatorId,
    setSelectedChallengeId,
  } = useAppState();
  const { navigateTo } = useNavigation();
  const notif = t.notifications;

  // Infer nav target from notification type. `targetId` on the Notification
  // type is the payload id (post id for like/comment/repost/recipe_save;
  // challenge id for challenge) while `fromUserId` is used for `follow` so
  // the user lands on the follower's profile.
  const handleOpenNotification = (n: NotificationType) => {
    if (!n.read) markNotificationRead(n.id);
    switch (n.type) {
      case 'like':
      case 'comment':
      case 'repost':
      case 'recipe_save':
        if (n.targetId) {
          const numericId = Number(n.targetId);
          if (!Number.isNaN(numericId)) {
            setSelectedPostId(numericId);
            navigateTo('post-detail');
          }
        }
        break;
      case 'follow':
        setSelectedCreatorId(n.fromUserId);
        navigateTo('creator-profile');
        break;
      case 'challenge':
        if (n.targetId) {
          setSelectedChallengeId(n.targetId);
          navigateTo('challenge-detail');
        }
        break;
    }
  };

  const grouped = useMemo(() => {
    const now = new Date();
    const today: NotificationType[] = [];
    const thisWeek: NotificationType[] = [];
    const earlier: NotificationType[] = [];

    for (const n of notifications) {
      const d = new Date(n.createdAt);
      const diff = now.getTime() - d.getTime();
      if (diff < 86400000) today.push(n);
      else if (diff < 604800000) thisWeek.push(n);
      else earlier.push(n);
    }
    return { today, thisWeek, earlier };
  }, [notifications]);

  const getDescription = (n: NotificationType) => {
    switch (n.type) {
      case 'like': return notif.liked;
      case 'comment': return notif.commented;
      case 'follow': return notif.followed;
      case 'repost': return notif.reposted;
      case 'recipe_save': return notif.savedRecipe;
      case 'challenge': return notif.challengeUpdate;
      default: return '';
    }
  };

  const renderGroup = (label: string, items: NotificationType[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1">
        <Heading level="h3" variant="overline" className="font-label text-micro tracking-[0.3em] text-on-surface-variant px-2 py-2">{label}</Heading>
        {items.map(n => (
          <button
            key={n.id}
            type="button"
            onClick={() => handleOpenNotification(n)}
            aria-label={`${n.fromUserName} ${getDescription(n)}`}
            className={`w-full flex items-center gap-3 p-3 rounded-sm text-left hover:bg-surface-container-highest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
          >
            <img src={n.fromUserAvatar} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-caption text-on-surface-variant">
                <span className="font-headline font-bold text-tertiary">{n.fromUserName}</span>{' '}
                {getDescription(n)}
              </p>
              {n.targetPreview && (
                <p className="text-micro text-on-surface-variant/70 truncate mt-0.5">{n.targetPreview}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {ICON_MAP[n.type]}
              {!n.read && <div className="w-2 h-2 bg-primary rounded-full" aria-hidden="true" />}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <PageShell maxWidth="narrow" spacing="md">
      <PageHeader
        onBack={onBack}
        title={notif.title}
        rightAction={notifications.some(n => !n.read) ? (
          <button type="button"
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 min-h-11 px-2 text-caption text-primary font-label tracking-widest uppercase hover:underline"
          >
            <CheckCheck className="w-4 h-4" /> {notif.markAllRead}
          </button>
        ) : undefined}
      />

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title={notif.title} description={notif.empty} />
      ) : (
        <div className="space-y-4">
          {renderGroup(notif.today, grouped.today)}
          {renderGroup(notif.thisWeek, grouped.thisWeek)}
          {renderGroup(notif.earlier, grouped.earlier)}
        </div>
      )}
    </PageShell>
  );
}
