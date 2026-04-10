import type { AccessibilitySettings } from "@/lib/types";

export const ACCESSIBILITY_SETTINGS_STORAGE_KEY =
  "sundevilconnect-accessibility-v1";

export function createDefaultAccessibilitySettings(
  prefersReducedMotion = false,
): AccessibilitySettings {
  return {
    textSize: "default",
    contrast: "default",
    motion: prefersReducedMotion ? "reduced" : "default",
    focusMode: "default",
  };
}

export function isAccessibilitySettings(
  value: unknown,
): value is AccessibilitySettings {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    (candidate.textSize === "default" ||
      candidate.textSize === "large" ||
      candidate.textSize === "x-large") &&
    (candidate.contrast === "default" || candidate.contrast === "high") &&
    (candidate.motion === "default" || candidate.motion === "reduced") &&
    (candidate.focusMode === "default" || candidate.focusMode === "enhanced")
  );
}

export function shouldEnableAccessibilitySettingsOnPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/finder") ||
    pathname.startsWith("/scholarships") ||
    pathname.startsWith("/dashboard")
  );
}
