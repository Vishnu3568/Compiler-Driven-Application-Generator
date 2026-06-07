import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';

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
      <body className="flex flex-col md:flex-row h-screen bg-[#060814] text-[#d1d5db] overflow-hidden font-sans">
        {/* Sidebar Navigation (Responsive) */}
        <Sidebar />

        {/* Content Panel */}
        <main className="flex-1 flex flex-col h-full bg-[#060814] overflow-hidden min-w-0">
          {children}
        </main>
      </body>
    </html>
  );
}



