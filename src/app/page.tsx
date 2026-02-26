'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Gamepad2, ArrowRight, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function Home() {
  const router = useRouter();
  const [joinRoomId, setJoinRoomId] = useState('');

  const handleCreateRoom = () => {
    const newRoomId = uuidv4().slice(0, 8); // Short UUID for easier sharing
    router.push(`/room/${newRoomId}?action=create`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;
    router.push(`/room/${joinRoomId.trim()}?action=join`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-8">

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl mb-4">
              <Gamepad2 className="w-12 h-12 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100">Play with Friends</h1>
            <p className="text-slate-400">Create a new room or join an existing one.</p>
          </div>

          <div className="flex flex-col gap-6">
            <button
              onClick={handleCreateRoom}
              className="group relative w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white p-4 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Create New Room
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">Or join existing</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleJoinRoom} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter Room Code"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={!joinRoomId.trim()}
                className="group w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-xl font-semibold transition-all border border-slate-700 hover:border-slate-600"
              >
                Join Room
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
