"use client";

import Link from "next/link";
import { CharacterAvatar } from "@/components/simulation/CharacterAvatar";
import { ChoiceButtons } from "@/components/simulation/ChoiceButtons";
import { ProgressBar } from "@/components/simulation/ProgressBar";
import type {
  ChatChoice,
  RenderedChatMessage,
  ResourceScenario,
  ResourceWorld,
  ScenarioStep,
} from "@/lib/resource-discovery-types";

interface ChatScreenProps {
  world: ResourceWorld;
  scenario: ResourceScenario;
  scenarioIndex: number;
  totalScenarios: number;
  messages: RenderedChatMessage[];
  activeStep: ScenarioStep | null;
  isTyping: boolean;
  onBack: () => void;
  onChoice: (choice: ChatChoice) => void;
  onContinue: () => void;
  onOpenExperience: () => void;
  onOpenResource: () => void;
}

export function ChatScreen({
  world,
  scenario,
  scenarioIndex,
  totalScenarios,
  messages,
  activeStep,
  isTyping,
  onBack,
  onChoice,
  onContinue,
  onOpenExperience,
  onOpenResource,
}: ChatScreenProps) {
  const scenarioProgress = Math.round(((scenarioIndex + 1) / totalScenarios) * 100);
  const latestCharacterMessage = [...messages].reverse().find((message) => message.side === "left") ?? null;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:border-[#ffc627] hover:text-[#ffc627]"
          >
            ← Back to map
          </button>
          <p className="mt-4 text-[0.72rem] font-black uppercase tracking-[0.22em] text-[#ffe2ae]">
            {world.title}
          </p>
          <h1 className="mt-2 font-[var(--font-sim-display)] text-[clamp(2rem,5vw,3.6rem)] leading-[0.92] text-white">
            {scenario.title}
          </h1>
        </div>

        <div className="w-full max-w-sm rounded-[1.5rem] border border-white/18 bg-white/10 p-4 text-white backdrop-blur-md">
          <ProgressBar
            value={scenarioProgress}
            current={scenarioIndex + 1}
            total={totalScenarios}
            label="Scenario chain"
          />
        </div>
      </div>

      <div className="grid gap-5">
        <section className="rounded-[2.1rem] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-4 shadow-[0_26px_90px_rgba(44,17,22,0.22)] backdrop-blur-md">
          <div className="grid h-[72vh] grid-rows-[1fr_auto] gap-4">
            <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#fff8ef]">
              <div className="grid h-full place-items-center px-4 py-6 sm:px-6">
                <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-center">
                  <div className="grid justify-center">
                    <div className="grid gap-4 justify-items-center">
                      <CharacterAvatar
                        expression={latestCharacterMessage?.expression ?? world.guideExpression}
                        size="hero"
                        pulse
                        framed={false}
                      />
                      <div className="rounded-full border border-[#efd7bf] bg-white px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                        Sparky
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-[#eed7bf] bg-white px-6 py-6 shadow-[0_22px_48px_rgba(44,17,22,0.1)] sm:px-8 sm:py-8">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#9b6f76]">
                      Live scene
                    </p>
                    <p className="mt-4 font-[var(--font-sim-display)] text-[2rem] leading-[1.02] text-[#2c1116] sm:text-[2.4rem]">
                      {world.title}
                    </p>

                    {isTyping ? (
                      <div className="mt-6 flex min-h-40 items-center gap-2 rounded-[1.6rem] border border-[#eed9c2] bg-[#fff8ef] px-5 py-5">
                        <span className="resource-typing-dot" />
                        <span className="resource-typing-dot" />
                        <span className="resource-typing-dot" />
                      </div>
                    ) : latestCharacterMessage ? (
                      <div className="mt-6 min-h-40 rounded-[1.6rem] border border-[#eed9c2] bg-[#fff8ef] px-5 py-5 text-[1.15rem] leading-9 text-[#533338] sm:px-7 sm:py-6 sm:text-[1.28rem]">
                        {latestCharacterMessage.text}
                      </div>
                    ) : null}

                    {latestCharacterMessage?.experience ? (
                      <div className="mt-5 rounded-[1.55rem] border border-[#f4d494] bg-[linear-gradient(135deg,#fff3c7,#fffaf1)] p-4 shadow-[0_12px_30px_rgba(44,17,22,0.06)]">
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
                          Next mission
                        </p>
                        <p className="mt-2 font-[var(--font-sim-display)] text-[1.15rem] leading-none text-[#2c1116]">
                          {latestCharacterMessage.experience.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                          {latestCharacterMessage.experience.body}
                        </p>
                      </div>
                    ) : null}

                    {latestCharacterMessage?.resourceLink ? (
                      <div className="mt-5 rounded-[1.55rem] border border-[#f0dcc6] bg-[linear-gradient(135deg,#fff6eb,#fffdf9)] p-4 shadow-[0_12px_30px_rgba(44,17,22,0.06)]">
                        <p className="font-[var(--font-sim-display)] text-[1.15rem] leading-none text-[#2c1116]">
                          {latestCharacterMessage.resourceLink.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">
                          {latestCharacterMessage.resourceLink.body}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-[#ecd6be] bg-[#fff8ef] p-4 shadow-[0_20px_50px_rgba(44,17,22,0.08)]">
              {activeStep?.choices?.length ? (
                <ChoiceButtons choices={activeStep.choices} onSelect={onChoice} />
              ) : activeStep?.autoNextStepId ? (
                <button
                  type="button"
                  onClick={onContinue}
                  className="rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
                >
                  Next
                </button>
              ) : activeStep?.experience ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onOpenExperience}
                    className="inline-flex items-center justify-center rounded-full bg-[#ffc627] px-5 py-3 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#f4bb14]"
                  >
                    {activeStep.experience.ctaLabel}
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
                  >
                    Save for later
                  </button>
                </div>
              ) : activeStep?.resourceLink ? (
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={activeStep.resourceLink.href}
                    target={activeStep.resourceLink.external ? "_blank" : undefined}
                    rel={activeStep.resourceLink.external ? "noopener noreferrer" : undefined}
                    onClick={onOpenResource}
                    className="inline-flex items-center justify-center rounded-full bg-[#ffc627] px-5 py-3 text-sm font-black text-[#2c1116] transition hover:-translate-y-0.5 hover:bg-[#f4bb14]"
                  >
                    {activeStep.resourceLink.ctaLabel}
                  </Link>
                  <button
                    type="button"
                    onClick={onContinue}
                    className="rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
                  >
                    Continue
                  </button>
                </div>
              ) : activeStep?.complete ? (
                <button
                  type="button"
                  onClick={onContinue}
                  className="rounded-full bg-[#8c1d40] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
                >
                  Continue
                </button>
              ) : (
                <p className="text-sm leading-6 text-[#6f4a4e]">
                  Sparky is ready when you are.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
