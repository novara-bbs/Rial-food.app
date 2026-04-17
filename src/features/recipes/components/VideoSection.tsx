import { ExternalLink, PlayCircle } from 'lucide-react';
import { parseVideoSource, platformLabel } from '../utils/videoEmbed';
import { openExternalVideo } from '../../../lib/platform';
import { useI18n } from '../../../i18n';

export interface VideoSectionProps {
  videoUrl: string | undefined | null;
  /** Optional override for the poster when we can't derive one (TikTok / IG) */
  posterFallback?: string;
}

/**
 * Recipe video. Strategy:
 * - YouTube → inline iframe (sandboxed, nocookie domain).
 * - Everything else → poster card + CTA that opens the source app via
 *   `openExternalVideo()`. On iOS/Android, Universal Links / App Links
 *   hand off to the TikTok or Instagram app when installed; web falls
 *   back to a new tab with `noopener,noreferrer`.
 *
 * Returns `null` for unrecognized / empty input so the parent can render
 * `{data.videoUrl && <VideoSection ... />}` without defensive checks.
 */
export default function VideoSection({ videoUrl, posterFallback }: VideoSectionProps) {
  const { t } = useI18n();
  const parsed = parseVideoSource(videoUrl);
  if (!parsed) return null;

  if (parsed.canEmbed && parsed.embedUrl) {
    return (
      <div className="mt-4 rounded-sm overflow-hidden border border-outline-variant/20">
        <div className="aspect-video bg-surface-container-low relative">
          <iframe
            src={parsed.embedUrl}
            title={`${platformLabel(parsed.platform)} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    );
  }

  const label = platformLabel(parsed.platform);
  const poster = parsed.posterUrl || posterFallback;

  return (
    <button
      type="button"
      onClick={() => openExternalVideo(parsed.watchUrl)}
      className="mt-4 w-full flex items-stretch gap-3 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/50 transition-colors overflow-hidden text-left"
    >
      <div className="relative w-24 h-24 shrink-0 bg-surface-container-highest flex items-center justify-center">
        {poster ? (
          <img
            src={poster}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <PlayCircle className="w-9 h-9 text-white drop-shadow" aria-hidden="true" />
        </div>
      </div>
      <div className="flex-1 min-w-0 py-3 pr-3 flex flex-col justify-center">
        <span className="font-headline font-bold text-xs uppercase tracking-widest text-tertiary block truncate">
          {t.recipeDetail.watchOn.replace('{platform}', label)}
        </span>
        <span className="font-label text-micro text-on-surface-variant tracking-widest uppercase mt-0.5 block truncate">
          {t.recipeDetail.watchOnSubtitle.replace('{platform}', label)}
        </span>
      </div>
      <div className="flex items-center pr-3">
        <ExternalLink className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
      </div>
    </button>
  );
}
