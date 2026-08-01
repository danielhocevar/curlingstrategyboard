import {
  BACK_LINE_Y,
  isGuard,
  STONE_DIAMETER,
  STONE_RADIUS,
  type Rock,
} from "@/lib/rink";

const SHADE = {
  red: "rgba(194, 59, 59, 0.18)",
  yellow: "rgba(212, 168, 75, 0.22)",
} as const;

type GuardShadesProps = {
  rocks: Rock[];
};

export function GuardShades({ rocks }: GuardShadesProps) {
  const guards = rocks.filter(isGuard);

  return (
    <g aria-hidden="true" style={{ pointerEvents: "none" }}>
      {guards.map((rock) => {
        const y1 = Math.min(rock.y, BACK_LINE_Y);
        const y2 = Math.max(rock.y, BACK_LINE_Y);
        const height = y2 - y1;
        if (height <= 0) return null;

        return (
          <rect
            key={`shade-${rock.id}`}
            x={rock.x - STONE_RADIUS}
            y={y1}
            width={STONE_DIAMETER}
            height={height}
            fill={SHADE[rock.team]}
          />
        );
      })}
    </g>
  );
}
