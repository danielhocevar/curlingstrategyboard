"use client";

import { List, X } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createInitialRocks, type Marker, type Rock } from "@/lib/rink";
import { Board2D } from "@/components/board/board-2d";
import {
  OptionsRail,
  type BoardOptions,
  type ViewMode,
} from "@/components/board/options-rail";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const SIDEBAR_ID = "options-sidebar";

export function StrategyBoard() {
  const [rocks, setRocks] = useState<Rock[]>(() => createInitialRocks());
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("2d");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [options, setOptions] = useState<BoardOptions>({
    showGuardShades: false,
    neonRing: false,
    showGuardZones: false,
  });

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-background">
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        className="absolute top-3 left-3 z-50 rounded-sm border-border bg-background/95 shadow-sm backdrop-blur-sm"
        aria-expanded={sidebarOpen}
        aria-controls={SIDEBAR_ID}
        onClick={() => setSidebarOpen((open) => !open)}
      >
        {sidebarOpen ? (
          <X weight="bold" className="size-5" aria-hidden />
        ) : (
          <List weight="bold" className="size-5" aria-hidden />
        )}
        <span className="sr-only">
          {sidebarOpen ? "Close menu" : "Open menu"}
        </span>
      </Button>

      <div
        className={cn(
          "absolute inset-0 z-40 bg-black/25 transition-opacity duration-200 lg:bg-black/10",
          sidebarOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <OptionsRail
        id={SIDEBAR_ID}
        open={sidebarOpen}
        options={options}
        onChange={setOptions}
        mode={mode}
        onModeChange={setMode}
      />

      <main className="relative h-full min-h-0 min-w-0 overflow-hidden">
        {mode === "2d" ? (
          <Board2D
            rocks={rocks}
            onRocksChange={setRocks}
            markers={markers}
            onMarkersChange={setMarkers}
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
              markers={markers}
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
