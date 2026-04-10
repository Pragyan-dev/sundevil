"use client";

import { useState } from "react";

import type { WeekAdvisingEvent } from "@/lib/week-simulator-types";

interface AdvisorCardProps {
  event: WeekAdvisingEvent;
  completed: boolean;
  onComplete: () => void;
}

export function AdvisorCard({ event, completed, onComplete }: AdvisorCardProps) {
  const [feedbackDraft, setFeedbackDraft] = useState("");

  const sampleMessages = [
    "Hi, I had my advising appointment today and it was really helpful. I left with a clearer understanding of my degree plan and next steps. Thank you.",
    "Hi, thank you for today's advising appointment. The DARS explanation helped a lot, and I feel much less confused about what I need to do next.",
    "Hi, my advising appointment today was helpful overall. I still have one follow-up question about registration, but I feel much more prepared now.",
  ];

  function handleSend() {
    const trimmed = feedbackDraft.trim();
    if (!trimmed) {
      return;
    }

    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent("scai.grad.tempe@asu.edu")}&su=${encodeURIComponent("Academic Advising Experience Feedback")}&body=${encodeURIComponent(trimmed)}`;

    if (!completed) {
      onComplete();
    }

    window.setTimeout(() => {
      window.location.assign(gmailComposeUrl);
    }, 120);
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-[1.8rem] border border-[#f0dbc6] bg-[#fff8ef] p-4 shadow-[0_16px_44px_rgba(44,17,22,0.08)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Post Advising
            </p>
            <h3 className="mt-2 font-[var(--font-sim-display)] text-[1.75rem] leading-none text-[#2c1116]">
              How was your experience?
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold text-[#7d565b]">
            <span className="rounded-full bg-white px-3 py-1">{event.time}</span>
            <span className="rounded-full bg-white px-3 py-1">{event.location}</span>
            <span className="rounded-full bg-white px-3 py-1">{event.reminderLabel}</span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-[#6f4a4e]">{event.whatItsFor}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {event.resources.map((resource) => (
            <span
              key={resource}
              className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#7d565b]"
            >
              {resource}
            </span>
          ))}
        </div>

        {event.linkedResource ? (
          <div className="mt-4">
            <a
              href={event.linkedResource}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#8c1d40] px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#731736]"
            >
              Open location in maps
            </a>
          </div>
        ) : null}

        <div className="mt-4 rounded-[1.5rem] border border-[#ecd6be] bg-white p-4">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
            Post-advising check-in
          </p>
          <p className="mt-3 text-base leading-7 text-[#533338]">
            Tell the advising team how the appointment felt for you. A short honest note is enough.
          </p>

          <div className="mt-4 grid gap-3">
            {sampleMessages.map((message) => (
              <button
                key={message}
                type="button"
                onClick={() => setFeedbackDraft(message)}
                className="rounded-[1rem] border border-[#e8c9a3] bg-[#fff8ef] px-4 py-3 text-left text-sm leading-6 text-[#8c1d40] transition hover:-translate-y-0.5 hover:border-[#8c1d40]"
              >
                {message}
              </button>
            ))}
          </div>

          <textarea
            value={feedbackDraft}
            onChange={(event) => setFeedbackDraft(event.target.value)}
            placeholder="Write your message here..."
            className="mt-4 min-h-44 w-full rounded-[1.2rem] border border-[#ead7c4] bg-[#fffaf4] px-4 py-4 text-sm leading-7 text-[#2c1116] outline-none transition placeholder:text-[#b49596] focus:border-[#8c1d40] focus:bg-white"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9b6f76]">
              Sending to: scai.grad.tempe@asu.edu
            </p>
            <div className="flex flex-wrap gap-3">
              {completed ? (
                <div className="inline-flex rounded-full bg-[#16a34a] px-4 py-2 text-sm font-black text-white">
                  Advising complete
                </div>
              ) : null}
              <button
                type="button"
                onClick={handleSend}
                disabled={!feedbackDraft.trim()}
                className="rounded-full bg-[#ffc627] px-5 py-3 text-sm font-black text-[#2c1116] transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[#f4bb14] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Send in Gmail
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
