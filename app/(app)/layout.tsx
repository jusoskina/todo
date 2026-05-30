import { TodoProvider } from "@/context/TodoProvider";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TodoProvider>{children}</TodoProvider>;
}
