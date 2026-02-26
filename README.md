# Multiplayer Tic Tac Toe

A real-time multiplayer Tic Tac Toe game built with Next.js (App Router), Socket.IO, TypeScript, and Tailwind CSS.

## Features
- **Real-time Multiplayer**: Play instantly with friends using Socket.IO WebSockets.
- **Room-based Gameplay**: Create a private room and share the 8-character code.
- **Modern UI**: Built with Tailwind CSS and Lucide React icons, featuring a sleek dark mode design with glassmorphism effects.
- **Responsive Navigation**: Enjoy the game on desktop or mobile devices.
- **Game Status Tracking**: Automatic win, lose, turn, and draw detection.

## Prerequisites
- Node.js (v18+ recommended)
- npm

## Getting Started

1. **Install Dependencies** (if not already installed)
   ```bash
   npm install
   ```

2. **Start the Development Environment**
   You need to run both the Socket.IO backend server and the Next.js frontend server.

   **Terminal 1 (Backend Server):**
   ```bash
   npm run server
   ```
   *This starts the Express + Socket.IO server on port 3001.*

   **Terminal 2 (Frontend Next.js App):**
   ```bash
   npm run dev
   ```
   *This starts the Next.js development server on port 3000.*

3. **Play the Game**
   - Open your browser and navigate to `http://localhost:3000`.
   - Click **Create Room** to start a new game.
   - Copy the short Room ID and send it to your friend (or open a new incognito window).
   - In the second window, paste the Room ID into the join input and click **Join Room**.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **WebSockets**: Socket.IO & Express (Custom Node server)
- **Icons**: Lucide React
- **Notifications**: Sonner

## Architecture
- `server/socketServer.ts`: The authoritative backend server managing room states, player connections, and win logic.
- `src/app/page.tsx`: The landing page for creating and joining rooms.
- `src/app/room/[roomId]/page.tsx`: The active game room connecting to the socket and rendering the game state.
- `src/components/*`: Reusable UI components including the GameBoard, Square, Navbar, and RoomControls.
# multiplayer-tic-tac-toe-game
