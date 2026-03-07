import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const STACKS_DIR = path.join(process.cwd(), 'stacks_data');

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;
        const stackPath = path.join(STACKS_DIR, name);

        // Ensure path is within STACKS_DIR (security)
        if (!stackPath.startsWith(STACKS_DIR)) {
            return NextResponse.json({ error: 'Invalid stack name' }, { status: 400 });
        }

        try {
            // Take down stack if it is running
            await execAsync(`docker compose -f docker-compose.yml down`, { cwd: stackPath });
        } catch (e) {
            console.log(`Note: 'docker compose down' failed for ${name}, maybe it wasn't running. Proceeding to delete folder.`);
        }

        // Delete stack folder
        await fs.rm(stackPath, { recursive: true, force: true });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`Failed to delete stack: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;
        const body = await request.json();
        const { action } = body; // 'up' or 'down'

        const stackPath = path.join(STACKS_DIR, name);

        if (action === 'up') {
            // Run docker compose up -d
            await execAsync(`docker compose -f docker-compose.yml up -d`, { cwd: stackPath });
            return NextResponse.json({ success: true, message: 'Stack started' });
        } else if (action === 'down') {
            // Run docker compose down
            await execAsync(`docker compose -f docker-compose.yml down`, { cwd: stackPath });
            return NextResponse.json({ success: true, message: 'Stack stopped' });
        } else {
            return NextResponse.json({ error: 'Invalid action. Use "up" or "down".' }, { status: 400 });
        }

    } catch (error: any) {
        console.error(`Failed to execute stack action: ${error.message}`);
        // Often docker compose prints errors to stderr, which is included in error.message from execAsync
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
