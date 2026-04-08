"use client";

import { useEffect, useRef } from "react";

import type { CampusBuilding } from "@/lib/types";

export function useBuildingImages(buildings: CampusBuilding[]) {
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    const map = new Map<string, HTMLImageElement>();
    imagesRef.current = map;

    buildings.forEach((building) => {
      if (!building.photo) return;

      const img = new Image();
      img.onload = () => {
        map.set(building.id, img);
      };
      img.src = building.photo;
    });
  }, [buildings]);

  return imagesRef;
}
