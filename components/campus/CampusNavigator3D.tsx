"use client";

import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Edges, Html } from "@react-three/drei";
import { CapsuleCollider, CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

import CampusAvatar from "@/components/campus/CampusAvatar";
import CampusGameHUD3D from "@/components/campus/CampusGameHUD3D";
import { getDialogLines } from "@/components/campus/campusDialogContent";
import { getBuildingById } from "@/components/campus/CampusRenderer";
import { useCampusStoryReturn } from "@/components/campus/useCampusStoryReturn";
import { useCampusQuestState } from "@/components/campus/useCampusQuestState";
import { SketchDialogSequence } from "@/components/sketch/SketchDialogSequence";
import MiniGameRouter from "@/components/sketch/minigames/MiniGameRouter";
import { useSoundEngine } from "@/components/sketch/SoundEngine";
import type { CampusStoryLaunchContext } from "@/lib/campus-story-session";
import { campusWorld } from "@/lib/data";
import type {
  CampusBuilding,
  CampusInteriorScene,
  CampusMapData,
  CampusPropDefinition,
  CampusSpawnPoint,
  CampusVector3,
  CampusWorldBuilding,
  CampusWorldDefinition,
  MiniGameType,
  ResourceSlug,
} from "@/lib/types";

type SceneState =
  | { kind: "outdoor"; spawn: CampusSpawnPoint }
  | { kind: "interior"; buildingId: string; sceneId: string };

type InteractionState =
  | {
      buildingId: string;
      type: "dialog" | "walkthrough";
      lineIndex: number;
      sequenceDone: boolean;
    }
  | {
      buildingId: string;
      type: "minigame";
    };

type NearbyAction =
  | { kind: "enter-building"; buildingId: string }
  | { kind: "interact-interior"; buildingId: string }
  | { kind: "exit-interior"; buildingId: string };

type CameraRigState = {
  yaw: number;
  pitch: number;
  distance: number;
  minDistance: number;
  maxDistance: number;
  minPitch: number;
  maxPitch: number;
  isDragging: boolean;
  pointerId: number | null;
  lastX: number;
  lastY: number;
};

const GOLD = "#ffc627";
const MAROON = "#8c1d40";
const INK = "#201711";
const WALK_SPEED = 5.6;
const SPRINT_SPEED = 8.5;
const OUTDOOR_INTERACT_DISTANCE = 3.4;
const INTERIOR_INTERACT_DISTANCE = 2.8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function vectorFromTuple([x, y, z]: CampusVector3) {
  return new THREE.Vector3(x, y, z);
}

function distanceXZ(a: CampusVector3, b: CampusVector3) {
  return Math.hypot(a[0] - b[0], a[2] - b[2]);
}

function addVector(base: CampusVector3, offset?: CampusVector3): CampusVector3 {
  if (!offset) {
    return [...base];
  }

  return [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]];
}

function tuple3(x: number, y: number, z: number): CampusVector3 {
  return [x, y, z];
}

function createOutdoorCameraRig(): CameraRigState {
  return {
    yaw: 0.72,
    pitch: 0.44,
    distance: 16.8,
    minDistance: 9.4,
    maxDistance: 23,
    minPitch: 0.58,
    maxPitch: 1.18,
    isDragging: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  };
}

function createIndoorCameraRig(): CameraRigState {
  return {
    yaw: 0,
    pitch: 0.42,
    distance: 8.8,
    minDistance: 5.8,
    maxDistance: 11.6,
    minPitch: 0.7,
    maxPitch: 1.12,
    isDragging: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  };
}

function pointInsideAabb(point: THREE.Vector3, center: CampusVector3, size: CampusVector3, padding = 0) {
  return (
    Math.abs(point.x - center[0]) <= size[0] / 2 + padding &&
    Math.abs(point.y - center[1]) <= size[1] / 2 + padding &&
    Math.abs(point.z - center[2]) <= size[2] / 2 + padding
  );
}

function ImportedInteriorModel({
  model,
  roomSize,
}: {
  model: NonNullable<CampusInteriorScene["importedModel"]>;
  roomSize: CampusVector3;
}) {
  const loaded = useLoader(FBXLoader, model.src);
  const scale = propScale(model.scale, 1);

  const prepared = useMemo(() => {
    const clone = loaded.clone(true);
    const offset = new THREE.Vector3();
    const resolvedScale = new THREE.Vector3(...scale);
    const meshBounds: { mesh: THREE.Mesh; size: THREE.Vector3; center: THREE.Vector3 }[] = [];

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.side = THREE.DoubleSide;
        material.needsUpdate = true;

        if ("metalness" in material) {
          material.metalness = 0;
        }

        if ("roughness" in material) {
          material.roughness = 1;
        }
      });

      const box = new THREE.Box3().setFromObject(child);
      if (!box.isEmpty()) {
        meshBounds.push({
          mesh: child,
          size: box.getSize(new THREE.Vector3()),
          center: box.getCenter(new THREE.Vector3()),
        });
      }
    });

    const bounds = new THREE.Box3().setFromObject(clone);
    if (!bounds.isEmpty()) {
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      if (model.autoCenter) {
        offset.x = -center.x;
        offset.z = -center.z;
      }

      if (model.floorToZero) {
        offset.y = -bounds.min.y;
      }

      if (model.fitToRoom) {
        const fitX = roomSize[0] * 0.84;
        const fitY = roomSize[1] * 0.82;
        const fitZ = roomSize[2] * 0.78;
        const fitScale =
          model.fitMode === "height"
            ? fitY / Math.max(size.y, 0.001)
            : Math.min(
                fitX / Math.max(size.x, 0.001),
                fitY / Math.max(size.y, 0.001),
                fitZ / Math.max(size.z, 0.001),
              );
        resolvedScale.multiplyScalar(fitScale);
      }

      const overallVolume = Math.max(size.x * size.y * size.z, 0.001);
      const overallDiagonal = Math.max(size.length(), 0.001);
      for (const entry of meshBounds) {
        const volume = entry.size.x * entry.size.y * entry.size.z;
        const centerDistance = entry.center.distanceTo(center);
        const tinyOutlier =
          volume < overallVolume * 0.004 &&
          centerDistance > overallDiagonal * 0.22;
        const floorShrapnel =
          entry.size.y < size.y * 0.08 &&
          entry.center.y < bounds.min.y + size.y * 0.12 &&
          entry.size.length() < overallDiagonal * 0.12;

        if (tinyOutlier || floorShrapnel) {
          entry.mesh.visible = false;
        }
      }
    }

    return { clone, offset, resolvedScale: resolvedScale.toArray() as [number, number, number] };
  }, [loaded, model.autoCenter, model.fitMode, model.fitToRoom, model.floorToZero, roomSize, scale]);

  return (
    <group
      position={model.position ?? [0, 0, 0]}
      rotation={model.rotation ?? [0, 0, 0]}
      scale={prepared.resolvedScale}
    >
      <group position={prepared.offset.toArray() as [number, number, number]}>
        <primitive object={prepared.clone} />
      </group>
    </group>
  );
}

function segmentIntersectsAabb(
  start: THREE.Vector3,
  end: THREE.Vector3,
  center: CampusVector3,
  size: CampusVector3,
  padding = 0,
) {
  const min = new THREE.Vector3(
    center[0] - size[0] / 2 - padding,
    center[1] - size[1] / 2 - padding,
    center[2] - size[2] / 2 - padding,
  );
  const max = new THREE.Vector3(
    center[0] + size[0] / 2 + padding,
    center[1] + size[1] / 2 + padding,
    center[2] + size[2] / 2 + padding,
  );
  const delta = end.clone().sub(start);
  let tMin = 0;
  let tMax = 1;

  for (const axis of ["x", "y", "z"] as const) {
    const origin = start[axis];
    const direction = delta[axis];

    if (Math.abs(direction) < 1e-5) {
      if (origin < min[axis] || origin > max[axis]) {
        return false;
      }

      continue;
    }

    const invDirection = 1 / direction;
    let t1 = (min[axis] - origin) * invDirection;
    let t2 = (max[axis] - origin) * invDirection;

    if (t1 > t2) {
      [t1, t2] = [t2, t1];
    }

    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);

    if (tMin > tMax) {
      return false;
    }
  }

  return true;
}

function resolveOutdoorCameraPosition(target: THREE.Vector3, direction: THREE.Vector3, distance: number) {
  const buildings = Object.values(campusWorld.buildings);
  let safeDistance = distance;

  for (let attempt = 0; attempt < 14; attempt += 1) {
    const candidate = target.clone().addScaledVector(direction, safeDistance);
    const blocked = buildings.some((building) =>
      segmentIntersectsAabb(target, candidate, building.collider.position, building.collider.size, 0.45),
    );

    if (!blocked) {
      return candidate;
    }

    safeDistance = Math.max(6.8, safeDistance - 1);
  }

  return target.clone().addScaledVector(direction, 6.8);
}

function resolveIndoorCameraPosition(
  target: THREE.Vector3,
  direction: THREE.Vector3,
  distance: number,
  interior: CampusInteriorScene,
) {
  const candidate = target.clone().addScaledVector(direction, distance);
  const [roomWidth, roomHeight, roomDepth] = interior.roomSize;
  const clamped = candidate.clone();

  clamped.x = clamp(clamped.x, -roomWidth / 2 + 0.95, roomWidth / 2 - 0.95);
  clamped.y = clamp(clamped.y, 1.9, roomHeight - 1.2);
  clamped.z = clamp(clamped.z, -roomDepth / 2 + 0.95, roomDepth / 2 - 1.15);

  if (pointInsideAabb(clamped, [0, roomHeight / 2, -roomDepth / 2], [roomWidth, roomHeight, 0.35], 0.15)) {
    clamped.z = -roomDepth / 2 + 0.95;
  }

  return clamped;
}

function getSpawnY() {
  return 0;
}

function getInteriorExitSpawn(building: CampusWorldBuilding): CampusSpawnPoint {
  return {
    position: [building.portal.position[0], 0, building.portal.position[2] + 4.2],
    rotationY: Math.PI,
  };
}

function toHalfExtents(size: CampusVector3) {
  return [size[0] / 2, size[1] / 2, size[2] / 2] as [number, number, number];
}

function propScale(scale: CampusPropDefinition["scale"], fallback = 1) {
  if (typeof scale === "number") {
    return tuple3(scale, scale, scale);
  }

  if (scale) {
    return scale;
  }

  return tuple3(fallback, fallback, fallback);
}

function BuildingLabel({
  title,
  subtitle,
  position,
}: {
  title: string;
  subtitle: string;
  position: CampusVector3;
}) {
  return (
    <Html position={position} center transform sprite distanceFactor={18}>
      <div className="rounded-full border border-[#2a2018]/15 bg-[rgba(255,250,243,0.92)] px-3 py-2 text-center shadow-[0_12px_30px_rgba(30,22,16,0.22)] backdrop-blur-sm">
        <div className="font-[var(--font-sketch-display)] text-[1rem] leading-none text-[#241811]">
          {title}
        </div>
        <div className="mt-1 font-[var(--font-sketch-body)] text-[0.72rem] uppercase tracking-[0.18em] text-[#8c1d40]">
          {subtitle}
        </div>
      </div>
    </Html>
  );
}

function PromptBubble({ position, text }: { position: CampusVector3; text: string }) {
  return (
    <Html position={position} center>
      <div className="max-w-[14rem] whitespace-nowrap rounded-full border border-white/10 bg-[rgba(20,14,10,0.82)] px-3 py-1.5 text-center font-[var(--font-sketch-body)] text-[0.8rem] text-white shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
        {text}
      </div>
    </Html>
  );
}

function QuestBeacon({ position }: { position: CampusVector3 }) {
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(clock.elapsedTime * 2.5) * 0.06;
    groupRef.current.scale.setScalar(pulse);
    groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.8) * 0.18;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1.2, 0.16, 12, 32]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, -1.7, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 3.4, 12]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.3} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color="#fff7d1" emissive="#fff7d1" emissiveIntensity={1.1} />
      </mesh>
    </group>
  );
}

function PropMesh({ prop }: { prop: CampusPropDefinition }) {
  const scale = propScale(prop.scale);
  const tint = prop.tint ?? "#f6ecde";
  const dark = "#2a1e16";

  if (prop.kind === "bench") {
    return (
      <group position={prop.position} rotation={[0, prop.rotationY ?? 0, 0]} scale={scale}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[1.6, 0.14, 0.46]} />
          <meshStandardMaterial color={tint} flatShading />
          <Edges color={dark} scale={1.03} />
        </mesh>
        <mesh position={[0, 0.78, -0.16]}>
          <boxGeometry args={[1.5, 0.14, 0.26]} />
          <meshStandardMaterial color={tint} flatShading />
          <Edges color={dark} scale={1.03} />
        </mesh>
        {[-0.58, 0.58].map((x) => (
          <mesh key={x} position={[x, 0.22, 0]}>
            <boxGeometry args={[0.12, 0.42, 0.12]} />
            <meshStandardMaterial color="#755843" flatShading />
          </mesh>
        ))}
      </group>
    );
  }

  if (prop.kind === "palm") {
    return (
      <group position={prop.position} rotation={[0, prop.rotationY ?? 0, 0]} scale={scale}>
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.18, 0.3, 2.2, 7]} />
          <meshStandardMaterial color="#8f6f51" flatShading />
          <Edges color={dark} scale={1.03} />
        </mesh>
        {[0, 1.2, 2.45, 3.6, 4.9].map((angle) => (
          <mesh key={angle} position={[0, 2.34, 0]} rotation={[0.2, angle, -0.38]}>
            <coneGeometry args={[0.34, 1.45, 5]} />
            <meshStandardMaterial color="#7ea05e" flatShading />
            <Edges color={dark} scale={1.03} />
          </mesh>
        ))}
      </group>
    );
  }

  if (prop.kind === "terminal") {
    return (
      <group position={prop.position} rotation={[0, prop.rotationY ?? 0, 0]} scale={scale}>
        <mesh position={[0, 0.88, 0]}>
          <boxGeometry args={[0.9, 0.62, 0.1]} />
          <meshStandardMaterial color="#d9d6d0" flatShading />
          <Edges color={dark} scale={1.03} />
        </mesh>
        <mesh position={[0, 0.88, 0.055]}>
          <boxGeometry args={[0.7, 0.42, 0.02]} />
          <meshStandardMaterial color={MAROON} emissive={MAROON} emissiveIntensity={0.18} flatShading />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#7f7568" flatShading />
        </mesh>
      </group>
    );
  }

  if (prop.kind === "whiteboard") {
    return (
      <group position={prop.position} rotation={[0, prop.rotationY ?? 0, 0]} scale={scale}>
        <mesh>
          <boxGeometry args={[2.4, 1.2, 0.12]} />
          <meshStandardMaterial color="#fffdf7" flatShading />
          <Edges color={dark} scale={1.03} />
        </mesh>
      </group>
    );
  }

  if (prop.kind === "sofa") {
    return (
      <group position={prop.position} rotation={[0, prop.rotationY ?? 0, 0]} scale={scale}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[1.8, 0.44, 0.88]} />
          <meshStandardMaterial color={tint} flatShading />
          <Edges color={dark} scale={1.03} />
        </mesh>
        <mesh position={[0, 0.78, -0.26]}>
          <boxGeometry args={[1.8, 0.48, 0.18]} />
          <meshStandardMaterial color={tint} flatShading />
          <Edges color={dark} scale={1.03} />
        </mesh>
      </group>
    );
  }

  if (prop.kind === "table") {
    return (
      <group position={prop.position} rotation={[0, prop.rotationY ?? 0, 0]} scale={scale}>
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[1.8, 0.16, 1]} />
          <meshStandardMaterial color={tint} flatShading />
          <Edges color={dark} scale={1.03} />
        </mesh>
        {[-0.72, 0.72].flatMap((x) => [-0.32, 0.32].map((z) => ({ x, z }))).map((leg) => (
          <mesh key={`${leg.x}-${leg.z}`} position={[leg.x, 0.3, leg.z]}>
            <boxGeometry args={[0.1, 0.6, 0.1]} />
            <meshStandardMaterial color="#7e6046" flatShading />
          </mesh>
        ))}
      </group>
    );
  }

  if (prop.kind === "plant") {
    return (
      <group position={prop.position} rotation={[0, prop.rotationY ?? 0, 0]} scale={scale}>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.28, 0.24, 0.45, 8]} />
          <meshStandardMaterial color="#b56d45" flatShading />
          <Edges color={dark} scale={1.03} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshStandardMaterial color="#80a56a" flatShading />
          <Edges color={dark} scale={1.03} />
        </mesh>
      </group>
    );
  }

  if (prop.kind === "sign") {
    return (
      <group position={prop.position} rotation={[0, prop.rotationY ?? 0, 0]} scale={scale}>
        <mesh position={[0, 0.74, 0]}>
          <boxGeometry args={[1.8, 0.34, 0.1]} />
          <meshStandardMaterial color={tint} flatShading />
          <Edges color={dark} scale={1.03} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <boxGeometry args={[0.08, 0.68, 0.08]} />
          <meshStandardMaterial color="#7d5f46" flatShading />
        </mesh>
      </group>
    );
  }

  return (
    <group position={prop.position} rotation={[0, prop.rotationY ?? 0, 0]} scale={scale}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.8, 0.5, 0.9]} />
        <meshStandardMaterial color={tint} flatShading />
        <Edges color={dark} scale={1.03} />
      </mesh>
      {[-0.72, 0.72].flatMap((x) => [-0.28, 0.28].map((z) => ({ x, z }))).map((leg) => (
        <mesh key={`${leg.x}-${leg.z}`} position={[leg.x, 0.26, leg.z]}>
          <boxGeometry args={[0.1, 0.52, 0.1]} />
          <meshStandardMaterial color="#7e6046" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function BuildingShell({ building, mapBuilding }: { building: CampusWorldBuilding; mapBuilding: CampusBuilding }) {
  const roofLift = building.height / 2 + 0.38;

  return (
    <group position={building.position} rotation={[0, building.rotationY ?? 0, 0]}>
      <mesh position={[0, building.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={building.scale} />
        <meshStandardMaterial color={building.wallColor} flatShading />
        <Edges color={INK} scale={1.03} />
      </mesh>
      <mesh position={[0, roofLift, 0]}>
        <boxGeometry args={[building.scale[0] * 1.04, 0.42, building.scale[2] * 1.04]} />
        <meshStandardMaterial color={building.roofColor} flatShading />
        <Edges color={INK} scale={1.04} />
      </mesh>
      <mesh position={[0, 0.08, building.scale[2] / 2 + 0.2]}>
        <boxGeometry args={[1.6, 0.16, 0.36]} />
        <meshStandardMaterial color={building.accentColor ?? GOLD} emissive={building.accentColor ?? GOLD} emissiveIntensity={0.18} flatShading />
      </mesh>
      <BuildingLabel
        title={mapBuilding.label}
        subtitle={mapBuilding.name}
        position={addVector(building.position, building.labelOffset)}
      />
    </group>
  );
}

function PathStrip({ start, end }: { start: CampusVector3; end: CampusVector3 }) {
  const startVector = vectorFromTuple(start);
  const endVector = vectorFromTuple(end);
  const midpoint = startVector.clone().lerp(endVector, 0.5);
  const distance = startVector.distanceTo(endVector);
  const rotationY = Math.atan2(end[2] - start[2], end[0] - start[0]);

  return (
    <group position={[midpoint.x, 0.02, midpoint.z]} rotation={[0, rotationY, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[distance, 0.03, 1.6]} />
        <meshStandardMaterial color="#efe0c6" flatShading />
      </mesh>
      {Array.from({ length: Math.max(2, Math.floor(distance / 1.6)) }).map((_, index, list) => {
        const offset = -distance / 2 + (distance / Math.max(1, list.length - 1)) * index;
        return (
          <mesh key={index} position={[offset, 0.04, 0]}>
            <boxGeometry args={[0.7, 0.02, 0.12]} />
            <meshStandardMaterial color={MAROON} flatShading transparent opacity={0.42} />
          </mesh>
        );
      })}
    </group>
  );
}

function OutdoorScene({
  currentQuestBuildingId,
  enabled,
  map,
  nearbyAction,
  onPositionChange,
  pressedKeysRef,
  spawn,
  world,
}: {
  currentQuestBuildingId: string | null;
  enabled: boolean;
  map: CampusMapData;
  nearbyAction: NearbyAction | null;
  onPositionChange: (position: CampusVector3, isMoving: boolean) => void;
  pressedKeysRef: React.MutableRefObject<Set<string>>;
  spawn: CampusSpawnPoint;
  world: CampusWorldDefinition;
}) {
  const currentQuestWorldBuilding =
    currentQuestBuildingId ? world.buildings[currentQuestBuildingId] ?? null : null;

  return (
    <>
      <ambientLight intensity={1.25} color="#fff4e2" />
      <directionalLight
        castShadow
        position={[18, 28, 10]}
        intensity={1.05}
        color="#fff3dd"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight intensity={0.28} color="#fff8ef" groundColor="#d5b18f" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={world.groundSize} />
        <meshStandardMaterial color="#ddd0bc" flatShading />
      </mesh>

      <Physics gravity={[0, -20, 0]}>
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[world.groundSize[0] / 2, 0.1, world.groundSize[1] / 2]} position={[0, -0.1, 0]} />
          {Object.values(world.buildings).map((building) => (
            <CuboidCollider
              key={`${building.id}-collider`}
              args={toHalfExtents(building.collider.size)}
              position={building.collider.position}
            />
          ))}
          <CuboidCollider args={[world.groundSize[0] / 2, 2, 0.25]} position={[0, 2, world.groundSize[1] / 2]} />
          <CuboidCollider args={[world.groundSize[0] / 2, 2, 0.25]} position={[0, 2, -world.groundSize[1] / 2]} />
          <CuboidCollider args={[0.25, 2, world.groundSize[1] / 2]} position={[world.groundSize[0] / 2, 2, 0]} />
          <CuboidCollider args={[0.25, 2, world.groundSize[1] / 2]} position={[-world.groundSize[0] / 2, 2, 0]} />
        </RigidBody>

        <PlayerController
          enabled={enabled}
          isOutdoor
          onPositionChange={onPositionChange}
          pressedKeysRef={pressedKeysRef}
          sceneKey={`outdoor-${spawn.position.join(",")}`}
          spawn={spawn}
        />
      </Physics>

      {map.paths.map((path) => {
        const from = world.buildings[path.from];
        const to = world.buildings[path.to];

        if (!from || !to) {
          return null;
        }

        return <PathStrip key={`${path.from}-${path.to}`} start={from.portal.position} end={to.portal.position} />;
      })}

      {Object.values(world.buildings).map((building) => {
        const mapBuilding = getBuildingById(map, building.id);

        if (!mapBuilding) {
          return null;
        }

        return (
          <group key={building.id}>
            <BuildingShell building={building} mapBuilding={mapBuilding} />
            {building.props?.map((prop) => (
              <PropMesh key={prop.id} prop={prop} />
            ))}
            {building.npcPosition && mapBuilding.npc ? (
              <CampusAvatar
                position={building.npcPosition}
                presetId={mapBuilding.npc.avatar}
                rotationY={building.npcRotationY ?? Math.PI}
              />
            ) : null}
          </group>
        );
      })}

      {currentQuestWorldBuilding ? (
        <QuestBeacon position={addVector(currentQuestWorldBuilding.position, currentQuestWorldBuilding.beaconOffset)} />
      ) : null}

      {nearbyAction?.kind === "enter-building" ? (() => {
        const building = world.buildings[nearbyAction.buildingId];

        if (!building) {
          return null;
        }

        return (
          <PromptBubble
            position={addVector(building.portal.position, building.portal.promptOffset)}
            text="Press E to enter"
          />
        );
      })() : null}

    </>
  );
}

function InteriorScene({
  building,
  enabled,
  interior,
  nearbyAction,
  onPositionChange,
  pressedKeysRef,
}: {
  building: CampusBuilding;
  enabled: boolean;
  interior: CampusInteriorScene;
  nearbyAction: NearbyAction | null;
  onPositionChange: (position: CampusVector3, isMoving: boolean) => void;
  pressedKeysRef: React.MutableRefObject<Set<string>>;
}) {
  const [roomWidth, roomHeight, roomDepth] = interior.roomSize;
  const wallDepth = 0.35;
  const openingWidth = 4.2;
  const renderShell = !interior.importedModel?.replaceShell;

  return (
    <>
      <ambientLight intensity={0.54} color="#f3e4d1" />
      <directionalLight castShadow position={[8, 11, 6]} intensity={0.68} color="#f7e8d4" />
      <hemisphereLight intensity={0.18} color="#f3ebdc" groundColor="#c1aa8f" />

      <Physics gravity={[0, -20, 0]}>
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[roomWidth / 2, 0.1, roomDepth / 2]} position={[0, -0.1, 0]} />
          <CuboidCollider args={[roomWidth / 2, roomHeight / 2, wallDepth / 2]} position={[0, roomHeight / 2, -roomDepth / 2]} />
          <CuboidCollider args={[wallDepth / 2, roomHeight / 2, roomDepth / 2]} position={[-roomWidth / 2, roomHeight / 2, 0]} />
          <CuboidCollider args={[wallDepth / 2, roomHeight / 2, roomDepth / 2]} position={[roomWidth / 2, roomHeight / 2, 0]} />
          <CuboidCollider
            args={[(roomWidth - openingWidth) / 4, roomHeight / 2, wallDepth / 2]}
            position={[-(roomWidth + openingWidth) / 4, roomHeight / 2, roomDepth / 2]}
          />
          <CuboidCollider
            args={[(roomWidth - openingWidth) / 4, roomHeight / 2, wallDepth / 2]}
            position={[(roomWidth + openingWidth) / 4, roomHeight / 2, roomDepth / 2]}
          />
        </RigidBody>

        <PlayerController
          enabled={enabled}
          isOutdoor={false}
          onPositionChange={onPositionChange}
          pressedKeysRef={pressedKeysRef}
          sceneKey={interior.id}
          spawn={interior.spawn}
        />
      </Physics>

      {renderShell ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[roomWidth, roomDepth]} />
            <meshStandardMaterial color={interior.floorColor} flatShading />
          </mesh>

          <group position={[0, roomHeight / 2, -roomDepth / 2]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[roomWidth, roomHeight, wallDepth]} />
              <meshStandardMaterial color={interior.wallColor} flatShading />
              <Edges color={INK} scale={1.03} />
            </mesh>
          </group>
          <group position={[-roomWidth / 2, roomHeight / 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[wallDepth, roomHeight, roomDepth]} />
              <meshStandardMaterial color={interior.wallColor} flatShading />
              <Edges color={INK} scale={1.03} />
            </mesh>
          </group>
          <group position={[roomWidth / 2, roomHeight / 2, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[wallDepth, roomHeight, roomDepth]} />
              <meshStandardMaterial color={interior.wallColor} flatShading />
              <Edges color={INK} scale={1.03} />
            </mesh>
          </group>
          {[-(roomWidth + openingWidth) / 4, (roomWidth + openingWidth) / 4].map((x) => (
            <group key={x} position={[x, roomHeight / 2, roomDepth / 2]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[(roomWidth - openingWidth) / 2, roomHeight, wallDepth]} />
                <meshStandardMaterial color={interior.wallColor} flatShading />
                <Edges color={INK} scale={1.03} />
              </mesh>
            </group>
          ))}

          <mesh position={[0, 0.08, roomDepth / 2 - 0.28]}>
            <boxGeometry args={[openingWidth * 0.84, 0.16, 0.46]} />
            <meshStandardMaterial color={interior.accentColor} emissive={interior.accentColor} emissiveIntensity={0.18} flatShading />
          </mesh>
        </>
      ) : null}

      <BuildingLabel
        title={interior.title}
        subtitle={building.name}
        position={[0, roomHeight + 0.75, -roomDepth / 2 + 0.2]}
      />

      {interior.importedModel ? (
        <Suspense fallback={null}>
          <ImportedInteriorModel model={interior.importedModel} roomSize={interior.roomSize} />
        </Suspense>
      ) : null}

      {interior.props?.map((prop) => (
        <PropMesh key={prop.id} prop={prop} />
      ))}

      {interior.npcPosition && building.npc ? (
        <CampusAvatar
          position={interior.npcPosition}
          presetId={building.npc.avatar}
          rotationY={interior.npcRotationY ?? 0}
        />
      ) : null}

      {nearbyAction?.kind === "interact-interior" ? (
        <PromptBubble
          position={addVector(interior.interactionPoint.position, interior.interactionPoint.promptOffset)}
          text={
            interior.type === "minigame"
              ? "Press E to use the terminal"
              : "Press E to talk"
          }
        />
      ) : null}

      {nearbyAction?.kind === "exit-interior" ? (
        <PromptBubble
          position={addVector(interior.exitPortal.position, interior.exitPortal.promptOffset)}
          text="Press E to head back outside"
        />
      ) : null}
    </>
  );
}

function CameraController({
  cameraRigRef,
  interior,
  isOutdoor,
  playerPosition,
  sceneKey,
  spawnPosition,
}: {
  cameraRigRef: React.MutableRefObject<CameraRigState>;
  interior: CampusInteriorScene | null;
  isOutdoor: boolean;
  playerPosition: CampusVector3;
  sceneKey: string;
  spawnPosition: CampusVector3;
}) {
  const { camera } = useThree();
  const initialDepthBias = isOutdoor ? 0 : -4.2;
  const targetRef = useRef(
    new THREE.Vector3(playerPosition[0], isOutdoor ? 1.45 : 1.35, playerPosition[2] + initialDepthBias),
  );
  const positionRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const rig = cameraRigRef.current;
    const targetHeight = isOutdoor ? 1.45 : 1.35;
    const targetDepthBias = isOutdoor ? 0 : -4.2;
    targetRef.current.set(spawnPosition[0], targetHeight, spawnPosition[2] + targetDepthBias);

    const horizontal = Math.cos(rig.pitch);
    directionRef.current.set(
      Math.sin(rig.yaw) * horizontal,
      Math.sin(rig.pitch),
      Math.cos(rig.yaw) * horizontal,
    );

    const snappedPosition = isOutdoor
      ? resolveOutdoorCameraPosition(targetRef.current, directionRef.current, rig.distance)
      : resolveIndoorCameraPosition(targetRef.current, directionRef.current, rig.distance, interior!);

    positionRef.current.copy(snappedPosition);
    camera.position.copy(snappedPosition);
    camera.lookAt(targetRef.current);
    // The reset should only run when the scene swaps, not while the player moves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, interior, isOutdoor, sceneKey, spawnPosition]);

  useFrame((_, delta) => {
    const rig = cameraRigRef.current;
    const targetHeight = isOutdoor ? 1.45 : 1.35;
    const targetDepthBias = isOutdoor ? 0 : -4.2;
    const desiredTarget = new THREE.Vector3(
      playerPosition[0],
      targetHeight,
      playerPosition[2] + targetDepthBias,
    );

    targetRef.current.lerp(desiredTarget, 1 - Math.exp(-delta * 10));

    const horizontal = Math.cos(rig.pitch);
    directionRef.current.set(
      Math.sin(rig.yaw) * horizontal,
      Math.sin(rig.pitch),
      Math.cos(rig.yaw) * horizontal,
    );

    const desiredDistance = clamp(rig.distance, rig.minDistance, rig.maxDistance);
    const desiredPosition = isOutdoor
      ? resolveOutdoorCameraPosition(targetRef.current, directionRef.current, desiredDistance)
      : resolveIndoorCameraPosition(targetRef.current, directionRef.current, desiredDistance, interior!);

    if (!positionRef.current.lengthSq() || positionRef.current.distanceToSquared(desiredPosition) > 280) {
      positionRef.current.copy(desiredPosition);
    } else {
      positionRef.current.lerp(desiredPosition, 1 - Math.exp(-delta * 8));
    }

    camera.position.copy(positionRef.current);
    camera.lookAt(targetRef.current);
  });

  return null;
}

function PlayerController({
  enabled = true,
  isOutdoor = false,
  onPositionChange,
  pressedKeysRef,
  sceneKey,
  spawn,
}: {
  enabled?: boolean;
  isOutdoor?: boolean;
  onPositionChange?: (position: CampusVector3, isMoving: boolean) => void;
  pressedKeysRef?: MutableRefObject<Set<string>>;
  sceneKey: string;
  spawn: CampusSpawnPoint;
}) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const visualRef = useRef<THREE.Group | null>(null);
  const desiredRotationRef = useRef(spawn.rotationY ?? 0);
  const lastSyncRef = useRef(0);
  const movingRef = useRef(false);
  const [movingState, setMovingState] = useState(false);
  const { camera } = useThree();
  const cameraForward = useRef(new THREE.Vector3());
  const cameraRight = useRef(new THREE.Vector3());
  const movement = useRef(new THREE.Vector3());

  useEffect(() => {
    const focusTarget = new THREE.Vector3(spawn.position[0], isOutdoor ? 1.45 : 1.35, spawn.position[2]);
    camera.lookAt(focusTarget);
  }, [camera, isOutdoor, sceneKey, spawn.position]);

  useFrame((state, delta) => {
    const body = bodyRef.current;

    if (!body) {
      return;
    }

    const keys = pressedKeysRef?.current;
    const moveForward = enabled && keys ? Number(keys.has("KeyW") || keys.has("ArrowUp")) - Number(keys.has("KeyS") || keys.has("ArrowDown")) : 0;
    const moveSide = enabled && keys ? Number(keys.has("KeyD") || keys.has("ArrowRight")) - Number(keys.has("KeyA") || keys.has("ArrowLeft")) : 0;
    const isSprinting = enabled && keys ? keys.has("ShiftLeft") || keys.has("ShiftRight") : false;

    movement.current.set(0, 0, 0);

    if (moveForward !== 0 || moveSide !== 0) {
      camera.getWorldDirection(cameraForward.current);
      cameraForward.current.y = 0;
      cameraForward.current.normalize();
      cameraRight.current.crossVectors(cameraForward.current, new THREE.Vector3(0, 1, 0)).normalize();

      movement.current
        .addScaledVector(cameraForward.current, moveForward)
        .addScaledVector(cameraRight.current, moveSide)
        .normalize();

      desiredRotationRef.current = Math.atan2(movement.current.x, movement.current.z);
    }

    const currentVelocity = body.linvel();
    const speed = isSprinting ? SPRINT_SPEED : WALK_SPEED;
    const currentlyMoving = movement.current.lengthSq() > 0;
    const nextVelocity =
      currentlyMoving
        ? {
            x: movement.current.x * speed,
            y: currentVelocity.y,
            z: movement.current.z * speed,
          }
        : {
            x: 0,
            y: currentVelocity.y,
            z: 0,
          };

    body.setLinvel(nextVelocity, true);

    const translation = body.translation();

    if (visualRef.current) {
      visualRef.current.position.set(translation.x, 0, translation.z);
      visualRef.current.rotation.y = THREE.MathUtils.lerp(
        visualRef.current.rotation.y,
        desiredRotationRef.current,
        delta * 8,
      );
    }

    if (movingRef.current !== currentlyMoving) {
      movingRef.current = currentlyMoving;
      setMovingState(currentlyMoving);
    }

    if (translation.y < -8) {
      body.setTranslation({ x: spawn.position[0], y: getSpawnY(), z: spawn.position[2] }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    if (onPositionChange && state.clock.elapsedTime - lastSyncRef.current > 0.075) {
      lastSyncRef.current = state.clock.elapsedTime;
      onPositionChange([translation.x, translation.y, translation.z], currentlyMoving);
    }
  });

  return (
    <>
      <RigidBody
        ref={bodyRef}
        key={sceneKey}
        colliders={false}
        canSleep={false}
        enabledRotations={[false, false, false]}
        friction={2.4}
        linearDamping={10}
        position={[spawn.position[0], getSpawnY(), spawn.position[2]]}
      >
        <CapsuleCollider args={[0.35, 0.4]} position={[0, 0.75, 0]} />
      </RigidBody>

      <group ref={visualRef}>
        <CampusAvatar isMoving={movingState} presetId="player" />
      </group>
    </>
  );
}

export default function CampusNavigator3D({
  map,
  storyLaunch = null,
}: {
  map: CampusMapData;
  storyLaunch?: CampusStoryLaunchContext | null;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pressedKeysRef = useRef(new Set<string>());
  const transitionTimerRef = useRef<number | null>(null);
  const cameraRigRef = useRef<CameraRigState>(createOutdoorCameraRig());

  const [sceneState, setSceneState] = useState<SceneState>({
    kind: "outdoor",
    spawn: campusWorld.outdoorSpawn,
  });
  const [playerPosition, setPlayerPosition] = useState<CampusVector3>(campusWorld.outdoorSpawn.position);
  const [activeInteraction, setActiveInteraction] = useState<InteractionState | null>(null);
  const [transitionLabel, setTransitionLabel] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sound = useSoundEngine();
  const {
    closeSummary,
    completeInteraction,
    coreQuestsComplete,
    currentQuest,
    currentQuestBuilding,
    discoveredBuildings,
    markBuildingDiscovered,
    quests,
    resetQuestState,
    summaryOpen,
  } = useCampusQuestState(map);
  const { canReturnToStory, returnToStory, storyReturnLabel } = useCampusStoryReturn(
    storyLaunch,
    quests,
  );

  const isIndoor = sceneState.kind === "interior";
  const currentInterior = isIndoor ? campusWorld.interiors[sceneState.sceneId] : null;
  const currentInteriorBuilding = currentInterior ? getBuildingById(map, currentInterior.buildingId) : null;
  const currentSceneTitle = currentInterior?.title ?? "Tempe Campus";
  const cameraSpawnPosition =
    sceneState.kind === "outdoor"
      ? sceneState.spawn.position
      : (currentInterior?.spawn.position ?? campusWorld.outdoorSpawn.position);

  const nearbyAction = useMemo<NearbyAction | null>(() => {
    if (transitionLabel || activeInteraction || summaryOpen) {
      return null;
    }

    if (sceneState.kind === "outdoor") {
      const candidates = Object.values(campusWorld.buildings)
        .map((building) => ({
          buildingId: building.id,
          distance: distanceXZ(playerPosition, building.portal.position),
        }))
        .filter((item) => item.distance <= OUTDOOR_INTERACT_DISTANCE)
        .sort((left, right) => left.distance - right.distance);

      if (candidates[0]) {
        return { kind: "enter-building", buildingId: candidates[0].buildingId };
      }

      return null;
    }

    if (!currentInterior) {
      return null;
    }

    const nearInteraction =
      distanceXZ(playerPosition, currentInterior.interactionPoint.position) <= INTERIOR_INTERACT_DISTANCE;
    const nearExit = distanceXZ(playerPosition, currentInterior.exitPortal.position) <= INTERIOR_INTERACT_DISTANCE;

    if (nearInteraction) {
      return { kind: "interact-interior", buildingId: currentInterior.buildingId };
    }

    if (nearExit) {
      return { kind: "exit-interior", buildingId: currentInterior.buildingId };
    }

    return null;
  }, [activeInteraction, currentInterior, playerPosition, sceneState.kind, summaryOpen, transitionLabel]);

  const prompt = useMemo(() => {
    if (!nearbyAction) {
      return null;
    }

    if (nearbyAction.kind === "enter-building") {
      const building = getBuildingById(map, nearbyAction.buildingId);

      if (!building) {
        return null;
      }

      if (building.id === "tooker" && !coreQuestsComplete) {
        return "Press E to talk to Jordan. The dorm return only counts after the other four support stops.";
      }

      return `Press E to enter ${building.label}.`;
    }

    if (nearbyAction.kind === "interact-interior") {
      if (currentInterior?.type === "minigame") {
        return "Press E to open the DARS terminal.";
      }

      return `Press E to talk inside ${currentInterior?.title ?? "this room"}.`;
    }

    return "Press E to head back outside.";
  }, [coreQuestsComplete, currentInterior, map, nearbyAction]);

  const currentInteractionBuilding = useMemo(
    () =>
      activeInteraction
        ? getBuildingById(map, activeInteraction.buildingId)
        : currentInteriorBuilding,
    [activeInteraction, currentInteriorBuilding, map],
  );

  const dialogLines = useMemo(
    () =>
      currentInteractionBuilding
        ? getDialogLines(currentInteractionBuilding, coreQuestsComplete)
        : [],
    [coreQuestsComplete, currentInteractionBuilding],
  );

  const interactionLocked = Boolean(activeInteraction || transitionLabel || summaryOpen);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === stage);
    };

    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    cameraRigRef.current = sceneState.kind === "outdoor" ? createOutdoorCameraRig() : createIndoorCameraRig();
  }, [sceneState]);

  const requestStageFullscreen = useCallback(async () => {
    const stage = stageRef.current;

    if (!stage || !document.fullscreenEnabled || document.fullscreenElement === stage) {
      return;
    }

    try {
      await stage.requestFullscreen();
    } catch {
      // Ignore unsupported or rejected fullscreen attempts.
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    sound.prime();

    const stage = stageRef.current;

    if (!stage || !document.fullscreenEnabled) {
      return;
    }

    try {
      if (document.fullscreenElement === stage) {
        await document.exitFullscreen();
        return;
      }

      await stage.requestFullscreen();
    } catch {
      // Ignore unsupported or rejected fullscreen attempts.
    }
  }, [sound]);

  const handleStagePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (interactionLocked) {
        return;
      }

      if (event.target instanceof Element && event.target.closest("[data-campus-ui='true']")) {
        return;
      }

      sound.prime();
      void requestStageFullscreen();

      cameraRigRef.current.isDragging = true;
      cameraRigRef.current.pointerId = event.pointerId;
      cameraRigRef.current.lastX = event.clientX;
      cameraRigRef.current.lastY = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [interactionLocked, requestStageFullscreen, sound],
  );

  const handleStagePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const rig = cameraRigRef.current;

    if (!rig.isDragging || rig.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - rig.lastX;
    const deltaY = event.clientY - rig.lastY;
    rig.lastX = event.clientX;
    rig.lastY = event.clientY;
    rig.yaw -= deltaX * 0.0085;
    rig.pitch = clamp(rig.pitch - deltaY * 0.0058, rig.minPitch, rig.maxPitch);
  }, []);

  const stopDragging = useCallback((pointerId?: number) => {
    const rig = cameraRigRef.current;

    if (pointerId !== undefined && rig.pointerId !== pointerId) {
      return;
    }

    rig.isDragging = false;
    rig.pointerId = null;
  }, []);

  const handleStageWheel = useCallback((event: ReactWheelEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("[data-campus-ui='true']")) {
      return;
    }

    event.preventDefault();
    const rig = cameraRigRef.current;
    rig.distance = clamp(rig.distance + event.deltaY * 0.012, rig.minDistance, rig.maxDistance);
  }, []);

  const beginTransition = useCallback((label: string, next: () => void) => {
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }

    setTransitionLabel(label);
    transitionTimerRef.current = window.setTimeout(() => {
      next();
      setTransitionLabel(null);
      transitionTimerRef.current = null;
    }, 320);
  }, []);

  const handleInteractionComplete = useCallback(
    (buildingId: string) => {
      const finishedDormReturn = buildingId === "tooker" && coreQuestsComplete;

      completeInteraction(buildingId);
      setActiveInteraction(null);

      if (finishedDormReturn) {
        sound.chime();
        return;
      }

      sound.correct();
    },
    [completeInteraction, coreQuestsComplete, sound],
  );

  const enterBuilding = useCallback(
    (buildingId: string) => {
      const outdoorBuilding = campusWorld.buildings[buildingId];
      const mapBuilding = getBuildingById(map, buildingId);

      if (!outdoorBuilding || !mapBuilding) {
        return;
      }

      markBuildingDiscovered(buildingId);
      sound.whoosh();
      beginTransition(`Entering ${mapBuilding.label}`, () => {
        setSceneState({
          kind: "interior",
          buildingId,
          sceneId: outdoorBuilding.interiorSceneId,
        });
        setPlayerPosition(outdoorBuilding.portal.position);
      });
    },
    [beginTransition, map, markBuildingDiscovered, sound],
  );

  const exitInterior = useCallback(
    (buildingId: string) => {
      const outdoorBuilding = campusWorld.buildings[buildingId];
      const mapBuilding = getBuildingById(map, buildingId);

      if (!outdoorBuilding || !mapBuilding) {
        return;
      }

      sound.whoosh();
      beginTransition(`Back outside ${mapBuilding.label}`, () => {
        setSceneState({
          kind: "outdoor",
          spawn: getInteriorExitSpawn(outdoorBuilding),
        });
        setPlayerPosition(getInteriorExitSpawn(outdoorBuilding).position);
      });
    },
    [beginTransition, map, sound],
  );

  const handleInteract = useCallback(() => {
    sound.prime();

    if (!nearbyAction || interactionLocked) {
      return;
    }

    if (nearbyAction.kind === "enter-building") {
      enterBuilding(nearbyAction.buildingId);
      return;
    }

    if (nearbyAction.kind === "exit-interior") {
      exitInterior(nearbyAction.buildingId);
      return;
    }

    if (!currentInterior) {
      return;
    }

    if (currentInterior.type === "minigame") {
      setActiveInteraction({
        buildingId: currentInterior.buildingId,
        type: "minigame",
      });
      sound.pop();
      return;
    }

    setActiveInteraction({
      buildingId: currentInterior.buildingId,
      type: currentInterior.type,
      lineIndex: 0,
      sequenceDone: false,
    });
    sound.pop();
  }, [currentInterior, enterBuilding, exitInterior, interactionLocked, nearbyAction, sound]);

  useEffect(() => {
    const pressedKeys = pressedKeysRef.current;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.code === "KeyE" || event.code === "Enter") {
        event.preventDefault();
        handleInteract();
        return;
      }

      if (event.code === "KeyF") {
        event.preventDefault();
        void toggleFullscreen();
        return;
      }

      sound.prime();
      pressedKeys.add(event.code);
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressedKeys.delete(event.code);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      pressedKeys.clear();
    };
  }, [handleInteract, sound, toggleFullscreen]);

  function resetExperience() {
    setSceneState({ kind: "outdoor", spawn: campusWorld.outdoorSpawn });
    setPlayerPosition(campusWorld.outdoorSpawn.position);
    setActiveInteraction(null);
    setTransitionLabel(null);
    resetQuestState();
  }

  function syncPlayer(position: CampusVector3, _moving: boolean) {
    void _moving;
    setPlayerPosition(position);
  }

  const completedSummaryBuildings = map.buildings.filter(
    (building) =>
      building.id !== "tooker" &&
      building.id !== "byeng" &&
      discoveredBuildings.includes(building.id) &&
      Boolean(campusWorld.buildings[building.id]),
  );

  return (
    <div className="campus-3d-shell">
      <div
        ref={stageRef}
        className={`relative h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,198,39,0.18),transparent_32%),linear-gradient(180deg,#28180f_0%,#120c08_100%)] ${isFullscreen ? "fixed inset-0 z-[90]" : ""}`}
        onContextMenu={(event) => event.preventDefault()}
        onPointerCancel={(event) => stopDragging(event.pointerId)}
        onPointerDown={handleStagePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={(event) => stopDragging(event.pointerId)}
        onWheel={handleStageWheel}
      >
        <Canvas
          shadows
          camera={{ position: [6, 6.5, 11], fov: 48 }}
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            gl.shadowMap.type = THREE.PCFShadowMap;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.78;
          }}
        >
          <color attach="background" args={[sceneState.kind === "outdoor" ? "#efe5d6" : "#ead9c3"]} />
          {sceneState.kind === "outdoor" ? <fog attach="fog" args={["#efe5d6", 18, 96]} /> : null}

          <CameraController
            cameraRigRef={cameraRigRef}
            interior={currentInterior}
            isOutdoor={sceneState.kind === "outdoor"}
            playerPosition={playerPosition}
            sceneKey={sceneState.kind === "outdoor" ? `outdoor-${sceneState.spawn.position.join(",")}` : currentInterior?.id ?? "interior"}
            spawnPosition={cameraSpawnPosition}
          />

          {sceneState.kind === "outdoor" ? (
            <OutdoorScene
              currentQuestBuildingId={currentQuestBuilding?.id ?? null}
            enabled={!interactionLocked}
            map={map}
            nearbyAction={nearbyAction}
            onPositionChange={syncPlayer}
            pressedKeysRef={pressedKeysRef}
            spawn={sceneState.spawn}
            world={campusWorld}
          />
          ) : currentInterior && currentInteriorBuilding ? (
            <InteriorScene
              building={currentInteriorBuilding}
              enabled={!interactionLocked}
              interior={currentInterior}
              nearbyAction={nearbyAction}
              onPositionChange={syncPlayer}
              pressedKeysRef={pressedKeysRef}
            />
          ) : null}
        </Canvas>

        <CampusGameHUD3D
          currentQuestBuildingId={currentQuestBuilding?.id ?? null}
          currentQuestBuildingLabel={currentQuestBuilding?.label ?? null}
          currentQuestLabel={currentQuest?.label ?? null}
          currentSceneTitle={currentSceneTitle}
          discoveredBuildings={discoveredBuildings}
          isFullscreen={isFullscreen}
          isIndoor={isIndoor}
          onReturnToStory={canReturnToStory ? () => returnToStory() : undefined}
          onToggleFullscreen={() => void toggleFullscreen()}
          playerPosition={playerPosition}
          prompt={prompt}
          quests={quests}
          storyReturnLabel={storyReturnLabel}
          world={campusWorld}
        />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-[linear-gradient(180deg,rgba(9,6,4,0.8),transparent)] px-4 pb-20 pt-4 text-white"
          data-campus-ui="true"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-full border border-white/10 bg-[rgba(16,10,8,0.56)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#ffc627] backdrop-blur-md">
              3D Campus Explorer
            </div>
            <div className="rounded-full border border-white/10 bg-[rgba(16,10,8,0.5)] px-4 py-2 font-[var(--font-sketch-body)] text-[0.98rem] text-[#f6e7d7] backdrop-blur-md">
              {currentQuest
                ? `${currentQuest.label} · ${quests.filter((quest) => quest.completed).length}/${quests.length} quests`
                : "All quests cleared"}
            </div>
          </div>
        </div>

        {transitionLabel ? (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(18,12,8,0.62)] backdrop-blur-md"
            data-campus-ui="true"
          >
            <div className="rounded-[2rem] border border-white/10 bg-[rgba(12,8,6,0.72)] px-8 py-7 text-center shadow-[0_30px_80px_rgba(0,0,0,0.36)]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#ffc627]">
                Portal Transition
              </p>
              <p className="mt-3 font-[var(--font-sketch-display)] text-[2rem] leading-none text-white">
                {transitionLabel}
              </p>
            </div>
          </div>
        ) : null}

        {activeInteraction && currentInteractionBuilding ? (
          <div
            className="absolute inset-0 z-40 overflow-y-auto bg-[rgba(18,12,8,0.56)] px-4 py-8 backdrop-blur-sm"
            data-campus-ui="true"
          >
            <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
              <div className="w-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,249,241,0.98),rgba(255,245,235,0.98))] p-6 text-[#261811] shadow-[0_35px_90px_rgba(0,0,0,0.34)] md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#8c1d40]">
                      {activeInteraction.type === "minigame" ? "Terminal" : "Interior encounter"}
                    </p>
                    <h2 className="mt-2 font-[var(--font-sketch-display)] text-[2rem] leading-none text-[#1f130d]">
                      {currentInteractionBuilding.name}
                    </h2>
                    <p className="mt-3 max-w-2xl font-[var(--font-sketch-body)] text-[1.06rem] leading-7 text-[#5c4838]">
                      {currentInterior?.summary ??
                        "A walkable room hub that turns a vague campus label into a place you can picture."}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-[#2a2018]/12 bg-white/80 px-4 py-2 text-sm font-semibold text-[#8c1d40] transition hover:border-[#8c1d40]/30"
                    onClick={() => setActiveInteraction(null)}
                  >
                    Close
                  </button>
                </div>

                {activeInteraction.type === "minigame" ? (
                  <div className="mt-8 rounded-[1.7rem] border border-[#2a2018]/10 bg-white/86 p-4 md:p-6">
                    <p className="mb-4 font-[var(--font-sketch-body)] text-[1.05rem] leading-7 text-[#5c4838]">
                      Walk up to the terminal and practice scanning DARS before it matters in a real advising appointment.
                    </p>
                    <MiniGameRouter
                      type={currentInteractionBuilding.interactionTarget as MiniGameType}
                      onComplete={() => handleInteractionComplete(currentInteractionBuilding.id)}
                      onInteract={sound.prime}
                      sound={sound}
                    />
                  </div>
                ) : activeInteraction.type === "dialog" ? (
                  <div className="mt-8 rounded-[1.7rem] border border-[#2a2018]/10 bg-white/88 p-4 md:p-6">
                    <SketchDialogSequence
                      lines={dialogLines}
                      initialLineIndex={activeInteraction.lineIndex}
                      locationLabel={currentInterior?.title ?? currentInteractionBuilding.label}
                      finalButtonLabel="Back to room ►"
                      onInteract={sound.prime}
                      onLineIndexChange={(nextIndex) =>
                        setActiveInteraction((previous) =>
                          previous && previous.type === "dialog"
                            ? { ...previous, lineIndex: nextIndex }
                            : previous,
                        )
                      }
                      onSequenceComplete={() => handleInteractionComplete(currentInteractionBuilding.id)}
                      onSpeakerChange={sound.whoosh}
                    />
                  </div>
                ) : !activeInteraction.sequenceDone ? (
                  <div className="mt-8 rounded-[1.7rem] border border-[#2a2018]/10 bg-white/88 p-4 md:p-6">
                    <SketchDialogSequence
                      lines={dialogLines}
                      initialLineIndex={activeInteraction.lineIndex}
                      locationLabel={currentInterior?.title ?? currentInteractionBuilding.label}
                      finalButtonLabel="See details ▼"
                      onInteract={sound.prime}
                      onLineIndexChange={(nextIndex) =>
                        setActiveInteraction((previous) =>
                          previous && previous.type === "walkthrough"
                            ? { ...previous, lineIndex: nextIndex }
                            : previous,
                        )
                      }
                      onSequenceComplete={() => {
                        sound.pop();
                        setActiveInteraction((previous) =>
                          previous && previous.type === "walkthrough"
                            ? { ...previous, sequenceDone: true }
                            : previous,
                        );
                      }}
                      onSpeakerChange={sound.whoosh}
                    />
                  </div>
                ) : (
                  <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.7rem] border border-[#2a2018]/10 bg-white/88 p-5">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#8c1d40]">
                        Real ASU info
                      </p>
                      <div className="mt-4 space-y-4 font-[var(--font-sketch-body)] text-[1.02rem] leading-7 text-[#5c4838]">
                        <div>
                          <strong className="block text-[#22140e]">Address</strong>
                          <span>{currentInteractionBuilding.realLocation?.address ?? "See walkthrough page for location details."}</span>
                        </div>
                        <div>
                          <strong className="block text-[#22140e]">Hours</strong>
                          <span>{currentInteractionBuilding.realLocation?.hours ?? "Hours vary by location."}</span>
                        </div>
                        <div>
                          <strong className="block text-[#22140e]">Phone</strong>
                          <span>{currentInteractionBuilding.realLocation?.phone ?? "Call the front desk or check the walkthrough page."}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.7rem] border border-[#2a2018]/10 bg-[linear-gradient(180deg,rgba(255,198,39,0.14),rgba(255,255,255,0.92))] p-5">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#8c1d40]">
                        Next step
                      </p>
                      <p className="mt-4 font-[var(--font-sketch-body)] text-[1.05rem] leading-7 text-[#4f3c2e]">
                        You now have the emotional preview. If you want the practical walkthrough, keep going from here.
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={`/finder/walkthrough/${currentInteractionBuilding.interactionTarget as ResourceSlug}`}
                          className="button-gold"
                          onClick={() => handleInteractionComplete(currentInteractionBuilding.id)}
                        >
                          Full Walkthrough
                        </Link>
                        {currentInteractionBuilding.realLocation?.mapLink ? (
                          <a
                            className="button-secondary"
                            href={currentInteractionBuilding.realLocation.mapLink}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open in Maps
                          </a>
                        ) : null}
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => {
                            handleInteractionComplete(currentInteractionBuilding.id);
                            exitInterior(currentInteractionBuilding.id);
                          }}
                        >
                          Back Outside
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {summaryOpen ? (
          <div
            className="absolute inset-0 z-50 overflow-y-auto bg-[rgba(11,8,6,0.74)] px-4 py-8 backdrop-blur-md"
            data-campus-ui="true"
          >
            <div className="mx-auto flex min-h-full max-w-4xl items-center justify-center">
              <div className="w-full rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,249,241,0.98),rgba(255,244,233,0.98))] p-7 text-[#24170f] shadow-[0_35px_90px_rgba(0,0,0,0.34)] md:p-9">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#8c1d40]">
                  Quest complete
                </p>
                <h2 className="mt-3 font-[var(--font-sketch-display)] text-[2.35rem] leading-none text-[#1f130d]">
                  The support map now feels like a place, not a mystery.
                </h2>
                <p className="mt-4 max-w-3xl font-[var(--font-sketch-body)] text-[1.08rem] leading-8 text-[#5a4637]">
                  You walked the key support stops, stepped into the rooms, and practiced the DARS terminal. That is the point of this mode: lower the emotional cost of the first real visit.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {completedSummaryBuildings.map((building) => (
                    <div
                      key={building.id}
                      className="rounded-[1.6rem] border border-[#2a2018]/10 bg-white/82 p-5"
                    >
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#8c1d40]">
                        {building.label}
                      </p>
                      <h3 className="mt-2 font-[var(--font-sketch-display)] text-[1.45rem] leading-none text-[#1f130d]">
                        {building.name}
                      </h3>
                      <p className="mt-3 font-[var(--font-sketch-body)] text-[1rem] leading-7 text-[#5d493a]">
                        {building.realLocation?.address ?? "Visit the finder walkthrough for the exact next step."}
                      </p>
                      {building.interactionType === "walkthrough" ? (
                        <div className="mt-4">
                          <Link
                            href={`/finder/walkthrough/${building.interactionTarget as ResourceSlug}`}
                            className="button-secondary"
                          >
                            Open walkthrough
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      closeSummary();
                      setSceneState({ kind: "outdoor", spawn: campusWorld.outdoorSpawn });
                    }}
                  >
                    Keep roaming
                  </button>
                  <button type="button" className="button-gold" onClick={resetExperience}>
                    Explore again
                  </button>
                  {canReturnToStory && storyReturnLabel ? (
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => returnToStory(true)}
                    >
                      {storyReturnLabel}
                    </button>
                  ) : null}
                  <Link href="/finder" className="button-primary">
                    Go to finder
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
