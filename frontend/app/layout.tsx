import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

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
      <body className="flex h-screen bg-[#060814] text-[#d1d5db] overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-[#1a1f38] bg-[#090d22] flex flex-col justify-between select-none">
          <div className="flex flex-col">
            {/* Header Brand */}
            <div className="p-6 border-b border-[#1a1f38] flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-purple-500/20">
                F
              </div>
              <div>
                <h1 className="font-bold text-lg text-white tracking-wide leading-none">ForgeFlow AI</h1>
                <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Compiler Engine</span>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-1">
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#131b3e] text-slate-300 hover:text-white transition-all duration-150 group"
              >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-sm">Compiler Console</span>
              </Link>
              
              <Link
                href="/metrics"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#131b3e] text-slate-300 hover:text-white transition-all duration-150 group"
              >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium text-sm">Metrics & Benchmarks</span>
              </Link>
            </nav>
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-[#1a1f38] text-[11px] text-slate-500 font-mono">
            <div>v1.0.0 Stable</div>
            <div>OS: Windows Server</div>
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
