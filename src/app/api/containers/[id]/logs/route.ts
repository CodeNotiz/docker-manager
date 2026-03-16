import { NextRequest, NextResponse } from "next/server";
import docker from "@/lib/docker";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const container = docker.getContainer(id);
    const logStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      tail: 100,
    });

    const stream = new ReadableStream({
      start(controller) {
        logStream.on("data", (chunk) => {
          // Docker log stream prepends an 8-byte header to each line.
          // We can just send the raw text, but need to skip the header for cleaner output
          // Usually chunk.slice(8) works for raw docker streams.
          const payload = chunk.length > 8 ? chunk.subarray(8) : chunk;
          controller.enqueue(payload);
        });

        logStream.on("end", () => controller.close());
        logStream.on("error", (err) => controller.error(err));

        // Clean up when client disconnects
        request.signal.addEventListener("abort", () => {
          (logStream as any).destroy();
        });
      },
      cancel() {
        (logStream as any).destroy();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    logger.error(`Failed to fetch logs for container '${id}':`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
