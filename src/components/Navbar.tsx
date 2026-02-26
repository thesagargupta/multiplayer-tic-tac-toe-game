import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="w-full bg-slate-900/50 backdrop-blur border-b border-slate-800 p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Gamepad2 className="w-8 h-8 text-indigo-400" />
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Tic Tac Toe
                    </span>
                </Link>
            </div>
        </nav>
    );
}
