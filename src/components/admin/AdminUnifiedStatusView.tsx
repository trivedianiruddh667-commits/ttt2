import React, { useState, useMemo } from 'react';
import { Course, QuickLearningItem, VerifiedTeacherProfile, ContentStatus } from '../../data/db';
import {
  Search,
  BookOpen,
  Zap,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle,
  Archive,
  RotateCcw,
  Edit3,
  ExternalLink,
  Users
} from 'lucide-react';

interface AdminUnifiedStatusViewProps {
  viewMode: 'drafts' | 'published' | 'archived';
  courses: Course[];
  quickLearningItems: QuickLearningItem[];
  teacherProfiles: VerifiedTeacherProfile[];
  onOpenEditCourse: (course: Course) => void;
  onOpenEditQuickLearning: (item: QuickLearningItem) => void;
  onOpenEditTeacher: (profile: VerifiedTeacherProfile) => void;
  onUpdateCourseStatus: (courseId: string, status: ContentStatus) => void;
  onUpdateQuickLearningStatus: (itemId: string, status: ContentStatus) => void;
  onUpdateTeacherStatus: (email: string, status: ContentStatus) => void;
}

export const AdminUnifiedStatusView: React.FC<AdminUnifiedStatusViewProps> = ({
  viewMode,
  courses,
  quickLearningItems,
  teacherProfiles,
  onOpenEditCourse,
  onOpenEditQuickLearning,
  onOpenEditTeacher,
  onUpdateCourseStatus,
  onUpdateQuickLearningStatus,
  onUpdateTeacherStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'courses' | 'quick-learning' | 'teachers'>('all');

  const targetStatus: ContentStatus =
    viewMode === 'drafts' ? 'draft' : viewMode === 'published' ? 'published' : 'archived';

  // Filter items matching target status
  const matchedCourses = useMemo(() => {
    return courses.filter((c) => {
      const s = c.status || (c.isApproved ? 'published' : 'draft');
      return s === targetStatus;
    });
  }, [courses, targetStatus]);

  const matchedQuickLearning = useMemo(() => {
    return quickLearningItems.filter((i) => i.status === targetStatus);
  }, [quickLearningItems, targetStatus]);

  const matchedTeachers = useMemo(() => {
    return teacherProfiles.filter((t) => {
      const s = t.status || (t.isVisible ? 'published' : 'draft');
      return s === targetStatus;
    });
  }, [teacherProfiles, targetStatus]);

  // Search filter
  const q = searchQuery.toLowerCase();
  const searchCourses = matchedCourses.filter(
    (c) => !q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  );
  const searchQuickLearning = matchedQuickLearning.filter(
    (i) => !q || i.title.toLowerCase().includes(q) || i.subject.toLowerCase().includes(q)
  );
  const searchTeachers = matchedTeachers.filter(
    (t) => !q || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
  );

  const totalCount = matchedCourses.length + matchedQuickLearning.length + matchedTeachers.length;

  const titleConfig = {
    drafts: {
      tag: 'CONTENT WORKBENCH & TEMPLATES',
      heading: 'Drafts & Reusable Templates',
      desc: 'All unpublished courses, quick learning sprint modules, and teacher profiles. Kept completely private from public visitors.',
      actionLabel: 'Publish Live',
      actionNextStatus: 'published' as ContentStatus
    },
    published: {
      tag: 'PUBLIC WEBSITE CONTENT MONITOR',
      heading: 'Published & Live Content',
      desc: 'Everything currently live and accessible to students and public visitors across teacherstribe.in. 1-click unpublish to draft removes it instantly.',
      actionLabel: 'Unpublish to Draft',
      actionNextStatus: 'draft' as ContentStatus
    },
    archived: {
      tag: 'HISTORICAL ARCHIVES',
      heading: 'Archived Content & Past Syllabi',
      desc: 'Retired courses, legacy topics, and inactive teacher profiles. Can be restored back to Draft at any time.',
      actionLabel: 'Restore to Draft',
      actionNextStatus: 'draft' as ContentStatus
    }
  }[viewMode];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
          {titleConfig.tag}
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white mt-1">
          {titleConfig.heading} ({totalCount})
        </h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          {titleConfig.desc}
        </p>
      </div>

      {/* Navigation & Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveSection('all')}
          className={`p-3 text-left border-2 transition-colors ${
            activeSection === 'all'
              ? 'border-white bg-white text-black'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block">All Records</span>
          <span className="text-xl font-heading font-black">{totalCount}</span>
        </button>

        <button
          onClick={() => setActiveSection('courses')}
          className={`p-3 text-left border-2 transition-colors ${
            activeSection === 'courses'
              ? 'border-white bg-white text-black'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block">Courses & Notes</span>
          <span className="text-xl font-heading font-black">{matchedCourses.length}</span>
        </button>

        <button
          onClick={() => setActiveSection('quick-learning')}
          className={`p-3 text-left border-2 transition-colors ${
            activeSection === 'quick-learning'
              ? 'border-white bg-white text-black'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block">Quick Learning</span>
          <span className="text-xl font-heading font-black">{matchedQuickLearning.length}</span>
        </button>

        <button
          onClick={() => setActiveSection('teachers')}
          className={`p-3 text-left border-2 transition-colors ${
            activeSection === 'teachers'
              ? 'border-white bg-white text-black'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block">Teacher Profiles</span>
          <span className="text-xl font-heading font-black">{matchedTeachers.length}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${viewMode} records across courses, quick learning, and teachers...`}
          className="w-full bg-black border-2 border-zinc-800 pl-9 pr-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
        />
      </div>

      {totalCount === 0 ? (
        <div className="p-12 text-center border-2 border-zinc-800 bg-zinc-950">
          <CheckCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-heading font-bold text-zinc-300 uppercase">
            No items in {viewMode} status
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {viewMode === 'drafts'
              ? 'All created content has either been published live or archived.'
              : viewMode === 'published'
              ? 'No items are currently visible on the public website.'
              : 'The archives are currently empty.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Courses */}
          {(activeSection === 'all' || activeSection === 'courses') && searchCourses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-heading font-black uppercase text-zinc-300">
                <BookOpen className="w-4 h-4" />
                <span>Courses &amp; Notes ({searchCourses.length})</span>
              </div>

              <div className="border-2 border-zinc-800 divide-y divide-zinc-800 bg-zinc-950">
                {searchCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-numbers font-bold text-xs text-white">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-mono-numbers uppercase text-zinc-400 border border-zinc-800 px-1.5">
                          {c.category}
                        </span>
                        <span className="text-xs font-mono-numbers font-black text-white">
                          ₹{c.price}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{c.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        By {c.teacher} · {c.branch}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenEditCourse(c)}
                        className="px-3 py-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-xs font-mono-numbers uppercase transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateCourseStatus(c.id, titleConfig.actionNextStatus)}
                        className={`px-3 py-1.5 text-xs font-mono-numbers font-black uppercase transition-colors border ${
                          titleConfig.actionNextStatus === 'published'
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400'
                            : 'bg-black hover:bg-zinc-800 text-zinc-200 border-zinc-700'
                        }`}
                      >
                        {titleConfig.actionLabel}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Quick Learning */}
          {(activeSection === 'all' || activeSection === 'quick-learning') &&
            searchQuickLearning.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-heading font-black uppercase text-zinc-300">
                  <Zap className="w-4 h-4" />
                  <span>Quick Learning Topics ({searchQuickLearning.length})</span>
                </div>

                <div className="border-2 border-zinc-800 divide-y divide-zinc-800 bg-zinc-950">
                  {searchQuickLearning.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/60 transition-colors"
                    >
                      <div>
                        <span className="text-[10px] font-mono-numbers uppercase text-zinc-400 border border-zinc-800 px-1.5">
                          {item.subject}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onOpenEditQuickLearning(item)}
                          className="px-3 py-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-xs font-mono-numbers uppercase transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuickLearningStatus(item.id, titleConfig.actionNextStatus)
                          }
                          className={`px-3 py-1.5 text-xs font-mono-numbers font-black uppercase transition-colors border ${
                            titleConfig.actionNextStatus === 'published'
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400'
                              : 'bg-black hover:bg-zinc-800 text-zinc-200 border-zinc-700'
                          }`}
                        >
                          {titleConfig.actionLabel}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Section 3: Teacher Profiles */}
          {(activeSection === 'all' || activeSection === 'teachers') && searchTeachers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-heading font-black uppercase text-zinc-300">
                <Users className="w-4 h-4" />
                <span>Verified Teacher Profiles ({searchTeachers.length})</span>
              </div>

              <div className="border-2 border-zinc-800 divide-y divide-zinc-800 bg-zinc-950">
                {searchTeachers.map((t) => (
                  <div
                    key={t.email}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{t.name}</span>
                        {t.designation && (
                          <span className="text-[11px] font-mono-numbers text-zinc-400">
                            · {t.designation}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono-numbers text-zinc-500 mt-0.5">
                        {t.email} {t.qualification && `· ${t.qualification}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenEditTeacher(t)}
                        className="px-3 py-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-xs font-mono-numbers uppercase transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateTeacherStatus(t.email, titleConfig.actionNextStatus)}
                        className={`px-3 py-1.5 text-xs font-mono-numbers font-black uppercase transition-colors border ${
                          titleConfig.actionNextStatus === 'published'
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400'
                            : 'bg-black hover:bg-zinc-800 text-zinc-200 border-zinc-700'
                        }`}
                      >
                        {titleConfig.actionLabel}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
