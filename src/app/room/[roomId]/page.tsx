'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';
import { GameState, Player, MovePayload } from '@/types/game';
import Navbar from '@/components/Navbar';
import GameBoard from '@/components/GameBoard';
import RoomControls from '@/components/RoomControls';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// The Next.js 15 App router expects params as a Promise for async components, but since this is a Client Component, we can use React.use() wrapper or in this case use useParams but to avoid type issues we just use any
export default function GameRoom({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = React.use(params);
    const searchParams = useSearchParams();
    const action = searchParams.get('action') || 'join';

    const [isConnected, setIsConnected] = useState(false);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
    const [playersCounter, setPlayersCounter] = useState<number>(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        socket.connect();

        socket.on('connect', () => {
            setIsConnected(true);
            if (action === 'create') {
                socket.emit('create-room', roomId);
                setPlayerSymbol('X');
            } else {
                socket.emit('join-room', roomId);
                // Symbol will be determined if they join successfully (they will be 'O' or spec)
            }
        });

        socket.on('game-state-update', (state: GameState) => {
            setGameState(state);

            // If we joined, figure out what symbol we should be based on if X is taken.
            // But since the server handles X and O assignment, we should just assume if we joined we are O (or observer).
            // A better way is server sending us our player object, but for simplicity:
            if (action === 'join' && !playerSymbol) {
                setPlayerSymbol('O');
            }
        });

        socket.on('room-full', () => {
            setErrorMsg('This room is currently full.');
            toast.error('Room is full!');
        });

        socket.on('player-disconnected', () => {
            toast.warning('Opponent disconnected');
            setPlayersCounter(prev => Math.max(0, prev - 1));
        });

        socket.on('error', (msg: string) => {
            setErrorMsg(msg);
            toast.error(msg);
        });

        return () => {
            socket.off('connect');
            socket.off('game-state-update');
            socket.off('room-full');
            socket.off('player-disconnected');
            socket.off('error');
            socket.disconnect();
        };
    }, [roomId, action]);

    // Hacky way to detect opponent connection based on game state updates or just basic inference
    // Since we don't have a direct player list sync in this basic implementation, we assume opponent is there
    // if we are O, X must be there. If we are X and it's O's turn or a move has been made, O is there.
    // We'll update our server to broadcast players later if needed, but for now we'll just derive it roughly.
    // Actually, wait, player-disconnected fires. Let's assume if we are X, opponent is connected if they joined.
    // A better way is the server broadcasting "player-joined".
    // For now, let's just consider them connected if it's their turn or game state gets updated with their move.

    const handleSquareClick = (index: number) => {
        if (!gameState || !playerSymbol) return;
        if (gameState.currentTurn !== playerSymbol) return;
        if (gameState.board[index] !== null) return;

        socket.emit('player-move', {
            roomId,
            index,
            playerId: socket.id,
        } as MovePayload);
    };

    const handleRestart = () => {
        socket.emit('restart-game', roomId);
    };

    if (errorMsg) {
        return (
            <div className="min-h-screen flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
                    <div className="text-red-400 text-xl font-semibold bg-red-400/10 p-6 rounded-2xl border border-red-400/20">
                        {errorMsg}
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-slate-300 hover:text-white underline underline-offset-4"
                    >
                        Return Home
                    </button>
                </main>
            </div>
        );
    }

    if (!isConnected || !gameState) {
        return (
            <div className="min-h-screen flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="text-slate-400 animate-pulse">Connecting to room...</p>
                </main>
            </div>
        );
    }

    // Very basic opponent detection (since we didn't add a "player-joined" event to the server)
    // Easiest heuristic for this implementation:
    const isOpponentConnected = true; // In a full prod app, we'd sync the players array.

    return (
        <div className="min-h-screen flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <Navbar />

            <main className="flex-1 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-12 gap-8 lg:gap-16">

                {/* Game Board Section */}
                <div className="flex-1 flex items-center justify-center w-full max-w-lg lg:max-w-none order-2 lg:order-1">
                    <GameBoard
                        gameState={gameState}
                        onSquareClick={handleSquareClick}
                        disabled={!isConnected}
                        playerSymbol={playerSymbol}
                    />
                </div>

                {/* Controls Section */}
                <div className="w-full max-w-md order-1 lg:order-2">
                    <RoomControls
                        roomId={roomId}
                        players={[]} // We aren't fully using this array in the UI directly right now
                        gameState={gameState}
                        playerSymbol={playerSymbol}
                        onRestart={handleRestart}
                        isOpponentConnected={isOpponentConnected}
                    />
                </div>

            </main>
        </div>
    );
}
