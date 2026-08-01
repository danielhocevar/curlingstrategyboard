import type { Rock as RockType } from "@/lib/rink";
import { STONE_RADIUS } from "@/lib/rink";
import { cn } from "@/lib/utils";

const TEAM_FILL = {
  red: {
    handle: "#c23b3b",
    handleEdge: "#8f2a2a",
    text: "#ffffff",
  },
  yellow: {
    handle: "#d4a84b",
    handleEdge: "#a07a28",
    text: "#ffffff",
  },
} as const;

const RING = {
  greyOuter: "#4a515c",
  greyInner: "#6a7280",
  neonOuter: "#00c853",
  neonInner: "#39ff14",
} as const;

type RockProps = {
  rock: RockType;
  selected: boolean;
  dragging: boolean;
  neonRing?: boolean;
  onPointerDown: (event: React.PointerEvent<SVGGElement>) => void;
};

export function Rock({
  rock,
  selected,
  dragging,
  neonRing = false,
  onPointerDown,
}: RockProps) {
  const colors = TEAM_FILL[rock.team];
  const r = STONE_RADIUS;
  const handleR = r * 0.78;
  const ringOuter = neonRing ? RING.neonOuter : RING.greyOuter;
  const ringInner = neonRing ? RING.neonInner : RING.greyInner;

  return (
    <g
      transform={`translate(${rock.x}, ${rock.y})`}
      onPointerDown={onPointerDown}
      className={cn(
        "outline-none",
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
      style={{ touchAction: "none" }}
      role="button"
      tabIndex={0}
      aria-label={`${rock.team} rock ${rock.number}`}
      aria-pressed={selected}
    >
      {selected && !neonRing && (
        <circle
          r={r + 0.12}
          fill="none"
          stroke="rgba(58,111,154,0.9)"
          strokeWidth={0.05}
        />
      )}

      {/* Shadow */}
      <ellipse
        cx={0.04}
        cy={r * 0.55}
        rx={r * 0.92}
        ry={r * 0.28}
        fill="rgba(20,28,40,0.28)"
      />

      {/* Granite body — thin rim, regulation outer size */}
      <circle r={r} fill={ringOuter} />
      <circle r={r * 0.96} fill={ringInner} />
      {!neonRing && <circle r={r * 0.96} fill="url(#rock-shine)" />}

      {/* Handle */}
      <circle r={handleR} fill={colors.handleEdge} />
      <circle r={handleR * 0.9} fill={colors.handle} />

      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.text}
        fontSize={r * 1.1}
        fontWeight={700}
        fontFamily="var(--font-sans), system-ui, sans-serif"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {rock.number}
      </text>
    </g>
  );
}

export function RockDefs() {
  return (
    <defs>
      <radialGradient id="rock-shine" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
        <stop offset="55%" stopColor="rgba(255,255,255,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
      </radialGradient>
    </defs>
  );
}
