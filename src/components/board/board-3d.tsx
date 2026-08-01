"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import {
  BACK_LINE_Y,
  BUTTON_RADIUS,
  HOG_LINE_Y,
  HOUSE_FRONT_Y,
  HOUSE_RADIUS,
  isGuard,
  LOGO_CAPTION,
  LOGO_SIZE,
  LOGO_Y,
  RACK_GUTTER,
  RING_4_RADIUS,
  RING_8_RADIUS,
  SIDE_LINE,
  STONE_DIAMETER,
  STONE_RADIUS,
  TEE_LINE_Y,
  MARKER_RADIUS,
  VIEW_HEIGHT,
  VIEW_MAX_Y,
  VIEW_MIN_Y,
  VIEW_WIDTH,
  type Marker,
  type Rock,
} from "@/lib/rink";

const ICE_Y = 0;
const STONE_HEIGHT = 0.42;
const HANDLE_HEIGHT = 0.14;
/** Keep sheet overlays on distinct heights to avoid z-fighting flicker. */
const RING_YS = [0.02, 0.035, 0.05, 0.065] as const;
const LINE_Y = ICE_Y + 0.08;
const BRAND_Y = ICE_Y + 0.1;
const ZONE_Y = ICE_Y + 0.12;
const LANE_Y = ICE_Y + 0.15;
const SHADOW_Y = ICE_Y + 0.01;

const TEAM_COLOR = {
  red: "#e11d2e",
  yellow: "#f5c518",
} as const;

const LANE_COLOR = {
  red: "#f07178",
  yellow: "#f0d56a",
} as const;

const ZONE_FILLS = ["#c8d4e4", "#b9c7db", "#c2d0e2"] as const;
const ZONE_COUNT = 3;
const ZONE_HOUSE_Y = HOUSE_FRONT_Y;
const ZONE_HOG_Y = HOG_LINE_Y;

const NEON = {
  outer: "#00c853",
  inner: "#39ff14",
} as const;

function RingDisc({
  innerRadius,
  outerRadius,
  color,
  y = RING_YS[0],
}: {
  innerRadius: number;
  outerRadius: number;
  color: string;
  y?: number;
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <ringGeometry args={[innerRadius, outerRadius, 96]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.35}
        metalness={0.05}
        clearcoat={0.35}
        clearcoatRoughness={0.4}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}

function LineMark({
  x1,
  z1,
  x2,
  z2,
  width = 0.07,
  color = "#111827",
}: {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  width?: number;
  color?: string;
}) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.hypot(dx, dz) || 0.01;
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  const angle = Math.atan2(dx, dz);

  return (
    <mesh position={[cx, LINE_Y, cz]} rotation={[0, angle, 0]}>
      <boxGeometry args={[width, 0.02, length]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  );
}

function GuardZones3D() {
  const span = ZONE_HOUSE_Y - ZONE_HOG_Y;
  const band = span / ZONE_COUNT;

  return (
    <group>
      {Array.from({ length: ZONE_COUNT }, (_, i) => {
        const z = ZONE_HOG_Y + i * band + band / 2;
        const label = i + 1;
        return (
          <group key={`zone3d-${label}`}>
            <mesh position={[0, ZONE_Y, z]} renderOrder={1}>
              <boxGeometry args={[SIDE_LINE * 2, 0.02, band * 0.98]} />
              <meshBasicMaterial
                color={ZONE_FILLS[i % ZONE_FILLS.length]}
                transparent
                opacity={0.42}
                depthWrite={false}
                polygonOffset
                polygonOffsetFactor={-2}
                polygonOffsetUnits={-2}
              />
            </mesh>
            <Text
              position={[-SIDE_LINE + 0.55, ZONE_Y + 0.04, z]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.75}
              color="#0f172a"
              fillOpacity={0.4}
              anchorX="left"
              anchorY="middle"
              fontWeight={800}
              renderOrder={2}
            >
              {String(label)}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function GuardLanes3D({ rocks }: { rocks: Rock[] }) {
  return (
    <group>
      {rocks.filter(isGuard).map((rock) => {
        const z1 = Math.min(rock.y, BACK_LINE_Y);
        const z2 = Math.max(rock.y, BACK_LINE_Y);
        const length = z2 - z1;
        if (length <= 0) return null;
        const cz = (z1 + z2) / 2;
        return (
          <mesh
            key={`lane3d-${rock.id}`}
            position={[rock.x, LANE_Y, cz]}
            renderOrder={3}
          >
            <boxGeometry args={[STONE_DIAMETER, 0.03, length]} />
            <meshBasicMaterial
              color={LANE_COLOR[rock.team]}
              transparent
              opacity={0.42}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-4}
              polygonOffsetUnits={-4}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function useInstagramIconTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = "#1a222c";
      ctx.fillStyle = "#1a222c";
      ctx.lineWidth = 10;
      const r = 28;
      ctx.beginPath();
      ctx.roundRect(18, 18, 92, 92, r);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(64, 64, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(92, 36, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** Rasterize an SVG onto a canvas texture without Suspense. */
function useImageTexture(url: string, size = 512) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const paint = (img: HTMLImageElement) => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      tex.needsUpdate = true;
      setTexture(tex);
    };

    void (async () => {
      try {
        const res = await fetch(url);
        let svg = await res.text();
        // width/height 100% often yields a 0×0 bitmap; force pixel size.
        svg = svg.replace(/<svg\b([^>]*)>/i, (_match, attrs: string) => {
          const cleaned = attrs
            .replace(/\swidth="[^"]*"/gi, "")
            .replace(/\sheight="[^"]*"/gi, "");
          return `<svg${cleaned} width="${size}" height="${size}">`;
        });
        objectUrl = URL.createObjectURL(
          new Blob([svg], { type: "image/svg+xml" }),
        );
        const img = new Image();
        img.onload = () => paint(img);
        img.src = objectUrl;
      } catch {
        const img = new Image();
        img.onload = () => paint(img);
        img.src = url;
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setTexture((prev) => {
        prev?.dispose();
        return null;
      });
    };
  }, [url, size]);

  return texture;
}

function useCaptionTexture(text: string) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a222c";
      ctx.font = "italic 800 72px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 8, canvas.height / 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [text]);
}

function ThLogo3D() {
  const texture = useImageTexture("/th_logo.svg", 512);
  const igTexture = useInstagramIconTexture();
  const captionTexture = useCaptionTexture(LOGO_CAPTION);

  // Slightly smaller than 2D so the full mark + caption fit in the default frame.
  const logoSize = LOGO_SIZE * 0.78;
  const captionGap = 0.3;
  const captionSize = 0.7;
  const iconSize = 0.68;
  const iconTextGap = 0.14;
  const textWidth = LOGO_CAPTION.length * captionSize * 0.52;
  const captionWidth = iconSize + iconTextGap + textWidth;
  const blockHeight = logoSize + captionGap + captionSize;
  // House-end camera (matches 2D): hog up-screen, house down-screen.
  // Logo toward hog, IG row below toward house.
  const blockCenterZ = LOGO_Y;
  const logoZ = blockCenterZ - blockHeight / 2 + logoSize / 2;
  const captionZ = blockCenterZ + blockHeight / 2 - captionSize / 2;
  const iconX = -captionWidth / 2 + iconSize / 2;
  const textX = -captionWidth / 2 + iconSize + iconTextGap + textWidth / 2;

  // Readable from behind the house looking toward the hog.
  const brandRot: [number, number, number] = [-Math.PI / 2, 0, 0];

  if (!texture) return null;

  return (
    <group>
      <mesh
        rotation={brandRot}
        position={[0, BRAND_Y, logoZ]}
        renderOrder={4}
      >
        <planeGeometry args={[logoSize, logoSize]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.3}
          depthWrite={false}
          depthTest
          toneMapped={false}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-6}
          polygonOffsetUnits={-6}
        />
      </mesh>
      <mesh
        rotation={brandRot}
        position={[iconX, BRAND_Y, captionZ]}
        renderOrder={4}
      >
        <planeGeometry args={[iconSize, iconSize]} />
        <meshBasicMaterial
          map={igTexture}
          transparent
          opacity={0.42}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-6}
          polygonOffsetUnits={-6}
        />
      </mesh>
      <mesh
        rotation={brandRot}
        position={[textX, BRAND_Y, captionZ]}
        renderOrder={4}
      >
        <planeGeometry args={[textWidth, captionSize]} />
        <meshBasicMaterial
          map={captionTexture}
          transparent
          opacity={0.42}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-6}
          polygonOffsetUnits={-6}
        />
      </mesh>
    </group>
  );
}

function useSideUrlTexture(text: string) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a222c";
      ctx.font = "700 120px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [text]);
}

function ApronSideText3D() {
  const texture = useSideUrlTexture("curlingstrategyboard.com");
  const sheetCenterZ = VIEW_MIN_Y + VIEW_HEIGHT / 2;
  const textLength = 22;
  const textHeight = 1.55;
  // Past the rock racks, on the grey apron beside the ice.
  const x = SIDE_LINE + RACK_GUTTER + 1.15;
  const y = ICE_Y - 0.02;

  return (
    <group>
      {/* Left / right — larger, facing outward away from the ice */}
      <mesh
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        position={[-x, y, sheetCenterZ]}
        renderOrder={1}
      >
        <planeGeometry args={[textLength, textHeight]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.34}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        position={[x, y, sheetCenterZ]}
        renderOrder={1}
      >
        <planeGeometry args={[textLength, textHeight]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.34}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Rink3D() {
  const sheetCenterZ = VIEW_MIN_Y + VIEW_HEIGHT / 2;

  return (
    <group>
      {/* Arena floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ICE_Y - 0.04, sheetCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[VIEW_WIDTH + 10, VIEW_HEIGHT + 10]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.95} />
      </mesh>

      <ApronSideText3D />

      {/* Ice sheet with clearcoat sheen */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ICE_Y, sheetCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[SIDE_LINE * 2, VIEW_HEIGHT]} />
        <meshPhysicalMaterial
          color="#f1f5f9"
          roughness={0.12}
          metalness={0.0}
          clearcoat={1}
          clearcoatRoughness={0.15}
          reflectivity={0.6}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>

      <RingDisc
        innerRadius={RING_8_RADIUS}
        outerRadius={HOUSE_RADIUS}
        color="#0b2a6b"
        y={RING_YS[0]}
      />
      <RingDisc
        innerRadius={RING_4_RADIUS}
        outerRadius={RING_8_RADIUS}
        color="#ffffff"
        y={RING_YS[1]}
      />
      <RingDisc
        innerRadius={BUTTON_RADIUS}
        outerRadius={RING_4_RADIUS}
        color="#dc2626"
        y={RING_YS[2]}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, RING_YS[3], 0]}
        receiveShadow
      >
        <circleGeometry args={[BUTTON_RADIUS, 48]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.2}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      <LineMark x1={-SIDE_LINE} z1={BACK_LINE_Y} x2={SIDE_LINE} z2={BACK_LINE_Y} />
      <LineMark x1={-SIDE_LINE} z1={TEE_LINE_Y} x2={SIDE_LINE} z2={TEE_LINE_Y} />
      <LineMark
        x1={-SIDE_LINE}
        z1={HOG_LINE_Y}
        x2={SIDE_LINE}
        z2={HOG_LINE_Y}
        width={0.16}
        color="#0f172a"
      />
      <LineMark
        x1={0}
        z1={VIEW_MIN_Y}
        x2={0}
        z2={VIEW_MIN_Y + VIEW_HEIGHT}
        width={0.05}
      />
      <LineMark
        x1={-SIDE_LINE}
        z1={VIEW_MIN_Y}
        x2={-SIDE_LINE}
        z2={VIEW_MIN_Y + VIEW_HEIGHT}
        width={0.05}
      />
      <LineMark
        x1={SIDE_LINE}
        z1={VIEW_MIN_Y}
        x2={SIDE_LINE}
        z2={VIEW_MIN_Y + VIEW_HEIGHT}
        width={0.05}
      />

      <ThLogo3D />
    </group>
  );
}

function useRockLabelTexture(number: number) {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 92px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 4;
      ctx.fillText(String(number), size / 2, size / 2 + 4);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [number]);
}

function RockLabel({ number, y }: { number: number; y: number }) {
  const texture = useRockLabelTexture(number);
  return (
    <sprite position={[0, y, 0]} scale={[0.72, 0.72, 0.72]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}

function NumberedRock({
  rock,
  selected,
  neonRing,
  onSelect,
}: {
  rock: Rock;
  selected: boolean;
  neonRing: boolean;
  onSelect: (id: string) => void;
}) {
  const handleR = STONE_RADIUS * 0.78;
  const color = TEAM_COLOR[rock.team];
  const useNeon = neonRing && selected;

  return (
    <group
      position={[rock.x, ICE_Y, rock.y]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(rock.id);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* Granite body */}
      <mesh castShadow receiveShadow position={[0, STONE_HEIGHT / 2, 0]}>
        <cylinderGeometry
          args={[STONE_RADIUS, STONE_RADIUS * 0.98, STONE_HEIGHT, 48]}
        />
        <meshPhysicalMaterial
          color={useNeon ? NEON.inner : "#4b5563"}
          roughness={useNeon ? 0.25 : 0.35}
          metalness={useNeon ? 0.25 : 0.35}
          clearcoat={0.55}
          clearcoatRoughness={0.3}
          emissive={useNeon ? NEON.inner : "#000000"}
          emissiveIntensity={useNeon ? 0.35 : 0}
        />
      </mesh>

      {/* Colored handle dome */}
      <mesh
        castShadow
        position={[0, STONE_HEIGHT + HANDLE_HEIGHT * 0.35, 0]}
      >
        <cylinderGeometry
          args={[handleR, handleR * 0.92, HANDLE_HEIGHT, 48]}
        />
        <meshPhysicalMaterial
          color={color}
          roughness={0.22}
          metalness={0.15}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Specular top disc */}
      <mesh
        position={[0, STONE_HEIGHT + HANDLE_HEIGHT * 0.7, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[handleR * 0.88, 48]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <RockLabel number={rock.number} y={STONE_HEIGHT + HANDLE_HEIGHT + 0.08} />
    </group>
  );
}

const MARKER_OUTLINE = {
  red: "#7a1f1f",
  yellow: "#6e5314",
} as const;

function useMarkerLabelTexture(letter: string, outline: string) {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, size, size);
      ctx.font = "800 86px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 14;
      ctx.strokeText(letter, size / 2, size / 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(letter, size / 2, size / 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [letter, outline]);
}

function Marker3D({
  marker,
  selected,
  onSelect,
}: {
  marker: Marker;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const color = TEAM_COLOR[marker.team];
  const outline = MARKER_OUTLINE[marker.team];
  const label = useMarkerLabelTexture(marker.letter, outline);
  const r = MARKER_RADIUS;
  const arm = r * 1.15;
  const y = ICE_Y + 0.11;

  return (
    <group
      position={[marker.x, 0, marker.y]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(marker.id);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      {selected ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y - 0.01, 0]}>
          <ringGeometry args={[r + 0.08, r + 0.14, 48]} />
          <meshBasicMaterial color="#3a6f9a" transparent opacity={0.85} />
        </mesh>
      ) : null}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
        <circleGeometry args={[r, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.32}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.002, 0]}>
        <ringGeometry args={[r - 0.03, r, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} />
      </mesh>

      <mesh position={[0, y + 0.004, 0]}>
        <boxGeometry args={[0.05, 0.01, arm * 2]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, y + 0.004, 0]}>
        <boxGeometry args={[arm * 2, 0.01, 0.05]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.02, 0]}>
        <planeGeometry args={[r * 1.35, r * 1.35]} />
        <meshBasicMaterial
          map={label}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

type Board3DProps = {
  rocks: Rock[];
  markers: Marker[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showGuardShades?: boolean;
  showGuardZones?: boolean;
  neonRing?: boolean;
};

const sheetCenterZ = VIEW_MIN_Y + VIEW_HEIGHT / 2;
/** Behind the house, looking toward the hog (same reading direction as 2D). */
const orbitTarget: [number, number, number] = [0, 0, 0];
const cameraPosition: [number, number, number] = [0, 20, VIEW_MAX_Y + 12];

/** react-use-measure can drop the first RO callback before its mounted flag flips. */
function ForceCanvasSize({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const setSize = useThree((s) => s.setSize);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);

  useLayoutEffect(() => {
    if (width <= 1 || height <= 1) return;
    setSize(width, height);
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    gl.setSize(width, height, false);
    gl.domElement.style.width = `${width}px`;
    gl.domElement.style.height = `${height}px`;
    if ("aspect" in camera) {
      (camera as THREE.PerspectiveCamera).aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }, [width, height, setSize, gl, camera]);

  return null;
}

export function Board3D({
  rocks,
  markers,
  selectedId,
  onSelect,
  showGuardShades = false,
  showGuardZones = false,
  neonRing = false,
}: Board3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width <= 1 || height <= 1) return;
      setViewport((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ready = viewport.width > 1 && viewport.height > 1;

  // Kick R3F's useMeasure after mount — it can miss the first ResizeObserver pass.
  useLayoutEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 0);
    return () => window.clearTimeout(id);
  }, [ready, viewport.width, viewport.height]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      style={{ background: "#cbd5e1" }}
    >
      {ready ? (
        <Canvas
          key={`${viewport.width}x${viewport.height}`}
          shadows
          dpr={[1, 1.75]}
          resize={{ debounce: 0, scroll: false, offsetSize: true }}
          camera={{
            position: cameraPosition,
            fov: 40,
            near: 0.1,
            far: 400,
          }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.35,
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
            background: "#cbd5e1",
          }}
          onCreated={({ gl, scene, camera }) => {
            gl.setClearColor("#cbd5e1", 1);
            scene.background = new THREE.Color("#cbd5e1");
            camera.lookAt(...orbitTarget);
          }}
          onPointerMissed={() => onSelect(null)}
        >
          <ForceCanvasSize
            width={viewport.width}
            height={viewport.height}
          />
          <color attach="background" args={["#cbd5e1"]} />

          {/* Soft wrap lighting from every side — keep key gentle so fills win. */}
          <ambientLight intensity={1.25} />
          <hemisphereLight args={["#ffffff", "#d7dee8", 1.2]} />
          <directionalLight
            position={[4, 40, sheetCenterZ]}
            intensity={0.55}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0002}
            shadow-normalBias={0.03}
            shadow-camera-near={1}
            shadow-camera-far={100}
            shadow-camera-left={-24}
            shadow-camera-right={24}
            shadow-camera-top={30}
            shadow-camera-bottom={-24}
          />
          <directionalLight
            position={[0, 22, VIEW_MAX_Y + 16]}
            intensity={0.95}
            color="#ffffff"
          />
          <directionalLight
            position={[0, 18, VIEW_MIN_Y - 12]}
            intensity={0.9}
            color="#fffaf0"
          />
          <directionalLight
            position={[24, 16, sheetCenterZ]}
            intensity={0.8}
            color="#eef4ff"
          />
          <directionalLight
            position={[-24, 16, sheetCenterZ]}
            intensity={0.8}
            color="#fff6eb"
          />
          <directionalLight
            position={[12, 10, sheetCenterZ + 18]}
            intensity={0.55}
          />
          <directionalLight
            position={[-12, 10, sheetCenterZ - 18]}
            intensity={0.55}
          />
          <pointLight
            position={[0, 10, sheetCenterZ]}
            intensity={0.65}
            distance={80}
            decay={1.2}
          />

          <Rink3D />
          {showGuardZones ? (
            <Suspense fallback={null}>
              <GuardZones3D />
            </Suspense>
          ) : null}
          {showGuardShades ? <GuardLanes3D rocks={rocks} /> : null}
          {markers.map((marker) => (
            <Marker3D
              key={marker.id}
              marker={marker}
              selected={marker.id === selectedId}
              onSelect={onSelect}
            />
          ))}
          {rocks.map((rock) => (
            <NumberedRock
              key={rock.id}
              rock={rock}
              selected={rock.id === selectedId}
              neonRing={neonRing}
              onSelect={onSelect}
            />
          ))}

          <ContactShadows
            position={[0, SHADOW_Y, sheetCenterZ]}
            opacity={0.22}
            scale={VIEW_WIDTH + 8}
            blur={2.6}
            far={12}
            resolution={512}
            frames={1}
            color="#0f172a"
          />

          <OrbitControls
            makeDefault
            target={orbitTarget}
            enablePan
            enableRotate
            enableZoom
            panSpeed={0.9}
            rotateSpeed={0.65}
            zoomSpeed={0.8}
            minDistance={8}
            maxDistance={90}
            maxPolarAngle={Math.PI / 2.05}
            minPolarAngle={0.15}
            screenSpacePanning
          />
        </Canvas>
      ) : null}
    </div>
  );
}
