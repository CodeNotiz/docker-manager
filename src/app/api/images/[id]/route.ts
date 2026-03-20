import { NextRequest, NextResponse } from "next/server";
import docker from "@/lib/docker";
import logger from "@/lib/logger";

// GET: Details eines spezifischen Images abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const image = docker.getImage(id);

    // inspect() liefert alle Details wie Config, Env, Layers, etc.
    const details = await image.inspect();

    return NextResponse.json(details);
  } catch (error: any) {
    logger.error(`Failed to fetch image details:`, error.message);
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: "Image-Details konnten nicht geladen werden" },
      { status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const image = docker.getImage(id);

    // Use force: true to remove images that might have multiple tags or stopped containers
    await image.remove({ force: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error(`Failed to delete image:`, error.message);
    // Handle specific docker errors like conflict
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
