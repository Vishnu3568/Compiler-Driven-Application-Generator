'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plug, ArrowUpRight } from 'lucide-react';

interface Connector {
  name: string;
  description: string;
  icon: string;
  iconBg: string;
}

const CONNECTORS: Connector[] = [
  {
    name: 'Stripe',
    description: 'Sell products or subscriptions and get paid online.',
    icon: 'S',
    iconBg: 'bg-indigo-600'
  },
  {
    name: 'Salesforce',
    description: 'Automate and sync CRM records.',
    icon: 'sf',
    iconBg: 'bg-cyan-500'
  },
  {
    name: 'Slack User',
    description: 'Send messages and manage Slack as a user.',
    icon: 'su',
    iconBg: 'bg-emerald-600'
  },
  {
    name: 'Slack Bot',
    description: 'Post as a branded bot in your Slack workspace.',
    icon: 'sb',
    iconBg: 'bg-teal-600'
  },
  {
    name: 'Notion',
    description: 'Organize and sync knowledge or project data.',
    icon: 'N',
    iconBg: 'bg-neutral-800'
  },
  {
    name: 'Google Calendar',
    description: 'Manage your schedule and calendar events.',
    icon: '31',
    iconBg: 'bg-blue-600'
  },
  {
    name: 'Google Drive',
    description: 'Export and back up app-generated files.',
    icon: '▲',
    iconBg: 'bg-yellow-600'
  },
  {
    name: 'Gmail',
    description: 'Automate email sending and inbox management.',
    icon: 'M',
    iconBg: 'bg-red-600'
  }
];

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('');


  const filteredConnectors = CONNECTORS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#060814]">

      {/* Header */}
      <header className="h-24 border-b border-[#1a1f38] bg-[#0b0f24] px-8 flex flex-col justify-center select-none shrink-0">
        <h1 id="integrations-title" className="font-extrabold text-white text-2xl tracking-tight">Integrations</h1>
        <span className="text-xs text-slate-400 mt-1">Discover pre-built integrations that let you connect to APIs, services, and tools to extend your app's capabilities.</span>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Search bar */}
        <div className="flex items-center gap-4 select-none">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d122e] border border-[#1a234f] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#f36b2b] transition-all"
            />
          </div>
        </div>

        {/* Section Connectors Title */}
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest font-sans pt-2">Connectors</h2>

        {/* Connectors Grid */}
        <div className="grid grid-cols-4 gap-6 pb-12">
          {filteredConnectors.map((c, idx) => (
            <div key={idx} className="glass-card bg-[#090d22]/40 border border-[#1a1f38] rounded-xl p-5 hover:border-[#f36b2b]/40 flex flex-col justify-between space-y-5 transition-all">
              <div className="space-y-3">
                {/* Logo & Name */}
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg ${c.iconBg} flex items-center justify-center font-bold text-white text-sm font-sans shadow-md`}>
                    {c.icon}
                  </div>
                  <h3 className="font-bold text-white text-sm font-sans">{c.name}</h3>
                </div>
                {/* Description */}
                <p className="text-xs text-slate-400 leading-normal font-sans">{c.description}</p>
              </div>

              {/* Action Button */}
              <button className="w-full bg-[#0d122e] border border-[#1a234f] hover:border-[#f36b2b]/50 text-slate-300 hover:text-white transition-all text-xs font-bold py-2 rounded-xl select-none">
                How to use
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
