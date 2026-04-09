import type { Metadata } from "next";

import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { Navbar } from "@/components/Navbar";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SunDevilConnect",
    template: "%s | SunDevilConnect",
  },
  description:
    "ASU resource confidence for first-generation students with a first-week story, inline video previews, a local finder, scholarships, and chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full scroll-smooth antialiased"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        <div className="app-shell">
          <Navbar />
          <main>{children}</main>
          <FloatingChatWidget />
        </div>
      </body>
    </html>
  );
}
