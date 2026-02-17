import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnChat = req.nextUrl.pathname.startsWith("/chat");
  const isOnLogin = req.nextUrl.pathname.startsWith("/login");
  const isOnApi = req.nextUrl.pathname.startsWith("/api");

  // Redirect unauthenticated users away from protected routes
  if (isOnChat && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect authenticated users away from the login page
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/chat", req.nextUrl));
  }

  // Allow API routes to handle their own auth
  if (isOnApi) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
