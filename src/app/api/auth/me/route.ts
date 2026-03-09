import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_docker_manager_only_change_in_prod';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, secretKey);

        return NextResponse.json({
            authenticated: true,
            user: {
                id: payload.id,
                username: payload.username
            }
        });
    } catch (error) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
