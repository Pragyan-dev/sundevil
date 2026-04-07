"use client";

import type {
  CampusBuilding,
  CampusDecoration,
  CampusDirection,
  CampusMapData,
  CampusPath,
  CampusPlayer,
} from "@/lib/types";

export const CAMPUS_PLAYER_RADIUS = 18;
export const CAMPUS_INTERACTION_RADIUS = 58;

function wobble(seed: number, step: number) {
  return Math.sin(seed * 0.73 + step * 1.91) * 3;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getBuildingCenter(building: CampusBuilding) {
  return {
    x: building.x + building.width / 2,
    y: building.y + building.height / 2,
  };
}

export function clampCamera(
  cameraX: number,
  cameraY: number,
  viewportWidth: number,
  viewportHeight: number,
  map: CampusMapData,
) {
  return {
    x: clamp(cameraX, 0, Math.max(0, map.mapWidth - viewportWidth)),
    y: clamp(cameraY, 0, Math.max(0, map.mapHeight - viewportHeight)),
  };
}

export function clampPlayer(x: number, y: number, map: CampusMapData) {
  return {
    x: clamp(x, CAMPUS_PLAYER_RADIUS, map.mapWidth - CAMPUS_PLAYER_RADIUS),
    y: clamp(y, CAMPUS_PLAYER_RADIUS, map.mapHeight - CAMPUS_PLAYER_RADIUS),
  };
}

export function collidesWithBuildings(
  x: number,
  y: number,
  buildings: CampusBuilding[],
  radius = CAMPUS_PLAYER_RADIUS,
) {
  return buildings.some((building) => {
    const padding = 8;
    return (
      x + radius > building.x + padding &&
      x - radius < building.x + building.width - padding &&
      y + radius > building.y + padding &&
      y - radius < building.y + building.height - padding
    );
  });
}

export function findNearbyBuilding(player: CampusPlayer, buildings: CampusBuilding[]) {
  return (
    buildings.find((building) => {
      const dx = player.x - building.entranceX;
      const dy = player.y - building.entranceY;
      return Math.hypot(dx, dy) <= CAMPUS_INTERACTION_RADIUS;
    }) ?? null
  );
}

function drawWobblyRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + wobble(seed, 1), y + wobble(seed, 2));
  ctx.lineTo(x + width + wobble(seed, 3), y + wobble(seed, 4));
  ctx.lineTo(x + width + wobble(seed, 5), y + height + wobble(seed, 6));
  ctx.lineTo(x + wobble(seed, 7), y + height + wobble(seed, 8));
  ctx.closePath();
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  path: CampusPath,
  buildingsById: Map<string, CampusBuilding>,
) {
  const from = buildingsById.get(path.from);
  const to = buildingsById.get(path.to);

  if (!from || !to) {
    return;
  }

  const fromPoint = { x: from.entranceX, y: from.entranceY };
  const toPoint = { x: to.entranceX, y: to.entranceY };

  ctx.save();
  ctx.strokeStyle = "rgba(38, 30, 20, 0.5)";
  ctx.setLineDash([10, 10]);
  ctx.lineWidth = 3;
  ctx.beginPath();

  if (path.type === "horizontal") {
    const midX = (fromPoint.x + toPoint.x) / 2;
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(midX, fromPoint.y);
    ctx.lineTo(midX, toPoint.y);
    ctx.lineTo(toPoint.x, toPoint.y);
  } else if (path.type === "vertical") {
    const midY = (fromPoint.y + toPoint.y) / 2;
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(fromPoint.x, midY);
    ctx.lineTo(toPoint.x, midY);
    ctx.lineTo(toPoint.x, toPoint.y);
  } else {
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.lineTo(toPoint.x, toPoint.y);
  }

  ctx.stroke();
  ctx.restore();
}

function drawQuestRouteHint(
  ctx: CanvasRenderingContext2D,
  player: CampusPlayer,
  target: CampusBuilding | null,
) {
  if (!target) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = "rgba(255, 198, 39, 0.42)";
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(player.x, player.y + 10);
  ctx.quadraticCurveTo(
    (player.x + target.entranceX) / 2,
    Math.min(player.y, target.entranceY) - 48,
    target.entranceX,
    target.entranceY - 8,
  );
  ctx.stroke();
  ctx.restore();
}

function drawPalmTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = "#1f1810";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + 30);
  ctx.lineTo(x + 2, y + 60);
  ctx.stroke();

  ["-38,-6", "-28,-18", "0,-24", "28,-18", "38,-5"].forEach((pair) => {
    const [dx, dy] = pair.split(",").map(Number);
    ctx.beginPath();
    ctx.moveTo(x, y + 18);
    ctx.quadraticCurveTo(x + dx / 2, y + dy, x + dx, y + 8);
    ctx.stroke();
  });
  ctx.restore();
}

function drawBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = "#1f1810";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 20, y);
  ctx.lineTo(x + 20, y);
  ctx.moveTo(x - 16, y + 8);
  ctx.lineTo(x + 16, y + 8);
  ctx.moveTo(x - 14, y);
  ctx.lineTo(x - 20, y + 18);
  ctx.moveTo(x + 14, y);
  ctx.lineTo(x + 20, y + 18);
  ctx.stroke();
  ctx.restore();
}

function drawDecoration(ctx: CanvasRenderingContext2D, decoration: CampusDecoration) {
  if (decoration.type === "palm_tree") {
    drawPalmTree(ctx, decoration.x, decoration.y);
    return;
  }

  drawBench(ctx, decoration.x, decoration.y);
}

function drawNpcMarker(ctx: CanvasRenderingContext2D, building: CampusBuilding, time: number) {
  if (!building.npc) {
    return;
  }

  const x = building.entranceX + 28;
  const y = building.entranceY - 28 + Math.sin(time / 230 + building.x * 0.01) * 3;

  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#1f1810";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#8c1d40";
  ctx.font = '16px "Permanent Marker", cursive';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("...", x, y - 1);
  ctx.restore();
}

function drawDiscoveredStamp(ctx: CanvasRenderingContext2D, building: CampusBuilding) {
  ctx.save();
  ctx.translate(building.x + building.width - 44, building.y + 28);
  ctx.rotate(-0.14);
  ctx.strokeStyle = "rgba(140,29,64,0.75)";
  ctx.fillStyle = "rgba(255,255,255,0.84)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-28, -16, 56, 32, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#8c1d40";
  ctx.font = '14px "Permanent Marker", cursive';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SEEN", 0, 1);
  ctx.restore();
}

function drawQuestMarker(ctx: CanvasRenderingContext2D, building: CampusBuilding, time: number) {
  const radius = 24 + Math.sin(time / 180) * 4;
  const x = building.entranceX;
  const y = building.entranceY - 10;

  ctx.save();
  ctx.strokeStyle = "#ffc627";
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#8c1d40";
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffc627";
  ctx.strokeStyle = "#1f1810";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x + 22, y - 22, 78, 30, 15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1f1810";
  ctx.font = '15px "Permanent Marker", cursive';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NEXT", x + 61, y - 7);
  ctx.restore();
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  building: CampusBuilding,
  isNearby: boolean,
  isCurrentGoal: boolean,
  promptLabel: string | null,
) {
  ctx.save();
  drawWobblyRect(ctx, building.x, building.y, building.width, building.height, building.x + building.y);
  ctx.fillStyle = isCurrentGoal ? "rgba(255, 198, 39, 0.12)" : "#fffdfa";
  ctx.fill();
  ctx.lineWidth = isNearby ? 5 : 3;
  ctx.strokeStyle = isNearby ? "#d6a100" : isCurrentGoal ? "#8c1d40" : "#1f1810";
  ctx.stroke();

  ctx.fillStyle = "#1f1810";
  ctx.font = '26px "Permanent Marker", cursive';
  ctx.textAlign = "center";
  ctx.fillText(building.icon, building.x + building.width / 2, building.y + building.height / 2 + 8);

  ctx.font = '24px "Patrick Hand", cursive';
  ctx.fillText(building.label, building.x + building.width / 2, building.y - 18);

  ctx.beginPath();
  ctx.moveTo(building.entranceX - 20, building.entranceY - 22);
  ctx.lineTo(building.entranceX + 20, building.entranceY - 22);
  ctx.strokeStyle = isNearby ? "#d6a100" : "rgba(31,24,16,0.45)";
  ctx.lineWidth = 4;
  ctx.stroke();

  if (promptLabel) {
    const bubbleY = building.y - 74;
    ctx.fillStyle = "#ffc627";
    ctx.strokeStyle = "#1f1810";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(building.x + 22, bubbleY, building.width - 44, 36, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1f1810";
    ctx.font = '18px "Patrick Hand", cursive';
    ctx.fillText(promptLabel, building.x + building.width / 2, bubbleY + 24);
  }

  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: CampusPlayer, time: number) {
  const bob = player.isMoving ? Math.sin(time / 100) * 2 : 0;
  const sway = player.frame === 0 ? -3 : 3;

  ctx.save();
  ctx.translate(player.x, player.y + bob);
  ctx.strokeStyle = "#1f1810";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(0, -10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, 12, 13, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffc627";
  if (player.direction === "up") {
    ctx.fillRect(-8, 6, 16, 12);
  } else if (player.direction === "down") {
    ctx.fillRect(-10, 6, 20, 12);
  } else if (player.direction === "left") {
    ctx.fillRect(-13, 6, 12, 12);
  } else {
    ctx.fillRect(1, 6, 12, 12);
  }

  ctx.strokeStyle = "#1f1810";
  ctx.beginPath();
  if (player.direction === "left" || player.direction === "right") {
    ctx.moveTo(-6, 26);
    ctx.lineTo(-6 + sway, 36);
    ctx.moveTo(6, 26);
    ctx.lineTo(6 - sway, 36);
  } else {
    ctx.moveTo(-5, 26);
    ctx.lineTo(-5 + sway, 36);
    ctx.moveTo(5, 26);
    ctx.lineTo(5 - sway, 36);
  }
  ctx.stroke();

  ctx.restore();
}

export function renderCampusScene({
  ctx,
  map,
  player,
  camera,
  viewportWidth,
  viewportHeight,
  nearBuildingId,
  currentQuestBuildingId,
  discoveredBuildingIds,
  time,
}: {
  ctx: CanvasRenderingContext2D;
  map: CampusMapData;
  player: CampusPlayer;
  camera: { x: number; y: number };
  viewportWidth: number;
  viewportHeight: number;
  nearBuildingId: string | null;
  currentQuestBuildingId: string | null;
  discoveredBuildingIds: string[];
  time: number;
}) {
  ctx.clearRect(0, 0, viewportWidth, viewportHeight);
  ctx.fillStyle = "#f5f0e8";
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  const buildingsById = new Map(map.buildings.map((building) => [building.id, building]));
  const currentQuestBuilding = currentQuestBuildingId
    ? buildingsById.get(currentQuestBuildingId) ?? null
    : null;

  map.paths.forEach((path) => drawPath(ctx, path, buildingsById));
  map.decorations.forEach((decoration) => drawDecoration(ctx, decoration));
  drawQuestRouteHint(ctx, player, currentQuestBuilding);

  map.buildings.forEach((building) => {
    drawBuilding(
      ctx,
      building,
      nearBuildingId === building.id,
      currentQuestBuildingId === building.id,
      nearBuildingId === building.id ? "Enter" : null,
    );
    if (discoveredBuildingIds.includes(building.id)) {
      drawDiscoveredStamp(ctx, building);
    }
    if (currentQuestBuildingId === building.id) {
      drawQuestMarker(ctx, building, time);
    }
    drawNpcMarker(ctx, building, time);
  });

  ctx.save();
  ctx.strokeStyle = "rgba(140,29,64,0.55)";
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(300, 118);
  ctx.lineTo(1520, 118);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(31,24,16,0.75)";
  ctx.font = '24px "Patrick Hand", cursive';
  ctx.fillText("Palm Walk", 840, 94);

  drawPlayer(ctx, player, time);
  ctx.restore();
}

export function getPathTargetFromTap(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  camera: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number,
) {
  const scaleX = canvasWidth / rect.width;
  const scaleY = canvasHeight / rect.height;

  return {
    x: (clientX - rect.left) * scaleX + camera.x,
    y: (clientY - rect.top) * scaleY + camera.y,
  };
}

export function directionVector(direction: CampusDirection) {
  if (direction === "up") return { dx: 0, dy: -1 };
  if (direction === "down") return { dx: 0, dy: 1 };
  if (direction === "left") return { dx: -1, dy: 0 };
  return { dx: 1, dy: 0 };
}

export function buildingProgressLabel(buildings: CampusBuilding[], discoveredIds: string[]) {
  const meaningfulStops = buildings.filter((building) => building.interactionType !== "dialog");
  const discovered = meaningfulStops.filter((building) => discoveredIds.includes(building.id)).length;

  return {
    discovered,
    total: meaningfulStops.length,
  };
}

export function getBuildingById(map: CampusMapData, id: string | null) {
  if (!id) {
    return null;
  }

  return map.buildings.find((building) => building.id === id) ?? null;
}

export function getQuestCompletion(quests: { completed?: boolean }[]) {
  const completed = quests.filter((quest) => quest.completed).length;
  return { completed, total: quests.length };
}

export function getBuildingConnectionPoint(building: CampusBuilding) {
  return getBuildingCenter(building);
}
