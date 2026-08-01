"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampRockPosition,
  rackPosition,
  type Rock,
  VIEW_HEIGHT,
  VIEW_MIN_X,
  VIEW_MIN_Y,
  VIEW_WIDTH,
} from "@/lib/rink";
import { GuardShades } from "@/components/board/guard-shades";
import { RinkSurface } from "@/components/board/rink-surface";
import { Rock as RockPiece, RockDefs } from "@/components/board/rock";

type DragState = {
  id: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

function clientToSvg(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const local = point.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}

type Board2DProps = {
  rocks: Rock[];
  onRocksChange: (rocks: Rock[] | ((prev: Rock[]) => Rock[])) => void;
  showGuardShades?: boolean;
  neonRing?: boolean;
};

export function Board2D({
  rocks,
  onRocksChange,
  showGuardShades = false,
  neonRing = false,
}: Board2DProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const returnToRack = useCallback(
    (id: string) => {
      onRocksChange((prev) =>
        prev.map((rock) => {
          if (rock.id !== id) return rock;
          const pos = rackPosition(rock.team, rock.number);
          return { ...rock, ...pos };
        }),
      );
    },
    [onRocksChange],
  );

  const onRockPointerDown = useCallback(
    (rock: Rock, event: React.PointerEvent<SVGGElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const svg = svgRef.current;
      if (!svg) return;

      const point = clientToSvg(svg, event.clientX, event.clientY);
      setSelectedId(rock.id);
      setDrag({
        id: rock.id,
        pointerId: event.pointerId,
        offsetX: rock.x - point.x,
        offsetY: rock.y - point.y,
      });
    },
    [],
  );

  useEffect(() => {
    if (!drag) return;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== drag.pointerId) return;
      const svg = svgRef.current;
      if (!svg) return;

      const point = clientToSvg(svg, event.clientX, event.clientY);
      const next = clampRockPosition(
        point.x + drag.offsetX,
        point.y + drag.offsetY,
      );

      onRocksChange((prev) =>
        prev.map((rock) =>
          rock.id === drag.id ? { ...rock, x: next.x, y: next.y } : rock,
        ),
      );
    };

    const endDrag = (event: PointerEvent) => {
      if (event.pointerId !== drag.pointerId) return;
      setDrag(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [drag, onRocksChange]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedId(null);
        return;
      }
      if (
        (event.key === "Backspace" || event.key === "Delete") &&
        selectedId
      ) {
        event.preventDefault();
        returnToRack(selectedId);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [returnToRack, selectedId]);

  return (
    <div className="flex h-full w-full items-center justify-center p-3 sm:p-5 lg:p-8">
      <svg
        ref={svgRef}
        viewBox={`${VIEW_MIN_X} ${VIEW_MIN_Y} ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        width={VIEW_WIDTH * 24}
        height={VIEW_HEIGHT * 24}
        className="max-h-full max-w-full select-none drop-shadow-[0_16px_40px_rgba(26,34,44,0.12)]"
        preserveAspectRatio="xMidYMid meet"
        role="application"
        aria-label="Curling strategy board 2D"
        onPointerDown={() => setSelectedId(null)}
      >
        <RockDefs />
        <RinkSurface />
        {showGuardShades ? <GuardShades rocks={rocks} /> : null}
        {[...rocks]
          .sort((a, b) => {
            if (a.id === drag?.id) return 1;
            if (b.id === drag?.id) return -1;
            if (a.id === selectedId) return 1;
            if (b.id === selectedId) return -1;
            return 0;
          })
          .map((rock) => (
            <RockPiece
              key={rock.id}
              rock={rock}
              selected={rock.id === selectedId}
              dragging={rock.id === drag?.id}
              neonRing={neonRing && rock.id === selectedId}
              onPointerDown={(event) => onRockPointerDown(rock, event)}
            />
          ))}
      </svg>
    </div>
  );
}
