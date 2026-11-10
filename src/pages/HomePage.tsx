import React from 'react';
import { BrandLogo } from '../components/BrandLogo';
import { SloganBanner } from '../components/SloganBanner';
import { MarqueeStrip } from '../components/MarqueeStrip';
import { Course, DailyNewsItem, STATS_LIST, TESTIMONIALS } from '../data/db';
import { SiteContent } from '../data/siteContent';
import { NavPage } from '../components/Navbar';
import { ArrowRight, Star, BookOpen, Clock, FileText, Check, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { DailyNewsSection } from '../components/DailyNewsSection';
import { NewCoursesSection } from '../components/NewCoursesSection';

interface HomePageProps {
  courses: Course[];
  newsList: DailyNewsItem[];
  siteContent?: SiteContent;
  canManageContent?: boolean;
  onNavigate: (page: NavPage) => void;
  onAddToCart: (course: Course) => void;
  onSelectCourse: (course: Course) => void;
  isInCart: (courseId: string) => boolean;
  onOpenArticle: (news: DailyNewsItem) => void;
  onOpenCreateNews: () => void;
  onOpenEditNews: (news: DailyNewsItem) => void;
  onDeleteNews: (newsId: string) => void;
  onOpenCreateCourse: () => void;
  onOpenEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  courses,
  newsList,
  siteContent,
  canManageContent = false,
  onNavigate,
  onAddToCart,
  onSelectCourse,
  isInCart,
  onOpenArticle,
  onOpenCreateNews,
  onOpenEditNews,
  onDeleteNews,
  onOpenCreateCourse,
  onOpenEditCourse,
  onDeleteCourse
}) => {
  const [editorialImgError, setEditorialImgError] = React.useState(false);
  const approvedCourses = courses.filter((c) => c.isApproved);
  const featuredCourses = approvedCourses.slice(0, 3);

  const heroContent = siteContent?.home.hero || {
    badge: 'BATTLE-TESTED CURRICULUM · ISO 9001:2015 COMPLIANT',
    headlinePart1: 'DOMINATE YOUR SEMESTER.',
    headlinePart2: 'BUILT BY TECHIE TEACHERS.',
    description:
      'Battle-tested university curriculum simplified. Concise handwritten topper notes, 3-hour fast-track exam busters, and university derivations for ambitious college students.',
    ctaExploreLabel: 'Explore Courses',
    ctaJoinLabel: 'Join the Tribe',
    trustStrip: ['OVER 180+ UNIVERSITIES', 'INSTANT DIGITAL ACCESS', 'ZERO FLUFF PROMISE']
  };

  const editorialContent = siteContent?.home.editorial || {
    badge: 'THE REALITY CHECK',
    headline: '900 Pages of Reference Books condensed into 60 high-yield pages.',
    description:
      'Semester syllabi are notorious for bulky 1,200-page foreign author textbooks that professors read off slides. We replace confusion with hand-drawn timing diagrams, proof templates that score 10/10, and crash courses you can finish over a single weekend.',
    imageUrl: '/src/assets/images/hero_students_bw_1793717856347.jpg',
    imageAlt: 'Engineering students studying with Techie Teacher notes',
    checkPoints: [
      'Step-by-step mathematical proofs with marking scheme hints',
      'Direct exam question patterns from last 10 years',
      'Physical delivery in 10 minutes via Blinkit & Zepto'
    ]
  };

  const statsList = siteContent?.home.stats || STATS_LIST;
  const slogans = siteContent?.home.slogans || {
    slogan1: 'Education, made simpler and smarter.',
    subtext1:
      'Zero jargon. Zero filler. Crafted by experienced professors who know exactly what examiners look for.',
    slogan2: 'From Notes to Knowledge.',
    subtext2:
      "Don't just pass. Understand the core principles and carry them straight into your placements and internships.",
    slogan3: 'Built by Teachers. Made for Students.',
    subtext3:
      "We are educators by trade, engineers by choice, and students' biggest allies by mission."
  };
  const testimonials = siteContent?.home.testimonials || TESTIMONIALS;

  return (
    <div className="w-full bg-black text-white select-none">
      {/* 1. Full-Screen Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center border-b-2 border-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        {/* Subtle monochrome geometric background grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #333333 1px, transparent 1px), linear-gradient(to bottom, #333333 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">
          {/* Logo prominently in hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <BrandLogo variant="hero" />
          </motion.div>

          {/* Big Bold Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black tracking-tighter uppercase leading-[0.92] mt-6 max-w-5xl"
            style={{ textWrap: 'balance' }}
          >
            {heroContent.headlinePart1}
            <br />
            <span className="text-zinc-400">{heroContent.headlinePart2}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl mt-6 font-normal leading-relaxed"
          >
            {heroContent.description}
          </motion.p>

          {/* CTA Buttons ("Explore Courses", "Join the Tribe") */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto"
          >
            <button
              onClick={() => onNavigate('courses')}
              className="w-full sm:w-auto min-h-[48px] px-8 py-4 bg-white text-black font-black uppercase text-sm tracking-wider hover:bg-zinc-200 transition-transform duration-150 active:scale-95 flex items-center justify-center gap-3 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff]"
            >
              <span>{heroContent.ctaExploreLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('student-login')}
              className="w-full sm:w-auto min-h-[48px] px-8 py-4 bg-black text-white font-black uppercase text-sm tracking-wider hover:bg-zinc-900 transition-transform duration-150 active:scale-95 flex items-center justify-center gap-3 border-2 border-white shadow-[6px_6px_0px_0px_#71717a]"
            >
              <span>{heroContent.ctaJoinLabel}</span>
            </button>
          </motion.div>

          {/* Trust strip below hero */}
          <div className="mt-14 pt-8 border-t border-zinc-800 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-mono-numbers text-zinc-400">
            {heroContent.trustStrip.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <MarqueeStrip items={siteContent?.home.marqueeItems} />

      {/* Hero Visual Editorial Split Frame */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border-4 border-white bg-black grid grid-cols-1 lg:grid-cols-12 shadow-[10px_10px_0px_0px_#ffffff]">
          <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 border-white bg-zinc-950 flex items-center justify-center">
            {editorialImgError || !editorialContent.imageUrl ? (
              <div className="p-10 text-center space-y-2">
                <BookOpen className="w-12 h-12 text-white mx-auto" />
                <div className="text-sm font-heading font-black uppercase">60-Page High-Yield Blueprint</div>
                <div className="text-xs font-mono-numbers text-zinc-400">DISTILLED EXAM NOTES · ZERO FLUFF</div>
              </div>
            ) : (
              <img
                src={editorialContent.imageUrl}
                alt={editorialContent.imageAlt}
                referrerPolicy="no-referrer"
                onError={() => setEditorialImgError(true)}
                className="w-full h-full object-cover filter grayscale contrast-125 hover:scale-105 transition-transform duration-500"
              />
            )}
          </div>
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-mono-numbers">
                {editorialContent.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-3 tracking-tight">
                {editorialContent.headline}
              </h2>
              <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
                {editorialContent.description}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800 space-y-3">
              {editorialContent.checkPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <Check className="w-4 h-4 text-white shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Counters with stark border blocks */}
      <section className="bg-zinc-950 border-y-2 border-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statsList.map((stat, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 bg-black border-2 border-white text-center shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 transition-transform"
              >
                <div className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-white font-mono-numbers">
                  {stat.value.toLocaleString()}
                  <span className="text-zinc-400">{stat.suffix}</span>
                </div>
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400 mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slogan Banner 1 */}
      <SloganBanner
        slogan={slogans.slogan1}
        subtext={slogans.subtext1}
      />

      {/* 2. New & Recently Added Courses Section */}
      <NewCoursesSection
        courses={courses}
        canManageContent={canManageContent}
        onNavigate={onNavigate}
        onAddToCart={onAddToCart}
        onSelectCourse={onSelectCourse}
        isInCart={isInCart}
        onOpenCreateCourse={onOpenCreateCourse}
        onOpenEditCourse={onOpenEditCourse}
        onDeleteCourse={onDeleteCourse}
      />

      {/* 3. Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-2 border-white pb-6 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-mono-numbers">
              CURATED EXAM ARSENAL
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase tracking-tight mt-1">
              Featured Courses & Notes
            </h2>
          </div>

          <button
            onClick={() => onNavigate('courses')}
            className="min-h-[44px] text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white flex items-center gap-2 group transition-colors"
          >
            <span>View All {approvedCourses.length} Courses</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3-column Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course) => {
            const inCart = isInCart(course.id);
            return (
              <div
                key={course.id}
                className="bg-black border-2 border-white flex flex-col justify-between shadow-[6px_6px_0px_0px_#ffffff] group hover:-translate-y-1 transition-transform duration-200"
              >
                <div>
                  {/* Card top banner */}
                  <div className="p-4 bg-zinc-950 border-b-2 border-white flex items-center justify-between">
                    <span className="text-xs font-mono-numbers font-bold text-zinc-400 uppercase">
                      {course.code}
                    </span>
                    <span className="text-xs uppercase tracking-wider font-bold text-white border border-zinc-700 px-2 py-0.5">
                      {course.category}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="text-xs text-zinc-400 font-semibold mb-1">
                      {course.branch} · {course.semester}
                    </div>

                    <h3
                      onClick={() => onSelectCourse(course)}
                      className="text-lg font-heading font-black uppercase hover:underline cursor-pointer leading-snug line-clamp-2"
                    >
                      {course.title}
                    </h3>

                    <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-zinc-900 grid grid-cols-3 gap-2 text-[11px] text-zinc-400 font-mono-numbers">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-white" />
                        <span>{course.modulesCount} Modules</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-white" />
                        <span>{course.pdfPages}p Notes</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                      <span>By <strong className="text-zinc-200">{course.teacher}</strong></span>
                      <div className="flex items-center gap-1 text-white font-mono-numbers font-bold">
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        <span>{course.rating}</span>
                        <span className="text-zinc-500">({course.reviewsCount})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Price and Add to Cart */}
                <div className="p-4 bg-zinc-950 border-t-2 border-white flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-black font-mono-numbers text-white">
                      ₹{course.price}
                    </div>
                    <div className="text-[10px] text-zinc-500 line-through font-mono-numbers">
                      ₹{course.originalPrice}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectCourse(course)}
                      className="min-h-[44px] px-3 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-700 hover:border-white transition-colors"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => onAddToCart(course)}
                      className={`min-h-[44px] px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white ${
                        inCart
                          ? 'bg-zinc-800 text-white'
                          : 'bg-white text-black hover:bg-zinc-200 shadow-[2px_2px_0px_0px_#ffffff]'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{inCart ? 'Added' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Slogan Banner 2 */}
      <SloganBanner
        variant="inverted"
        slogan={slogans.slogan2}
        subtext={slogans.subtext2}
      />

      {/* 4. Daily News & Academic Alerts Section */}
      <DailyNewsSection
        newsList={newsList}
        canManageContent={canManageContent}
        onOpenArticle={onOpenArticle}
        onOpenCreateNews={onOpenCreateNews}
        onOpenEditNews={onOpenEditNews}
        onDeleteNews={onDeleteNews}
      />

      {/* 5. Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-mono-numbers">
            STUDENT BARK & BITE
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase tracking-tight mt-2">
            Tested Under End-Term Fire
          </h2>
          <p className="text-sm text-zinc-400 mt-3">
            Real feedback from engineering students who salvaged their semester with Tribe materials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-8 bg-zinc-950 border-2 border-white flex flex-col justify-between shadow-[6px_6px_0px_0px_#ffffff]"
            >
              <div>
                <div className="text-2xl font-serif text-zinc-600 mb-2">“</div>
                <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                  {t.quote}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="font-heading font-bold text-sm text-white">
                    {t.student}
                  </div>
                  <span className="px-2 py-0.5 border border-white text-[10px] font-mono-numbers font-bold text-white">
                    {t.score}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 mt-1 font-mono-numbers">
                  {t.college}
                </div>
                <div className="text-[11px] text-zinc-500">
                  {t.branch}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Slogan Banner 3 */}
      <SloganBanner
        slogan={slogans.slogan3}
        subtext={slogans.subtext3}
      />
    </div>
  );
};
