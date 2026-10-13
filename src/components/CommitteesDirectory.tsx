import React, { useState, useEffect, useMemo } from 'react';
import { SearchIcon, SparklesIcon, ExternalLinkIcon, CapitolIcon } from './Icons';

export interface CommitteesDirectoryProps {
  onSelectMember: (bioguideId: string) => void;
  onAskAi: (prompt: string) => void;
}

export const CommitteesDirectory: React.FC<CommitteesDirectoryProps> = ({
  onSelectMember,
  onAskAi
}) => {
  const [committees, setCommittees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chamberFilter, setChamberFilter] = useState<'all' | 'house' | 'senate'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/committees')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCommittees(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Committees fetch fallback:', err);
        setLoading(false);
      });
  }, []);

  const filteredCommittees = useMemo(() => {
    return committees.filter(c => {
      if (chamberFilter !== 'all' && c.chamber !== chamberFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.id && c.id.toLowerCase().includes(q)) ||
          (c.code && c.code.toLowerCase().includes(q)) ||
          (c.jurisdiction && c.jurisdiction.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [committees, chamberFilter, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-satoshi text-neutral-900 space-y-10">
      {/* Page Header */}
      <div className="bg-white border-2 border-neutral-300 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-300 text-xs font-black uppercase tracking-wider text-blue-800">
            <CapitolIcon className="w-4 h-4 text-blue-700" />
            Congressional Oversight & Markup Jurisdiction
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
            Congressional Committees
          </h1>
          <p className="text-neutral-600 text-base font-medium max-w-2xl">
            Explore standing legislative committees in the House and Senate, committee leadership, jurisdictional boundaries, and oversight agendas.
          </p>
        </div>
        <div className="p-5 bg-neutral-900 text-white rounded-xl border border-neutral-800 shrink-0 text-center space-y-1">
          <div className="text-xs uppercase font-extrabold tracking-wider text-neutral-400">Standing Committees</div>
          <div className="text-4xl font-black tabular-nums text-blue-400">{committees.length}</div>
          <div className="text-xs text-neutral-300 font-semibold">House & Senate Panels</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-neutral-300 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <SearchIcon className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter committees by name, code (HASC, SFRC), or jurisdiction..."
            className="w-full pl-12 pr-4 py-3 bg-[#f8fafc] border-2 border-neutral-300 rounded-xl text-base font-bold text-neutral-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:font-medium placeholder:text-neutral-400"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs font-bold">
          <button
            onClick={() => setChamberFilter('all')}
            className={`px-3.5 py-2 rounded-lg border transition-colors cursor-pointer ${
              chamberFilter === 'all' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-[#f8fafc] text-neutral-700 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            All Panels
          </button>
          <button
            onClick={() => setChamberFilter('house')}
            className={`px-3.5 py-2 rounded-lg border transition-colors cursor-pointer ${
              chamberFilter === 'house' ? 'bg-blue-700 text-white border-blue-700' : 'bg-[#f8fafc] text-neutral-700 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            House Committees
          </button>
          <button
            onClick={() => setChamberFilter('senate')}
            className={`px-3.5 py-2 rounded-lg border transition-colors cursor-pointer ${
              chamberFilter === 'senate' ? 'bg-blue-700 text-white border-blue-700' : 'bg-[#f8fafc] text-neutral-700 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            Senate Committees
          </button>
        </div>
      </div>

      {/* Committee Cards Grid */}
      {loading ? (
        <div className="p-20 text-center font-bold text-neutral-600">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading Congressional committees from edge...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCommittees.map(c => (
            <div
              key={c.id}
              className="bg-white border-2 border-neutral-300 rounded-2xl p-6 shadow-sm hover:border-blue-600 transition-all flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-neutral-100 border border-neutral-300 text-neutral-800 font-mono">
                    {c.id} • {c.chamber.toUpperCase()}
                  </span>
                  {c.website_url && (
                    <a
                      href={c.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Official Portal</span>
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <h3 className="text-2xl font-black text-neutral-950 leading-tight">
                  {c.name}
                </h3>

                <p className="text-sm font-medium text-neutral-700 leading-relaxed">
                  {c.jurisdiction}
                </p>
              </div>

              {/* Leadership Bar */}
              <div className="pt-4 border-t border-neutral-200 grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#f8fafc] rounded-xl border border-neutral-200 space-y-1">
                  <div className="font-black uppercase tracking-wider text-neutral-500 text-[10px]">Committee Chair</div>
                  {c.chair_bioguide_id ? (
                    <button
                      onClick={() => onSelectMember(c.chair_bioguide_id)}
                      className="font-extrabold text-neutral-950 hover:text-blue-700 text-left text-sm cursor-pointer block truncate"
                    >
                      {c.chair_first} {c.chair_last} ({c.chair_party?.[0] || 'R'}-{c.chair_state})
                    </button>
                  ) : (
                    <div className="font-bold text-neutral-800">Chairman Disclosed</div>
                  )}
                </div>
                <div className="p-3 bg-[#f8fafc] rounded-xl border border-neutral-200 space-y-1">
                  <div className="font-black uppercase tracking-wider text-neutral-500 text-[10px]">Ranking Member</div>
                  {c.ranking_member_bioguide_id ? (
                    <button
                      onClick={() => onSelectMember(c.ranking_member_bioguide_id)}
                      className="font-extrabold text-neutral-950 hover:text-blue-700 text-left text-sm cursor-pointer block truncate"
                    >
                      {c.ranking_first} {c.ranking_last} ({c.ranking_party?.[0] || 'D'}-{c.ranking_state})
                    </button>
                  ) : (
                    <div className="font-bold text-neutral-800">Ranking Member Disclosed</div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end">
                <button
                  onClick={() => onAskAi(`Analyze legislative oversight, jurisdiction, and pending bills before the ${c.name}.`)}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-blue-600 text-white rounded text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <SparklesIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ask AI Oversight</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
