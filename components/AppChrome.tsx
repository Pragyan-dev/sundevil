"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { Navbar } from "@/components/Navbar";
import { SunBuddyCompanion } from "@/components/rewards/SunBuddyCompanion";

export function AppChrome({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const isEmbeddedChat = pathname === "/chat/embed";
  const isRewardsPage = pathname === "/rewards";
  const showSharedChrome = !isEmbeddedChat && !isRewardsPage;

  return (
    <div className="app-shell">
      {showSharedChrome ? <Navbar /> : null}
      <main className={isRewardsPage ? "h-[100dvh] overflow-hidden" : undefined}>{children}</main>
      <SunBuddyCompanion />
      {showSharedChrome ? <FloatingChatWidget /> : null}
    </div>
  );
}
