"use client";

import { ArrowSquareOut } from "@phosphor-icons/react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type BoardOptions = {
  showGuardShades: boolean;
  neonRing: boolean;
  showGuardZones: boolean;
};

export type ViewMode = "2d" | "3d";

type OptionsRailProps = {
  id: string;
  open: boolean;
  options: BoardOptions;
  onChange: (next: BoardOptions) => void;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
};

const VIEW_MODES: ViewMode[] = ["2d", "3d"];

export function OptionsRail({
  id,
  open,
  options,
  onChange,
  mode,
  onModeChange,
}: OptionsRailProps) {
  return (
    <aside
      id={id}
      aria-label="Strategy board menu"
      aria-hidden={!open}
      inert={!open ? true : undefined}
      className={cn(
        "absolute inset-y-0 left-0 z-40 flex w-[min(100%,240px)] flex-col border-r border-border bg-card shadow-lg transition-transform duration-200 ease-out",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="border-b border-border py-4 pr-4 pl-14">
        <div className="text-sport pb-0.5 text-[34px] leading-[1.05] text-foreground">
          Curling
        </div>
        <div className="text-sport-sm text-[16px] text-foreground/70">
          Strategy Board
        </div>
      </div>

      <div className="border-b border-border px-4 py-4">
        <div className="text-sport-sm mb-2 text-[14px] text-muted-foreground">
          View
        </div>
        <div
          className="flex gap-1 rounded-sm border border-border bg-secondary/50 p-1"
          role="group"
          aria-label="Board view"
        >
          {VIEW_MODES.map((value) => {
            const active = mode === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onModeChange(value)}
                className={cn(
                  "text-sport-sm flex-1 rounded-sm px-2 py-2 text-[16px] transition-colors",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-pressed={active}
                tabIndex={open ? 0 : -1}
              >
                {value.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="text-sport-sm text-[14px] text-muted-foreground">
          Options
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Label
              htmlFor="guard-shades"
              className="text-sport-sm text-[17px] text-foreground"
            >
              Guard lanes
            </Label>
            <p className="text-[14px] leading-snug text-muted-foreground">
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
            tabIndex={open ? 0 : -1}
          />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Label
              htmlFor="guard-zones"
              className="text-sport-sm text-[17px] text-foreground"
            >
              Guard zones
            </Label>
            <p className="text-[14px] leading-snug text-muted-foreground">
              Three subtle bands in front of the house.
            </p>
          </div>
          <Switch
            id="guard-zones"
            checked={options.showGuardZones}
            onCheckedChange={(checked) =>
              onChange({ ...options, showGuardZones: checked })
            }
            className="mt-0.5 shrink-0"
            tabIndex={open ? 0 : -1}
          />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Label
              htmlFor="neon-ring"
              className="text-sport-sm text-[17px] text-foreground"
            >
              Neon ring
            </Label>
            <p className="text-[14px] leading-snug text-muted-foreground">
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
            tabIndex={open ? 0 : -1}
          />
        </div>
      </div>

      <div className="mt-auto border-t border-border px-4 py-4">
        <a
          href="https://www.instagram.com/teamhocevar/"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={open ? 0 : -1}
          className="flex items-center gap-3 rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src="/th_logo.svg"
            alt="Team Hocevar"
            width={44}
            height={44}
            className="size-11 shrink-0 object-contain"
          />
          <p className="min-w-0 text-[13px] leading-snug text-muted-foreground">
            Follow Team Hocevar on Instagram
            <ArrowSquareOut
              aria-hidden
              weight="bold"
              className="ml-1 inline-block size-3.5 -translate-y-px align-middle"
            />
          </p>
        </a>
      </div>
    </aside>
  );
}
