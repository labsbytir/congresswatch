import { DiscordIcon } from "./Icons";
import { AiBadge } from './AiBadge';
import { LlmActionMenu } from './LlmActionMenu';
import React from 'react';

export interface HeaderProps {
  activeTab?: string;
  onSelectTab?: (tab: 'bills' | 'members' | 'committees' | 'contracts' | 'map') => void;
  onSearch?: (query: string) => void;
  onToggleSearchMode?: (mode: 'classic' | 'smart_plus') => void;
  searchMode?: 'classic' | 'smart_plus';
}

export const StickyHeader: React.FC<HeaderProps> = ({
  activeTab = 'bills',
  onSelectTab,
  onSearch,
  onToggleSearchMode,
  searchMode = 'classic'
}) => {
  return (
    <header id="cw-header" className="sticky top-0 z-50 w-full bg-black text-white font-satoshi shadow-md">
      {/* Top Micro-Bar */}
      <div className="border-b border-white/10 px-4 sm:px-6 py-1.5 text-xs sm:text-[13px] text-neutral-300 flex items-center justify-between max-w-7xl mx-auto overflow-x-auto whitespace-nowrap gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Congress in Session
          </span>
          <span className="hidden sm:inline font-medium text-neutral-300">118th Congress</span>
        </div>
        <div className="flex items-center gap-3 font-medium text-neutral-300 shrink-0">
          <a href="/insider-trades" className="hover:text-white transition-colors">Congressional Trades</a>
          <span className="text-neutral-600">•</span>
          <a href="/procurement" onClick={(e) => { if (onSelectTab) { e.preventDefault(); onSelectTab('contracts'); } }} className="hover:text-white transition-colors">Contracts</a>
          <span className="text-neutral-600">•</span>
          <a href="/fantasy" className="hover:text-amber-400 transition-colors">Fantasy Congress</a>
          <span className="text-neutral-600">•</span>
          <a href="https://discord.gg/vXkPvAkuvN" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white hover:text-blue-300 transition-colors" title="Discord Community">
            <DiscordIcon className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Discord</span>
          </a>
          <span className="text-neutral-600">•</span>
          <a href="https://buymeacoffee.com/postdated" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 text-amber-400 font-bold transition-colors">
            Donate
          </a>
        </div>
      </div>

      {/* Main Sticky Navbar with Glass-like Separation Border at Bottom */}
      <div id="cw-header-border" className="border-b border-white/15 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 sm:gap-6 min-h-16">
          {/* Brand Logo */}
          <a href="/" onClick={(e) => { if (onSelectTab) { e.preventDefault(); onSelectTab('bills'); } }} className="flex items-center gap-2 shrink-0 group">
            <img 
              src="/brand/logo.png" 
              alt="Congress Watch Logo" 
              style={{ height: '36px', width: 'auto', maxHeight: '36px' }}
              className="object-contain transition-transform group-hover:scale-105"
            />
          </a>

          {/* Global Navigation Links - Fully responsive without truncation */}
          <nav className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-[15px] font-semibold overflow-x-auto py-1 order-3 md:order-2 w-full md:w-auto justify-center md:justify-start border-t border-neutral-900 md:border-t-0 mt-1 md:mt-0 pt-2 md:pt-0">
            <a 
              href="/"
              onClick={(e) => { if (onSelectTab) { e.preventDefault(); onSelectTab('bills'); } }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'bills' ? 'text-white bg-neutral-900 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
            >
              Bills
            </a>
            <a 
              href="/congress"
              onClick={(e) => { if (onSelectTab) { e.preventDefault(); onSelectTab('members'); } }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'members' ? 'text-white bg-neutral-900 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
            >
              Lawmakers
            </a>
            <a 
              href="/committees"
              onClick={(e) => { if (onSelectTab) { e.preventDefault(); onSelectTab('committees'); } }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'committees' ? 'text-white bg-neutral-900 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
            >
              Committees
            </a>
            <a 
              href="/procurement"
              onClick={(e) => { if (onSelectTab) { e.preventDefault(); onSelectTab('contracts'); } }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'contracts' ? 'text-white bg-neutral-900 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
            >
              Contracts
            </a>
            <a 
              href="/districts"
              onClick={(e) => { if (onSelectTab) { e.preventDefault(); onSelectTab('map'); } }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'map' ? 'text-white bg-neutral-900 font-bold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
            >
              Map
            </a>
          </nav>

          {/* Search Mode & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 order-2 md:order-3">
            <button onClick={() => onToggleSearchMode && onToggleSearchMode(searchMode === 'classic' ? 'smart_plus' : 'classic')} className="cursor-pointer transition-transform hover:scale-105" title="Toggle between Basic search and Smart AI"><AiBadge size="sm" label="Smart AI" active={searchMode === 'smart_plus'} /></button>

            <LlmActionMenu markdownUrl="/llms.txt" title="CongressWatch Intelligence Spec" />

            <a 
              href="/auth/login" 
              className="text-xs sm:text-sm bg-white text-black hover:bg-neutral-200 font-bold px-3 sm:px-4 py-1.5 rounded-md transition-colors shadow-xs"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

