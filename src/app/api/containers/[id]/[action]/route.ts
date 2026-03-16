import { NextRequest, NextResponse } from "next/server";
import docker from "@/lib/docker";
import logger from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const { id, action } = await params;

  try {
    const container = docker.getContainer(id);

    switch (action) {
      case "start":
        await container.start();
        break;
      case "stop":
        await container.stop();
        break;
      case "restart":
        await container.restart();
        break;
      case "pause":
        await container.pause();
        break;
      case "unpause":
        await container.unpause();
        break;
      case "delete":
        await container.remove({ force: true });
        break;
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }

    return NextResponse.json({
      message: `Container ${id} successfully ${action}ed.`,
    });
  } catch (error: any) {
    logger.error(`Failed to execute '${action}' on container '${id}':`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
