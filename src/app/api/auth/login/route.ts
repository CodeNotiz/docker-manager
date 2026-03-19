import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import logger from "@/lib/logger";

export async function POST(request: Request) {

  const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_docker_manager_only_change_in_prod";
  const secretKey = new TextEncoder().encode(JWT_SECRET);

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Create JWT token
    const token = await new SignJWT({ id: user.id, username: user.username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // Valid for 24 hours
      .sign(secretKey);

    const response = NextResponse.json({ success: true });

    // Set HTTP-only cookie
    // COOKIE_SECURE=true only if you run behind HTTPS. Default: false (HTTP works out of the box)
    const isSecure = process.env.COOKIE_SECURE === "true";
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    logger.error("Login error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
