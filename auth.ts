import NextAuth from "next-auth";

import authConfig from "@/auth.config";
import { db } from "@/lib/db";

function getAllowedEmails() {
  const raw = process.env.AUTH_ALLOWED_EMAILS ?? "";
  const stripped = raw.trim().replace(/^["']|["']$/g, "");
  return stripped
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      const email = user.email?.toLowerCase().trim();
      const allowedEmails = getAllowedEmails();

      console.log("[auth] signIn check", {
        email,
        allowedCount: allowedEmails.length,
      });

      if (!email) return "/access-denied?reason=missing-email";
      if (allowedEmails.length === 0) return "/access-denied?reason=allowlist-empty";
      if (!allowedEmails.includes(email)) return "/access-denied?reason=not-allowed";

      try {
        await db.user.upsert({
          where: { email },
          update: { name: user.name ?? undefined, image: user.image ?? undefined },
          create: { email, name: user.name ?? undefined, image: user.image ?? undefined },
        });
      } catch (error) {
        console.error("[auth] failed to upsert User", error);
        return "/access-denied?reason=user-upsert-failed";
      }

      return true;
    },
    async jwt({ token, user }) {
      const email = (user?.email ?? token.email)?.toLowerCase().trim();
      if (email && (user?.email || !token.userId)) {
        const row = await db.user.findUnique({
          where: { email },
          select: { id: true, name: true, image: true },
        });
        if (row) {
          token.userId = row.id;
          token.name = row.name;
          token.image = row.image;
        }
        token.email = email;
      }
      return token;
    },
  },
});

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
