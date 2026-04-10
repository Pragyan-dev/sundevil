"use client";

import { useEffect, useRef, useState } from "react";

import { useAccessibilitySettings } from "@/components/AccessibilitySettingsProvider";
import type { AccessibilitySettings } from "@/lib/types";

type SettingChoice<T extends string> = {
  value: T;
  label: string;
};

const textSizeChoices: SettingChoice<AccessibilitySettings["textSize"]>[] = [
  { value: "default", label: "Default" },
  { value: "large", label: "Large" },
  { value: "x-large", label: "X-Large" },
];

const contrastChoices: SettingChoice<AccessibilitySettings["contrast"]>[] = [
  { value: "default", label: "Default" },
  { value: "high", label: "High" },
];

const motionChoices: SettingChoice<AccessibilitySettings["motion"]>[] = [
  { value: "default", label: "Default" },
  { value: "reduced", label: "Reduced" },
];

const focusChoices: SettingChoice<AccessibilitySettings["focusMode"]>[] = [
  { value: "default", label: "Default" },
  { value: "enhanced", label: "Enhanced" },
];

function ChoiceGroup<T extends string>({
  label,
  description,
  value,
  choices,
  onChange,
}: {
  label: string;
  description: string;
  value: T;
  choices: SettingChoice<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <section className="settings-menu-section sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
      <div className="mb-3 sm:mb-0">
        <p className="text-[0.98rem] font-semibold text-[var(--ink)]">{label}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-ink)] sm:max-w-[18rem]">
          {description}
        </p>
      </div>
      <div
        className={`grid gap-2 sm:min-w-[15rem] ${
          choices.length === 3 ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        {choices.map((choice) => {
          const active = value === choice.value;

          return (
            <button
              key={choice.value}
              type="button"
              onClick={() => onChange(choice.value)}
              aria-pressed={active}
              className="settings-menu-choice"
              data-active={active}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function SettingsMenu() {
  const { settings, scopeActive, ready, updateSettings, resetSettings } =
    useAccessibilitySettings();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  if (!scopeActive || !ready) {
    return null;
  }

  return (
    <div ref={containerRef} className="settings-menu relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="settings-menu-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open accessibility settings"
      >
        <span className="sm:hidden">Aa</span>
        <span className="hidden sm:inline">Settings</span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close accessibility settings"
            className="settings-menu-scrim"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Accessibility settings"
            className="settings-menu-panel"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Accessibility</p>
                <h2 className="mt-2 text-[1.7rem] font-semibold leading-tight text-[var(--ink)]">
                  Reading and motion settings
                </h2>
                <p className="mt-2 max-w-[34rem] text-sm leading-6 text-[var(--muted-ink)]">
                  Apply these preferences to home, resource finding,
                  scholarships, and dashboard views in this browser.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="settings-menu-close"
                aria-label="Close settings"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <ChoiceGroup
                label="Text size"
                description="Scale cards, buttons, forms, dashboard text, and the Sparky popout."
                value={settings.textSize}
                choices={textSizeChoices}
                onChange={(value) => updateSettings({ textSize: value })}
              />

              <ChoiceGroup
                label="Contrast"
                description="Increase separation between text, surfaces, and controls."
                value={settings.contrast}
                choices={contrastChoices}
                onChange={(value) => updateSettings({ contrast: value })}
              />

              <ChoiceGroup
                label="Motion"
                description="Reduce non-essential animation and hover movement."
                value={settings.motion}
                choices={motionChoices}
                onChange={(value) => updateSettings({ motion: value })}
              />

              <ChoiceGroup
                label="Focus visibility"
                description="Make keyboard focus states stronger across links, pills, chat, and forms."
                value={settings.focusMode}
                choices={focusChoices}
                onChange={(value) => updateSettings({ focusMode: value })}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(0,0,0,0.08)] pt-4">
              <p className="max-w-[20rem] text-sm leading-6 text-[var(--muted-ink)]">
                Simulation and campus views keep their current experience in this pass.
              </p>
              <button
                type="button"
                onClick={resetSettings}
                className="button-secondary"
              >
                Reset to defaults
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
