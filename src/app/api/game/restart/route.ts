import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusherServer';
import { getRoom, setRoom } from '@/lib/redisClient';
import { getInitialGameState } from '@/lib/gameLogic';

export async function POST(req: NextRequest) {
    const { roomId } = await req.json();
    if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });

    const room = await getRoom(roomId);
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    room.gameState = getInitialGameState();
    await Promise.all([
        setRoom(roomId, room),
        pusherServer.trigger(`private-game-${roomId}`, 'game-state-update', room.gameState),
    ]);

    return NextResponse.json({ success: true });
}
