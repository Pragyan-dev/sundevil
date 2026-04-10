"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ArchetypeId, CharacterId } from "@/lib/types";

type SceneTtsRequest = {
  kind: "scene";
  cacheKey: string;
  sceneId: string;
  lineId: string;
  archetypeId?: ArchetypeId | null;
  isThought?: boolean;
};

type SpeakerTtsRequest = {
  kind: "speaker";
  cacheKey: string;
  text: string;
  speakerId: CharacterId;
  isThought?: boolean;
};

type DefaultVoiceTtsRequest = {
  kind: "default";
  cacheKey: string;
  text: string;
  isThought?: boolean;
};

export type DialogTtsRequest = SceneTtsRequest | SpeakerTtsRequest | DefaultVoiceTtsRequest;

interface UseDialogTtsPlaybackOptions {
  request: DialogTtsRequest | null;
  enabled?: boolean;
}

export function useDialogTtsPlayback({
  request,
  enabled = true,
}: UseDialogTtsPlaybackOptions) {
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestTokenRef = useRef(0);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
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

  useEffect(() => {
    if (!enabled || !request || request.isThought || !ttsAvailable) {
      cancelPendingPlayback();
      return;
    }

    const cacheKey = request.cacheKey;
    const currentRequest = request;
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
        const payload =
          currentRequest.kind === "scene"
            ? {
                sceneId: currentRequest.sceneId,
                lineId: currentRequest.lineId,
                archetypeId: currentRequest.archetypeId ?? undefined,
              }
            : currentRequest.kind === "speaker"
              ? {
                  text: currentRequest.text,
                  speakerId: currentRequest.speakerId,
                }
              : {
                  text: currentRequest.text,
                  voiceMode: "default" as const,
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
  }, [audioUnlocked, cancelPendingPlayback, enabled, request, stopActiveAudio, ttsAvailable]);

  return {
    audioUnlocked,
    ttsAvailable,
    cancelPendingPlayback,
  };
}
