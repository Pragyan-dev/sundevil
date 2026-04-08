"use client";

import { useMemo, useRef, useState } from "react";

import { ScholarshipCoach } from "@/components/ScholarshipCoach";
import { CharacterAvatar } from "@/components/simulation/CharacterAvatar";
import { scholarships } from "@/lib/data";
import type { ResourceScenario, ResourceWorld } from "@/lib/resource-discovery-types";

interface SuccessCoachScreenProps {
  world: ResourceWorld;
  scenario: ResourceScenario;
  onBack: () => void;
  onComplete: () => void;
  onOpenResource: () => void;
}

const COACH_VIDEO_URL = "https://www.youtube.com/watch?v=Xhn8BYdKvW8";
const FIND_COACH_URL = "https://success.asu.edu/success-resources/first-generation-students";

const coachProfiles = [
  {
    id: "cs",
    name: "Jordan Patel",
    track: "Computer Science",
    icon: "💻",
    bio: "Great for students balancing coding classes, deadlines, and heavy project weeks.",
  },
  {
    id: "psych",
    name: "Maya Torres",
    track: "Psychology",
    icon: "🧠",
    bio: "Good fit for students thinking about people-centered majors, research, and staying grounded.",
  },
  {
    id: "arts",
    name: "Eli Romero",
    track: "Arts",
    icon: "🎨",
    bio: "Helpful for creative students building routines while juggling studio, performance, or portfolio work.",
  },
] as const;

const placeholderLabCopy: Record<
  Exclude<ResourceWorld["id"], "first-gen-support">,
  {
    eyebrow: string;
    title: string;
    description: string;
    boxes: Array<{ title: string; body: string }>;
  }
> = {
  "academic-advising": {
    eyebrow: "Placeholder Lab",
    title: "Advising Coach Lab",
    description: "Placeholder for the advising follow-up flow. We can turn this into a guided planning lab next.",
    boxes: [
      { title: "Placeholder step 1", body: "Add a short advising warm-up or reflection here." },
      { title: "Placeholder step 2", body: "Add a planning mini-task or schedule check here." },
      { title: "Placeholder step 3", body: "Add the real advising CTA or next action here." },
    ],
  },
  tutoring: {
    eyebrow: "Placeholder Lab",
    title: "Tutoring Coach Lab",
    description: "Placeholder for the tutoring follow-up flow. Later we can add a practice prompt, help-request draft, or resource finder.",
    boxes: [
      { title: "Placeholder step 1", body: "Add a short tutoring recap here." },
      { title: "Placeholder step 2", body: "Add a worksheet, quiz, or question-builder here." },
      { title: "Placeholder step 3", body: "Add the final tutoring link or booking step here." },
    ],
  },
  "explore-asu": {
    eyebrow: "Placeholder Lab",
    title: "Explore ASU Lab",
    description: "Placeholder for the Explore ASU follow-up flow. We can turn this into a campus discovery experience later.",
    boxes: [
      { title: "Placeholder step 1", body: "Add a campus exploration beat here." },
      { title: "Placeholder step 2", body: "Add a location or navigation interaction here." },
      { title: "Placeholder step 3", body: "Add the next Explore ASU action here." },
    ],
  },
  "financial-aid": {
    eyebrow: "Placeholder Lab",
    title: "Financial Aid Coach Lab",
    description: "Placeholder for the financial aid follow-up flow. This can become a checklist or document-prep lab later.",
    boxes: [
      { title: "Placeholder step 1", body: "Add a task breakdown for aid questions here." },
      { title: "Placeholder step 2", body: "Add a form or deadline prep interaction here." },
      { title: "Placeholder step 3", body: "Add the real aid resource link here." },
    ],
  },
  "career-services": {
    eyebrow: "Placeholder Lab",
    title: "Career Coach Lab",
    description: "Placeholder for the career follow-up flow. We can turn this into a resume or job-search mini-game later.",
    boxes: [
      { title: "Placeholder step 1", body: "Add a confidence-building prompt here." },
      { title: "Placeholder step 2", body: "Add a resume or application practice step here." },
      { title: "Placeholder step 3", body: "Add the career services CTA here." },
    ],
  },
  counseling: {
    eyebrow: "Placeholder Lab",
    title: "Counseling Support Lab",
    description: "Placeholder for the counseling follow-up flow. Later this can become a gentle check-in and support-routing experience.",
    boxes: [
      { title: "Placeholder step 1", body: "Add a short emotional check-in here." },
      { title: "Placeholder step 2", body: "Add a support preference selector here." },
      { title: "Placeholder step 3", body: "Add the counseling next-step link here." },
    ],
  },
  "office-hours": {
    eyebrow: "Placeholder Lab",
    title: "Office Hours Coach Lab",
    description: "Placeholder for the office-hours follow-up flow. We can add email prep or question-building here later.",
    boxes: [
      { title: "Placeholder step 1", body: "Add an office-hours prep prompt here." },
      { title: "Placeholder step 2", body: "Add a question builder or script here." },
      { title: "Placeholder step 3", body: "Add the final professor/contact CTA here." },
    ],
  },
};

const ADVISING_SCHEDULER_URL = "https://appointments.apps.asu.edu/";
const ARMSTRONG_HALL_MAP_URL =
  "https://google.com/maps?rlz=1C5AJCO_enUS1195US1195&um=1&ie=UTF-8&fb=1&gl=us&sa=X&geocode=KXVC6S3YCCuHMVFdk1CXTRvj&daddr=Centerpoint,+660,+S+Mill+Ave+%23+105,+Tempe,+AZ+85281";

const confettiPieces = [
  { left: "8%", delay: "0ms", duration: "2300ms", color: "#ffc627", rotate: "-18deg" },
  { left: "18%", delay: "120ms", duration: "2500ms", color: "#8c1d40", rotate: "16deg" },
  { left: "28%", delay: "40ms", duration: "2200ms", color: "#ffdd92", rotate: "-8deg" },
  { left: "41%", delay: "180ms", duration: "2600ms", color: "#d6657e", rotate: "22deg" },
  { left: "53%", delay: "80ms", duration: "2400ms", color: "#ffc627", rotate: "-24deg" },
  { left: "64%", delay: "200ms", duration: "2700ms", color: "#8c1d40", rotate: "10deg" },
  { left: "76%", delay: "60ms", duration: "2350ms", color: "#ffe9ba", rotate: "-16deg" },
  { left: "88%", delay: "140ms", duration: "2550ms", color: "#f0a8b6", rotate: "18deg" },
] as const;

interface EvaluationResult {
  score: number;
  strengths: string[];
  suggestions: string[];
  ready: boolean;
}

function evaluateEmailDraft(draft: string, coachName: string | null): EvaluationResult {
  const trimmed = draft.trim();
  const lowered = trimmed.toLowerCase();
  const strengths: string[] = [];
  const suggestions: string[] = [];

  const hasGreeting = /\b(hi|hello|dear)\b/i.test(trimmed);
  const mentionsCoach = coachName ? lowered.includes(coachName.toLowerCase()) : false;
  const mentionsAsu = /\basu\b/i.test(trimmed);
  const mentionsNeed = /(help|guidance|support|advice|coaching|coach)/i.test(trimmed);
  const hasSpecificDetail = /(computer science|psychology|arts|schedule|organized|overwhelmed|first-gen|first generation|classes|semester|routine)/i.test(trimmed);
  const hasQuestion = trimmed.includes("?");
  const hasClosing = /(thank you|thanks|sincerely|best)/i.test(trimmed);
  const lengthOkay = trimmed.split(/\s+/).filter(Boolean).length >= 35;

  if (hasGreeting) {
    strengths.push("Polite opening.");
  } else {
    suggestions.push("Add a quick greeting.");
  }

  if (mentionsCoach) {
    strengths.push("You used the coach's name.");
  } else {
    suggestions.push("Use the coach's name.");
  }

  if (mentionsAsu) {
    strengths.push("ASU context is clear.");
  } else {
    suggestions.push("Say you are an ASU student.");
  }

  if (mentionsNeed) {
    strengths.push("Your ask is clear.");
  } else {
    suggestions.push("Say what help you want.");
  }

  if (hasSpecificDetail) {
    strengths.push("You added a real detail.");
  } else {
    suggestions.push("Add one real detail.");
  }

  if (hasQuestion) {
    strengths.push("You asked a real question.");
  } else {
    suggestions.push("End with one clear question.");
  }

  if (hasClosing) {
    strengths.push("Strong closing.");
  } else {
    suggestions.push("Add a short closing.");
  }

  if (!lengthOkay) {
    suggestions.push("Add a little more context.");
  }

  const passedChecks = [
    hasGreeting,
    mentionsCoach,
    mentionsAsu,
    mentionsNeed,
    hasSpecificDetail,
    hasQuestion,
    hasClosing,
    lengthOkay,
  ].filter(Boolean).length;

  const score = Math.round((passedChecks / 8) * 100);

  return {
    score,
    strengths,
    suggestions,
    ready: score >= 75 && hasGreeting && mentionsNeed && hasQuestion && hasClosing,
  };
}

function AdvisingRoomSimulation() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
    setIsPlaying(false);
  }

  return (
    <button
      type="button"
      onClick={togglePlayback}
      aria-pressed={isPlaying}
      className="group mt-3 block w-full overflow-hidden rounded-[1.2rem] border border-[#d9c3ac] bg-[#2c1116] text-left shadow-[0_16px_36px_rgba(44,17,22,0.2)] transition hover:-translate-y-0.5"
    >
      <div className="relative">
        <video
          ref={videoRef}
          className="aspect-video w-full bg-[#2c1116] object-cover"
          playsInline
          muted
          loop
          preload="metadata"
        >
          <source src="/advising-room-sim.mp4" type="video/mp4" />
          <source src="/advising-room-sim.mov" type="video/quicktime" />
        </video>
      </div>
    </button>
  );
}

function FinancialAidCoachScreen({
  world,
  scenario,
  onBack,
  onComplete,
}: SuccessCoachScreenProps) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:border-[#ffc627] hover:text-[#ffc627]"
          >
            ← Back to scene
          </button>
          <p className="mt-4 text-[0.72rem] font-black uppercase tracking-[0.22em] text-[#ffe2ae]">
            {world.title}
          </p>
          <h1 className="mt-2 font-[var(--font-sim-display)] text-[clamp(2rem,5vw,3.6rem)] leading-[0.92] text-white">
            Financial Aid Coach Lab
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#f6dde3]">
            {scenario.title} now opens the full scholarship coach inside the lab, so students can filter, rank, track, and draft without leaving this flow.
          </p>
        </div>
      </div>

      <section className="rounded-[2rem] border border-[#f0dbc6] bg-[#fff8ef] p-6 shadow-[0_24px_80px_rgba(44,17,22,0.18)]">
        <ScholarshipCoach scholarships={scholarships} variant="lab" />

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
          >
            Finish financial aid lab
          </button>
        </div>
      </section>
    </div>
  );
}

function PlaceholderCoachScreen({
  world,
  scenario,
  onBack,
  onOpenResource,
  onComplete,
}: SuccessCoachScreenProps) {
  if (world.id === "academic-advising") {
    return (
      <div className="grid gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:border-[#ffc627] hover:text-[#ffc627]"
            >
              ← Back to scene
            </button>
            <p className="mt-4 text-[0.72rem] font-black uppercase tracking-[0.22em] text-[#ffe2ae]">
              {world.title}
            </p>
            <h1 className="mt-2 font-[var(--font-sim-display)] text-[clamp(2rem,5vw,3.6rem)] leading-[0.92] text-white">
              Advising Coach Lab
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#f6dde3]">
              This lab now has 3 advising-specific sections: how to book, advisor video placeholder, and a preview of the office space with location details.
            </p>
          </div>
        </div>

        <section className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-[2rem] border border-[#f0dbc6] bg-[#fff8ef] p-5 shadow-[0_24px_80px_rgba(44,17,22,0.18)]">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Section 1
            </p>
            <h2 className="mt-3 font-[var(--font-sim-display)] text-[1.55rem] leading-[0.96] text-[#2c1116]">
              How to book advising
            </h2>

            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[#ead7c4] bg-[#2c1116] shadow-[0_16px_36px_rgba(44,17,22,0.18)]">
              <video
                className="aspect-video w-full bg-[#2c1116]"
                controls
                playsInline
                preload="metadata"
              >
                <source src="/advising-booking-demo.mp4" type="video/mp4" />
                <source src="/advising-booking-demo.mov" type="video/quicktime" />
                Your browser does not support the advising booking video.
              </video>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={ADVISING_SCHEDULER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#ffc627] px-5 py-3 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#f4bb14]"
              >
                Open advising scheduler
              </a>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[#f0dbc6] bg-[#fff8ef] p-5 shadow-[0_24px_80px_rgba(44,17,22,0.18)]">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Section 2
            </p>
            <h2 className="mt-3 font-[var(--font-sim-display)] text-[1.55rem] leading-[0.96] text-[#2c1116]">
              Advisor person video
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6f4a4e]">
              Placeholder for the advisor/person video you will generate later. This can introduce the advisor and explain what happens in a meeting.
            </p>

            <div className="mt-4 rounded-[1.5rem] border border-[#ead7c4] bg-white p-5">
              <div className="flex items-start gap-4">
                <CharacterAvatar expression="happy" size="md" pulse />
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    Coming soon
                  </p>
                  <p className="mt-2 font-[var(--font-sim-display)] text-[1.25rem] leading-none text-[#2c1116]">
                    Advisor intro video slot
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#6f4a4e]">
                    Add the advisor clip here once your new video is ready.
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[#f0dbc6] bg-[#fff8ef] p-5 shadow-[0_24px_80px_rgba(44,17,22,0.18)]">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Section 3
            </p>
            <h2 className="mt-3 font-[var(--font-sim-display)] text-[1.55rem] leading-[0.96] text-[#2c1116]">
              Office and room preview
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6f4a4e]">
              Tap through the space to get a feel for the room before you go. The real location is right below so it feels familiar when you arrive.
            </p>

            <div className="mt-4 rounded-[1.5rem] border border-[#ead7c4] bg-[linear-gradient(135deg,#fff6eb,#fffdf9)] p-4">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                Tap to explore
              </p>
              <AdvisingRoomSimulation />
              <div className="mt-4 rounded-[1.2rem] border border-[#ecd9c5] bg-white px-4 py-3 text-sm leading-6 text-[#6f4a4e]">
                <div><strong className="text-[#2c1116]">Location:</strong> Centerpoint, Suite 105</div>
                <div><strong className="text-[#2c1116]">Address:</strong> 660 S. Mill Ave. #105, Tempe, AZ 85281</div>
              </div>
              <a
                href={ARMSTRONG_HALL_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
              >
                Open in Google Maps
              </a>
            </div>
          </article>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
          >
            Finish advising lab
          </button>
        </div>
      </div>
    );
  }

  if (world.id === "financial-aid") {
    return (
      <FinancialAidCoachScreen
        world={world}
        scenario={scenario}
        onBack={onBack}
        onComplete={onComplete}
        onOpenResource={onOpenResource}
      />
    );
  }

  const placeholder = placeholderLabCopy[world.id as Exclude<ResourceWorld["id"], "first-gen-support">];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:border-[#ffc627] hover:text-[#ffc627]"
          >
            ← Back to scene
          </button>
          <p className="mt-4 text-[0.72rem] font-black uppercase tracking-[0.22em] text-[#ffe2ae]">
            {world.title}
          </p>
          <h1 className="mt-2 font-[var(--font-sim-display)] text-[clamp(2rem,5vw,3.6rem)] leading-[0.92] text-white">
            Coach Lab
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#f6dde3]">
            {scenario.title} now flows into a coach lab. This one is a placeholder for now, and we can customize the exact content later.
          </p>
        </div>
      </div>

      <section className="rounded-[2rem] border border-[#f0dbc6] bg-[#fff8ef] p-6 shadow-[0_24px_80px_rgba(44,17,22,0.18)]">
        <div className="flex flex-wrap items-start gap-5">
          <CharacterAvatar expression="idea" size="lg" pulse />
          <div className="min-w-0 flex-1">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              {placeholder.eyebrow}
            </p>
            <h2 className="mt-3 font-[var(--font-sim-display)] text-[2rem] leading-none text-[#2c1116]">
              {placeholder.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f4a4e]">
              {placeholder.description}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {placeholder.boxes.map((box) => (
            <div
              key={box.title}
              className="rounded-[1.5rem] border border-[#ead7c4] bg-white p-4 shadow-[0_12px_30px_rgba(44,17,22,0.06)]"
            >
              <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                Placeholder
              </p>
              <p className="mt-3 font-[var(--font-sim-display)] text-[1.2rem] leading-none text-[#2c1116]">
                {box.title}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#6f4a4e]">{box.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
          >
            Finish placeholder lab
          </button>
        </div>
      </section>
    </div>
  );
}

function FirstGenCoachScreen({
  world,
  scenario,
  onBack,
  onComplete,
  onOpenResource,
}: SuccessCoachScreenProps) {

  const [simulationStarted, setSimulationStarted] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState<(typeof coachProfiles)[number]["id"] | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [evaluationRequested, setEvaluationRequested] = useState(false);
  const [readyPopupOpen, setReadyPopupOpen] = useState(false);
  const [readyPopupShown, setReadyPopupShown] = useState(false);

  const selectedCoach = coachProfiles.find((coach) => coach.id === selectedCoachId) ?? null;
  const evaluation = useMemo(
    () => evaluateEmailDraft(emailDraft, selectedCoach?.name ?? null),
    [emailDraft, selectedCoach],
  );
  const showEvaluation = evaluationRequested && emailDraft.trim().length > 0;
  const readyForCoachLink = Boolean(selectedCoach && showEvaluation && evaluation.ready);
  const visibleStrengths = evaluation.strengths.slice(0, 2);
  const visibleSuggestions = evaluation.suggestions.slice(0, 3);
  const sampleEmail = useMemo(() => {
    if (!selectedCoach) {
      return null;
    }

    return `Hi ${selectedCoach.name},

I am an ASU student and I am looking for success coaching support. I am interested in ${selectedCoach.track.toLowerCase()}, and I want help building a better routine so I can stay on top of classes and feel less overwhelmed.

Could you let me know the best next step for connecting with a success coach?

Thank you,
[Your Name]`;
  }, [selectedCoach]);

  function handleEvaluation() {
    setEvaluationRequested(true);

    const result = evaluateEmailDraft(emailDraft, selectedCoach?.name ?? null);
    if (selectedCoach && result.ready && !readyPopupShown) {
      setReadyPopupOpen(true);
      setReadyPopupShown(true);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:border-[#ffc627] hover:text-[#ffc627]"
          >
            ← Back to chat
          </button>
          <p className="mt-4 text-[0.72rem] font-black uppercase tracking-[0.22em] text-[#ffe2ae]">
            {world.title}
          </p>
          <h1 className="mt-2 font-[var(--font-sim-display)] text-[clamp(2rem,5vw,3.6rem)] leading-[0.92] text-white">
            Coach Connection Lab
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#f6dde3]">
            {scenario.title} now turns into action: watch how success coaching works, then build your own coach outreach plan.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/18 bg-white/10 px-4 py-4 text-sm text-white backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffc627]" />
            <span>Coach video</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${readyForCoachLink ? "bg-[#ffc627]" : "bg-white/35"}`} />
            <span>Find + email simulation</span>
          </div>
        </div>
      </div>

      <div className="grid gap-5">
        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-[#f0dbc6] bg-[#fff8ef] p-5 shadow-[0_24px_80px_rgba(44,17,22,0.18)]">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Box 1
            </p>
            <h2 className="mt-3 font-[var(--font-sim-display)] text-[1.8rem] leading-[0.95] text-[#2c1116]">
              Watch a quick ASU coach intro
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6f4a4e]">
              This uses an official ASU video so students can see that success coaching is normal, friendly, and not some scary academic penalty box.
            </p>

            <div className="mt-5 rounded-[1.6rem] border border-[#f4d8ab] bg-[linear-gradient(135deg,#fff2cc,#fffaf2)] p-4">
              <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                Suggested watch
              </p>
              <p className="mt-2 font-[var(--font-sim-display)] text-[1.2rem] leading-none text-[#2c1116]">
                First-Year Success Center at ASU
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                A short Arizona State University YouTube video featuring success coaching and what students actually get out of it.
              </p>

              <div className="mt-4 overflow-hidden rounded-[1.35rem] border border-[#ead7bd] bg-[#2c1116] shadow-[0_16px_36px_rgba(44,17,22,0.18)]">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src="https://www.youtube-nocookie.com/embed/Xhn8BYdKvW8?rel=0"
                    title="First-Year Success Center at ASU"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={COACH_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#ffc627] px-5 py-3 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#f4bb14]"
              >
                Open on YouTube
              </a>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[#f0dbc6] bg-[#fff8ef] p-5 shadow-[0_24px_80px_rgba(44,17,22,0.18)]">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Box 2
            </p>
            <h2 className="mt-3 font-[var(--font-sim-display)] text-[1.8rem] leading-[0.95] text-[#2c1116]">
              Find a coach, write the email, get feedback
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6f4a4e]">
              This mission gives you three sample coach backgrounds, a real email drafting box, and an AI-style evaluator before you jump to the real success coach page.
            </p>

            {!simulationStarted ? (
              <button
                type="button"
                onClick={() => setSimulationStarted(true)}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
              >
                Start coach finder
              </button>
            ) : (
              <div className="mt-5 grid gap-4">
                <div className="rounded-[1.4rem] border border-[#f2dfca] bg-white p-4">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    1. Pick a sample coach background
                  </p>
                  <div className="mt-3 grid gap-3">
                    {coachProfiles.map((coach) => (
                      <button
                        key={coach.id}
                        type="button"
                        onClick={() => setSelectedCoachId(coach.id)}
                        className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm transition ${
                          selectedCoachId === coach.id
                            ? "border-[#8c1d40] bg-[#fff1e8] text-[#2c1116]"
                            : "border-[#ead7c4] bg-[#fffaf4] text-[#6f4a4e] hover:border-[#d6ae76]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff2cc] text-xl">
                            {coach.icon}
                          </div>
                          <div>
                            <div className="font-bold text-[#2c1116]">{coach.name}</div>
                            <div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                              {coach.track}
                            </div>
                            <div className="mt-2 leading-6">{coach.bio}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-[#f2dfca] bg-white p-4">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-[#8c1d40]">
                    2. Draft your email
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                    {selectedCoach
                      ? `Write to ${selectedCoach.name}. Mention that you are an ASU student, what you need help with, and one clear question.`
                      : "Choose one of the three coaches above first, then write your message here."}
                  </p>
                  <textarea
                    value={emailDraft}
                    onChange={(event) => setEmailDraft(event.target.value)}
                    placeholder={
                      selectedCoach
                        ? `Hi ${selectedCoach.name},\n\nI am an ASU student and I am looking for support with...\n\n`
                        : "Pick a coach first to start your draft."
                    }
                    disabled={!selectedCoach}
                    className="mt-4 min-h-52 w-full rounded-[1.3rem] border border-[#ead7c4] bg-[#fffaf4] px-4 py-4 text-sm leading-7 text-[#2c1116] outline-none transition placeholder:text-[#b49596] focus:border-[#8c1d40] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9b6f76]">
                      Subject: Asking about success coaching support
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sampleEmail ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEmailDraft(sampleEmail);
                            setEvaluationRequested(false);
                          }}
                          className="inline-flex items-center justify-center rounded-full border border-[#d6b37e] bg-white px-4 py-2 text-sm font-black text-[#8c1d40] transition hover:-translate-y-0.5 hover:border-[#8c1d40]"
                        >
                          Demo sample
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleEvaluation}
                        disabled={!selectedCoach || !emailDraft.trim()}
                        className="inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[#731736] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Get evaluation
                      </button>
                    </div>
                  </div>
                </div>

                {showEvaluation ? (
                  <div className="rounded-[1.6rem] border border-[#f4d494] bg-[linear-gradient(135deg,#fff3c7,#fffaf1)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                          3. AI evaluator
                        </p>
                        <p className="mt-2 font-[var(--font-sim-display)] text-[1.25rem] leading-none text-[#2c1116]">
                          Draft score: {evaluation.score}/100
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                          Quick feedback only. Fix the biggest gaps first.
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-black ${
                          evaluation.ready
                            ? "bg-[#2c1116] text-white"
                            : "bg-white text-[#8c1d40]"
                        }`}
                      >
                        {evaluation.ready ? "Ready to move on" : "Needs one more pass"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-[1.3rem] border border-[#eadac7] bg-white p-4">
                        <p className="text-sm font-black uppercase tracking-[0.12em] text-[#8c1d40]">
                          You did well
                        </p>
                        <div className="mt-3 grid gap-2 text-sm leading-6 text-[#6f4a4e]">
                          {visibleStrengths.length ? (
                            visibleStrengths.map((item) => (
                              <div key={item} className="rounded-[1rem] bg-[#fff8ef] px-3 py-2">
                                {item}
                              </div>
                            ))
                          ) : (
                            <div className="rounded-[1rem] bg-[#fff8ef] px-3 py-2">
                              Start with a few complete sentences and I will highlight the strong parts here.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-[1.3rem] border border-[#eadac7] bg-white p-4">
                        <p className="text-sm font-black uppercase tracking-[0.12em] text-[#8c1d40]">
                          What to improve
                        </p>
                        <div className="mt-3 grid gap-2 text-sm leading-6 text-[#6f4a4e]">
                          {visibleSuggestions.length ? (
                            visibleSuggestions.map((item) => (
                              <div key={item} className="rounded-[1rem] bg-[#fff8ef] px-3 py-2">
                                {item}
                              </div>
                            ))
                          ) : (
                            <div className="rounded-[1rem] bg-[#fff8ef] px-3 py-2">
                              No major fixes. Your message is ready to use.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {readyForCoachLink ? (
                      <div className="mt-4 rounded-[1.2rem] border border-[#e5c17e] bg-white px-4 py-3 text-sm font-bold text-[#8c1d40]">
                        Score above 75. You are ready for the final step.
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </article>
        </section>
      </div>

      {readyPopupOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(23,8,12,0.58)] p-4 backdrop-blur-sm">
          <div className="resource-ready-modal relative w-[min(92vw,32rem)] overflow-hidden rounded-[2rem] border border-[#f0dbc6] bg-[#fff8ef] p-6 shadow-[0_26px_90px_rgba(44,17,22,0.26)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden">
              {confettiPieces.map((piece, index) => (
                <span
                  key={`${piece.left}-${index}`}
                  className="resource-confetti-piece"
                  style={{
                    left: piece.left,
                    backgroundColor: piece.color,
                    animationDelay: piece.delay,
                    animationDuration: piece.duration,
                    transform: `rotate(${piece.rotate})`,
                  }}
                />
              ))}
            </div>

            <div className="relative flex items-center gap-4">
              <CharacterAvatar expression="happy" size="md" pulse />
              <div>
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                  You are now ready
                </p>
                <p className="mt-2 font-[var(--font-sim-display)] text-[1.55rem] leading-[1.02] text-[#2c1116]">
                  yeye u got a good score, u are now ready!
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={FIND_COACH_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onOpenResource}
                className="inline-flex items-center justify-center rounded-full bg-[#ffc627] px-5 py-3 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#f4bb14]"
              >
                Find a coach
              </a>
              <button
                type="button"
                onClick={onComplete}
                className="inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
              >
                Exit simulation
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SuccessCoachScreen(props: SuccessCoachScreenProps) {
  if (props.world.id !== "first-gen-support") {
    return <PlaceholderCoachScreen {...props} />;
  }

  return <FirstGenCoachScreen {...props} />;
}
