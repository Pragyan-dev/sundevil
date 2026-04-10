"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
  ACCESSIBILITY_SETTINGS_STORAGE_KEY,
  createDefaultAccessibilitySettings,
  isAccessibilitySettings,
  shouldEnableAccessibilitySettingsOnPath,
} from "@/lib/accessibility-settings";
import type { AccessibilitySettings } from "@/lib/types";

interface AccessibilitySettingsContextValue {
  settings: AccessibilitySettings;
  scopeActive: boolean;
  ready: boolean;
  updateSettings: (patch: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

const AccessibilitySettingsContext =
  createContext<AccessibilitySettingsContextValue | null>(null);

function getMotionPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AccessibilitySettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const scopeActive = shouldEnableAccessibilitySettingsOnPath(pathname);
  const [state, setState] = useState<{
    settings: AccessibilitySettings;
    ready: boolean;
    hasUserOverride: boolean;
  }>(() => ({
    settings: createDefaultAccessibilitySettings(false),
    ready: false,
    hasUserOverride: false,
  }));

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      const defaultSettings = createDefaultAccessibilitySettings(getMotionPreference());
      let nextSettings = defaultSettings;
      let nextHasUserOverride = false;

      try {
        const raw = window.localStorage.getItem(ACCESSIBILITY_SETTINGS_STORAGE_KEY);

        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (isAccessibilitySettings(parsed)) {
            nextSettings = parsed;
            nextHasUserOverride = true;
          }
        }
      } catch {
        nextSettings = defaultSettings;
        nextHasUserOverride = false;
      }

      setState({
        settings: nextSettings,
        ready: true,
        hasUserOverride: nextHasUserOverride,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.ready) {
      return;
    }

    try {
      if (state.hasUserOverride) {
        window.localStorage.setItem(
          ACCESSIBILITY_SETTINGS_STORAGE_KEY,
          JSON.stringify(state.settings),
        );
      } else {
        window.localStorage.removeItem(ACCESSIBILITY_SETTINGS_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage failures so the UI still works in restrictive browsers.
    }
  }, [state.hasUserOverride, state.ready, state.settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.accessibilityScope = scopeActive ? "active" : "inactive";
    root.dataset.textSize = state.settings.textSize;
    root.dataset.contrast = state.settings.contrast;
    root.dataset.motion = state.settings.motion;
    root.dataset.focusMode = state.settings.focusMode;
  }, [scopeActive, state.settings]);

  const value = useMemo<AccessibilitySettingsContextValue>(
    () => ({
      settings: state.settings,
      scopeActive,
      ready: state.ready,
      updateSettings: (patch) => {
        setState((current) => ({
          settings: { ...current.settings, ...patch },
          ready: current.ready,
          hasUserOverride: true,
        }));
      },
      resetSettings: () => {
        setState({
          settings: createDefaultAccessibilitySettings(getMotionPreference()),
          ready: true,
          hasUserOverride: false,
        });
      },
    }),
    [scopeActive, state],
  );

  return (
    <AccessibilitySettingsContext.Provider value={value}>
      {children}
    </AccessibilitySettingsContext.Provider>
  );
}

export function useAccessibilitySettings() {
  const context = useContext(AccessibilitySettingsContext);

  if (!context) {
    throw new Error(
      "useAccessibilitySettings must be used within AccessibilitySettingsProvider",
    );
  }

  return context;
}
