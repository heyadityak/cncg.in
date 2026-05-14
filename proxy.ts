import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { STATE_SLUGS, CITY_SLUGS } from "@/data/groups";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  // Skip Next.js internal routes and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // In dev, real paths are used directly: /, /state/[s], /city/[c]
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // Canonical redirect: www.cncg.in → cncg.in
  if (hostname === "www.cncg.in") {
    const url = request.nextUrl.clone();
    url.host = "cncg.in";
    return NextResponse.redirect(url, 301);
  }

  // Production: parse the subdomain from the Host header
  //   "gujarat.cncg.in"   → sub = "gujarat"
  //   "ahmedabad.cncg.in" → sub = "ahmedabad"
  //   "cncg.in" / "www.*" → no sub
  const sub = hostname.replace(/\.cncg\.in(:\d+)?$/, "");

  // Root domain — render the India map (no rewrite)
  if (!sub || sub === hostname || sub === "www") {
    return NextResponse.next();
  }

  if (STATE_SLUGS.has(sub)) {
    const url = request.nextUrl.clone();
    url.pathname = `/state/${sub}`;
    return NextResponse.rewrite(url);
  }

  if (CITY_SLUGS.has(sub)) {
    const url = request.nextUrl.clone();
    url.pathname = `/city/${sub}`;
    return NextResponse.rewrite(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = "/not-found";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
