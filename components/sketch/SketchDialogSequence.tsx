"use client";

import { useEffect, useMemo, useRef } from "react";

import { CharacterAvatar } from "@/components/SketchCharacters";
import { SketchDialogBubble } from "@/components/sketch/SketchDialogBubble";
import { SketchProgressDots } from "@/components/sketch/SketchProgressDots";
import { useDialogTtsPlayback } from "@/components/sketch/useDialogTtsPlayback";
import type { ArchetypeId, CharacterId, DialogLine } from "@/lib/types";

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
  sceneId?: string;
  archetypeId?: ArchetypeId | null;
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
  sceneId,
  archetypeId,
}: SketchDialogSequenceProps) {
  const previousSpeakerRef = useRef<CharacterId | null>(null);
  const lineIndex = initialLineIndex;

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
  const currentLineKey = useMemo(() => {
    if (!currentLine) {
      return null;
    }

    if (sceneId) {
      return `scene:${sceneId}:${currentLine.id}:${archetypeId ?? "default"}`;
    }

    return `dialog:${currentLine.speakerType}:${currentLine.id}:${currentLine.text}`;
  }, [archetypeId, currentLine, sceneId]);
  const avatarClassName = useMemo(() => {
    if (speakerType !== "you" || !archetypeClassName) {
      return "sketch-sequence-avatar";
    }

    return `sketch-sequence-avatar ${archetypeClassName}`;
  }, [archetypeClassName, speakerType]);
  const ttsRequest = useMemo(() => {
    if (!currentLine || !currentLineKey) {
      return null;
    }

    if (sceneId) {
      return {
        kind: "scene" as const,
        cacheKey: currentLineKey,
        sceneId,
        lineId: currentLine.id,
        archetypeId,
        isThought: currentLine.isThought,
      };
    }

    return {
      kind: "speaker" as const,
      cacheKey: currentLineKey,
      text: currentLine.text,
      speakerId: currentLine.speakerType,
      isThought: currentLine.isThought,
    };
  }, [archetypeId, currentLine, currentLineKey, sceneId]);
  const { cancelPendingPlayback } = useDialogTtsPlayback({
    request: ttsRequest,
  });

  if (!currentLine) {
    return null;
  }

  function advanceLine() {
    onInteract?.();

    if (lineIndex >= lines.length - 1) {
      cancelPendingPlayback();
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
