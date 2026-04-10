import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED = new Set(["/home", "/form", "/layout"]);

function isAllowedPath(pathname: string): boolean {
  if (pathname === "/") return false;
  if (ALLOWED.has(pathname)) return true;
  return [...ALLOWED].some(
    (base) => pathname.startsWith(`${base}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAllowedPath(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)", "/"],
};
