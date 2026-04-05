"use client";

import { annotate } from "rough-notation";
import { useEffect, useRef } from "react";

import type { StoryAnnotationType } from "@/lib/types";

interface SketchNotationProps {
  children: React.ReactNode;
  type: StoryAnnotationType | "box";
  color?: string;
  padding?: number;
  multiline?: boolean;
  iterations?: number;
  strokeWidth?: number;
  animate?: boolean;
  className?: string;
  show?: boolean;
}

export function SketchNotation({
  children,
  type,
  color = "#FFC627",
  padding = 6,
  multiline = false,
  iterations = 1,
  strokeWidth = 2,
  animate = true,
  className,
  show = true,
}: SketchNotationProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || !show) {
      return;
    }

    const marker = annotate(ref.current, {
      type,
      color,
      padding,
      multiline,
      iterations,
      strokeWidth,
      animate,
    });

    marker.show();
    return () => marker.remove();
  }, [animate, color, iterations, multiline, padding, show, strokeWidth, type]);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
