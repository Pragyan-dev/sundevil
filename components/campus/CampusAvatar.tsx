"use client";

import { useRef } from "react";
import { Edges, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import type {
  CampusAvatarAppearance,
  CampusAvatarPresetId,
  CampusAvatarRoleStyle,
  CampusVector3,
} from "@/lib/types";

const INK = "#201711";
const GOLD = "#ffc627";
const MAROON = "#8c1d40";

type AvatarPreset = {
  appearance: CampusAvatarAppearance;
  roleStyle: CampusAvatarRoleStyle;
};

const PRESETS: Record<CampusAvatarPresetId, AvatarPreset> = {
  player: {
    appearance: {
      skinColor: "#d9af90",
      hairColor: "#261b17",
      topColor: MAROON,
      topAccentColor: GOLD,
      bottomColor: "#334255",
      shoeColor: "#ece8df",
      soleColor: "#241913",
      backpackColor: GOLD,
      backpackAccentColor: MAROON,
      outerwearColor: null,
      hairStyle: "locs",
    },
    roleStyle: {
      shirtText: "ASU",
      sleeveLength: "short",
      accessory: "none",
      hasBackpack: true,
      posture: "open",
    },
  },
  jordan: {
    appearance: {
      skinColor: "#efc6a9",
      hairColor: "#3a251b",
      topColor: "#ddd0c0",
      topAccentColor: "#c3a16b",
      bottomColor: "#49515f",
      shoeColor: "#f4efe7",
      soleColor: "#34271e",
      backpackColor: "#6e7985",
      backpackAccentColor: "#d7be94",
      outerwearColor: "#d4c6b5",
      hairStyle: "curly-bun",
    },
    roleStyle: {
      shirtText: null,
      sleeveLength: "long",
      accessory: "none",
      hasBackpack: false,
      posture: "relaxed",
    },
  },
  "prof-chen": {
    appearance: {
      skinColor: "#f0cfb5",
      hairColor: "#17181d",
      topColor: "#cfd5dc",
      topAccentColor: "#5e6570",
      bottomColor: "#262b34",
      shoeColor: "#32261d",
      soleColor: "#18110d",
      backpackColor: null,
      backpackAccentColor: null,
      outerwearColor: "#5e6876",
      hairStyle: "parted-short",
    },
    roleStyle: {
      shirtText: null,
      sleeveLength: "long",
      accessory: "clipboard",
      hasBackpack: false,
      posture: "professional",
    },
  },
  "desk-aide": {
    appearance: {
      skinColor: "#d4a68b",
      hairColor: "#42261d",
      topColor: "#efe8db",
      topAccentColor: GOLD,
      bottomColor: "#546272",
      shoeColor: "#ece8e0",
      soleColor: "#281d17",
      backpackColor: null,
      backpackAccentColor: null,
      outerwearColor: "#d7c5a3",
      hairStyle: "ponytail",
    },
    roleStyle: {
      shirtText: "ASU",
      sleeveLength: "short",
      accessory: "lanyard",
      hasBackpack: false,
      posture: "open",
    },
  },
  tutor: {
    appearance: {
      skinColor: "#8d5c44",
      hairColor: "#251710",
      topColor: "#f5efe8",
      topAccentColor: MAROON,
      bottomColor: "#3f4555",
      shoeColor: "#f7f5ef",
      soleColor: "#261b15",
      backpackColor: null,
      backpackAccentColor: null,
      outerwearColor: MAROON,
      hairStyle: "short-curl",
    },
    roleStyle: {
      shirtText: null,
      sleeveLength: "long",
      accessory: "book",
      hasBackpack: false,
      posture: "open",
    },
  },
  "advisor-rivera": {
    appearance: {
      skinColor: "#b87e60",
      hairColor: "#241715",
      topColor: "#f6f1e7",
      topAccentColor: MAROON,
      bottomColor: "#463a35",
      shoeColor: "#ece5de",
      soleColor: "#251913",
      backpackColor: null,
      backpackAccentColor: null,
      outerwearColor: "#964161",
      hairStyle: "wavy-bob",
    },
    roleStyle: {
      shirtText: null,
      sleeveLength: "long",
      accessory: "clipboard",
      hasBackpack: false,
      posture: "professional",
    },
  },
  "counselor-park": {
    appearance: {
      skinColor: "#e1bf9d",
      hairColor: "#322720",
      topColor: "#f7efe5",
      topAccentColor: "#7aa083",
      bottomColor: "#4e4f58",
      shoeColor: "#efe9e1",
      soleColor: "#281d16",
      backpackColor: null,
      backpackAccentColor: null,
      outerwearColor: "#93a88d",
      hairStyle: "pulled-back",
    },
    roleStyle: {
      shirtText: null,
      sleeveLength: "long",
      accessory: "badge",
      hasBackpack: false,
      posture: "professional",
    },
  },
};

function accentOr(defaultValue: string, color?: string | null) {
  return color ?? defaultValue;
}

function renderHair(style: CampusAvatarAppearance["hairStyle"], color: string) {
  if (style === "locs") {
    return (
      <group>
        <mesh position={[0, 0.08, -0.03]}>
          <sphereGeometry args={[0.3, 20, 18]} />
          <meshStandardMaterial color={color} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        {[-0.2, -0.1, 0, 0.1, 0.2].map((x) => (
          <mesh key={`loc-${x}`} position={[x, -0.22, 0.1]}>
            <cylinderGeometry args={[0.03, 0.035, 0.46, 6]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        ))}
        {[-0.18, -0.06, 0.06, 0.18].map((x) => (
          <mesh key={`back-loc-${x}`} position={[x, -0.24, -0.16]}>
            <cylinderGeometry args={[0.03, 0.035, 0.42, 6]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        ))}
      </group>
    );
  }

  if (style === "curly-bun") {
    return (
      <group>
        <mesh position={[0, 0.08, -0.04]}>
          <sphereGeometry args={[0.31, 20, 18]} />
          <meshStandardMaterial color={color} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, 0.36, -0.22]}>
          <sphereGeometry args={[0.14, 14, 14]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      </group>
    );
  }

  if (style === "parted-short") {
    return (
      <group>
        <mesh position={[0, 0.09, -0.04]}>
          <sphereGeometry args={[0.31, 20, 18, 0, Math.PI * 2, 0, Math.PI / 1.65]} />
          <meshStandardMaterial color={color} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0.03, 0.14, 0.08]} rotation={[0.1, 0, -0.2]}>
          <boxGeometry args={[0.38, 0.06, 0.12]} />
          <meshStandardMaterial color="#2e323a" flatShading />
        </mesh>
      </group>
    );
  }

  if (style === "ponytail") {
    return (
      <group>
        <mesh position={[0, 0.08, -0.03]}>
          <sphereGeometry args={[0.31, 20, 18]} />
          <meshStandardMaterial color={color} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, -0.11, -0.32]}>
          <cylinderGeometry args={[0.05, 0.08, 0.42, 7]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      </group>
    );
  }

  if (style === "wavy-bob") {
    return (
      <group>
        <mesh position={[0, 0.08, -0.02]}>
          <sphereGeometry args={[0.31, 20, 18]} />
          <meshStandardMaterial color={color} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[-0.22, -0.18, 0]}>
          <boxGeometry args={[0.14, 0.36, 0.28]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
        <mesh position={[0.22, -0.18, 0]}>
          <boxGeometry args={[0.14, 0.36, 0.28]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      </group>
    );
  }

  if (style === "pulled-back") {
    return (
      <group>
        <mesh position={[0, 0.08, -0.04]}>
          <sphereGeometry args={[0.31, 20, 18]} />
          <meshStandardMaterial color={color} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, 0.28, -0.16]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, 0.08, -0.03]}>
        <sphereGeometry args={[0.31, 20, 18]} />
        <meshStandardMaterial color={color} flatShading />
        <Edges color={INK} scale={1.02} />
      </mesh>
      {style === "short-curl" ? (
        <mesh position={[0, 0.21, -0.02]}>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      ) : null}
    </group>
  );
}

function Accessory({
  roleStyle,
  accentColor,
}: {
  roleStyle: CampusAvatarRoleStyle;
  accentColor: string;
}) {
  if (roleStyle.accessory === "clipboard") {
    return (
      <group position={[0.52, 1.34, 0.18]} rotation={[0.2, -0.2, -0.45]}>
        <mesh>
          <boxGeometry args={[0.28, 0.46, 0.04]} />
          <meshStandardMaterial color="#f1e6d6" flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, 0.2, 0.03]}>
          <boxGeometry args={[0.12, 0.05, 0.02]} />
          <meshStandardMaterial color={accentColor} flatShading />
        </mesh>
      </group>
    );
  }

  if (roleStyle.accessory === "book") {
    return (
      <group position={[-0.48, 1.18, 0.16]} rotation={[0.2, 0.1, 0.25]}>
        <mesh>
          <boxGeometry args={[0.18, 0.36, 0.12]} />
          <meshStandardMaterial color={accentColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
      </group>
    );
  }

  if (roleStyle.accessory === "lanyard") {
    return (
      <group>
        <mesh position={[0, 1.92, 0.18]} rotation={[0.38, 0, 0]}>
          <torusGeometry args={[0.2, 0.018, 8, 24, Math.PI]} />
          <meshStandardMaterial color={accentColor} flatShading />
        </mesh>
        <mesh position={[0, 1.55, 0.21]}>
          <boxGeometry args={[0.1, 0.16, 0.03]} />
          <meshStandardMaterial color="#f6f1e8" flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
      </group>
    );
  }

  if (roleStyle.accessory === "badge") {
    return (
      <mesh position={[0.23, 1.58, 0.22]} rotation={[0, 0, -0.16]}>
        <boxGeometry args={[0.11, 0.16, 0.03]} />
        <meshStandardMaterial color="#f7f0e7" flatShading />
        <Edges color={INK} scale={1.02} />
      </mesh>
    );
  }

  return null;
}

export default function CampusAvatar({
  isMoving = false,
  position,
  presetId,
  rotationY = 0,
}: {
  isMoving?: boolean;
  position?: CampusVector3;
  presetId: CampusAvatarPresetId;
  rotationY?: number;
}) {
  const preset = PRESETS[presetId] ?? PRESETS["desk-aide"];
  const rootRef = useRef<THREE.Group | null>(null);
  const torsoRef = useRef<THREE.Group | null>(null);
  const hipsRef = useRef<THREE.Group | null>(null);
  const headRef = useRef<THREE.Group | null>(null);
  const backpackRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftLegRef = useRef<THREE.Group | null>(null);
  const rightLegRef = useRef<THREE.Group | null>(null);

  const {
    backpackAccentColor,
    backpackColor,
    bottomColor,
    hairColor,
    hairStyle,
    outerwearColor,
    shoeColor,
    skinColor,
    soleColor,
    topAccentColor,
    topColor,
  } = preset.appearance;
  const { accessory, hasBackpack, posture, shirtText, sleeveLength } = preset.roleStyle;
  const shoulderWidth = posture === "professional" ? 0.98 : 1.06;
  const torsoLean = posture === "relaxed" ? 0.05 : posture === "professional" ? -0.04 : 0;

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const locomotion = isMoving ? time * 7.8 : time * 2.1;
    const swing = isMoving ? Math.sin(locomotion) * 0.42 : Math.sin(locomotion) * 0.05;
    const counterSwing = isMoving ? Math.sin(locomotion + Math.PI) * 0.36 : Math.sin(locomotion + Math.PI) * 0.04;
    const bob = isMoving ? Math.abs(Math.sin(locomotion * 0.5)) * 0.06 : Math.sin(time * 1.7) * 0.018;

    if (torsoRef.current) {
      torsoRef.current.position.y = 1.52 + bob;
      torsoRef.current.rotation.z = isMoving ? Math.sin(locomotion) * 0.025 : 0;
      torsoRef.current.rotation.x = torsoLean + (isMoving ? Math.sin(locomotion * 0.5) * 0.02 : Math.sin(time * 1.2) * 0.01);
      torsoRef.current.scale.y = 1 + (isMoving ? 0 : Math.sin(time * 1.5) * 0.012);
    }

    if (hipsRef.current) {
      hipsRef.current.rotation.z = isMoving ? Math.sin(locomotion) * 0.05 : 0;
      hipsRef.current.position.y = 1.0 + bob * 0.2;
    }

    if (headRef.current) {
      headRef.current.position.y = 2.74 + bob * 0.75;
      headRef.current.rotation.z = isMoving ? Math.sin(locomotion) * 0.02 : 0;
      headRef.current.rotation.y = isMoving ? Math.sin(locomotion * 0.5) * 0.03 : 0;
    }

    if (backpackRef.current) {
      backpackRef.current.position.y = 1.58 + bob * 0.85;
      backpackRef.current.rotation.x = 0.1 + (isMoving ? Math.sin(locomotion) * 0.08 : 0);
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = swing;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = counterSwing;
    }
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = counterSwing * 0.88;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = swing * 0.88;
    }
  });

  return (
    <group ref={rootRef} position={position} rotation={[0, rotationY, 0]}>
      <group ref={hipsRef} position={[0, 1, 0]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.58, 0.34, 0.34]} />
          <meshStandardMaterial color={bottomColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
      </group>

      <group ref={torsoRef} position={[0, 1.52, 0]}>
        <mesh position={[0, 0.56, 0]}>
          <boxGeometry args={[shoulderWidth, 0.26, 0.42]} />
          <meshStandardMaterial color={outerwearColor ?? topColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, 0.22, 0.02]}>
          <capsuleGeometry args={[0.35, 0.72, 4, 10]} />
          <meshStandardMaterial color={topColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, -0.24, 0.02]}>
          <boxGeometry args={[0.56, 0.42, 0.34]} />
          <meshStandardMaterial color={topColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>

        {outerwearColor ? (
          <>
            <mesh position={[-0.19, 0.18, 0.2]}>
              <boxGeometry args={[0.18, 0.78, 0.06]} />
              <meshStandardMaterial color={outerwearColor} flatShading />
            </mesh>
            <mesh position={[0.19, 0.18, 0.2]}>
              <boxGeometry args={[0.18, 0.78, 0.06]} />
              <meshStandardMaterial color={outerwearColor} flatShading />
            </mesh>
          </>
        ) : null}

        {shirtText ? (
          <Text
            anchorX="center"
            anchorY="middle"
            color={accentOr(GOLD, topAccentColor)}
            fontSize={0.14}
            outlineColor={INK}
            outlineWidth={0.014}
            position={[0, 0.26, 0.24]}
          >
            {shirtText}
          </Text>
        ) : (
          <mesh position={[0, 0.28, 0.22]}>
            <boxGeometry args={[0.16, 0.12, 0.03]} />
            <meshStandardMaterial color={accentOr(GOLD, topAccentColor)} flatShading />
          </mesh>
        )}

        <Accessory roleStyle={{ accessory, hasBackpack, posture, shirtText, sleeveLength }} accentColor={accentOr(GOLD, topAccentColor)} />
      </group>

      <group ref={headRef} position={[0, 2.74, 0]}>
        <mesh position={[0, -0.02, 0.02]}>
          <sphereGeometry args={[0.29, 20, 18]} />
          <meshStandardMaterial color={skinColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, -0.18, 0.05]}>
          <boxGeometry args={[0.36, 0.18, 0.22]} />
          <meshStandardMaterial color={skinColor} flatShading />
        </mesh>
        <mesh position={[0.3, -0.02, 0]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color={skinColor} flatShading />
        </mesh>
        <mesh position={[-0.3, -0.02, 0]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color={skinColor} flatShading />
        </mesh>
        <mesh position={[0, -0.05, 0.29]}>
          <boxGeometry args={[0.08, 0.12, 0.09]} />
          <meshStandardMaterial color={skinColor} flatShading />
        </mesh>
        <mesh position={[-0.11, 0.02, 0.28]}>
          <boxGeometry args={[0.08, 0.02, 0.03]} />
          <meshStandardMaterial color={hairColor} flatShading />
        </mesh>
        <mesh position={[0.11, 0.02, 0.28]}>
          <boxGeometry args={[0.08, 0.02, 0.03]} />
          <meshStandardMaterial color={hairColor} flatShading />
        </mesh>
        <mesh position={[-0.11, -0.05, 0.29]}>
          <boxGeometry args={[0.045, 0.028, 0.02]} />
          <meshStandardMaterial color="#2f231d" flatShading />
        </mesh>
        <mesh position={[0.11, -0.05, 0.29]}>
          <boxGeometry args={[0.045, 0.028, 0.02]} />
          <meshStandardMaterial color="#2f231d" flatShading />
        </mesh>
        {renderHair(hairStyle, hairColor)}
      </group>

      {hasBackpack && backpackColor ? (
        <group ref={backpackRef} position={[0, 1.58, -0.27]}>
          <mesh position={[0, -0.04, 0]}>
            <boxGeometry args={[0.52, 0.74, 0.2]} />
            <meshStandardMaterial color={backpackColor} flatShading />
            <Edges color={INK} scale={1.02} />
          </mesh>
          <mesh position={[0, 0.08, 0.11]}>
            <boxGeometry args={[0.16, 0.16, 0.04]} />
            <meshStandardMaterial color={accentOr(MAROON, backpackAccentColor)} flatShading />
          </mesh>
        </group>
      ) : null}

      {hasBackpack && backpackColor ? (
        <>
          {[-0.18, 0.18].map((x) => (
            <mesh key={`strap-${x}`} position={[x, 1.76, 0.15]} rotation={[0.45, 0, x < 0 ? 0.12 : -0.12]}>
              <boxGeometry args={[0.07, 0.82, 0.05]} />
              <meshStandardMaterial color={accentOr(MAROON, backpackAccentColor)} flatShading />
            </mesh>
          ))}
        </>
      ) : null}

      <group ref={leftArmRef} position={[-shoulderWidth / 2 + 0.06, 2.05, 0.02]} rotation={[0, 0, 0.1]}>
        <mesh position={[0, -0.21, 0]}>
          <capsuleGeometry args={[0.11, sleeveLength === "short" ? 0.18 : 0.36, 4, 8]} />
          <meshStandardMaterial color={outerwearColor ?? topColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, sleeveLength === "short" ? -0.58 : -0.72, 0]}>
          <capsuleGeometry args={[0.09, sleeveLength === "short" ? 0.42 : 0.26, 4, 8]} />
          <meshStandardMaterial color={skinColor} flatShading />
        </mesh>
        <mesh position={[0, sleeveLength === "short" ? -0.93 : -1.0, 0.02]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color={skinColor} flatShading />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[shoulderWidth / 2 - 0.06, 2.05, 0.02]} rotation={[0, 0, -0.1]}>
        <mesh position={[0, -0.21, 0]}>
          <capsuleGeometry args={[0.11, sleeveLength === "short" ? 0.18 : 0.36, 4, 8]} />
          <meshStandardMaterial color={outerwearColor ?? topColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, sleeveLength === "short" ? -0.58 : -0.72, 0]}>
          <capsuleGeometry args={[0.09, sleeveLength === "short" ? 0.42 : 0.26, 4, 8]} />
          <meshStandardMaterial color={skinColor} flatShading />
        </mesh>
        <mesh position={[0, sleeveLength === "short" ? -0.93 : -1.0, 0.02]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color={skinColor} flatShading />
        </mesh>
      </group>

      <group ref={leftLegRef} position={[-0.18, 1.0, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.12, 0.5, 4, 8]} />
          <meshStandardMaterial color={bottomColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, -0.94, 0.04]}>
          <capsuleGeometry args={[0.1, 0.48, 4, 8]} />
          <meshStandardMaterial color={bottomColor} flatShading />
        </mesh>
        <mesh position={[0, -1.37, 0.12]}>
          <boxGeometry args={[0.22, 0.11, 0.42]} />
          <meshStandardMaterial color={shoeColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, -1.4, 0.16]}>
          <boxGeometry args={[0.22, 0.05, 0.18]} />
          <meshStandardMaterial color={soleColor} flatShading />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.18, 1.0, 0]}>
        <mesh position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.12, 0.5, 4, 8]} />
          <meshStandardMaterial color={bottomColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, -0.94, 0.04]}>
          <capsuleGeometry args={[0.1, 0.48, 4, 8]} />
          <meshStandardMaterial color={bottomColor} flatShading />
        </mesh>
        <mesh position={[0, -1.37, 0.12]}>
          <boxGeometry args={[0.22, 0.11, 0.42]} />
          <meshStandardMaterial color={shoeColor} flatShading />
          <Edges color={INK} scale={1.02} />
        </mesh>
        <mesh position={[0, -1.4, 0.16]}>
          <boxGeometry args={[0.22, 0.05, 0.18]} />
          <meshStandardMaterial color={soleColor} flatShading />
        </mesh>
      </group>
    </group>
  );
}
