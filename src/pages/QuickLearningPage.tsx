import React, { useState } from 'react';
import { Course } from '../data/db';
import { SloganBanner } from '../components/SloganBanner';
import { MarqueeStrip } from '../components/MarqueeStrip';
import { Zap, Clock, Star, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { SiteContent } from '../data/siteContent';

interface QuickLearningPageProps {
  courses: Course[];
  content?: SiteContent['quickLearning'];
  onAddToCart: (course: Course) => void;
  onDirectBuy: (course: Course) => void;
  onOpenCourseModal: (course: Course) => void;
  isInCart: (courseId: string) => boolean;
}

const DEFAULT_QUICK_LEARNING: SiteContent['quickLearning'] = {
  header: {
    badge: 'EXAM NIGHT ACCELERATOR',
    title: 'Quick Learning & Fast-Track Sprints',
    description:
      'When you have 48 hours until the invigilator rings the bell, you cannot afford 50 hours of slow lecture playback. These high-speed sprint modules decode high-scoring questions in under 3 hours.'
  },
  sosBannerTitle: 'Instant Pass Toolkit: Formulas + Proof Derivations',
  sosBannerSubtext:
    'Compiled specially for students staring down tomorrow morning’s 09:30 AM exam session. Guaranteed high yield.',
  marqueeItems: [
    'RANKED LEADERBOARD',
    'FAST-TRACK CRASH PACKS',
    'TOP TRENDING',
    'PASS IN 3 HOURS',
    'SOLVED 10-YEAR PAPERS'
  ],
  features: [
    {
      title: '3-Hour Complete Syllabus Overviews',
      description: 'Zero waffle, strictly concepts that appear in Part B & Part C questions.'
    },
    {
      title: 'Handwritten Proof & Derivation Sheets',
      description: 'Scanned 600 DPI crisp handwritten pages with color-coded key step markings.'
    },
    {
      title: '10-Year Question Trend Matrix',
      description: 'Predictable repeat questions flagged with high-probability markers.'
    }
  ]
};

export const QuickLearningPage: React.FC<QuickLearningPageProps> = ({
  courses,
  content = DEFAULT_QUICK_LEARNING,
  onAddToCart,
  onDirectBuy,
  onOpenCourseModal,
  isInCart
}) => {
  const [heroImgError, setHeroImgError] = useState(false);

  const approvedCourses = courses.filter((c) => c.isApproved);
  const trendingCourses = approvedCourses
    .filter((c) => c.isTrending)
    .sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));

  const carouselPool = React.useMemo(() => {
    const fastTrack = approvedCourses.filter(
      (c) =>
        c.isTrending ||
        c.category === 'Crash Course' ||
        c.category === 'Exam Booster' ||
        c.category === 'Handwritten Notes'
    );
    const list = fastTrack.length > 0 ? fastTrack : approvedCourses;
    return list.slice(0, 5);
  }, [approvedCourses]);

  // Quick carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const safeIndex = carouselPool.length > 0 ? carouselIndex % carouselPool.length : 0;
  const activeCarouselCourse = carouselPool[safeIndex] || null;

  const nextCarousel = () => {
    if (carouselPool.length <= 1) return;
    setCarouselIndex((prev) => (prev + 1) % carouselPool.length);
  };

  const prevCarousel = () => {
    if (carouselPool.length <= 1) return;
    setCarouselIndex((prev) => (prev - 1 + carouselPool.length) % carouselPool.length);
  };

  return (
    <div className="w-full bg-black text-white select-none">
      {/* Header section with flatlay desk image split */}
      <section className="border-b-2 border-white py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-black font-mono-numbers text-xs font-black uppercase mb-4">
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>{content.header.badge}</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight uppercase leading-[0.95]">
                {content.header.title}
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base mt-4 max-w-xl leading-relaxed">
                {content.header.description}
              </p>
            </div>

            <div className="lg:col-span-5 border-4 border-white shadow-[8px_8px_0px_0px_#ffffff] overflow-hidden bg-black">
              {heroImgError ? (
                <div className="w-full h-64 flex flex-col items-center justify-center p-6 text-center">
                  <Zap className="w-10 h-10 text-white mb-2" />
                  <div className="font-heading font-black uppercase text-base">
                    {content.sosBannerTitle}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">{content.sosBannerSubtext}</div>
                </div>
              ) : (
                <img
                  src="/src/assets/images/student_desk_bw_1793717857911.jpg"
                  alt="Student study desk with handwritten formula notes"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-64 object-cover filter grayscale contrast-125 hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <MarqueeStrip items={content.marqueeItems} />

      {/* CMS Features / Instant Pass Toolkit Strip */}
      {content.features && content.features.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
              EXAM SOS PROTOCOL
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-black uppercase mt-1">
              {content.sosBannerTitle}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{content.sosBannerSubtext}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-5 bg-zinc-950 border-2 border-zinc-800 hover:border-white transition-colors"
              >
                <div className="text-xs font-mono-numbers font-black text-zinc-500 mb-1">
                  0{idx + 1}
                </div>
                <h3 className="font-heading font-bold uppercase text-sm text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Fast-Track Carousel Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8 border-b-2 border-white pb-4 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
              SPOTLIGHT CAROUSEL
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
              High-Velocity Crash Packs
            </h2>
          </div>

          {carouselPool.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={prevCarousel}
                className="min-h-[44px] min-w-[44px] p-2 border-2 border-white hover:bg-white hover:text-black transition-colors flex items-center justify-center"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono-numbers px-2 text-zinc-400 tabular-nums">
                {safeIndex + 1} / {carouselPool.length}
              </span>
              <button
                onClick={nextCarousel}
                className="min-h-[44px] min-w-[44px] p-2 border-2 border-white hover:bg-white hover:text-black transition-colors flex items-center justify-center"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Active Carousel Card */}
        {!activeCarouselCourse ? (
          <div className="bg-zinc-950 border-2 border-zinc-800 p-10 text-center text-xs font-mono-numbers text-zinc-400">
            No approved fast-track courses published yet.
          </div>
        ) : (
          <div className="bg-zinc-950 border-4 border-white p-6 sm:p-10 shadow-[10px_10px_0px_0px_#ffffff]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono-numbers">
                  <span className="bg-white text-black font-black px-2 py-0.5 uppercase">
                    {activeCarouselCourse.category}
                  </span>
                  <span className="text-zinc-400">CODE: {activeCarouselCourse.code}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="flex items-center gap-1 text-white">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activeCarouselCourse.duration}</span>
                  </span>
                </div>

                <h3
                  onClick={() => onOpenCourseModal(activeCarouselCourse)}
                  className="text-2xl sm:text-4xl font-heading font-black uppercase tracking-tight cursor-pointer hover:underline"
                >
                  {activeCarouselCourse.title}
                </h3>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {activeCarouselCourse.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <button
                  onClick={() => onDirectBuy(activeCarouselCourse)}
                  className="min-h-[44px] px-8 py-3.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]"
                >
                  Instant Start · ₹{activeCarouselCourse.price}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenCourseModal(activeCarouselCourse)}
                    className="min-h-[44px] px-4 py-3 bg-black text-white font-bold uppercase text-xs tracking-wider hover:bg-zinc-900 transition-colors border-2 border-zinc-700 hover:border-white"
                  >
                    View Syllabus
                  </button>
                  <button
                    onClick={() => onAddToCart(activeCarouselCourse)}
                    className="min-h-[44px] px-4 py-3 bg-black text-white font-bold uppercase text-xs tracking-wider hover:bg-zinc-900 transition-colors border-2 border-zinc-700 hover:border-white"
                  >
                    {isInCart(activeCarouselCourse.id) ? 'In Cart' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Ranked "Top Trending" List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-mono-numbers">
            MOST ACCESSED THIS WEEK
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase tracking-tight mt-1">
            Top Trending Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Real-time ranked courses based on university student enrollments in the last 7 days.
          </p>
        </div>

        {trendingCourses.length === 0 ? (
          <div className="p-10 border-2 border-zinc-800 bg-zinc-950 text-center text-xs font-mono-numbers text-zinc-400">
            Trending leaderboard courses will appear here once courses are approved.
          </div>
        ) : (
          <div className="space-y-4">
            {trendingCourses.map((course, idx) => {
              const inCart = isInCart(course.id);
              const rankFormatted = `#0${idx + 1}`;

              return (
                <div
                  key={course.id}
                  className="p-6 bg-black border-2 border-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 transition-transform"
                >
                  {/* Left: Rank & Title */}
                  <div className="flex items-start sm:items-center gap-6">
                    {/* Big stark rank number */}
                    <div className="w-16 h-16 bg-white text-black font-heading font-black text-2xl flex items-center justify-center shrink-0 border-2 border-black font-mono-numbers">
                      {rankFormatted}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono-numbers text-zinc-400">
                        <span>{course.code}</span>
                        <span>·</span>
                        <span>{course.branch}</span>
                        <span>·</span>
                        <span className="border border-zinc-700 px-1.5 py-0.5 text-white">
                          {course.category}
                        </span>
                      </div>

                      <h3
                        onClick={() => onOpenCourseModal(course)}
                        className="text-lg sm:text-xl font-heading font-black uppercase hover:underline cursor-pointer mt-1"
                      >
                        {course.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2">
                        <span>Instructor: <strong className="text-zinc-200">{course.teacher}</strong></span>
                        <span className="text-zinc-600">·</span>
                        <div className="flex items-center gap-1 font-mono-numbers text-white font-bold">
                          <Star className="w-3.5 h-3.5 fill-white text-white" />
                          <span>{course.rating}</span>
                          <span className="text-zinc-500">({course.enrolledCount.toLocaleString()} enrolled)</span>
                        </div>
                        <span className="text-zinc-600">·</span>
                        <span className="font-mono-numbers text-zinc-300">
                          {course.duration} ({course.pdfPages} pages)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & CTA buttons */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-900">
                    <div className="text-left lg:text-right">
                      <div className="text-2xl font-black font-mono-numbers text-white">
                        ₹{course.price}
                      </div>
                      <div className="text-xs text-zinc-500 line-through font-mono-numbers">
                        ₹{course.originalPrice}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenCourseModal(course)}
                        className="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-zinc-700 hover:border-white transition-colors"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => onAddToCart(course)}
                        className={`min-h-[44px] px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white ${
                          inCart
                            ? 'bg-zinc-800 text-white'
                            : 'bg-white text-black hover:bg-zinc-200 shadow-[2px_2px_0px_0px_#ffffff]'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{inCart ? 'In Cart' : 'Add to Cart'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Slogan Banner */}
      <SloganBanner
        variant="standard"
        slogan="Your Tribe. Your Future."
        subtext="Don't spend another late night alone with disjointed slides. Join the tribe that gets it done."
      />
    </div>
  );
};
