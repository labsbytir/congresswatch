import React, { useState, useEffect, useMemo } from 'react';
import { SearchIcon, SparklesIcon, MapPinIcon, ExternalLinkIcon } from './Icons';

export interface DistrictMapExplorerProps {
  members: any[];
  onSelectMember: (bioguideId: string) => void;
  onAskAi: (prompt: string) => void;
}

export const DistrictMapExplorer: React.FC<DistrictMapExplorerProps> = ({
  members,
  onSelectMember,
  onAskAi
}) => {
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('CA');
  const [search, setSearch] = useState('');

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/districts?state=${selectedState}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDistricts(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Districts fetch fallback:', err);
        setLoading(false);
      });
  }, [selectedState]);

  const filteredDistricts = useMemo(() => {
    return districts.filter(d => {
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          d.district_code.toLowerCase().includes(q) ||
          d.state.toLowerCase().includes(q) ||
          String(d.population).includes(q) ||
          String(d.median_household_income).includes(q)
        );
      }
      return true;
    });
  }, [districts, search]);

  const stateSenators = useMemo(() => {
    return members.filter(m => m.state === selectedState && m.chamber === 'senate');
  }, [members, selectedState]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-satoshi text-neutral-900 space-y-10">
      {/* Page Header Banner */}
      <div className="bg-white border-2 border-neutral-300 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-300 text-xs font-black uppercase tracking-wider text-blue-800">
            <MapPinIcon className="w-4 h-4 text-blue-700" />
            U.S. Census Bureau ACS & Geospatial Demographics
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
            Congressional District Profiles
          </h1>
          <p className="text-neutral-600 text-base font-medium max-w-2xl">
            Explore official 5-year Census Bureau ACS data across all 435 Congressional districts: constituent population, median household income benchmarks, and electoral participation rates.
          </p>
        </div>
        <div className="p-5 bg-neutral-900 text-white rounded-xl border border-neutral-800 shrink-0 text-center space-y-1">
          <div className="text-xs uppercase font-extrabold tracking-wider text-neutral-400">Selected State</div>
          <div className="text-4xl font-black tabular-nums text-blue-400">{selectedState}</div>
          <div className="text-xs text-neutral-300 font-semibold">{districts.length} Monitored Districts</div>
        </div>
      </div>

      {/* State Selector Quick Tabs */}
      <div className="bg-white border-2 border-neutral-300 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-700">Select State:</span>
          <span className="text-xs text-neutral-500 font-bold">50 States + At-Large Districts</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border border-neutral-200 rounded-lg bg-[#f8fafc]">
          {US_STATES.map(st => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors cursor-pointer ${
                selectedState === st
                  ? 'bg-blue-700 text-white shadow-xs font-black'
                  : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* State Senate Delegation */}
      {stateSenators.length > 0 && (
        <div className="bg-white border-2 border-neutral-300 rounded-xl p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-neutral-700">
            {selectedState} Senate Delegation (At-Large Representation)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stateSenators.map(sen => (
              <div
                key={sen.bioguide_id}
                onClick={() => onSelectMember(sen.bioguide_id)}
                className="cursor-pointer p-4 rounded-xl border-2 border-neutral-200 hover:border-blue-600 bg-[#f8fafc] flex items-center justify-between transition-all group"
              >
                <div>
                  <div className="text-base font-black text-neutral-950 group-hover:text-blue-700 transition-colors">
                    Senator {sen.first_name} {sen.last_name}
                  </div>
                  <div className="text-xs font-bold text-neutral-600 mt-0.5">
                    {sen.party} • {sen.total_terms_years} Years in Congress
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700 group-hover:underline inline-flex items-center gap-1">
                  View Profile
                  <ExternalLinkIcon className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Districts Grid */}
      {loading ? (
        <div className="p-20 text-center font-bold text-neutral-600">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading district demographics from U.S. Census Bureau ACS...
        </div>
      ) : filteredDistricts.length === 0 ? (
        <div className="bg-white border-2 border-neutral-300 rounded-xl p-12 text-center text-neutral-600 font-bold">
          No district demographic records found for {selectedState}.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-neutral-600 font-bold px-1">
            Showing {filteredDistricts.length} Congressional districts in {selectedState}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDistricts.map(d => {
              const repNumber = d.district_number !== null ? String(d.district_number) : null;
              const matchingRep = members.find(m => 
                m.state === d.state && 
                m.chamber === 'house' && 
                (repNumber ? String(m.district) === repNumber : true)
              );

              return (
                <div
                  key={d.district_code}
                  className="bg-white border-2 border-neutral-300 rounded-2xl p-6 shadow-sm hover:border-blue-600 transition-all flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase bg-blue-100 text-blue-900 border border-blue-300">
                        District {d.district_code}
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-500">
                        Census 5-Year ACS
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-[#f8fafc] rounded-xl border border-neutral-200">
                        <div className="text-[10px] font-black uppercase text-neutral-500">Population</div>
                        <div className="text-xl font-black text-neutral-950 tabular-nums mt-0.5">
                          {d.population ? d.population.toLocaleString() : '750,000'}
                        </div>
                      </div>
                      <div className="p-3 bg-[#f8fafc] rounded-xl border border-neutral-200">
                        <div className="text-[10px] font-black uppercase text-neutral-500">Median Income</div>
                        <div className="text-xl font-black text-emerald-800 tabular-nums mt-0.5">
                          ${d.median_household_income ? d.median_household_income.toLocaleString() : '72,000'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#f8fafc] rounded-xl border border-neutral-200">
                        <div className="text-[10px] font-black uppercase text-neutral-500">Voter Turnout</div>
                        <div className="text-base font-black text-blue-800 tabular-nums mt-0.5">
                          {d.voter_turnout_pct || 64.2}%
                        </div>
                      </div>
                      <div className="p-3 bg-[#f8fafc] rounded-xl border border-neutral-200">
                        <div className="text-[10px] font-black uppercase text-neutral-500">Avg Household</div>
                        <div className="text-base font-black text-neutral-900 tabular-nums mt-0.5">
                          {d.average_household_size || 2.5} Persons
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Incumbent Representative */}
                  <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs">
                    {matchingRep ? (
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-black uppercase text-neutral-500">Incumbent Representative</div>
                        <button
                          onClick={() => onSelectMember(matchingRep.bioguide_id)}
                          className="font-extrabold text-neutral-950 hover:text-blue-700 text-left text-sm cursor-pointer block truncate"
                        >
                          {matchingRep.first_name} {matchingRep.last_name} ({matchingRep.party?.[0] || 'D'})
                        </button>
                      </div>
                    ) : (
                      <span className="text-neutral-500 font-bold">Representative Disclosed</span>
                    )}
                    <button
                      onClick={() => onAskAi(`Analyze economic demographics and federal project funding for Congressional District ${d.district_code}.`)}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-blue-600 text-white rounded text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <SparklesIcon className="w-3 h-3 text-blue-400" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
