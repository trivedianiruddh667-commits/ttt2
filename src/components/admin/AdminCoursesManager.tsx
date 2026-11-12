import React, { useState, useMemo } from 'react';
import { Course, ContentStatus } from '../../data/db';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Copy,
  Eye,
  Trash2,
  Archive,
  RotateCcw,
  BookOpen,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AdminCoursesManagerProps {
  courses: Course[];
  onOpenCreateCourse: () => void;
  onOpenEditCourse: (course: Course) => void;
  onPreviewCourse: (course: Course) => void;
  onDuplicateCourse: (course: Course) => void;
  onUpdateStatus: (courseId: string, status: ContentStatus) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const AdminCoursesManager: React.FC<AdminCoursesManagerProps> = ({
  courses,
  onOpenCreateCourse,
  onOpenEditCourse,
  onPreviewCourse,
  onDuplicateCourse,
  onUpdateStatus,
  onDeleteCourse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContentStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.teacher.toLowerCase().includes(q) ||
        c.branch.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : c.status === statusFilter || (!c.status && statusFilter === 'draft');

      const matchesCategory =
        categoryFilter === 'all' || c.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [courses, searchQuery, statusFilter, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [courses]);

  const counts = useMemo(() => {
    let pub = 0;
    let draft = 0;
    let arch = 0;
    courses.forEach((c) => {
      if (c.status === 'published') pub++;
      else if (c.status === 'archived') arch++;
      else draft++;
    });
    return { pub, draft, arch, total: courses.length };
  }, [courses]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
            CENTRALIZED COURSE CMS
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white mt-1">
            Course & Notes Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Create, duplicate, preview, publish, and archive academic courses and topper notes.
          </p>
        </div>

        <button
          onClick={onOpenCreateCourse}
          className="px-5 py-3 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3 text-left border-2 transition-colors ${
            statusFilter === 'all'
              ? 'border-white bg-white text-black'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block">Total Catalog</span>
          <span className="text-xl font-heading font-black">{counts.total}</span>
        </button>

        <button
          onClick={() => setStatusFilter('published')}
          className={`p-3 text-left border-2 transition-colors ${
            statusFilter === 'published'
              ? 'border-emerald-400 bg-emerald-500 text-black'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block text-emerald-400">
            Published (Live)
          </span>
          <span className="text-xl font-heading font-black">{counts.pub}</span>
        </button>

        <button
          onClick={() => setStatusFilter('draft')}
          className={`p-3 text-left border-2 transition-colors ${
            statusFilter === 'draft'
              ? 'border-amber-400 bg-amber-400 text-black'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block text-amber-400">
            Drafts / Templates
          </span>
          <span className="text-xl font-heading font-black">{counts.draft}</span>
        </button>

        <button
          onClick={() => setStatusFilter('archived')}
          className={`p-3 text-left border-2 transition-colors ${
            statusFilter === 'archived'
              ? 'border-zinc-400 bg-zinc-700 text-white'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block text-zinc-400">
            Archived
          </span>
          <span className="text-xl font-heading font-black">{counts.arch}</span>
        </button>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, title, instructor, or branch..."
            className="w-full bg-black border-2 border-zinc-800 pl-9 pr-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter courses by category"
          className="bg-black border-2 border-zinc-800 px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
        >
          <option value="all">All Formats</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Courses List / Table */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center border-2 border-zinc-800 bg-zinc-950">
          <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-heading font-bold text-zinc-300 uppercase">
            No courses match the active filter
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Try clearing your search query or reset status filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-zinc-800">
          <table className="w-full text-left text-xs font-mono-numbers">
            <thead>
              <tr className="border-b-2 border-white bg-zinc-900 text-zinc-400 uppercase">
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Course / Subject Title</th>
                <th className="py-3 px-3">Category & Price</th>
                <th className="py-3 px-3">Publishing Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {filteredCourses.map((course) => {
                const currentStatus = course.status || (course.isApproved ? 'published' : 'draft');
                const isPub = currentStatus === 'published';
                const isArch = currentStatus === 'archived';

                return (
                  <tr key={course.id} className="hover:bg-zinc-900/60 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                      {course.code}
                    </td>

                    {/* Title & Mentor */}
                    <td className="py-3.5 px-3 min-w-[240px]">
                      <div className="font-bold text-white text-sm line-clamp-1">
                        {course.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                        <span>By {course.teacher}</span>
                        <span>·</span>
                        <span>{course.duration}</span>
                        <span>·</span>
                        <span>{course.pdfPages}p notes</span>
                      </div>
                    </td>

                    {/* Category & Price */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="inline-block px-1.5 py-0.5 border border-zinc-700 text-[10px] text-zinc-300 mb-1">
                        {course.category}
                      </div>
                      <div className="font-black text-white">₹{course.price}</div>
                    </td>

                    {/* Status Pill & 1-Click Toggle */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                            isPub
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                              : isArch
                              ? 'border-zinc-500 bg-zinc-800 text-zinc-400'
                              : 'border-amber-400 bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {currentStatus}
                        </span>

                        {/* Quick Action Toggle */}
                        {isPub ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(course.id, 'draft')}
                            className="px-2 py-0.5 bg-black hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-mono-numbers uppercase transition-colors"
                            title="Unpublish to Draft"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(course.id, 'published')}
                            className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-mono-numbers font-black uppercase transition-colors"
                            title="Publish Live immediately"
                          >
                            Publish Live
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPreviewCourse(course)}
                          className="p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                          title="Preview as Student"
                          aria-label={`Preview ${course.title}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenEditCourse(course)}
                          className="p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                          title="Edit Course"
                          aria-label={`Edit ${course.title}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDuplicateCourse(course)}
                          className="p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                          title="Duplicate as new Draft Template"
                          aria-label={`Duplicate ${course.title}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {isArch ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(course.id, 'draft')}
                            className="p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                            title="Restore to Draft"
                            aria-label={`Restore ${course.title}`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(course.id, 'archived')}
                            className="p-1.5 border border-zinc-700 hover:border-white text-zinc-400 hover:text-zinc-200 transition-colors"
                            title="Archive Course"
                            aria-label={`Archive ${course.title}`}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteCourse(course.id)}
                          className="p-1.5 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400 transition-colors"
                          title="Delete permanently"
                          aria-label={`Delete ${course.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
