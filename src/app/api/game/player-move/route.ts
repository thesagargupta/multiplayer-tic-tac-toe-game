import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusherServer';
import { getRoom, setRoom } from '@/lib/redisClient';
import { checkWinner } from '@/lib/gameLogic';

export async function POST(req: NextRequest) {
    const { roomId, index, playerId } = await req.json();

    if (roomId === undefined || index === undefined || !playerId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const room = await getRoom(roomId);
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const { gameState, players } = room;
    const player = players.find(p => p.id === playerId);

    if (!player) return NextResponse.json({ error: 'Player not in room' }, { status: 403 });
    if (gameState.currentTurn !== player.symbol) return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
    if (gameState.board[index] !== null) return NextResponse.json({ error: 'Square already taken' }, { status: 400 });
    if (gameState.winner || gameState.isDraw) return NextResponse.json({ error: 'Game is over' }, { status: 400 });

    // Apply move
    gameState.board[index] = player.symbol;

    const { winner, line } = checkWinner(gameState.board);
    if (winner) {
        gameState.winner = winner;
        gameState.winningLine = line;
    } else {
        const isFull = gameState.board.every(sq => sq !== null);
        if (isFull) {
            gameState.isDraw = true;
        } else {
            gameState.currentTurn = gameState.currentTurn === 'X' ? 'O' : 'X';
        }
    }

    // Run Redis write and Pusher trigger in parallel for minimum latency
    await Promise.all([
        setRoom(roomId, room),
        pusherServer.trigger(`private-game-${roomId}`, 'game-state-update', gameState),
    ]);

    return NextResponse.json({ success: true });
}
