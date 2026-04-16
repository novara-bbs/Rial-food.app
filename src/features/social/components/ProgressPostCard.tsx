import { TrendingDown, TrendingUp, Minus, Camera } from 'lucide-react';
import type { CommunityPost } from '../../../types/social';
import { bodyWeightFromKg, getBodyWeightUnit, type UnitSystem } from '../../food/utils/units';

interface ProgressPostCardProps {
  post: CommunityPost;
  unitSystem: UnitSystem;
  currentLabel: string;
  sinceLabel: string;
}

/**
 * Compact inline renderer for community posts of type `progress`.
 * Plugs into the existing feed list — callers decide wrapping/chrome.
 */
export default function ProgressPostCard({ post, unitSystem, currentLabel, sinceLabel }: ProgressPostCardProps) {
  if (post.type !== 'progress' || !post.progress) return null;
  const { currentKg, deltaKg, sinceDate, photoUrl } = post.progress;
  const unit = getBodyWeightUnit(unitSystem);
  const currentDisplay = bodyWeightFromKg(currentKg, unitSystem);
  const deltaDisplay = deltaKg != null ? bodyWeightFromKg(Math.abs(deltaKg), unitSystem).toFixed(1) : null;
  const DeltaIcon = deltaKg == null ? Minus : deltaKg < 0 ? TrendingDown : deltaKg > 0 ? TrendingUp : Minus;
  const deltaColor = deltaKg == null || deltaKg === 0
    ? 'text-on-surface-variant'
    : deltaKg < 0 ? 'text-primary' : 'text-brand-secondary';

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 flex gap-3">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          className="w-20 h-20 rounded-sm object-cover shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
          <Camera className="w-6 h-6 text-primary/60" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-baseline gap-3">
          <div>
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">
              {currentLabel}
            </span>
            <span className="font-headline font-black text-lg text-tertiary">
              {currentDisplay} {unit}
            </span>
          </div>
          {deltaDisplay !== null && (
            <div className={`flex items-center gap-0.5 text-[11px] font-bold ${deltaColor}`}>
              <DeltaIcon className="w-3.5 h-3.5" aria-hidden="true" />
              {deltaKg! > 0 ? '+' : deltaKg! < 0 ? '−' : ''}{deltaDisplay} {unit}
            </div>
          )}
        </div>
        {sinceDate && (
          <span className="text-[10px] text-on-surface-variant/80 block">
            {sinceLabel} {new Date(sinceDate + 'T12:00:00').toLocaleDateString(undefined, {
              day: 'numeric', month: 'short',
            })}
          </span>
        )}
        {post.content && (
          <p className="text-xs text-on-surface whitespace-pre-wrap">{post.content}</p>
        )}
      </div>
    </div>
  );
}
