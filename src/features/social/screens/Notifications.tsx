import { CheckCheck, Flame, MessageSquare, UserPlus, Repeat2, Bookmark, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import EmptyState from '../../../components/EmptyState';
import PageHeader from '../../../components/patterns/PageHeader';
import type { Notification as NotificationType } from '../../../types/social';

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
  const { notifications, markAllNotificationsRead } = useAppState();
  const { navigateTo } = useNavigation();
  const notif = t.notifications;

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
      case 'like': return notif.liked || 'liked your post';
      case 'comment': return notif.commented || 'commented on your post';
      case 'follow': return notif.followed || 'started following you';
      case 'repost': return notif.reposted || 'reposted your post';
      case 'recipe_save': return notif.savedRecipe || 'saved your recipe';
      case 'challenge': return notif.challengeUpdate || 'challenge update';
      default: return '';
    }
  };

  const renderGroup = (label: string, items: NotificationType[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1">
        <h3 className="font-label text-[9px] tracking-[0.3em] text-on-surface-variant uppercase px-2 py-2">{label}</h3>
        {items.map(n => (
          <div
            key={n.id}
            className={`flex items-center gap-3 p-3 rounded-sm cursor-pointer hover:bg-surface-container-highest transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
          >
            <img src={n.fromUserAvatar} alt={n.fromUserName} className="w-10 h-10 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-on-surface-variant">
                <span className="font-headline font-bold text-tertiary">{n.fromUserName}</span>{' '}
                {getDescription(n)}
              </p>
              {n.targetPreview && (
                <p className="text-[10px] text-on-surface-variant/70 truncate mt-0.5">{n.targetPreview}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {ICON_MAP[n.type]}
              {!n.read && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="px-6 max-w-2xl mx-auto space-y-6 pb-24">
      <PageHeader
        onBack={onBack}
        title={notif.title || 'Notifications'}
        rightAction={notifications.some(n => !n.read) ? (
          <button type="button"
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 text-xs text-primary font-label tracking-widest uppercase hover:underline"
          >
            <CheckCheck className="w-4 h-4" /> {notif.markAllRead || 'Mark all read'}
          </button>
        ) : undefined}
      />

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title={notif.title || 'Notifications'} description={notif.empty || 'No notifications'} />
      ) : (
        <div className="space-y-4">
          {renderGroup(notif.today || 'Today', grouped.today)}
          {renderGroup(notif.thisWeek || 'This Week', grouped.thisWeek)}
          {renderGroup(notif.earlier || 'Earlier', grouped.earlier)}
        </div>
      )}
    </div>
  );
}
