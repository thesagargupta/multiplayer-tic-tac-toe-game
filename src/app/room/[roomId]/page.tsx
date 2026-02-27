'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { pusherClient } from '@/lib/pusherClient';
import { GameState } from '@/types/game';
import Navbar from '@/components/Navbar';
import GameBoard from '@/components/GameBoard';
import RoomControls from '@/components/RoomControls';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import type { Channel } from 'pusher-js';

/** Get or create a stable per-browser-session player ID */
function getPlayerId(): string {
    if (typeof window === 'undefined') return '';
    let id = sessionStorage.getItem('playerId');
    if (!id) {
        id = uuidv4();
        sessionStorage.setItem('playerId', id);
    }
    return id;
}

export default function GameRoom({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = React.use(params);
    const searchParams = useSearchParams();
    const action = searchParams.get('action') || 'join';

    const [isConnected, setIsConnected] = useState(false);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
    const [isOpponentConnected, setIsOpponentConnected] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const channelRef = useRef<Channel | null>(null);
    const playerIdRef = useRef<string>('');

    useEffect(() => {
        const playerId = getPlayerId();
        playerIdRef.current = playerId;

        // Subscribe to private Pusher channel for this room
        const channel = pusherClient.subscribe(`private-game-${roomId}`);
        channelRef.current = channel;

        channel.bind('pusher:subscription_succeeded', async () => {
            setIsConnected(true);

            try {
                if (action === 'create') {
                    const res = await fetch('/api/game/create-room', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ roomId, playerId }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        // Room might already exist — try joining instead
                        if (res.status === 409) {
                            await joinRoom(roomId, playerId);
                        } else {
                            setErrorMsg(data.error || 'Failed to create room');
                        }
                        return;
                    }
                    setPlayerSymbol(data.symbol);
                    setGameState(data.gameState);
                } else {
                    await joinRoom(roomId, playerId);
                }
            } catch {
                setErrorMsg('Failed to connect to the server. Please try again.');
            }
        });

        channel.bind('pusher:subscription_error', () => {
            setErrorMsg('Failed to join the room channel. Please try again.');
        });

        channel.bind('game-state-update', (state: GameState) => {
            setGameState(state);
        });

        channel.bind('player-joined', (data: { playersCount: number }) => {
            if (data.playersCount >= 2) {
                setIsOpponentConnected(true);
                toast.success('Opponent joined!');
            }
        });

        channel.bind('player-disconnected', () => {
            setIsOpponentConnected(false);
            toast.warning('Opponent disconnected');
        });

        return () => {
            const pid = playerIdRef.current;
            if (pid) {
                fetch('/api/game/leave-room', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId, playerId: pid }),
                }).catch(() => {});
            }
            channel.unbind_all();
            pusherClient.unsubscribe(`private-game-${roomId}`);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, action]);

    async function joinRoom(rId: string, pid: string) {
        const res = await fetch('/api/game/join-room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: rId, playerId: pid }),
        });
        const data = await res.json();
        if (!res.ok) {
            const msg = res.status === 409 ? 'This room is currently full.' : (data.error || 'Room not found');
            setErrorMsg(msg);
            if (res.status === 409) toast.error('Room is full!');
            return;
        }
        setPlayerSymbol(data.symbol);
        setGameState(data.gameState);
        // If room already has 2 players (reconnect scenario), mark opponent as connected
        if (data.gameState) setIsOpponentConnected(true);
    }

    const handleSquareClick = (index: number) => {
        if (!gameState || !playerSymbol) return;
        if (gameState.currentTurn !== playerSymbol) return;
        if (gameState.board[index] !== null) return;
        if (gameState.winner || gameState.isDraw) return;

        // ── Optimistic update: render instantly without waiting for server ──
        const newBoard = gameState.board.slice() as typeof gameState.board;
        newBoard[index] = playerSymbol;
        setGameState(prev => prev ? { ...prev, board: newBoard, currentTurn: playerSymbol === 'X' ? 'O' : 'X' } : prev);

        // Fire-and-forget — Pusher will push back the authoritative state
        fetch('/api/game/player-move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, index, playerId: playerIdRef.current }),
        }).catch(() => {
            // Revert on network error
            setGameState(prev => prev ? { ...prev, board: gameState.board, currentTurn: gameState.currentTurn } : prev);
        });
    };

    const handleRestart = () => {
        // Optimistic reset
        setGameState(prev => prev ? {
            board: Array(9).fill(null),
            currentTurn: 'X',
            winner: null,
            isDraw: false,
            winningLine: null,
        } : prev);

        fetch('/api/game/restart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId }),
        });
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

    return (
        <div className="min-h-screen flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <Navbar />

            <main className="flex-1 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-12 gap-8 lg:gap-16">

                {/* Game Board Section */}
                <div className="flex-1 flex items-center justify-center w-full max-w-lg lg:max-w-none order-2 lg:order-1">
                    <GameBoard
                        gameState={gameState}
                        onSquareClick={handleSquareClick}
                        disabled={!isConnected || !isOpponentConnected}
                        playerSymbol={playerSymbol}
                    />
                </div>

                {/* Controls Section */}
                <div className="w-full max-w-md order-1 lg:order-2">
                    <RoomControls
                        roomId={roomId}
                        players={[]}
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