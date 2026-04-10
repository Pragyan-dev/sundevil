"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

import type { ChatMessage } from "@/lib/types";

interface ChatEntry extends ChatMessage {
  id: string;
  error?: boolean;
}

const starterPrompts = [
  "I'm failing a class and don't know what to do",
  "What's tutoring actually like?",
  "Are there scholarships I don't know about?",
];

const initialMessages: ChatEntry[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I’m SunDevil Guide. Tell me what feels hard right now and I’ll point you to the right ASU resource without making it weird.",
  },
];

function buildId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      tokens.push(
        <strong key={`${keyPrefix}-bold-${match.index}`} className="font-semibold text-current">
          {match[2]}
        </strong>,
      );
    } else if (match[3] && match[4]) {
      tokens.push(
        <a
          key={`${keyPrefix}-link-${match.index}`}
          href={match[4]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--asu-maroon)] underline underline-offset-4"
        >
          {match[3]}
        </a>,
      );
    }

    lastIndex = pattern.lastIndex;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

function renderParagraphLines(text: string, keyPrefix: string) {
  return text.split("\n").map((line, index, lines) => (
    <Fragment key={`${keyPrefix}-line-${index}`}>
      {renderInlineMarkdown(line, `${keyPrefix}-${index}`)}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

function renderAssistantMessage(content: string) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const unorderedItems = lines
      .map((line) => line.match(/^[-*]\s+(.*)$/)?.[1] ?? null);
    const orderedItems = lines
      .map((line) => line.match(/^\d+\.\s+(.*)$/)?.[1] ?? null);

    if (unorderedItems.every(Boolean)) {
      return (
        <ul
          key={`assistant-block-${blockIndex}`}
          className="ml-5 list-disc space-y-2"
        >
          {unorderedItems.map((item, itemIndex) => (
            <li key={`assistant-ul-${blockIndex}-${itemIndex}`}>
              {renderInlineMarkdown(item ?? "", `assistant-ul-${blockIndex}-${itemIndex}`)}
            </li>
          ))}
        </ul>
      );
    }

    if (orderedItems.every(Boolean)) {
      return (
        <ol
          key={`assistant-block-${blockIndex}`}
          className="ml-5 list-decimal space-y-2"
        >
          {orderedItems.map((item, itemIndex) => (
            <li key={`assistant-ol-${blockIndex}-${itemIndex}`}>
              {renderInlineMarkdown(item ?? "", `assistant-ol-${blockIndex}-${itemIndex}`)}
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p key={`assistant-block-${blockIndex}`}>
        {renderParagraphLines(block, `assistant-block-${blockIndex}`)}
      </p>
    );
  });
}

export function ChatWindowInner({
  variant,
}: {
  variant: "page" | "floating";
}) {
  const [messages, setMessages] = useState<ChatEntry[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const isFloating = variant === "floating";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(nextContent: string) {
    const trimmed = nextContent.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage: ChatEntry = {
      id: buildId(),
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      const reply = data.reply ?? data.error;

      setMessages((current) => [
        ...current,
        {
          id: buildId(),
          role: "assistant",
          content:
            reply ??
            "I hit a configuration issue reaching the chat service. Try again in a moment.",
          error: Boolean(data.error) || !response.ok,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: buildId(),
          role: "assistant",
          content:
            "I couldn't reach the chat service just now. The static finder and signup flows are still available while that gets fixed.",
          error: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div
      className={`flex flex-col overflow-hidden p-0 ${
        isFloating ? "min-h-0 flex-1 bg-transparent" : "paper-card min-h-[44rem]"
      }`}
    >
      {!isFloating ? (
        <div className="border-b border-[rgba(255,198,39,0.18)] bg-[var(--asu-maroon)] px-6 py-5 text-[var(--warm-white)]">
          <p className="eyebrow text-[var(--asu-gold)]">Live feature</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl">SunDevil Guide</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(255,251,245,0.82)]">
                Short answers, concrete steps, no judgment.
              </p>
            </div>
            <span className="rounded-full border border-[rgba(255,198,39,0.35)] px-3 py-1 text-xs uppercase tracking-[0.24em] text-[var(--asu-gold)]">
              OpenRouter
            </span>
          </div>
        </div>
      ) : null}

      <div
        className={`flex flex-wrap gap-2 border-b border-[rgba(140,29,64,0.08)] ${
          isFloating ? "px-4 py-3 sm:px-4 sm:py-3" : "px-6 py-4"
        }`}
      >
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => void sendMessage(prompt)}
            className={`pill transition hover:border-[rgba(140,29,64,0.18)] hover:bg-[rgba(140,29,64,0.06)] ${
              isFloating ? "max-w-full text-[0.8rem] leading-5 sm:text-[0.82rem]" : ""
            }`}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className={`min-h-0 flex-1 space-y-4 overflow-y-auto ${isFloating ? "px-4 py-4" : "px-6 py-6"}`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-[1.6rem] ${
                isFloating ? "px-4 py-3 text-[0.96rem] leading-6 sm:text-[0.92rem]" : "px-5 py-4 text-sm leading-7"
              } shadow-[0_16px_38px_rgba(85,53,47,0.08)] ${
                message.role === "user"
                  ? "bg-[var(--asu-maroon)] text-[var(--warm-white)]"
                  : message.error
                    ? "bg-[rgba(255,198,39,0.18)] text-[var(--ink)]"
                    : "bg-white text-[var(--ink)]"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="space-y-3 break-words">
                  {renderAssistantMessage(message.content)}
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        className={`border-t border-[rgba(140,29,64,0.08)] bg-[rgba(255,255,255,0.7)] ${isFloating ? "px-4 py-4" : "px-6 py-5"}`}
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage(input);
        }}
      >
        <label className="sr-only" htmlFor="chat-input">
          Ask SunDevil Guide
        </label>
        <div className={`flex flex-col gap-3 ${isFloating ? "" : "md:flex-row"}`}>
          <textarea
            id="chat-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask what tutoring feels like, where to start for money help, or what to do next."
            rows={3}
            className={`field-shell flex-1 resize-none ${isFloating ? "min-h-20 sm:min-h-24" : "min-h-28"}`}
          />
          <button
            type="submit"
            disabled={isSending}
            className={`button-primary ${isFloating ? "w-full" : "min-w-40 self-start"}`}
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ChatWindow({ variant = "page" }: { variant?: "page" | "floating" }) {
  return <ChatWindowInner variant={variant} />;
}
