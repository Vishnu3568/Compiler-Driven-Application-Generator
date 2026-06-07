'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, ExternalLink } from 'lucide-react';

interface Partner {
  name: string;
  location: string;
  avatar: string;
  description: string;
  languages: string[];
  tags: string[];
  linkedinUrl: string;
}

const PARTNERS: Partner[] = [
  {
    name: 'Marcos Almeida',
    location: 'São Paulo, Brazil',
    avatar: 'MA',
    description: 'Atuo a mais de 10 anos desenvolvendo sites e sistemas. Site e sistemas simples e complexos.',
    languages: ['English', 'Spanish', 'Portuguese'],
    tags: ['Application Development', 'Security Expert', 'Mobile Development', 'AI Expert', 'Cloud Architecture'],
    linkedinUrl: 'https://linkedin.com/'
  },
  {
    name: 'Ragav Gupta',
    location: 'Gurgaon, India',
    avatar: 'RG',
    description: "Expert in full-stack architecture, compiler engineering, and strategic tech consulting. Dedicated to delivering premium software products.",
    languages: ['English'],
    tags: ['Application Development', 'UI/UX Design', 'Security Expert', 'Strategic Consulting', 'Performance Tuning'],
    linkedinUrl: 'https://linkedin.com/'
  },
  {
    name: 'Wrap_Manjula',
    location: 'Abudhabi, Sri Lanka',
    avatar: 'WM',
    description: 'Accountant and Senior Web Application Developer specialized in financial dashboards, ERP integrations, and business automation software.',
    languages: ['English'],
    tags: ['UI/UX Design', 'Application Development', 'Mobile Development', 'Database Design'],
    linkedinUrl: 'https://linkedin.com/'
  }
];

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [timeLeft, setTimeLeft] = useState('48 : 00 : 01');

  // Countdown timer hook
  useEffect(() => {
    let totalSeconds = 48 * 3600 + 1;
    const interval = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(interval);
        return;
      }
      totalSeconds -= 1;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');
      setTimeLeft(`${hStr} : ${mStr} : ${sStr}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredPartners = PARTNERS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = selectedLanguage === 'All' || p.languages.includes(selectedLanguage);
    const matchesService = selectedService === 'All' || p.tags.includes(selectedService);
    return matchesSearch && matchesLang && matchesService;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#060814]">
      {/* Welcome Offer Banner */}
      <div className="w-full bg-gradient-to-r from-[#f36b2b] to-[#f8783d] text-white font-medium text-xs py-2.5 px-8 flex justify-center items-center gap-3 select-none relative z-10 shadow-lg shadow-orange-500/10">
        <span className="bg-[#fff0eb]/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide border border-white/20 select-none">Limited time welcome offer</span>
        <a href="#" className="underline hover:text-orange-100 transition-all text-[11px] flex items-center gap-1 font-semibold">
          Get 30% off select yearly plans <span className="text-[10px] text-orange-200">↗</span>
        </a>
        <span className="text-white/60 font-light select-none font-sans">|</span>
        <span className="bg-[#fcdcd2] text-[#d64118] px-2 py-0.5 rounded font-mono text-[11px] font-bold shadow-inner tracking-wider select-none">{timeLeft}</span>
      </div>

      {/* Header */}
      <header className="h-28 border-b border-[#1a1f38] bg-[#0b0f24] px-8 flex flex-col justify-center select-none shrink-0">
        <h1 id="partners-title" className="font-extrabold text-white text-2xl tracking-tight">Base44 Partners</h1>
        <span className="text-xs text-slate-400 mt-1">From first steps to advanced builds, Base44 Partners provide the expertise and insight to help you achieve the best outcome.</span>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Search & Select dropdowns toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d122e] border border-[#1a234f] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#f36b2b] transition-all"
            />
          </div>

          <div className="flex items-center gap-3 select-none">
            <select 
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="bg-[#0d122e] border border-[#1a234f] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none focus:border-[#f36b2b]"
            >
              <option value="All">Service (All)</option>
              <option value="Application Development">Application Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Security Expert">Security Expert</option>
              <option value="Strategic Consulting">Strategic Consulting</option>
              <option value="Mobile Development">Mobile Development</option>
            </select>

            <select 
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="bg-[#0d122e] border border-[#1a234f] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none focus:border-[#f36b2b]"
            >
              <option value="All">Language (All)</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Portuguese">Portuguese</option>
            </select>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-3 gap-6 pb-12">
          {filteredPartners.map((p, idx) => (
            <div key={idx} className="glass-card bg-[#090d22]/40 border border-[#1a1f38] rounded-2xl p-6 hover:border-[#f36b2b]/40 flex flex-col justify-between space-y-6 transition-all">
              <div className="space-y-4">
                {/* Header Profile */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    {/* Initials Avatar */}
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#f36b2b] to-[#f472b6] text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {p.avatar}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base leading-tight">{p.name}</h3>
                      <div className="flex items-center text-slate-400 text-[11px] mt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500 shrink-0" />
                        <span>{p.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* External Profile Link */}
                  <a 
                    href={p.linkedinUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-slate-500 hover:text-white p-1 hover:bg-slate-800/40 rounded-lg transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">{p.description}</p>
                
                {/* Languages list */}
                <div className="text-[10px] text-slate-500 font-mono">
                  <span className="font-bold uppercase tracking-wider">Languages:</span> {p.languages.join(', ')}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#1a1f38]/60">
                {p.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="text-[9px] font-bold bg-[#121833] border border-[#1a234f] text-slate-400 px-2 py-0.5 rounded-full font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
