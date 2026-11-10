import React, { useState, useMemo, useEffect } from 'react';
import { Course, CourseReview, User, EnrolledCourse } from '../data/db';
import {
  X,
  Star,
  Check,
  CheckCircle,
  ThumbsUp,
  MessageSquare,
  Award,
  Sparkles,
  BookOpen,
  Clock,
  FileText,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Share2
} from 'lucide-react';
import { shareContentSafely } from '../lib/downloadUtils';

interface CourseDetailsModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  enrolledCourses: EnrolledCourse[];
  reviews: CourseReview[];
  onAddReview: (review: CourseReview) => void;
  onVoteHelpful?: (reviewId: string) => void;
  onUpdateProgress: (courseId: string, progress: number) => void;
  onAddToCart: (course: Course) => void;
  onDirectBuy: (course: Course) => void;
  isInCart: (courseId: string) => boolean;
  onLoginDemoStudent?: () => void;
  onNavigateToStudentDashboard?: () => void;
}

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  course,
  isOpen,
  onClose,
  currentUser,
  enrolledCourses,
  reviews,
  onAddReview,
  onVoteHelpful,
  onUpdateProgress,
  onAddToCart,
  onDirectBuy,
  isInCart,
  onLoginDemoStudent,
  onNavigateToStudentDashboard
}) => {
  // Active tab state
  const [activeTab, setActiveTab] = useState<'syllabus' | 'reviews'>('syllabus');

  // Filter & Sort state for reviews list
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'helpful' | 'recent' | 'highest'>('highest');

  // Review Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [gradeReceived, setGradeReceived] = useState('');
  const [examType, setExamType] = useState('End-Term Exam');
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [shareLabel, setShareLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const courseId = course?.id ?? '';

  // Check enrollment and completion status
  const userEnrollment = useMemo(() => {
    return enrolledCourses.find((e) => e.courseId === courseId);
  }, [enrolledCourses, courseId]);

  const isEnrolled = !!userEnrollment;
  const progressPercent = userEnrollment?.progressPercent ?? 0;
  const isCompleted = progressPercent >= 100;

  // Check if current user already reviewed this course
  const existingUserReview = useMemo(() => {
    if (!currentUser || !courseId) return null;
    return reviews.find(
      (r) => r.courseId === courseId && (r.studentId === currentUser.id || r.studentName === currentUser.name)
    );
  }, [reviews, courseId, currentUser]);

  // All reviews for this course
  const courseReviews = useMemo(() => {
    return reviews.filter((r) => r.courseId === courseId);
  }, [reviews, courseId]);

  // Calculated ratings breakdown
  const ratingStats = useMemo(() => {
    const total = courseReviews.length;
    if (total === 0) {
      return {
        average: course?.rating ?? 5,
        total: course?.reviewsCount ?? 0,
        distribution: { 5: 85, 4: 12, 3: 3, 2: 0, 1: 0 }
      };
    }
    const sum = courseReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = Number((sum / total).toFixed(1));

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    courseReviews.forEach((r) => {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    });

    const distribution: Record<number, number> = {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100)
    };

    return { average, total, distribution };
  }, [courseReviews, course?.rating, course?.reviewsCount]);

  // Filtered and sorted reviews
  const displayedReviews = useMemo(() => {
    let result = [...courseReviews];

    if (filterRating !== 'all') {
      result = result.filter((r) => r.rating === filterRating);
    }

    if (sortOrder === 'helpful') {
      result.sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else if (sortOrder === 'recent') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [courseReviews, filterRating, sortOrder]);

  if (!isOpen || !course) return null;

  const handleShareCourse = async () => {
    const res = await shareContentSafely({
      title: `${course.code}: ${course.title}`,
      text: `Check out ${course.title} by ${course.teacher} on Techie Teacher's Tribe Trust (₹${course.price}).`
    });
    setShareLabel(res === 'shared' ? 'Shared!' : res === 'copied' ? 'Link Copied' : 'Copy Failed');
    setTimeout(() => setShareLabel(null), 2200);
  };

  // Rating labels helper
  const getRatingDescriptor = (stars: number) => {
    switch (stars) {
      case 5:
        return '5 Stars · Semester Lifesaver (100% Exam Replicability)';
      case 4:
        return '4 Stars · Very High Yield (Cleared Major Numericals)';
      case 3:
        return '3 Stars · Good for Quick Revision & Formula Scan';
      case 2:
        return '2 Stars · Average / Missing A Few University Proofs';
      case 1:
        return '1 Star · Needs Improvement';
      default:
        return 'Select Star Rating';
    }
  };

  // Populate form if editing existing review
  const handleStartEdit = () => {
    if (existingUserReview) {
      setRating(existingUserReview.rating);
      setComment(existingUserReview.comment);
      setGradeReceived(existingUserReview.gradeReceived || '');
      setExamType(existingUserReview.examType || 'End-Term Exam');
      setIsEditing(true);
      setIsFormOpen(true);
      setActiveTab('reviews');
    }
  };

  // Open empty form
  const handleStartNewReview = () => {
    setRating(5);
    setComment('');
    setGradeReceived('');
    setExamType('End-Term Exam');
    setIsEditing(false);
    setIsFormOpen(true);
    setActiveTab('reviews');
  };

  // Submit review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!comment.trim() || comment.trim().length < 5) return;

    const newReview: CourseReview = {
      id: existingUserReview ? existingUserReview.id : `rev_${Date.now()}`,
      courseId: course.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentCollege: currentUser.college || 'Engineering University',
      studentBranch: currentUser.semester || 'Engineering Student',
      rating,
      comment: comment.trim(),
      gradeReceived: gradeReceived.trim() || undefined,
      examType: examType || 'End-Term Exam',
      createdAt: new Date().toISOString().split('T')[0],
      verifiedCompletion: true,
      helpfulCount: existingUserReview ? existingUserReview.helpfulCount : 0
    };

    onAddReview(newReview);
    setIsFormOpen(false);
    setIsEditing(false);
    setSubmitSuccessNotice(
      isEditing
        ? '✓ Your review has been updated successfully!'
        : '✓ Verified Review published! Thank you for helping the Tribe.'
    );
    setTimeout(() => setSubmitSuccessNotice(null), 4000);
  };

  const handleInstantCompleteForTesting = () => {
    onUpdateProgress(course.id, 100);
    setSubmitSuccessNotice('⚡ Course marked 100% completed! You can now write your verified review.');
    setTimeout(() => setSubmitSuccessNotice(null), 3500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-black border-4 border-white text-white w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-[12px_12px_0px_0px_#ffffff] flex flex-col relative">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-zinc-950 border-b-2 border-white flex items-start justify-between shrink-0">
          <div className="pr-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-numbers text-zinc-400 uppercase">
              <span className="font-bold text-white bg-zinc-900 border border-zinc-700 px-2 py-0.5">
                {course.code}
              </span>
              <span>·</span>
              <span>{course.branch}</span>
              <span>·</span>
              <span>{course.semester}</span>
              <span>·</span>
              <span className="border border-white/60 px-1.5 py-0.5 text-white font-bold text-[10px]">
                {course.category}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-black uppercase mt-2 leading-tight">
              {course.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-zinc-400 mt-2 font-mono-numbers">
              <div>
                Instructor: <strong className="text-zinc-200">{course.teacher}</strong>{' '}
                <span className="text-zinc-500">({course.teacherRole})</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="flex items-center gap-1.5 text-white font-bold hover:underline"
              >
                <div className="flex items-center text-white">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(ratingStats.average)
                          ? 'fill-white text-white'
                          : 'text-zinc-600'
                      }`}
                    />
                  ))}
                </div>
                <span>{ratingStats.average}</span>
                <span className="text-zinc-400">({ratingStats.total} reviews)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShareCourse}
              className="min-h-[40px] px-2.5 py-1.5 border-2 border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-[11px] font-mono-numbers uppercase"
              aria-label="Share course"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{shareLabel || 'Share'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] p-1.5 border-2 border-zinc-700 hover:border-white hover:bg-white hover:text-black transition-colors flex items-center justify-center shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center border-b-2 border-white bg-zinc-950 px-4 sm:px-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('syllabus')}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'syllabus'
                ? 'border-white text-white bg-black'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum & Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 relative ${
              activeTab === 'reviews'
                ? 'border-white text-white bg-black'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Student Reviews ({ratingStats.total})</span>
          </button>

          {/* Quick status pill for logged in student */}
          {currentUser && currentUser.role === 'student' && (
            <div className="ml-auto hidden sm:flex items-center gap-2 text-[11px] font-mono-numbers">
              {isCompleted ? (
                <span className="text-zinc-300 flex items-center gap-1 border border-zinc-700 px-2 py-0.5 bg-black">
                  <ShieldCheck className="w-3 h-3 text-white" />
                  <span>100% Completed · Review Eligible</span>
                </span>
              ) : isEnrolled ? (
                <span className="text-zinc-400 flex items-center gap-1 border border-zinc-800 px-2 py-0.5 bg-black">
                  <span>Enrolled: {progressPercent}%</span>
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8">
          {submitSuccessNotice && (
            <div className="p-4 bg-zinc-900 border-2 border-white text-white text-xs font-mono-numbers flex items-center justify-between gap-3 animate-in slide-in-from-top shadow-[4px_4px_0px_0px_#ffffff]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-white shrink-0" />
                <span>{submitSuccessNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setSubmitSuccessNotice(null)}
                className="text-zinc-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: CURRICULUM & SYLLABUS */}
          {activeTab === 'syllabus' && (
            <div className="space-y-6">
              {/* Course Overview */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers mb-2">
                  COURSE OVERVIEW & EXAM FOCUS
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                  {course.description}
                </p>
              </div>

              {/* Quick High-Yield Specs Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-numbers">
                <div className="p-3 bg-zinc-950 border border-zinc-800">
                  <div className="text-zinc-500 uppercase text-[10px]">TOTAL DURATION</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-white" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800">
                  <div className="text-zinc-500 uppercase text-[10px]">SYLLABUS MODULES</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <BookOpen className="w-3.5 h-3.5 text-white" />
                    <span>{course.modulesCount} Modules</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800">
                  <div className="text-zinc-500 uppercase text-[10px]">TOPPER NOTES</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <FileText className="w-3.5 h-3.5 text-white" />
                    <span>{course.pdfPages} Pages (PDF)</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800">
                  <div className="text-zinc-500 uppercase text-[10px]">TRIBE RATING</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span>{ratingStats.average} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* What is Included */}
              <div className="p-5 border-2 border-white bg-zinc-950">
                <h4 className="text-xs uppercase tracking-widest text-white font-mono-numbers mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>WHAT IS INCLUDED IN THIS SEMESTER BUSTER PACK</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
                  {course.learningOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Syllabus Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                    SYLLABUS MODULE BREAKDOWN ({course.syllabus.length} MODULES)
                  </h4>
                  <span className="text-[11px] font-mono-numbers text-zinc-500">
                    EXAM-MAPPED & TIMED
                  </span>
                </div>

                <div className="space-y-3">
                  {course.syllabus.map((mod, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-zinc-800 bg-zinc-950 hover:border-zinc-500 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs font-bold font-mono-numbers text-white">
                        <span>{mod.title}</span>
                        <span className="text-zinc-400">{mod.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {mod.topics.map((t, tidx) => (
                          <span
                            key={tidx}
                            className="text-[11px] text-zinc-300 bg-black border border-zinc-800 px-2 py-0.5"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to jump to Reviews */}
              <div className="p-5 border-2 border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono-numbers text-zinc-400 uppercase">
                    STUDENT EXPERIENCES & RATINGS
                  </div>
                  <div className="text-base font-heading font-black uppercase text-white mt-0.5">
                    Rated {ratingStats.average} / 5.0 by {ratingStats.total} verified cadets
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Read feedback from students at DTU, NSUT, VIT, BITS and more before enrolling.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="px-4 py-2 border-2 border-white bg-black hover:bg-white hover:text-black font-bold uppercase text-xs transition-colors shrink-0"
                >
                  View Student Reviews
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REVIEWS & LEAVE A REVIEW */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Top Aggregate Rating Card */}
              <div className="p-6 bg-zinc-950 border-2 border-white grid grid-cols-1 md:grid-cols-12 gap-6 shadow-[6px_6px_0px_0px_#ffffff]">
                {/* Big Score Block */}
                <div className="md:col-span-5 flex flex-col justify-center items-center md:items-start md:border-r border-zinc-800 pr-0 md:pr-6">
                  <div className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers mb-1">
                    AGGREGATE CADET SCORE
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl sm:text-6xl font-heading font-black text-white font-mono-numbers">
                      {ratingStats.average}
                    </span>
                    <span className="text-zinc-500 font-mono-numbers text-lg">/ 5.0</span>
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-white">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(ratingStats.average)
                            ? 'fill-white text-white'
                            : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="text-xs text-zinc-400 font-mono-numbers mt-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Based on {ratingStats.total} verified university exams</span>
                  </div>
                </div>

                {/* Rating Distribution Bars */}
                <div className="md:col-span-7 flex flex-col justify-center space-y-2 font-mono-numbers text-xs">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const pct = ratingStats.distribution[starNum] || 0;
                    return (
                      <div key={starNum} className="flex items-center gap-3">
                        <span className="w-10 text-zinc-400 flex items-center justify-end gap-1">
                          <span>{starNum}</span>
                          <Star className="w-3 h-3 fill-white text-white" />
                        </span>
                        <div className="flex-1 bg-zinc-900 border border-zinc-800 h-2.5 overflow-hidden">
                          <div
                            className="bg-white h-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-zinc-400 text-[11px]">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VERIFIED STUDENT REVIEW ELIGIBILITY & CALL TO ACTION */}
              <div className="border-2 border-white bg-zinc-950 p-6 relative">
                {/* Condition 1: Not Logged in */}
                {!currentUser && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-400 uppercase">
                        <AlertCircle className="w-4 h-4 text-white" />
                        <span>VERIFIED GRADUATE REVIEWS ONLY</span>
                      </div>
                      <h3 className="text-lg font-heading font-black uppercase text-white mt-1">
                        Completed this course? Share your review.
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                        To maintain 100% academic authenticity, only students who have completed the full course syllabus can post star ratings and comments.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                      {onLoginDemoStudent && (
                        <button
                          type="button"
                          onClick={onLoginDemoStudent}
                          className="px-4 py-2.5 border-2 border-white bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors shadow-[2px_2px_0px_0px_#ffffff]"
                        >
                          Sign In as Cadet Aryan (DTU)
                        </button>
                      )}
                      {onNavigateToStudentDashboard && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToStudentDashboard();
                          }}
                          className="px-4 py-2.5 border-2 border-zinc-700 bg-black text-white font-bold uppercase text-xs hover:border-white transition-colors"
                        >
                          Sign In
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Condition 2: Logged in, NOT enrolled */}
                {currentUser && currentUser.role === 'student' && !isEnrolled && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-400 uppercase">
                        <BookOpen className="w-4 h-4 text-white" />
                        <span>NOT ENROLLED YET</span>
                      </div>
                      <h3 className="text-lg font-heading font-black uppercase text-white mt-1">
                        Enroll and complete all modules to leave a review
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                        Cadet <strong className="text-white">{currentUser.name}</strong>, once you enroll and complete 100% of the course, this section will unlock so you can share your rating and end-term score.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => onAddToCart(course)}
                        className="px-4 py-2.5 border-2 border-white bg-black text-white hover:bg-zinc-900 font-bold uppercase text-xs transition-colors"
                      >
                        {isInCart(course.id) ? 'Added in Cart' : 'Add to Cart'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDirectBuy(course)}
                        className="px-6 py-2.5 border-2 border-white bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors shadow-[2px_2px_0px_0px_#ffffff]"
                      >
                        Enroll Now · ₹{course.price}
                      </button>
                    </div>
                  </div>
                )}

                {/* Condition 3: Logged in, Enrolled but < 100% */}
                {currentUser && currentUser.role === 'student' && isEnrolled && !isCompleted && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-400 uppercase">
                          <AlertCircle className="w-4 h-4 text-white" />
                          <span>COURSE IN PROGRESS ({progressPercent}%)</span>
                        </div>
                        <h3 className="text-lg font-heading font-black uppercase text-white mt-1">
                          Complete this course to unlock your review
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                          You are currently enrolled with <strong className="text-white font-mono-numbers">{progressPercent}%</strong> progress. To preserve trust, reviews require 100% syllabus completion.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Instant completion trigger for testing & demo */}
                        <button
                          type="button"
                          onClick={handleInstantCompleteForTesting}
                          className="px-4 py-2.5 border-2 border-white bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors shadow-[3px_3px_0px_0px_#ffffff] flex items-center gap-1.5"
                          title="Instant 100% completion for testing review submission"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Mark 100% Completed</span>
                        </button>

                        {onNavigateToStudentDashboard && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onNavigateToStudentDashboard();
                            }}
                            className="px-4 py-2.5 border-2 border-zinc-700 bg-black text-white hover:border-white font-bold uppercase text-xs transition-colors"
                          >
                            Go to Study Desk
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress visual */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] font-mono-numbers text-zinc-400 mb-1">
                        <span>Current Progress</span>
                        <span className="text-white font-bold">{progressPercent}% / 100%</span>
                      </div>
                      <div className="w-full bg-zinc-900 border border-zinc-700 h-2 overflow-hidden">
                        <div
                          className="bg-white h-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Condition 4: Logged in, Completed 100% */}
                {currentUser && currentUser.role === 'student' && isCompleted && (
                  <div>
                    {!isFormOpen ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono-numbers text-white uppercase">
                            <ShieldCheck className="w-4 h-4 text-white" />
                            <span>VERIFIED GRADUATE STATUS · 100% COMPLETED</span>
                          </div>
                          <h3 className="text-xl font-heading font-black uppercase text-white mt-1">
                            {existingUserReview
                              ? 'Your review is published'
                              : 'You have completed this course! Leave your review'}
                          </h3>
                          <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                            {existingUserReview
                              ? 'Thank you for helping engineering juniors across India. You can update your score, review comment, or exam grade anytime.'
                              : 'Rate the derivations, handwritten formula sheets, and exam numericals. Help your fellow students dominate their semester.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {existingUserReview ? (
                            <button
                              type="button"
                              onClick={handleStartEdit}
                              className="px-5 py-2.5 border-2 border-white bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-[3px_3px_0px_0px_#ffffff]"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit My Review</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleStartNewReview}
                              className="px-6 py-3 border-2 border-white bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-[4px_4px_0px_0px_#ffffff]"
                            >
                              <Star className="w-4 h-4 fill-black" />
                              <span>Leave a Review</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* ACTIVE REVIEW COMPOSER FORM */
                      <form onSubmit={handleSubmitReview} className="space-y-5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-white" />
                            <span className="text-xs uppercase font-mono-numbers text-zinc-300 font-bold">
                              {isEditing ? 'EDITING YOUR VERIFIED REVIEW' : 'WRITE A VERIFIED STUDENT REVIEW'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className="text-xs text-zinc-400 hover:text-white uppercase font-mono-numbers"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Interactive 5-Star Rating Selector */}
                        <div>
                          <label className="block text-xs uppercase font-bold tracking-wider text-zinc-300 mb-2 font-mono-numbers">
                            SELECT STAR RATING *
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((starValue) => {
                              const activeStars = hoverRating !== null ? hoverRating : rating;
                              const isFilled = starValue <= activeStars;
                              return (
                                <button
                                  key={starValue}
                                  type="button"
                                  onClick={() => setRating(starValue)}
                                  onMouseEnter={() => setHoverRating(starValue)}
                                  onMouseLeave={() => setHoverRating(null)}
                                  className="p-1.5 border border-zinc-800 bg-black hover:border-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
                                  aria-label={`Rate ${starValue} stars`}
                                >
                                  <Star
                                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                      isFilled ? 'fill-white text-white' : 'text-zinc-700'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <div className="text-xs font-mono-numbers text-zinc-400 mt-2">
                            {getRatingDescriptor(hoverRating !== null ? hoverRating : rating)}
                          </div>
                        </div>

                        {/* Review Comment Textarea */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs uppercase font-bold tracking-wider text-zinc-300 font-mono-numbers">
                              YOUR REVIEW & COMMENTS *
                            </label>
                            <span className="text-[11px] font-mono-numbers text-zinc-500">
                              {comment.length} / 600 characters
                            </span>
                          </div>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            maxLength={600}
                            placeholder="Describe how this course helped in your university mid-term or end-term exams. Which modules, derivation proofs, or handwritten formula sheets were most helpful?"
                            required
                            className="w-full bg-black border-2 border-zinc-700 p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                          />
                        </div>

                        {/* Optional Student Brag Fields: Grade / SGPA & Exam Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] uppercase font-bold tracking-wider text-zinc-400 mb-1 font-mono-numbers">
                              GRADE / SGPA ACHIEVED (OPTIONAL)
                            </label>
                            <input
                              type="text"
                              value={gradeReceived}
                              onChange={(e) => setGradeReceived(e.target.value)}
                              placeholder="e.g. SGPA 9.2 · O Grade, or 48/50 Marks"
                              className="w-full bg-black border border-zinc-800 p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono-numbers"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] uppercase font-bold tracking-wider text-zinc-400 mb-1 font-mono-numbers">
                              EXAM TYPE
                            </label>
                            <select
                              value={examType}
                              onChange={(e) => setExamType(e.target.value)}
                              className="w-full bg-black border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:border-white font-mono-numbers uppercase font-bold"
                            >
                              <option value="End-Term Exam">End-Term University Exam</option>
                              <option value="Mid-Term / Mid-Sem">Mid-Term / Mid-Sem Exam</option>
                              <option value="Backlog Recovery">Backlog Recovery / Supplementary</option>
                              <option value="GATE / Competitive">GATE / Competitive Prep</option>
                            </select>
                          </div>
                        </div>

                        {/* Verification Identity Note */}
                        <div className="text-[11px] font-mono-numbers text-zinc-400 bg-black border border-zinc-800 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-white" />
                            <span>
                              Posting as <strong className="text-white">{currentUser.name}</strong> ({currentUser.college || 'Engineering Cadet'})
                            </span>
                          </div>
                          <span className="text-zinc-500">100% Verified Completion</span>
                        </div>

                        {/* Submit Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsFormOpen(false);
                              setIsEditing(false);
                            }}
                            className="px-4 py-2.5 border border-zinc-700 bg-black text-zinc-400 hover:text-white hover:border-white uppercase text-xs font-bold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!comment.trim() || comment.trim().length < 5}
                            className="px-6 py-2.5 border-2 border-white bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors shadow-[3px_3px_0px_0px_#ffffff] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>{isEditing ? 'Update Review' : 'Publish Verified Review'}</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* REVIEWS LIST HEADER WITH SORT & FILTER */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-white gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-heading font-black uppercase text-white">
                      All Cadet Reviews ({courseReviews.length})
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Filter by star rating */}
                    <div className="flex items-center gap-1 text-xs font-mono-numbers">
                      <span className="text-zinc-500 text-[11px] uppercase mr-1">RATING:</span>
                      <select
                        value={filterRating}
                        onChange={(e) =>
                          setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))
                        }
                        className="bg-black border border-zinc-800 text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-white font-mono-numbers uppercase font-bold"
                      >
                        <option value="all">All Stars ({courseReviews.length})</option>
                        <option value="5">5 Stars only</option>
                        <option value="4">4 Stars only</option>
                        <option value="3">3 Stars only</option>
                      </select>
                    </div>

                    {/* Sort order */}
                    <div className="flex items-center gap-1 text-xs font-mono-numbers">
                      <span className="text-zinc-500 text-[11px] uppercase mr-1">SORT:</span>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="bg-black border border-zinc-800 text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-white font-mono-numbers uppercase font-bold"
                      >
                        <option value="highest">Highest Rated</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="recent">Most Recent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4 mt-6">
                  {displayedReviews.length === 0 ? (
                    <div className="p-8 border border-zinc-800 text-center bg-zinc-950 font-mono-numbers text-xs text-zinc-400">
                      No reviews matching the selected filter.
                    </div>
                  ) : (
                    displayedReviews.map((rev) => {
                      const isCurrentUserReview =
                        currentUser &&
                        (rev.studentId === currentUser.id || rev.studentName === currentUser.name);

                      return (
                        <div
                          key={rev.id}
                          className={`p-5 bg-zinc-950 border-2 transition-all ${
                            isCurrentUserReview
                              ? 'border-white shadow-[4px_4px_0px_0px_#ffffff]'
                              : 'border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          {/* Review top row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-900">
                            <div className="flex items-center gap-3">
                              {/* Avatar Initial */}
                              <div className="w-9 h-9 border border-white bg-black flex items-center justify-center font-heading font-black text-sm text-white">
                                {rev.studentName.charAt(0)}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-heading font-bold text-sm text-white">
                                    {rev.studentName}
                                  </span>
                                  {isCurrentUserReview && (
                                    <span className="text-[10px] font-mono-numbers bg-white text-black font-black px-1.5 py-0.2 uppercase">
                                      YOU
                                    </span>
                                  )}
                                  {rev.verifiedCompletion && (
                                    <span className="text-[10px] font-mono-numbers text-zinc-300 border border-zinc-700 bg-black px-1.5 py-0.5 flex items-center gap-1">
                                      <Check className="w-3 h-3 text-white" />
                                      <span>Verified Graduate</span>
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-400 font-mono-numbers">
                                  {rev.studentCollege || 'Engineering College'}
                                  {rev.studentBranch ? ` · ${rev.studentBranch}` : ''}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Star rating */}
                              <div className="flex items-center gap-1 text-white">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < rev.rating ? 'fill-white text-white' : 'text-zinc-700'
                                    }`}
                                  />
                                ))}
                              </div>

                              <span className="text-[11px] font-mono-numbers text-zinc-500">
                                {rev.createdAt}
                              </span>
                            </div>
                          </div>

                          {/* Grade or Exam Badge if present */}
                          {(rev.gradeReceived || rev.examType) && (
                            <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono-numbers">
                              {rev.gradeReceived && (
                                <span className="bg-black border border-white text-white font-bold px-2 py-0.5 flex items-center gap-1">
                                  <Award className="w-3 h-3 text-white" />
                                  <span>{rev.gradeReceived}</span>
                                </span>
                              )}
                              {rev.examType && (
                                <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5">
                                  {rev.examType}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Review Comment Body */}
                          <p className="text-xs sm:text-sm text-zinc-300 mt-3 leading-relaxed">
                            {rev.comment}
                          </p>

                          {/* Review card bottom actions */}
                          <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-mono-numbers">
                            {(() => {
                              const alreadyVoted = Boolean(
                                currentUser && rev.helpfulVoterIds?.includes(currentUser.id)
                              );
                              return (
                                <button
                                  type="button"
                                  disabled={alreadyVoted}
                                  onClick={() => onVoteHelpful && onVoteHelpful(rev.id)}
                                  className={`min-h-[36px] flex items-center gap-1.5 transition-colors py-1 px-2.5 border ${
                                    alreadyVoted
                                      ? 'border-white bg-white text-black font-bold cursor-default'
                                      : 'text-zinc-400 hover:text-white border-zinc-800 hover:border-white cursor-pointer'
                                  }`}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>
                                    {alreadyVoted ? `Helpful (${rev.helpfulCount}) ✓` : `Helpful (${rev.helpfulCount})`}
                                  </span>
                                </button>
                              );
                            })()}

                            {isCurrentUserReview && isCompleted && (
                              <button
                                type="button"
                                onClick={handleStartEdit}
                                className="text-zinc-400 hover:text-white flex items-center gap-1 underline cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit your review</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Pricing & Action Footer */}
        <div className="p-4 sm:p-6 bg-zinc-950 border-t-2 border-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono-numbers text-white">
              ₹{course.price}
            </div>
            <div className="text-xs text-zinc-400 line-through font-mono-numbers">
              Regular ₹{course.originalPrice} (Save ₹{course.originalPrice - course.price})
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === 'syllabus' && isCompleted && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('reviews');
                  handleStartNewReview();
                }}
                className="flex-1 sm:flex-initial px-4 py-3 border-2 border-white bg-black hover:bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Leave a Review</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onAddToCart(course)}
              className="flex-1 sm:flex-initial px-5 py-3 border-2 border-white bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isInCart(course.id) ? 'Added in Cart' : 'Add to Cart'}</span>
            </button>

            <button
              type="button"
              onClick={() => onDirectBuy(course)}
              className="flex-1 sm:flex-initial px-8 py-3 border-2 border-white bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-[4px_4px_0px_0px_#ffffff] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enroll Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
