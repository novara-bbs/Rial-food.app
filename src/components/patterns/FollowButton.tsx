import { UserCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

/**
 * FollowButton — single source of truth for "Follow / Following" toggle across
 * the app ([1.5.111]). Wraps the canonical <Button> primitive so the visual
 * language (font, padding, height) stays in sync with every other CTA.
 *
 * - `isFollowing=false` → solid primary "Follow" with UserPlus icon.
 * - `isFollowing=true`  → outline "Following" with UserCheck icon.
 *
 * Replaces 3 hand-coded inline implementations (RecipeDetail creator strip,
 * CreatorProfile main CTA, Discover creator card status). Discover's case is
 * a status indicator inside a parent button and uses a `.badge-card` span
 * directly — not this primitive.
 */
export type FollowButtonProps = {
  isFollowing: boolean;
  onToggle: () => void;
  size?: 'sm' | 'default';
  className?: string;
};

export function FollowButton({
  isFollowing,
  onToggle,
  size = 'sm',
  className,
}: FollowButtonProps) {
  const { t } = useI18n();
  const label = isFollowing
    ? t.creatorProfile?.following ?? 'Following'
    : t.creatorProfile?.follow ?? 'Follow';

  return (
    <Button
      type="button"
      variant={isFollowing ? 'outline' : 'default'}
      size={size}
      onClick={onToggle}
      aria-pressed={isFollowing}
      className={cn('shrink-0', className)}
    >
      {isFollowing ? <UserCheck /> : <UserPlus />}
      {label}
    </Button>
  );
}
