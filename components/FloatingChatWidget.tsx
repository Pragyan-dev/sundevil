"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { ChatWindow } from "@/components/ChatWindow";

function shouldShowFloatingChat(pathname: string) {
  return pathname === "/" || pathname.startsWith("/finder") || pathname.startsWith("/scholarships");
}

export function FloatingChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visible = useMemo(() => shouldShowFloatingChat(pathname), [pathname]);

  useEffect(() => {
    if (!visible) {
      const timeoutId = window.setTimeout(() => {
        setOpen(false);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [visible]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-50 left-3 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-[calc(100vw-3rem)]">
      {open ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="pointer-events-auto fixed inset-0 z-0 bg-[rgba(17,12,8,0.18)] backdrop-blur-[2px] sm:hidden"
            aria-label="Dismiss chat overlay"
          />
          <div className="pointer-events-auto relative z-10 flex max-h-[min(44rem,calc(100dvh-1.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] w-full flex-col overflow-hidden rounded-[1.7rem] border border-[rgba(0,0,0,0.1)] bg-[#f9f3ea]/96 shadow-[0_28px_80px_rgba(18,12,8,0.28)] backdrop-blur sm:w-[min(26rem,calc(100vw-3rem))] sm:max-h-[min(44rem,calc(100dvh-6rem))]">
          <div className="flex items-start justify-between gap-3 border-b border-[rgba(140,29,64,0.12)] bg-[rgba(255,255,255,0.82)] px-4 py-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[rgba(140,29,64,0.12)] bg-[radial-gradient(circle_at_35%_30%,rgba(255,198,39,0.28),rgba(255,255,255,0.96))]">
                <Image
                  src="/mascot/happy.png"
                  alt="Sparky"
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[var(--asu-maroon)]">
                  Sparky Chat
                </p>
                <p className="text-sm leading-5 text-[var(--ink)]/76">
                  Ask a quick question without leaving the page.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(0,0,0,0.08)] bg-white text-lg text-[var(--ink)] transition hover:border-[var(--asu-gold)] hover:bg-[rgba(255,198,39,0.12)]"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <ChatWindow variant="floating" />
          </div>
        </>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-[rgba(0,0,0,0.12)] bg-[rgba(255,255,255,0.96)] px-4 py-3 text-left shadow-[0_20px_60px_rgba(16,11,7,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--asu-gold)] hover:bg-white"
          aria-expanded={open}
          aria-label={open ? "Close Sparky chat" : "Open Sparky chat"}
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[rgba(140,29,64,0.12)] bg-[radial-gradient(circle_at_35%_30%,rgba(255,198,39,0.28),rgba(255,255,255,0.98))] shadow-[0_8px_18px_rgba(0,0,0,0.1)]">
            <Image
              src="/mascot/happy.png"
              alt="Sparky"
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          </div>
          <div className="hidden pr-1 sm:block">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--asu-maroon)]">
              Sparky
            </p>
            <p className="text-sm text-[var(--ink)]">
              Chat with us
            </p>
          </div>
        </button>
      ) : null}
    </div>
  );
}
