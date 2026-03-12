import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcrypt";
import { jwtVerify } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "fallback_secret_for_docker_manager_only_change_in_prod";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, secretKey);
    const userId = payload.id;

    const body = await request.json();
    const { currentPassword, newUsername, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to make changes" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid current password" },
        { status: 401 },
      );
    }

    let updateQuery = "UPDATE users SET ";
    const updateParams = [];

    if (newUsername && newUsername !== user.username) {
      // Check if username already exists
      const existing = await db.get("SELECT id FROM users WHERE username = ?", [
        newUsername,
      ]);
      if (existing) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 },
        );
      }
      updateQuery += "username = ?";
      updateParams.push(newUsername);
    }

    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      if (updateParams.length > 0) updateQuery += ", ";
      updateQuery += "password_hash = ?";
      updateParams.push(hash);
    }

    if (updateParams.length > 0) {
      updateQuery += " WHERE id = ?";
      updateParams.push(userId);
      await db.run(updateQuery, updateParams);
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
