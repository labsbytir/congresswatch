import { SearchModeToggle } from './components/SearchModeToggle';
import { LlmActionMenu } from "./components/LlmActionMenu";
import { AiBadge } from './components/AiBadge';
import React, { useState, useEffect, useMemo } from 'react';
import { StickyHeader } from './components/StickyHeader';
import { MemberProfile } from './components/MemberProfile';
import { BillDetail } from './components/BillDetail';
import { LawmakerAvatar } from './components/LawmakerAvatar';
import { 
  SearchIcon, 
  SparklesIcon, 
  CapitolIcon, 
  CloseIcon, 
  ExternalLinkIcon,
  SendIcon,
  DiscordIcon
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
  const [activeTab, setActiveTab] = useState<'bills' | 'members' | 'committees' | 'contracts' | 'map'>('bills');

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

  const defaultBills = [
    {
      id: '118-hr-8070',
      bill_number: 8070,
      bill_type: 'hr',
      title: 'Servicemember Quality of Life Improvement and National Defense Authorization Act for Fiscal Year 2025 (NDAA FY25)',
      status: 'Passed House',
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

  const baseBillsList = bills.length > 0 ? bills : defaultBills;

  // Live search feature for Basic mode ONLY (Smart+ AI waits for enter)
  const displayedBills = useMemo(() => {
    if (searchMode === 'classic' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return baseBillsList.filter(b => 
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.bill_number && String(b.bill_number).includes(q)) ||
        (b.id && b.id.toLowerCase().includes(q)) ||
        (b.status && b.status.toLowerCase().includes(q))
      );
    }
    return baseBillsList;
  }, [baseBillsList, searchMode, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchMode === 'smart_plus') {
      // Trigger AI session on submit
      setIsChatOpen(true);
      const userMsg = searchQuery;
      setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setSearchQuery('');
      runAiChat(userMsg);
    } else {
      // For basic mode, user hit enter - scroll to table or focus
      const tableElem = document.getElementById('cw-table-container');
      if (tableElem) {
        tableElem.scrollIntoView({ behavior: 'smooth' });
      }
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 font-satoshi flex flex-col">
      {/* Sticky Black Header with Glass Separation Border */}
      <StickyHeader
        searchMode={searchMode}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setSelectedMemberId(null);
          setSelectedBillId(null);
          setActiveTab(tab);
        }}
        onToggleSearchMode={(mode) => setSearchMode(mode)}
      />

      {/* Universal Page Action Bar (Smart AI Badge + LLM Agent Export Menu) */}
      <div className="bg-[#0d1527] border-b border-neutral-800 py-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-xs font-black text-neutral-200 uppercase tracking-wider font-mono">
              {activeTab.toUpperCase()} • 118TH CONGRESS CIVIC PLATFORM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsChatOpen(true)} 
              className="cursor-pointer transition-transform hover:scale-105 flex items-center"
              title="Ask Smart AI Assistant"
            >
              <AiBadge size="md" label="Smart AI" active={true} />
            </button>
            <LlmActionMenu markdownUrl="/llms.txt" title="CongressWatch Page Content" />
          </div>
        </div>
      </div>

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
            {/* Pure Black Hero Section with Glass Border Transition */}
            <section id="cw-hero-section" className="bg-black text-white py-16 px-6 border-b-2 border-white/10 shadow-lg">
              <div className="max-w-5xl mx-auto text-center space-y-5">
                <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400 bg-neutral-900 px-4 py-2 rounded-full border border-neutral-700 inline-flex items-center gap-2">
                  <CapitolIcon className="w-4 h-4 text-blue-400" />
                  Investigative Legislative & Procurement Intelligence
                </span>

                {/* Hero Title: Strictly Pure White Satoshi 800+ */}
                <h1 id="cw-hero-title" className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                  Tracking Federal Power, Policy & Contracts
                </h1>

                <p id="cw-hero-subtitle" className="text-neutral-300 max-w-3xl mx-auto text-base md:text-xl font-medium leading-relaxed">
                  Connect 118th Congress legislation directly to corporate lobbying disclosures, insider stock transactions, and active SAM.gov procurement contracts.
                </p>

                {/* Universal Search Form Container (Clean input, no left icon, heavy magnifying glass search button) */}
                <form 
                  id="cw-search-container" 
                  onSubmit={handleSearchSubmit} 
                  className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl p-2.5 shadow-2xl flex items-center gap-3 border-2 border-neutral-300 focus-within:border-blue-600 transition-colors"
                >
                  <input
                    id="cw-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchMode === 'smart_plus'
                        ? "Ask Smart AI: 'Which Armed Services members bought defense stocks before NDAA?' (Press Enter)"
                        : "Search 539 Lawmakers, Bills (H.R. 8070), Tickers (NVDA), or Solicitations (Live Filtering)..."
                    }
                    className="flex-1 py-3 px-4 text-neutral-950 text-base focus:outline-none font-bold placeholder:font-medium placeholder:text-neutral-400"
                  />

                  {/* Proportional Dual-Pill Slider Toggle (Basic vs AI) */}
                  <SearchModeToggle
                    mode={searchMode}
                    onChange={(m) => setSearchMode(m)}
                  />

                  {/* Bold Black Magnifying Glass (No background box, proportional size) */}
                  <button 
                    id="cw-search-submit-btn" 
                    type="submit" 
                    className="p-2.5 rounded-full hover:bg-neutral-100 text-black hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0"
                    title={searchMode === 'smart_plus' ? "Run Smart AI Search" : "Search Bills"}
                  >
                    <svg className="w-6 h-6 text-black stroke-[3.2]" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m21 21-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </form>

                {/* Bigger Trending Legislation Section: White Background, Black Bold Text */}
                <div id="cw-trending-container" className="pt-6 max-w-4xl mx-auto">
                  <div className="text-xs uppercase font-black tracking-widest text-neutral-400 mb-3">
                    Trending Federal Legislation
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button 
                      id="cw-trending-pill"
                      onClick={() => { setSearchQuery('NDAA FY2025'); }} 
                      className="bg-white hover:bg-neutral-100 text-black font-extrabold px-4 py-2 rounded-full border-2 border-neutral-300 shadow-sm text-sm transition-all hover:scale-105 cursor-pointer"
                    >
                      #NDAA FY2025 (H.R. 8070)
                    </button>
                    <button 
                      id="cw-trending-pill"
                      onClick={() => { setSearchQuery('Consolidated Appropriations'); }} 
                      className="bg-white hover:bg-neutral-100 text-black font-extrabold px-4 py-2 rounded-full border-2 border-neutral-300 shadow-sm text-sm transition-all hover:scale-105 cursor-pointer"
                    >
                      #Appropriations Package (P.L. 118-47)
                    </button>
                    <button 
                      id="cw-trending-pill"
                      onClick={() => { setSearchQuery('Foreign Adversary App Act'); }} 
                      className="bg-white hover:bg-neutral-100 text-black font-extrabold px-4 py-2 rounded-full border-2 border-neutral-300 shadow-sm text-sm transition-all hover:scale-105 cursor-pointer"
                    >
                      #Foreign Adversary Apps (P.L. 118-50)
                    </button>
                    <button 
                      id="cw-trending-pill"
                      onClick={() => { setSearchQuery('Critical Minerals'); }} 
                      className="bg-white hover:bg-neutral-100 text-black font-extrabold px-4 py-2 rounded-full border-2 border-neutral-300 shadow-sm text-sm transition-all hover:scale-105 cursor-pointer"
                    >
                      #Critical Minerals Supply Chain
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* OpenSecrets Style Executive Stat Blocks */}
            <section className="max-w-6xl mx-auto px-6 -mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div id="cw-stat-card" className="bg-white p-5 rounded-xl border-2 border-neutral-200 shadow-md border-t-4 border-t-blue-600">
                  <div className="text-xs uppercase font-black tracking-wider text-neutral-600">118th Congress Appropriations</div>
                  <div className="text-3xl font-black text-neutral-950 mt-1.5 tabular-nums">$851.6B</div>
                  <div className="text-sm text-emerald-700 font-bold mt-1.5">Enacted FY2024 Package</div>
                </div>
                <div id="cw-stat-card" className="bg-white p-5 rounded-xl border-2 border-neutral-200 shadow-md border-t-4 border-t-amber-500">
                  <div className="text-xs uppercase font-black tracking-wider text-neutral-600">Active SAM.gov Solicitations</div>
                  <div className="text-3xl font-black text-neutral-950 mt-1.5 tabular-nums">4,280 Bids</div>
                  <div className="text-sm text-neutral-600 font-semibold mt-1.5">Matched to Statutory Mandates</div>
                </div>
                <div id="cw-stat-card" className="bg-white p-5 rounded-xl border-2 border-neutral-200 shadow-md border-t-4 border-t-emerald-600">
                  <div className="text-xs uppercase font-black tracking-wider text-neutral-600">Disclosed Congressional Trades</div>
                  <div className="text-3xl font-black text-neutral-950 mt-1.5 tabular-nums">682 Filings</div>
                  <div className="text-sm text-neutral-600 font-semibold mt-1.5">Pelosi, McCaul, Tuberville</div>
                </div>
                <div id="cw-stat-card" className="bg-white p-5 rounded-xl border-2 border-neutral-200 shadow-md border-t-4 border-t-purple-600">
                  <div className="text-xs uppercase font-black tracking-wider text-neutral-600">Verified Members in Database</div>
                  <div className="text-3xl font-black text-neutral-950 mt-1.5 tabular-nums">539 Lawmakers</div>
                  <div className="text-sm text-neutral-600 font-semibold mt-1.5">100 Senators • 439 Reps</div>
                </div>
              </div>
            </section>

            {/* Bi-Directional Parallax Rails */}
            <section id="cw-marquee-section" className="my-14 overflow-hidden bg-neutral-950 py-8 border-y-2 border-neutral-800">
              <div className="max-w-6xl mx-auto px-6 mb-4 flex items-center justify-between text-white">
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-200">
                  Capitol Roll Call: 539 Sitting Lawmakers
                </h3>
                <span className="text-xs font-bold text-neutral-400">Continuous Opposing Partisan Parallax Rails</span>
              </div>

              {/* Row 1: Leftward Parallax (Democrats) */}
              <div className="overflow-hidden py-1.5">
                <div className="animate-marquee-left flex gap-4">
                  {(members.filter(m => m.party === 'Democrat').slice(0, 20).concat(members.filter(m => m.party === 'Democrat').slice(0, 20))).map((m, i) => (
                    <div
                      key={i}
                      id="cw-lawmaker-card"
                      onClick={() => setSelectedMemberId(m.bioguide_id)}
                      className="cursor-pointer hover:scale-105 transition-transform p-3 rounded-xl border-2 flex items-center gap-3.5 shrink-0 w-72 bg-blue-950/40 border-blue-900/60 text-blue-200 shadow-sm"
                    >
                      <LawmakerAvatar 
                        bioguideId={m.bioguide_id} 
                        name={`${m.first_name} ${m.last_name}`} 
                        party={m.party} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shrink-0 shadow-sm" 
                      />
                      <div className="truncate text-sm">
                        <div className="font-extrabold text-white truncate text-base">{m.first_name} {m.last_name}</div>
                        <div className="text-neutral-300 font-semibold text-xs">{m.state} {m.district ? `-${m.district}` : ''} • {m.chamber === 'senate' ? 'Senator' : 'Representative'}</div>
                        <div className="text-blue-300 font-bold text-xs mt-0.5">{m.total_terms_years} Years in Congress</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 2: Rightward Parallax (Republicans) */}
              <div className="overflow-hidden py-1.5 mt-2">
                <div className="animate-marquee-right flex gap-4">
                  {(members.filter(m => m.party === 'Republican').slice(0, 20).concat(members.filter(m => m.party === 'Republican').slice(0, 20))).map((m, i) => (
                    <div
                      key={i}
                      id="cw-lawmaker-card"
                      onClick={() => setSelectedMemberId(m.bioguide_id)}
                      className="cursor-pointer hover:scale-105 transition-transform p-3 rounded-xl border-2 flex items-center gap-3.5 shrink-0 w-72 bg-red-950/40 border-red-900/60 text-red-200 shadow-sm"
                    >
                      <LawmakerAvatar 
                        bioguideId={m.bioguide_id} 
                        name={`${m.first_name} ${m.last_name}`} 
                        party={m.party} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shrink-0 shadow-sm" 
                      />
                      <div className="truncate text-sm">
                        <div className="font-extrabold text-white truncate text-base">{m.first_name} {m.last_name}</div>
                        <div className="text-neutral-300 font-semibold text-xs">{m.state} {m.district ? `-${m.district}` : ''} • {m.chamber === 'senate' ? 'Senator' : 'Representative'}</div>
                        <div className="text-red-300 font-bold text-xs mt-0.5">{m.total_terms_years} Years in Congress</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* High-Density Research Dossier Table with Standardized IDs */}
            <section className="max-w-6xl mx-auto px-6 pb-20">
              <div id="cw-table-container" className="bg-white border-2 border-neutral-300 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b-2 border-neutral-200 flex flex-wrap items-center justify-between gap-4 bg-[#f8fafc]">
                  <div>
                    <h2 className="text-xl font-black text-neutral-950">Official 118th Congress Legislation</h2>
                    <p className="text-sm font-medium text-neutral-600 mt-0.5">Live statutory records synchronized from Congress.gov and Cloudflare D1.</p>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#f1f5f9] text-neutral-800 font-black uppercase tracking-wider border-b-2 border-neutral-300 text-xs">
                      <tr>
                        <th className="py-3.5 px-4">Bill Number</th>
                        <th className="py-3.5 px-4">Official Title</th>
                        <th className="py-3.5 px-4">Chamber</th>
                        <th className="py-3.5 px-4">Introduced</th>
                        <th className="py-3.5 px-4">Official Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {displayedBills.map((b) => (
                        <tr 
                          key={b.id} 
                          id="cw-table-row"
                          onClick={() => setSelectedBillId(b.id)} 
                          className="cursor-pointer hover:bg-blue-50/50 transition-colors group"
                        >
                          <td className="py-4 px-4 font-mono font-black text-base">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedBillId(b.id); }}
                              className="text-blue-800 hover:text-blue-950 hover:underline text-left cursor-pointer"
                            >
                              {b.bill_type ? b.bill_type.toUpperCase() : 'H.R.'} {b.bill_number}
                            </button>
                          </td>
                          <td className="py-4 px-4 max-w-md">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedBillId(b.id); }}
                              className="font-extrabold text-neutral-950 group-hover:text-blue-700 hover:underline text-left text-base leading-snug cursor-pointer block"
                            >
                              {b.title}
                            </button>
                            {b.short_title && (
                              <div className="text-neutral-600 text-xs font-semibold mt-1">Short title: {b.short_title}</div>
                            )}
                          </td>
                          <td className="py-4 px-4 uppercase font-bold text-neutral-800">
                            {b.bill_type?.startsWith('s') ? 'Senate' : 'House'}
                          </td>
                          <td className="py-4 px-4 text-neutral-700 font-mono text-sm whitespace-nowrap">{b.introduced_date}</td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span id="cw-status-badge" className="inline-block whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-400 shadow-2xs">
                              {b.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBillId(b.id);
                              }}
                              className="bg-neutral-100 group-hover:bg-blue-700 group-hover:text-white text-neutral-900 font-bold px-3 py-1.5 rounded-md text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              View Dossier
                              <ExternalLinkIcon className="w-3.5 h-3.5 opacity-70" />
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
        <div id="cw-chat-drawer" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
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
                className="text-neutral-400 hover:text-white p-1 text-sm font-semibold flex items-center gap-1 cursor-pointer"
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
                  <div className="font-bold text-neutral-200 text-sm">What would you like to investigate?</div>
                  <p className="max-w-xs mx-auto text-neutral-400 text-xs font-medium">
                    Ask questions across 118th Congress bills, member insider stock trades, or SAM.gov procurement bids.
                  </p>
                </div>
              ) : (
                chatMessages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="text-[10px] font-bold text-neutral-400 mb-1">{m.role === 'user' ? 'You' : 'CongressWatch AI'}</div>
                    <div className={`p-3.5 rounded-lg max-w-md text-sm leading-relaxed font-medium ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-100'
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
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
              />
              <button
                type="submit"
                disabled={isAiLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <SendIcon className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer className="bg-[#0a192f] text-neutral-300 py-14 px-6 border-t-2 border-neutral-800 text-sm mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <img 
                src="/brand/logo.png" 
                alt="Congress Watch Logo" 
                style={{ height: '36px', width: 'auto' }}
              />
              <span className="text-white font-black text-base tracking-wide">CongressWatch Platform</span>
            </div>
            <p className="max-w-md text-neutral-400 font-medium text-xs leading-relaxed">
              Non-partisan civic intelligence synthesizing Congress.gov, SAM.gov, Senate eFD, and the Federal Register on the edge.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 font-bold text-sm text-neutral-200">
            <a href="/api-docs" className="hover:text-white transition-colors">Developer API</a>
            <a href="/procurement" className="hover:text-white transition-colors">Contracts</a>
            <a href="/fantasy" className="hover:text-white transition-colors">Fantasy Congress</a>
            <a href="https://discord.gg/vXkPvAkuvN" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white hover:text-blue-300 transition-colors" title="Join CongressWatch Discord">
              <DiscordIcon className="w-5 h-5 text-white" />
              <span>Discord</span>
            </a>
            <a href="https://buymeacoffee.com/postdated" target="_blank" rel="noopener noreferrer" className="hover:opacity-90 transition-opacity shrink-0" title="Donate via Buy Me a Coffee">
              <img src="/brand/bmac-button.png" alt="Buy Me A Coffee" style={{ height: "36px", width: "auto" }} className="rounded-lg shadow-sm" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

