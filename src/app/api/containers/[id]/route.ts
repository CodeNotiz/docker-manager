import { NextResponse } from "next/server";
import docker from "@/lib/docker";
import logger from "@/lib/logger";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const container = docker.getContainer(params.id);
    const info = await container.inspect();

    let stats = null;
    if (info.State.Running && !info.State.Paused) {
      stats = await container.stats({ stream: false });
    }

    return NextResponse.json({ info, stats });
  } catch (error: any) {
    logger.error("Failed to inspect container:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
