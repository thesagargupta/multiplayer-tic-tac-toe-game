import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusherServer';
import { getRoom, setRoom } from '@/lib/redisClient';
import { getInitialGameState } from '@/lib/gameLogic';
import { Room, Player } from '@/types/game';

export async function POST(req: NextRequest) {
    const { roomId, playerId } = await req.json();

    if (!roomId || !playerId) {
        return NextResponse.json({ error: 'Missing roomId or playerId' }, { status: 400 });
    }

    const existing = await getRoom(roomId);
    if (existing) {
        return NextResponse.json({ error: 'Room already exists' }, { status: 409 });
    }

    const player: Player = { id: playerId, symbol: 'X', socketId: playerId };
    const room: Room = {
        id: roomId,
        players: [player],
        gameState: getInitialGameState(),
    };

    await setRoom(roomId, room);

    // Notify the channel (creator is already on it)
    await pusherServer.trigger(`private-game-${roomId}`, 'game-state-update', room.gameState);

    return NextResponse.json({ success: true, symbol: 'X', gameState: room.gameState });
}
