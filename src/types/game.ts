export type SquareValue = 'X' | 'O' | null;

export interface Player {
  id: string; // Unique player ID (stored in sessionStorage)
  symbol: 'X' | 'O';
  socketId: string; // kept for compatibility — same as id
}

export interface GameState {
  board: SquareValue[];
  currentTurn: 'X' | 'O';
  winner: 'X' | 'O' | null;
  isDraw: boolean;
  winningLine: number[] | null;
}

export interface Room {
  id: string;
  players: Player[];
  gameState: GameState;
}

export interface MovePayload {
  roomId: string;
  index: number;
  playerId: string;
}
