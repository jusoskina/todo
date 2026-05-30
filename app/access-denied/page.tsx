import Link from "next/link";

type Props = {
  searchParams: Promise<{ reason?: string; error?: string }>;
};

const reasonMessages: Record<string, string> = {
  "not-allowed": "This Google account is not in the allowed list for this app.",
  "allowlist-empty":
    "The allowlist is empty on the server. Add allowed emails to AUTH_ALLOWED_EMAILS.",
  "missing-email": "Google didn't return an email for this account.",
  "user-upsert-failed": "Could not create your user record. Check the database connection.",
};

export default async function AccessDeniedPage({ searchParams }: Props) {
  const { reason, error } = await searchParams;
  const isAllowlist = reason && reason in reasonMessages;
  const heading = isAllowlist ? "Access denied" : error ? "Sign-in problem" : "Access denied";
  const message = isAllowlist
    ? reasonMessages[reason!]
    : error
      ? `Sign-in failed with error: ${error}. Check the server logs for details.`
      : "You can't access this app.";

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-4">
      <section className="trello-column w-full max-w-sm p-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h1>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <Link
          href="/login"
          className="mt-5 inline-block w-full rounded-lg border border-baby-blue-dark/30 bg-white px-4 py-3 font-semibold text-foreground transition hover:bg-baby-blue-light/50"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}
