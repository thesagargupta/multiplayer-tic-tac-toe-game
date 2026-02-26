import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Room, Player, GameState, SquareValue, MovePayload } from '../src/types/game';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', // For development. In production, specify the actual origin
        methods: ['GET', 'POST'],
    },
});

const PORT = process.env.PORT || 3001;

// In-memory storage for rooms
const rooms = new Map<string, Room>();

const getInitialGameState = (): GameState => ({
    board: Array(9).fill(null),
    currentTurn: 'X',
    winner: null,
    isDraw: false,
    winningLine: null,
});

const checkWinner = (board: SquareValue[]): { winner: 'X' | 'O' | null; line: number[] | null } => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a] as 'X' | 'O', line };
        }
    }

    return { winner: null, line: null };
};

io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a user creates a new room
    socket.on('create-room', (roomId: string) => {
        // Check if room already exists
        if (rooms.has(roomId)) {
            socket.emit('error', 'Room already exists');
            return;
        }

        const player: Player = {
            id: socket.id,
            symbol: 'X',
            socketId: socket.id,
        };

        const newRoom: Room = {
            id: roomId,
            players: [player],
            gameState: getInitialGameState(),
        };

        rooms.set(roomId, newRoom);
        socket.join(roomId);

        // Send initial state to the creator
        socket.emit('game-state-update', newRoom.gameState);
        console.log(`Room ${roomId} created by ${socket.id}`);
    });

    // When a user joins an existing room
    socket.on('join-room', (roomId: string) => {
        const room = rooms.get(roomId);

        if (!room) {
            socket.emit('error', 'Room not found');
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('room-full');
            return;
        }

        // Determine symbol (if X is taken, take O)
        const existingPlayer = room.players[0];
        const newSymbol: 'X' | 'O' = existingPlayer.symbol === 'X' ? 'O' : 'X';

        const player: Player = {
            id: socket.id,
            symbol: newSymbol,
            socketId: socket.id,
        };

        room.players.push(player);
        socket.join(roomId);

        // Notify both players of the current state
        io.to(roomId).emit('game-state-update', room.gameState);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // When a player makes a move
    socket.on('player-move', (payload: MovePayload) => {
        const { roomId, index, playerId } = payload;
        const room = rooms.get(roomId);

        if (!room) return;

        const { gameState, players } = room;
        const player = players.find(p => p.id === playerId);

        if (!player) return;

        // Validate turn
        if (gameState.currentTurn !== player.symbol) return;

        // Validate empty square
        if (gameState.board[index] !== null) return;

        // Validate game not over
        if (gameState.winner || gameState.isDraw) return;

        // Apply move
        gameState.board[index] = player.symbol;

        // Check winner
        const { winner, line } = checkWinner(gameState.board);

        if (winner) {
            gameState.winner = winner;
            gameState.winningLine = line;
        } else {
            // Check draw
            const isBoardFull = gameState.board.every(square => square !== null);
            if (isBoardFull) {
                gameState.isDraw = true;
            } else {
                // Change turn
                gameState.currentTurn = gameState.currentTurn === 'X' ? 'O' : 'X';
            }
        }

        // Broadcast updated state
        io.to(roomId).emit('game-state-update', gameState);
    });

    // When a player requests a restart
    socket.on('restart-game', (roomId: string) => {
        const room = rooms.get(roomId);
        if (!room) return;

        room.gameState = getInitialGameState();
        io.to(roomId).emit('game-state-update', room.gameState);
    });

    // Handle disconnects
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        // Find rooms this user was in and remove them
        rooms.forEach((room, roomId) => {
            const playerIndex = room.players.findIndex(p => p.socketId === socket.id);

            if (playerIndex !== -1) {
                // Notify others
                socket.to(roomId).emit('player-disconnected');

                // Remove player
                room.players.splice(playerIndex, 1);

                // Clean up empty rooms
                if (room.players.length === 0) {
                    rooms.delete(roomId);
                    console.log(`Room ${roomId} deleted (empty)`);
                }
            }
        });
    });
});

httpServer.listen(PORT, () => {
    console.log(`Socket.IO Server running on port ${PORT}`);
});
