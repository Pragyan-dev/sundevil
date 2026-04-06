"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { SketchNotation } from "@/components/SketchNotation";
import type { CharacterId } from "@/lib/types";
import type { StoryAnnotationType } from "@/lib/types";
import { generateWobblyCirclePath, generateWobblyRect } from "@/components/sketch/sketchShapes";

export interface SketchDialogBubbleProps {
  text: string;
  speakerName: string;
  speakerType: CharacterId;
  isThought?: boolean;
  typingSpeed?: number;
  onComplete: () => void;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  instantReveal?: boolean;
  showContinueButton?: boolean;
  onTypingComplete?: () => void;
  onInteract?: () => void;
  locationLabel?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  continueLabel?: string;
  annotation?: StoryAnnotationType;
}

export function SketchDialogBubble({
  text,
  speakerName,
  speakerType,
  isThought = false,
  typingSpeed = 22,
  onComplete,
  autoAdvance = false,
  autoAdvanceDelay = 1500,
  instantReveal = false,
  showContinueButton = true,
  onTypingComplete,
  onInteract,
  locationLabel,
  secondaryActionLabel,
  onSecondaryAction,
  continueLabel = "NEXT ►",
  annotation,
}: SketchDialogBubbleProps) {
  const [typedText, setTypedText] = useState("");
  const [typingState, setTypingState] = useState(!instantReveal);
  const displayedText = instantReveal ? text : typedText;
  const isTyping = instantReveal ? false : typingState;
  const isInteractive = isTyping || (!autoAdvance && (showContinueButton || Boolean(secondaryActionLabel && onSecondaryAction)));

  const indexRef = useRef(0);
  const typingTimerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const kickoffFrameRef = useRef<number | null>(null);

  const bubbleSeed = useMemo(
    () => speakerName.length * 7 + speakerType.length * 11 + (isThought ? 19 : 3),
    [isThought, speakerName, speakerType],
  );
  const triggerComplete = useEffectEvent(() => onComplete());
  const triggerTypingComplete = useEffectEvent(() => onTypingComplete?.());

  useEffect(() => {
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }

    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
    }

    if (instantReveal) {
      indexRef.current = text.length;
      triggerTypingComplete();

      if (autoAdvance) {
        advanceTimerRef.current = window.setTimeout(() => {
          triggerComplete();
        }, autoAdvanceDelay);
      }

      return () => {
        if (advanceTimerRef.current) {
          window.clearTimeout(advanceTimerRef.current);
        }
      };
    }

    function scheduleNextTick(delay: number) {
      typingTimerRef.current = window.setTimeout(() => {
        if (indexRef.current >= text.length) {
          return;
        }

        indexRef.current += 1;
        const currentCharacter = text[indexRef.current - 1] ?? "";
        setTypedText(text.slice(0, indexRef.current));

        if (indexRef.current >= text.length) {
          typingTimerRef.current = null;
          setTypingState(false);
          triggerTypingComplete();

          if (autoAdvance) {
            advanceTimerRef.current = window.setTimeout(() => {
              triggerComplete();
            }, autoAdvanceDelay);
          }
          return;
        }

        const nextDelay = /[,.!?;:]/.test(currentCharacter)
          ? typingSpeed * 2
          : /\s/.test(currentCharacter)
            ? typingSpeed * 0.85
            : typingSpeed;

        scheduleNextTick(nextDelay);
      }, delay);
    }

    kickoffFrameRef.current = window.requestAnimationFrame(() => {
      indexRef.current = 0;
      setTypedText("");
      setTypingState(true);
      scheduleNextTick(Math.max(typingSpeed * 2.4, 90));
    });

    return () => {
      if (kickoffFrameRef.current) {
        window.cancelAnimationFrame(kickoffFrameRef.current);
      }

      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }

      if (advanceTimerRef.current) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, [autoAdvance, autoAdvanceDelay, instantReveal, text, typingSpeed]);

  function handleBubbleClick() {
    onInteract?.();

    if (!showContinueButton && !isTyping && !secondaryActionLabel) {
      return;
    }

    if (isTyping && !instantReveal) {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }

      if (advanceTimerRef.current) {
        window.clearTimeout(advanceTimerRef.current);
      }

      indexRef.current = text.length;
      setTypedText(text);
      setTypingState(false);
      onTypingComplete?.();

      if (autoAdvance) {
        advanceTimerRef.current = window.setTimeout(() => {
          onComplete();
        }, autoAdvanceDelay);
      }
      return;
    }

    if (!autoAdvance && showContinueButton) {
      onComplete();
    }
  }

  return (
    <div
      className={`sketch-dialog-bubble ${isThought ? "sketch-dialog-bubble-thought" : ""}`}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleBubbleClick}
      onKeyDown={(event) => {
        if (!isInteractive) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleBubbleClick();
        }
      }}
    >
      {!isThought ? (
        <>
          <svg viewBox="0 0 400 400" preserveAspectRatio="none" className="sketch-dialog-bubble-frame" aria-hidden="true">
            <path className="sketch-dialog-stroke" d={generateWobblyRect(400, 400, bubbleSeed)} pathLength={1} />
          </svg>
          <svg viewBox="0 0 20 20" className="sketch-dialog-pointer" aria-hidden="true">
            <path className="sketch-dialog-stroke" d="M 18 8 Q 12 10 2 18 Q 7 10 18 4 Z" pathLength={1} />
          </svg>
        </>
      ) : (
        <>
          <svg viewBox="0 0 400 400" preserveAspectRatio="none" className="sketch-dialog-bubble-frame" aria-hidden="true">
            <path
              className="sketch-dialog-stroke"
              d={generateWobblyCirclePath(52, bubbleSeed + 1)}
              transform="translate(-10 20) scale(3.5 3.5)"
              pathLength={1}
            />
            <path
              className="sketch-dialog-stroke"
              d={generateWobblyCirclePath(64, bubbleSeed + 2)}
              transform="translate(140 -10) scale(4.2 3.8)"
              pathLength={1}
            />
            <path
              className="sketch-dialog-stroke"
              d={generateWobblyCirclePath(58, bubbleSeed + 3)}
              transform="translate(10 140) scale(3.8 4.2)"
              pathLength={1}
            />
            <path
              className="sketch-dialog-stroke"
              d={generateWobblyCirclePath(60, bubbleSeed + 4)}
              transform="translate(160 130) scale(4.2 4.4)"
              pathLength={1}
            />
            <path
              className="sketch-dialog-stroke"
              d={generateWobblyCirclePath(62, bubbleSeed + 5)}
              transform="translate(70 60) scale(4.0 4.0)"
              pathLength={1}
            />
          </svg>
          <div className="sketch-thought-pointer" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </>
      )}

      <span className="sketch-dialog-tag">{speakerName}</span>
      <div className="sketch-dialog-content">
        {locationLabel ? <p className="sketch-location-label">{locationLabel}</p> : null}
        <p className={`sketch-dialog-copy ${isThought ? "sketch-dialog-copy-thought" : ""}`}>
          {annotation ? (
            <SketchNotation
              type={annotation}
              color={annotation === "highlight" ? "#FFC627" : "#8C1D40"}
              padding={4}
              multiline
            >
              {displayedText}
            </SketchNotation>
          ) : (
            displayedText
          )}
          {isTyping ? <span className="sketch-dialog-cursor" aria-hidden="true" /> : null}
        </p>

        <div className="sketch-dialog-actions">
          {secondaryActionLabel && onSecondaryAction ? (
            <button
              type="button"
              className="sketch-dialog-secondary"
              onClick={(event) => {
                event.stopPropagation();
                onInteract?.();
                onSecondaryAction();
              }}
            >
              {secondaryActionLabel}
            </button>
          ) : (
            <span />
          )}

          {!isTyping && !autoAdvance && showContinueButton ? (
            <button
              type="button"
              className="sketch-dialog-next sketch-dialog-next-reveal"
              onClick={(event) => {
                event.stopPropagation();
                onInteract?.();
                onComplete();
              }}
            >
              {continueLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
