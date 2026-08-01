import {
  HOG_LINE_Y,
  HOUSE_RADIUS,
  SIDE_LINE,
} from "@/lib/rink";

/** Front of house (12-ft edge toward hog) → hog line. */
const ZONE_START_Y = HOUSE_RADIUS;
const ZONE_END_Y = HOG_LINE_Y;
const ZONE_COUNT = 3;

const FILLS = [
  "rgba(26, 34, 44, 0.045)",
  "rgba(26, 34, 44, 0.08)",
  "rgba(26, 34, 44, 0.055)",
] as const;

export function GuardZones() {
  const span = ZONE_END_Y - ZONE_START_Y;
  const band = span / ZONE_COUNT;

  return (
    <g aria-hidden="true" style={{ pointerEvents: "none" }}>
      {Array.from({ length: ZONE_COUNT }, (_, i) => {
        // Zone 1 is furthest from the house (closest to the hog).
        const y = ZONE_END_Y - (i + 1) * band;
        const midY = y + band / 2;
        const label = i + 1;

        return (
          <g key={`zone-${label}`}>
            <rect
              x={-SIDE_LINE}
              y={y}
              width={SIDE_LINE * 2}
              height={band}
              fill={FILLS[i % FILLS.length]}
            />
            <line
              x1={-SIDE_LINE}
              y1={y}
              x2={SIDE_LINE}
              y2={y}
              stroke="rgba(26,34,44,0.08)"
              strokeWidth={0.03}
            />
            <text
              x={-SIDE_LINE + 0.35}
              y={midY + 0.18}
              fill="rgba(26,34,44,0.22)"
              fontSize={0.55}
              fontFamily="var(--font-display), var(--font-barlow-condensed), sans-serif"
              fontWeight={900}
              fontStyle="italic"
              letterSpacing={0.04}
            >
              {label}
            </text>
          </g>
        );
      })}
      <line
        x1={-SIDE_LINE}
        y1={ZONE_END_Y}
        x2={SIDE_LINE}
        y2={ZONE_END_Y}
        stroke="rgba(26,34,44,0.08)"
        strokeWidth={0.03}
      />
    </g>
  );
}
