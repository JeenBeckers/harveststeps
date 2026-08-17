import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApi = pathname.startsWith("/api/");
  const isAuthApi = pathname.startsWith("/api/auth/");
  const isLoginPage = pathname === "/login";
  // Called by the feature-request GitHub Actions workflow, not a logged-in browser
  // session — it authenticates itself via the x-callback-secret header instead.
  const isFeatureRequestStatusCallback = /^\/api\/feature-requests\/\d+\/status$/.test(pathname);

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;

  if (isLoginPage) {
    if (user) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (isAuthApi || isFeatureRequestStatusCallback) {
    return NextResponse.next();
  }

  if (!user) {
    if (isApi) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpe?g|svg|ico|webp|gif)$).*)"],
};
