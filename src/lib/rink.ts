/** Regulation WCF sheet geometry in feet (hog line to house). */

export const SHEET_WIDTH = 14 + 2 / 12; // 14 ft 2 in between sidelines
export const HOG_TO_TEE = 21;
export const HOUSE_RADIUS = 6; // 12-foot circle
export const RING_8_RADIUS = 4;
export const RING_4_RADIUS = 2;
export const BUTTON_RADIUS = 0.5;
export const STONE_DIAMETER = 11.5 / 12; // 11.5 in
export const STONE_RADIUS = STONE_DIAMETER / 2;

/** Extra ice shown past the back line and below the hog line. */
export const BACK_MARGIN = 2.25;
export const HOG_MARGIN = 1.75;

/** Side racks outside the sidelines for staging rocks. */
export const RACK_GUTTER = 2.6;

export const VIEW_WIDTH = SHEET_WIDTH + RACK_GUTTER * 2;
export const VIEW_HEIGHT = BACK_MARGIN + HOUSE_RADIUS + HOG_TO_TEE + HOG_MARGIN;

/** Tee / button at (0, 0). +y toward hog line (down the screen). */
export const VIEW_MIN_X = -VIEW_WIDTH / 2;
export const VIEW_MAX_X = VIEW_WIDTH / 2;
export const VIEW_MIN_Y = -(HOUSE_RADIUS + BACK_MARGIN);
export const VIEW_MAX_Y = HOG_TO_TEE + HOG_MARGIN;

export const BACK_LINE_Y = -HOUSE_RADIUS;
export const TEE_LINE_Y = 0;
export const HOG_LINE_Y = HOG_TO_TEE;
export const SIDE_LINE = SHEET_WIDTH / 2;

export type Team = "red" | "yellow";

export type Rock = {
  id: string;
  team: Team;
  number: number;
  x: number;
  y: number;
};

export function rackPosition(team: Team, number: number): { x: number; y: number } {
  const col = team === "red" ? -(SIDE_LINE + RACK_GUTTER * 0.55) : SIDE_LINE + RACK_GUTTER * 0.55;
  const startY = -1.2;
  const gap = STONE_DIAMETER + 0.28;
  return { x: col, y: startY + (number - 1) * gap };
}

export function createInitialRocks(): Rock[] {
  const rocks: Rock[] = [];
  for (const team of ["red", "yellow"] as const) {
    for (let n = 1; n <= 8; n++) {
      const { x, y } = rackPosition(team, n);
      rocks.push({ id: `${team}-${n}`, team, number: n, x, y });
    }
  }
  return rocks;
}

export function clampRockPosition(x: number, y: number): { x: number; y: number } {
  const pad = STONE_RADIUS + 0.05;
  return {
    x: Math.min(VIEW_MAX_X - pad, Math.max(VIEW_MIN_X + pad, x)),
    y: Math.min(VIEW_MAX_Y - pad, Math.max(VIEW_MIN_Y + pad, y)),
  };
}

export function formatFeet(value: number): string {
  const rounded = Math.abs(value) < 1 / 24 ? 0 : value;
  const sign = rounded < 0 ? "-" : "";
  const abs = Math.abs(rounded);
  const feet = Math.floor(abs);
  const inches = Math.round((abs - feet) * 12);
  if (inches === 12) return `${sign}${feet + 1}' 0"`;
  return `${sign}${feet}' ${inches}"`;
}

/** Guard: on the sheet, in front of the house (between house and hog). */
export function isGuard(rock: Rock): boolean {
  return (
    Math.abs(rock.x) <= SIDE_LINE &&
    rock.y > HOUSE_RADIUS &&
    rock.y < HOG_LINE_Y
  );
}
