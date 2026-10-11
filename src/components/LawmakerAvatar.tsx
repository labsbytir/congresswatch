import React, { useState } from 'react';

export interface LawmakerAvatarProps {
  bioguideId: string;
  name: string;
  className?: string;
  party?: string;
}

export const LawmakerAvatar: React.FC<LawmakerAvatarProps> = ({
  bioguideId,
  name,
  className = 'w-10 h-10 rounded-full object-cover shrink-0',
  party
}) => {
  // Step 1: R2 AVIF -> Step 2: R2 WebP -> Step 3: Raw CDN JPG -> Step 4: Fallback initials
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = [
    `/watchers/congresswatch/members/${bioguideId}.avif`,
    `/watchers/congresswatch/members/${bioguideId}.webp`,
    `https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/${bioguideId}.jpg`
  ];

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleImgError = () => {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex(prev => prev + 1);
    } else {
      setSourceIndex(-1); // Switch to fallback initials
    }
  };

  if (sourceIndex === -1) {
    const isDem = party === 'Democrat';
    const isGop = party === 'Republican';
    const bgClass = isDem ? 'bg-blue-600 text-white' : (isGop ? 'bg-red-600 text-white' : 'bg-neutral-700 text-white');
    return (
      <div className={`${className} ${bgClass} flex items-center justify-center font-bold text-xs shrink-0 select-none`}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={sources[sourceIndex]}
      alt={name}
      onError={handleImgError}
      className={className}
      loading="lazy"
    />
  );
};

