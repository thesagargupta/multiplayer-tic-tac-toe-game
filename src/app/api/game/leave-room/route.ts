import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusherServer';
import { getRoom, setRoom, deleteRoom } from '@/lib/redisClient';

export async function POST(req: NextRequest) {
    const { roomId, playerId } = await req.json();
    if (!roomId || !playerId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const room = await getRoom(roomId);
    if (!room) return NextResponse.json({ success: true });

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
            await deleteRoom(roomId);
        } else {
            await setRoom(roomId, room);
            await pusherServer.trigger(`private-game-${roomId}`, 'player-disconnected', {});
        }
    }

    return NextResponse.json({ success: true });
}
