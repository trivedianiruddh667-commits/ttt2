import React, { useState, useMemo, useEffect } from 'react';
import {
  Course,
  VerifiedTeacherProfile,
  doesCourseBelongToTeacher
} from '../data/db';
import { NavPage } from '../components/Navbar';
import { SloganBanner } from '../components/SloganBanner';
import {
  CheckCircle,
  GraduationCap,
  Mail,
  Search,
  ShieldCheck,
  ArrowUpRight,
  Award,
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  Star,
  ShoppingBag,
  Users,
  X,
  Share2
} from 'lucide-react';
import { shareContentSafely } from '../lib/downloadUtils';

interface TeachersPageProps {
  teacherProfiles: VerifiedTeacherProfile[];
  verifiedTeacherEmails: string[];
  courses: Course[];
  onAddToCart: (course: Course) => void;
  onDirectBuy: (course: Course) => void;
  isInCart: (courseId: string) => boolean;
  onOpenCourseModal: (course: Course) => void;
  selectedTeacherEmail: string | null;
  onSelectTeacherEmail: (email: string | null) => void;
  onNavigate: (page: NavPage) => void;
  onOpenRequestTeacherModal?: () => void;
  onNotify?: (msg: string) => void;
}

interface TeacherCardPortraitProps {
  photoUrl: string;
  name: string;
  email: string;
  className?: string;
}

const TeacherCardPortrait: React.FC<TeacherCardPortraitProps> = ({
  photoUrl,
  name,
  email,
  className = 'w-full h-full object-cover filter grayscale contrast-125 group-hover:contrast-150 group-hover:scale-105 transition-all duration-300'
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  const initials = (name || email)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  if (!photoUrl.trim() || imgError) {
    return (
      <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-6 text-center group-hover:bg-zinc-800 transition-colors">
        <div className="w-24 h-24 border-2 border-white bg-black flex items-center justify-center mb-3 shadow-[4px_4px_0px_0px_#ffffff] group-hover:scale-105 transition-transform">
          {initials ? (
            <span className="font-heading font-black text-3xl text-white tracking-tight">
              {initials}
            </span>
          ) : (
            <GraduationCap className="w-10 h-10 text-white" />
          )}
        </div>
        <span className="text-[10px] font-mono-numbers uppercase tracking-widest text-zinc-400">
          VERIFIED FACULTY MONOGRAM
        </span>
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={className}
    />
  );
};

export const TeachersPage: React.FC<TeachersPageProps> = ({
  teacherProfiles,
  verifiedTeacherEmails,
  courses,
  onAddToCart,
  onDirectBuy,
  isInCart,
  onOpenCourseModal,
  selectedTeacherEmail,
  onSelectTeacherEmail,
  onNavigate,
  onOpenRequestTeacherModal,
  onNotify
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Strict enforcement: ONLY profiles whose email is currently in the Admin-verified whitelist AND marked visible
  const verifiedEmailSet = useMemo(
    () => new Set(verifiedTeacherEmails.map((em) => em.trim().toLowerCase())),
    [verifiedTeacherEmails]
  );

  const verifiedPublicTeachers = useMemo(
    () =>
      teacherProfiles.filter(
        (profile) =>
          verifiedEmailSet.has(profile.email.trim().toLowerCase()) && profile.isVisible
      ),
    [teacherProfiles, verifiedEmailSet]
  );

  const selectedTeacher = useMemo(() => {
    if (!selectedTeacherEmail) return null;
    const norm = selectedTeacherEmail.trim().toLowerCase();
    return (
      verifiedPublicTeachers.find(
        (t) => t.email.trim().toLowerCase() === norm
      ) || null
    );
  }, [selectedTeacherEmail, verifiedPublicTeachers]);

  // If selected teacher was revoked or hidden, return gracefully to directory
  useEffect(() => {
    if (selectedTeacherEmail && !selectedTeacher) {
      onSelectTeacherEmail(null);
    }
  }, [selectedTeacherEmail, selectedTeacher, onSelectTeacherEmail]);

  const getTeacherApprovedCourses = (teacher: VerifiedTeacherProfile): Course[] =>
    courses.filter((c) => c.isApproved && doesCourseBelongToTeacher(c, teacher));

  const openTeacherCoursesView = (email: string) => {
    setCourseSearch('');
    setSelectedCategory('All');
    onSelectTeacherEmail(email);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- DEDICATED TEACHER PROFILE & UPLOADED COURSES VIEW ---
  if (selectedTeacher) {
    const teacherCourses = getTeacherApprovedCourses(selectedTeacher);
    const totalStudents = teacherCourses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
    const avgRating =
      teacherCourses.length > 0
        ? (
            teacherCourses.reduce((sum, c) => sum + (c.rating || 5), 0) /
            teacherCourses.length
          ).toFixed(1)
        : null;

    const categories = ['All', 'Full Course', 'Crash Course', 'Handwritten Notes', 'Exam Booster'];
    const filteredTeacherCourses = teacherCourses.filter((c) => {
      const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
      const q = courseSearch.trim().toLowerCase();
      if (!q) return matchesCat;
      const matchesText =
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.branch.toLowerCase().includes(q) ||
        c.semester.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      return matchesCat && matchesText;
    });

    return (
      <div className="w-full bg-black text-white select-none min-h-screen">
        {/* Top Back Navigation Strip */}
        <div className="border-b border-zinc-800 bg-zinc-950 py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                onSelectTeacherEmail(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="min-h-[44px] inline-flex items-center gap-2 text-xs font-mono-numbers font-bold uppercase text-zinc-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Verified Teachers</span>
            </button>

            <span className="text-[11px] font-mono-numbers text-zinc-400">
              VERIFIED EDUCATOR CATALOG · {teacherCourses.length}{' '}
              {teacherCourses.length === 1 ? 'COURSE' : 'COURSES'}
            </span>
          </div>
        </div>

        {/* Dedicated Teacher Profile Banner */}
        <section className="border-b-2 border-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Portrait Column */}
            <div className="lg:col-span-4 border-2 border-white bg-black overflow-hidden shadow-[8px_8px_0px_0px_#ffffff] aspect-[4/3] lg:aspect-auto lg:min-h-[300px]">
              <TeacherCardPortrait
                photoUrl={selectedTeacher.photoUrl}
                name={selectedTeacher.name}
                email={selectedTeacher.email}
                className="w-full h-full object-cover filter grayscale contrast-125"
              />
            </div>

            {/* Educator Bio & Live Stats Column */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Verified Email Pill + Email & Share CTAs */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black border border-emerald-500/80">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-mono-numbers font-bold text-white">
                      {selectedTeacher.email}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-mono-numbers font-black uppercase">
                      VERIFIED
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await shareContentSafely({
                          title: `${selectedTeacher.name} · Verified Educator`,
                          text: `${selectedTeacher.name} (${selectedTeacher.qualification}) — ${teacherCourses.length} courses on Techie Teacher's Tribe Trust`
                        });
                        if (res === 'copied') onNotify?.(`Copied profile details for ${selectedTeacher.name}`);
                        else if (res === 'shared') onNotify?.(`Shared ${selectedTeacher.name}'s profile`);
                      }}
                      className="min-h-[44px] px-3.5 py-2 border-2 border-zinc-700 hover:border-white bg-black text-xs font-mono-numbers font-bold uppercase text-white inline-flex items-center gap-2 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>

                    <a
                      href={`mailto:${selectedTeacher.email}?subject=${encodeURIComponent(
                        `Academic Query for ${selectedTeacher.name}`
                      )}`}
                      className="min-h-[44px] px-3.5 py-2 border-2 border-zinc-700 hover:border-white bg-black text-xs font-mono-numbers font-bold uppercase text-white inline-flex items-center gap-2 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Contact Teacher</span>
                    </a>
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl sm:text-5xl font-heading font-black uppercase tracking-tight [text-wrap:balance]">
                    {selectedTeacher.name}
                  </h1>
                  <div className="mt-2 flex items-start gap-2 text-xs sm:text-sm font-mono-numbers font-semibold text-zinc-300">
                    <Award className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>{selectedTeacher.qualification}</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
                  {selectedTeacher.intro}
                </p>
              </div>

              {/* Dynamic Metrics Strip */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800">
                <div className="p-4 bg-black border-2 border-white">
                  <div className="text-[10px] font-mono-numbers uppercase text-zinc-400">
                    UPLOADED COURSES
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-white mt-1 tabular-nums">
                    {teacherCourses.length}
                  </div>
                </div>

                <div className="p-4 bg-black border-2 border-white">
                  <div className="text-[10px] font-mono-numbers uppercase text-zinc-400">
                    STUDENTS ENROLLED
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-white mt-1 tabular-nums">
                    {totalStudents > 0 ? `${totalStudents.toLocaleString()}+` : '0'}
                  </div>
                </div>

                <div className="p-4 bg-black border-2 border-white">
                  <div className="text-[10px] font-mono-numbers uppercase text-zinc-400">
                    AVG COURSE RATING
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-white mt-1 flex items-center gap-1.5 tabular-nums">
                    {avgRating ? (
                      <>
                        <Star className="w-5 h-5 fill-white text-white shrink-0" />
                        <span>{avgRating}</span>
                      </>
                    ) : (
                      <span className="text-lg sm:text-xl">NEW</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Teacher's Uploaded Courses Catalog */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400">
                PUBLISHED SYLLABUS &amp; TOPPER NOTES
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black uppercase mt-1">
                Courses Uploaded by {selectedTeacher.name}
              </h2>
            </div>
            <div className="text-xs font-mono-numbers text-zinc-400 tabular-nums">
              SHOWING <strong className="text-white">{filteredTeacherCourses.length}</strong> OF{' '}
              <strong className="text-white">{teacherCourses.length}</strong> UPLOADED
            </div>
          </div>

          {teacherCourses.length === 0 ? (
            <div className="p-12 sm:p-16 border-4 border-white bg-zinc-950 text-center shadow-[8px_8px_0px_0px_#ffffff]">
              <BookOpen className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-black uppercase text-white">
                0 Courses Uploaded Yet
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-3 max-w-lg mx-auto leading-relaxed">
                {selectedTeacher.name} is a verified faculty member on Techie Teacher&apos;s Tribe Trust, and has not published any courses or note packs yet. Any course uploaded via their verified Teachers Portal will appear here automatically.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => {
                    onNavigate('courses');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-white text-black font-black uppercase text-xs tracking-wider border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] hover:bg-zinc-200 transition-colors"
                >
                  Browse All Platform Courses
                </button>
                <button
                  onClick={() => onSelectTeacherEmail(null)}
                  className="px-6 py-3 bg-black text-white font-bold uppercase text-xs tracking-wider border-2 border-zinc-700 hover:border-white transition-colors"
                >
                  Back to Verified Teachers
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Filter Bar for Teacher's Courses */}
              <div className="mb-8 p-4 bg-zinc-950 border-2 border-white flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder={`Search courses by ${selectedTeacher.name}...`}
                    className="w-full bg-black border-2 border-zinc-700 pl-10 pr-9 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                  {courseSearch && (
                    <button
                      onClick={() => setCourseSearch('')}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs font-mono-numbers font-bold">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 border uppercase transition-colors shrink-0 whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'border-white bg-white text-black'
                          : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTeacherCourses.length === 0 ? (
                <div className="p-12 border-2 border-zinc-800 bg-zinc-950 text-center">
                  <h3 className="text-xl font-heading font-black uppercase text-white">
                    No Courses Match That Filter
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2">
                    Try resetting your search or selecting &ldquo;All&rdquo; formats.
                  </p>
                  <button
                    onClick={() => {
                      setCourseSearch('');
                      setSelectedCategory('All');
                    }}
                    className="mt-5 px-5 py-2.5 bg-white text-black font-black uppercase text-xs border-2 border-white hover:bg-zinc-200 transition-colors"
                  >
                    Reset Course Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredTeacherCourses.map((course) => {
                    const inCart = isInCart(course.id);
                    return (
                      <div
                        key={course.id}
                        className="bg-black border-2 border-white flex flex-col justify-between shadow-[6px_6px_0px_0px_#ffffff] group hover:-translate-y-1 transition-all duration-200"
                      >
                        <div>
                          {/* Top Strip */}
                          <div className="p-4 bg-zinc-950 border-b-2 border-white flex items-center justify-between">
                            <span className="text-xs font-mono-numbers font-bold text-zinc-300">
                              {course.code}
                            </span>
                            <span className="text-[11px] uppercase tracking-wider font-bold text-white border border-zinc-700 px-2 py-0.5">
                              {course.category}
                            </span>
                          </div>

                          {/* Body */}
                          <div className="p-6">
                            <div className="text-xs text-zinc-400 font-semibold mb-1">
                              {course.branch} · {course.semester}
                            </div>

                            <h3
                              onClick={() => onOpenCourseModal(course)}
                              className="text-lg font-heading font-black uppercase leading-snug hover:underline cursor-pointer line-clamp-2"
                            >
                              {course.title}
                            </h3>

                            <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>

                            <div className="mt-4 pt-4 border-t border-zinc-900 grid grid-cols-3 gap-2 text-[11px] text-zinc-400 font-mono-numbers">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-white shrink-0" />
                                <span>{course.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-white shrink-0" />
                                <span className="tabular-nums">{course.modulesCount} Modules</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3 text-white shrink-0" />
                                <span className="tabular-nums">{course.pdfPages || 75}p Notes</span>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                              <span className="flex items-center gap-1 font-mono-numbers">
                                <Users className="w-3.5 h-3.5 text-zinc-500" />
                                <span className="tabular-nums">
                                  {course.enrolledCount.toLocaleString()} enrolled
                                </span>
                              </span>
                              <div className="flex items-center gap-1 text-white font-mono-numbers font-bold tabular-nums">
                                <Star className="w-3.5 h-3.5 fill-white text-white" />
                                <span>{course.rating}</span>
                                <span className="text-zinc-500">({course.reviewsCount})</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Price & Actions */}
                        <div className="p-4 bg-zinc-950 border-t-2 border-white flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-lg font-black font-mono-numbers text-white tabular-nums">
                              ₹{course.price}
                            </div>
                            <div className="text-[10px] text-zinc-500 line-through font-mono-numbers tabular-nums">
                              ₹{course.originalPrice}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onOpenCourseModal(course)}
                              className="px-3 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-700 hover:border-white transition-colors whitespace-nowrap"
                            >
                              Preview
                            </button>

                            <button
                              onClick={() => onAddToCart(course)}
                              className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white whitespace-nowrap ${
                                inCart
                                  ? 'bg-zinc-800 text-white'
                                  : 'bg-white text-black hover:bg-zinc-200 shadow-[2px_2px_0px_0px_#ffffff]'
                              }`}
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{inCart ? 'Added' : 'Add'}</span>
                            </button>

                            <button
                              onClick={() => onDirectBuy(course)}
                              className="px-3 py-2 text-xs font-black uppercase tracking-wider border border-white bg-black text-white hover:bg-white hover:text-black transition-colors whitespace-nowrap"
                            >
                              Buy
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>

        <SloganBanner
          variant="inverted"
          slogan={`Learn Directly with ${selectedTeacher.name}`}
          subtext="Every course listed above is verified, syllabus-aligned, and backed by handwritten topper notes."
        />
      </div>
    );
  }

  // --- DIRECTORY GRID VIEW (ALL VERIFIED TEACHERS) ---
  const filteredTeachers = verifiedPublicTeachers.filter((teacher) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      teacher.name.toLowerCase().includes(q) ||
      teacher.email.toLowerCase().includes(q) ||
      teacher.qualification.toLowerCase().includes(q) ||
      teacher.intro.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full bg-black text-white select-none min-h-screen">
      {/* Header Section */}
      <section className="border-b-2 border-white py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-black text-[11px] font-mono-numbers font-black uppercase tracking-widest border border-black mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN-VERIFIED EDUCATOR ROSTER</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight uppercase [text-wrap:balance]">
              Trending Teachers
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-4 leading-relaxed">
              Every educator listed here holds an academic email verified by the Trust Directorate. Click any teacher&apos;s profile to explore all courses and notes they have uploaded.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="p-4 bg-black border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
              <div className="text-[10px] font-mono-numbers uppercase tracking-wider text-zinc-400">
                VERIFIED FACULTY
              </div>
              <div className="text-3xl font-heading font-black text-white mt-1 tabular-nums">
                {verifiedPublicTeachers.length}
              </div>
            </div>
            <div className="p-4 bg-black border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
              <div className="text-[10px] font-mono-numbers uppercase tracking-wider text-emerald-400">
                STATUS CHECK
              </div>
              <div className="text-sm font-mono-numbers font-black text-white mt-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Directory Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="p-4 bg-zinc-950 border-2 border-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verified teachers by name, email, qualification, or specialization..."
              className="w-full bg-black border-2 border-zinc-700 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-white font-mono-numbers"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono-numbers text-zinc-400 px-1">
            <span className="tabular-nums">
              SHOWING <strong className="text-white">{filteredTeachers.length}</strong> OF{' '}
              <strong className="text-white">{verifiedPublicTeachers.length}</strong> VERIFIED
            </span>
          </div>
        </div>
      </section>

      {/* Public Verified Teachers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {filteredTeachers.length === 0 ? (
          <div className="p-12 sm:p-16 border-4 border-white bg-zinc-950 text-center shadow-[8px_8px_0px_0px_#ffffff]">
            <GraduationCap className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-black uppercase text-white">
              {verifiedPublicTeachers.length === 0
                ? 'No Verified Teacher Profiles Published Yet'
                : 'No Verified Teachers Match Your Search'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-3 max-w-lg mx-auto leading-relaxed">
              {verifiedPublicTeachers.length === 0
                ? 'Profiles appear here automatically as soon as the Trust Admin approves a faculty email and publishes their profile.'
                : 'Try clearing your search filter or searching by subject, qualification, or verified email.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-6 px-5 py-2.5 bg-white text-black font-black uppercase text-xs border-2 border-white hover:bg-zinc-200 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher) => {
              const teacherCourses = getTeacherApprovedCourses(teacher);
              const courseCount = teacherCourses.length;

              return (
                <article
                  key={teacher.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openTeacherCoursesView(teacher.email)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openTeacherCoursesView(teacher.email);
                    }
                  }}
                  aria-label={`View profile and uploaded courses for ${teacher.name}`}
                  className="bg-black border-2 border-white flex flex-col justify-between shadow-[6px_6px_0px_0px_#ffffff] group hover:-translate-y-1 transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <div>
                    {/* Portrait Photo Container */}
                    <div className="relative aspect-[4/3] bg-zinc-950 border-b-2 border-white overflow-hidden">
                      <TeacherCardPortrait
                        photoUrl={teacher.photoUrl}
                        name={teacher.name}
                        email={teacher.email}
                      />
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      {/* Verified Email Badge on Every Card */}
                      <div className="p-2.5 bg-zinc-950 border border-emerald-500/70 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-mono-numbers font-bold text-white truncate">
                            {teacher.email}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-mono-numbers font-black uppercase shrink-0">
                          VERIFIED
                        </span>
                      </div>

                      {/* Name & Qualification */}
                      <div>
                        <h2 className="text-2xl font-heading font-black uppercase tracking-tight text-white group-hover:underline">
                          {teacher.name}
                        </h2>
                        <div className="mt-2 flex items-start gap-2 text-xs font-mono-numbers font-semibold text-zinc-300 pb-3 border-b border-zinc-800">
                          <Award className="w-4 h-4 text-white shrink-0 mt-0.5" />
                          <span>{teacher.qualification}</span>
                        </div>
                      </div>

                      {/* Course Count Metadata Line */}
                      <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-300 tabular-nums">
                        <BookOpen className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>
                          <strong className="text-white">{courseCount}</strong>{' '}
                          {courseCount === 1 ? 'Course Uploaded' : 'Courses Uploaded'}
                        </span>
                      </div>

                      {/* Small Intro */}
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">
                        {teacher.intro}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-zinc-950 border-t-2 border-white flex items-center justify-between gap-3">
                    <a
                      href={`mailto:${teacher.email}?subject=${encodeURIComponent(
                        `Student Academic Query for ${teacher.name}`
                      )}`}
                      onClick={(e) => e.stopPropagation()}
                      className="min-h-[44px] px-2 text-xs font-mono-numbers font-bold uppercase text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTeacherCoursesView(teacher.email);
                      }}
                      className="min-h-[44px] px-3.5 py-2 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors border border-white flex items-center gap-1.5 whitespace-nowrap tabular-nums"
                    >
                      <span>View Courses ({courseCount})</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Educator Verification Request Banner */}
      {onOpenRequestTeacherModal && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="border-4 border-white bg-zinc-950 p-8 sm:p-10 shadow-[8px_8px_0px_0px_#ffffff] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400">
                FACULTY VERIFICATION PROGRAM
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
                Are You an Educator? Apply to Join This Verified Directory
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                Submit your academic email for Admin review. Once verified, your email unlocks the Teachers Portal and your verified faculty profile is published here automatically.
              </p>
            </div>
            <button
              onClick={onOpenRequestTeacherModal}
              className="px-6 py-4 bg-white text-black font-black uppercase text-xs sm:text-sm tracking-wider hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] shrink-0 flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Request Verification</span>
            </button>
          </div>
        </section>
      )}

      <SloganBanner
        variant="inverted"
        slogan="Verified Educators. Zero Compromises."
        subtext="Every profile listed above represents an academic email personally vetted by the Trust Directorate."
      />
    </div>
  );
};
