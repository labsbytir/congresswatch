import React, { useState } from 'react';
import { StickyHeader } from './components/StickyHeader';

export default function App() {
  const [searchMode, setSearchMode] = useState<'classic' | 'smart_plus'>('classic');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'bills' | 'members' | 'trades' | 'contracts'>('bills');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sample data modeling the D1 database responses
  const mockBills = [
    {
      id: '118-hr-1234',
      number: 'H.R. 1234',
      title: 'Quantum Computing & Post-Quantum Cryptography Infrastructure Act',
      sponsor: 'Rep. Michael McCaul (R-TX)',
      chamber: 'House',
      introduced: '2024-03-14',
      status: 'Reported by Committee',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
      passageProb: '78%',
      appropriations: '$1.4B',
      naics: '541715 (Quantum R&D)',
      sponsorsParty: 'Bipartisan (14 R, 11 D)'
    },
    {
      id: '118-s-2226',
      number: 'S. 2226',
      title: 'National Defense Authorization Act for Fiscal Year 2025 (NDAA)',
      sponsor: 'Sen. Jack Reed (D-RI)',
      chamber: 'Senate',
      introduced: '2024-06-21',
      status: 'Passed Senate',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      passageProb: '96%',
      appropriations: '$849.8B',
      naics: '336411 (Aircraft / Defense)',
      sponsorsParty: 'Bipartisan (38 D, 34 R)'
    },
    {
      id: '118-hr-5376',
      number: 'H.R. 5376',
      title: 'Critical Mineral Independence & Domestic Supply Chain Security Act',
      sponsor: 'Rep. Cathy McMorris Rodgers (R-WA)',
      chamber: 'House',
      introduced: '2024-04-18',
      status: 'Referred to Energy & Commerce',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
      passageProb: '52%',
      appropriations: '$450M',
      naics: '212299 (Rare Earth Mining)',
      sponsorsParty: 'Partisan (22 R, 3 D)'
    }
  ];

  const mockMembers = [
    { name: 'Rep. Alexandria Ocasio-Cortez', party: 'D', state: 'NY-14', bills: 48, netWorth: '$125K', terms: 3 },
    { name: 'Rep. Michael McCaul', party: 'R', state: 'TX-10', bills: 112, netWorth: '$125.8M', terms: 10 },
    { name: 'Sen. Mark Warner', party: 'D', state: 'VA', bills: 84, netWorth: '$215.2M', terms: 3 },
    { name: 'Sen. Dan Sullivan', party: 'R', state: 'AK', bills: 64, netWorth: '$5.4M', terms: 2 },
    { name: 'Rep. Ro Khanna', party: 'D', state: 'CA-17', bills: 92, netWorth: '$48.1M', terms: 4 },
    { name: 'Sen. Ted Cruz', party: 'R', state: 'TX', bills: 79, netWorth: '$4.6M', terms: 2 }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 font-satoshi flex flex-col">
      {/* Sticky Black Header with Logo and Satoshi Font */}
      <StickyHeader
        searchMode={searchMode}
        onToggleSearchMode={(mode) => setSearchMode(mode)}
      />

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Collapsible Conversational Workspace Drawer (Left Sidebar) */}
        <aside className={`transition-all duration-300 border-r border-neutral-200 bg-white ${
          isDrawerOpen ? 'w-72' : 'w-12'
        } flex flex-col shrink-0`}>
          <div className="p-2 border-b border-neutral-200 flex items-center justify-between">
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-md transition-colors"
              title="Toggle Research Sessions Drawer"
            >
              {isDrawerOpen ? '◀ Collapse' : '▶'}
            </button>
            {isDrawerOpen && (
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">History & Sessions</span>
            )}
          </div>

          {isDrawerOpen ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
              <div>
                <h4 className="font-bold text-neutral-400 uppercase tracking-wider mb-2">Today</h4>
                <div className="space-y-1">
                  <a href="#" className="block p-2 rounded hover:bg-neutral-100 text-neutral-700 font-medium truncate">
                    💬 Quantum Cryptography Appropriations
                  </a>
                  <a href="#" className="block p-2 rounded hover:bg-neutral-100 text-neutral-700 font-medium truncate">
                    🔍 NDAA Defense Amendments
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-neutral-400 uppercase tracking-wider mb-2">Previous 7 Days</h4>
                <div className="space-y-1">
                  <a href="#" className="block p-2 rounded hover:bg-neutral-100 text-neutral-700 font-medium truncate">
                    💬 Senate Armed Services Trades
                  </a>
                  <a href="#" className="block p-2 rounded hover:bg-neutral-100 text-neutral-700 font-medium truncate">
                    🔍 SAM.gov Biotech Opportunities
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <button className="w-full bg-[#0a192f] text-white py-2 rounded font-semibold hover:bg-neutral-800 transition-colors">
                  + New Research Chat
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center py-4 space-y-4 text-neutral-400">
              <span title="Open Drawer" className="cursor-pointer" onClick={() => setIsDrawerOpen(true)}>💬</span>
              <span title="Search History" className="cursor-pointer" onClick={() => setIsDrawerOpen(true)}>🕒</span>
              <span title="Saved Bills" className="cursor-pointer" onClick={() => setIsDrawerOpen(true)}>⭐</span>
            </div>
          )}
        </aside>

        {/* Content Body */}
        <main className="flex-1 overflow-x-hidden">
          {/* OpenSecrets Style Hero & Unified Search Header */}
          <section className="bg-[#0a192f] text-white py-12 px-6 border-b-4 border-blue-600 shadow-inner">
            <div className="max-w-5xl mx-auto text-center space-y-4">
              <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800">
                Investigative Legislative Intelligence
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Tracking Federal Power, Policy & Contracts
              </h1>
              <p className="text-neutral-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                Connect congressional legislation to real-world corporate lobbying, insider stock transactions, and federal SAM.gov procurement contracts.
              </p>

              {/* Universal Search Bar */}
              <div className="max-w-3xl mx-auto mt-6 bg-white rounded-lg p-2 shadow-2xl flex items-center gap-2 border-2 border-neutral-300 focus-within:border-blue-600 transition-colors">
                <span className="text-neutral-400 pl-3">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchMode === 'smart_plus'
                      ? "Ask CongressWatch AI: 'Which lawmakers on Armed Services bought defense stock before the NDAA vote?'"
                      : "Search by Bill (H.R. 1234), Lawmaker, Ticker (NVDA), or Contract Solicitation..."
                  }
                  className="flex-1 py-2 px-2 text-neutral-900 text-sm focus:outline-none font-medium"
                />
                <button
                  onClick={() => setSearchMode(searchMode === 'classic' ? 'smart_plus' : 'classic')}
                  className={`text-xs px-3 py-2 rounded font-semibold transition-all shrink-0 ${
                    searchMode === 'smart_plus'
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {searchMode === 'smart_plus' ? '✨ Smart+ Active' : 'Classic Mode'}
                </button>
                <button className="bg-[#1e40af] hover:bg-blue-700 text-white px-5 py-2 rounded font-bold text-sm transition-colors shrink-0">
                  Search
                </button>
              </div>

              {/* Search Category Pills (OpenSecrets Style) */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-neutral-300">
                <span className="font-semibold text-neutral-400">Popular Focus:</span>
                <button className="hover:text-white bg-neutral-800/80 px-2.5 py-1 rounded border border-neutral-700">#NDAA FY2025</button>
                <button className="hover:text-white bg-neutral-800/80 px-2.5 py-1 rounded border border-neutral-700">#Quantum Infrastructure</button>
                <button className="hover:text-white bg-neutral-800/80 px-2.5 py-1 rounded border border-neutral-700">#Semiconductor Export Controls</button>
                <button className="hover:text-white bg-neutral-800/80 px-2.5 py-1 rounded border border-neutral-700">#Defense Procurement</button>
              </div>
            </div>
          </section>

          {/* OpenSecrets Style Executive Stat Blocks */}
          <section className="max-w-6xl mx-auto px-6 -mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm border-t-4 border-t-blue-600">
                <div className="text-xs uppercase font-bold text-neutral-500">118th Congress Appropriations</div>
                <div className="text-2xl font-black text-neutral-900 mt-1 tabular-nums">$851.6B</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">↑ 12 Major Funding Bills</div>
              </div>
              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm border-t-4 border-t-amber-500">
                <div className="text-xs uppercase font-bold text-neutral-500">Active SAM.gov Solicitations</div>
                <div className="text-2xl font-black text-neutral-900 mt-1 tabular-nums">4,280 Bids</div>
                <div className="text-xs text-neutral-600 font-medium mt-1">Linked to Statutory Mandates</div>
              </div>
              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm border-t-4 border-t-emerald-600">
                <div className="text-xs uppercase font-bold text-neutral-500">Disclosed Congressional Trades</div>
                <div className="text-2xl font-black text-neutral-900 mt-1 tabular-nums">682 Filings</div>
                <div className="text-xs text-neutral-600 font-medium mt-1">$44.8M Total Volume (2024)</div>
              </div>
              <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm border-t-4 border-t-purple-600">
                <div className="text-xs uppercase font-bold text-neutral-500">AI Predictive Accuracy</div>
                <div className="text-2xl font-black text-neutral-900 mt-1 tabular-nums">89.4%</div>
                <div className="text-xs text-neutral-600 font-medium mt-1">Committee Passage Modeling</div>
              </div>
            </div>
          </section>

          {/* Bi-Directional Parallax Congress Member Photo Rails */}
          <section className="my-12 overflow-hidden bg-neutral-900 py-6 border-y border-neutral-800">
            <div className="max-w-6xl mx-auto px-6 mb-4 flex items-center justify-between text-white">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
                Capitol Roll Call & Active Lawmakers
              </h3>
              <span className="text-xs text-neutral-400">Continuous Opposing Parallax Rails</span>
            </div>

            {/* Row 1: Leftward Parallax (Democrat Blue Tint) */}
            <div className="overflow-hidden py-1">
              <div className="animate-marquee-left flex gap-4">
                {[...mockMembers, ...mockMembers].map((m, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border flex items-center gap-3 shrink-0 w-64 ${
                      m.party === 'D'
                        ? 'bg-blue-950/40 border-blue-900/60 text-blue-200'
                        : 'bg-red-950/40 border-red-900/60 text-red-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      m.party === 'D' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {m.party}
                    </div>
                    <div className="truncate text-xs">
                      <div className="font-bold text-white truncate">{m.name}</div>
                      <div className="text-neutral-400">{m.state} • {m.terms} Terms</div>
                      <div className="text-neutral-300 font-mono">Net Worth: {m.netWorth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Rightward Parallax (Republican Red Tint) */}
            <div className="overflow-hidden py-1 mt-2">
              <div className="animate-marquee-right flex gap-4">
                {[...mockMembers.reverse(), ...mockMembers].map((m, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border flex items-center gap-3 shrink-0 w-64 ${
                      m.party === 'R'
                        ? 'bg-red-950/40 border-red-900/60 text-red-200'
                        : 'bg-blue-950/40 border-blue-900/60 text-blue-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      m.party === 'R' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {m.party}
                    </div>
                    <div className="truncate text-xs">
                      <div className="font-bold text-white truncate">{m.name}</div>
                      <div className="text-neutral-400">{m.state} • {m.bills} Bills Sponsored</div>
                      <div className="text-neutral-300 font-mono">Net Worth: {m.netWorth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* OpenSecrets Style High-Density Research Dossier Table */}
          <section className="max-w-6xl mx-auto px-6 pb-16">
            <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4 bg-[#f8fafc]">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Tracked Federal Legislation</h2>
                  <p className="text-xs text-neutral-500">Cross-referenced with appropriations, SAM.gov NAICS codes, and AI passage probability.</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button className="px-3 py-1.5 rounded font-semibold bg-[#0a192f] text-white">All Bills</button>
                  <button className="px-3 py-1.5 rounded font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700">Appropriations</button>
                  <button className="px-3 py-1.5 rounded font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700">Contract-Linked</button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f1f5f9] text-neutral-700 font-bold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Bill Number</th>
                      <th className="py-3 px-4">Title & Details</th>
                      <th className="py-3 px-4">Sponsor & Chamber</th>
                      <th className="py-3 px-4">Funding / SOW</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">AI Passage %</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {mockBills.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{b.number}</td>
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="font-semibold text-neutral-900">{b.title}</div>
                          <div className="text-neutral-500 text-[11px] mt-0.5">NAICS: {b.naics}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-neutral-800">{b.sponsor}</div>
                          <div className="text-neutral-500 text-[11px]">{b.sponsorsParty}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900">{b.appropriations}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${b.statusColor}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold font-mono text-emerald-600">{b.passageProb}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-2.5 py-1 rounded text-xs transition-colors">
                            View Dossier ↗
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Institutional Footer */}
      <footer className="bg-[#0a192f] text-neutral-400 py-12 px-6 border-t border-neutral-800 text-xs mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <img src="/brand/logo.svg" alt="Congress Watch Logo" className="h-8 w-auto" />
              <span className="text-white font-bold text-sm tracking-wide">CongressWatch Platform</span>
            </div>
            <p className="max-w-md text-neutral-400">
              Non-partisan civic intelligence synthesizing Congress.gov, SAM.gov, Senate eFD, and the Federal Register on the edge.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-neutral-300">
            <a href="/api-docs" className="hover:text-white">Developer API</a>
            <a href="/procurement" className="hover:text-white">SAM.gov Connect</a>
            <a href="/fantasy" className="hover:text-white">Fantasy Congress</a>
            <a href="https://discord.gg/vXkPvAkuvN" className="hover:text-blue-400">Discord Community</a>
            <a href="https://buymeacoffee.com/postdated" className="hover:text-amber-400">Donate</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

