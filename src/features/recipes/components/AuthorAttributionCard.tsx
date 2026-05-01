/**
 * AuthorAttributionCard — R2.2 (R2 plan v2).
 *
 * Four variants cover all recipe-authorship contexts in RIAL:
 *
 * - `'card'`      RIAL Verified or published-by-chef SectionCard. Avatar + name +
 *                 role badge. Maps to Kitchen Stories author panel / NYT byline card.
 * - `'inline'`    Minimal byline text only — "por <name>". NYT Cooking pattern for
 *                 recipes in list / card contexts.
 * - `'savedDate'` Shows "Guardada el <date>" for user-saved recipes. Replaces the
 *                 absent attribution with a personal temporal anchor.
 * - `'creator'`   Verified creator badge with @handle and optional avatar. Wired in
 *                 R7 when `Recipe.verified === 'creator'` + `UserProfile.isVerifiedCreator`.
 *
 * The component is intentionally thin — it renders attribution chrome only; business
 * logic (follow toggle, navigation to creator profile) lives in the parent.
 */
import { CheckCircle2, User } from 'lucide-react';
import { useI18n } from '../../../i18n';
import SectionCard from '../../../components/SectionCard';

// ─── shared helpers ───────────────────────────────────────────────────────────

function formatSavedDate(iso: string | undefined, locale: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

// ─── types ────────────────────────────────────────────────────────────────────

export type AuthorVariant = 'card' | 'inline' | 'savedDate' | 'creator';

export interface AuthorAttributionCardProps {
  variant: AuthorVariant;
  /** Display name for the author / creator. */
  name?: string;
  /** Short role / team label shown under the name in `card` variant. */
  role?: string;
  /** Avatar image URL. Falls back to a placeholder icon when absent. */
  avatarUrl?: string;
  /** ISO timestamp used by the `savedDate` variant. */
  savedAt?: string;
  /** Creator @handle shown in `creator` variant. */
  handle?: string;
  className?: string;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function AuthorAttributionCard({
  variant,
  name,
  role,
  avatarUrl,
  savedAt,
  handle,
  className = '',
}: AuthorAttributionCardProps) {
  const { t, locale } = useI18n();

  // ── card ─────────────────────────────────────────────────────────────────
  if (variant === 'card') {
    return (
      <SectionCard padding="sm" spacing="none" className={`flex items-center gap-3 ${className}`}>
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-container flex-shrink-0 flex items-center justify-center border border-outline-variant/20">
          <User className="w-6 h-6 text-on-surface-variant" />
          {avatarUrl && (
            <img src={avatarUrl} alt={name ?? ''} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          )}
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <p className="font-headline font-bold text-sm text-tertiary uppercase tracking-widest truncate">
            {name ?? t.recipes.verifiedRial ?? 'RIAL Verified'}
          </p>
          <p className="font-label text-micro text-on-surface-variant uppercase tracking-widest mt-0.5">
            {role ?? t.recipes.verifiedRial ?? 'Equipo RIAL'}
          </p>
        </div>

        {/* Verified badge */}
        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" aria-label={t.recipes.verifiedRial ?? 'Verificada'} />
      </SectionCard>
    );
  }

  // ── creator ───────────────────────────────────────────────────────────────
  if (variant === 'creator') {
    return (
      <SectionCard padding="sm" spacing="none" className={`flex items-center gap-3 ${className}`}>
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-container flex-shrink-0 flex items-center justify-center border border-outline-variant/20">
          <User className="w-6 h-6 text-on-surface-variant" />
          {avatarUrl && (
            <img src={avatarUrl} alt={name ?? ''} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-headline font-bold text-sm text-tertiary uppercase tracking-widest truncate">
            {name}
          </p>
          {handle && (
            <p className="font-label text-micro text-on-surface-variant uppercase tracking-widest mt-0.5">
              @{handle}
            </p>
          )}
        </div>
        <span className="text-xs font-label uppercase tracking-widest text-primary border border-primary/30 rounded-full px-2 py-0.5">
          {t.recipes.verifiedCreator ?? 'Creator'}
        </span>
      </SectionCard>
    );
  }

  // ── savedDate ─────────────────────────────────────────────────────────────
  if (variant === 'savedDate') {
    const dateLabel = formatSavedDate(savedAt, locale);
    if (!dateLabel) return null;
    return (
      <p className={`font-label text-micro text-on-surface-variant uppercase tracking-widest px-6 ${className}`}>
        {t.recipes.savedOn ? t.recipes.savedOn.replace('{date}', dateLabel) : `Guardada el ${dateLabel}`}
      </p>
    );
  }

  // ── inline ────────────────────────────────────────────────────────────────
  return (
    <p className={`font-label text-sm text-on-surface-variant ${className}`}>
      {(t.recipes as any).by ?? 'por'}{' '}
      <strong className="text-tertiary">{name}</strong>
    </p>
  );
}
