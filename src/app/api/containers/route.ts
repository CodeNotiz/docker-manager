import { NextResponse } from 'next/server';
import docker from '@/lib/docker';

export async function GET() {
    try {
        const containers = await docker.listContainers({ all: true });
        return NextResponse.json(containers);
    } catch (error: any) {
        console.error("Failed to list containers:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
