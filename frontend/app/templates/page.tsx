'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Globe, ArrowUpRight } from 'lucide-react';

interface TemplateItem {
  name: string;
  creator: string;
  usages: string;
  category: string;
  price: string;
  tags: string[];
  prompt: string;
  imageUrl: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    name: 'Task management',
    creator: 'Base44 App',
    usages: '26,281',
    category: 'Marketing & Sales',
    price: 'Free',
    tags: ['Marketing & Sales', 'Operations'],
    prompt: 'Build a task management system with dashboards, contacts list, and role-based tasks. Admins can view analytics.',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&q=80'
  },
  {
    name: 'Serenity - Spa & Salon',
    creator: 'Digital Doctors',
    usages: '2,784',
    category: 'Marketing & Sales',
    price: '$29.99',
    tags: ['Marketing & Sales', 'Lifestyle & Hobbies'],
    prompt: 'Build a booking app for a spa/salon with calendar views, service catalog, payments integration, and admin portal.',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80'
  },
  {
    name: 'CODE GEN AI',
    creator: 'Vishal Prajapati',
    usages: '20,987',
    category: 'Content Generation',
    price: 'Free',
    tags: ['Content Generation', 'Operations'],
    prompt: 'Build a code generation portal with user logins, history dashboard, subscription plan, and webhook integration.',
    imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=400&q=80'
  },
  {
    name: 'Uber for Dragons',
    creator: 'Fantasy Rides Ltd',
    usages: '12,410',
    category: 'Booking',
    price: 'Free',
    tags: ['Booking', 'Operations'],
    prompt: 'Build Uber for Dragons booking portal with flight tracking, payments simulation, role-based gates, and admin analytics.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'
  }
];

export default function TemplatesMarketplace() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');


  const handleSelectTemplate = (prompt: string) => {
    router.push(`/?prompt=${encodeURIComponent(prompt)}`);
  };

  const categories = [
    'All',
    'Marketing & Sales',
    'Operations',
    'Data & Analytics',
    'Content Generation',
    'HR & Legal',
    'Finance',
    'Education',
    'Community',
    'Lifestyle & Hobbies'
  ];

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || t.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#060814]">

      {/* Header */}
      <header className="h-20 border-b border-[#1a1f38] bg-[#0b0f24] px-8 flex flex-col justify-center select-none shrink-0">
        <h1 id="templates-title" className="font-extrabold text-white text-2xl tracking-tight">App Templates</h1>
        <span className="text-xs text-slate-400 mt-1">Explore a curated collection of applications built by our community.</span>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Search & Select dropdowns toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d122e] border border-[#1a234f] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#f36b2b] transition-all"
            />
          </div>

          <div className="flex items-center gap-3 select-none">
            <select className="bg-[#0d122e] border border-[#1a234f] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none focus:border-[#f36b2b]">
              <option>English</option>
              <option>Spanish</option>
              <option>Portuguese</option>
            </select>

            <select className="bg-[#0d122e] border border-[#1a234f] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none focus:border-[#f36b2b]">
              <option>All Templates</option>
              <option>Featured</option>
              <option>Trending</option>
            </select>
          </div>
        </div>

        {/* Category Pills Menu */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 select-none no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all border whitespace-nowrap ${selectedCategory === cat ? 'bg-[#f36b2b] border-[#f36b2b] text-white shadow-lg shadow-orange-500/10' : 'bg-[#0d122e] border-[#1a234f] text-slate-400 hover:text-white hover:border-[#1a234f]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-3 gap-6">
          {filteredTemplates.map((t, idx) => (
            <div key={idx} className="glass-card hover:border-[#f36b2b]/50 transition-all flex flex-col group overflow-hidden bg-[#090d22]/40">
              {/* Mock Image Header */}
              <div className="h-40 bg-slate-950/40 relative overflow-hidden flex items-center justify-center border-b border-[#1a1f38]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#090d22] to-orange-500/10 opacity-60" />
                <Globe className="w-8 h-8 text-orange-400/40" />
              </div>

              {/* Contents */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-sm group-hover:text-[#f36b2b] transition-all">{t.name}</h3>
                    <span className="text-xs font-semibold text-slate-300 font-mono">{t.price}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{t.prompt}</p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Category Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {t.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-semibold bg-[#121833] border border-[#222a57] text-slate-400 px-2 py-0.5 rounded-full font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-t border-[#1a1f38]/60 pt-3 select-none">
                    <span className="text-slate-500 font-mono">By {t.creator} • {t.usages} usages</span>
                    <button
                      onClick={() => handleSelectTemplate(t.prompt)}
                      className="flex items-center gap-1 text-[#f36b2b] hover:text-orange-400 font-semibold transition-all"
                    >
                      <span>Use Template</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
