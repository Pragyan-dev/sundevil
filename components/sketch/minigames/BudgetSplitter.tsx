"use client";

import { useMemo, useState } from "react";

import type { SoundEngineControls } from "@/components/sketch/SoundEngine";
import MiniGameShell from "@/components/sketch/minigames/MiniGameShell";

type BudgetPhase = "briefing" | "allocation" | "week-play" | "week-recap" | "final-recap";

type BudgetEnvelopeId = "housing" | "food" | "transport" | "books" | "personal" | "emergency";

type BudgetEnvelope = {
  id: BudgetEnvelopeId;
  label: string;
  emoji: string;
  recommendedChips: number;
  note: string;
};

type BudgetChoice = {
  id: string;
  label: string;
  description: string;
  primaryEnvelope: BudgetEnvelopeId;
  costChips: number;
  supportMove?: boolean;
  stressDelta: number;
  schoolDelta: number;
  reaction: string;
  monthLog: string;
  receiptLine: string;
};

type BudgetEvent = {
  id: string;
  week: number;
  kicker: string;
  title: string;
  summary: string;
  receiptLabel: string;
  receiptAmount: string;
  resourceHint: string;
  accent: "gold" | "maroon" | "teal" | "green";
  choices: [BudgetChoice, BudgetChoice, BudgetChoice];
};

type BudgetWeekVariant = BudgetEvent;

type BudgetMetrics = {
  stress: number;
  school: number;
  supportMoves: number;
};

type BudgetWeekResult = {
  week: number;
  eventTitle: string;
  eventId: string;
  choiceId: string;
  choiceLabel: string;
  supportMove: boolean;
  reaction: string;
  monthLog: string;
  receiptLine: string;
  beforeMetrics: BudgetMetrics;
  afterMetrics: BudgetMetrics;
  beforeEnvelopes: Record<BudgetEnvelopeId, number>;
  afterEnvelopes: Record<BudgetEnvelopeId, number>;
  primaryEnvelope: BudgetEnvelopeId;
  costChips: number;
  primarySpent: number;
  emergencySpent: number;
  shortfall: number;
  cashDelta: number;
  emergencyDelta: number;
  stressDelta: number;
  schoolDelta: number;
};

type BudgetEnding = {
  id: "strong" | "holding" | "crisis";
  title: string;
  posterLabel: string;
  summary: string;
  jordanLine: string;
  tone: "strong" | "holding" | "crisis";
};

type BudgetRunState = {
  phase: BudgetPhase;
  envelopes: Record<BudgetEnvelopeId, number>;
  events: BudgetWeekVariant[];
  weekIndex: number;
  metrics: BudgetMetrics;
  results: BudgetWeekResult[];
  recap: BudgetWeekResult | null;
  ending: BudgetEnding | null;
};

const CHIP_VALUE = 50;
const TOTAL_CHIPS = 20;

const envelopes: readonly BudgetEnvelope[] = [
  { id: "housing", label: "Housing", emoji: "🏠", recommendedChips: 7, note: "Dorm, utilities, basics" },
  { id: "food", label: "Food", emoji: "🍽️", recommendedChips: 4, note: "Groceries and meal gaps" },
  { id: "transport", label: "Transportation", emoji: "🚌", recommendedChips: 2, note: "Bus, gas, rides" },
  { id: "books", label: "Books", emoji: "📚", recommendedChips: 2, note: "Course materials and fees" },
  { id: "personal", label: "Personal", emoji: "🎧", recommendedChips: 2, note: "Laundry, supplies, small resets" },
  { id: "emergency", label: "Emergency", emoji: "💰", recommendedChips: 3, note: "The buffer you hope to keep" },
];

const WEEK_ONE_EVENT: BudgetEvent = {
  id: "textbook-code",
  week: 1,
  kicker: "Week 1",
  title: "Textbook access code surprise",
  summary: "Your course access code costs more than you expected, and the next homework is already posted.",
  receiptLabel: "COURSE MATERIALS",
  receiptAmount: "$150",
  resourceHint: "A cheaper-materials question can save real money before the month snowballs.",
  accent: "gold",
  choices: [
    {
      id: "buy-now",
      label: "Pay it now from books",
      description: "Take the hit immediately so class stops hovering over you.",
      primaryEnvelope: "books",
      costChips: 3,
      stressDelta: -1,
      schoolDelta: 5,
      reaction: "Paying the code hurts, but at least you're not starting the class already behind.",
      monthLog: "Bought the access code and kept pace with class.",
      receiptLine: "Paid the full code price to keep the course unlocked.",
    },
    {
      id: "wait-a-week",
      label: "Wait and hope you can catch up",
      description: "Keep your cash for now, but lose access for a few days.",
      primaryEnvelope: "books",
      costChips: 0,
      stressDelta: 11,
      schoolDelta: -14,
      reaction: "Saving cash right now feels good for maybe five minutes. Then every assignment starts buzzing in the background.",
      monthLog: "Delayed the code and felt the pressure stack immediately.",
      receiptLine: "Delayed the purchase and lost course access for the week.",
    },
    {
      id: "ask-about-options",
      label: "Ask about cheaper course-material options",
      description: "Check for library access, lower-cost codes, or a temporary workaround first.",
      primaryEnvelope: "books",
      costChips: 1,
      supportMove: true,
      stressDelta: -4,
      schoolDelta: 7,
      reaction: "One concrete question saved money and panic at the same time. Process knowledge is a resource too.",
      monthLog: "Asked for cheaper material options and kept moving.",
      receiptLine: "Used a lower-cost option after asking for help early.",
    },
  ],
};

const WEEK_TWO_POOL: readonly BudgetWeekVariant[] = [
  {
    id: "shift-cut",
    week: 2,
    kicker: "Week 2",
    title: "Work shift gets cut",
    summary: "Your next paycheck is smaller than planned and the missing hours land right on your essentials.",
    receiptLabel: "MISSED PAY",
    receiptAmount: "-$100",
    resourceHint: "Short-term money problems get easier when someone helps you translate them into one next move.",
    accent: "maroon",
    choices: [
      {
        id: "cover-with-personal",
        label: "Patch the gap with personal money",
        description: "Shift money out of your small reset fund and hope the month steadies.",
        primaryEnvelope: "personal",
        costChips: 2,
        stressDelta: 4,
        schoolDelta: -2,
        reaction: "You kept the month moving, but now every tiny extra expense feels louder than it should.",
        monthLog: "Covered the pay gap by stripping down the personal budget.",
        receiptLine: "Rebalanced the week by draining personal money.",
      },
      {
        id: "skip-groceries",
        label: "Shrink the food budget and absorb it",
        description: "Make meals thinner and hope you can power through the week anyway.",
        primaryEnvelope: "food",
        costChips: 1,
        stressDelta: 10,
        schoolDelta: -8,
        reaction: "The cash problem does not stay in the cash category. It follows you into focus, sleep, and class.",
        monthLog: "Cut food first and paid for it in stress.",
        receiptLine: "Protected cash by squeezing meals and routine.",
      },
      {
        id: "financial-guidance",
        label: "Use financial-aid or support guidance",
        description: "Ask what bridge options, short-term help, or smarter next steps exist before the gap widens.",
        primaryEnvelope: "emergency",
        costChips: 1,
        supportMove: true,
        stressDelta: -2,
        schoolDelta: 5,
        reaction: "The money is still tight, but the problem shrinks once it turns into a process instead of a fog.",
        monthLog: "Used support guidance to keep the paycheck hit from turning into a spiral.",
        receiptLine: "Used one emergency chip while getting concrete financial guidance.",
      },
    ],
  },
  {
    id: "laundry-stack",
    week: 2,
    kicker: "Week 2",
    title: "Laundry and class supplies stack up",
    summary: "Printing, detergent, and a few random required items all hit in the same week and suddenly the small stuff is not small.",
    receiptLabel: "SMALL COSTS",
    receiptAmount: "$90",
    resourceHint: "Student-support offices are often better at untangling recurring little costs than students expect.",
    accent: "teal",
    choices: [
      {
        id: "pay-the-stack",
        label: "Pay the stack from personal money",
        description: "Get it over with and accept a tighter rest of the month.",
        primaryEnvelope: "personal",
        costChips: 2,
        stressDelta: 2,
        schoolDelta: 0,
        reaction: "Nothing dramatic happened, which is the point. Sometimes the month just gets narrower.",
        monthLog: "Paid the small-cost pile and tightened the month.",
        receiptLine: "Covered the surprise pile directly from the personal envelope.",
      },
      {
        id: "put-it-off",
        label: "Put some of it off until later",
        description: "Delay what you can and tell yourself you'll clean it up next week.",
        primaryEnvelope: "personal",
        costChips: 0,
        stressDelta: 8,
        schoolDelta: -6,
        reaction: "Deferred costs are still costs. They just come back with more annoyance attached.",
        monthLog: "Pushed small costs forward and kept carrying them mentally.",
        receiptLine: "Deferred the stack and took the pressure into next week.",
      },
      {
        id: "ask-student-support",
        label: "Ask student support what can be eased",
        description: "Check for practical help, swaps, or less obvious support before the little costs pile higher.",
        primaryEnvelope: "emergency",
        costChips: 1,
        supportMove: true,
        stressDelta: -3,
        schoolDelta: 4,
        reaction: "A lot of stress comes from acting like every small cost has to be solved alone. It doesn't.",
        monthLog: "Got support on the small-cost pile before it got louder.",
        receiptLine: "Used a small emergency buffer while getting student-support help.",
      },
    ],
  },
];

const WEEK_THREE_EVENT: BudgetEvent = {
  id: "meal-plan-low",
  week: 3,
  kicker: "Week 3",
  title: "Meal plan is running low",
  summary: "You can feel the food budget getting thinner, and the cheap options are starting to shape your day.",
  receiptLabel: "FOOD BALANCE",
  receiptAmount: "LOW",
  resourceHint: "Food support and student-support resources are there before a crisis, not just after one.",
  accent: "green",
  choices: [
    {
      id: "grocery-run",
      label: "Refill groceries now",
      description: "Spend real money this week so food stops being a background stressor.",
      primaryEnvelope: "food",
      costChips: 3,
      stressDelta: -3,
      schoolDelta: 3,
      reaction: "Feeding yourself is not an optional side quest. The minute that part stabilizes, everything else gets quieter.",
      monthLog: "Spent on groceries and steadied the week.",
      receiptLine: "Used the food budget to refill groceries before the week sagged.",
    },
    {
      id: "stretch-meals",
      label: "Stretch it and hope",
      description: "Make the meals smaller, the snacks later, and the week blurrier.",
      primaryEnvelope: "food",
      costChips: 1,
      stressDelta: 13,
      schoolDelta: -10,
      reaction: "This is the classic fake savings move: you protect a little cash and lose a lot of energy.",
      monthLog: "Stretched meals and felt the month hit back.",
      receiptLine: "Kept spending low but traded it for stress and focus loss.",
    },
    {
      id: "food-support",
      label: "Use food support or student-support help",
      description: "Take the practical help route before the food issue becomes a full crisis.",
      primaryEnvelope: "emergency",
      costChips: 1,
      supportMove: true,
      stressDelta: -6,
      schoolDelta: 5,
      reaction: "A concrete support move does more than feed you. It gives the week shape again.",
      monthLog: "Used support before the food stress turned into a bigger crash.",
      receiptLine: "Protected the month by using food-support guidance early.",
    },
  ],
};

const WEEK_FOUR_POOL: readonly BudgetWeekVariant[] = [
  {
    id: "bus-pass",
    week: 4,
    kicker: "Week 4",
    title: "Bus pass and commute disruption",
    summary: "Your transportation plan breaks at the exact moment you need predictable class attendance the most.",
    receiptLabel: "COMMUTE HIT",
    receiptAmount: "$85",
    resourceHint: "Transit problems can look like class problems unless someone helps make the bridge concrete.",
    accent: "teal",
    choices: [
      {
        id: "replace-pass",
        label: "Replace the pass now",
        description: "Pay the cost and keep the class week predictable.",
        primaryEnvelope: "transport",
        costChips: 2,
        stressDelta: -2,
        schoolDelta: 2,
        reaction: "It stings, but predictability matters late in the month.",
        monthLog: "Paid for transportation and protected attendance.",
        receiptLine: "Spent transport money to keep the commute stable.",
      },
      {
        id: "miss-and-absorb",
        label: "Absorb the disruption and miss some time",
        description: "Save the cash and let the commute problem leak into class instead.",
        primaryEnvelope: "transport",
        costChips: 0,
        stressDelta: 7,
        schoolDelta: -12,
        reaction: "The pass was a money problem for about one day. Then it became a school problem too.",
        monthLog: "Let the commute issue spill into class time.",
        receiptLine: "Saved the transport money but lost rhythm and class certainty.",
      },
      {
        id: "ask-for-transit-help",
        label: "Follow up on transit or emergency help",
        description: "Use the support route to keep one broken week from turning into lost attendance.",
        primaryEnvelope: "emergency",
        costChips: 1,
        supportMove: true,
        stressDelta: -3,
        schoolDelta: 4,
        reaction: "Help does not erase the disruption, but it keeps it from running the week.",
        monthLog: "Used support to keep the commute hit from derailing the month.",
        receiptLine: "Covered the transport shock with one emergency move and practical help.",
      },
    ],
  },
  {
    id: "lab-fee",
    week: 4,
    kicker: "Week 4",
    title: "Unexpected lab or software fee",
    summary: "A course fee shows up late and suddenly the month wants one more payment before it lets go.",
    receiptLabel: "COURSE FEE",
    receiptAmount: "$100",
    resourceHint: "Late-month course fees are exactly where scholarship and aid follow-up can still matter.",
    accent: "maroon",
    choices: [
      {
        id: "pay-the-fee",
        label: "Pay the fee directly",
        description: "Use your books budget to clear the issue and keep class access intact.",
        primaryEnvelope: "books",
        costChips: 2,
        stressDelta: 1,
        schoolDelta: 1,
        reaction: "You solved the problem, but the margin left in the month gets thin fast.",
        monthLog: "Paid the late course fee and kept access intact.",
        receiptLine: "Covered the lab fee by using the remaining books budget.",
      },
      {
        id: "delay-the-fee",
        label: "Delay it and lose access for a bit",
        description: "Protect your money and let the class hassle get bigger first.",
        primaryEnvelope: "books",
        costChips: 0,
        stressDelta: 9,
        schoolDelta: -12,
        reaction: "It is amazing how fast “I'll deal with it later” becomes “why is everything harder now?”",
        monthLog: "Delayed the late fee and paid for it in stress and access loss.",
        receiptLine: "Kept the cash briefly, but let the course access problem grow.",
      },
      {
        id: "aid-follow-up",
        label: "Use scholarship or aid follow-up",
        description: "Treat the fee like a support problem, not just a private panic problem.",
        primaryEnvelope: "emergency",
        costChips: 1,
        supportMove: true,
        stressDelta: -2,
        schoolDelta: 5,
        reaction: "Late-month help is still help. This is exactly when specific follow-up matters.",
        monthLog: "Used aid follow-up to keep the fee from crashing the finish.",
        receiptLine: "Protected the month by turning the fee into a concrete help step.",
      },
    ],
  },
];

const initialMetrics: BudgetMetrics = {
  stress: 28,
  school: 74,
  supportMoves: 0,
};

function createEmptyEnvelopes() {
  return Object.fromEntries(envelopes.map((envelope) => [envelope.id, 0])) as Record<BudgetEnvelopeId, number>;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatCurrencyFromChips(chips: number) {
  return `$${chips * CHIP_VALUE}`;
}

function sumEnvelopeChips(values: Record<BudgetEnvelopeId, number>) {
  return Object.values(values).reduce((sum, value) => sum + value, 0);
}

function pickVariant<T>(variants: readonly T[], randomValue: number) {
  const normalized = Number.isFinite(randomValue) ? clamp(randomValue, 0, 0.999999) : 0;
  return variants[Math.floor(normalized * variants.length)];
}

export function buildBudgetMonth(randomValues: [number, number]): BudgetWeekVariant[] {
  return [
    WEEK_ONE_EVENT,
    pickVariant(WEEK_TWO_POOL, randomValues[0]),
    WEEK_THREE_EVENT,
    pickVariant(WEEK_FOUR_POOL, randomValues[1]),
  ];
}

function createRunState(randomValues: [number, number] = [Math.random(), Math.random()]): BudgetRunState {
  return {
    phase: "briefing",
    envelopes: createEmptyEnvelopes(),
    events: buildBudgetMonth(randomValues),
    weekIndex: 0,
    metrics: initialMetrics,
    results: [],
    recap: null,
    ending: null,
  };
}

function resolveChoiceOutcome(
  event: BudgetEvent,
  choice: BudgetChoice,
  currentEnvelopes: Record<BudgetEnvelopeId, number>,
  currentMetrics: BudgetMetrics,
): BudgetWeekResult {
  const beforeEnvelopes = { ...currentEnvelopes };
  const beforeMetrics = { ...currentMetrics };

  const primarySpent = Math.min(beforeEnvelopes[choice.primaryEnvelope], choice.costChips);
  const remainingCost = choice.costChips - primarySpent;
  const emergencySpent = Math.min(beforeEnvelopes.emergency, remainingCost);
  const shortfall = remainingCost - emergencySpent;

  const afterEnvelopes = { ...beforeEnvelopes };
  afterEnvelopes[choice.primaryEnvelope] -= primarySpent;
  afterEnvelopes.emergency -= emergencySpent;

  const stressDelta = choice.stressDelta + shortfall * 8;
  const schoolDelta = choice.schoolDelta - shortfall * 6;
  const afterMetrics: BudgetMetrics = {
    stress: clamp(beforeMetrics.stress + stressDelta, 0, 100),
    school: clamp(beforeMetrics.school + schoolDelta, 0, 100),
    supportMoves: beforeMetrics.supportMoves + (choice.supportMove ? 1 : 0),
  };

  return {
    week: event.week,
    eventTitle: event.title,
    eventId: event.id,
    choiceId: choice.id,
    choiceLabel: choice.label,
    supportMove: Boolean(choice.supportMove),
    reaction:
      shortfall > 0
        ? `${choice.reaction} Running short forced the rest into pure stress.`
        : choice.reaction,
    monthLog:
      shortfall > 0 ? `${choice.monthLog} Cash ran short and the month hit back.` : choice.monthLog,
    receiptLine: choice.receiptLine,
    beforeMetrics,
    afterMetrics,
    beforeEnvelopes,
    afterEnvelopes,
    primaryEnvelope: choice.primaryEnvelope,
    costChips: choice.costChips,
    primarySpent,
    emergencySpent,
    shortfall,
    cashDelta: -(primarySpent + emergencySpent) * CHIP_VALUE,
    emergencyDelta: -emergencySpent * CHIP_VALUE,
    stressDelta,
    schoolDelta,
  };
}

function evaluateEnding(metrics: BudgetMetrics, currentEnvelopes: Record<BudgetEnvelopeId, number>): BudgetEnding {
  const cashLeft = sumEnvelopeChips(currentEnvelopes) * CHIP_VALUE;

  if (metrics.school >= 70 && metrics.stress <= 50 && cashLeft >= 150) {
    return {
      id: "strong",
      title: "Strong Finish",
      posterLabel: "MONTH STABLE",
      summary:
        metrics.supportMoves > 0
          ? "You kept enough money moving and used help before the pressure hardened into a crisis."
          : "You finished with real margin left, even without using many support moves.",
      jordanLine: "That is not luck. That is you spotting leaks early enough to do something about them.",
      tone: "strong",
    };
  }

  if (metrics.school <= 45 || metrics.stress >= 78 || cashLeft <= 50) {
    return {
      id: "crisis",
      title: "Crisis Month",
      posterLabel: "MARGIN GONE",
      summary:
        metrics.supportMoves > 0
          ? "Even with some support moves, the month stayed razor-thin. That means the pressure was real, not that you failed."
          : "The month got away from you because every hit had to be absorbed privately and late.",
      jordanLine: "This is the exact moment people think they should have handled it alone. They shouldn't.",
      tone: "crisis",
    };
  }

  return {
    id: "holding",
    title: "Holding On",
    posterLabel: "MONTH SURVIVED",
    summary:
      metrics.supportMoves >= 2
        ? "You got through the month by mixing support with triage. Not elegant, but absolutely real."
        : "You made it through, but one more bad week would have changed the story quickly.",
    jordanLine: "You do not need a perfect budget. You need enough clarity to know where the month is breaking.",
    tone: "holding",
  };
}

function getBudgetInstructions(phase: BudgetPhase) {
  switch (phase) {
    case "briefing":
      return "Build a month budget, survive four weekly setbacks, and finish without letting one bad week become the whole story.";
    case "allocation":
      return "Assign all 20 money chips before the month starts. Tap an envelope to place one chip and tap a chip to pull it back.";
    case "week-play":
      return "One event lands each week. Pick the move that protects the month, not just the next ten minutes.";
    case "week-recap":
      return "Read what changed before the next week hits. This is where the tradeoff becomes visible.";
    case "final-recap":
      return "The month is over. Read the pattern clearly, then carry that clarity back into the story.";
  }
}

function getWeekStatusClass(
  eventIndex: number,
  results: BudgetWeekResult[],
  currentWeekIndex: number,
  phase: BudgetPhase,
) {
  if (results[eventIndex]) {
    if (results[eventIndex].supportMove) return "is-support";
    if (results[eventIndex].stressDelta > 5 || results[eventIndex].schoolDelta < -5) return "is-rough";
    return "is-complete";
  }

  if (phase === "week-play" && eventIndex === currentWeekIndex) {
    return "is-current";
  }

  return "is-upcoming";
}

export default function BudgetSplitter({
  onComplete,
  sound,
  onInteract,
}: {
  onComplete: () => void;
  sound: SoundEngineControls;
  onInteract?: () => void;
}) {
  const [run, setRun] = useState<BudgetRunState>(() => createRunState());

  const instructions = getBudgetInstructions(run.phase);
  const currentEvent = run.events[run.weekIndex];
  const remainingChips = TOTAL_CHIPS - sumEnvelopeChips(run.envelopes);
  const cashLeft = sumEnvelopeChips(run.envelopes);
  const emergencyLeft = run.envelopes.emergency;

  const changedEnvelopes = useMemo(() => {
    if (!run.recap) return [];

    return envelopes.filter(
      (envelope) => run.recap!.beforeEnvelopes[envelope.id] !== run.recap!.afterEnvelopes[envelope.id],
    );
  }, [run.recap]);

  function beginAllocation() {
    onInteract?.();
    sound.whoosh();
    setRun((current) => ({ ...current, phase: "allocation" }));
  }

  function addChip(envelopeId: BudgetEnvelopeId) {
    if (run.phase !== "allocation" || remainingChips <= 0) return;
    onInteract?.();
    sound.pop();
    setRun((current) => ({
      ...current,
      envelopes: {
        ...current.envelopes,
        [envelopeId]: current.envelopes[envelopeId] + 1,
      },
    }));
  }

  function removeChip(envelopeId: BudgetEnvelopeId) {
    if (run.phase !== "allocation" || run.envelopes[envelopeId] <= 0) return;
    onInteract?.();
    sound.pop();
    setRun((current) => ({
      ...current,
      envelopes: {
        ...current.envelopes,
        [envelopeId]: current.envelopes[envelopeId] - 1,
      },
    }));
  }

  function startMonth() {
    if (remainingChips !== 0) return;
    onInteract?.();
    sound.whoosh();
    setRun((current) => ({ ...current, phase: "week-play" }));
  }

  function chooseChoice(choice: BudgetChoice) {
    if (!currentEvent) return;
    onInteract?.();
    if (choice.supportMove) {
      sound.correct();
    } else {
      sound.pop();
    }

    const recap = resolveChoiceOutcome(currentEvent, choice, run.envelopes, run.metrics);
    setRun((current) => ({
      ...current,
      phase: "week-recap",
      envelopes: recap.afterEnvelopes,
      metrics: recap.afterMetrics,
      recap,
      results: [...current.results, recap],
    }));
  }

  function advanceFromRecap() {
    if (!run.recap) return;
    onInteract?.();
    sound.whoosh();

    setRun((current) => {
      const isLastWeek = current.weekIndex >= current.events.length - 1;

      if (isLastWeek) {
        return {
          ...current,
          phase: "final-recap",
          recap: null,
          ending: evaluateEnding(current.metrics, current.envelopes),
        };
      }

      return {
        ...current,
        phase: "week-play",
        weekIndex: current.weekIndex + 1,
        recap: null,
      };
    });
  }

  function rerollMonth() {
    onInteract?.();
    sound.whoosh();
    setRun(createRunState());
  }

  return (
    <MiniGameShell
      title="SURVIVE THE MONTH"
      instructions={instructions}
      icon="💸"
      completed={run.phase === "final-recap"}
      onComplete={onComplete}
      continueLabel="Back to Jordan ►"
    >
      <div className="sketch-budget-hud">
        <article className="sketch-budget-hud-card">
          <span className="sketch-mini-eyebrow">Week</span>
          <strong>
            {run.phase === "briefing" ? "Briefing" : run.phase === "allocation" ? "Setup" : `Week ${Math.min(run.weekIndex + 1, 4)}`}
          </strong>
        </article>
        <article className="sketch-budget-hud-card">
          <span className="sketch-mini-eyebrow">Cash left</span>
          <strong>{formatCurrencyFromChips(cashLeft)}</strong>
        </article>
        <article className={`sketch-budget-hud-card ${run.metrics.stress >= 65 ? "is-danger" : ""}`}>
          <span className="sketch-mini-eyebrow">Stress</span>
          <strong>{run.metrics.stress}/100</strong>
        </article>
        <article className={`sketch-budget-hud-card ${run.metrics.school <= 55 ? "is-danger" : ""}`}>
          <span className="sketch-mini-eyebrow">School</span>
          <strong>{run.metrics.school}/100</strong>
        </article>
        <article className="sketch-budget-hud-card">
          <span className="sketch-mini-eyebrow">Emergency</span>
          <strong>{formatCurrencyFromChips(emergencyLeft)}</strong>
        </article>
      </div>

      {run.phase === "briefing" ? (
        <div className="sketch-budget-stage">
          <article className="sketch-budget-briefing-card">
            <p className="sketch-mini-eyebrow">Student month</p>
            <h3>First-year student, Tempe campus, part-time job, meal plan already running low.</h3>
            <p>
              You get twenty money chips for the month. Then four separate weeks try to take more than you planned.
              The goal is not perfection. The goal is to finish with enough margin left to breathe.
            </p>
            <div className="sketch-budget-pressure-row">
              <span>🏫 Class costs keep moving</span>
              <span>🍽️ Food gets tight fast</span>
              <span>🧾 Small fees pile up</span>
            </div>
            <button
              type="button"
              className="sketch-action-button sketch-action-button-gold"
              onClick={beginAllocation}
            >
              Build the month ►
            </button>
          </article>

          <aside className="sketch-budget-month-log">
            <p className="sketch-mini-eyebrow">How this works</p>
            <ol className="sketch-budget-rule-list">
              <li>Place all 20 chips into envelopes.</li>
              <li>Survive four weekly event cards.</li>
              <li>Watch how money choices change stress and school stability.</li>
            </ol>
          </aside>
        </div>
      ) : null}

      {run.phase === "allocation" ? (
        <div className="sketch-budget-stage sketch-budget-stage-wide">
          <section className="sketch-budget-board">
            <article className="sketch-budget-tray-card">
              <div>
                <p className="sketch-mini-eyebrow">Money tray</p>
                <strong>{remainingChips} chips left to place</strong>
              </div>
              <span>20 chips total, {formatCurrencyFromChips(1)} each</span>
              <div className="sketch-budget-chip-tray" aria-hidden="true">
                {Array.from({ length: remainingChips }).map((_, index) => (
                  <span key={`loose-chip-${index}`} className="sketch-budget-chip sketch-budget-chip-loose">
                    ${CHIP_VALUE}
                  </span>
                ))}
              </div>
            </article>

            <div className="sketch-budget-envelope-grid">
              {envelopes.map((envelope) => (
                <article
                  key={envelope.id}
                  className="sketch-budget-envelope"
                  role="button"
                  tabIndex={0}
                  onClick={() => addChip(envelope.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      addChip(envelope.id);
                    }
                  }}
                >
                  <div className="sketch-budget-envelope-head">
                    <div>
                      <span className="sketch-mini-eyebrow">
                        {envelope.emoji} {envelope.label}
                      </span>
                      <strong>{formatCurrencyFromChips(run.envelopes[envelope.id])}</strong>
                    </div>
                    <span className="sketch-budget-envelope-reco">
                      Ghost split: {envelope.recommendedChips} chips
                    </span>
                  </div>
                  <p>{envelope.note}</p>
                  <div className="sketch-budget-envelope-stack">
                    {Array.from({ length: envelope.recommendedChips }).map((_, index) => (
                      <span
                        key={`${envelope.id}-ghost-${index}`}
                        className={`sketch-budget-chip sketch-budget-chip-ghost ${
                          index < run.envelopes[envelope.id] ? "is-covered" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <div className="sketch-budget-envelope-chip-row">
                    {Array.from({ length: run.envelopes[envelope.id] }).map((_, index) => (
                      <button
                        key={`${envelope.id}-chip-${index}`}
                        type="button"
                        className="sketch-budget-chip"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeChip(envelope.id);
                        }}
                      >
                        ${CHIP_VALUE}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="sketch-budget-side-panel">
            <article className="sketch-budget-insight-card">
              <p className="sketch-mini-eyebrow">Recommended split</p>
              <strong>The ghost chips show one stable version of the month, not the only correct version.</strong>
              <span>You can ignore it. The point is to see what the month feels like after the surprises start.</span>
            </article>

            <article className="sketch-budget-insight-card">
              <p className="sketch-mini-eyebrow">Start rule</p>
              <strong>Every chip must be assigned.</strong>
              <span>If money is still floating in the tray, the month has not actually begun yet.</span>
            </article>

            <button
              type="button"
              className="sketch-action-button sketch-action-button-gold"
              onClick={startMonth}
              disabled={remainingChips !== 0}
            >
              Start Week 1 ►
            </button>
          </aside>
        </div>
      ) : null}

      {run.phase === "week-play" && currentEvent ? (
        <div className="sketch-budget-stage sketch-budget-stage-wide">
          <section className="sketch-budget-event-stage">
            <article className={`sketch-budget-receipt-card accent-${currentEvent.accent}`}>
              <div className="sketch-budget-receipt-top">
                <p className="sketch-mini-eyebrow">{currentEvent.kicker}</p>
                <span>{currentEvent.receiptLabel}</span>
              </div>
              <div className="sketch-budget-receipt-price">{currentEvent.receiptAmount}</div>
              <h3>{currentEvent.title}</h3>
              <p>{currentEvent.summary}</p>
              <div className="sketch-budget-resource-hint">{currentEvent.resourceHint}</div>
            </article>

            <div className="sketch-budget-choice-grid">
              {currentEvent.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className={`sketch-budget-choice-card ${choice.supportMove ? "is-support" : ""}`}
                  onClick={() => chooseChoice(choice)}
                >
                  <div className="sketch-budget-choice-header">
                    <strong>{choice.label}</strong>
                    <span>
                      {choice.costChips > 0
                        ? `${formatCurrencyFromChips(choice.costChips)} from ${
                            envelopes.find((envelope) => envelope.id === choice.primaryEnvelope)?.label
                          }`
                        : "No money leaves immediately"}
                    </span>
                  </div>
                  <p>{choice.description}</p>
                  <small>
                    Stress {choice.stressDelta >= 0 ? "+" : ""}
                    {choice.stressDelta} · School {choice.schoolDelta >= 0 ? "+" : ""}
                    {choice.schoolDelta}
                  </small>
                </button>
              ))}
            </div>
          </section>

          <aside className="sketch-budget-month-log">
            <div className="sketch-budget-log-header">
              <div>
                <p className="sketch-mini-eyebrow">Month log</p>
                <strong>Four weeks, one money story</strong>
              </div>
              <span>{run.results.length}/4 resolved</span>
            </div>
            <div className="sketch-budget-week-log-grid">
              {run.events.map((event, index) => (
                <article
                  key={event.id}
                  className={`sketch-budget-week-log ${getWeekStatusClass(index, run.results, run.weekIndex, run.phase)}`}
                >
                  <span>{event.kicker}</span>
                  <strong>{event.title}</strong>
                  <p>{run.results[index]?.monthLog ?? event.summary}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {run.phase === "week-recap" && run.recap ? (
        <div className="sketch-budget-stage sketch-budget-stage-wide">
          <section className="sketch-budget-recap-card">
            <p className="sketch-mini-eyebrow">Week {run.recap.week} recap</p>
            <h3>{run.recap.choiceLabel}</h3>
            <p>{run.recap.reaction}</p>

            <div className="sketch-budget-delta-grid">
              <article className="sketch-budget-delta-card">
                <span>Cash moved</span>
                <strong>{run.recap.cashDelta === 0 ? "$0" : `${run.recap.cashDelta > 0 ? "+" : ""}$${run.recap.cashDelta}`}</strong>
              </article>
              <article className="sketch-budget-delta-card">
                <span>Emergency used</span>
                <strong>{run.recap.emergencyDelta === 0 ? "$0" : `${run.recap.emergencyDelta > 0 ? "+" : ""}$${run.recap.emergencyDelta}`}</strong>
              </article>
              <article className="sketch-budget-delta-card">
                <span>Stress</span>
                <strong>
                  {run.recap.stressDelta > 0 ? "+" : ""}
                  {run.recap.stressDelta}
                </strong>
              </article>
              <article className="sketch-budget-delta-card">
                <span>School</span>
                <strong>
                  {run.recap.schoolDelta > 0 ? "+" : ""}
                  {run.recap.schoolDelta}
                </strong>
              </article>
            </div>

            <div className="sketch-budget-recap-strip">
              <strong>Receipt line</strong>
              <p>{run.recap.receiptLine}</p>
            </div>

            {run.recap.shortfall > 0 ? (
              <div className="sketch-budget-recap-warning">
                Cash came up short by {formatCurrencyFromChips(run.recap.shortfall)}. The missing money converted straight into
                stress and school damage.
              </div>
            ) : null}

            <button
              type="button"
              className="sketch-action-button sketch-action-button-gold"
              onClick={advanceFromRecap}
            >
              {run.weekIndex >= run.events.length - 1 ? "See month result ►" : "Next week ►"}
            </button>
          </section>

          <aside className="sketch-budget-month-log">
            <p className="sketch-mini-eyebrow">Envelope changes</p>
            <div className="sketch-budget-change-list">
              {changedEnvelopes.map((envelope) => (
                <article key={`${envelope.id}-change`} className="sketch-budget-change-row">
                  <strong>
                    {envelope.emoji} {envelope.label}
                  </strong>
                  <span>
                    {formatCurrencyFromChips(run.recap!.beforeEnvelopes[envelope.id])} →{" "}
                    {formatCurrencyFromChips(run.recap!.afterEnvelopes[envelope.id])}
                  </span>
                </article>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      {run.phase === "final-recap" && run.ending ? (
        <div className="sketch-budget-stage sketch-budget-stage-wide">
          <section className={`sketch-budget-ending-card is-${run.ending.tone}`}>
            <p className="sketch-mini-eyebrow">{run.ending.posterLabel}</p>
            <h3>{run.ending.title}</h3>
            <p>{run.ending.summary}</p>
            <div className="sketch-budget-ending-stats">
              <span>Cash left: {formatCurrencyFromChips(cashLeft)}</span>
              <span>Stress: {run.metrics.stress}/100</span>
              <span>School: {run.metrics.school}/100</span>
              <span>Support moves: {run.metrics.supportMoves}</span>
            </div>
            <blockquote>{run.ending.jordanLine}</blockquote>
            <button type="button" className="sketch-action-button" onClick={rerollMonth}>
              Try another month
            </button>
          </section>

          <aside className="sketch-budget-month-log">
            <div className="sketch-budget-log-header">
              <div>
                <p className="sketch-mini-eyebrow">Full month</p>
                <strong>What actually happened</strong>
              </div>
            </div>
            <div className="sketch-budget-week-log-grid">
              {run.results.map((result) => (
                <article
                  key={`${result.eventId}-${result.choiceId}`}
                  className={`sketch-budget-week-log ${result.supportMove ? "is-support" : "is-complete"}`}
                >
                  <span>Week {result.week}</span>
                  <strong>{result.eventTitle}</strong>
                  <p>{result.monthLog}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      ) : null}
    </MiniGameShell>
  );
}
