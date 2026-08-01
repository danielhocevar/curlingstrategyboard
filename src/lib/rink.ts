/** Regulation WCF sheet geometry in feet (hog line to house). */

export const SHEET_WIDTH = 14 + 2 / 12; // 14 ft 2 in between sidelines
export const HOG_TO_TEE = 21;
export const HOUSE_RADIUS = 6; // 12-foot circle
export const RING_8_RADIUS = 4;
export const RING_4_RADIUS = 2;
export const BUTTON_RADIUS = 0.5;
export const STONE_DIAMETER = 11.5 / 12; // 11.5 in
export const STONE_RADIUS = STONE_DIAMETER / 2;

/** Extra ice shown past the back line and past the hog line. */
export const BACK_MARGIN = 2.25;
export const HOG_MARGIN = 1.75;

/** Side racks outside the sidelines for staging rocks. */
export const RACK_GUTTER = 2.6;

export const VIEW_WIDTH = SHEET_WIDTH + RACK_GUTTER * 2;
export const VIEW_HEIGHT = BACK_MARGIN + HOUSE_RADIUS + HOG_TO_TEE + HOG_MARGIN;

/**
 * Tee / button at (0, 0).
 * +y toward the back line (down the screen); -y toward the hog (up the screen).
 */
export const VIEW_MIN_X = -VIEW_WIDTH / 2;
export const VIEW_MAX_X = VIEW_WIDTH / 2;
export const VIEW_MIN_Y = -(HOG_TO_TEE + HOG_MARGIN);
export const VIEW_MAX_Y = HOUSE_RADIUS + BACK_MARGIN;

export const HOG_LINE_Y = -HOG_TO_TEE;
export const TEE_LINE_Y = 0;
export const BACK_LINE_Y = HOUSE_RADIUS;
/** 12-ft ring edge facing the hog. */
export const HOUSE_FRONT_Y = -HOUSE_RADIUS;
export const SIDE_LINE = SHEET_WIDTH / 2;

/** Center of sheet, halfway between house front and hog line. */
export const LOGO_Y = (HOUSE_FRONT_Y + HOG_LINE_Y) / 2;
export const LOGO_SIZE = 5.2;
export const LOGO_CAPTION = "teamhocevar";

export type Team = "red" | "yellow";

export type Rock = {
  id: string;
  team: Team;
  number: number;
  x: number;
  y: number;
};

export type Marker = {
  id: string;
  team: Team;
  letter: string;
  x: number;
  y: number;
};

export const MARKER_RADIUS = STONE_RADIUS;

export function rackPosition(team: Team, number: number): { x: number; y: number } {
  const col = team === "red" ? -(SIDE_LINE + RACK_GUTTER * 0.55) : SIDE_LINE + RACK_GUTTER * 0.55;
  const startY = 1.2;
  const gap = STONE_DIAMETER + 0.28;
  // 1 at the top (toward hog), 8 at the bottom (toward house).
  return { x: col, y: startY - (8 - number) * gap };
}

/** Infinite source for team markers, past rock 1 toward the hog. */
export function markerPalettePosition(team: Team): { x: number; y: number } {
  const rock1 = rackPosition(team, 1);
  return { x: rock1.x, y: rock1.y - STONE_DIAMETER - 0.7 };
}

/** 0 → A, 25 → Z, 26 → AA */
export function indexToLetter(index: number): string {
  let n = index;
  let s = "";
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

export function nextMarkerLetter(markers: Marker[], team: Team): string {
  const used = new Set(
    markers.filter((m) => m.team === team).map((m) => m.letter),
  );
  let i = 0;
  while (used.has(indexToLetter(i))) i += 1;
  return indexToLetter(i);
}

export function createMarker(
  team: Team,
  letter: string,
  x: number,
  y: number,
): Marker {
  return {
    id: `marker-${team}-${letter}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    team,
    letter,
    x,
    y,
  };
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

export function clampMarkerPosition(x: number, y: number): { x: number; y: number } {
  const pad = MARKER_RADIUS + 0.05;
  return {
    x: Math.min(VIEW_MAX_X - pad, Math.max(VIEW_MIN_X + pad, x)),
    y: Math.min(VIEW_MAX_Y - pad, Math.max(VIEW_MIN_Y + pad, y)),
  };
}

/** True when the piece is on the ice between the sidelines. */
export function isOnSheet(x: number, y: number): boolean {
  return (
    Math.abs(x) <= SIDE_LINE &&
    y >= VIEW_MIN_Y &&
    y <= VIEW_MAX_Y
  );
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
    rock.y < HOUSE_FRONT_Y &&
    rock.y > HOG_LINE_Y
  );
}
