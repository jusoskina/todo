import { auth } from "@/auth";
import { NavBar } from "@/components/NavBar";
import { SignOutButton } from "@/components/SignOutButton";

export async function AppHeader() {
  const session = await auth();
  const display = session?.user?.name?.split(" ")[0] ?? session?.user?.email;

  return (
    <header className="trello-nav sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <NavBar />
        {display ? (
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="hidden max-w-32 truncate text-xs text-muted sm:inline"
              title={session?.user?.email ?? undefined}
            >
              {display}
            </span>
            <SignOutButton />
          </div>
        ) : null}
      </div>
    </header>
  );
}
