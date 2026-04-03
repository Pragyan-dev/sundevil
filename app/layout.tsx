import type { Metadata } from "next";

import { Navbar } from "@/components/Navbar";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SunDevilConnect",
    template: "%s | SunDevilConnect",
  },
  description:
    "ASU resource confidence for first-generation students with a local resource finder, simulations, scholarships, and chat.",
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
    >
      <body className="min-h-full">
        <div className="app-shell">
          <Navbar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
