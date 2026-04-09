"use client";

import Image from "next/image";

import type { CharacterId } from "@/lib/types";

interface CharacterAvatarProps {
  characterId: CharacterId;
  size?: "large" | "small";
  className?: string;
}

const sizeMap = {
  large: { width: 360, height: 520, stroke: 4 },
  small: { width: 92, height: 128, stroke: 3 },
};

const portraitImageByCharacterId: Partial<Record<CharacterId, string>> = {
  you: "/characters/me.png",
  "prof-chen": "/characters/prof-chen.png",
  "advisor-rivera": "/characters/advisor-rivera.png",
  marcus: "/characters/marcus.png",
  jordan: "/characters/jordan.png",
  "counselor-park": "/characters/counselor-park.png",
};

function RasterAvatar({
  characterId,
  size,
}: {
  characterId: keyof typeof portraitImageByCharacterId;
  size: "large" | "small";
}) {
  const config = sizeMap[size];
  const src = portraitImageByCharacterId[characterId];

  if (!src) {
    return null;
  }

  return (
    <div
      className="relative"
      style={{
        width: config.width,
        height: config.height,
      }}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={size === "large" ? "360px" : "92px"}
        className="object-contain"
        priority={size === "large"}
      />
    </div>
  );
}

export function CharacterAvatar({ characterId, size = "large", className }: CharacterAvatarProps) {
  return (
    <div className={className}>
      {characterId === "you" ? <RasterAvatar characterId="you" size={size} /> : null}
      {characterId === "prof-chen" ? <RasterAvatar characterId="prof-chen" size={size} /> : null}
      {characterId === "advisor-rivera" ? <RasterAvatar characterId="advisor-rivera" size={size} /> : null}
      {characterId === "marcus" ? <RasterAvatar characterId="marcus" size={size} /> : null}
      {characterId === "jordan" ? <RasterAvatar characterId="jordan" size={size} /> : null}
      {characterId === "counselor-park" ? <RasterAvatar characterId="counselor-park" size={size} /> : null}
    </div>
  );
}
