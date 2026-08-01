import {
  BACK_LINE_Y,
  BUTTON_RADIUS,
  HOG_LINE_Y,
  HOUSE_RADIUS,
  RING_4_RADIUS,
  RING_8_RADIUS,
  SIDE_LINE,
  TEE_LINE_Y,
  VIEW_HEIGHT,
  VIEW_MAX_Y,
  VIEW_MIN_X,
  VIEW_MIN_Y,
  VIEW_WIDTH,
} from "@/lib/rink";

export function RinkSurface() {
  return (
    <g aria-hidden="true">
      <defs>
        <radialGradient id="ice-glow" cx="50%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#f7f9fb" />
          <stop offset="55%" stopColor="#e8eef4" />
          <stop offset="100%" stopColor="#d5dde6" />
        </radialGradient>
        <linearGradient id="ice-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(120,140,160,0.08)" />
        </linearGradient>
        <pattern id="ice-grain" width="0.35" height="0.35" patternUnits="userSpaceOnUse">
          <circle cx="0.08" cy="0.12" r="0.015" fill="rgba(255,255,255,0.35)" />
          <circle cx="0.24" cy="0.28" r="0.012" fill="rgba(80,100,120,0.08)" />
        </pattern>
      </defs>

      {/* Sheet bed */}
      <rect
        x={VIEW_MIN_X}
        y={VIEW_MIN_Y}
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        fill="#eef1f5"
      />

      {/* Playing surface */}
      <rect
        x={-SIDE_LINE}
        y={VIEW_MIN_Y}
        width={SIDE_LINE * 2}
        height={VIEW_HEIGHT}
        fill="url(#ice-glow)"
      />
      <rect
        x={-SIDE_LINE}
        y={VIEW_MIN_Y}
        width={SIDE_LINE * 2}
        height={VIEW_HEIGHT}
        fill="url(#ice-sheen)"
      />
      <rect
        x={-SIDE_LINE}
        y={VIEW_MIN_Y}
        width={SIDE_LINE * 2}
        height={VIEW_HEIGHT}
        fill="url(#ice-grain)"
        opacity={0.55}
      />

      {/* Side racks (staging pads) */}
      <rect
        x={VIEW_MIN_X + 0.15}
        y={-1.6}
        width={2.1}
        height={8 * 1.25}
        rx={0.08}
        fill="rgba(26,34,44,0.03)"
        stroke="rgba(26,34,44,0.1)"
        strokeWidth={0.03}
      />
      <rect
        x={SIDE_LINE + 0.35}
        y={-1.6}
        width={2.1}
        height={8 * 1.25}
        rx={0.08}
        fill="rgba(26,34,44,0.03)"
        stroke="rgba(26,34,44,0.1)"
        strokeWidth={0.03}
      />

      {/* House rings */}
      <circle cx={0} cy={0} r={HOUSE_RADIUS} fill="#1a2f5a" />
      <circle cx={0} cy={0} r={RING_8_RADIUS} fill="#eef2f6" />
      <circle cx={0} cy={0} r={RING_4_RADIUS} fill="#b84545" />
      <circle cx={0} cy={0} r={BUTTON_RADIUS} fill="#eef2f6" />

      {/* Lines */}
      <line
        x1={-SIDE_LINE}
        y1={BACK_LINE_Y}
        x2={SIDE_LINE}
        y2={BACK_LINE_Y}
        stroke="#3a4555"
        strokeWidth={0.04}
      />
      <line
        x1={-SIDE_LINE}
        y1={TEE_LINE_Y}
        x2={SIDE_LINE}
        y2={TEE_LINE_Y}
        stroke="#3a4555"
        strokeWidth={0.035}
      />
      <line
        x1={0}
        y1={VIEW_MIN_Y}
        x2={0}
        y2={VIEW_MAX_Y}
        stroke="#3a4555"
        strokeWidth={0.03}
      />
      <line
        x1={-SIDE_LINE}
        y1={HOG_LINE_Y}
        x2={SIDE_LINE}
        y2={HOG_LINE_Y}
        stroke="#1a222c"
        strokeWidth={0.14}
      />

      {/* Sidelines */}
      <line
        x1={-SIDE_LINE}
        y1={VIEW_MIN_Y}
        x2={-SIDE_LINE}
        y2={VIEW_MAX_Y}
        stroke="#3a4555"
        strokeWidth={0.04}
      />
      <line
        x1={SIDE_LINE}
        y1={VIEW_MIN_Y}
        x2={SIDE_LINE}
        y2={VIEW_MAX_Y}
        stroke="#3a4555"
        strokeWidth={0.04}
      />

      {/* Line labels */}
      <text
        x={-SIDE_LINE + 0.2}
        y={HOG_LINE_Y - 0.28}
        fill="rgba(26,34,44,0.45)"
        fontSize={0.38}
        fontFamily="var(--font-mono), ui-monospace, monospace"
        letterSpacing={0.04}
      >
        HOG
      </text>
      <text
        x={-SIDE_LINE + 0.2}
        y={TEE_LINE_Y - 0.22}
        fill="rgba(26,34,44,0.4)"
        fontSize={0.32}
        fontFamily="var(--font-mono), ui-monospace, monospace"
        letterSpacing={0.04}
      >
        TEE
      </text>
      <text
        x={-SIDE_LINE + 0.2}
        y={BACK_LINE_Y - 0.22}
        fill="rgba(26,34,44,0.4)"
        fontSize={0.32}
        fontFamily="var(--font-mono), ui-monospace, monospace"
        letterSpacing={0.04}
      >
        BACK
      </text>
    </g>
  );
}
