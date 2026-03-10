import { NextResponse } from 'next/server';
import docker from '@/lib/docker';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const container = docker.getContainer(params.id);
        const info = await container.inspect();
        return NextResponse.json(info);
    } catch (error: any) {
        console.error('Failed to inspect container:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
