import { NextResponse } from "next/server";

export function middleware(req) {
  const authCookie = req.cookies.get("auth");

  if (!authCookie && req.nextUrl.pathname.startsWith("/urltable")) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
}

export const config = {
  matcher: ["/urltable"],
};
