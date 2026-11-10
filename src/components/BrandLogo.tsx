import React from 'react';

interface BrandLogoProps {
  variant?: 'navbar' | 'hero' | 'footer' | 'compact' | 'large';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'navbar',
  className = '',
  onClick
}) => {
  if (variant === 'navbar') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 cursor-pointer group select-none ${className}`}
      >
        {/* White three-bar "F" shape on black */}
        <div className="w-10 h-10 bg-black border-2 border-white flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:scale-105 shadow-[2px_2px_0px_0px_#ffffff]">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="Techie Teacher's Tribe Trust Mark"
          >
            {/* Three-bar F shape: vertical stem and three horizontal parallel bars */}
            {/* Vertical spine */}
            <rect x="6" y="6" width="6" height="28" fill="#FFFFFF" />
            {/* Top Bar (Bar 1) */}
            <rect x="12" y="6" width="22" height="6" fill="#FFFFFF" />
            {/* Middle Bar (Bar 2) */}
            <rect x="12" y="17" width="16" height="6" fill="#FFFFFF" />
            {/* Third Lower Bar (Bar 3 - stylized 3-bar F motif) */}
            <rect x="12" y="28" width="10" height="6" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Wordmark beneath / adjacent in navbar */}
        <div className="flex flex-col">
          <span className="font-heading font-black text-sm tracking-wider text-white uppercase leading-none">
            TECHIE TEACHER'S
          </span>
          <span className="font-heading font-bold text-[10px] tracking-widest text-zinc-400 uppercase mt-0.5 leading-none">
            TRIBE TRUST
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'hero' || variant === 'large') {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center text-center select-none ${className}`}
      >
        {/* Large white three-bar 'F' shape on black with sharp brutalist borders */}
        <div className="relative mb-5 p-4 bg-black border-4 border-white shadow-[8px_8px_0px_0px_#ffffff] transition-transform duration-300 hover:-translate-y-1">
          <svg
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-20 h-20 sm:w-24 sm:h-24"
            aria-label="Techie Teacher's Tribe Trust Logo"
          >
            {/* Solid pure white three-bar F shape */}
            {/* Vertical spine */}
            <rect x="10" y="8" width="9" height="44" fill="#FFFFFF" />
            {/* Top Bar 1 */}
            <rect x="19" y="8" width="33" height="9" fill="#FFFFFF" />
            {/* Middle Bar 2 */}
            <rect x="19" y="25.5" width="24" height="9" fill="#FFFFFF" />
            {/* Bottom Bar 3 */}
            <rect x="19" y="43" width="16" height="9" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Wordmark beneath in grey */}
        <div className="flex flex-col items-center">
          <span className="font-heading font-black text-xs sm:text-sm tracking-[0.25em] text-zinc-400 uppercase">
            TECHIE TEACHER'S TRIBE TRUST
          </span>
        </div>
      </div>
    );
  }

  // Footer or compact variant
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-start select-none ${className}`}
    >
      <div className="w-12 h-12 bg-black border-2 border-white flex items-center justify-center p-2 mb-3 shadow-[4px_4px_0px_0px_#ffffff]">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect x="6" y="6" width="6" height="28" fill="#FFFFFF" />
          <rect x="12" y="6" width="22" height="6" fill="#FFFFFF" />
          <rect x="12" y="17" width="16" height="6" fill="#FFFFFF" />
          <rect x="12" y="28" width="10" height="6" fill="#FFFFFF" />
        </svg>
      </div>
      <span className="font-heading font-bold text-xs tracking-widest text-zinc-400 uppercase">
        TECHIE TEACHER'S TRIBE TRUST
      </span>
      <span className="text-[11px] text-zinc-500 mt-1">
        Built by Teachers · Made for Students
      </span>
    </div>
  );
};
