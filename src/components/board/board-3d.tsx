"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  Text,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import {
  BACK_LINE_Y,
  BUTTON_RADIUS,
  HOG_LINE_Y,
  HOG_TO_TEE,
  HOUSE_RADIUS,
  isGuard,
  LOGO_CAPTION,
  LOGO_SIZE,
  LOGO_Y,
  RING_4_RADIUS,
  RING_8_RADIUS,
  SIDE_LINE,
  STONE_DIAMETER,
  STONE_RADIUS,
  TEE_LINE_Y,
  VIEW_HEIGHT,
  VIEW_MIN_Y,
  VIEW_WIDTH,
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
const ZONE_START_Y = HOUSE_RADIUS;
const ZONE_END_Y = HOG_LINE_Y;

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
  const span = ZONE_END_Y - ZONE_START_Y;
  const band = span / ZONE_COUNT;

  return (
    <group>
      {Array.from({ length: ZONE_COUNT }, (_, i) => {
        const z = ZONE_END_Y - (i + 1) * band + band / 2;
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
        const length = rock.y - BACK_LINE_Y;
        if (length <= 0) return null;
        const cz = BACK_LINE_Y + length / 2;
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

function ThLogo3D() {
  const texture = useTexture("/th_logo.svg");
  texture.colorSpace = THREE.SRGBColorSpace;
  const igTexture = useInstagramIconTexture();

  const captionGap = 0.32;
  const captionSize = 0.75;
  const iconSize = 0.75;
  const blockHeight = LOGO_SIZE + captionGap + captionSize;
  const logoZ = LOGO_Y - blockHeight / 2 + LOGO_SIZE / 2;
  const captionZ = LOGO_Y - blockHeight / 2 + LOGO_SIZE + captionGap + captionSize / 2;
  const captionWidth = iconSize + 0.18 + LOGO_CAPTION.length * captionSize * 0.48;
  const iconX = -captionWidth / 2 + iconSize / 2;
  const textX = iconX + iconSize / 2 + 0.18;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, BRAND_Y, logoZ]}
        renderOrder={4}
      >
        <planeGeometry args={[LOGO_SIZE, LOGO_SIZE]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.22}
          depthWrite={false}
          depthTest
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-6}
          polygonOffsetUnits={-6}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[iconX, BRAND_Y, captionZ]}
        renderOrder={4}
      >
        <planeGeometry args={[iconSize, iconSize]} />
        <meshBasicMaterial
          map={igTexture}
          transparent
          opacity={0.32}
          depthWrite={false}
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-6}
          polygonOffsetUnits={-6}
        />
      </mesh>
      <Text
        position={[textX, BRAND_Y, captionZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={captionSize}
        color="#1a222c"
        fillOpacity={0.32}
        anchorX="left"
        anchorY="middle"
        renderOrder={4}
      >
        {LOGO_CAPTION}
      </Text>
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

      <Suspense fallback={null}>
        <ThLogo3D />
      </Suspense>
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

type Board3DProps = {
  rocks: Rock[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showGuardShades?: boolean;
  showGuardZones?: boolean;
  neonRing?: boolean;
};

export function Board3D({
  rocks,
  selectedId,
  onSelect,
  showGuardShades = false,
  showGuardZones = false,
  neonRing = false,
}: Board3DProps) {
  const lookAtZ = HOG_TO_TEE * 0.4;
  const sheetCenterZ = VIEW_MIN_Y + VIEW_HEIGHT / 2;

  return (
    <div className="absolute inset-0" style={{ background: "#cbd5e1" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [8, 18, 28],
          fov: 40,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          logarithmicDepthBuffer: true,
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
        onCreated={({ gl, scene, camera }) => {
          gl.setClearColor("#cbd5e1", 1);
          scene.background = new THREE.Color("#cbd5e1");
          camera.lookAt(0, 0, lookAtZ);
        }}
        onPointerMissed={() => onSelect(null)}
      >
        <color attach="background" args={["#cbd5e1"]} />
        <fog attach="fog" args={["#cbd5e1", 45, 95]} />

        <ambientLight intensity={0.4} />
        <hemisphereLight args={["#ffffff", "#64748b", 0.55]} />
        <directionalLight
          position={[16, 30, 12]}
          intensity={1.55}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0002}
          shadow-normalBias={0.02}
          shadow-camera-near={1}
          shadow-camera-far={90}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={30}
          shadow-camera-bottom={-20}
        />
        <directionalLight position={[-12, 10, -8]} intensity={0.35} color="#bfdbfe" />
        <directionalLight position={[0, 8, 24]} intensity={0.3} color="#fff7ed" />

        <Environment preset="city" environmentIntensity={0.45} />

        <Rink3D />
        {showGuardZones ? <GuardZones3D /> : null}
        {showGuardShades ? <GuardLanes3D rocks={rocks} /> : null}
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
          opacity={0.35}
          scale={VIEW_WIDTH + 8}
          blur={2.2}
          far={12}
          resolution={512}
          frames={1}
          color="#0f172a"
        />

        <OrbitControls
          makeDefault
          target={[0, 0, lookAtZ]}
          enablePan
          enableRotate
          enableZoom
          panSpeed={0.9}
          rotateSpeed={0.65}
          zoomSpeed={0.8}
          minDistance={6}
          maxDistance={70}
          maxPolarAngle={Math.PI / 2.08}
          minPolarAngle={0.12}
          screenSpacePanning
        />
      </Canvas>
    </div>
  );
}
