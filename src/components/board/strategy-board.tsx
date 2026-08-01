"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { createInitialRocks, type Rock } from "@/lib/rink";
import { Board2D } from "@/components/board/board-2d";
import {
  OptionsRail,
  type BoardOptions,
  type ViewMode,
} from "@/components/board/options-rail";

const Board3D = dynamic(
  () => import("@/components/board/board-3d").then((m) => m.Board3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sport-sm text-[16px] text-muted-foreground">
        Loading 3D
      </div>
    ),
  },
);

export function StrategyBoard() {
  const [rocks, setRocks] = useState<Rock[]>(() => createInitialRocks());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("2d");
  const [options, setOptions] = useState<BoardOptions>({
    showGuardShades: false,
    neonRing: false,
    showGuardZones: false,
  });

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background lg:flex-row">
      <OptionsRail
        options={options}
        onChange={setOptions}
        mode={mode}
        onModeChange={setMode}
      />

      <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        {mode === "2d" ? (
          <Board2D
            rocks={rocks}
            onRocksChange={setRocks}
            selectedId={selectedId}
            onSelect={setSelectedId}
            showGuardShades={options.showGuardShades}
            showGuardZones={options.showGuardZones}
            neonRing={options.neonRing}
          />
        ) : (
          <>
            <Board3D
              rocks={rocks}
              selectedId={selectedId}
              onSelect={setSelectedId}
              showGuardShades={options.showGuardShades}
              showGuardZones={options.showGuardZones}
              neonRing={options.neonRing}
            />
            <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-sport-sm text-[14px] text-muted-foreground">
              Drag to orbit · Right-drag to pan · Scroll to zoom
            </p>
          </>
        )}
      </main>
    </div>
  );
}
