"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CharacterAvatar } from "@/components/SketchCharacters";
import { SketchDialogBubble } from "@/components/sketch/SketchDialogBubble";
import { SketchProgressDots } from "@/components/sketch/SketchProgressDots";
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
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestTokenRef = useRef(0);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const lineIndex = initialLineIndex;
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return Boolean(navigator.userActivation?.hasBeenActive);
  });

  const stopActiveAudio = useCallback(() => {
    if (!activeAudioRef.current) {
      return;
    }

    try {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current.src = "";
    } catch (error) {
      console.warn("TTS cleanup failed.", error);
    }
    activeAudioRef.current = null;
  }, []);

  const cancelPendingPlayback = useCallback(() => {
    requestTokenRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    stopActiveAudio();
  }, [stopActiveAudio]);

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

  useEffect(() => {
    if (audioUnlocked) {
      return;
    }

    function unlockAudio() {
      setAudioUnlocked(true);
    }

    window.addEventListener("pointerdown", unlockAudio, {
      once: true,
      capture: true,
    });
    window.addEventListener("keydown", unlockAudio, {
      once: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [audioUnlocked]);

  useEffect(() => {
    const cachedAudio = audioCacheRef.current;

    return () => {
      cancelPendingPlayback();
      cachedAudio.forEach((url) => URL.revokeObjectURL(url));
      cachedAudio.clear();
    };
  }, [cancelPendingPlayback]);

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

  useEffect(() => {
    if (!currentLineKey || !currentLine || currentLine.isThought || !ttsAvailable) {
      cancelPendingPlayback();
      return;
    }

    const cacheKey = currentLineKey;
    const requestToken = requestTokenRef.current + 1;
    requestTokenRef.current = requestToken;
    abortControllerRef.current?.abort();
    stopActiveAudio();

    async function playAudioFromUrl(url: string) {
      if (requestToken !== requestTokenRef.current || !audioUnlocked) {
        return;
      }

      try {
        const audio = new Audio(url);
        audio.preload = "auto";
        activeAudioRef.current = audio;

        audio.addEventListener(
          "ended",
          () => {
            if (activeAudioRef.current === audio) {
              activeAudioRef.current = null;
            }
          },
          { once: true },
        );

        await audio.play();
      } catch (error) {
        if (requestToken === requestTokenRef.current) {
          activeAudioRef.current = null;
        }
        console.warn("TTS playback failed for the current line.", error);
      }
    }

    const cachedUrl = audioCacheRef.current.get(cacheKey);
    if (cachedUrl) {
      void playAudioFromUrl(cachedUrl);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function fetchAndMaybePlay() {
      try {
        const payload = sceneId
          ? {
              sceneId,
              lineId: currentLine.id,
              archetypeId: archetypeId ?? undefined,
            }
          : {
              text: currentLine.text,
              speakerId: currentLine.speakerType,
            };

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (controller.signal.aborted || requestToken !== requestTokenRef.current) {
          return;
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          console.warn("TTS request failed.", {
            status: response.status,
            body: errorText,
          });

          if ([400, 503].includes(response.status)) {
            setTtsAvailable(false);
          }
          return;
        }

        const blob = await response.blob();

        if (controller.signal.aborted || requestToken !== requestTokenRef.current) {
          return;
        }

        const objectUrl = URL.createObjectURL(blob);
        audioCacheRef.current.set(cacheKey, objectUrl);
        await playAudioFromUrl(objectUrl);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.warn("TTS fetch failed for the current line.", error);
      }
    }

    void fetchAndMaybePlay();

    return () => {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      if (requestToken === requestTokenRef.current) {
        stopActiveAudio();
      }
    };
  }, [
    archetypeId,
    audioUnlocked,
    cancelPendingPlayback,
    currentLine,
    currentLineKey,
    sceneId,
    stopActiveAudio,
    ttsAvailable,
  ]);

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
