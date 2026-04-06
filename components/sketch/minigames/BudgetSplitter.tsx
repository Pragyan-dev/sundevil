"use client";

import { useMemo, useState } from "react";

import type { SoundEngineControls } from "@/components/sketch/SoundEngine";
import MiniGameShell from "@/components/sketch/minigames/MiniGameShell";

const buckets = [
  { id: "housing", label: "Housing & Utilities", emoji: "🏠", color: "#FF7043", recommended: 35 },
  { id: "food", label: "Food & Groceries", emoji: "🍽️", color: "#FFC627", recommended: 20 },
  { id: "transport", label: "Transportation", emoji: "🚌", color: "#26A69A", recommended: 10 },
  { id: "books", label: "Books & Supplies", emoji: "📚", color: "#5C6BC0", recommended: 10 },
  { id: "personal", label: "Personal & Fun", emoji: "🎮", color: "#AB47BC", recommended: 10 },
  { id: "savings", label: "Savings & Emergency", emoji: "💰", color: "#66BB6A", recommended: 15 },
] as const;

type BucketId = (typeof buckets)[number]["id"];

const initialAllocation = Object.fromEntries(
  buckets.map((bucket) => [bucket.id, bucket.recommended]),
) as Record<BucketId, number>;

export default function BudgetSplitter({
  onComplete,
  sound,
  onInteract,
}: {
  onComplete: () => void;
  sound: SoundEngineControls;
  onInteract?: () => void;
}) {
  const [allocations, setAllocations] = useState<Record<BucketId, number>>(initialAllocation);
  const [submitted, setSubmitted] = useState(false);

  const total = useMemo(
    () => Object.values(allocations).reduce((sum, value) => sum + value, 0),
    [allocations],
  );

  const feedback = useMemo(() => {
    if (!submitted) return null;

    if (total !== 100) {
      return "Your percentages need to add up to exactly 100 before this budget reflects a real month.";
    }

    const zeroBucket = buckets.find((bucket) => allocations[bucket.id] === 0);
    if (zeroBucket) {
      return `You've got nothing set aside for ${zeroBucket.label}. That's going to catch up with you fast.`;
    }

    if (allocations.savings < 5) {
      return "Without any savings buffer, one unexpected expense puts everything at risk. This is exactly what financial coaching helps with.";
    }

    return "Nice balance. If real life doesn't match this neatly, a financial coach can help you adjust without shame.";
  }, [allocations, submitted, total]);

  function updateBucket(bucketId: BucketId, value: number) {
    onInteract?.();
    setSubmitted(false);
    setAllocations((current) => ({ ...current, [bucketId]: value }));
  }

  function handleSubmit() {
    onInteract?.();
    if (total !== 100) {
      sound.wrong();
      setSubmitted(true);
      return;
    }

    sound.correct();
    setSubmitted(true);
  }

  return (
    <MiniGameShell
      title="BUDGET SPLITTER"
      instructions="Move the sliders until your week-one budget adds up to 100%."
      icon="💸"
      completed={submitted && total === 100}
      onComplete={onComplete}
    >
      <article className="sketch-budget-insight-card">
        <p className="sketch-mini-eyebrow">What this teaches</p>
        <strong>Week-one money stress usually comes from invisible tradeoffs, not personal failure.</strong>
        <span>Make the percentages feel real, then compare them to the recommended split on the right.</span>
      </article>

      <div className="sketch-budget-header">
        <div className={`sketch-budget-total ${total === 100 ? "is-good" : total > 100 ? "is-over" : ""}`}>
          <span>Total allocated</span>
          <strong>{total}%</strong>
        </div>
        <p>If your total is not exactly 100%, the money plan still has a leak somewhere.</p>
      </div>

      <div className="sketch-budget-grid">
        <div className="sketch-budget-sliders">
          {buckets.map((bucket) => (
            <label key={bucket.id} className="sketch-budget-row">
              <div className="sketch-budget-row-copy">
                <span className="sketch-budget-bucket-label">
                  {bucket.emoji} {bucket.label}
                </span>
                <strong>{allocations[bucket.id]}%</strong>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={allocations[bucket.id]}
                onChange={(event) => updateBucket(bucket.id, Number(event.target.value))}
              />
            </label>
          ))}

          <button type="button" className="sketch-action-button sketch-action-button-gold" onClick={handleSubmit}>
            Check this budget
          </button>
        </div>

        <div className="sketch-budget-compare">
          <div className="sketch-budget-compare-header">
            <div>
              <p className="sketch-mini-eyebrow">Compare</p>
              <strong>Your split vs recommended</strong>
            </div>
            <span className="sketch-budget-legend">Top bar = yours</span>
          </div>
          {buckets.map((bucket) => (
            <div key={`${bucket.id}-chart`} className="sketch-budget-chart-row">
              <strong>{bucket.label}</strong>
              <div className="sketch-budget-bar-pair">
                <div className="sketch-budget-bar-shell">
                  <span
                    className="sketch-budget-bar sketch-budget-bar-current"
                    style={{ width: `${allocations[bucket.id]}%`, backgroundColor: bucket.color }}
                  />
                </div>
                <div className="sketch-budget-bar-shell sketch-budget-bar-shell-muted">
                  <span
                    className="sketch-budget-bar sketch-budget-bar-recommended"
                    style={{ width: `${bucket.recommended}%`, backgroundColor: bucket.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {feedback ? <div className="sketch-results-card"><p>{feedback}</p></div> : null}
    </MiniGameShell>
  );
}
