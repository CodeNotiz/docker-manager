import { NextResponse } from 'next/server';
import Docker from 'dockerode';
import fs from 'fs/promises';
import path from 'path';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const STACKS_DIR = path.join(process.cwd(), 'stacks_data');

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch Containers
        const containers = await docker.listContainers({ all: true });

        // Fetch Images
        const images = await docker.listImages({ all: true });

        // Fetch Networks
        const networks = await docker.listNetworks();

        // Fetch Stacks
        let stackCount = 0;
        try {
            await fs.mkdir(STACKS_DIR, { recursive: true });
            const dirs = await fs.readdir(STACKS_DIR, { withFileTypes: true });
            stackCount = dirs.filter(dirent => dirent.isDirectory()).length;
        } catch (e) {
            // Directory might not exist or be accessible, assume 0
        }

        return NextResponse.json({
            containers: containers.length,
            images: images.length,
            networks: networks.length,
            stacks: stackCount
        });
    } catch (error: any) {
        console.error('Failed to fetch dashboard stats:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
