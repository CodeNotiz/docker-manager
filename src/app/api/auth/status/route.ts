import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcrypt";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      "admin",
    ]);

    let isDefaultLoginActive = false;

    if (user) {
      isDefaultLoginActive = await bcrypt.compare("admin", user.password_hash);
    }

    return NextResponse.json({ isDefaultLoginActive });
  } catch (error: any) {
    logger.error("Check auth status error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
