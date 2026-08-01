"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type BoardOptions = {
  showGuardShades: boolean;
  neonRing: boolean;
};

type OptionsRailProps = {
  options: BoardOptions;
  onChange: (next: BoardOptions) => void;
};

export function OptionsRail({ options, onChange }: OptionsRailProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card lg:h-full lg:w-[220px] lg:border-r lg:border-b-0">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[13px] font-medium tracking-tight text-foreground">
          Options
        </div>
        <div className="mt-0.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
          Display
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Label
              htmlFor="guard-shades"
              className="text-[13px] font-medium text-foreground"
            >
              Guard lanes
            </Label>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Shade from each guard rock back to the house.
            </p>
          </div>
          <Switch
            id="guard-shades"
            checked={options.showGuardShades}
            onCheckedChange={(checked) =>
              onChange({ ...options, showGuardShades: checked })
            }
            className="mt-0.5 shrink-0"
          />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Label
              htmlFor="neon-ring"
              className="text-[13px] font-medium text-foreground"
            >
              Neon ring
            </Label>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Selected rock uses a bright neon green band.
            </p>
          </div>
          <Switch
            id="neon-ring"
            checked={options.neonRing}
            onCheckedChange={(checked) =>
              onChange({ ...options, neonRing: checked })
            }
            className="mt-0.5 shrink-0"
          />
        </div>
      </div>
    </aside>
  );
}
