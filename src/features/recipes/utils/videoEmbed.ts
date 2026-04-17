/**
 * Recipe video URL parsing.
 *
 * Centralizes the detection and embed/deep-link strategy for YouTube, TikTok,
 * Instagram (Reels/posts) and Vimeo. Used by `VideoSection` to decide between
 * inline iframe embed (YouTube) and link-out to the source app (TikTok, IG,
 * Vimeo, unknown). See the Fase 1 multi-media plan in CHANGELOG 1.5.24.
 *
 * Why `canEmbed` only for YouTube: TikTok's oEmbed renders inconsistently
 * inside the Capacitor WebView (script CSP + autoplay gating), and Instagram
 * oEmbed requires a registered Meta app plus review. Linking out to the
 * native app (via iOS Universal Links / Android App Links) gives a better
 * UX when the app is installed, and a plain web fallback otherwise.
 */
import type { ParsedVideo, VideoPlatform } from '../../../types/recipe';

const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);
const TIKTOK_HOSTS = new Set(['tiktok.com', 'www.tiktok.com', 'm.tiktok.com', 'vm.tiktok.com']);
const IG_HOSTS = new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com']);
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);

function extractYouTubeId(url: URL): string | undefined {
  if (url.hostname === 'youtu.be') {
    const id = url.pathname.replace(/^\/+/, '').split('/')[0];
    return id || undefined;
  }
  if (url.pathname.startsWith('/watch')) {
    return url.searchParams.get('v') || undefined;
  }
  const m = url.pathname.match(/^\/(?:embed|shorts|v)\/([a-zA-Z0-9_-]+)/);
  return m?.[1];
}

function extractTikTokId(url: URL): string | undefined {
  const m = url.pathname.match(/\/video\/(\d+)/);
  return m?.[1];
}

function extractInstagramId(url: URL): string | undefined {
  const m = url.pathname.match(/\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  return m?.[1];
}

function extractVimeoId(url: URL): string | undefined {
  const m = url.pathname.match(/^\/(?:video\/)?(\d+)/);
  return m?.[1];
}

/**
 * Parse a recipe `videoUrl` into platform metadata. Returns `null` for
 * empty/invalid input so callers can `if (!parsed) return null` tersely.
 */
export function parseVideoSource(raw: string | undefined | null): ParsedVideo | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const watchUrl = url.toString();

  if (YT_HOSTS.has(host)) {
    const id = extractYouTubeId(url);
    if (!id) return buildUnsupported('youtube', watchUrl);
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      videoId: id,
      posterUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      canEmbed: true,
    };
  }

  if (TIKTOK_HOSTS.has(host)) {
    const id = extractTikTokId(url);
    return {
      platform: 'tiktok',
      embedUrl: null,
      watchUrl,
      videoId: id,
      canEmbed: false,
    };
  }

  if (IG_HOSTS.has(host)) {
    const id = extractInstagramId(url);
    return {
      platform: 'instagram',
      embedUrl: null,
      watchUrl,
      videoId: id,
      canEmbed: false,
    };
  }

  if (VIMEO_HOSTS.has(host)) {
    const id = extractVimeoId(url);
    return {
      platform: 'vimeo',
      embedUrl: null,
      watchUrl,
      videoId: id,
      canEmbed: false,
    };
  }

  return buildUnsupported('other', watchUrl);
}

function buildUnsupported(platform: VideoPlatform, watchUrl: string): ParsedVideo {
  return { platform, embedUrl: null, watchUrl, canEmbed: false };
}

const PLATFORM_LABEL: Record<VideoPlatform, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  vimeo: 'Vimeo',
  other: 'Web',
};

export function platformLabel(platform: VideoPlatform): string {
  return PLATFORM_LABEL[platform];
}
