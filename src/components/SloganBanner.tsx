import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface SloganBannerProps {
  slogan: string;
  subtext?: string;
  variant?: 'inverted' | 'standard';
}

export const SloganBanner: React.FC<SloganBannerProps> = ({
  slogan,
  subtext,
  variant = 'standard'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Smooth scroll-driven reveal and text fill effect
  const fillProgress = useTransform(scrollYProgress, [0.2, 0.6], [0, 100]);
  const textX = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  const isInverted = variant === 'inverted';

  return (
    <div
      ref={containerRef}
      className={`relative w-full py-16 md:py-24 border-y-2 border-white overflow-hidden select-none ${
        isInverted ? 'bg-white text-black' : 'bg-black text-white'
      }`}
    >
      {/* Subtle background geometric grid in monochrome */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: isInverted
            ? 'radial-gradient(#000000 1px, transparent 1px)'
            : 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          style={{ x: textX }}
          className="flex flex-col items-center text-center space-y-4"
        >
          {/* Subtle kicker */}
          <div className="flex items-center gap-3">
            <span className={`h-px w-8 ${isInverted ? 'bg-black' : 'bg-white'}`} />
            <span
              className={`text-xs uppercase tracking-[0.3em] font-mono-numbers font-semibold ${
                isInverted ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              TRIBE MANIFESTO
            </span>
            <span className={`h-px w-8 ${isInverted ? 'bg-black' : 'bg-white'}`} />
          </div>

          {/* Slogan with high-contrast text reveal / fill */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black tracking-tighter uppercase leading-[0.95] max-w-5xl">
            {slogan}
          </h2>

          {subtext && (
            <p
              className={`text-sm sm:text-base md:text-lg max-w-2xl font-medium tracking-wide ${
                isInverted ? 'text-zinc-700' : 'text-zinc-400'
              }`}
            >
              {subtext}
            </p>
          )}
        </motion.div>
      </div>

      {/* Decorative stark monochrome edge accent */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${
          isInverted ? 'bg-black' : 'bg-white'
        }`}
      />
    </div>
  );
};
