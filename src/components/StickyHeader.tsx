import { AiBadge } from './AiBadge';
import React from 'react';

export interface HeaderProps {
  activeTab?: string;
  onSearch?: (query: string) => void;
  onToggleSearchMode?: (mode: 'classic' | 'smart_plus') => void;
  searchMode?: 'classic' | 'smart_plus';
}

export const StickyHeader: React.FC<HeaderProps> = ({
  activeTab = 'legislation',
  onSearch,
  onToggleSearchMode,
  searchMode = 'classic'
}) => {
  return (
    <header id="cw-header" className="sticky top-0 z-50 w-full bg-black text-white font-satoshi shadow-md">
      {/* Top Micro-Bar */}
      <div className="border-b border-white/10 px-6 py-2 text-[13px] text-neutral-300 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 font-semibold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Congress in Session
          </span>
          <span className="hidden md:inline font-medium text-neutral-300">118th Congress, 2nd Session</span>
          <span className="hidden lg:inline text-neutral-600">•</span>
          <span className="hidden lg:inline font-medium text-neutral-300">Floor Votes Today: House (2), Senate (1)</span>
        </div>
        <div className="flex items-center gap-3 font-medium text-neutral-300">
          <a href="/insider-trades" className="hover:text-white transition-colors">Congressional Trades</a>
          <span className="text-neutral-600">•</span>
          <a href="/procurement" className="hover:text-white transition-colors">Contracts</a>
          <span className="text-neutral-600">•</span>
          <a href="/fantasy" className="hover:text-amber-400 transition-colors">Fantasy Congress</a>
          <span className="text-neutral-600">•</span>
          <a href="/api-docs" className="hover:text-blue-400 transition-colors">Developer API</a>
        </div>
      </div>

      {/* Main Sticky Navbar with Glass-like Separation Border at Bottom */}
      <div id="cw-header-border" className="border-b border-white/15 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <a href="/" className="flex items-center gap-3 shrink-0 group">
            <img 
              src="/brand/logo.png" 
              alt="Congress Watch Logo" 
              style={{ height: '40px', width: 'auto', maxHeight: '40px' }}
              className="object-contain transition-transform group-hover:scale-105"
            />
          </a>

          {/* Global Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 text-[15px] font-semibold">
            <a 
              href="/bills" 
              className={`px-3.5 py-2 rounded-md transition-colors ${activeTab === 'legislation' ? 'text-white bg-neutral-900 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
            >
              Bills
            </a>
            <a 
              href="/congress" 
              className={`px-3.5 py-2 rounded-md transition-colors ${activeTab === 'members' ? 'text-white bg-neutral-900 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
            >
              Lawmakers
            </a>
            <a 
              href="/committees" 
              className={`px-3.5 py-2 rounded-md transition-colors ${activeTab === 'committees' ? 'text-white bg-neutral-900 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
            >
              Committees
            </a>
            <a 
              href="/procurement" 
              className={`px-3.5 py-2 rounded-md transition-colors ${activeTab === 'procurement' ? 'text-white bg-neutral-900 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
            >
              Contracts
            </a>
            <a 
              href="/districts" 
              className={`px-3.5 py-2 rounded-md transition-colors ${activeTab === 'districts' ? 'text-white bg-neutral-900 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
            >
              Map
            </a>
          </nav>

          {/* Search Mode & Actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => onToggleSearchMode && onToggleSearchMode(searchMode === 'classic' ? 'smart_plus' : 'classic')} className="cursor-pointer transition-transform hover:scale-105" title="Toggle between Basic search and Smart AI"><AiBadge size="sm" label="Smart AI" active={searchMode === 'smart_plus'} /></button>

            <a 
              href="/auth/login" 
              className="text-sm bg-white text-black hover:bg-neutral-200 font-bold px-4 py-1.5 rounded-md transition-colors shadow-xs"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

