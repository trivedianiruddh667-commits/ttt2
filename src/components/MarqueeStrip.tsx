import React from 'react';

interface MarqueeStripProps {
  items?: string[];
  reverse?: boolean;
  inverted?: boolean;
}

export const MarqueeStrip: React.FC<MarqueeStripProps> = ({
  items = [
    'EDUCATION, MADE SIMPLER AND SMARTER',
    'EXAM BOOSTER NOTES',
    'LEARN SMART. LEARN FAST.',
    'HANDWRITTEN TOPPER SHEETS',
    'YOUR TRIBE. YOUR FUTURE.',
    'FAST-TRACK SEMESTER CRASH COURSES',
    'FROM NOTES TO KNOWLEDGE',
    'NO FLUFF · ONLY GRADES',
    'BUILT BY TEACHERS. MADE FOR STUDENTS.'
  ],
  reverse = false,
  inverted = false
}) => {
  return (
    <div
      className={`w-full overflow-hidden border-y border-zinc-800 py-3 select-none ${
        inverted ? 'bg-white text-black' : 'bg-zinc-950 text-white'
      }`}
    >
      <div
        className={reverse ? 'animate-marquee-reverse' : 'animate-marquee'}
      >
        <div className="flex items-center gap-8 px-4 whitespace-nowrap shrink-0">
          {items.map((item, idx) => (
            <div key={`m1-${idx}`} className="flex items-center gap-8">
              <span className="font-heading font-black text-sm md:text-base tracking-widest uppercase">
                {item}
              </span>
              <span
                className={`w-2 h-2 ${
                  inverted ? 'bg-black' : 'bg-white'
                } shrink-0`}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-8 px-4 whitespace-nowrap shrink-0">
          {items.map((item, idx) => (
            <div key={`m2-${idx}`} className="flex items-center gap-8">
              <span className="font-heading font-black text-sm md:text-base tracking-widest uppercase">
                {item}
              </span>
              <span
                className={`w-2 h-2 ${
                  inverted ? 'bg-black' : 'bg-white'
                } shrink-0`}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
