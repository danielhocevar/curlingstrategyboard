"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  BACK_LINE_Y,
  BUTTON_RADIUS,
  HOG_LINE_Y,
  HOG_TO_TEE,
  HOUSE_RADIUS,
  RING_4_RADIUS,
  RING_8_RADIUS,
  SIDE_LINE,
  STONE_RADIUS,
  TEE_LINE_Y,
  VIEW_HEIGHT,
  VIEW_MIN_Y,
  VIEW_WIDTH,
  type Rock,
} from "@/lib/rink";

const ICE_Y = 0;
const STONE_HEIGHT = 0.38;
const HANDLE_HEIGHT = 0.12;

const TEAM_COLOR = {
  red: "#c23b3b",
  yellow: "#d4a84b",
} as const;

function RingDisc({
  innerRadius,
  outerRadius,
  color,
}: {
  innerRadius: number;
  outerRadius: number;
  color: string;
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ICE_Y + 0.01, 0]}>
      <ringGeometry args={[innerRadius, outerRadius, 64]} />
      <meshStandardMaterial
        color={color}
        roughness={0.85}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function LineMark({
  x1,
  z1,
  x2,
  z2,
  width = 0.06,
  color = "#3a4555",
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
    <mesh position={[cx, ICE_Y + 0.015, cz]} rotation={[0, angle, 0]}>
      <boxGeometry args={[width, 0.01, length]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

function Rink3D() {
  const sheetCenterZ = VIEW_MIN_Y + VIEW_HEIGHT / 2;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ICE_Y - 0.02, sheetCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[VIEW_WIDTH + 4, VIEW_HEIGHT + 4]} />
        <meshStandardMaterial
          color="#b8c2ce"
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ICE_Y, sheetCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[SIDE_LINE * 2, VIEW_HEIGHT]} />
        <meshStandardMaterial
          color="#eef3f8"
          roughness={0.35}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      <RingDisc
        innerRadius={RING_8_RADIUS}
        outerRadius={HOUSE_RADIUS}
        color="#1a2f5a"
      />
      <RingDisc
        innerRadius={RING_4_RADIUS}
        outerRadius={RING_8_RADIUS}
        color="#f4f7fa"
      />
      <RingDisc
        innerRadius={BUTTON_RADIUS}
        outerRadius={RING_4_RADIUS}
        color="#b84545"
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ICE_Y + 0.012, 0]}>
        <circleGeometry args={[BUTTON_RADIUS, 32]} />
        <meshStandardMaterial
          color="#f4f7fa"
          roughness={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      <LineMark x1={-SIDE_LINE} z1={BACK_LINE_Y} x2={SIDE_LINE} z2={BACK_LINE_Y} />
      <LineMark x1={-SIDE_LINE} z1={TEE_LINE_Y} x2={SIDE_LINE} z2={TEE_LINE_Y} />
      <LineMark
        x1={-SIDE_LINE}
        z1={HOG_LINE_Y}
        x2={SIDE_LINE}
        z2={HOG_LINE_Y}
        width={0.14}
        color="#1a222c"
      />
      <LineMark
        x1={0}
        z1={VIEW_MIN_Y}
        x2={0}
        z2={VIEW_MIN_Y + VIEW_HEIGHT}
        width={0.04}
      />
      <LineMark
        x1={-SIDE_LINE}
        z1={VIEW_MIN_Y}
        x2={-SIDE_LINE}
        z2={VIEW_MIN_Y + VIEW_HEIGHT}
        width={0.04}
      />
      <LineMark
        x1={SIDE_LINE}
        z1={VIEW_MIN_Y}
        x2={SIDE_LINE}
        z2={VIEW_MIN_Y + VIEW_HEIGHT}
        width={0.04}
      />
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
      ctx.font = "700 88px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
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
    <sprite position={[0, y, 0]} scale={[0.7, 0.7, 0.7]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}

function NumberedRock({ rock }: { rock: Rock }) {
  const handleR = STONE_RADIUS * 0.78;
  const color = TEAM_COLOR[rock.team];

  return (
    <group position={[rock.x, ICE_Y, rock.y]}>
      <mesh castShadow position={[0, STONE_HEIGHT / 2, 0]}>
        <cylinderGeometry
          args={[STONE_RADIUS, STONE_RADIUS, STONE_HEIGHT, 32]}
        />
        <meshStandardMaterial color="#5a6270" roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh
        castShadow
        position={[0, STONE_HEIGHT + HANDLE_HEIGHT / 2 - 0.02, 0]}
      >
        <cylinderGeometry args={[handleR, handleR, HANDLE_HEIGHT, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <RockLabel number={rock.number} y={STONE_HEIGHT + HANDLE_HEIGHT + 0.05} />
    </group>
  );
}

type Board3DProps = {
  rocks: Rock[];
};

export function Board3D({ rocks }: Board3DProps) {
  const lookAtZ = HOG_TO_TEE * 0.4;

  return (
    <div className="absolute inset-0" style={{ background: "#9aa8b8" }}>
      <Canvas
        shadows
        dpr={1}
        camera={{
          position: [0, 24, 30],
          fov: 42,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
        onCreated={({ gl, scene, camera }) => {
          gl.setClearColor("#9aa8b8", 1);
          scene.background = new THREE.Color("#9aa8b8");
          camera.lookAt(0, 0, lookAtZ);
        }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight
          position={[12, 30, 8]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        <Rink3D />
        {rocks.map((rock) => (
          <NumberedRock key={rock.id} rock={rock} />
        ))}

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
