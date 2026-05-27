import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/admin/login", "/admin/register"];
const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

function hasToken(req: NextRequest) {
  return !!req.cookies.get("token")?.value;
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = hasToken(req);

  if (isAuthPage(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/admin/:path*",
    "/admin",
    "/login",
    "/register",
    "/admin/login",
    "/admin/register",
  ],
};
