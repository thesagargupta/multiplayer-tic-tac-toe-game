export type SquareValue = 'X' | 'O' | null;

export interface Player {
  id: string; // Socket ID
  symbol: 'X' | 'O';
  socketId: string;
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
