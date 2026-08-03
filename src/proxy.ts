import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/server/constants";

const PUBLIC_ROUTES = new Set(["/login", "/signup"]);
const PUBLIC_FILE = /\.[^/]+$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/~offline" || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  // Signing in is optional — it only unlocks cross-device sync, so the app
  // itself (local-only Dexie data) stays fully usable without an account.
  // The one gate that remains: a signed-in visitor shouldn't land back on
  // the login/signup forms.
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  if (hasSession && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
