import React from 'react';
import { SloganBanner } from '../components/SloganBanner';
import { MarqueeStrip } from '../components/MarqueeStrip';
import { Target, BookOpenCheck, Flame, ArrowRight } from 'lucide-react';
import { NavPage } from '../components/Navbar';
import { SiteContent } from '../data/siteContent';

interface AboutPageProps {
  content?: SiteContent['about'];
  onNavigate: (page: NavPage) => void;
}

const DEFAULT_ABOUT: SiteContent['about'] = {
  header: {
    badge: 'OUR PURPOSE & CALLING',
    titleLine1: 'WE ARE THE TRUST.',
    titleLine2: 'WE ARE THE TRIBE.',
    description:
      'Founded by veteran college faculty and software architects to deliver engineering clarity, eliminate backlog dread, and give students back their weekends.'
  },
  story: {
    badge: 'CHAPTER 01 · THE PROBLEM',
    headline: 'Higher education was designed in 1982. Students live in 2026.',
    paragraph1:
      'Every semester, 1.5 million Indian engineering students are handed 1,200-page foreign author textbooks, obscure photocopied notes, and PowerPoint slides read verbatim by bored lecturers.',
    paragraph2:
      "When end-term exams approach, panic sets in. Students pull frantic all-nighters, hunting through 10 disparate YouTube playlists and illegible xerox packets. We realized: this isn't a student problem. It’s an educational delivery failure.",
    quoteBox:
      "Students don’t need more data. They need distilled signal, structured answers, and teachers who know the pain of exam halls.",
    imageUrl: '/src/assets/images/tribe_campus_bw_1793717857750.jpg',
    imageAlt: 'Engineering students discussing notes in concrete library'
  },
  pillarsBadge: 'THE THREE LAWS',
  pillarsTitle: "Why Techie Teacher's Tribe Trust Exists",
  pillars: [
    {
      number: '01',
      title: 'The 10-Mark Answer Formula',
      description:
        'University evaluators spend 90 seconds scanning an answer sheet. Our handwritten notes teach you the exact diagram layouts, bold keywords, and proof deductions that score full marks every single time.',
      tag: 'MAXIMUM MARKS PER MINUTE'
    },
    {
      number: '02',
      title: '3-Hour Fast-Track Modules',
      description:
        'Why spend 45 hours watching rambling lectures when the core concepts can be decoded in 3 high-intensity hours? Our crash courses cut directly to the exam numericals and derivations.',
      tag: '10X LEARNING VELOCITY'
    },
    {
      number: '03',
      title: 'Pocket-Money Pricing',
      description:
        'Ed-tech has become an overpriced racket of ₹50,000 corporate bootcamps. The Tribe is registered as a student-first trust: all our notes and courses are priced under ₹1,500 with zero subscription traps.',
      tag: 'HONEST ACCESSIBLE PRICING'
    }
  ],
  marqueeItems: [
    'THE TRIBE MANIFESTO',
    'ACADEMIC RIGOR',
    'NO BACKLOGS',
    'STUDENT FIRST',
    '180+ UNIVERSITIES'
  ]
};

export const AboutPage: React.FC<AboutPageProps> = ({ content = DEFAULT_ABOUT, onNavigate }) => {
  const [imgError, setImgError] = React.useState(false);
  const pillarIcons = [<Target className="w-6 h-6" />, <Flame className="w-6 h-6" />, <BookOpenCheck className="w-6 h-6" />];

  return (
    <div className="w-full bg-black text-white select-none">
      {/* Header section */}
      <section className="border-b-2 border-white py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-mono-numbers">
            {content.header.badge}
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight uppercase mt-4">
            {content.header.titleLine1}
            <br />
            <span className="text-zinc-500">{content.header.titleLine2}</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto mt-6 leading-relaxed">
            {content.header.description}
          </p>
        </div>
      </section>

      <MarqueeStrip items={content.marqueeItems} />

      {/* The Story & Mission Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
              {content.story.badge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase tracking-tight">
              {content.story.headline}
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {content.story.paragraph1}
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {content.story.paragraph2}
            </p>
            <div className="p-4 border-2 border-white bg-zinc-950 text-xs font-mono-numbers">
              "{content.story.quoteBox}"
            </div>
          </div>

          <div className="lg:col-span-6 border-4 border-white shadow-[10px_10px_0px_0px_#ffffff] overflow-hidden bg-zinc-950">
            {imgError || !content.story.imageUrl ? (
              <div className="w-full h-96 flex flex-col items-center justify-center p-8 text-center">
                <BookOpenCheck className="w-12 h-12 text-white mb-3" />
                <div className="font-heading font-black uppercase text-lg">Academic Clarity Archive</div>
                <div className="text-xs font-mono-numbers text-zinc-400 mt-1">180+ UNIVERSITIES · ZERO FILLER</div>
              </div>
            ) : (
              <img
                src={content.story.imageUrl}
                alt={content.story.imageAlt}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-96 object-cover filter grayscale contrast-125 hover:scale-105 transition-transform duration-500"
              />
            )}
          </div>
        </div>

        {/* Why We Exist: Core Pillars */}
        <div className="border-t-2 border-white pt-16">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-mono-numbers">
              {content.pillarsBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase mt-2">
              {content.pillarsTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.pillars.map((pillar, idx) => (
              <div key={idx} className="p-8 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-bold mb-6 border border-black">
                    {pillarIcons[idx % pillarIcons.length]}
                  </div>
                  <h3 className="text-xl font-heading font-black uppercase mb-3">
                    {pillar.number}. {pillar.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800 text-xs font-mono-numbers text-zinc-500">
                  {pillar.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slogan Banner */}
      <SloganBanner
        variant="standard"
        slogan="Learn Smart. Learn Fast."
        subtext="The syllabus is vast. Your time is finite. Choose the tribe that values your time."
      />

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="border-4 border-white p-8 sm:p-12 bg-zinc-950 shadow-[10px_10px_0px_0px_#ffffff]">
          <h3 className="text-2xl sm:text-4xl font-heading font-black uppercase">
            Ready to turn your SGPA around?
          </h3>
          <p className="text-zinc-400 text-sm mt-3 max-w-xl mx-auto">
            Browse our catalog of semester-wise courses and handwritten formula notes. Instant digital access on desktop and mobile.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('courses')}
              className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 border-2 border-white"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('team')}
              className="w-full sm:w-auto min-h-[44px] px-8 py-3.5 bg-black text-white font-bold uppercase text-xs tracking-wider hover:bg-zinc-900 transition-colors border-2 border-white"
            >
              <span>Meet the Teachers</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
