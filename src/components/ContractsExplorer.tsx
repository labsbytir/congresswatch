import React, { useState, useEffect, useMemo } from 'react';
import { SearchIcon, SparklesIcon, ExternalLinkIcon, DocumentIcon } from './Icons';
import { CONGRESS_BENCHMARKS } from '../lib/constants';

export const DEFAULT_CONTRACTS = [
  {
    id: "FA8650-24-S-5001",
    solicitation_number: "FA8650-24-S-5001",
    title: "Advanced Aerospace Defense Systems & Avionics Electronic Warfare Procurement",
    notice_type: "o",
    department_name: "Department of the Air Force",
    sub_tier_agency: "Air Force Materiel Command (AFMC)",
    posted_date: "2024-05-18",
    response_deadline: "2025-01-15",
    naics_code: "336411",
    description: "Procurement requirement authorized under NDAA FY2025 (P.L. 118-8070) for next-generation aerospace avionics and stealth coating technologies.",
    ui_link: "https://sam.gov",
    linked_public_law: "P.L. 118-8070",
    linked_bill_id: "118-hr-8070",
    estimated_award_amount: 1450000000
  },
  {
    id: "N00024-24-R-6300",
    solicitation_number: "N00024-24-R-6300",
    title: "Naval Nuclear Propulsion & Virginia-Class Submarine Hull Module Fabrication",
    notice_type: "o",
    department_name: "Department of the Navy",
    sub_tier_agency: "Naval Sea Systems Command (NAVSEA)",
    posted_date: "2024-06-02",
    response_deadline: "2024-11-30",
    naics_code: "336611",
    description: "Statutory submarine industrial base funding authorized under H.R. 8070 and FY24 Consolidated Appropriations (P.L. 118-47).",
    ui_link: "https://sam.gov",
    linked_public_law: "P.L. 118-47",
    linked_bill_id: "118-hr-8070",
    estimated_award_amount: 3200000000
  },
  {
    id: "DE-SOL-0012948",
    solicitation_number: "DE-SOL-0012948",
    title: "Domestic Rare Earth Elements & Critical Minerals Refining Facility Initiative",
    notice_type: "o",
    department_name: "Department of Energy",
    sub_tier_agency: "Office of Manufacturing and Energy Supply Chains",
    posted_date: "2024-04-12",
    response_deadline: "2024-12-01",
    naics_code: "212299",
    description: "Commercial facility grants authorized under the Critical Minerals Supply Chains Act (H.R. 5376) to establish domestic extraction of lithium and rare earths.",
    ui_link: "https://sam.gov",
    linked_public_law: "P.L. 118-5376",
    linked_bill_id: "118-hr-5376",
    estimated_award_amount: 450000000
  },
  {
    id: "DOC-NIST-24-00192",
    solicitation_number: "DOC-NIST-24-00192",
    title: "National Semiconductor Technology Center (NSTC) Prototype Fabrication & AI Packaging",
    notice_type: "o",
    department_name: "Department of Commerce",
    sub_tier_agency: "National Institute of Standards and Technology (NIST)",
    posted_date: "2024-03-20",
    response_deadline: "2025-02-28",
    naics_code: "334413",
    description: "Federal research alliance authorized under S. 1234 (AI Security & Semiconductor R&D Act) and CHIPS Act for 2nm process technology development.",
    ui_link: "https://sam.gov",
    linked_public_law: "P.L. 117-167",
    linked_bill_id: "118-s-1234",
    estimated_award_amount: 2850000000
  }
];

export interface ContractsExplorerProps {
  onSelectBill: (billId: string) => void;
  onAskAi: (prompt: string) => void;
}

export const ContractsExplorer: React.FC<ContractsExplorerProps> = ({
  onSelectBill,
  onAskAi
}) => {
  const [contracts, setContracts] = useState<any[]>(DEFAULT_CONTRACTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'o' | 'a'>('all');

  useEffect(() => {
    setLoading(true);
    fetch('/api/procurement')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setContracts(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Procurement fetch fallback:', err);
        setLoading(false);
      });
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    contracts.forEach(c => {
      if (c.department_name) set.add(c.department_name);
    });
    return Array.from(set);
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      if (deptFilter !== 'all' && c.department_name !== deptFilter) return false;
      if (typeFilter !== 'all' && c.notice_type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (c.title && c.title.toLowerCase().includes(q)) ||
          (c.solicitation_number && c.solicitation_number.toLowerCase().includes(q)) ||
          (c.department_name && c.department_name.toLowerCase().includes(q)) ||
          (c.naics_code && c.naics_code.includes(q)) ||
          (c.linked_bill_id && c.linked_bill_id.toLowerCase().includes(q)) ||
          (c.linked_public_law && c.linked_public_law.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [contracts, deptFilter, typeFilter, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-satoshi text-neutral-900 space-y-10">
      {/* Page Header */}
      <div className="bg-white border-2 border-neutral-300 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-black uppercase tracking-wider text-emerald-800">
            <DocumentIcon className="w-4 h-4 text-emerald-700" />
            SAM.gov Federal Procurement & Statutory Alignment
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
            Federal Contracts & Solicitations
          </h1>
          <p className="text-neutral-600 text-base font-medium max-w-2xl">
            Track active federal contract solicitations and award notices mapped directly to statutory mandates, public laws, and Congressional appropriations bills.
          </p>
        </div>
        <div className="p-5 bg-neutral-900 text-white rounded-xl border border-neutral-800 shrink-0 text-center space-y-1">
          <div className="text-xs uppercase font-extrabold tracking-wider text-neutral-400">Tracked Opportunities</div>
          <div className="text-4xl font-black tabular-nums text-emerald-400">{CONGRESS_BENCHMARKS.ACTIVE_SAM_GOV_SOLICITATIONS_ESTIMATE.toLocaleString()}</div>
          <div className="text-xs text-neutral-300 font-semibold">Matched Active Bids & Solicitations</div>
        </div>
      </div>

      {/* Search and Filter Panel */}
      <div className="bg-white border-2 border-neutral-300 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <SearchIcon className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search solicitation # (FA8650), NAICS (336411), requirement title, or linked bill..."
              className="w-full pl-12 pr-4 py-3 bg-[#f8fafc] border-2 border-neutral-300 rounded-xl text-base font-bold text-neutral-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:font-medium placeholder:text-neutral-400"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-black uppercase text-neutral-500">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-[#f8fafc] border-2 border-neutral-300 rounded-lg px-3 py-2 text-xs font-bold text-neutral-900 focus:outline-none max-w-xs"
            >
              <option value="all">All Federal Agencies</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-neutral-200 text-xs">
          <span className="font-black uppercase text-neutral-500 mr-2">Notice Type:</span>
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
              typeFilter === 'all' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-[#f8fafc] text-neutral-700 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setTypeFilter('o')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
              typeFilter === 'o' ? 'bg-blue-700 text-white border-blue-700' : 'bg-[#f8fafc] text-neutral-700 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            Active Solicitations (Bids Open)
          </button>
          <button
            onClick={() => setTypeFilter('a')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
              typeFilter === 'a' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-[#f8fafc] text-neutral-700 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            Award Notices
          </button>
        </div>
      </div>

      {/* Contracts Table & Cards */}
      {loading ? (
        <div className="p-20 text-center font-bold text-neutral-600">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading SAM.gov procurement contracts from edge...
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="bg-white border-2 border-neutral-300 rounded-xl p-12 text-center text-neutral-600 font-bold">
          No contract solicitations match the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-neutral-600 font-bold px-1">
            Showing {filteredContracts.length} federal procurement opportunities
          </div>

          <div className="bg-white border-2 border-neutral-300 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f1f5f9] text-neutral-800 font-black uppercase tracking-wider border-b-2 border-neutral-300 text-xs">
                  <tr>
                    <th className="py-3.5 px-4">Solicitation #</th>
                    <th className="py-3.5 px-4">Requirement & Scope</th>
                    <th className="py-3.5 px-4">Department / Agency</th>
                    <th className="py-3.5 px-4">Response Deadline</th>
                    <th className="py-3.5 px-4">Est. Amount</th>
                    <th className="py-3.5 px-4">Statutory Authority</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredContracts.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="py-4 px-4 font-mono font-bold text-blue-800 whitespace-nowrap">
                        <a href={c.ui_link || 'https://sam.gov'} target="_blank" rel="noreferrer" className="hover:underline">
                          {c.solicitation_number}
                        </a>
                        <div className="mt-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            c.notice_type === 'o' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                          }`}
                          >
                            {c.notice_type === 'o' ? 'Solicitation' : 'Award Notice'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        <div className="font-extrabold text-neutral-950 text-base leading-snug">{c.title}</div>
                        {c.description && (
                          <div className="text-neutral-600 text-xs font-medium mt-1 line-clamp-2">{c.description}</div>
                        )}
                        <div className="text-xs font-mono font-bold text-neutral-500 mt-1">NAICS: {c.naics_code}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap font-bold text-neutral-800 text-xs">
                        <div>{c.department_name}</div>
                        {c.sub_tier_agency && (
                          <div className="text-neutral-500 text-[11px] font-medium">{c.sub_tier_agency}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono text-sm text-neutral-700 whitespace-nowrap">
                        {c.response_deadline || 'Open'}
                      </td>
                      <td className="py-4 px-4 font-mono font-black text-emerald-800 whitespace-nowrap">
                        {c.estimated_award_amount ? `$${(c.estimated_award_amount / 1000000).toFixed(1)}M` : 'Undisclosed'}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {c.linked_bill_id ? (
                          <button
                            onClick={() => onSelectBill(c.linked_bill_id)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 px-2.5 py-1 rounded text-xs font-black transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Click to view authorizing bill dossier"
                          >
                            <span>{c.linked_public_law || c.linked_bill_id}</span>
                            <ExternalLinkIcon className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-neutral-400 text-xs font-mono">General Agency</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onAskAi(`Analyze procurement contract ${c.solicitation_number} (${c.title}) and its link to federal appropriations and legislation.`)}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-blue-600 text-white rounded text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <SparklesIcon className="w-3.5 h-3.5 text-blue-400" />
                          <span>Analyze</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
