import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRIMARY = "https://interviewdebrief.web.app";

function primaryOrigin() {
  const raw = process.env.NEXT_PUBLIC_APP_URL || PRIMARY;
  try {
    return new URL(raw);
  } catch {
    return new URL(PRIMARY);
  }
}

function isLocal(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".local")
  );
}

export function middleware(request: NextRequest) {
  const pass = () => {
    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    return response;
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    return pass();
  }

  const hostHeader = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const hostname = hostHeader.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
  if (!hostname || isLocal(hostname)) {
    return pass();
  }

  const canonical = primaryOrigin();
  if (hostname === canonical.host) {
    return pass();
  }

  const destination = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, canonical);
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|svg|ico|txt|xml|webp)$).*)"],
};
