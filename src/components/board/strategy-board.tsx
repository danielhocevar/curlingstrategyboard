"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { createInitialRocks, type Rock } from "@/lib/rink";
import { Board2D } from "@/components/board/board-2d";
import {
  OptionsRail,
  type BoardOptions,
} from "@/components/board/options-rail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Board3D = dynamic(
  () => import("@/components/board/board-3d").then((m) => m.Board3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center font-mono text-[12px] text-muted-foreground">
        Loading 3D…
      </div>
    ),
  },
);

export function StrategyBoard() {
  const [rocks, setRocks] = useState<Rock[]>(() => createInitialRocks());
  const [mode, setMode] = useState("2d");
  const [options, setOptions] = useState<BoardOptions>({
    showGuardShades: false,
    neonRing: false,
  });

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background lg:flex-row">
      <OptionsRail options={options} onChange={setOptions} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Tabs
          value={mode}
          onValueChange={(value) => {
            if (typeof value === "string") setMode(value);
          }}
          className="flex h-full min-h-0 flex-col gap-0"
        >
          <div className="flex shrink-0 items-center justify-center border-b border-border px-4 py-3">
            <TabsList className="rounded-sm">
              <TabsTrigger value="2d" className="min-w-16 rounded-sm px-4">
                2D
              </TabsTrigger>
              <TabsTrigger value="3d" className="min-w-16 rounded-sm px-4">
                3D
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="2d" className="min-h-0 flex-1 overflow-hidden">
            <Board2D
              rocks={rocks}
              onRocksChange={setRocks}
              showGuardShades={options.showGuardShades}
              neonRing={options.neonRing}
            />
          </TabsContent>

          <TabsContent
            value="3d"
            className="relative min-h-0 flex-1 overflow-hidden"
          >
            {mode === "3d" ? <Board3D rocks={rocks} /> : null}
            <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 font-mono text-[11px] text-muted-foreground">
              Drag to orbit · Right-drag to pan · Scroll to zoom
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
