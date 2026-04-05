"use client";

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

function BaseAvatar({
  children,
  size,
  accentColor,
}: {
  children?: React.ReactNode;
  size: "large" | "small";
  accentColor: string;
}) {
  const config = sizeMap[size];

  return (
    <svg
      viewBox="0 0 360 520"
      width={config.width}
      height={config.height}
      className="sim-avatar-svg"
      aria-hidden="true"
    >
      <ellipse cx="182" cy="476" rx="92" ry="16" fill="rgba(0,0,0,0.12)" />
      <g
        fill="#fff"
        stroke="#1a1a1a"
        strokeWidth={config.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sketch)"
      >
        <path d="M115 206c6-30 31-55 66-60 50-7 92 21 100 70l11 118c2 23-16 44-40 46l-123 9c-25 2-47-17-49-42l-8-104c-3-21 3-29 18-37 6-3 15-4 25 0z" />
        <path d="M145 372c6 52-7 82-19 105M220 369c7 53 24 80 33 107" />
        <path d="M113 252c-21 22-31 53-27 91M262 243c23 18 34 51 33 87" />
        <path d="M117 83c19-35 56-52 98-46 40 5 72 31 82 69 8 33-1 74-22 99-20 24-50 37-83 37-34 0-66-17-85-47-17-26-22-80 10-112z" />
        <path d="M149 183c8-8 19-14 31-13 18 1 29 13 36 28 6 14 8 31 6 47-2 15-10 28-23 36-14 9-34 10-49 2-17-9-26-27-27-45-2-17 3-41 26-55z" />
        <circle cx="154" cy="184" r="5" fill="#1a1a1a" />
        <circle cx="210" cy="184" r="5" fill="#1a1a1a" />
        <path d="M166 210c11 8 24 8 36 0" fill="none" />
        <path d="M132 286c29 13 60 13 96 0" fill="none" />
        <path d="M136 318c27 10 55 10 86 0" fill="none" strokeDasharray="7 8" />
      </g>

      <g fill={accentColor} filter="url(#sketch)">
        <circle cx="104" cy="296" r="11" />
      </g>

      {children}
    </svg>
  );
}

function StudentAvatar({ size }: { size: "large" | "small" }) {
  return (
    <BaseAvatar size={size} accentColor="#FFC627">
      <g fill="#fff" stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} filter="url(#sketch)">
        <path d="M120 120c23-20 45-31 76-30 27 1 48 11 70 31-15-40-48-64-89-64-27 0-51 11-69 31-8 10-13 20-18 32 10-1 22-1 30 0z" />
        <path d="M120 241c-12 15-17 35-16 55l4 49c17 7 33 10 50 10-6-21-10-47-8-71 1-18 5-31 14-45-17 6-31 7-44 2z" />
        <path d="M239 239c12 16 16 34 15 53l-3 51c-18 6-33 9-50 9 6-18 10-46 8-68-1-18-5-33-15-46 18 7 30 7 45 1z" />
      </g>
      <g stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} strokeLinecap="round" filter="url(#sketch)">
        <path d="M104 292l2 84" />
        <path d="M100 314l11 1" stroke="#FFC627" />
      </g>
    </BaseAvatar>
  );
}

function ProfChenAvatar({ size }: { size: "large" | "small" }) {
  return (
    <BaseAvatar size={size} accentColor="#FFC627">
      <g fill="#fff" stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} filter="url(#sketch)">
        <path d="M105 105h153l-18 18H125z" />
        <path d="M180 65l98 40-98 39-98-39z" />
        <path d="M229 126c8 11 11 22 9 35" fill="none" />
        <rect x="132" y="172" width="31" height="21" rx="7" />
        <rect x="197" y="172" width="31" height="21" rx="7" />
        <path d="M163 183h34" fill="none" />
        <path d="M150 255c19-12 42-16 63-16 19 0 34 4 53 16" fill="none" />
      </g>
      <g stroke="#FFC627" strokeWidth={sizeMap[size].stroke} strokeLinecap="round" filter="url(#sketch)">
        <path d="M246 119v44" />
        <circle cx="246" cy="171" r="5" fill="#FFC627" stroke="none" />
      </g>
    </BaseAvatar>
  );
}

function AdvisorRiveraAvatar({ size }: { size: "large" | "small" }) {
  return (
    <BaseAvatar size={size} accentColor="#8C1D40">
      <g fill="#fff" stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} filter="url(#sketch)">
        <path d="M118 122c14-17 33-26 58-28 28-2 49 7 66 26-7-25-23-43-46-55-20-11-41-14-62-10-14 3-27 10-39 21 6 19 13 31 23 46z" />
        <path d="M125 244c22 5 44 7 67 7 21 0 42-2 63-7" fill="none" />
        <rect x="242" y="250" width="52" height="86" rx="7" transform="rotate(8 242 250)" />
        <path d="M244 266h37M249 286h30M251 305h27" fill="none" />
      </g>
      <g filter="url(#sketch)">
        <path d="M176 234c-3 20-2 44 2 69" fill="none" stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} />
        <rect x="164" y="301" width="28" height="35" rx="8" fill="#8C1D40" stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} />
        <circle cx="178" cy="319" r="6" fill="#FFC627" />
      </g>
    </BaseAvatar>
  );
}

function MarcusAvatar({ size }: { size: "large" | "small" }) {
  return (
    <BaseAvatar size={size} accentColor="#FFC627">
      <g fill="#fff" stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} filter="url(#sketch)">
        <path d="M115 112c20-24 48-34 79-32 31 3 55 18 72 44-3-26-17-49-40-64-22-15-48-22-74-16-19 3-36 15-49 32 4 13 6 22 12 36z" />
        <path d="M103 290c28 6 54 8 80 8 28 0 51-2 80-8" fill="none" />
      </g>
      <g filter="url(#sketch)">
        <path d="M262 244l34 45" fill="none" stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} />
        <path d="M291 278l11 17" fill="none" stroke="#FFC627" strokeWidth={sizeMap[size].stroke} />
        <circle cx="304" cy="297" r="5" fill="#FFC627" />
      </g>
    </BaseAvatar>
  );
}

function JordanAvatar({ size }: { size: "large" | "small" }) {
  return (
    <BaseAvatar size={size} accentColor="#FFC627">
      <g fill="#fff" stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} filter="url(#sketch)">
        <path d="M122 117c16-18 37-29 63-30 29-2 54 9 74 30-5-21-15-35-33-49-24-18-48-24-76-19-19 4-34 15-45 28 4 15 9 25 17 40z" />
        <path d="M104 287c30 8 53 10 79 10 27 0 52-2 82-10" fill="none" />
      </g>
      <g fill="#fff" stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} filter="url(#sketch)">
        <circle cx="118" cy="173" r="16" />
        <circle cx="246" cy="173" r="16" />
      </g>
      <g fill="none" stroke="#FFC627" strokeWidth={sizeMap[size].stroke} filter="url(#sketch)">
        <circle cx="118" cy="173" r="9" />
        <circle cx="246" cy="173" r="9" />
        <path d="M134 173h96" />
      </g>
    </BaseAvatar>
  );
}

function CounselorParkAvatar({ size }: { size: "large" | "small" }) {
  return (
    <BaseAvatar size={size} accentColor="#8C1D40">
      <g fill="#fff" stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} filter="url(#sketch)">
        <path d="M118 120c15-19 38-31 64-32 29-2 53 8 72 29-5-20-14-35-30-48-24-19-52-24-80-18-17 4-32 12-45 26 5 16 8 27 19 43z" />
        <path d="M104 285c28 8 53 10 78 10 29 0 54-2 84-10" fill="none" />
        <path d="M261 323c16 18 22 43 20 74" fill="none" />
        <ellipse cx="290" cy="365" rx="25" ry="17" />
        <path d="M288 346c-6-19-24-26-34-24 5 6 7 13 8 22 9 1 17 1 26 2z" />
      </g>
      <g filter="url(#sketch)">
        <path d="M266 329c9 0 17 6 22 18" fill="none" stroke="#8C1D40" strokeWidth={sizeMap[size].stroke} />
        <path d="M274 325c-7-10-16-15-28-14 7 7 11 15 13 24" fill="#FFC627" stroke="#1a1a1a" strokeWidth={sizeMap[size].stroke} />
      </g>
    </BaseAvatar>
  );
}

export function CharacterAvatar({ characterId, size = "large", className }: CharacterAvatarProps) {
  return (
    <div className={className}>
      {characterId === "you" ? <StudentAvatar size={size} /> : null}
      {characterId === "prof-chen" ? <ProfChenAvatar size={size} /> : null}
      {characterId === "advisor-rivera" ? <AdvisorRiveraAvatar size={size} /> : null}
      {characterId === "marcus" ? <MarcusAvatar size={size} /> : null}
      {characterId === "jordan" ? <JordanAvatar size={size} /> : null}
      {characterId === "counselor-park" ? <CounselorParkAvatar size={size} /> : null}
    </div>
  );
}
