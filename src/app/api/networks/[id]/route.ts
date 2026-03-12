import { NextRequest, NextResponse } from "next/server";
import docker from "@/lib/docker";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const network = docker.getNetwork(id);

    await network.remove();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Failed to delete network: ${error.message}`);
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
