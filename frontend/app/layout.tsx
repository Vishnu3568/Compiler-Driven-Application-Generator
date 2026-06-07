import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { 
  Home, 
  Layers, 
  Plug, 
  Rocket, 
  UserCheck, 
  ChevronDown
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'ForgeFlow AI - Application Blueprint Compiler',
  description: 'Compile natural language requirements into executable schemas and code blueprints.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-[#060814] text-[#d1d5db] overflow-hidden font-sans">
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-[#1a1f38] bg-[#0b0f24] flex flex-col justify-between select-none text-slate-300 font-sans shrink-0">
          <div className="flex flex-col overflow-y-auto">
            {/* Header Brand */}
            <div className="p-4 border-b border-[#1a1f38] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                {/* Orange rising sun brand logo */}
                <div className="h-6 w-6 rounded-full bg-[#f36b2b] flex items-center justify-center text-white font-bold text-xs select-none">
                  <span className="text-[10px] tracking-tighter">☀</span>
                </div>
                {/* User initials pink avatar */}
                <div className="h-7 w-7 rounded-full bg-[#ec4899] text-white flex items-center justify-center text-xs font-bold font-sans">
                  Uw
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs text-white">Uppari's Workspace</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="p-3 space-y-0.5">
              <Link
                href="/"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg hover:bg-[#121835] text-slate-300 hover:text-white transition-all text-xs font-bold"
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>Home</span>
              </Link>

              <Link
                href="/templates"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg hover:bg-[#121835] text-slate-300 hover:text-white transition-all text-xs font-bold"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Templates</span>
              </Link>

              <Link
                href="/integrations"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg hover:bg-[#121835] text-slate-300 hover:text-white transition-all text-xs font-bold"
              >
                <Plug className="w-4 h-4 text-slate-400" />
                <span>Integrations</span>
              </Link>

              <Link
                href="/metrics"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg hover:bg-[#121835] text-slate-300 hover:text-white transition-all text-xs font-bold"
              >
                <Rocket className="w-4 h-4 text-slate-400" />
                <span>Launchpad</span>
              </Link>

              <Link
                href="/partners"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg hover:bg-[#121835] text-slate-300 hover:text-white transition-all text-xs font-bold"
              >
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Hire a Partner</span>
              </Link>
            </nav>

            {/* Favorite Apps Section */}
            <div className="px-4 py-3 border-t border-[#1a1f38]/60 mt-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider font-bold select-none cursor-pointer">
                <span>Favorite apps</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <div className="mt-4 py-6 text-center border border-dashed border-[#1a1f38] rounded-lg bg-[#070b1e]/40 select-none">
                <p className="text-[10px] text-slate-500 max-w-[160px] mx-auto leading-normal">
                  No favorite apps yet.<br />Add your apps for quick access.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-3 border-t border-[#1a1f38] flex flex-col gap-2 bg-[#090d20]">
            {/* Bottom Avatar Row */}
            <div className="flex items-center justify-between pt-1 select-none">
              <div className="flex items-center gap-2">
                {/* User avatar mockup */}
                <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-white">
                  U
                </div>
                <span className="text-xs font-semibold text-slate-300">Uppari</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                v1.0 Stable
              </div>
            </div>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 flex flex-col h-full bg-[#060814] overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}


