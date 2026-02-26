import { GameState, SquareValue } from '../types/game';
import Square from './Square';

interface GameBoardProps {
    gameState: GameState;
    onSquareClick: (index: number) => void;
    disabled: boolean;
    playerSymbol: 'X' | 'O' | null;
}

export default function GameBoard({ gameState, onSquareClick, disabled, playerSymbol }: GameBoardProps) {
    const isMyTurn = playerSymbol === gameState.currentTurn;
    const isGameOver = gameState.winner !== null || gameState.isDraw;

    // A square is disabled if the game is over, it's not the user's turn, the globally disabled prop is true, or the user is just observing
    const isSquareDisabled = (index: number) => {
        return disabled || isGameOver || !isMyTurn || playerSymbol === null;
    };

    return (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 bg-slate-900/40 rounded-3xl backdrop-blur-sm border border-slate-800/50 shadow-2xl">
            {gameState.board.map((value, index) => (
                <Square
                    key={index}
                    value={value}
                    onClick={() => onSquareClick(index)}
                    disabled={isSquareDisabled(index)}
                    isWinningSquare={gameState.winningLine?.includes(index) || false}
                />
            ))}
        </div>
    );
}
