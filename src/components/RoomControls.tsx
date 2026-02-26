import { Copy, RefreshCw, X, Circle, Users } from 'lucide-react';
import { GameState, Player } from '../types/game';
import { toast } from 'sonner';

interface RoomControlsProps {
    roomId: string;
    players: Player[];
    gameState: GameState;
    playerSymbol: 'X' | 'O' | null;
    onRestart: () => void;
    isOpponentConnected: boolean;
}

export default function RoomControls({
    roomId,
    players,
    gameState,
    playerSymbol,
    onRestart,
    isOpponentConnected,
}: RoomControlsProps) {
    const isMyTurn = playerSymbol === gameState.currentTurn;
    const isGameOver = gameState.winner !== null || gameState.isDraw;

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        toast.success('Room ID copied to clipboard!');
    };

    let statusMessage = '';
    let statusColor = '';

    if (!isOpponentConnected) {
        statusMessage = 'Waiting for opponent...';
        statusColor = 'text-yellow-400';
    } else if (gameState.winner) {
        if (gameState.winner === playerSymbol) {
            statusMessage = 'You Win!! 🎉';
            statusColor = 'text-green-400';
        } else {
            statusMessage = 'You Lose 😢';
            statusColor = 'text-red-400';
        }
    } else if (gameState.isDraw) {
        statusMessage = "It's a Draw! 🤝";
        statusColor = 'text-blue-400';
    } else if (isMyTurn) {
        statusMessage = 'Your Turn';
        statusColor = 'text-indigo-400';
    } else {
        statusMessage = "Opponent's Turn";
        statusColor = 'text-slate-400';
    }

    return (
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col gap-6">

            {/* Top section: Room ID */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Room Code</span>
                    <span className="font-mono text-lg font-bold text-slate-200">{roomId}</span>
                </div>
                <button
                    onClick={copyRoomId}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                    title="Copy Room ID"
                >
                    <Copy className="w-5 h-5 text-slate-300" />
                </button>
            </div>

            <div className="h-px bg-slate-800 w-full" />

            {/* Middle section: Players & Status */}
            <div className="flex flex-col items-center gap-4">

                {/* Status Text */}
                <div className={`text-2xl font-bold ${statusColor} text-center transition-colors duration-300`}>
                    {statusMessage}
                </div>

                {/* Player symbols info */}
                <div className="flex items-center gap-8 text-sm">
                    <div className={`flex flex-col items-center gap-2 ${playerSymbol === 'X' ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                            <X className="w-6 h-6 text-red-500" />
                        </div>
                        <span className="font-medium text-slate-300">
                            {playerSymbol === 'X' ? 'You' : 'Opponent'}
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center opacity-40">
                        <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded">VS</span>
                    </div>

                    <div className={`flex flex-col items-center gap-2 ${playerSymbol === 'O' ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                            <Circle className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="font-medium text-slate-300">
                            {playerSymbol === 'O' ? 'You' : (isOpponentConnected ? 'Opponent' : 'Waiting...')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom section: Restart Button (Only if game over) */}
            {isGameOver && (
                <button
                    onClick={onRestart}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                    <RefreshCw className="w-5 h-5" />
                    Play Again
                </button>
            )}
        </div>
    );
}
