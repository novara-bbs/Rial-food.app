/**
 * Canonical sparkline chart — Q13.
 *
 * Extracted from `RitmoSection.tsx` (internal Sparkline) and the inline
 * SVG path builder in `Progress.tsx`. Used by Ritmo section, Progress
 * body weight chart and Home ProgressPreviewCard.
 *
 * Supports gapped series (null values) via multi-segment SVG paths so
 * missing days don't warp the curve.
 */

interface SparklineProps {
  /** Series values. `null` draws a gap between neighbouring points. */
  values: Array<number | null>;
  /** CSS colour variable, e.g. "var(--primary)". Defaults to the primary accent. */
  color?: string;
  /** SVG viewBox width. Layout is responsive via `w-full`. */
  width?: number;
  /** SVG viewBox height. Defaults to 36 (compact sparkline). */
  height?: number;
  /** Stroke width for the line. */
  strokeWidth?: number;
  /** Dot radius on each defined point. Set to 0 to disable dots. */
  dotRadius?: number;
  /** Tailwind height utility applied to the `<svg>` element. */
  svgClassName?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
}

export default function Sparkline({
  values,
  color = 'var(--primary)',
  width = 280,
  height = 36,
  strokeWidth = 1.8,
  dotRadius = 1.8,
  svgClassName = 'w-full h-9',
  ariaLabel,
}: SparklineProps) {
  const PAD = Math.max(2, Math.min(strokeWidth + 1, 6));

  const numeric = values.filter((v): v is number => v != null);
  const hasPoints = numeric.length >= 2;
  const min = hasPoints ? Math.min(...numeric) : 0;
  const max = hasPoints ? Math.max(...numeric) : 1;
  const range = max - min || 1;

  const denom = Math.max(1, values.length - 1);
  const pts = values.map((v, i) => {
    const x = PAD + (i / denom) * (width - 2 * PAD);
    if (v == null) return null;
    const y = PAD + (1 - (v - min) / range) * (height - 2 * PAD);
    return { x, y };
  });

  let path = '';
  let lastWasGap = true;
  for (const p of pts) {
    if (!p) { lastWasGap = true; continue; }
    path += lastWasGap ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`;
    lastWasGap = false;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={svgClassName}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {hasPoints && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {dotRadius > 0 && pts.map((p, i) => (p
        ? <circle key={i} cx={p.x} cy={p.y} r={dotRadius} fill={color} />
        : null))}
    </svg>
  );
}
