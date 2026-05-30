import { NavBar } from "@/components/NavBar";
import { TodoProvider } from "@/context/TodoProvider";
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
      <body className="flex min-h-full flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <TodoProvider>
          <NavBar />
          {children}
        </TodoProvider>
      </body>
    </html>
  );
}
