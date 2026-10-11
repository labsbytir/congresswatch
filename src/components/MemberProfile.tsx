import { LawmakerAvatar } from './LawmakerAvatar';
import React, { useEffect, useState } from 'react';

export interface MemberProfileProps {
  bioguideId: string;
  onBack: () => void;
  onAskAi: (prompt: string) => void;
}

export const MemberProfile: React.FC<MemberProfileProps> = ({
  bioguideId,
  onBack,
  onAskAi
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/members/${bioguideId}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load member profile:', err);
        setLoading(false);
      });
  }, [bioguideId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center text-neutral-500 font-satoshi">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm">Loading official congressional profile from edge...</p>
      </div>
    );
  }

  if (!data || data.error || !data.member) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center text-neutral-500 font-satoshi">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Lawmaker Record Not Found</h2>
        <p className="text-sm mb-6">Could not retrieve bioguide record for {bioguideId}.</p>
        <button onClick={onBack} className="bg-neutral-900 text-white px-4 py-2 rounded text-xs font-semibold">
          ← Return to Directory
        </button>
      </div>
    );
  }

  const m = data.member;
  const isDem = m.party === 'Democrat';
  const isGop = m.party === 'Republican';
  const partyColor = isDem ? 'bg-blue-600 text-white' : (isGop ? 'bg-red-600 text-white' : 'bg-purple-600 text-white');
  const partyBorder = isDem ? 'border-blue-600' : (isGop ? 'border-red-600' : 'border-purple-600');

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-satoshi">
      {/* Navigation Breadcrumb & Headless JSON Link */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200 text-xs">
        <button onClick={onBack} className="text-blue-700 hover:underline font-bold flex items-center gap-1">
          ← Back to All Lawmakers
        </button>
        <div className="flex items-center gap-3">
          <a
            href={`/api/members/${bioguideId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1 rounded font-mono font-semibold transition-colors"
            title="View raw headless JSON data payload"
          >
            {'{ }'} Raw Headless JSON ↗
          </a>
          <button
            onClick={() => onAskAi(`Analyze voting record, committees, and stock trades for ${m.first_name} ${m.last_name} (${m.party}-${m.state})`)}
            className="bg-[#0a192f] hover:bg-neutral-800 text-white px-3 py-1 rounded font-semibold transition-colors"
          >
            ✨ Ask AI About This Member
          </button>
        </div>
      </div>

      {/* Profile Header Dossier */}
      <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm mb-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Official Portrait */}
        <div className="shrink-0 mx-auto md:mx-0">
          <LawmakerAvatar bioguideId={m.bioguide_id} name={`${m.first_name} ${m.last_name}`} party={m.party} className={`w-36 h-44 object-cover rounded-lg border-4 ${partyBorder} shadow-md`} />
          <div className="mt-2 text-center">
            <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block ${partyColor}`}>
              {m.party}
            </span>
          </div>
        </div>

        {/* Member Details */}
        <div className="flex-1 space-y-4">
          <div>
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Bioguide: {m.bioguide_id} • 118th Congress
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-neutral-900 mt-0.5">
              {m.chamber === 'senate' ? 'Senator' : 'Representative'} {m.first_name} {m.last_name}
            </h1>
            <p className="text-sm font-semibold text-neutral-600">
              {m.state} {m.district ? `District ${m.district}` : '(At-Large)'} • {m.total_terms_years} Years of Congressional Service
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-neutral-100 text-xs">
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-100">
              <span className="text-neutral-500 font-medium">Chamber</span>
              <div className="text-base font-bold text-neutral-900 capitalize">{m.chamber}</div>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-100">
              <span className="text-neutral-500 font-medium">Est. Net Worth</span>
              <div className="text-base font-bold text-neutral-900">{m.net_worth_estimate ? `$${m.net_worth_estimate}` : 'Disclosed'}</div>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-100">
              <span className="text-neutral-500 font-medium">Total Terms</span>
              <div className="text-base font-bold text-neutral-900">{Math.max(1, Math.floor(m.total_terms_years / 2))} Terms</div>
            </div>
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-100">
              <span className="text-neutral-500 font-medium">Birth Date</span>
              <div className="text-base font-bold text-neutral-900 font-mono">{m.birth_date || 'N/A'}</div>
            </div>
          </div>

          {/* Official Contact Info */}
          <div className="pt-2 border-t border-neutral-100 text-sm text-neutral-700 space-y-1.5 leading-relaxed">
            {m.office_address && <div><strong className="text-neutral-800">Washington Office:</strong> {m.office_address}</div>}
            {m.phone && <div><strong className="text-neutral-800">Phone:</strong> {m.phone}</div>}
            {m.social_media && (
              <div className="flex items-center gap-4 pt-1 text-blue-600 font-semibold">
                {m.social_media.twitter && <a href={`https://x.com/${m.social_media.twitter}`} target="_blank" rel="noreferrer" className="hover:underline">@{m.social_media.twitter}</a>}
                {m.social_media.youtube && <a href={`https://youtube.com/${m.social_media.youtube}`} target="_blank" rel="noreferrer" className="hover:underline">YouTube</a>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* District & Demographics Panel */}
      {data.district_demographics && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-4 flex items-center gap-2">
            <span>🗺️ District Profile: {m.state} {m.district ? `-${m.district}` : ''}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[#f8fafc] rounded-lg border border-neutral-200">
              <div className="text-neutral-500 font-medium">Constituent Population</div>
              <div className="text-xl font-black text-neutral-900 mt-1 tabular-nums">
                {data.district_demographics.population.toLocaleString()}
              </div>
              <div className="text-neutral-500 text-[11px] mt-1">U.S. Census 5-Year ACS</div>
            </div>
            <div className="p-4 bg-[#f8fafc] rounded-lg border border-neutral-200">
              <div className="text-neutral-500 font-medium">Median Household Income</div>
              <div className="text-xl font-black text-emerald-700 mt-1 tabular-nums">
                ${data.district_demographics.median_household_income.toLocaleString()}
              </div>
              <div className="text-neutral-500 text-[11px] mt-1">Regional Economic Benchmark</div>
            </div>
            <div className="p-4 bg-[#f8fafc] rounded-lg border border-neutral-200">
              <div className="text-neutral-500 font-medium">Historical Voter Turnout</div>
              <div className="text-xl font-black text-blue-700 mt-1 tabular-nums">
                {data.district_demographics.voter_turnout_pct}%
              </div>
              <div className="text-neutral-500 text-[11px] mt-1">General Election Participation</div>
            </div>
          </div>
        </div>
      )}

      {/* Disclosed Congressional Trades */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-neutral-200 bg-[#f8fafc] flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
            Disclosed Stock & Asset Transactions ({data.trades?.length || 0})
          </h2>
          <span className="text-xs text-neutral-500">Periodic Transaction Reports (PTR)</span>
        </div>
        {(!data.trades || data.trades.length === 0) ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No stock transactions disclosed by this lawmaker in the current session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f1f5f9] text-neutral-700 font-bold uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Ticker</th>
                  <th className="py-3 px-4">Asset Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount Bracket</th>
                  <th className="py-3 px-4 text-right">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.trades.map((t: any) => (
                  <tr key={t.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4 font-mono text-neutral-600">{t.transaction_date}</td>
                    <td className="py-3 px-4 font-bold font-mono text-blue-700">{t.ticker}</td>
                    <td className="py-3 px-4 font-medium text-neutral-800">{t.asset_description}</td>
                    <td className="py-3 px-4 capitalize font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        t.transaction_type === 'purchase' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-neutral-900">{t.amount_bracket}</td>
                    <td className="py-3 px-4 text-right">
                      <a href={t.source_doc_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        PTR Filing ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
