"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { CharacterAvatar } from "@/components/SketchCharacters";
import { SketchDialogBubble } from "@/components/sketch/SketchDialogBubble";
import { SketchProgressDots } from "@/components/sketch/SketchProgressDots";
import type { CharacterId, DialogLine } from "@/lib/types";

interface SketchDialogSequenceProps {
  lines: DialogLine[];
  onSequenceComplete: () => void;
  typingSpeed?: number;
  initialLineIndex?: number;
  finalButtonLabel?: string;
  locationLabel?: string;
  onLineIndexChange?: (index: number) => void;
  onSpeakerChange?: () => void;
  onTypingComplete?: () => void;
  onInteract?: () => void;
  renderSecondaryAction?: (line: DialogLine) => React.ReactNode;
  getSecondaryAction?: (
    line: DialogLine,
  ) => { label: string; onClick: () => void } | null;
  archetypeClassName?: string;
}

export function SketchDialogSequence({
  lines,
  onSequenceComplete,
  typingSpeed,
  initialLineIndex = 0,
  finalButtonLabel,
  locationLabel,
  onLineIndexChange,
  onSpeakerChange,
  onTypingComplete,
  onInteract,
  getSecondaryAction,
  archetypeClassName,
}: SketchDialogSequenceProps) {
  const previousSpeakerRef = useRef<CharacterId | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const lineIndex = initialLineIndex;
  const [audioUnlocked, setAudioUnlocked] = useState(
    () => typeof navigator !== "undefined" && Boolean(navigator.userActivation?.hasBeenActive),
  );

  useEffect(() => {
    const current = lines[lineIndex];

    if (!current) {
      return;
    }

    if (previousSpeakerRef.current && previousSpeakerRef.current !== current.speakerType) {
      onSpeakerChange?.();
    }

    previousSpeakerRef.current = current.speakerType;
  }, [lineIndex, lines, onSpeakerChange]);

  const currentLine = lines[lineIndex];
  const speakerType = currentLine?.speakerType ?? ("you" satisfies CharacterId);
  const secondaryAction = currentLine ? getSecondaryAction?.(currentLine) ?? null : null;
  const avatarClassName = useMemo(() => {
    if (speakerType !== "you" || !archetypeClassName) {
      return "sketch-sequence-avatar";
    }

    return `sketch-sequence-avatar ${archetypeClassName}`;
  }, [archetypeClassName, speakerType]);
  const stopAudio = useEffectEvent(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  });
  const playCurrentLine = useEffectEvent(async (line: DialogLine) => {
    stopAudio();

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: line.text,
          speakerId: line.speakerType,
        }),
      });

      if (!response.ok) {
        return;
      }

      const audioBlob = await response.blob();
      if (!audioBlob.size) {
        return;
      }

      const objectUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(objectUrl);
      audio.preload = "auto";
      audioUrlRef.current = objectUrl;
      audioRef.current = audio;
      await audio.play().catch(() => undefined);
    } catch {
      stopAudio();
    }
  });

  useEffect(() => {
    function unlockAudio() {
      setAudioUnlocked(true);
    }

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!currentLine || !audioUnlocked) {
      return;
    }

    void playCurrentLine(currentLine);

    return () => {
      stopAudio();
    };
  }, [audioUnlocked, currentLine]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  if (!currentLine) {
    return null;
  }

  function advanceLine() {
    onInteract?.();

    if (lineIndex >= lines.length - 1) {
      onSequenceComplete();
      return;
    }

    const nextIndex = lineIndex + 1;
    onLineIndexChange?.(nextIndex);
  }

  return (
    <div className="sketch-sequence-shell">
      <div className="sketch-sequence-grid">
        <div className="sketch-sequence-character">
          <div key={speakerType} className="sketch-sequence-avatar-wrap">
            <CharacterAvatar characterId={speakerType} size="large" className={avatarClassName} />
          </div>
          <div className="sketch-sequence-shadow" />
        </div>

        <div className="sketch-sequence-dialogue">
          <SketchDialogBubble
            text={currentLine.text}
            speakerName={currentLine.speaker}
            speakerType={currentLine.speakerType}
            isThought={currentLine.isThought}
            typingSpeed={typingSpeed}
            onComplete={advanceLine}
            onTypingComplete={onTypingComplete}
            onInteract={onInteract}
            locationLabel={locationLabel}
            secondaryActionLabel={secondaryAction?.label}
            onSecondaryAction={secondaryAction?.onClick}
            continueLabel={lineIndex === lines.length - 1 ? finalButtonLabel ?? "Next ►" : "Next ►"}
            annotation={currentLine.annotation}
          />
        </div>
      </div>

      <SketchProgressDots total={lines.length} current={lineIndex} />
    </div>
  );
}
