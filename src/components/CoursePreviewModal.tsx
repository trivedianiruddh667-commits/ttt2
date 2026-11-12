import React from 'react';
import { Course } from '../data/db';
import { X, BookOpen, Clock, FileText, CheckCircle, GraduationCap, Tag } from 'lucide-react';

interface CoursePreviewModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onPublishToggle?: (course: Course) => void;
}

export const CoursePreviewModal: React.FC<CoursePreviewModalProps> = ({
  course,
  isOpen,
  onClose,
  onPublishToggle
}) => {
  if (!isOpen || !course) return null;

  const isPub = course.status === 'published';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Course Preview"
      onClick={onClose}
    >
      <div
        className="bg-black border-4 border-white text-white w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[12px_12px_0px_0px_#ffffff] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with status pill */}
        <div className="p-6 bg-zinc-950 border-b-2 border-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-white" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-numbers uppercase tracking-widest text-zinc-400">
                  PUBLIC PREVIEW MODE
                </span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-mono-numbers font-black uppercase border ${
                    course.status === 'published'
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                      : course.status === 'archived'
                      ? 'border-zinc-500 bg-zinc-800 text-zinc-400'
                      : 'border-amber-400 bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {course.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-heading font-black uppercase text-white">
                {course.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="p-2 border border-zinc-700 hover:border-white hover:bg-white hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Preview Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-mono-numbers uppercase text-zinc-500 block">Code</span>
              <span className="text-xs font-mono-numbers font-bold text-white">{course.code}</span>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-mono-numbers uppercase text-zinc-500 block">Category</span>
              <span className="text-xs font-mono-numbers font-bold text-white">{course.category}</span>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-mono-numbers uppercase text-zinc-500 block">Price</span>
              <span className="text-xs font-mono-numbers font-bold text-white">
                ₹{course.price}{' '}
                {course.originalPrice > course.price && (
                  <span className="text-[10px] text-zinc-500 line-through">₹{course.originalPrice}</span>
                )}
              </span>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-mono-numbers uppercase text-zinc-500 block">Duration / Notes</span>
              <span className="text-xs font-mono-numbers font-bold text-white">
                {course.duration} · {course.pdfPages}p
              </span>
            </div>
          </div>

          {/* Teacher Badge */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-white bg-black flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-heading font-black uppercase text-white block">
                  {course.teacher}
                </span>
                <span className="text-[11px] font-mono-numbers text-zinc-400">
                  {course.teacherRole}
                  {course.teacherEmail && ` · ${course.teacherEmail}`}
                </span>
              </div>
            </div>
            <span className="px-2 py-1 bg-white text-black text-[10px] font-mono-numbers font-black uppercase">
              {course.branch}
            </span>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-heading font-black uppercase tracking-wider text-zinc-300 mb-2">
              Course Description
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed font-normal bg-zinc-950 p-4 border border-zinc-800">
              {course.description || 'No description provided.'}
            </p>
          </div>

          {/* Learning Outcomes */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div>
              <h4 className="text-xs font-heading font-black uppercase tracking-wider text-zinc-300 mb-2">
                What Students Will Master
              </h4>
              <ul className="space-y-2">
                {course.learningOutcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Syllabus Modules */}
          {course.syllabus && course.syllabus.length > 0 && (
            <div>
              <h4 className="text-xs font-heading font-black uppercase tracking-wider text-zinc-300 mb-2">
                Curriculum Syllabus ({course.syllabus.length} Modules)
              </h4>
              <div className="space-y-2">
                {course.syllabus.map((mod, idx) => (
                  <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span>{mod.title}</span>
                      <span className="text-[10px] font-mono-numbers text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {mod.duration}
                      </span>
                    </div>
                    {mod.topics && mod.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {mod.topics.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-1.5 py-0.5 bg-black border border-zinc-800 text-[10px] font-mono-numbers text-zinc-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Downloadable Notes preview */}
          {course.uploadedFileName && (
            <div className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white" />
                <span className="text-xs font-mono-numbers text-white">{course.uploadedFileName}</span>
              </div>
              <span className="text-[10px] font-mono-numbers uppercase text-emerald-400">
                Attached Study Pack
              </span>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-zinc-950 border-t-2 border-white flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-zinc-700 text-xs font-mono-numbers uppercase text-zinc-300 hover:border-white hover:text-white transition-colors"
          >
            Close Preview
          </button>

          {onPublishToggle && (
            <button
              type="button"
              onClick={() => {
                onPublishToggle(course);
                onClose();
              }}
              className={`px-5 py-2 text-xs font-mono-numbers font-black uppercase transition-colors border-2 shadow-[2px_2px_0px_0px_#ffffff] ${
                isPub
                  ? 'border-amber-400 bg-amber-400 text-black hover:bg-amber-300'
                  : 'border-emerald-400 bg-emerald-500 text-black hover:bg-emerald-400'
              }`}
            >
              {isPub ? 'Unpublish Course' : 'Publish Course Live'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
