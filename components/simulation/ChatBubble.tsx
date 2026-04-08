"use client";

import { CharacterAvatar } from "@/components/simulation/CharacterAvatar";
import type { RenderedChatMessage } from "@/lib/resource-discovery-types";

interface ChatBubbleProps {
  message: RenderedChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  if (message.side === "right") {
    return (
      <div className="resource-chat-bubble flex justify-end">
        <div className="max-w-[85%] rounded-[1.6rem] rounded-br-md bg-[linear-gradient(135deg,#ffc627,#ffd982)] px-4 py-3 text-sm font-semibold leading-7 text-[#2c1116] shadow-[0_14px_34px_rgba(255,198,39,0.18)]">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="resource-chat-bubble flex items-end gap-3">
      <CharacterAvatar expression={message.expression ?? "happy"} size="sm" />

      <div className="max-w-[88%] space-y-3">
        <div className="rounded-[1.6rem] rounded-bl-md border border-[#eed9c2] bg-white px-4 py-3 text-sm leading-7 text-[#533338] shadow-[0_14px_34px_rgba(44,17,22,0.08)]">
          {message.text}
        </div>

        {message.experience ? (
          <div className="rounded-[1.55rem] border border-[#f4d494] bg-[linear-gradient(135deg,#fff3c7,#fffaf1)] p-4 shadow-[0_12px_30px_rgba(44,17,22,0.06)]">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#8c1d40]">
              Next mission
            </p>
            <p className="mt-2 font-[var(--font-sim-display)] text-[1.15rem] leading-none text-[#2c1116]">
              {message.experience.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">{message.experience.body}</p>
          </div>
        ) : null}

        {message.resourceLink ? (
          <div className="rounded-[1.55rem] border border-[#f0dcc6] bg-[linear-gradient(135deg,#fff6eb,#fffdf9)] p-4 shadow-[0_12px_30px_rgba(44,17,22,0.06)]">
            <p className="font-[var(--font-sim-display)] text-[1.15rem] leading-none text-[#2c1116]">
              {message.resourceLink.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6f4a4e]">{message.resourceLink.body}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
