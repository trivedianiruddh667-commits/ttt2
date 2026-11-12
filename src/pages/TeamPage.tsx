import React from 'react';
import { TEACHERS_LIST, QuerySubmission } from '../data/db';
import { SloganBanner } from '../components/SloganBanner';
import { MarqueeStrip } from '../components/MarqueeStrip';
import { Star, GraduationCap, ArrowUpRight, Server, Terminal, Award } from 'lucide-react';
import { NavPage } from '../components/Navbar';
import { SiteContent, TechnicalStaffMember } from '../data/siteContent';
import { getTeacherRating } from '../lib/ratings';

interface TeamPageProps {
  content?: SiteContent['team'];
  queries?: QuerySubmission[];
  ratingOverrides?: Record<string, number>;
  onNavigate: (page: NavPage) => void;
  onOpenRequestTeacherModal?: () => void;
  onViewFacultyCourses?: (teacherName: string) => void;
}

const DEFAULT_TEAM: SiteContent['team'] = {
  header: {
    badge: 'FACULTY & ARCHITECTS',
    title: 'Our Tribe',
    description:
      "The educators behind Techie Teacher's Tribe Trust aren't corporate pitchmen. We are battle-hardened professors, former exam toppers, and system engineers who know what examiners evaluate."
  },
  founderSpotlightBadge: 'FOUNDER SPOTLIGHT',
  founderTitle: 'Ajay "Techie" Kalki',
  founderSub: 'Founder & Tribe Architect · Algorithms & Computer Systems',
  founderBio:
    'Over the past decade, Ajay has mentored more than 1500 students across India. Disillusioned with outdated university slides and bulky foreign textbooks, he created the high-yield note methodology that turned average semester scorers into university rank holders.',
  founderQuote:
    "Engineering is practical, elegant, and logical. When university textbooks make it feel like memorizing legal clauses, the student isn't failing — the pedagogy is. That’s why we founded this trust.",
  founderImageUrl: '/assets/aistudio/Founder_photo_94b319e5.png',
  members: TEACHERS_LIST.slice(1).map((t) => ({
    name: t.name,
    role: t.role,
    subject: t.subject,
    experience: t.experience,
    rating: t.rating,
    studentsTaught: t.studentsTaught,
    bio: t.bio
  })),
  technicalHeader: {
    badge: 'INFRASTRUCTURE & SYSTEMS CADRE',
    title: 'Technical Tribal',
    description:
      'The systems engineers and software architects building the high-speed infrastructure that delivers semester courses, real-time live doubt sessions, and handwritten notes without downtime.'
  },
  technicalMembers: [
    {
      name: 'Aniruddh Trivedi',
      role: 'Website Designer and Administrator',
      domain: 'UI/UX Architecture, Web Performance & Platform Administration',
      bio: "Lead designer and platform administrator of Techie Teacher's Tribe Trust. Architect of the high-impact visual design system, responsive student interfaces, and cloud platform operations.",
      experience: 'Lead Designer & Administrator',
      rating: 4.99,
      impactMetric: 'OFFICIAL PLATFORM ARCHITECT',
      imageUrl: '/assets/aistudio/Aniruddh_photo_47ab7886.png'
    },
    {
      name: 'Aryan Yadav',
      role: 'Researcher and Content Organiser',
      domain: 'Structuring Raw Information Into Organised Digital Assets, Websites And Knowledge Bases',
      bio: 'Specializes in structuring and transforming complex engineering curricula and raw research notes into organized, high-yield digital learning assets, structured portals, and student knowledge vaults.',
      experience: 'Content & Research Lead',
      rating: 4.97,
      impactMetric: 'CURRICULUM RESEARCH LEAD',
      imageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-12_at_13.57.50_756694f5.jpeg'
    }
  ],
  marqueeItems: [
    'FOUNDER & ARCHITECTS',
    'RESEARCHERS',
    'EX-IIT FACULTY',
    'TOPPER MENTORS',
    'ZERO JARGON'
  ]
};

export const TeamPage: React.FC<TeamPageProps> = ({
  content = DEFAULT_TEAM,
  queries = [],
  ratingOverrides = {},
  onNavigate,
  onOpenRequestTeacherModal,
  onViewFacultyCourses
}) => {
  const [founderImgError, setFounderImgError] = React.useState(false);
  const facultyMembers = content.members.length > 0 ? content.members : TEACHERS_LIST.slice(1);
  const technicalHeader = content.technicalHeader || DEFAULT_TEAM.technicalHeader!;
  const technicalMembers =
    content.technicalMembers && content.technicalMembers.length > 0
      ? content.technicalMembers
      : DEFAULT_TEAM.technicalMembers!;

  const founderStats = getTeacherRating(
    content.founderTitle,
    queries,
    ratingOverrides,
    4.98
  );

  return (
    <div className="w-full bg-black text-white select-none">
      {/* Header section with heading "Our Tribe" */}
      <section className="border-b-2 border-white py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-mono-numbers">
            {content.header.badge}
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight uppercase mt-2">
            {content.header.title || 'Our Tribe'}
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-4 max-w-2xl leading-relaxed">
            {content.header.description}
          </p>
        </div>
      </section>

      <MarqueeStrip items={content.marqueeItems} />

      {/* 1. Founder Section First */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="border-4 border-white bg-zinc-950 p-6 sm:p-12 shadow-[12px_12px_0px_0px_#ffffff]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Founder Editorial Portrait - Framed so folded arms and hands are completely visible */}
            <div className="lg:col-span-5 border-2 border-white overflow-hidden shadow-[6px_6px_0px_0px_#ffffff] bg-black">
              {founderImgError || !content.founderImageUrl ? (
                <div className="w-full h-[460px] sm:h-[520px] lg:h-[540px] flex flex-col items-center justify-center p-8 text-center">
                  <GraduationCap className="w-16 h-16 text-white mb-4" />
                  <div className="font-heading font-black uppercase text-xl">
                    {content.founderTitle}
                  </div>
                  <div className="text-xs font-mono-numbers text-zinc-400 mt-1">
                    {content.founderSpotlightBadge}
                  </div>
                </div>
              ) : (
                <div className="relative w-full overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src={content.founderImageUrl}
                    alt={`${content.founderTitle}, ${content.founderSub}`}
                    referrerPolicy="no-referrer"
                    onError={() => setFounderImgError(true)}
                    className="w-full h-[460px] sm:h-[520px] lg:h-[540px] object-cover object-[center_15%] filter grayscale contrast-125 hover:contrast-150 hover:scale-[1.02] transition-all duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-black border border-white px-2.5 py-1 text-xs font-mono-numbers font-bold text-white flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#ffffff]">
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span>{founderStats.finalRating}</span>
                    {founderStats.studentRatingsCount > 0 && (
                      <span className="text-[10px] text-zinc-400">({founderStats.studentRatingsCount} student evals)</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Founder Story & Vision */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <span className="bg-white text-black font-black text-xs px-2.5 py-0.5 font-mono-numbers uppercase tracking-wider">
                  {content.founderSpotlightBadge}
                </span>
                <span className="text-xs text-zinc-400 font-mono-numbers">
                  EST. TRIBE ARCHITECT
                </span>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase tracking-tight">
                  {content.founderTitle}
                </h2>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest font-mono-numbers mt-1">
                  {content.founderSub}
                </p>
              </div>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {content.founderBio}
              </p>

              <blockquote className="border-2 border-white bg-black p-4 text-xs sm:text-sm text-zinc-300 italic font-mono-numbers">
                “{content.founderQuote}”
              </blockquote>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800 text-xs font-mono-numbers">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">11+ Years</div>
                  <div className="text-zinc-500 uppercase mt-0.5">Track Record</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">1,500+</div>
                  <div className="text-zinc-500 uppercase mt-0.5">Students Mentored</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-1">
                    <Star className="w-4 h-4 fill-white text-white" />
                    <span>4.95</span>
                  </div>
                  <div className="text-zinc-500 uppercase mt-0.5">Student Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Grid of Teacher Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t-2 border-white">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-mono-numbers">
            SUBJECT MATTERS
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase mt-1">
            Core Department Faculty
          </h2>
          <p className="text-zinc-400 text-sm mt-2">
            Every teacher has authored university exam papers, topper guidebooks, and semester crash blueprints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facultyMembers.map((teacher, idx) => {
            const stats = getTeacherRating(teacher.name, queries, ratingOverrides, teacher.rating);
            return (
              <div
                key={idx}
                className="bg-black border-2 border-white flex flex-col justify-between shadow-[6px_6px_0px_0px_#ffffff] group hover:-translate-y-1 transition-transform"
              >
                <div>
                  {/* Greyscale Photo Area that turns sharp on hover */}
                  <div className="relative h-64 bg-zinc-950 border-b-2 border-white overflow-hidden flex items-center justify-center">
                    {/* High-contrast geometric portrait frame */}
                    <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-6 text-center group-hover:bg-zinc-800 transition-colors">
                      <div className="w-24 h-24 border-2 border-white bg-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_#ffffff] group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-12 h-12 text-white" />
                      </div>
                      <span className="text-xs font-mono-numbers text-zinc-400 uppercase tracking-wider">
                        {teacher.experience}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono-numbers">
                        {teacher.studentsTaught} ALUMNI
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 bg-black border border-white px-2 py-0.5 text-[10px] font-mono-numbers font-bold text-white flex items-center gap-1 shadow-[2px_2px_0px_0px_#ffffff]">
                      <Star className="w-3 h-3 fill-white text-white" />
                      <span>{stats.finalRating}</span>
                      {stats.studentRatingsCount > 0 && (
                        <span className="text-zinc-400 text-[9px]">({stats.studentRatingsCount})</span>
                      )}
                    </div>
                  </div>

                {/* Teacher Info */}
                <div className="p-6">
                  <span className="text-xs uppercase tracking-wider font-bold text-zinc-400 font-mono-numbers">
                    {teacher.role}
                  </span>
                  <h3 className="text-xl font-heading font-black uppercase mt-1">
                    {teacher.name}
                  </h3>
                  <div className="text-xs font-semibold text-zinc-200 mt-2 pb-2 border-b border-zinc-900">
                    Subject: {teacher.subject}
                  </div>
                  <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                    {teacher.bio}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 bg-zinc-950 border-t-2 border-white flex items-center justify-between gap-2">
                <button
                  onClick={() =>
                    onViewFacultyCourses ? onViewFacultyCourses(teacher.name) : onNavigate('courses')
                  }
                  className="min-h-[44px] px-2 text-xs font-bold uppercase tracking-wider text-white hover:underline flex items-center gap-1"
                >
                  <span>View Courses</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-zinc-500 font-mono-numbers">
                  VERIFIED TRUST MENTOR
                </span>
              </div>
            </div>
          );
        })}
        </div>
      </section>

      {/* 3. Technical Tribal Section - Identical Card Styling as Core Faculty */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t-2 border-white">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-mono-numbers">
            {technicalHeader.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase mt-1">
            {technicalHeader.title}
          </h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-3xl leading-relaxed">
            {technicalHeader.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
          {technicalMembers.map((member, idx) => {
            const stats = getTeacherRating(member.name, queries, ratingOverrides, member.rating);
            const resolvedImg =
              member.name === 'Aryan Yadav' &&
              (!member.imageUrl || member.imageUrl === '/assets/aistudio/Aryan_photo_2feeb48f.png')
                ? '/assets/aistudio/WhatsApp_Image_2026-11-12_at_13.57.50_756694f5.jpeg'
                : member.imageUrl;
            return (
              <div
                key={idx}
                className="bg-black border-2 border-white flex flex-col justify-between shadow-[6px_6px_0px_0px_#ffffff] group hover:-translate-y-1 transition-transform"
              >
                <div>
                  {/* High-contrast portrait frame showing subject and crossed arms */}
                  <div className="relative h-96 sm:h-[440px] bg-zinc-950 border-b-2 border-white overflow-hidden flex items-center justify-center">
                    {resolvedImg ? (
                      <img
                        src={resolvedImg}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-[center_15%] filter grayscale contrast-125 hover:contrast-150 hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-6 text-center group-hover:bg-zinc-800 transition-colors">
                        <div className="w-24 h-24 border-2 border-white bg-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_#ffffff] group-hover:scale-110 transition-transform">
                          {idx === 0 ? (
                            <Server className="w-12 h-12 text-white" />
                          ) : (
                            <Terminal className="w-12 h-12 text-white" />
                          )}
                        </div>
                        <span className="text-xs font-mono-numbers text-zinc-400 uppercase tracking-wider">
                          {member.experience}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono-numbers">
                          {member.impactMetric}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-black border border-white px-2 py-0.5 text-[10px] font-mono-numbers font-bold text-white flex items-center gap-1 shadow-[2px_2px_0px_0px_#ffffff]">
                      <Star className="w-3 h-3 fill-white text-white" />
                      <span>{stats.finalRating}</span>
                      {stats.studentRatingsCount > 0 && (
                        <span className="text-zinc-400 text-[9px]">({stats.studentRatingsCount})</span>
                      )}
                    </div>
                  </div>

                {/* Technical Staff Info */}
                <div className="p-6">
                  <span className="text-xs uppercase tracking-wider font-bold text-zinc-400 font-mono-numbers">
                    {member.role}
                  </span>
                  <h3 className="text-xl font-heading font-black uppercase mt-1">
                    {member.name}
                  </h3>
                  <div className="text-xs font-semibold text-zinc-200 mt-2 pb-2 border-b border-zinc-900">
                    Specialization: {member.domain}
                  </div>
                  <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>

              {/* Action / Status Footer - Button removed per request */}
              <div className="p-4 bg-zinc-950 border-t-2 border-white flex items-center justify-between gap-2">
                <span className="text-xs font-mono-numbers uppercase tracking-wider text-zinc-400">
                  {member.experience}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono-numbers">
                  TRUST TECHNICAL CADRE
                </span>
              </div>
            </div>
          );
        })}
        </div>
      </section>

      {/* Apply as Faculty / Teacher Email Verification CTA */}
      {onOpenRequestTeacherModal && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="border-4 border-white bg-zinc-950 p-8 sm:p-10 shadow-[8px_8px_0px_0px_#ffffff] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400">
                EDUCATOR ONBOARDING · VERIFICATION QUEUE
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
                Teach with Techie Teacher's Tribe Trust
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                Submit your academic email for Trust Admin verification. Once approved, your email unlocks the exclusive Teachers Portal to publish courses, crash modules, and topper notes.
              </p>
            </div>
            <button
              onClick={onOpenRequestTeacherModal}
              className="min-h-[44px] px-6 py-4 bg-white text-black font-black uppercase text-xs sm:text-sm tracking-wider hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] shrink-0 flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Request Teacher Verification</span>
            </button>
          </div>
        </section>
      )}

      {/* Slogan Banner */}
      <SloganBanner
        variant="inverted"
        slogan="Built by Teachers. Made for Students."
        subtext="No shareholders. No corporate boards. Just passionate educators obsessed with your grades."
      />
    </div>
  );
};
