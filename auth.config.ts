import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";

const requiredEnv = ["AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"] as const;
const presence = Object.fromEntries(
  requiredEnv.map((key) => [key, Boolean(process.env[key]?.trim())]),
);
console.log("[auth] env presence", presence);

const googleConfig: { clientId?: string; clientSecret?: string } = {};
if (process.env.AUTH_GOOGLE_ID?.trim()) googleConfig.clientId = process.env.AUTH_GOOGLE_ID.trim();
if (process.env.AUTH_GOOGLE_SECRET?.trim()) googleConfig.clientSecret = process.env.AUTH_GOOGLE_SECRET.trim();

const authConfig = {
  trustHost: true,
  ...(process.env.AUTH_SECRET?.trim() ? { secret: process.env.AUTH_SECRET.trim() } : {}),
  pages: {
    signIn: "/login",
    error: "/access-denied",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [Google(googleConfig)],
  callbacks: {
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        if (token.userId) session.user.id = token.userId;
        if (token.email) session.user.email = token.email;
        if (token.name !== undefined) session.user.name = token.name;
        if (token.image !== undefined) session.user.image = token.image;
      }
      return session;
    },
  },
};

export default authConfig;
