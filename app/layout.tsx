import { AppHeader } from "@/components/AppHeader";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo",
  description: "Weekly and daily todo planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="relative flex min-h-full flex-col text-foreground">
        <div className="board-bg" aria-hidden="true" />
        <AppHeader />
        <main className="relative flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
