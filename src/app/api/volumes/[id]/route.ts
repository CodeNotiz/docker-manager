import { NextRequest, NextResponse } from "next/server";
import docker from "@/lib/docker";
import logger from "@/lib/logger";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const volume = docker.getVolume(id);
    await volume.remove();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to delete volume:`, errorMessage);
    const status = (error && typeof error === "object" && "statusCode" in error) ? (error.statusCode as number) : 500;
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
