"use client";

function wobble(seed: number, index: number, amplitude: number) {
  return Math.sin(seed * 1.173 + index * 1.911) * amplitude;
}

export function generateWobblyRect(width: number, height: number, seed: number) {
  const inset = width * 0.028;
  const amp = width * 0.008;
  const left = inset + wobble(seed, 1, amp);
  const top = inset + wobble(seed, 2, amp * 0.8);
  const right = width - inset + wobble(seed, 3, amp);
  const bottom = height - inset + wobble(seed, 4, amp * 0.8);

  const qX = (right - left) / 4;
  const qY = (bottom - top) / 4;

  const tl = [left + wobble(seed, 5, amp), top + wobble(seed, 6, amp * 0.7)];
  const tq1 = [left + qX + wobble(seed, 40, amp * 0.9), top + wobble(seed, 41, amp)];
  const tm = [left + 2 * qX + wobble(seed, 13, amp), top + wobble(seed, 14, amp * 1.1)];
  const tq3 = [left + 3 * qX + wobble(seed, 42, amp * 0.8), top + wobble(seed, 43, amp)];
  const tr = [right + wobble(seed, 7, amp * 0.6), top + wobble(seed, 8, amp * 0.7)];

  const rq1 = [right + wobble(seed, 44, amp), top + qY + wobble(seed, 45, amp * 0.9)];
  const rm = [right + wobble(seed, 15, amp * 1.2), top + 2 * qY + wobble(seed, 16, amp)];
  const rq3 = [right + wobble(seed, 46, amp), top + 3 * qY + wobble(seed, 47, amp * 0.9)];
  const br = [right + wobble(seed, 9, amp * 0.7), bottom + wobble(seed, 10, amp * 0.6)];

  const bq1 = [left + 3 * qX + wobble(seed, 48, amp * 0.8), bottom + wobble(seed, 49, amp)];
  const bm = [left + 2 * qX + wobble(seed, 17, amp), bottom + wobble(seed, 18, amp * 1.1)];
  const bq3 = [left + qX + wobble(seed, 50, amp * 0.9), bottom + wobble(seed, 51, amp)];
  const bl = [left + wobble(seed, 11, amp * 0.8), bottom + wobble(seed, 12, amp * 0.6)];

  const lq1 = [left + wobble(seed, 52, amp), top + 3 * qY + wobble(seed, 53, amp * 0.9)];
  const lm = [left + wobble(seed, 19, -amp * 1.1), top + 2 * qY + wobble(seed, 20, amp)];
  const lq3 = [left + wobble(seed, 54, amp), top + qY + wobble(seed, 55, amp * 0.9)];

  return [
    `M ${tl[0]} ${tl[1]}`,
    `Q ${tq1[0]} ${tq1[1]} ${tm[0]} ${tm[1]}`,
    `Q ${tq3[0]} ${tq3[1]} ${tr[0]} ${tr[1]}`,
    `Q ${rq1[0]} ${rq1[1]} ${rm[0]} ${rm[1]}`,
    `Q ${rq3[0]} ${rq3[1]} ${br[0]} ${br[1]}`,
    `Q ${bq1[0]} ${bq1[1]} ${bm[0]} ${bm[1]}`,
    `Q ${bq3[0]} ${bq3[1]} ${bl[0]} ${bl[1]}`,
    `Q ${lq1[0]} ${lq1[1]} ${lm[0]} ${lm[1]}`,
    `Q ${lq3[0]} ${lq3[1]} ${tl[0]} ${tl[1]}`,
    "Z",
  ].join(" ");
}

export function generateWobblyCirclePath(size: number, seed: number) {
  const radius = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const points = Array.from({ length: 10 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 10;
    const localRadius = radius + wobble(seed, index + 1, 1.4);
    const x = cx + Math.cos(angle) * localRadius;
    const y = cy + Math.sin(angle) * localRadius;
    return { x, y };
  });

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2 + wobble(seed, index + 20, 0.8);
    const controlY = (previous.y + point.y) / 2 + wobble(seed, index + 30, 0.8);
    return `${path} Q ${controlX} ${controlY} ${point.x} ${point.y}`;
  }, "") + " Z";
}

export function generateWobblyPebblePath(size: number, seed: number) {
  const cx = size / 2;
  const cy = size / 2;
  const radiusX = size * 0.28;
  const radiusY = size * 0.22;
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    const localRadiusX = radiusX + wobble(seed, index + 31, 0.9);
    const localRadiusY = radiusY + wobble(seed, index + 41, 0.8);
    return {
      x: cx + Math.cos(angle) * localRadiusX,
      y: cy + Math.sin(angle) * localRadiusY,
    };
  });

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2 + wobble(seed, index + 51, 0.55);
    const controlY = (previous.y + point.y) / 2 + wobble(seed, index + 61, 0.55);
    return `${path} Q ${controlX} ${controlY} ${point.x} ${point.y}`;
  }, "") + " Z";
}
