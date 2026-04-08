"use client";

import Image from "next/image";

import type { MascotExpression } from "@/lib/resource-discovery-types";

const mascotImageByExpression: Record<MascotExpression, string> = {
  happy: "/mascot/happy.png",
  sad: "/mascot/sad.png",
  anxious: "/mascot/anxious.png",
  confused: "/mascot/confused.png",
  angry: "/mascot/angry.png",
  smirk: "/mascot/smirk.png",
  shocked: "/mascot/shocked.png",
  idea: "/mascot/idea.png",
};

interface CharacterAvatarProps {
  expression: MascotExpression;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  pulse?: boolean;
  framed?: boolean;
}

const sizeClassName = {
  sm: "h-12 w-12 rounded-2xl",
  md: "h-16 w-16 rounded-[1.35rem]",
  lg: "h-24 w-24 rounded-[1.75rem]",
  xl: "h-36 w-36 rounded-[2rem]",
  hero: "h-48 w-48 rounded-[2.4rem]",
};

export function CharacterAvatar({
  expression,
  size = "md",
  pulse = false,
  framed = true,
}: CharacterAvatarProps) {
  return (
    <div
      className={`relative overflow-hidden ${
        sizeClassName[size]
      } ${
        framed
          ? "border border-[#f0d8be] bg-[linear-gradient(180deg,rgba(255,198,39,0.22),rgba(255,255,255,0.14))] shadow-[0_12px_30px_rgba(44,17,22,0.12)]"
          : ""
      } ${pulse ? "resource-avatar-pop" : ""}`}
    >
      <div className="absolute inset-x-3 bottom-2 h-3 rounded-full bg-[rgba(44,17,22,0.12)] blur-sm" />
      <Image
        src={mascotImageByExpression[expression]}
        alt=""
        aria-hidden="true"
        fill
        sizes={
          size === "hero"
            ? "192px"
            : size === "xl"
              ? "144px"
              : size === "lg"
                ? "96px"
                : size === "md"
                  ? "64px"
                  : "48px"
        }
        className={`object-contain ${framed ? "p-1.5" : "p-0.5"}`}
        priority
      />
    </div>
  );
}
