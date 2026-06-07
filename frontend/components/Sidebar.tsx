'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Layers, 
  Plug, 
  Rocket, 
  UserCheck, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Templates', href: '/templates', icon: Layers },
    { name: 'Integrations', href: '/integrations', icon: Plug },
    { name: 'Launchpad', href: '/metrics', icon: Rocket },
    { name: 'Hire a Partner', href: '/partners', icon: UserCheck },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none text-slate-300 font-sans">
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
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg transition-all text-xs font-bold ${isActive ? 'bg-[#121835] text-white' : 'hover:bg-[#121835]/50 text-slate-300 hover:text-white'}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#f36b2b]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
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
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden h-14 border-b border-[#1a1f38] bg-[#0b0f24] px-4 flex items-center justify-between select-none shrink-0 w-full z-20">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-full bg-[#f36b2b] flex items-center justify-center text-white font-bold text-xs">
            <span className="text-[10px] tracking-tighter">☀</span>
          </div>
          <span className="font-extrabold text-white text-sm tracking-tight">ForgeFlow AI</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg border border-[#1a1f38] bg-[#0d122e]"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Desktop Sidebar (Permanent) */}
      <aside className="w-64 border-r border-[#1a1f38] bg-[#0b0f24] hidden md:flex flex-col justify-between select-none shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer Content */}
          <aside className="relative flex flex-col w-64 max-w-xs h-full bg-[#0b0f24] border-r border-[#1a1f38] z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
