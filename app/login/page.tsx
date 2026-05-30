import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signIn, signOut } from "@/auth";
import { toAbsoluteCallbackUrl } from "@/lib/auth-redirect";

type Props = {
  searchParams: Promise<{ callbackUrl?: string; reset?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const resolved = await searchParams;

  if (resolved.reset === "1") {
    await signOut({ redirectTo: "/login" });
  }

  const session = await auth();
  if (session?.user?.id) {
    redirect("/");
  }

  if (session?.user?.email && !session.user.id) {
    await signOut({ redirectTo: "/login" });
  }

  const callbackUrl = resolved.callbackUrl ?? "/";
  const redirectTo = await toAbsoluteCallbackUrl(callbackUrl);

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-4">
      <section className="trello-column w-full max-w-sm p-6 text-center">
        <p className="text-sm font-medium text-muted">Todo</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Sign in to continue
        </h1>
        <p className="mt-2 text-sm text-muted">Use your approved Google account.</p>

        <form
          className="mt-5"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-baby-blue-dark px-4 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-4 text-xs text-muted-light">
          Stuck signing in on mobile?{" "}
          <Link href="/login?reset=1" className="font-semibold text-baby-blue-dark underline">
            Reset sign-in
          </Link>
        </p>
      </section>
    </main>
  );
}
