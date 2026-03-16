import { NextResponse } from "next/server";
import docker from "@/lib/docker";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const pruneAllUnused = body?.all === true;

    // filters parameter expects a stringified JSON
    const filters = pruneAllUnused
      ? { dangling: ["false"] } // Deletes ALL unused images (dangling + tagged)
      : { dangling: ["true"] }; // Deletes ONLY dangling (untagged) images

    const result = await docker.pruneImages({
      filters: JSON.stringify(filters),
    });

    return NextResponse.json({
      success: true,
      deletedImages: result.ImagesDeleted || [],
      spaceReclaimed: result.SpaceReclaimed || 0,
    });
  } catch (error: any) {
    logger.error("Failed to prune images:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
