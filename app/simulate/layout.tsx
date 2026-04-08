import { Fredoka, Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sim-body",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-sim-display",
  display: "swap",
});

export default function SimulateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${nunito.variable} ${fredoka.variable}`}>
      {children}
    </div>
  );
}
