import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const STACKS_DIR = path.join(process.cwd(), 'stacks_data');

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await fs.mkdir(STACKS_DIR, { recursive: true });
        const dirs = await fs.readdir(STACKS_DIR, { withFileTypes: true });

        const stacks = await Promise.all(
            dirs.filter(dirent => dirent.isDirectory()).map(async (dirent) => {
                const stackName = dirent.name;
                const stackPath = path.join(STACKS_DIR, stackName);

                // Read compose file to show preview
                let composeFile = '';
                try {
                    composeFile = await fs.readFile(path.join(stackPath, 'docker-compose.yml'), 'utf-8');
                } catch (e) {
                    // Try .yaml extension
                    try {
                        composeFile = await fs.readFile(path.join(stackPath, 'docker-compose.yaml'), 'utf-8');
                    } catch (e2) {
                        // Ignore
                    }
                }

                // Read .env file if it exists
                let envFile = '';
                try {
                    envFile = await fs.readFile(path.join(stackPath, '.env'), 'utf-8');
                } catch (e) {
                    // Ignore, env file is optional
                }

                // Check status using docker compose ps
                let status = 'unknown';
                let containers = 0;
                try {
                    const { stdout } = await execAsync(`docker compose -f docker-compose.yml ps -q`, { cwd: stackPath });
                    const lines = stdout.split('\n').filter(l => l.trim().length > 0);
                    containers = lines.length;
                    status = containers > 0 ? 'running' : 'stopped';
                } catch (e) {
                    status = 'stopped';
                }

                return {
                    name: stackName,
                    composeFile,
                    envFile,
                    status,
                    containers
                };
            })
        );

        return NextResponse.json(stacks);
    } catch (error: any) {
        console.error('Failed to fetch stacks:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, composeFile, envFile } = body;

        if (!name || !composeFile) {
            return NextResponse.json({ error: 'Name and compose file content are required' }, { status: 400 });
        }

        // Basic validation for name
        if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
            return NextResponse.json({ error: 'Invalid stack name. Only alphanumeric, dashes and underscores allowed.' }, { status: 400 });
        }

        const stackPath = path.join(STACKS_DIR, name);
        await fs.mkdir(stackPath, { recursive: true });

        // Write docker-compose.yml
        await fs.writeFile(path.join(stackPath, 'docker-compose.yml'), composeFile);

        // Write .env if provided
        if (typeof envFile === 'string') {
            await fs.writeFile(path.join(stackPath, '.env'), envFile);
        }

        return NextResponse.json({ success: true, name });
    } catch (error: any) {
        console.error('Failed to create/update stack:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
