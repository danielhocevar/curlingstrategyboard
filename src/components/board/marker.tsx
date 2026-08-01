import {
  MARKER_RADIUS,
  type Marker as MarkerType,
  type Team,
} from "@/lib/rink";
import { cn } from "@/lib/utils";

const TEAM_STYLE = {
  red: {
    fill: "rgba(193, 59, 59, 0.28)",
    stroke: "#c23b3b",
    cross: "#9f2d2d",
    text: "#ffffff",
    outline: "#7a1f1f",
  },
  yellow: {
    fill: "rgba(212, 168, 75, 0.32)",
    stroke: "#d4a84b",
    cross: "#a07a28",
    text: "#ffffff",
    outline: "#6e5314",
  },
} as const;

type MarkerPieceProps = {
  marker: MarkerType;
  selected: boolean;
  dragging: boolean;
  onPointerDown: (event: React.PointerEvent<SVGGElement>) => void;
};

export function MarkerPiece({
  marker,
  selected,
  dragging,
  onPointerDown,
}: MarkerPieceProps) {
  const style = TEAM_STYLE[marker.team];
  const r = MARKER_RADIUS;
  const arm = r * 1.15;

  return (
    <g
      transform={`translate(${marker.x}, ${marker.y})`}
      onPointerDown={onPointerDown}
      className={cn(
        "outline-none",
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
      style={{ touchAction: "none" }}
      role="button"
      tabIndex={0}
      aria-label={`${marker.team} marker ${marker.letter}`}
      aria-pressed={selected}
    >
      {selected ? (
        <circle
          r={r + 0.14}
          fill="none"
          stroke="rgba(58,111,154,0.9)"
          strokeWidth={0.05}
        />
      ) : null}

      <circle r={r} fill={style.fill} stroke={style.stroke} strokeWidth={0.045} />

      <line
        x1={0}
        y1={-arm}
        x2={0}
        y2={arm}
        stroke={style.cross}
        strokeWidth={0.05}
        strokeLinecap="round"
      />
      <line
        x1={-arm}
        y1={0}
        x2={arm}
        y2={0}
        stroke={style.cross}
        strokeWidth={0.05}
        strokeLinecap="round"
      />

      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill={style.text}
        stroke={style.outline}
        strokeWidth={r * 0.14}
        paintOrder="stroke fill"
        fontSize={r * 1.15}
        fontWeight={800}
        fontFamily="var(--font-sans), system-ui, sans-serif"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {marker.letter}
      </text>
    </g>
  );
}

type MarkerPaletteProps = {
  team: Team;
  x: number;
  y: number;
  onPointerDown: (event: React.PointerEvent<SVGGElement>) => void;
};

/** Infinite source — drag out to place a new labelled marker. */
export function MarkerPalette({
  team,
  x,
  y,
  onPointerDown,
}: MarkerPaletteProps) {
  const style = TEAM_STYLE[team];
  const r = MARKER_RADIUS;
  const arm = r * 1.15;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onPointerDown={onPointerDown}
      className="cursor-grab outline-none"
      style={{ touchAction: "none" }}
      role="button"
      tabIndex={0}
      aria-label={`Add ${team} marker`}
    >
      <circle
        r={r}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={0.05}
        strokeDasharray="0.12 0.1"
      />
      <line
        x1={0}
        y1={-arm}
        x2={0}
        y2={arm}
        stroke={style.cross}
        strokeWidth={0.05}
        strokeLinecap="round"
      />
      <line
        x1={-arm}
        y1={0}
        x2={arm}
        y2={0}
        stroke={style.cross}
        strokeWidth={0.05}
        strokeLinecap="round"
      />
      <text
        y={r + 0.42}
        textAnchor="middle"
        fill="rgba(26,34,44,0.45)"
        fontSize={0.32}
        fontWeight={800}
        fontFamily="var(--font-display), var(--font-barlow-condensed), sans-serif"
        fontStyle="italic"
        letterSpacing={0.04}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        MARKER
      </text>
    </g>
  );
}
