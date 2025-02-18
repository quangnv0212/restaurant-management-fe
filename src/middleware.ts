import { Role } from "@/constants/type";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { TokenPayload } from "@/types/jwt.types";
import createMiddleware from "next-intl/middleware";
import { defaultLocale } from "@/config";
import { routing } from "./i18n/routing";

const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload;
};

const managePaths = ["/vi/manage", "/en/manage"];
const guestPaths = ["/vi/guest", "/en/guest"];
const onlyOwnerPaths = ["/vi/manage/accounts", "/en/manage/accounts"];
const privatePaths = [...managePaths, ...guestPaths];
const unAuthPaths = ["/vi/login", "/en/login"];
const loginPaths = ["/vi/login", "/en/login"];

export function middleware(request: NextRequest) {
  const handleI18nRouting = createMiddleware(routing);
  const response = handleI18nRouting(request);
  const { pathname, searchParams } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const locale = request.cookies.get("NEXT_LOCALE")?.value ?? defaultLocale;
  // 1. If user is not logged in, redirect to login page
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    const url = new URL(`/${locale}/login`, request.url);
    url.searchParams.set("clearTokens", "true");
    return NextResponse.redirect(url);
  }
  // 2. If user is logged in
  if (refreshToken) {
    // 2.1 If user tries to access login page, redirect to home page
    if (unAuthPaths.some((path) => pathname.startsWith(path))) {
      if (
        loginPaths.some((path) => pathname.startsWith(path)) &&
        searchParams.get("accessToken")
      ) {
        return response;
      }
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    // 2.2 If access token expires, redirect to refresh token page
    if (
      privatePaths.some((path) => pathname.startsWith(path)) &&
      !accessToken
    ) {
      const url = new URL(`/${locale}/refresh-token`, request.url);
      url.searchParams.set("refreshToken", refreshToken);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // 2.3 If user tries to access wrong role, redirect to home page
    const role = decodeToken(refreshToken).role;
    // Guest but tries to access owner routes
    const isGuestGoToManagePath =
      role === Role.Guest &&
      managePaths.some((path) => pathname.startsWith(path));
    // Not Guest but tries to access guest routes
    const isNotGuestGoToGuestPath =
      role !== Role.Guest &&
      guestPaths.some((path) => pathname.startsWith(path));
    // Not Owner but tries to access owner routes
    const isNotOwnerGoToOwnerPath =
      role !== Role.Owner &&
      onlyOwnerPaths.some((path) => pathname.startsWith(path));
    if (
      isGuestGoToManagePath ||
      isNotGuestGoToGuestPath ||
      isNotOwnerGoToOwnerPath
    ) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
    return response;
  }
  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/(vi|en)/:path*"],
};
