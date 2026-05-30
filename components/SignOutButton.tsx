import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-baby-blue-dark/25 px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-baby-blue-light/60"
      >
        Sign out
      </button>
    </form>
  );
}
