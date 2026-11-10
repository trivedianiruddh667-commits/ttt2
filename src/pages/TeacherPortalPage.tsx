import React, { useState, useEffect, useRef } from 'react';
import { BrandLogo } from '../components/BrandLogo';
import {
  Course,
  User,
  DailyNewsItem,
  TeacherAccessRequest,
  LiveSession,
  doesCourseBelongToTeacher
} from '../data/db';
import { NavPage } from '../components/Navbar';
import { ConfirmModal } from '../components/ConfirmModal';
import { LiveSessionFormModal } from '../components/LiveSessionFormModal';
import {
  GraduationCap,
  Upload,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  X,
  FileText,
  LogOut,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Newspaper,
  Mail,
  Lock,
  Clock,
  Loader2,
  RefreshCw,
  KeyRound,
  Radio,
  ExternalLink
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { formatFirebaseAuthError, FIREBASE_PROJECT_ID } from '../lib/firebase';

interface TeacherPortalPageProps {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isVerifiedTeacher: boolean;
  verifiedTeacherEmails: string[];
  teacherRequests: TeacherAccessRequest[];
  onFirebaseEmailLogin: (email: string, password: string) => Promise<void>;
  onFirebaseGoogleSignIn: () => Promise<void>;
  onResendVerificationEmail: () => Promise<void>;
  onRefreshVerificationStatus: () => Promise<boolean>;
  onLogout: () => void;
  onNavigate: (page: NavPage) => void;
  onOpenRequestTeacherModal: () => void;
  courses: Course[];
  onCreateCourse: (course: Course) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onToggleApproval: (courseId: string) => void;
  newsList?: DailyNewsItem[];
  onDeleteNews?: (newsId: string) => void;
  onOpenCreateNews?: () => void;
  onOpenEditNews?: (news: DailyNewsItem) => void;
  liveSessions?: LiveSession[];
  onSaveLiveSession?: (session: LiveSession) => Promise<void> | void;
  onDeleteLiveSession?: (sessionId: string) => void;
  onNotify?: (msg: string, variant?: 'success' | 'error' | 'info') => void;
}

export const TeacherPortalPage: React.FC<TeacherPortalPageProps> = ({
  currentUser,
  firebaseUser,
  isVerifiedTeacher,
  verifiedTeacherEmails,
  teacherRequests,
  onFirebaseEmailLogin,
  onFirebaseGoogleSignIn,
  onResendVerificationEmail,
  onRefreshVerificationStatus,
  onLogout,
  onNavigate,
  onOpenRequestTeacherModal,
  courses,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  onToggleApproval,
  newsList = [],
  onDeleteNews,
  onOpenCreateNews,
  onOpenEditNews,
  liveSessions = [],
  onSaveLiveSession,
  onDeleteLiveSession,
  onNotify
}) => {
  // Teacher Firebase Login state (when someone lands on route while not verified)
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<{ message: string; isProviderDisabled?: boolean } | null>(null);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const [isCheckingVerify, setIsCheckingVerify] = useState(false);

  // Dashboard active tab: courses, news, or live-sessions
  const [activeTab, setActiveTab] = useState<'courses' | 'news' | 'live-sessions'>('courses');

  // Course Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formBranch, setFormBranch] = useState('Computer Science & IT');
  const [formSemester, setFormSemester] = useState('Semester 4');
  const [formCategory, setFormCategory] = useState<'Full Course' | 'Crash Course' | 'Handwritten Notes' | 'Exam Booster'>('Handwritten Notes');
  const [formPrice, setFormPrice] = useState(499);
  const [formOriginalPrice, setFormOriginalPrice] = useState(1299);
  const [formDuration, setFormDuration] = useState('6 Hours');
  const [formPdfPages, setFormPdfPages] = useState(85);
  const [formDescription, setFormDescription] = useState('');
  const [formLearningOutcomes, setFormLearningOutcomes] = useState(
    'Solved previous 10 years exam numericals\nHigh-yield handwritten formula derivation proofs\nTopper answer templates with marking criteria'
  );
  const [formNotesContent, setFormNotesContent] = useState('');
  const [formSyllabus, setFormSyllabus] = useState<{ title: string; duration: string; topicsText: string }[]>([
    {
      title: 'Module 1: High Yield Foundations & Formulas',
      duration: '1h 30m',
      topicsText: 'Core theorem proofs, Diagram layouts'
    },
    {
      title: 'Module 2: Mid-Term Numerical Mastery',
      duration: '2h 15m',
      topicsText: 'Past paper step deductions, Common exam traps'
    }
  ]);
  const [uploadedPdfFileName, setUploadedPdfFileName] = useState<string | null>(null);
  const [requireAdminApproval, setRequireAdminApproval] = useState(false);

  // Live Session Modal & Confirm Modal State
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [editingLiveSession, setEditingLiveSession] = useState<LiveSession | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Notification state
  const [portalNotice, setPortalNotice] = useState<string | null>(null);
  const showNotice = (msg: string, variant: 'success' | 'error' | 'info' = 'success') => {
    if (onNotify) {
      onNotify(msg, variant);
    } else {
      setPortalNotice(msg);
      setTimeout(() => setPortalNotice(null), 3200);
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  // Strict Email Verification Gate
  if (!isVerifiedTeacher || !currentUser) {
    const currentEmailNormalized = currentUser?.email?.trim().toLowerCase() || '';
    const currentUserRequest = currentEmailNormalized
      ? teacherRequests.find((r) => r.email.trim().toLowerCase() === currentEmailNormalized)
      : undefined;

    const handleTeacherEmailSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      const normalized = emailInput.trim().toLowerCase();
      if (!normalized || !passwordInput) return;

      setLoginError(null);
      setIsLoggingIn(true);
      try {
        await onFirebaseEmailLogin(normalized, passwordInput);
        if (!verifiedTeacherEmails.includes(normalized)) {
          const pendingReq = teacherRequests.find((r) => r.email.trim().toLowerCase() === normalized);
          if (pendingReq?.status === 'PENDING') {
            setLoginError({
              message: `${normalized} is signed in, but currently PENDING Admin approval. Teachers Portal unlocks once approved.`
            });
          } else {
            setLoginError({
              message: `${normalized} is signed in, but NOT a verified teacher email yet. Submit a Teacher Access Request below.`
            });
          }
        }
      } catch (err) {
        setLoginError(formatFirebaseAuthError(err));
      } finally {
        setIsLoggingIn(false);
      }
    };

    const handleTeacherGoogleSignIn = async () => {
      setLoginError(null);
      setIsGoogleLoggingIn(true);
      try {
        await onFirebaseGoogleSignIn();
      } catch (err) {
        setLoginError(formatFirebaseAuthError(err));
      } finally {
        setIsGoogleLoggingIn(false);
      }
    };

    return (
      <div className="w-full min-h-[90vh] bg-black text-white flex flex-col justify-center items-center p-4 sm:p-8 select-none">
        <div className="max-w-lg w-full border-4 border-white p-8 sm:p-10 bg-zinc-950 shadow-[12px_12px_0px_0px_#ffffff]">
          <div className="flex flex-col items-center text-center mb-6">
            <BrandLogo variant="navbar" />
            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-black text-[10px] uppercase font-mono-numbers font-black tracking-widest mb-2 border border-black">
                <Lock className="w-3 h-3" />
                <span>VERIFIED FACULTY ONLY · TEACHERS PORTAL</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
                Teacher Sign In & Verification Required
              </h2>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                The Teachers Portal is restricted exclusively to Firebase-authenticated accounts whose email addresses are verified and approved by the Trust Admin.
              </p>
            </div>
          </div>

          {currentUser && (
            <div className="mb-5 p-4 bg-black border-2 border-zinc-700 text-xs font-mono-numbers space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 uppercase">SIGNED IN EMAIL:</span>
                <span className="text-white font-bold">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                {currentUserRequest?.status === 'PENDING' ? (
                  <>
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Status: PENDING ADMIN APPROVAL</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                    <span className="text-red-300">
                      Status: NOT A VERIFIED TEACHER EMAIL
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {loginError && (
            <div className="mb-5 p-3.5 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-mono-numbers space-y-2">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError.message}</span>
              </div>
              {loginError.isProviderDisabled && (
                <div className="pt-2 border-t border-red-800 text-[11px] text-red-100">
                  Enable Email/Password in Firebase Console ({FIREBASE_PROJECT_ID}) &rarr; Authentication &rarr; Sign-in method, or use Google Sign-In below.
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={isGoogleLoggingIn || isLoggingIn}
            onClick={handleTeacherGoogleSignIn}
            className="w-full py-3 mb-4 bg-black border-2 border-white text-white text-xs font-mono-numbers font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#ffffff] disabled:opacity-50"
          >
            {isGoogleLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                />
              </svg>
            )}
            <span>{isGoogleLoggingIn ? 'Connecting...' : 'Sign In with Google (Faculty)'}</span>
          </button>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-3 text-[10px] text-zinc-500 font-mono-numbers uppercase">
              OR SIGN IN WITH EMAIL & PASSWORD
            </span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form onSubmit={handleTeacherEmailSignIn} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Verified Teacher Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                placeholder="e.g. faculty@university.ac.in"
                className="w-full bg-black border-2 border-zinc-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono-numbers"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Account Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full bg-black border-2 border-zinc-700 pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono-numbers"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || isGoogleLoggingIn}
              className="w-full py-3.5 bg-white text-black font-black uppercase tracking-wider text-xs sm:text-sm hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>{isLoggingIn ? 'Signing In...' : 'Sign In & Verify Faculty Access'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onOpenRequestTeacherModal}
              className="w-full sm:w-auto px-4 py-2.5 border-2 border-zinc-700 hover:border-white text-white text-xs font-mono-numbers font-bold uppercase transition-colors"
            >
              Request Email Verification
            </button>
            <button
              type="button"
              onClick={() => onNavigate('student-login')}
              className="text-xs font-mono-numbers text-zinc-400 hover:text-white underline"
            >
              Need an account? Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VERIFIED TEACHER / FACULTY COMMAND SUITE ---
  const isSuperAdmin = currentUser.role === 'admin';
  const canAuthorCourse = (course: Course) =>
    isSuperAdmin ||
    doesCourseBelongToTeacher(course, { email: currentUser.email, name: currentUser.name }) ||
    course.teacherUid === currentUser.id;
  const ownCourses = courses.filter(canAuthorCourse);
  const kpiCourses = isSuperAdmin ? courses : ownCourses;
  const totalStudentsEnrolled = kpiCourses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
  const totalReviewsCount = kpiCourses.reduce((sum, c) => sum + (c.reviewsCount || 0), 0);
  const avgCourseRating =
    kpiCourses.length > 0
      ? (kpiCourses.reduce((sum, c) => sum + (c.rating || 5), 0) / kpiCourses.length).toFixed(2)
      : '5.00';

  const handleOpenCreateModal = () => {
    setEditingCourseId(null);
    setFormTitle('');
    setFormCode('CS-');
    setFormBranch('Computer Science & IT');
    setFormSemester('Semester 4');
    setFormCategory('Handwritten Notes');
    setFormPrice(499);
    setFormOriginalPrice(1299);
    setFormDuration('6 Hours');
    setFormPdfPages(85);
    setFormDescription('');
    setFormLearningOutcomes(
      '10-mark theory answer templates\nSolved previous 10 years questions\nDiagram proof layouts'
    );
    setFormNotesContent('');
    setFormSyllabus([
      {
        title: 'Module 1: High Yield Foundations & Formulas',
        duration: '1h 30m',
        topicsText: 'Core theorem proofs, Diagram layouts'
      },
      {
        title: 'Module 2: Mid-Term Numerical Mastery',
        duration: '2h 15m',
        topicsText: 'Past paper step deductions, Common exam traps'
      },
      {
        title: 'Module 3: End-Term Anticipated Problems',
        duration: '2h 15m',
        topicsText: '10-mark full proof solutions, Summary sheets'
      }
    ]);
    setUploadedPdfFileName(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourseId(course.id);
    setFormTitle(course.title);
    setFormCode(course.code);
    setFormBranch(course.branch);
    setFormSemester(course.semester);
    setFormCategory(course.category);
    setFormPrice(course.price);
    setFormOriginalPrice(course.originalPrice);
    setFormDuration(course.duration);
    setFormPdfPages(course.pdfPages || 75);
    setFormDescription(course.description);
    setFormLearningOutcomes(course.learningOutcomes.join('\n'));
    setFormNotesContent(course.notesContent || '');
    setFormSyllabus(
      (course.syllabus && course.syllabus.length > 0
        ? course.syllabus
        : [
            {
              title: 'Module 1: Core Foundations',
              duration: '1h 30m',
              topics: ['Core concepts', 'Solved numericals']
            }
          ]
      ).map((mod) => ({
        title: mod.title,
        duration: mod.duration,
        topicsText: (mod.topics || []).join(', ')
      }))
    );
    setUploadedPdfFileName(course.uploadedFileName || null);
    setIsModalOpen(true);
  };

  const handleNotesFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedPdfFileName(file.name);
    const isTextReadable =
      file.type.startsWith('text/') || /\.(txt|md|csv|json)$/i.test(file.name);
    if (isTextReadable) {
      try {
        const text = await file.text();
        setFormNotesContent(text.slice(0, 20000));
        showNotice(`Loaded notes text from ${file.name}`);
      } catch {
        showNotice(`Attached ${file.name}`);
      }
    } else {
      showNotice(`Attached ${file.name}. Add text summary below for instant student browser download.`);
    }
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCode.trim()) return;

    const outcomesArray = formLearningOutcomes
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedSyllabus = formSyllabus
      .filter((m) => m.title.trim().length > 0)
      .map((m) => ({
        title: m.title.trim(),
        duration: m.duration.trim() || '1h 30m',
        topics: m.topicsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      }));

    if (editingCourseId) {
      const existing = courses.find((c) => c.id === editingCourseId);
      if (existing) {
        const updated: Course = {
          ...existing,
          title: formTitle.trim(),
          code: formCode.trim().toUpperCase(),
          teacherEmail: existing.teacherEmail || currentUser.email.trim().toLowerCase(),
          teacherUid: existing.teacherUid || currentUser.id,
          branch: formBranch,
          semester: formSemester,
          category: formCategory,
          price: Number(formPrice),
          originalPrice: Number(formOriginalPrice),
          duration: formDuration.trim() || '6 Hours',
          pdfPages: Number(formPdfPages),
          modulesCount: parsedSyllabus.length > 0 ? parsedSyllabus.length : existing.modulesCount,
          description: formDescription.trim(),
          learningOutcomes: outcomesArray.length > 0 ? outcomesArray : existing.learningOutcomes,
          syllabus: parsedSyllabus.length > 0 ? parsedSyllabus : existing.syllabus,
          uploadedFileName: uploadedPdfFileName || existing.uploadedFileName,
          notesContent: formNotesContent.trim() || existing.notesContent,
          isApproved: requireAdminApproval ? false : true
        };
        onUpdateCourse(updated);
        showNotice(`Updated listing: ${formTitle}`);
      }
    } else {
      const newCourse: Course = {
        id: `course-usr-${Date.now().toString().slice(-5)}`,
        title: formTitle.trim(),
        code: formCode.trim().toUpperCase(),
        teacher: currentUser.name,
        teacherEmail: currentUser.email.trim().toLowerCase(),
        teacherUid: currentUser.id,
        teacherRole: currentUser.department || 'Verified University Mentor',
        branch: formBranch,
        semester: formSemester,
        category: formCategory,
        price: Number(formPrice),
        originalPrice: Number(formOriginalPrice),
        rating: 5.0,
        reviewsCount: 0,
        enrolledCount: 0,
        duration: formDuration.trim() || '6 Hours',
        modulesCount: parsedSyllabus.length || 3,
        pdfPages: Number(formPdfPages),
        description: formDescription.trim() || 'High-yield exam crash notes prepared by verified faculty.',
        learningOutcomes:
          outcomesArray.length > 0
            ? outcomesArray
            : ['Comprehensive syllabus derivations', 'Topper formula cheat sheets'],
        uploadedFileName: uploadedPdfFileName || undefined,
        notesContent: formNotesContent.trim() || undefined,
        isApproved: requireAdminApproval ? false : true,
        isNew: true,
        syllabus:
          parsedSyllabus.length > 0
            ? parsedSyllabus
            : [
                {
                  title: 'Module 1: High Yield Foundations & Formulas',
                  duration: '1h 30m',
                  topics: ['Core theorem proofs', 'Diagram layouts']
                }
              ]
      };
      onCreateCourse(newCourse);
      showNotice(
        requireAdminApproval
          ? `Listing created and queued for Admin Approval: ${formTitle}`
          : `Listing published live on Courses page: ${formTitle}`
      );
    }

    setIsModalOpen(false);
  };

  return (
    <div className="w-full bg-black text-white select-none min-h-screen">
      {/* Header bar */}
      <section className="border-b-2 border-white py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-400 uppercase">
              <GraduationCap className="w-4 h-4 text-white" />
              <span>
                VERIFIED TEACHERS PORTAL · {currentUser.department || 'FACULTY WORKSPACE'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase mt-2">
              Faculty Command Suite
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 flex flex-wrap items-center gap-2">
              <span>
                Signed in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-black font-black font-mono-numbers text-[10px] uppercase">
                <ShieldCheck className="w-3 h-3" />
                <span>{isSuperAdmin ? 'Super Admin Override' : 'Verified Teacher Email'}</span>
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'courses' && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="min-h-[44px] px-5 py-2.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Course / Notes</span>
              </button>
            )}
            {activeTab === 'news' && (
              <button
                type="button"
                onClick={() => (onOpenCreateNews ? onOpenCreateNews() : null)}
                className="min-h-[44px] px-5 py-2.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
              >
                <Plus className="w-4 h-4" />
                <span>Add News Article</span>
              </button>
            )}
            {activeTab === 'live-sessions' && (
              <button
                type="button"
                onClick={() => {
                  setEditingLiveSession(null);
                  setIsLiveModalOpen(true);
                }}
                className="min-h-[44px] px-5 py-2.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Live Session</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="min-h-[44px] px-4 py-2 border-2 border-zinc-700 bg-zinc-900 text-zinc-300 text-xs font-bold uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-7xl mx-auto mt-8 flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-6">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`min-h-[44px] px-4 py-2 text-xs font-mono-numbers font-black uppercase tracking-wider transition-colors border-2 flex items-center gap-2 ${
              activeTab === 'courses'
                ? 'border-white bg-white text-black shadow-[3px_3px_0px_0px_#ffffff]'
                : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Courses &amp; Notes Catalog ({ownCourses.length} Yours / {courses.length} Total)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live-sessions')}
            className={`min-h-[44px] px-4 py-2 text-xs font-mono-numbers font-black uppercase tracking-wider transition-colors border-2 flex items-center gap-2 ${
              activeTab === 'live-sessions'
                ? 'border-white bg-white text-black shadow-[3px_3px_0px_0px_#ffffff]'
                : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Doubt Sessions ({liveSessions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={`min-h-[44px] px-4 py-2 text-xs font-mono-numbers font-black uppercase tracking-wider transition-colors border-2 flex items-center gap-2 ${
              activeTab === 'news'
                ? 'border-white bg-white text-black shadow-[3px_3px_0px_0px_#ffffff]'
                : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Daily News &amp; Bulletins ({newsList.length})</span>
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {firebaseUser && !firebaseUser.emailVerified && (
          <div className="mb-8 p-4 bg-zinc-950 border-2 border-amber-400 text-xs font-mono-numbers flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5 text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span>
                  Email verification required for Cloud Firestore publishing: Please click the verification link sent to{' '}
                  <strong className="text-white">{firebaseUser.email}</strong>.
                </span>
                {verifyNotice && <div className="text-emerald-300 mt-1">{verifyNotice}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await onResendVerificationEmail();
                    setVerifyNotice('Verification email resent!');
                  } catch (err) {
                    setVerifyNotice(formatFirebaseAuthError(err).message);
                  }
                }}
                className="px-3 py-1.5 border border-amber-400 text-amber-200 hover:bg-amber-400 hover:text-black font-bold uppercase"
              >
                Resend Email
              </button>
              <button
                type="button"
                disabled={isCheckingVerify}
                onClick={async () => {
                  setIsCheckingVerify(true);
                  const ok = await onRefreshVerificationStatus();
                  setIsCheckingVerify(false);
                  setVerifyNotice(ok ? 'Email verified! Cloud sync ready.' : 'Not verified yet — click the email link first.');
                }}
                className="px-3 py-1.5 bg-white text-black font-black uppercase hover:bg-zinc-200 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingVerify ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <>
            {/* KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="p-5 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono-numbers">
                  {isSuperAdmin ? 'ALL CATALOG LISTINGS' : 'YOUR AUTHORED COURSES'}
                </div>
                <div className="text-3xl font-black font-mono-numbers mt-1 text-white tabular-nums">
                  {kpiCourses.length}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
                  {kpiCourses.filter((c) => c.isApproved).length} LIVE IN STUDENT REPO
                </div>
              </div>

              <div className="p-5 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono-numbers">
                  STUDENTS ENROLLED
                </div>
                <div className="text-3xl font-black font-mono-numbers mt-1 text-white tabular-nums">
                  {totalStudentsEnrolled.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
                  ACROSS YOUR LISTINGS
                </div>
              </div>

              <div className="p-5 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono-numbers">
                  AVERAGE RATING
                </div>
                <div className="text-3xl font-black font-mono-numbers mt-1 text-white tabular-nums">
                  {avgCourseRating} / 5.0
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
                  FROM {totalReviewsCount.toLocaleString('en-IN')} VERIFIED REVIEWS
                </div>
              </div>

              <div className="p-5 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono-numbers">
                  VERIFIED STATUS
                </div>
                <div className="text-2xl font-black font-mono-numbers mt-1 text-emerald-400">
                  ACTIVE
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers truncate">
                  {currentUser.email}
                </div>
              </div>
            </div>

            {/* Optional Admin Approval Control */}
            <div className="p-4 border-2 border-white bg-zinc-950 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-white shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider font-mono-numbers text-white">
                    CURRICULUM GOVERNANCE: OPTIONAL ADMIN APPROVAL STEP
                  </div>
                  <div className="text-xs text-zinc-400">
                    When enabled, newly submitted listings require Trust Admin sign-off before becoming visible on the public Courses catalog.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRequireAdminApproval(!requireAdminApproval);
                  showNotice(
                    !requireAdminApproval
                      ? 'Admin Approval mode ENABLED for new uploads.'
                      : 'Admin Approval mode DISABLED (Direct Publish).'
                  );
                }}
                className={`min-h-[44px] px-3.5 py-2 border text-xs font-mono-numbers font-bold uppercase transition-colors ${
                  requireAdminApproval
                    ? 'border-white bg-white text-black'
                    : 'border-zinc-700 bg-black text-zinc-400'
                }`}
              >
                Approval Required: {requireAdminApproval ? 'ON' : 'OFF (Instant Live)'}
              </button>
            </div>

            {/* Course Listings Table */}
            <section className="bg-zinc-950 border-2 border-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#ffffff]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                    CATALOG MANAGEMENT
                  </span>
                  <h2 className="text-xl sm:text-2xl font-heading font-black uppercase mt-1">
                    Course &amp; Notes Listings
                  </h2>
                </div>
                <span className="text-xs font-mono-numbers text-zinc-400">
                  {ownCourses.length} Owned · {courses.length} Total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-numbers">
                  <thead>
                    <tr className="border-b-2 border-white text-zinc-400 uppercase">
                      <th className="py-3 px-2">Code</th>
                      <th className="py-3 px-2">Course Title</th>
                      <th className="py-3 px-2">Format</th>
                      <th className="py-3 px-2">Branch</th>
                      <th className="py-3 px-2">Price</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {courses.map((course) => {
                      const isOwner = canAuthorCourse(course);
                      return (
                        <tr key={course.id} className="hover:bg-zinc-900 transition-colors">
                          <td className="py-3.5 px-2 font-bold text-white">{course.code}</td>
                          <td className="py-3.5 px-2">
                            <div className="font-bold text-white text-sm flex flex-wrap items-center gap-2">
                              <span>{course.title}</span>
                              {!isOwner && (
                                <span className="text-[9px] px-1.5 py-0.5 border border-zinc-700 text-zinc-400 uppercase">
                                  OTHER FACULTY
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              By {course.teacher} · {course.duration} ({course.pdfPages || 0} pages)
                            </div>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="border border-zinc-700 px-2 py-0.5 text-zinc-300">
                              {course.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-zinc-300">{course.branch}</td>
                          <td className="py-3.5 px-2 font-black text-white">₹{course.price}</td>
                          <td className="py-3.5 px-2">
                            <button
                              type="button"
                              disabled={!isOwner}
                              onClick={() => {
                                onToggleApproval(course.id);
                                showNotice(`Status changed for ${course.title}`);
                              }}
                              className={`min-h-[36px] px-2.5 py-1 text-[10px] font-bold border disabled:opacity-40 disabled:cursor-not-allowed ${
                                course.isApproved
                                  ? 'border-white bg-white text-black'
                                  : 'border-zinc-600 bg-zinc-900 text-zinc-400'
                              }`}
                            >
                              {course.isApproved ? 'LIVE / APPROVED' : 'PENDING REVIEW'}
                            </button>
                          </td>
                          <td className="py-3.5 px-2 text-right space-x-2">
                            {isOwner ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(course)}
                                  aria-label={`Edit ${course.title}`}
                                  className="min-w-[38px] min-h-[38px] inline-flex items-center justify-center p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                                  title="Edit listing"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmState({
                                      isOpen: true,
                                      title: 'Delete Course Listing',
                                      message: `Are you sure you want to permanently remove "${course.title}" (${course.code})?`,
                                      onConfirm: () => {
                                        onDeleteCourse(course.id);
                                        showNotice(`Deleted: ${course.title}`);
                                        setConfirmState((prev) => ({ ...prev, isOpen: false }));
                                      }
                                    })
                                  }
                                  aria-label={`Delete ${course.title}`}
                                  className="min-w-[38px] min-h-[38px] inline-flex items-center justify-center p-1.5 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400 transition-colors"
                                  title="Delete listing"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-zinc-500 uppercase">Read Only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === 'live-sessions' && (
          <section className="bg-zinc-950 border-2 border-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#ffffff]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-zinc-800 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                  INTERACTIVE LIVE DOUBT CLASSROOMS
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-black uppercase mt-1">
                  Scheduled Faculty Live Sessions
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Sessions published here sync directly to Student Study Desks in real time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingLiveSession(null);
                  setIsLiveModalOpen(true);
                }}
                className="min-h-[44px] px-4 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Live Session</span>
              </button>
            </div>

            {liveSessions.length === 0 ? (
              <div className="p-10 border border-zinc-800 bg-black text-center text-xs font-mono-numbers text-zinc-400">
                No live doubt sessions scheduled yet. Click "Schedule Live Session" to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {liveSessions.map((sess) => {
                  const canManageSession =
                    isSuperAdmin ||
                    !sess.hostEmail ||
                    sess.hostEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase();
                  return (
                    <div
                      key={sess.id}
                      className="p-5 bg-black border-2 border-zinc-700 flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono-numbers">
                          <span
                            className={`px-2 py-0.5 font-black uppercase ${
                              sess.status === 'LIVE'
                                ? 'bg-emerald-500 text-black'
                                : sess.status === 'UPCOMING'
                                ? 'bg-white text-black'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {sess.status}
                          </span>
                          <span className="text-zinc-400">
                            {sess.courseCode} · Room #{sess.roomNumber}
                          </span>
                        </div>
                        <h3 className="text-lg font-heading font-black uppercase text-white mt-2">
                          {sess.title}
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono-numbers mt-1">
                          {sess.hostName} · {sess.dateLabel} at {sess.timeLabel} ({sess.durationMinutes} mins)
                        </p>
                        {sess.agenda && (
                          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{sess.agenda}</p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-mono-numbers text-zinc-400 uppercase">
                          {sess.isPublished ? 'Published to Students' : 'Hidden Draft'}
                        </span>
                        <div className="flex items-center gap-2">
                          {sess.meetingUrl && (
                            <a
                              href={sess.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-[38px] px-2.5 py-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-[11px] font-mono-numbers flex items-center gap-1"
                            >
                              <span>Stream</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {canManageSession && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLiveSession(sess);
                                  setIsLiveModalOpen(true);
                                }}
                                aria-label={`Edit ${sess.title}`}
                                className="min-w-[38px] min-h-[38px] inline-flex items-center justify-center p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmState({
                                    isOpen: true,
                                    title: 'Delete Live Session',
                                    message: `Remove scheduled session "${sess.title}" (${sess.courseCode})?`,
                                    onConfirm: () => {
                                      if (onDeleteLiveSession) onDeleteLiveSession(sess.id);
                                      showNotice(`Deleted session: ${sess.title}`);
                                      setConfirmState((prev) => ({ ...prev, isOpen: false }));
                                    }
                                  })
                                }
                                aria-label={`Delete ${sess.title}`}
                                className="min-w-[38px] min-h-[38px] inline-flex items-center justify-center p-1.5 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'news' && (
          <section className="bg-zinc-950 border-2 border-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#ffffff]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-zinc-800 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                  COMMUNICATION CELL
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-black uppercase mt-1">
                  Daily News & Campus Bulletins
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Publish, update, or remove university exam alerts, AICTE circulars, and Tribe dispatches.
                </p>
              </div>
              <button
                onClick={() => (onOpenCreateNews ? onOpenCreateNews() : null)}
                className="px-4 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
              >
                <Plus className="w-4 h-4" />
                <span>Add News Article</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-numbers">
                <thead>
                  <tr className="border-b-2 border-white text-zinc-400 uppercase">
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Headline & Excerpt</th>
                    <th className="py-3 px-2">Author</th>
                    <th className="py-3 px-2">Date / Read Time</th>
                    <th className="py-3 px-2">Flags</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {newsList.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900 transition-colors">
                      <td className="py-3.5 px-2">
                        <span className="border border-zinc-700 bg-black px-2 py-0.5 text-zinc-300 uppercase font-bold text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 max-w-md">
                        <div className="font-bold text-white text-sm leading-snug">{item.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                          {item.summary}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-zinc-300">
                        <div>{item.author}</div>
                        {item.authorRole && (
                          <div className="text-[10px] text-zinc-500">{item.authorRole}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-zinc-400 text-[11px]">
                        <div>{item.date}</div>
                        <div className="text-zinc-500">{item.readTime}</div>
                      </td>
                      <td className="py-3.5 px-2 space-y-1">
                        {item.isBreaking && (
                          <span className="inline-block px-1.5 py-0.5 text-[9px] font-black uppercase bg-red-600 text-white mr-1">
                            BREAKING
                          </span>
                        )}
                        {item.isPinned && (
                          <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase border border-zinc-600 text-zinc-300">
                            PINNED
                          </span>
                        )}
                        {!item.isBreaking && !item.isPinned && (
                          <span className="text-[10px] text-zinc-500">STANDARD</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => (onOpenEditNews ? onOpenEditNews(item) : null)}
                          aria-label={`Edit ${item.title}`}
                          className="min-w-[38px] min-h-[38px] inline-flex items-center justify-center p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                          title="Edit this article"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmState({
                              isOpen: true,
                              title: 'Delete News Article',
                              message: `Permanently delete news dispatch "${item.title}"?`,
                              onConfirm: () => {
                                if (onDeleteNews) onDeleteNews(item.id);
                                showNotice(`Deleted article: ${item.title}`);
                                setConfirmState((prev) => ({ ...prev, isOpen: false }));
                              }
                            })
                          }
                          aria-label={`Delete ${item.title}`}
                          className="min-w-[38px] min-h-[38px] inline-flex items-center justify-center p-1.5 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400 transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Upload & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-black border-4 border-white text-white w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-[12px_12px_0px_0px_#ffffff] relative">
            <div className="p-6 bg-zinc-950 border-b-2 border-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-xs font-mono-numbers text-zinc-400 uppercase">
                  {editingCourseId ? 'UPDATE EXISTING LISTING' : 'PUBLISH NEW MATERIAL'}
                </span>
                <h3 className="text-xl font-heading font-black uppercase mt-1">
                  {editingCourseId ? 'Edit Course Listing' : 'Upload Notes / Course Pack'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 border border-zinc-700 hover:border-white hover:bg-white hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Course / Notes Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Compiler Design & LL(1) Parsing Notes"
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. CS-405"
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Department / Branch
                  </label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white uppercase font-bold"
                  >
                    <option value="Computer Science & IT">Computer Science & IT</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Common for All Branches">Common for All Branches</option>
                    <option value="Mechanical & Civil">Mechanical & Civil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Format Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white uppercase font-bold"
                  >
                    <option value="Handwritten Notes">Handwritten Notes</option>
                    <option value="Crash Course">Crash Course</option>
                    <option value="Full Course">Full Course</option>
                    <option value="Exam Booster">Exam Booster</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Semester
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white uppercase font-bold"
                  >
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-sm text-white font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-sm text-white font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Video Length
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 5 Hours"
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-sm text-white font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    PDF Pages Count
                  </label>
                  <input
                    type="number"
                    value={formPdfPages}
                    onChange={(e) => setFormPdfPages(Number(e.target.value))}
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-sm text-white font-mono-numbers"
                  />
                </div>
              </div>

              <div className="p-4 border-2 border-dashed border-zinc-700 bg-zinc-950 text-center space-y-3">
                <Upload className="w-8 h-8 text-white mx-auto" />
                <div className="text-xs font-bold uppercase font-mono-numbers text-white">
                  Study Notes &amp; Syllabus Attachment (.txt / .md / .pdf)
                </div>
                <p className="text-[11px] text-zinc-400">
                  Attached file:{' '}
                  <strong className="text-white">
                    {uploadedPdfFileName || 'None attached yet'}
                  </strong>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.pdf,.doc,.docx"
                  onChange={handleNotesFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] px-4 py-2 border border-zinc-600 hover:border-white text-zinc-200 hover:text-white text-[11px] uppercase font-mono-numbers font-bold"
                >
                  Choose File from Device
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  Attached Study Notes Text (Included in Student Download Pack)
                </label>
                <textarea
                  rows={3}
                  value={formNotesContent}
                  onChange={(e) => setFormNotesContent(e.target.value)}
                  placeholder="Paste key formulas, derivations, or upload a .txt / .md manuscript above..."
                  className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                    Syllabus Modules ({formSyllabus.length})
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormSyllabus((prev) => [
                        ...prev,
                        {
                          title: `Module ${prev.length + 1}: New Topic Unit`,
                          duration: '1h 30m',
                          topicsText: 'Core formulas, Past paper problems'
                        }
                      ])
                    }
                    className="px-2.5 py-1 border border-zinc-700 hover:border-white text-[10px] font-mono-numbers font-bold uppercase text-white flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Module</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formSyllabus.map((mod, idx) => (
                    <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) =>
                            setFormSyllabus((prev) =>
                              prev.map((m, i) => (i === idx ? { ...m, title: e.target.value } : m))
                            )
                          }
                          placeholder={`Module ${idx + 1} Title`}
                          className="flex-1 bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={mod.duration}
                          onChange={(e) =>
                            setFormSyllabus((prev) =>
                              prev.map((m, i) => (i === idx ? { ...m, duration: e.target.value } : m))
                            )
                          }
                          placeholder="1h 30m"
                          className="w-24 bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                        />
                        {formSyllabus.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormSyllabus((prev) => prev.filter((_, i) => i !== idx))
                            }
                            aria-label={`Remove module ${idx + 1}`}
                            className="p-1.5 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={mod.topicsText}
                        onChange={(e) =>
                          setFormSyllabus((prev) =>
                            prev.map((m, i) => (i === idx ? { ...m, topicsText: e.target.value } : m))
                          )
                        }
                        placeholder="Comma-separated topics covered..."
                        className="w-full bg-black border border-zinc-800 px-2.5 py-1.5 text-[11px] text-zinc-300 font-mono-numbers"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  Syllabus Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline what university syllabus and exam questions this course covers..."
                  className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs sm:text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  Key Learning Outcomes (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={formLearningOutcomes}
                  onChange={(e) => setFormLearningOutcomes(e.target.value)}
                  className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs sm:text-sm text-white font-mono-numbers"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] px-5 py-2.5 border border-zinc-700 text-xs font-bold uppercase hover:border-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
                >
                  {editingCourseId ? 'Save Changes' : 'Publish to Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Doubt Session Form Modal */}
      <LiveSessionFormModal
        isOpen={isLiveModalOpen}
        editingSession={editingLiveSession}
        defaultHostName={currentUser.name}
        defaultHostEmail={currentUser.email}
        onClose={() => {
          setIsLiveModalOpen(false);
          setEditingLiveSession(null);
        }}
        onSave={async (sess) => {
          if (onSaveLiveSession) {
            await onSaveLiveSession(sess);
          }
          showNotice(`Saved live session: ${sess.title}`);
        }}
      />

      {/* Accessible Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel="Delete"
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Floating notice */}
      {portalNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-black p-4 border-2 border-black font-mono-numbers text-xs font-bold shadow-[6px_6px_0px_0px_#000000] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-black" />
          <span>{portalNotice}</span>
        </div>
      )}
    </div>
  );
};
