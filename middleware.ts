import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { STATE_SLUGS, CITY_SLUGS } from "@/data/groups";

export function middleware(request: NextRequest) {
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

  // In dev (localhost / *.pages.dev / workers.dev), pass through —
  // paths are used directly: /, /state/[s], /city/[c]
  const isLocalOrPreview =
    hostname.includes("localhost") ||
    hostname.includes(".pages.dev") ||
    hostname.includes(".workers.dev") ||
    !hostname.includes("cncg.in");

  if (isLocalOrPreview) {
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

  // Unknown subdomain — hard redirect to the apex domain
  const redirectUrl = new URL("https://cncg.in/");
  return NextResponse.redirect(redirectUrl, 301);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
