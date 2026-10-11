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
    <header className="sticky top-0 z-50 w-full bg-black border-b border-neutral-800 text-white font-satoshi shadow-md">
      {/* Top Micro-Bar (OpenSecrets Utility Ticker Style) */}
      <div className="border-b border-neutral-800/80 px-4 py-1.5 text-xs text-neutral-400 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Congress in Session
          </span>
          <span className="hidden md:inline">118th Congress, 2nd Session</span>
          <span className="hidden lg:inline text-neutral-500">•</span>
          <span className="hidden lg:inline">Floor Votes Today: House (2), Senate (1)</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/insider-trades" className="hover:text-white transition-colors">Congressional Trades</a>
          <span>•</span>
          <a href="/procurement" className="hover:text-white transition-colors">Contracts</a>
          <span>•</span>
          <a href="/fantasy" className="hover:text-amber-400 transition-colors">Fantasy Congress</a>
          <span>•</span>
          <a href="/api-docs" className="hover:text-blue-400 transition-colors">Developer API</a>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        {/* Brand Logo using Congress Watch Logo Grey.svg */}
        <a href="/" className="flex items-center gap-3 shrink-0 group">
          <img 
            src="/brand/logo.png" 
            alt="Congress Watch Logo" 
            style={{ height: '36px', width: 'auto', maxHeight: '36px' }}
            className="object-contain transition-transform group-hover:scale-105"
          />
        </a>

        {/* Global Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <a 
            href="/bills" 
            className={`px-3 py-2 rounded-md transition-colors ${activeTab === 'legislation' ? 'text-white bg-neutral-900 font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
          >
            Bills
          </a>
          <a 
            href="/congress" 
            className={`px-3 py-2 rounded-md transition-colors ${activeTab === 'members' ? 'text-white bg-neutral-900 font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
          >
            Lawmakers
          </a>
          <a 
            href="/committees" 
            className={`px-3 py-2 rounded-md transition-colors ${activeTab === 'committees' ? 'text-white bg-neutral-900 font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
          >
            Committees
          </a>
          <a 
            href="/procurement" 
            className={`px-3 py-2 rounded-md transition-colors ${activeTab === 'procurement' ? 'text-white bg-neutral-900 font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
          >
            Contracts
          </a>
          <a 
            href="/districts" 
            className={`px-3 py-2 rounded-md transition-colors ${activeTab === 'districts' ? 'text-white bg-neutral-900 font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'}`}
          >
            Map
          </a>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Search Mode Indicator / Switcher */}
          <button
            onClick={() => onToggleSearchMode && onToggleSearchMode(searchMode === 'classic' ? 'smart_plus' : 'classic')}
            className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-all ${
              searchMode === 'smart_plus' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-sm shadow-blue-500/20' 
                : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-500'
            }`}
            title="Toggle between Classic keyword search and Smart+ AI Conversational RAG"
          >
            {searchMode === 'smart_plus' ? '✨ Smart+ AI' : '🔍 Classic Search'}
          </button>

          {/* User Sign In / Account Button */}
          <a 
            href="/auth/login" 
            className="text-xs bg-white text-black hover:bg-neutral-200 font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    </header>
  );
};

