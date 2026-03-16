import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import logger from "@/lib/logger";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "fallback_secret_for_docker_manager_only_change_in_prod";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Erlaube statische Assets und den Login-Bereich
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/login" ||
    pathname === "/api/auth/login"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    // Redirect to login if accessing protected route without a token
    if (pathname.startsWith("/api/")) {
      logger.debug(`[Middleware] Unauthorized API access: ${pathname}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.debug(`[Middleware] No token – redirecting ${pathname} → /login`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Validiere das JWT in der Edge Runtime
    await jwtVerify(token, secretKey);
    return NextResponse.next();
  } catch (err) {
    // Token invalid / expired -> redirect to login
    logger.warn(`[Middleware] Invalid or expired token for: ${pathname}`);
    const response = pathname.startsWith("/api/")
      ? NextResponse.json(
          { error: "Token invalid or expired" },
          { status: 401 },
        )
      : NextResponse.redirect(new URL("/login", request.url));

    // Clean up invalid cookie
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  // Apply Middleware to every route EXCEPT static files/images/favicon
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
