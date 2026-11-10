import React, { useState, useMemo } from 'react';
import { Course } from '../data/db';
import { Search, ShoppingBag, Clock, BookOpen, FileText, Star, X, Share2 } from 'lucide-react';
import { shareContentSafely } from '../lib/downloadUtils';

interface CoursesPageProps {
  courses: Course[];
  onAddToCart: (course: Course) => void;
  onDirectBuy: (course: Course) => void;
  isInCart: (courseId: string) => boolean;
  selectedCourseForModal: Course | null;
  onOpenCourseModal: (course: Course) => void;
  onCloseCourseModal: () => void;
  initialInstructorFilter?: string | null;
  onClearInstructorFilter?: () => void;
  onNotify?: (msg: string) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({
  courses,
  onAddToCart,
  onDirectBuy,
  isInCart,
  onOpenCourseModal,
  initialInstructorFilter,
  onClearInstructorFilter,
  onNotify
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');

  const branches = ['All', 'Computer Science & IT', 'Electronics & Communication', 'Common for All Branches'];
  const categories = ['All', 'Full Course', 'Crash Course', 'Handwritten Notes', 'Exam Booster'];

  const filteredCourses = useMemo(() => {
    const instructorQuery = (initialInstructorFilter || '').trim().toLowerCase();
    return courses
      .filter((c) => c.isApproved) // Only approved courses shown to students
      .filter((c) => {
        const matchesInstructor =
          !instructorQuery || c.teacher.toLowerCase().includes(instructorQuery);
        const matchesSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesBranch = selectedBranch === 'All' || c.branch === selectedBranch;
        const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;

        return matchesInstructor && matchesSearch && matchesBranch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return b.enrolledCount - a.enrolledCount;
      });
  }, [courses, searchQuery, selectedBranch, selectedCategory, sortBy, initialInstructorFilter]);

  const handleShareCourse = async (course: Course) => {
    const res = await shareContentSafely({
      title: `${course.title} (${course.code})`,
      text: `Check out ${course.title} by ${course.teacher} on Techie Teacher's Tribe Trust — ₹${course.price}`
    });
    if (res === 'copied') {
      onNotify?.(`Course details copied to clipboard (${course.code}).`);
    } else if (res === 'shared') {
      onNotify?.(`Shared ${course.code}.`);
    } else {
      onNotify?.('Unable to share on this browser.');
    }
  };

  return (
    <div className="w-full bg-black text-white select-none min-h-screen">
      {/* Header section */}
      <section className="border-b-2 border-white py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-mono-numbers">
                CURRICULUM VAULT · 2026 EDITION
              </span>
              <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight uppercase mt-2">
                All Courses & Notes
              </h1>
              <p className="text-sm text-zinc-400 mt-2 max-w-xl">
                Browse our syllabus-matched university courses, high-yield topper handwritten notes, and fast-track formula kits.
              </p>
            </div>

            {/* Quick Stats Pill Strip */}
            <div className="flex items-center gap-4 text-xs font-mono-numbers border border-zinc-800 p-3 bg-black">
              <div>
                <span className="text-zinc-500">SHOWING:</span>{' '}
                <span className="text-white font-bold tabular-nums">{filteredCourses.length} COURSES</span>
              </div>
              <span className="text-zinc-700">|</span>
              <div>
                <span className="text-zinc-500">FORMAT:</span>{' '}
                <span className="text-white font-bold">PDF + VIDEO SPRINT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters Toolbar */}
      <div className="border-b-2 border-white bg-black sticky top-18 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject, code (e.g. CS-301), topic or teacher..."
                className="w-full min-h-[44px] bg-zinc-950 border-2 border-zinc-700 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear course search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Branch and Category Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono-numbers hidden sm:inline mr-1">
                  BRANCH:
                </span>
                <select
                  aria-label="Filter by branch"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="min-h-[44px] bg-zinc-950 border-2 border-zinc-700 text-xs text-white px-3 py-2.5 focus:outline-none focus:border-white uppercase font-bold"
                >
                  {branches.map((b) => (
                    <option key={b} value={b} className="bg-black text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono-numbers hidden sm:inline mr-1">
                  TYPE:
                </span>
                <select
                  aria-label="Filter by category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="min-h-[44px] bg-zinc-950 border-2 border-zinc-700 text-xs text-white px-3 py-2.5 focus:outline-none focus:border-white uppercase font-bold"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-black text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono-numbers hidden sm:inline mr-1">
                  SORT:
                </span>
                <select
                  aria-label="Sort courses"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'popular' | 'price-low' | 'price-high' | 'rating')}
                  className="min-h-[44px] bg-zinc-950 border-2 border-zinc-700 text-xs text-white px-3 py-2.5 focus:outline-none focus:border-white uppercase font-bold"
                >
                  <option value="popular">Most Enrolled</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {initialInstructorFilter && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-xs font-mono-numbers">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="px-2 py-0.5 bg-white text-black font-black uppercase text-[10px]">
                  FACULTY FILTER
                </span>
                <span>Showing courses taught by <strong className="text-white">{initialInstructorFilter}</strong></span>
              </div>
              {onClearInstructorFilter && (
                <button
                  type="button"
                  onClick={onClearInstructorFilter}
                  className="min-h-[36px] px-3 py-1 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white uppercase font-bold flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Faculty Filter</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Courses Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 border-2 border-zinc-800 bg-zinc-950 p-8">
            <h3 className="text-xl font-heading font-black uppercase text-white">
              No matching courses found
            </h3>
            <p className="text-zinc-400 text-sm mt-2">
              Try adjusting your branch filter or search term.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBranch('All');
                setSelectedCategory('All');
                onClearInstructorFilter?.();
              }}
              className="mt-6 min-h-[44px] px-6 py-2.5 border-2 border-white bg-white text-black font-bold uppercase text-xs hover:bg-zinc-200"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const inCart = isInCart(course.id);
              return (
                <div
                  key={course.id}
                  className="bg-black border-2 border-white flex flex-col justify-between shadow-[6px_6px_0px_0px_#ffffff] group hover:-translate-y-1 transition-all duration-200"
                >
                  <div>
                    {/* Top strip */}
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
                        <span>Instructor: <strong className="text-zinc-200">{course.teacher}</strong></span>
                        <div className="flex items-center gap-1 text-white font-mono-numbers font-bold">
                          <Star className="w-3.5 h-3.5 fill-white text-white" />
                          <span>{course.rating}</span>
                          <span className="text-zinc-500">({course.reviewsCount})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card bottom price and actions */}
                  <div className="p-4 bg-zinc-950 border-t-2 border-white flex items-center justify-between gap-2">
                    <div>
                      <div className="text-lg font-black font-mono-numbers text-white">
                        ₹{course.price}
                      </div>
                      <div className="text-[10px] text-zinc-500 line-through font-mono-numbers">
                        ₹{course.originalPrice}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleShareCourse(course)}
                        aria-label={`Share ${course.title}`}
                        title="Share course"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenCourseModal(course)}
                        className="min-h-[44px] px-3 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-700 hover:border-white transition-colors"
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => onAddToCart(course)}
                        className={`min-h-[44px] px-3.5 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white ${
                          inCart
                            ? 'bg-zinc-800 text-white'
                            : 'bg-white text-black hover:bg-zinc-200 shadow-[2px_2px_0px_0px_#ffffff]'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{inCart ? 'Added' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
