import { NextRequest, NextResponse } from 'next/server';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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
