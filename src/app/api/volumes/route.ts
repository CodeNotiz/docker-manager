import { NextResponse } from "next/server";
import docker from "@/lib/docker";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { Volumes } = await docker.listVolumes();

    const formattedVolumes = (Volumes || []).map((vol) => ({
      Name: vol.Name,
      Driver: vol.Driver,
      Mountpoint: vol.Mountpoint,
      Scope: vol.Scope,
      Labels: vol.Labels || {},
      Options: vol.Options || {},
    }));

    formattedVolumes.sort((a, b) => a.Name.localeCompare(b.Name));
    return NextResponse.json(formattedVolumes);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Failed to fetch volumes:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { Name?: string; Driver?: string };
    const { Name, Driver } = body;

    if (!Name) {
      return NextResponse.json({ error: "Volume name is required" }, { status: 400 });
    }

    const volume = await docker.createVolume({ Name, Driver: Driver || "local" });
    return NextResponse.json({ success: true, name: volume.Name });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Failed to create volume:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
