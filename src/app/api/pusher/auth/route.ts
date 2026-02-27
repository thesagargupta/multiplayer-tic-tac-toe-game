import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusherServer';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
}
