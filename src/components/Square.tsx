import { X, Circle } from 'lucide-react';
import { SquareValue } from '../types/game';

interface SquareProps {
    value: SquareValue;
    onClick: () => void;
    disabled: boolean;
    isWinningSquare: boolean;
}

export default function Square({ value, onClick, disabled, isWinningSquare }: SquareProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || value !== null}
            className={`
        h-24 sm:h-32 w-24 sm:w-32 rounded-2xl flex items-center justify-center
        text-4xl sm:text-6xl transition-all duration-200
        ${isWinningSquare
                    ? 'bg-green-500/20 border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                    : value !== null
                        ? 'bg-slate-800/80 border border-slate-700'
                        : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 active:scale-95 cursor-pointer'
                }
        ${disabled && value === null ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            {value === 'X' && (
                <X className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-in zoom-in duration-200" />
            )}
            {value === 'O' && (
                <Circle className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-in zoom-in duration-200" />
            )}
        </button>
    );
}
