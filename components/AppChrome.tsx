"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { Navbar } from "@/components/Navbar";

export function AppChrome({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const isEmbeddedChat = pathname === "/chat/embed";

  return (
    <div className="app-shell">
      {!isEmbeddedChat ? <Navbar /> : null}
      <main>{children}</main>
      {!isEmbeddedChat ? <FloatingChatWidget /> : null}
    </div>
  );
}
