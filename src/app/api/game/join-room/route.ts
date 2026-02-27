import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusherServer';
import { getRoom, setRoom } from '@/lib/redisClient';
import { Player } from '@/types/game';

export async function POST(req: NextRequest) {
    const { roomId, playerId } = await req.json();

    if (!roomId || !playerId) {
        return NextResponse.json({ error: 'Missing roomId or playerId' }, { status: 400 });
    }

    const room = await getRoom(roomId);

    if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.players.length >= 2) {
        return NextResponse.json({ error: 'Room is full' }, { status: 409 });
    }

    // Check if this player already exists (reconnect scenario)
    const alreadyIn = room.players.find(p => p.id === playerId);
    if (alreadyIn) {
        return NextResponse.json({ success: true, symbol: alreadyIn.symbol, gameState: room.gameState });
    }

    const existingSymbol = room.players[0].symbol;
    const newSymbol: 'X' | 'O' = existingSymbol === 'X' ? 'O' : 'X';
    const player: Player = { id: playerId, symbol: newSymbol, socketId: playerId };

    room.players.push(player);
    await setRoom(roomId, room);

    // Broadcast updated state to both players in the channel
    await pusherServer.trigger(`private-game-${roomId}`, 'game-state-update', room.gameState);
    await pusherServer.trigger(`private-game-${roomId}`, 'player-joined', { playersCount: room.players.length });

    return NextResponse.json({ success: true, symbol: newSymbol, gameState: room.gameState });
}
