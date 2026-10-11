import { LlmActionMenu } from "./LlmActionMenu";
import { AiBadge } from "./AiBadge";
import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, SparklesIcon, ExternalLinkIcon } from './Icons';
import { LawmakerAvatar } from './LawmakerAvatar';

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
      <div className="max-w-6xl mx-auto px-6 py-20 text-center font-satoshi">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-base font-bold text-neutral-800">Loading official lawmaker dossier from edge...</p>
      </div>
    );
  }

  if (!data || data.error || !data.member) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center font-satoshi">
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Lawmaker Record Not Found</h2>
        <p className="text-base font-medium text-neutral-600 mb-6">Could not retrieve bioguide record for {bioguideId}.</p>
        <button onClick={onBack} className="bg-neutral-900 text-white px-5 py-2.5 rounded font-bold text-sm cursor-pointer">
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
    <div className="max-w-6xl mx-auto px-6 py-10 font-satoshi text-neutral-900">
      {/* Navigation Breadcrumb & Headless JSON Link */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-300 text-sm">
        <button onClick={onBack} className="text-blue-800 hover:text-blue-950 font-bold flex items-center gap-2 cursor-pointer transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to All Lawmakers</span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => onAskAi(`Analyze voting record, committees, and stock trades for ${m.first_name} ${m.last_name} (${m.party}-${m.state})`)} className="cursor-pointer transition-transform hover:scale-105 flex items-center"><AiBadge size="md" label="Smart AI" active={true} /></button>
          <LlmActionMenu markdownUrl={`/api/members/${bioguideId}.md`} title={`${m.first_name} ${m.last_name} (${m.party}-${m.state})`} />
          <a
            href={`/api/members/${bioguideId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3.5 py-1.5 rounded font-mono font-bold text-xs transition-colors border border-neutral-300"
            title="View raw headless JSON data payload"
          >
            {'{ }'} Raw Headless JSON ↗
          </a>
        </div>
      </div>

      {/* Profile Header Dossier */}
      <div className="bg-white border-2 border-neutral-300 rounded-xl p-8 shadow-sm mb-10 flex flex-col md:flex-row gap-8 items-start">
        {/* Official Portrait */}
        <div className="shrink-0 mx-auto md:mx-0">
          <LawmakerAvatar
            bioguideId={m.bioguide_id}
            name={`${m.first_name} ${m.last_name}`}
            party={m.party}
            className={`w-40 h-48 object-cover rounded-xl border-4 ${partyBorder} shadow-md`}
          />
          <div className="mt-3 text-center">
            <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block ${partyColor}`}>
              {m.party}
            </span>
          </div>
        </div>

        {/* Member Details: Satoshi 700 Titles + 500/700 Body */}
        <div className="flex-1 space-y-5">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-600 uppercase tracking-wider block">
              Bioguide: {m.bioguide_id} • 118th Congress
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-950 mt-1 leading-tight">
              {m.chamber === 'senate' ? 'Senator' : 'Representative'} {m.first_name} {m.last_name}
            </h1>
            <p className="text-base font-extrabold text-neutral-700 mt-1">
              {m.state} {m.district ? `District ${m.district}` : '(At-Large)'} • {m.total_terms_years} Years of Congressional Service
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-neutral-200 text-sm">
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-xs font-black uppercase text-neutral-600 block">Chamber</span>
              <div className="text-base font-extrabold text-neutral-950 capitalize mt-0.5">{m.chamber}</div>
            </div>
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-xs font-black uppercase text-neutral-600 block">Net Worth</span>
              <div className="text-base font-extrabold text-neutral-950 mt-0.5">{m.net_worth_estimate ? `$${m.net_worth_estimate}` : 'Disclosed'}</div>
            </div>
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-xs font-black uppercase text-neutral-600 block">Total Terms</span>
              <div className="text-base font-extrabold text-neutral-950 mt-0.5">{Math.max(1, Math.floor(m.total_terms_years / 2))} Terms</div>
            </div>
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-xs font-black uppercase text-neutral-600 block">Birth Date</span>
              <div className="text-base font-extrabold text-neutral-950 font-mono mt-0.5">{m.birth_date || 'N/A'}</div>
            </div>
          </div>

          {/* Official Contact Info */}
          <div className="pt-3 border-t border-neutral-200 text-sm text-neutral-800 space-y-1.5 leading-relaxed font-medium">
            {m.office_address && <div><strong className="text-neutral-950 font-bold">Washington Office:</strong> {m.office_address}</div>}
            {m.phone && <div><strong className="text-neutral-950 font-bold">Phone:</strong> {m.phone}</div>}
            {m.social_media && (
              <div className="flex items-center gap-5 pt-1.5 text-blue-700 font-bold">
                {m.social_media.twitter && <a href={`https://x.com/${m.social_media.twitter}`} target="_blank" rel="noreferrer" className="hover:underline">@{m.social_media.twitter} ↗</a>}
                {m.social_media.youtube && <a href={`https://youtube.com/${m.social_media.youtube}`} target="_blank" rel="noreferrer" className="hover:underline">YouTube Channel ↗</a>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* District & Demographics Panel */}
      {data.district_demographics && (
        <div className="bg-white border border-neutral-300 rounded-xl p-8 shadow-sm mb-10">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-neutral-950 mb-4 flex items-center gap-2">
            <span>District Profile: {m.state} {m.district ? `-${m.district}` : ''}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
            <div className="p-5 bg-[#f8fafc] rounded-xl border border-neutral-200">
              <div className="text-xs font-black uppercase tracking-wider text-neutral-600">Constituent Population</div>
              <div className="text-2xl font-black text-neutral-950 mt-1 tabular-nums">
                {data.district_demographics.population.toLocaleString()}
              </div>
              <div className="text-neutral-600 text-xs font-semibold mt-1">U.S. Census 5-Year ACS</div>
            </div>
            <div className="p-5 bg-[#f8fafc] rounded-xl border border-neutral-200">
              <div className="text-xs font-black uppercase tracking-wider text-neutral-600">Median Household Income</div>
              <div className="text-2xl font-black text-emerald-800 mt-1 tabular-nums">
                ${data.district_demographics.median_household_income.toLocaleString()}
              </div>
              <div className="text-neutral-600 text-xs font-semibold mt-1">Regional Economic Benchmark</div>
            </div>
            <div className="p-5 bg-[#f8fafc] rounded-xl border border-neutral-200">
              <div className="text-xs font-black uppercase tracking-wider text-neutral-600">Voter Turnout Rate</div>
              <div className="text-2xl font-black text-blue-800 mt-1 tabular-nums">
                {data.district_demographics.voter_turnout_pct}%
              </div>
              <div className="text-neutral-600 text-xs font-semibold mt-1">General Election Participation</div>
            </div>
          </div>
        </div>
      )}

      {/* Disclosed Congressional Trades */}
      <div className="bg-white border border-neutral-300 rounded-xl shadow-sm overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-neutral-300 bg-[#f8fafc] flex items-center justify-between">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-neutral-950">
            Disclosed Stock & Asset Transactions ({data.trades?.length || 0})
          </h2>
          <span className="text-xs text-neutral-700 font-mono font-bold">Periodic Transaction Reports (PTR)</span>
        </div>
        {(!data.trades || data.trades.length === 0) ? (
          <div className="p-10 text-center text-sm font-medium text-neutral-600">
            No stock transactions disclosed by this lawmaker in the current session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-medium">
              <thead className="bg-[#f1f5f9] text-neutral-800 font-black uppercase tracking-wider border-b border-neutral-300 text-xs">
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
                    <td className="py-3.5 px-4 font-mono text-neutral-700">{t.transaction_date}</td>
                    <td className="py-3.5 px-4 font-extrabold font-mono text-blue-800">{t.ticker}</td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900">{t.asset_description}</td>
                    <td className="py-3.5 px-4 capitalize font-bold">
                      <span className={`px-2.5 py-1 rounded text-xs ${
                        t.transaction_type === 'purchase' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-neutral-950">{t.amount_bracket}</td>
                    <td className="py-3.5 px-4 text-right">
                      <a href={t.source_doc_url} target="_blank" rel="noreferrer" className="text-blue-700 font-bold hover:underline">
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

