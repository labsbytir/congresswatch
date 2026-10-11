import { BillDetail } from './components/BillDetail';
import { LawmakerAvatar } from './components/LawmakerAvatar';
import React, { useState, useEffect } from 'react';
import { StickyHeader } from './components/StickyHeader';
import { MemberProfile } from './components/MemberProfile';
import { 
  SearchIcon, 
  SparklesIcon, 
  CapitolIcon, 
  CloseIcon, 
  ExternalLinkIcon,
  SendIcon
} from './components/Icons';

export default function App() {
  // Default to Smart+ AI search
  const [searchMode, setSearchMode] = useState<'classic' | 'smart_plus'>('smart_plus');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; sources?: any[] }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  // Real data state fetched from Cloudflare D1
  const [members, setMembers] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setMembers(data);
      })
      .catch(err => console.warn('Members fetch fallback:', err));

    fetch('/api/bills')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setBills(data);
      })
      .catch(err => console.warn('Bills fetch fallback:', err));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchMode === 'smart_plus') {
      setIsChatOpen(true);
      const userMsg = searchQuery;
      setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setSearchQuery('');
      runAiChat(userMsg);
    } else {
      window.location.href = `/bills?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const runAiChat = async (promptText: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/search/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: promptText })
      });

      if (!res.ok) throw new Error('AI query failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      setChatMessages(prev => [...prev, { role: 'assistant', text: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        setChatMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', text: assistantText };
          return updated;
        });
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: `Error contacting CongressWatch AI: ${err.message}. Please verify API keys.` }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    runAiChat(msg);
  };

  const displayedBills = bills.length > 0 ? bills : [
    {
      id: '118-hr-8070',
      bill_number: 8070,
      bill_type: 'hr',
      title: 'Servicemember Quality of Life Improvement and National Defense Authorization Act for Fiscal Year 2025 (NDAA FY25)',
      status: 'Passed House (217 - 199)',
      introduced_date: '2024-04-16'
    },
    {
      id: '118-hr-2882',
      bill_number: 2882,
      bill_type: 'hr',
      title: 'Further Consolidated Appropriations Act, 2024 (Enacted FY24 Funding Package)',
      status: 'Became Public Law No: 118-47',
      introduced_date: '2023-04-18'
    },
    {
      id: '118-hr-7521',
      bill_number: 7521,
      bill_type: 'hr',
      title: 'Protecting Americans from Foreign Adversary Controlled Applications Act',
      status: 'Became Public Law No: 118-50',
      introduced_date: '2024-03-05'
    },
    {
      id: '118-hr-5376',
      bill_number: 5376,
      bill_type: 'hr',
      title: 'Securing Americas Critical Minerals and Supply Chains Act',
      status: 'Reported by House Committee',
      introduced_date: '2023-09-08'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 font-satoshi flex flex-col">
      {/* Sticky Black Header with Verified Logo */}
      <StickyHeader
        searchMode={searchMode}
        onToggleSearchMode={(mode) => setSearchMode(mode)}
      />

      {/* Main Full-Width Content Container */}
      <main className="flex-1">
        {selectedMemberId ? (
          <MemberProfile
            bioguideId={selectedMemberId}
            onBack={() => setSelectedMemberId(null)}
            onAskAi={(prompt) => {
              setIsChatOpen(true);
              setChatMessages([{ role: 'user', text: prompt }]);
              runAiChat(prompt);
            }}
          />
        ) : selectedBillId ? (
          <BillDetail
            billId={selectedBillId}
            onBack={() => setSelectedBillId(null)}
            onAskAi={(prompt) => {
              setIsChatOpen(true);
              setChatMessages([{ role: 'user', text: prompt }]);
              runAiChat(prompt);
            }}
            onSelectMember={(bioguide) => {
              setSelectedBillId(null);
              setSelectedMemberId(bioguide);
            }}
          />
        ) : (
          <>
            {/* OpenSecrets Style Hero & Unified Search Header */}
            <section className="bg-[#0a192f] text-white py-14 px-6 border-b-4 border-blue-600 shadow-md">
              <div className="max-w-5xl mx-auto text-center space-y-4">
                <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-950/70 px-4 py-2 rounded-full border border-blue-800/80 inline-flex items-center gap-2 text-sm font-bold">
                  <CapitolIcon className="w-3.5 h-3.5 text-blue-400" />
                  Investigative Legislative & Procurement Intelligence
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                  Tracking Federal Power, Policy & Contracts
                </h1>
                <p className="text-neutral-200 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
                  Connect 118th Congress legislation directly to corporate lobbying disclosures, insider stock transactions, and active SAM.gov procurement contracts.
                </p>

                {/* Universal Search Form */}
                <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto mt-6 bg-white rounded-lg p-2 shadow-2xl flex items-center gap-2 border-2 border-neutral-300 focus-within:border-blue-600 transition-colors">
                  <span className="text-neutral-400 pl-3">
                    <SearchIcon className="w-4 h-4 text-neutral-500" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchMode === 'smart_plus'
                        ? "Ask Smart+ AI: 'Which Armed Services members bought defense stocks before NDAA?'"
                        : "Search 539 Lawmakers, Bills (H.R. 8070), Tickers (NVDA), or Solicitations..."
                    }
                    className="flex-1 py-3 px-3 text-neutral-900 text-base focus:outline-none font-medium"
                  />

                  {/* Slider Toggle Switch (Basic vs Smart+ AI) */}
                  <div className="bg-neutral-100 p-0.5 rounded-full flex items-center border border-neutral-300 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSearchMode('classic')}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${
                        searchMode === 'classic'
                          ? 'bg-white text-neutral-900 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <SearchIcon className="w-3 h-3 text-neutral-600" />
                      Basic
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchMode('smart_plus')}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${
                        searchMode === 'smart_plus'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <SparklesIcon className="w-3 h-3 text-white" />
                      Smart+ AI
                    </button>
                  </div>

                  <button type="submit" className="bg-[#1e40af] hover:bg-blue-700 text-white px-6 py-2.5 rounded font-black text-base transition-colors shrink-0">
                    Search
                  </button>
                </form>

                {/* Search Category Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-neutral-300">
                  <span className="font-semibold text-neutral-400">Trending Legislation:</span>
                  <button onClick={() => { setSearchQuery('NDAA FY2025'); }} className="hover:text-white bg-neutral-800/80 px-2.5 py-1 rounded border border-neutral-700">#NDAA FY2025 (H.R. 8070)</button>
                  <button onClick={() => { setSearchQuery('Consolidated Appropriations'); }} className="hover:text-white bg-neutral-800/80 px-2.5 py-1 rounded border border-neutral-700">#Appropriations Package (P.L. 118-47)</button>
                  <button onClick={() => { setSearchQuery('Foreign Adversary App Act'); }} className="hover:text-white bg-neutral-800/80 px-2.5 py-1 rounded border border-neutral-700">#Foreign Adversary Apps (P.L. 118-50)</button>
                  <button onClick={() => { setSearchQuery('Critical Minerals'); }} className="hover:text-white bg-neutral-800/80 px-2.5 py-1 rounded border border-neutral-700">#Critical Minerals Supply Chain</button>
                </div>
              </div>
            </section>

            {/* OpenSecrets Style Executive Stat Blocks */}
            <section className="max-w-6xl mx-auto px-6 -mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm border-t-4 border-t-blue-600">
                  <div className="text-xs uppercase font-black tracking-wider text-neutral-600">118th Congress Appropriations</div>
                  <div className="text-3xl font-black text-neutral-900 mt-1.5 tabular-nums">$851.6B</div>
                  <div className="text-sm text-emerald-700 font-bold mt-1.5">Enacted FY2024 Package</div>
                </div>
                <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm border-t-4 border-t-amber-500">
                  <div className="text-xs uppercase font-black tracking-wider text-neutral-600">Active SAM.gov Solicitations</div>
                  <div className="text-3xl font-black text-neutral-900 mt-1.5 tabular-nums">4,280 Bids</div>
                  <div className="text-sm text-neutral-600 font-semibold mt-1.5">Matched to Statutory Mandates</div>
                </div>
                <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm border-t-4 border-t-emerald-600">
                  <div className="text-xs uppercase font-black tracking-wider text-neutral-600">Disclosed Congressional Trades</div>
                  <div className="text-3xl font-black text-neutral-900 mt-1.5 tabular-nums">682 Filings</div>
                  <div className="text-sm text-neutral-600 font-semibold mt-1.5">Pelosi, McCaul, Tuberville</div>
                </div>
                <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm border-t-4 border-t-purple-600">
                  <div className="text-xs uppercase font-black tracking-wider text-neutral-600">Verified Members in Database</div>
                  <div className="text-3xl font-black text-neutral-900 mt-1.5 tabular-nums">539 Lawmakers</div>
                  <div className="text-sm text-neutral-600 font-semibold mt-1.5">100 Senators • 439 Reps</div>
                </div>
              </div>
            </section>

            {/* Bi-Directional Parallax Rails (Real 539 Sitting Lawmakers with Cloudflare R2 AVIF Portraits) */}
            <section className="my-12 overflow-hidden bg-neutral-900 py-6 border-y border-neutral-800">
              <div className="max-w-6xl mx-auto px-6 mb-4 flex items-center justify-between text-white">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
                  Capitol Roll Call: 539 Sitting Lawmakers
                </h3>
                <span className="text-xs text-neutral-400">Continuous Opposing Partisan Parallax Rails</span>
              </div>

              {/* Row 1: Leftward Parallax (Democrats) */}
              <div className="overflow-hidden py-1">
                <div className="animate-marquee-left flex gap-4">
                  {(members.filter(m => m.party === 'Democrat').slice(0, 20).concat(members.filter(m => m.party === 'Democrat').slice(0, 20))).map((m, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedMemberId(m.bioguide_id)}
                      className="cursor-pointer hover:scale-105 transition-transform p-2.5 rounded-lg border flex items-center gap-3 shrink-0 w-64 bg-blue-950/40 border-blue-900/60 text-blue-200"
                    >
                      <LawmakerAvatar bioguideId={m.bioguide_id} name={`${m.first_name} ${m.last_name}`} party={m.party} className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700 shrink-0" />
                      <div className="truncate text-sm">
                        <div className="font-bold text-white truncate">{m.first_name} {m.last_name}</div>
                        <div className="text-neutral-400">{m.state} {m.district ? `-${m.district}` : ''} • {m.chamber === 'senate' ? 'Senator' : 'Representative'}</div>
                        <div className="text-blue-300 font-semibold text-xs mt-0.5">{m.total_terms_years} Years in Congress</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 2: Rightward Parallax (Republicans) */}
              <div className="overflow-hidden py-1 mt-2">
                <div className="animate-marquee-right flex gap-4">
                  {(members.filter(m => m.party === 'Republican').slice(0, 20).concat(members.filter(m => m.party === 'Republican').slice(0, 20))).map((m, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedMemberId(m.bioguide_id)}
                      className="cursor-pointer hover:scale-105 transition-transform p-2.5 rounded-lg border flex items-center gap-3 shrink-0 w-64 bg-red-950/40 border-red-900/60 text-red-200"
                    >
                      <LawmakerAvatar bioguideId={m.bioguide_id} name={`${m.first_name} ${m.last_name}`} party={m.party} className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700 shrink-0" />
                      <div className="truncate text-xs">
                        <div className="font-bold text-white truncate">{m.first_name} {m.last_name}</div>
                        <div className="text-neutral-400">{m.state} {m.district ? `-${m.district}` : ''} • {m.chamber === 'senate' ? 'Senator' : 'Representative'}</div>
                        <div className="text-red-300 font-semibold text-xs mt-0.5">{m.total_terms_years} Years in Congress</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* High-Density Research Dossier Table */}
            <section className="max-w-6xl mx-auto px-6 pb-16">
              <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4 bg-[#f8fafc]">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Official 118th Congress Legislation</h2>
                    <p className="text-xs text-neutral-500">Live statutory records synchronized from Congress.gov and Cloudflare D1.</p>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="bg-[#0a192f] hover:bg-neutral-800 text-white px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <SparklesIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ask AI Assistant</span>
                  </button>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#f1f5f9] text-neutral-700 font-bold uppercase tracking-wider border-b border-neutral-200">
                      <tr>
                        <th className="py-3 px-4">Bill Number</th>
                        <th className="py-3 px-4">Official Title</th>
                        <th className="py-3 px-4">Chamber</th>
                        <th className="py-3 px-4">Introduced</th>
                        <th className="py-3 px-4">Official Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {displayedBills.map((b) => (
                        <tr 
                          key={b.id} 
                          onClick={() => setSelectedBillId(b.id)} 
                          className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedBillId(b.id); }}
                              className="text-blue-700 hover:text-blue-900 hover:underline text-left cursor-pointer text-base font-mono font-bold"
                            >
                              {b.bill_type ? b.bill_type.toUpperCase() : "H.R."} {b.bill_number}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 max-w-md">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedBillId(b.id); }}
                              className="font-bold text-neutral-900 group-hover:text-blue-700 hover:underline text-left text-base leading-snug cursor-pointer block"
                            >
                              {b.title}
                            </button>
                            {b.short_title && (
                              <div className="text-neutral-600 text-xs font-medium mt-1">Short title: {b.short_title}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 uppercase font-medium text-neutral-700">
                            {b.bill_type?.startsWith("s") ? "Senate" : "House"}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-700 font-mono text-sm whitespace-nowrap">{b.introduced_date}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs px-3 py-1.5">
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBillId(b.id);
                              }}
                              className="bg-neutral-100 group-hover:bg-blue-600 group-hover:text-white text-neutral-800 font-semibold px-3 py-1.5 rounded-md text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              View Dossier
                              <ExternalLinkIcon className="w-3 h-3 opacity-70" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Floating Smart+ AI Chat Drawer */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-xl h-full bg-neutral-950 text-white flex flex-col shadow-2xl border-l border-neutral-800">
            {/* Drawer Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-black">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="font-bold text-sm flex items-center gap-1.5">
                  <SparklesIcon className="w-4 h-4 text-blue-400" />
                  CongressWatch Smart+ AI
                </span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-neutral-400 hover:text-white p-1 text-sm font-semibold flex items-center gap-1"
              >
                <CloseIcon className="w-4 h-4" />
                Close
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 space-y-2">
                  <CapitolIcon className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                  <div className="font-semibold text-neutral-300 text-sm">What would you like to investigate?</div>
                  <p className="max-w-xs mx-auto text-neutral-400 text-xs">
                    Ask questions across 118th Congress bills, member insider stock trades, or SAM.gov procurement bids.
                  </p>
                </div>
              ) : (
                chatMessages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="text-[10px] text-neutral-500 mb-1">{m.role === 'user' ? 'You' : 'CongressWatch AI'}</div>
                    <div className={`p-3 rounded-lg max-w-md text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                    }`}>
                      {m.text || (isAiLoading && idx === chatMessages.length - 1 ? 'Analyzing verified congressional records...' : '')}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendFollowUp} className="p-4 border-t border-neutral-800 bg-black flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask follow-up question or search bill provisions..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isAiLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded text-xs transition-colors flex items-center gap-1"
              >
                <SendIcon className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer className="bg-[#0a192f] text-neutral-400 py-12 px-6 border-t border-neutral-800 text-xs mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <img 
                src="/brand/logo.png" 
                alt="Congress Watch Logo" 
                style={{ height: '32px', width: 'auto' }}
              />
              <span className="text-white font-bold text-sm tracking-wide">CongressWatch Platform</span>
            </div>
            <p className="max-w-md text-neutral-400">
              Non-partisan civic intelligence synthesizing Congress.gov, SAM.gov, Senate eFD, and the Federal Register on the edge.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-neutral-300">
            <a href="/api-docs" className="hover:text-white">Developer API</a>
            <a href="/procurement" className="hover:text-white">Contracts</a>
            <a href="/fantasy" className="hover:text-white">Fantasy Congress</a>
            <a href="https://discord.gg/vXkPvAkuvN" className="hover:text-blue-400">Discord Community</a>
            <a href="https://buymeacoffee.com/postdated" className="hover:text-amber-400">Donate</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

