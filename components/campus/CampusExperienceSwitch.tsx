"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

import CampusNavigator2D from "@/components/campus/CampusNavigator2D";
import type { CampusExperienceMode, CampusMapData } from "@/lib/types";

const CampusNavigator3D = dynamic(() => import("@/components/campus/CampusNavigator3D"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#120d09] px-6 text-center text-[#fff6eb]">
      <div className="max-w-lg rounded-[2rem] border border-white/10 bg-white/5 px-8 py-10 shadow-[0_30px_80px_rgba(0,0,0,0.34)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#ffc627]">
          Booting 3D Campus
        </p>
        <h1 className="mt-4 font-[var(--font-sketch-display)] text-4xl leading-none">
          Loading the outdoor scene, interiors, and quest HUD.
        </h1>
        <p className="mt-4 text-base leading-7 text-[#f0e4d6]">
          Desktop gets the new third-person campus. Phones and unsupported browsers stay on the
          2D map.
        </p>
      </div>
    </div>
  ),
});

function supportsWebGL() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

function getCampusModeSnapshot(): CampusExperienceMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const prefersFallback =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 1024px)").matches;

  if (prefersFallback || !supportsWebGL()) {
    return "2d-fallback";
  }

  return "3d";
}

function subscribeToCampusMode(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const pointerQuery = window.matchMedia("(pointer: coarse)");
  const widthQuery = window.matchMedia("(max-width: 1024px)");
  const notify = () => callback();

  pointerQuery.addEventListener("change", notify);
  widthQuery.addEventListener("change", notify);

  return () => {
    pointerQuery.removeEventListener("change", notify);
    widthQuery.removeEventListener("change", notify);
  };
}

export default function CampusExperienceSwitch({ map }: { map: CampusMapData }) {
  const mode = useSyncExternalStore(
    subscribeToCampusMode,
    getCampusModeSnapshot,
    () => null,
  );

  if (mode === null) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f5f0e8] px-6 text-center text-[#1d170f]">
        <div className="max-w-md rounded-[2rem] border border-black/10 bg-white/80 px-8 py-9 shadow-[0_22px_60px_rgba(0,0,0,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--asu-maroon)]">
            Campus Check
          </p>
          <p className="mt-4 font-[var(--font-sketch-body)] text-2xl leading-tight">
            Checking your device to decide between the full 3D campus and the 2D fallback.
          </p>
        </div>
      </div>
    );
  }

  if (mode === "2d-fallback") {
    return <CampusNavigator2D map={map} />;
  }

  return <CampusNavigator3D map={map} />;
}
