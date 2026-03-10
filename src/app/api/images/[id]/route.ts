import { NextRequest, NextResponse } from 'next/server';
import docker from '@/lib/docker';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const image = docker.getImage(id);

        // Use force: true to remove images that might have multiple tags or stopped containers
        await image.remove({ force: true });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`Failed to delete image ${error.message}`);
        // Handle specific docker errors like conflict
        const status = error.statusCode || 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}
