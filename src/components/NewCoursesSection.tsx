import React, { useMemo } from 'react';
import { Course } from '../data/db';
import { NavPage } from './Navbar';
import {
  Sparkles,
  Plus,
  BookOpen,
  Clock,
  FileText,
  Star,
  ShoppingBag,
  ArrowRight,
  Edit3,
  Trash2,
  Check
} from 'lucide-react';

interface NewCoursesSectionProps {
  courses: Course[];
  canManageContent?: boolean;
  onNavigate: (page: NavPage) => void;
  onAddToCart: (course: Course) => void;
  onSelectCourse: (course: Course) => void;
  isInCart: (courseId: string) => boolean;
  onOpenCreateCourse: () => void;
  onOpenEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const NewCoursesSection: React.FC<NewCoursesSectionProps> = ({
  courses,
  canManageContent = false,
  onNavigate,
  onAddToCart,
  onSelectCourse,
  isInCart,
  onOpenCreateCourse,
  onOpenEditCourse,
  onDeleteCourse
}) => {
  // Filter approved new courses or take latest approved additions
  const approvedCourses = useMemo(() => courses.filter((c) => c.isApproved), [courses]);
  const newCourses = useMemo(() => {
    const explicitlyNew = approvedCourses.filter((c) => c.isNew);
    if (explicitlyNew.length > 0) return explicitlyNew;
    return approvedCourses.slice(-4).reverse();
  }, [approvedCourses]);

  return (
    <section className="border-b-2 border-white bg-zinc-950 py-20 px-4 sm:px-6 lg:px-8 relative select-none">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-2 border-white pb-6 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-zinc-400 font-mono-numbers">
              <Sparkles className="w-4 h-4 text-white" />
              <span>FRESH RELEASES · 2026 SEMESTER CATALOG</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase tracking-tight mt-2">
              New & Recently Added Courses
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Brand-new faculty masterclasses, fast-track exam busters, and high-yield handwritten formula packs published for current university syllabi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canManageContent && (
              <button
                onClick={onOpenCreateCourse}
                className="px-5 py-3 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-transform active:scale-95 flex items-center gap-2 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Course</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('courses')}
              className="px-4 py-3 border-2 border-zinc-700 bg-black text-white hover:border-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <span>View All Catalog ({approvedCourses.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* New Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newCourses.map((course) => {
            const inCart = isInCart(course.id);
            return (
              <div
                key={course.id}
                className="bg-black border-2 border-white flex flex-col justify-between shadow-[6px_6px_0px_0px_#ffffff] group hover:-translate-y-1 transition-transform duration-200 relative"
              >
                <div>
                  {/* Card top banner with "NEW ARRIVAL" pill and quick Edit action */}
                  <div className="p-4 bg-zinc-900 border-b-2 border-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono-numbers font-black px-2 py-0.5 bg-white text-black uppercase tracking-wider">
                        NEW ARRIVAL
                      </span>
                      <span className="text-xs font-mono-numbers font-bold text-zinc-300">
                        {course.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 border border-zinc-700 px-2 py-0.5">
                        {course.category}
                      </span>
                      {canManageContent && (
                        <>
                          <button
                            onClick={() => onOpenEditCourse(course)}
                            className="p-1 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors"
                            title="Edit course details"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCourse(course.id)}
                            className="p-1.5 border border-zinc-800 hover:border-red-500 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete course"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="text-xs text-zinc-400 font-semibold mb-1">
                      {course.branch} · {course.semester}
                    </div>

                    <h3
                      onClick={() => onSelectCourse(course)}
                      className="text-lg font-heading font-black uppercase text-white hover:underline cursor-pointer leading-snug line-clamp-2"
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

                {/* Card Footer with Price, Edit & Cart */}
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
                      className="px-3 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-700 hover:border-white transition-colors"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => onAddToCart(course)}
                      className={`px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white ${
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
      </div>
    </section>
  );
};
