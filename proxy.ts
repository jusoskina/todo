import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/login", "/access-denied"];

function hasSession(auth: unknown) {
  const user = (auth as { user?: { id?: string; email?: string } } | null)?.user;
  return Boolean(user?.id ?? user?.email);
}

export default auth((req: NextRequest & { auth?: unknown }) => {
  const pathname = req.nextUrl.pathname;
  if (publicRoutes.includes(pathname)) {
    return;
  }
  if (!hasSession(req.auth)) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|board-bg.png|board-bg.jpg).*)",
  ],
};
