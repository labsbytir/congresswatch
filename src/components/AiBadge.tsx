import React from 'react';

export interface AiBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  onClick?: () => void;
  label?: string; // e.g. "AI" or "Smart+ AI"
}

export const AiBadge: React.FC<AiBadgeProps> = ({
  className = '',
  size = 'md',
  active = true,
  onClick,
  label = 'AI'
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs gap-1',
    md: 'px-3.5 py-1 text-sm gap-1.5',
    lg: 'px-5 py-2 text-base gap-2'
  }[size];

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center p-[2px] rounded-full transition-all select-none ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{
        background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 35%, #8a2387 70%, #e94057 100%)'
      }}
    >
      {/* Inner capsule content */}
      <div
        className={`flex items-center rounded-full font-black ${sizeClasses} ${
          active
            ? 'bg-white text-transparent'
            : 'bg-neutral-900 text-neutral-400'
        }`}
      >
        {/* 4-pointed gradient sparkle star matching image */}
        <svg
          viewBox="0 0 24 24"
          fill="url(#ai-badge-gradient)"
          className={`${starSizes} shrink-0`}
        >
          <defs>
            <linearGradient id="ai-badge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d2ff" />
              <stop offset="40%" stopColor="#3a7bd5" />
              <stop offset="75%" stopColor="#8a2387" />
              <stop offset="100%" stopColor="#e94057" />
            </linearGradient>
          </defs>
          {/* Smooth 4-pointed star curve */}
          <path d="M12 2 C12 7.52 7.52 12 2 12 C7.52 12 12 16.48 12 22 C12 16.48 16.48 12 22 12 C16.48 12 12 7.52 12 2 Z" />
        </svg>

        {/* Text with linear gradient fill */}
        <span
          className="tracking-tight font-extrabold"
          style={{
            background: 'linear-gradient(90deg, #3a7bd5 0%, #8a2387 60%, #e94057 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: active ? 'transparent' : 'inherit'
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

