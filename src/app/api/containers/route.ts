import { NextResponse } from "next/server";
import docker from "@/lib/docker";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const containers = await docker.listContainers({ all: true });
    return NextResponse.json(containers);
  } catch (error: any) {
    logger.error("Failed to list containers:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
