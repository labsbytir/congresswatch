import React from 'react';

export interface SearchModeToggleProps {
  mode: 'classic' | 'smart_plus';
  onChange: (mode: 'classic' | 'smart_plus') => void;
}

export const SearchModeToggle: React.FC<SearchModeToggleProps> = ({ mode, onChange }) => {
  const isAi = mode === 'smart_plus';

  return (
    <div 
      id="cw-search-toggle-slider" 
      className="relative flex items-center bg-neutral-100 p-1 rounded-full border-2 border-neutral-400/90 shadow-inner select-none shrink-0"
    >
      {/* Basic Half */}
      <button
        type="button"
        onClick={() => onChange('classic')}
        className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2 rounded-full font-black text-sm transition-all cursor-pointer ${
          !isAi
            ? 'bg-white text-neutral-950 shadow-md border-2 border-neutral-300'
            : 'text-neutral-500 hover:text-neutral-800'
        }`}
      >
        {/* Bold Search Glass Icon */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`w-4 h-4 shrink-0 ${!isAi ? 'text-black' : 'text-neutral-400'}`}
        >
          <circle cx="11" cy="11" r="7.5" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="tracking-tight">Basic</span>
      </button>

      {/* AI Half - Matching user reference capsule */}
      <button
        type="button"
        onClick={() => onChange('smart_plus')}
        className={`relative z-10 flex items-center justify-center transition-all cursor-pointer ${
          isAi
            ? 'p-[2px] rounded-full shadow-md'
            : 'px-4 py-2 text-neutral-500 hover:text-neutral-800 font-black text-sm'
        }`}
        style={
          isAi
            ? {
                background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 35%, #8a2387 70%, #e94057 100%)'
              }
            : undefined
        }
      >
        {isAi ? (
          <div className="flex items-center justify-center gap-2 bg-white px-4 py-1.5 rounded-full font-black text-sm">
            {/* 4-Pointed Gradient Star matching reference image */}
            <svg
              viewBox="0 0 24 24"
              fill="url(#toggle-ai-gradient)"
              className="w-4 h-4 shrink-0"
            >
              <defs>
                <linearGradient id="toggle-ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d2ff" />
                  <stop offset="40%" stopColor="#3a7bd5" />
                  <stop offset="75%" stopColor="#8a2387" />
                  <stop offset="100%" stopColor="#e94057" />
                </linearGradient>
              </defs>
              <path d="M12 2 C12 7.52 7.52 12 2 12 C7.52 12 12 16.48 12 22 C12 16.48 16.48 12 22 12 C16.48 12 12 7.52 12 2 Z" />
            </svg>
            <span
              className="tracking-tight font-black"
              style={{
                background: 'linear-gradient(90deg, #3a7bd5 0%, #8a2387 60%, #e94057 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              AI
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {/* Muted 4-point star when inactive */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-neutral-400">
              <path d="M12 2 C12 7.52 7.52 12 2 12 C7.52 12 12 16.48 12 22 C12 16.48 16.48 12 22 12 C16.48 12 12 7.52 12 2 Z" />
            </svg>
            <span>AI</span>
          </div>
        )}
      </button>
    </div>
  );
};

