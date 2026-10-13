import React, { useState, useMemo } from 'react';
import { LawmakerAvatar } from './LawmakerAvatar';
import { SearchIcon, SparklesIcon, CapitolIcon, ExternalLinkIcon } from './Icons';
import { validateRosterMath } from '../lib/validation';

export interface LawmakersDirectoryProps {
  members: any[];
  onSelectMember: (bioguideId: string) => void;
  onAskAi: (prompt: string) => void;
}

export const LawmakersDirectory: React.FC<LawmakersDirectoryProps> = ({
  members,
  onSelectMember,
  onAskAi
}) => {
  const [search, setSearch] = useState('');
  const [chamberFilter, setChamberFilter] = useState<'all' | 'senate' | 'house'>('all');
  const [partyFilter, setPartyFilter] = useState<'all' | 'Democrat' | 'Republican' | 'Independent'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'tenure' | 'state'>('name');

  const filteredMembers = useMemo(() => {
    let list = [...members];
    if (chamberFilter !== 'all') {
      list = list.filter(m => m.chamber === chamberFilter);
    }
    if (partyFilter !== 'all') {
      list = list.filter(m => m.party === partyFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => 
        (m.first_name && m.first_name.toLowerCase().includes(q)) ||
        (m.last_name && m.last_name.toLowerCase().includes(q)) ||
        (m.state && m.state.toLowerCase().includes(q)) ||
        (m.district && String(m.district).includes(q)) ||
        (m.bioguide_id && m.bioguide_id.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'tenure') {
        return (b.total_terms_years || 0) - (a.total_terms_years || 0);
      }
      if (sortBy === 'state') {
        return (a.state || '').localeCompare(b.state || '');
      }
      return (a.last_name || '').localeCompare(b.last_name || '');
    });
    return list;
  }, [members, chamberFilter, partyFilter, search, sortBy]);

  const rosterStats = useMemo(() => validateRosterMath(members), [members]);
  const { democrats: demsCount, republicans: gopCount, senate: senateCount, house: houseCount, total: totalCount } = rosterStats;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-satoshi text-neutral-900 space-y-10">
      {/* Page Header Banner */}
      <div className="bg-white border-2 border-neutral-300 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-xs font-black uppercase tracking-wider text-neutral-700">
            <CapitolIcon className="w-4 h-4 text-neutral-700" />
            118th Congress Congressional Roll Call
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
            Sitting Lawmakers Directory
          </h1>
          <p className="text-neutral-600 text-base font-medium max-w-2xl">
            Verified legislative roster of 539 sitting members across the Senate and House of Representatives with voting records, committee assignments, and financial disclosures.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <div className="text-2xl font-black text-blue-800 tabular-nums">{demsCount}</div>
            <div className="text-xs font-bold text-blue-900">Democrats</div>
          </div>
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-center">
            <div className="text-2xl font-black text-red-800 tabular-nums">{gopCount}</div>
            <div className="text-xs font-bold text-red-900">Republicans</div>
          </div>
          <div className="p-3.5 bg-neutral-100 border border-neutral-300 rounded-xl text-center">
            <div className="text-2xl font-black text-neutral-900 tabular-nums">{senateCount}</div>
            <div className="text-xs font-bold text-neutral-700">Senators</div>
          </div>
          <div className="p-3.5 bg-neutral-100 border border-neutral-300 rounded-xl text-center">
            <div className="text-2xl font-black text-neutral-900 tabular-nums">{houseCount}</div>
            <div className="text-xs font-bold text-neutral-700">Representatives</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border-2 border-neutral-300 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <SearchIcon className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by lawmaker name, state (CA, TX), district, or bioguide ID..."
              className="w-full pl-12 pr-4 py-3 bg-[#f8fafc] border-2 border-neutral-300 rounded-xl text-base font-bold text-neutral-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:font-medium placeholder:text-neutral-400"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-black uppercase text-neutral-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#f8fafc] border-2 border-neutral-300 rounded-lg px-3 py-2 text-xs font-bold text-neutral-900 focus:outline-none"
            >
              <option value="name">Last Name (A-Z)</option>
              <option value="tenure">Longest Tenure</option>
              <option value="state">State</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-200 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black uppercase text-neutral-500 mr-1">Chamber:</span>
            {(['all', 'senate', 'house'] as const).map(c => (
              <button
                key={c}
                onClick={() => setChamberFilter(c)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors cursor-pointer border ${
                  chamberFilter === c
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-[#f8fafc] text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {c === 'all' ? 'All Chambers' : c}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black uppercase text-neutral-500 mr-1">Party:</span>
            {(['all', 'Democrat', 'Republican', 'Independent'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPartyFilter(p)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer border ${
                  partyFilter === p
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-[#f8fafc] text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {p === 'all' ? 'All Parties' : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lawmaker Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-600 font-bold px-1">
          <span>Showing {filteredMembers.length} of {totalCount} sitting lawmakers</span>
          <span>Click any lawmaker to open full dossier</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((m) => {
            const isDem = m.party === 'Democrat';
            const isGop = m.party === 'Republican';
            const partyBorder = isDem ? 'border-blue-600' : (isGop ? 'border-red-600' : 'border-purple-600');
            const partyBg = isDem ? 'bg-blue-600 text-white' : (isGop ? 'bg-red-600 text-white' : 'bg-purple-600 text-white');

            return (
              <div
                key={m.bioguide_id}
                onClick={() => onSelectMember(m.bioguide_id)}
                className="cursor-pointer bg-white border-2 border-neutral-300 hover:border-blue-600 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between gap-4 group hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <LawmakerAvatar
                      bioguideId={m.bioguide_id}
                      name={`${m.first_name} ${m.last_name}`}
                      party={m.party}
                      className={`w-20 h-24 rounded-xl object-cover border-3 ${partyBorder} shadow-sm group-hover:scale-102 transition-transform`}
                    />
                    <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs ${partyBg}`}
                    >
                      {m.party === 'Democrat' ? 'DEM' : (m.party === 'Republican' ? 'GOP' : 'IND')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1 pt-0.5">
                    <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
                      {m.bioguide_id} • {m.chamber === 'senate' ? 'Senate' : 'House'}
                    </div>
                    <h3 className="text-lg font-black text-neutral-950 group-hover:text-blue-700 transition-colors truncate leading-tight">
                      {m.first_name} {m.last_name}
                    </h3>
                    <p className="text-xs font-extrabold text-neutral-800 truncate">
                      {m.state} {m.district ? `-${m.district}` : ''} • {m.chamber === 'senate' ? 'Senator' : 'Representative'}
                    </p>
                    <div className="text-[11px] font-bold text-neutral-600">
                      {m.total_terms_years || 2} Years in Congress
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-900">
                  <span className="inline-flex items-center gap-1">
                    View Dossier & Trades
                    <ExternalLinkIcon className="w-3 h-3" />
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskAi(`Analyze voting record, committees, and stock transactions for ${m.first_name} ${m.last_name} (${m.party}-${m.state})`);
                    }}
                    className="px-2 py-1 bg-neutral-100 hover:bg-blue-600 hover:text-white text-neutral-700 rounded text-[11px] font-black transition-colors flex items-center gap-1"
                  >
                    <SparklesIcon className="w-3 h-3 text-blue-500" />
                    Ask AI
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
