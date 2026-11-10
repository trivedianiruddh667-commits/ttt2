import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../components/BrandLogo';
import { User, Course, Order, EnrolledCourse, LiveSession } from '../data/db';
import { NavPage } from '../components/Navbar';
import { StudentProfileModal } from '../components/StudentProfileModal';
import { LiveClassroomModal } from '../components/LiveClassroomModal';
import { downloadCourseStudyPack, downloadOrderReceipt } from '../lib/downloadUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  BookOpen,
  Clock,
  Download,
  Calendar,
  Award,
  PlayCircle,
  PauseCircle,
  FileText,
  CheckCircle,
  ChevronRight,
  LogOut,
  Sparkles,
  ExternalLink,
  Printer,
  Star,
  X,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  Mail,
  Loader2,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Plus,
  Minus,
  RotateCcw,
  Radio
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { formatFirebaseAuthError, FIREBASE_PROJECT_ID } from '../lib/firebase';

interface StudentDashboardPageProps {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  onLoginDemoStudent: () => void;
  onFirebaseEmailLogin: (email: string, password: string) => Promise<void>;
  onFirebaseEmailSignUp: (data: {
    name: string;
    college: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onFirebaseGoogleSignIn: () => Promise<void>;
  onFirebasePasswordReset: (email: string) => Promise<void>;
  onResendVerificationEmail: () => Promise<void>;
  onRefreshVerificationStatus: () => Promise<boolean>;
  onLogout: () => void;
  onNavigate: (page: NavPage) => void;
  courses: Course[];
  orders: Order[];
  enrolledCourses: EnrolledCourse[];
  liveSessions?: LiveSession[];
  onUpdateProgress: (courseId: string, newProgress: number) => void;
  onToggleModuleCompletion?: (
    courseId: string,
    moduleId: string,
    moduleTitle: string,
    totalModules: number
  ) => void;
  onMarkNotesDownloaded?: (courseId: string) => void;
  onUpdateProfileAndGoals?: (patch: {
    name: string;
    college: string;
    semester: string;
    department: string;
    targetSgpa: number;
  }) => Promise<void>;
  onUpdateStudyHours?: (hours: number[]) => Promise<void> | void;
  onOpenCourseModal?: (course: Course) => void;
  isVerifiedTeacher?: boolean;
  teacherRequestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  onOpenRequestTeacherModal?: () => void;
  onNotify?: (msg: string, variant?: 'success' | 'error' | 'info') => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  currentUser,
  firebaseUser,
  onLoginDemoStudent,
  onFirebaseEmailLogin,
  onFirebaseEmailSignUp,
  onFirebaseGoogleSignIn,
  onFirebasePasswordReset,
  onResendVerificationEmail,
  onRefreshVerificationStatus,
  onLogout,
  onNavigate,
  courses,
  orders,
  enrolledCourses,
  liveSessions = [],
  onUpdateProgress,
  onToggleModuleCompletion,
  onMarkNotesDownloaded,
  onUpdateProfileAndGoals,
  onUpdateStudyHours,
  onOpenCourseModal,
  isVerifiedTeacher = false,
  teacherRequestStatus = null,
  onOpenRequestTeacherModal,
  onNotify
}) => {
  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<{ message: string; isProviderDisabled?: boolean } | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [isCheckingVerify, setIsCheckingVerify] = useState(false);

  // Course study reader modal & interactive dashboard state
  const [activeCourseToStudy, setActiveCourseToStudy] = useState<Course | null>(null);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [isFocusPlaying, setIsFocusPlaying] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Order | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeLiveSession, setActiveLiveSession] = useState<LiveSession | null>(null);
  const todayDayIdx = (new Date().getDay() + 6) % 7;
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(todayDayIdx);

  const notifyLocal = (msg: string, variant: 'success' | 'error' | 'info' = 'success') => {
    if (onNotify) {
      onNotify(msg, variant);
    } else {
      setDownloadNotice(msg);
      setTimeout(() => setDownloadNotice(null), 3200);
    }
  };

  useEffect(() => {
    if (!activeCourseToStudy) {
      setIsFocusPlaying(false);
      setFocusSeconds(0);
      setSelectedModuleIdx(0);
      return;
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveCourseToStudy(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeCourseToStudy]);

  useEffect(() => {
    if (!viewingReceipt) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewingReceipt(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [viewingReceipt]);

  useEffect(() => {
    if (!isFocusPlaying || !activeCourseToStudy) return;
    const timer = window.setInterval(() => {
      setFocusSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isFocusPlaying, activeCourseToStudy]);

  // If NOT logged in (or logged in as admin without user profile), show the split screen Firebase Auth Login Page
  if (!currentUser || (currentUser.role !== 'student' && currentUser.role !== 'teacher')) {
    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError(null);
      setAuthNotice(null);

      const cleanEmail = email.trim();
      if (!cleanEmail) {
        setAuthError({ message: 'Please enter your email address.' });
        return;
      }

      if (authMode === 'reset') {
        setIsSubmitting(true);
        try {
          await onFirebasePasswordReset(cleanEmail);
          setAuthNotice(`Password reset link sent to ${cleanEmail}. Check your inbox or spam folder.`);
        } catch (err) {
          setAuthError(formatFirebaseAuthError(err));
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      if (password.length < 6) {
        setAuthError({ message: 'Password must be at least 6 characters long.' });
        return;
      }

      if (authMode === 'signup') {
        if (!name.trim() || !college.trim()) {
          setAuthError({ message: 'Please enter your full name and college/university.' });
          return;
        }
        if (confirmPassword && password !== confirmPassword) {
          setAuthError({ message: 'Passwords do not match. Please re-enter carefully.' });
          return;
        }
      }

      setIsSubmitting(true);
      try {
        if (authMode === 'signup') {
          await onFirebaseEmailSignUp({
            name: name.trim(),
            college: college.trim(),
            email: cleanEmail,
            password
          });
        } else {
          await onFirebaseEmailLogin(cleanEmail, password);
        }
      } catch (err) {
        setAuthError(formatFirebaseAuthError(err));
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleGoogleClick = async () => {
      setAuthError(null);
      setAuthNotice(null);
      setIsGoogleLoading(true);
      try {
        await onFirebaseGoogleSignIn();
      } catch (err) {
        setAuthError(formatFirebaseAuthError(err));
      } finally {
        setIsGoogleLoading(false);
      }
    };

    return (
      <div className="w-full min-h-[92vh] bg-black text-white flex flex-col lg:flex-row border-b-2 border-white select-none">
        {/* Left Side: Editorial Photo Showcase */}
        <div className="lg:w-1/2 relative bg-zinc-950 border-b-2 lg:border-b-0 lg:border-r-2 border-white overflow-hidden p-8 sm:p-12 flex flex-col justify-between min-h-[400px]">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img
              src="/src/assets/images/hero_students_bw_1793717856347.jpg"
              alt="Background study group"
              className="w-full h-full object-cover filter grayscale contrast-150"
            />
          </div>

          <div className="relative z-10">
            <BrandLogo variant="navbar" />
            <div className="mt-12 space-y-4">
              <span className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-mono-numbers">
                FIREBASE CLOUD ACCOUNT ACCESS
              </span>
              <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase leading-tight">
                One Account.
                <br />
                Every Semester Mastered.
              </h2>
              <p className="text-sm text-zinc-300 max-w-md leading-relaxed">
                Sign in with your Email & Password or Google account to stream fast-track lecture modules, sync enrolled courses to the cloud, and track your exam progress across devices.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-zinc-800">
            <div className="text-xs text-zinc-400 font-mono-numbers">
              “The DBMS handwritten notes alone raised my SGPA from 6.8 to 8.9.”
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 font-mono-numbers">
              — 4th Sem Topper, Pune University
            </div>
          </div>
        </div>

        {/* Right Side: Firebase Auth Form */}
        <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center bg-black">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                {authMode === 'signup'
                  ? 'NEW CADET REGISTRATION'
                  : authMode === 'reset'
                  ? 'PASSWORD RECOVERY'
                  : 'RETURNING TRIBE CADET'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
                {authMode === 'signup'
                  ? 'Create Student Account'
                  : authMode === 'reset'
                  ? 'Reset Your Password'
                  : 'Sign In to Tribe'}
              </h3>
            </div>

            {/* Primary Auth Mode Tabs (Sign In vs Create Account) */}
            <div className="grid grid-cols-2 border-2 border-white mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                  setAuthNotice(null);
                }}
                className={`py-2.5 text-xs font-mono-numbers font-black uppercase transition-colors ${
                  authMode === 'login'
                    ? 'bg-white text-black'
                    : 'bg-black text-zinc-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                  setAuthNotice(null);
                }}
                className={`py-2.5 text-xs font-mono-numbers font-black uppercase transition-colors border-l-2 border-white ${
                  authMode === 'signup'
                    ? 'bg-white text-black'
                    : 'bg-black text-zinc-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              disabled={isGoogleLoading || isSubmitting}
              onClick={handleGoogleClick}
              className="w-full py-3 mb-3 bg-zinc-950 border-2 border-white text-white text-xs font-mono-numbers font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2.5 shadow-[4px_4px_0px_0px_#ffffff] disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Quick Optional Demo Account */}
            <button
              type="button"
              onClick={onLoginDemoStudent}
              className="w-full py-2.5 mb-5 bg-black border border-zinc-700 text-zinc-300 text-[11px] font-mono-numbers font-bold uppercase tracking-wider hover:border-white hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant 1-Click Demo Student Preview</span>
            </button>

            <div className="relative flex py-2 items-center mb-5">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-4 text-[10px] text-zinc-500 font-mono-numbers uppercase">
                {authMode === 'reset' ? 'EMAIL PASSWORD RESET' : 'OR USE EMAIL & PASSWORD'}
              </span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            {/* Auth Errors / Notifications */}
            {authError && (
              <div className="mb-4 p-3.5 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-mono-numbers space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{authError.message}</span>
                </div>
                {authError.isProviderDisabled && (
                  <div className="pt-2 border-t border-red-800 text-[11px] text-red-100">
                    Admin setup required: Open Firebase Console for project{' '}
                    <strong className="underline">{FIREBASE_PROJECT_ID}</strong> &rarr;{' '}
                    <strong>Authentication &rarr; Sign-in method &rarr; Email/Password &rarr; Enable</strong>.
                  </div>
                )}
              </div>
            )}

            {authNotice && (
              <div className="mb-4 p-3.5 bg-emerald-950/70 border-2 border-emerald-400 text-emerald-200 text-xs font-mono-numbers flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{authNotice}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aryan Sharma"
                      className="w-full bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                      College / University *
                    </label>
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. DTU / VIT / BITS Pilani"
                      className="w-full bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="student@university.edu"
                    className="w-full bg-zinc-950 border-2 border-zinc-700 pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono-numbers transition-colors"
                  />
                </div>
              </div>

              {authMode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      Password *
                    </label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('reset');
                          setAuthError(null);
                          setAuthNotice(null);
                        }}
                        className="text-[11px] font-mono-numbers text-zinc-400 hover:text-white underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-zinc-950 border-2 border-zinc-700 pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono-numbers transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono-numbers transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isGoogleLoading}
                className="w-full py-3.5 bg-white text-black font-black uppercase tracking-wider text-xs sm:text-sm hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isSubmitting
                    ? 'Please Wait...'
                    : authMode === 'signup'
                    ? 'Create Account & Sign In'
                    : authMode === 'reset'
                    ? 'Send Password Reset Email'
                    : 'Log In with Email'}
                </span>
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              {authMode === 'reset' ? (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                    setAuthNotice(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-white underline font-mono-numbers block mx-auto"
                >
                  Back to Email Log In
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'signup' ? 'login' : 'signup');
                    setAuthError(null);
                    setAuthNotice(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-white underline font-mono-numbers block mx-auto"
                >
                  {authMode === 'signup'
                    ? 'Already have an account? Log In'
                    : "Don't have an account? Create one free"}
                </button>
              )}

              {onOpenRequestTeacherModal && (
                <div className="pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={onOpenRequestTeacherModal}
                    className="text-xs text-zinc-300 hover:text-white font-mono-numbers flex items-center justify-center gap-1.5 mx-auto border border-zinc-800 hover:border-white px-3 py-2 transition-colors"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Faculty / Educator? Request Teacher Email Verification</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGGED IN: Interactive Student Dashboard ---
  const myEnrolledData = enrolledCourses
    .map((enr) => {
      const course = courses.find((c) => c.id === enr.courseId);
      if (!course) return null;
      return {
        course,
        ...enr
      };
    })
    .filter((entry): entry is EnrolledCourse & { course: Course } => entry !== null);

  const avgCompletion =
    myEnrolledData.length > 0
      ? Math.round(
          myEnrolledData.reduce((acc, item) => acc + item.progressPercent, 0) /
            myEnrolledData.length
        )
      : 0;
  const completedCoursesCount = myEnrolledData.filter((e) => e.progressPercent >= 100).length;
  const targetSgpaValue = Number((currentUser.targetSgpa ?? 9.2).toFixed(1));
  const defaultHours = [2.5, 3.5, 1.5, 4.0, 2.0, 5.0, 3.0];
  const weeklyHours =
    Array.isArray(currentUser.weeklyStudyHours) && currentUser.weeklyStudyHours.length === 7
      ? currentUser.weeklyStudyHours
      : defaultHours;
  const totalWeeklyHours = Number(weeklyHours.reduce((sum, h) => sum + h, 0).toFixed(1));
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const maxDayHours = Math.max(5, ...weeklyHours);
  const publishedSessions = liveSessions.filter((s) => s.isPublished);

  const adjustDayHours = (dayIndex: number, delta: number) => {
    const next = weeklyHours.map((h, idx) =>
      idx === dayIndex ? Number(Math.min(16, Math.max(0, h + delta)).toFixed(1)) : h
    );
    if (onUpdateStudyHours) {
      onUpdateStudyHours(next);
    }
    notifyLocal(
      `${dayNames[dayIndex]} study time updated to ${next[dayIndex]}h`,
      'info'
    );
  };

  return (
    <div className="w-full bg-black text-white select-none min-h-screen">
      {/* Top Welcome Header */}
      <section className="border-b-2 border-white py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-400 uppercase">
              <span className="w-2 h-2 bg-white" />
              <span>STUDENT DASHBOARD ACTIVE</span>
              <span>·</span>
              <span>{currentUser.college}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase mt-2">
              Welcome Back, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {currentUser.semester || 'Active Semester'} · {myEnrolledData.length} Active Exam{' '}
              {myEnrolledData.length === 1 ? 'Track' : 'Tracks'} · Instant Access
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="min-h-[44px] px-4 py-2 border-2 border-zinc-600 bg-black text-white text-xs font-mono-numbers font-bold uppercase hover:border-white transition-colors flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Profile &amp; SGPA Goal</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('courses')}
              className="min-h-[44px] px-4 py-2 border-2 border-white bg-white text-black text-xs font-black uppercase hover:bg-zinc-200 transition-colors shadow-[2px_2px_0px_0px_#ffffff]"
            >
              Browse More Courses
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="min-h-[44px] px-4 py-2 border-2 border-zinc-700 bg-zinc-900 text-zinc-300 text-xs font-bold uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Non-blocking Email Verification Banner for newly registered Firebase Email/Password users */}
        {firebaseUser && !firebaseUser.emailVerified && (
          <div className="mb-6 p-4 bg-zinc-950 border-2 border-amber-400 text-xs font-mono-numbers flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5 text-amber-200">
              <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span>
                  Verification link sent to <strong className="text-white">{firebaseUser.email}</strong>. Verify your email to unlock verified teacher publishing & role checks.
                </span>
                {verificationNotice && (
                  <div className="text-emerald-300 mt-1">{verificationNotice}</div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await onResendVerificationEmail();
                    setVerificationNotice('Verification email resent! Check your inbox/spam.');
                  } catch (err) {
                    setVerificationNotice(formatFirebaseAuthError(err).message);
                  }
                }}
                className="px-3 py-1.5 border border-amber-400 text-amber-200 hover:bg-amber-400 hover:text-black font-bold uppercase transition-colors"
              >
                Resend Email
              </button>
              <button
                type="button"
                disabled={isCheckingVerify}
                onClick={async () => {
                  setIsCheckingVerify(true);
                  const verified = await onRefreshVerificationStatus();
                  setIsCheckingVerify(false);
                  setVerificationNotice(
                    verified
                      ? 'Email verified successfully!'
                      : 'Still waiting for link click — check your inbox and click Verify.'
                  );
                }}
                className="px-3 py-1.5 bg-white text-black font-black uppercase hover:bg-zinc-200 transition-colors flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingVerify ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>
            </div>
          </div>
        )}

        {/* Verified Teacher Access Banner (ONLY visible to verified emails) OR Request Verification bar */}
        {isVerifiedTeacher ? (
          <div className="mb-8 p-5 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-white text-black shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-mono-numbers font-bold uppercase text-emerald-400">
                  VERIFIED TEACHER EMAIL · {currentUser.email}
                </div>
                <div className="text-sm font-heading font-black uppercase text-white mt-0.5">
                  Your email is approved for Teachers Portal access
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('teacher-portal')}
              className="px-5 py-2.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors border-2 border-white shadow-[3px_3px_0px_0px_#ffffff] flex items-center gap-2 shrink-0"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Open Teachers Portal</span>
            </button>
          </div>
        ) : (
          onOpenRequestTeacherModal && (
            <div className="mb-8 p-4 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-numbers">
              <div className="flex items-center gap-2.5 text-zinc-400">
                <GraduationCap className="w-4 h-4 text-zinc-300 shrink-0" />
                {teacherRequestStatus === 'PENDING' ? (
                  <span>
                    Teacher verification request for <strong className="text-white">{currentUser.email}</strong> is{' '}
                    <span className="text-amber-400 font-bold">PENDING ADMIN APPROVAL</span>.
                  </span>
                ) : teacherRequestStatus === 'REJECTED' ? (
                  <span>
                    Teacher verification for <strong className="text-white">{currentUser.email}</strong> was declined. You can submit an updated request.
                  </span>
                ) : (
                  <span>
                    Teaching with the Tribe? Request Admin verification for <strong className="text-white">{currentUser.email}</strong>.
                  </span>
                )}
              </div>
              {teacherRequestStatus !== 'PENDING' && (
                <button
                  onClick={onOpenRequestTeacherModal}
                  className="px-3.5 py-1.5 border border-zinc-700 hover:border-white text-white font-bold uppercase transition-colors shrink-0"
                >
                  Apply as Faculty
                </button>
              )}
            </div>
          )
        )}

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="p-5 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono-numbers">
              ENROLLED COURSES
            </div>
            <div className="text-3xl font-black font-mono-numbers mt-1 text-white tabular-nums">
              {myEnrolledData.length}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
              100% UNRESTRICTED ACCESS
            </div>
          </div>

          <div className="p-5 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono-numbers">
              OVERALL PROGRESS
            </div>
            <div className="text-3xl font-black font-mono-numbers mt-1 text-white tabular-nums">
              {avgCompletion}%
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
              {completedCoursesCount} OF {myEnrolledData.length} TRACKS COMPLETED
            </div>
          </div>

          <div className="p-5 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] flex flex-col justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono-numbers flex items-center justify-between">
                <span>TARGET SGPA</span>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-[10px] underline text-zinc-300 hover:text-white"
                >
                  Edit
                </button>
              </div>
              <div className="text-3xl font-black font-mono-numbers mt-1 text-white tabular-nums">
                {targetSgpaValue.toFixed(1)}
              </div>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
              CUSTOM SEMESTER GOAL
            </div>
          </div>

          <div className="p-5 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono-numbers">
              ORDERS CONFIRMED
            </div>
            <div className="text-3xl font-black font-mono-numbers mt-1 text-white tabular-nums">
              {orders.length}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
              TAX INVOICES READY
            </div>
          </div>
        </div>

        {/* Enrolled Courses with Progress Bars */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6 border-b-2 border-white pb-3">
            <div>
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                MY STUDY REPOSITORY
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
                Enrolled Courses & Active Notes
              </h2>
            </div>
            <span className="text-xs font-mono-numbers text-zinc-400">
              {myEnrolledData.length} Subjects Active
            </span>
          </div>

          {myEnrolledData.length === 0 ? (
            <div className="text-center py-16 border-2 border-zinc-800 bg-zinc-950 p-8">
              <h3 className="text-lg font-heading font-bold uppercase">No courses enrolled yet</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Explore our catalog to get started with fast-track modules and handwritten notes.
              </p>
              <button
                onClick={() => onNavigate('courses')}
                className="mt-4 px-6 py-2.5 bg-white text-black font-bold uppercase text-xs"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myEnrolledData.map((item) => (
                <div
                  key={item.courseId}
                  className="bg-zinc-950 border-2 border-white p-6 shadow-[6px_6px_0px_0px_#ffffff] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono-numbers text-zinc-400 mb-2">
                      <span>{item.course.code}</span>
                      <span className="border border-zinc-700 px-2 py-0.5 text-white">
                        {item.course.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-heading font-black uppercase leading-snug">
                      {item.course.title}
                    </h3>
                    <div className="text-xs text-zinc-400 mt-1">
                      Mentor: <strong className="text-white">{item.course.teacher}</strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono-numbers">
                        <span className="text-zinc-400">Syllabus Completion</span>
                        <span className="text-white font-bold">{item.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 border border-zinc-700 h-3 overflow-hidden">
                        <div
                          className="bg-white h-full transition-all duration-300"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-400 mt-3 font-mono-numbers">
                      Next up: <span className="text-white">{item.lastAccessedModule}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModuleIdx(0);
                        setFocusSeconds(0);
                        setIsFocusPlaying(false);
                        setActiveCourseToStudy(item.course);
                      }}
                      className="min-h-[44px] px-4 py-2 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>

                    {onOpenCourseModal && (
                      <button
                        type="button"
                        onClick={() => onOpenCourseModal(item.course)}
                        className={`min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-colors cursor-pointer ${
                          item.progressPercent >= 100
                            ? 'border-white bg-zinc-900 text-white hover:bg-white hover:text-black shadow-[2px_2px_0px_0px_#ffffff]'
                            : 'border-zinc-700 hover:border-white text-zinc-300 hover:text-white'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.progressPercent >= 100 ? 'fill-white' : ''}`} />
                        <span>{item.progressPercent >= 100 ? 'Leave a Review' : 'Reviews'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const fileName = downloadCourseStudyPack(item.course);
                        if (onMarkNotesDownloaded) {
                          onMarkNotesDownloaded(item.courseId);
                        }
                        notifyLocal(`Downloaded ${fileName}`, 'success');
                      }}
                      className="min-h-[44px] px-3.5 py-2 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Study Pack</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recharts Progress Overview Across All Enrolled Courses */}
        <section className="mb-16">
          <div className="bg-zinc-950 border-2 border-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#ffffff]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-zinc-800 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                  RECHARTS ANALYTICS · COURSE COMPLETION RATES
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-black uppercase mt-1">
                  Enrolled Course Progress Overview
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-300">
                <span className="w-2 h-2 bg-white inline-block" />
                <span>Active Enrolled: {myEnrolledData.length} Subjects</span>
              </div>
            </div>

            {myEnrolledData.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 font-mono-numbers text-xs">
                No enrolled courses to chart yet.
              </div>
            ) : (
              <div className="w-full h-72 sm:h-80 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={myEnrolledData.map((item) => ({
                      name: item.course.code,
                      fullName: item.course.title,
                      completion: item.progressPercent,
                      category: item.course.category
                    }))}
                    margin={{ top: 10, right: 30, left: -10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#a1a1aa"
                      tick={{ fill: '#a1a1aa', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
                      tickLine={false}
                      axisLine={{ stroke: '#3f3f46' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#a1a1aa"
                      tick={{ fill: '#a1a1aa', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
                      tickLine={false}
                      axisLine={{ stroke: '#3f3f46' }}
                      unit="%"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-black border-2 border-white p-3 text-xs font-mono-numbers shadow-[4px_4px_0px_0px_#ffffff]">
                              <div className="font-bold text-white uppercase">{data.fullName}</div>
                              <div className="text-zinc-400 mt-1">Course Code: {data.name}</div>
                              <div className="text-white font-black mt-1">
                                Completion Rate: {data.completion}%
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="completion" fill="#ffffff" radius={[2, 2, 0, 0]}>
                      {myEnrolledData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.progressPercent >= 100 ? '#ffffff' : '#d4d4d8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between text-xs font-mono-numbers text-zinc-400">
              <span>Goal: 100% End-Term Mastery</span>
              <span className="text-white font-bold">
                Average Completion Rate:{' '}
                {myEnrolledData.length > 0
                  ? Math.round(
                      myEnrolledData.reduce((acc, c) => acc + c.progressPercent, 0) /
                        myEnrolledData.length
                    )
                  : 0}
                %
              </span>
            </div>
          </div>
        </section>

        {downloadNotice && (
          <div className="fixed bottom-6 right-6 z-50 bg-white text-black p-4 border-2 border-black font-mono-numbers text-xs font-bold shadow-[6px_6px_0px_0px_#000000] flex items-center gap-2 animate-in slide-in-from-bottom">
            <CheckCircle className="w-4 h-4 text-black" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Charts & Analytics + Upcoming Classes Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Left: Interactive Weekly Study Hours Tracker */}
          <div className="lg:col-span-7 bg-zinc-950 border-2 border-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#ffffff]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                  INTERACTIVE EFFORT LOG · CLICK ANY DAY TO ADJUST
                </span>
                <h3 className="text-xl font-heading font-black uppercase mt-1">
                  Weekly Study Hours (Mon - Sun)
                </h3>
              </div>
              <span className="text-xs font-mono-numbers bg-black border border-white px-2.5 py-1 text-white font-bold">
                TOTAL: {totalWeeklyHours} HOURS
              </span>
            </div>

            {/* Interactive Monochrome Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2 border-b border-zinc-800">
              {weeklyHours.map((hrs, i) => {
                const percent = Math.max(8, Math.round((hrs / maxDayHours) * 100));
                const isSelected = selectedDayIdx === i;
                return (
                  <button
                    type="button"
                    key={dayNames[i]}
                    onClick={() => setSelectedDayIdx(i)}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end group focus:outline-none"
                    aria-label={`Select ${dayNames[i]} (${hrs} hours)`}
                  >
                    <span
                      className={`text-[10px] font-mono-numbers transition-opacity ${
                        isSelected ? 'text-white font-black opacity-100' : 'text-zinc-400 opacity-80 group-hover:opacity-100'
                      }`}
                    >
                      {hrs}h
                    </span>
                    <div
                      className={`w-full transition-all duration-300 border ${
                        isSelected
                          ? 'bg-white border-white shadow-[0_0_0_2px_#000,0_0_0_4px_#fff]'
                          : 'bg-zinc-400 group-hover:bg-white border-black'
                      }`}
                      style={{ height: `${percent}%` }}
                    />
                    <span
                      className={`text-[10px] font-mono-numbers font-bold ${
                        isSelected ? 'text-white underline' : 'text-zinc-500'
                      }`}
                    >
                      {dayNames[i]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Day Adjustment Controls */}
            <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-numbers">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 uppercase">
                  {dayNames[selectedDayIdx]} LOG: <strong className="text-white">{weeklyHours[selectedDayIdx]}h</strong>
                </span>
                <button
                  type="button"
                  onClick={() => adjustDayHours(selectedDayIdx, -0.5)}
                  className="min-w-[40px] min-h-[40px] border border-zinc-700 hover:border-white bg-black text-white flex items-center justify-center"
                  aria-label={`Decrease ${dayNames[selectedDayIdx]} study hours`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustDayHours(selectedDayIdx, 0.5)}
                  className="min-w-[40px] min-h-[40px] border border-white bg-white text-black hover:bg-zinc-200 flex items-center justify-center font-black"
                  aria-label={`Increase ${dayNames[selectedDayIdx]} study hours`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateStudyHours) onUpdateStudyHours(defaultHours);
                    notifyLocal('Weekly study log reset to baseline schedule.', 'info');
                  }}
                  className="min-h-[40px] px-2.5 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white flex items-center gap-1 text-[10px] uppercase"
                  title="Reset week"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-zinc-400">
                <span>Goal: 15h/wk</span>
                <span className="text-white font-bold">
                  {totalWeeklyHours >= 15
                    ? `EXCEEDED (+${Math.round(((totalWeeklyHours - 15) / 15) * 100)}%)`
                    : `${(15 - totalWeeklyHours).toFixed(1)}h TO GOAL`}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Doubt Clears Synced From Firestore */}
          <div className="lg:col-span-5 bg-zinc-950 border-2 border-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#ffffff] flex flex-col justify-between">
            <div>
              <div className="mb-4 pb-4 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-white" />
                    <span>LIVE DOUBT CLEARS</span>
                  </span>
                  <h3 className="text-xl font-heading font-black uppercase mt-1">
                    Upcoming Live Classes ({publishedSessions.length})
                  </h3>
                </div>
              </div>

              {publishedSessions.length === 0 ? (
                <div className="p-6 border border-zinc-800 bg-black text-center text-xs font-mono-numbers text-zinc-400">
                  No live doubt classes scheduled right now. Verified faculty sessions appear here automatically.
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {publishedSessions.map((sess) => (
                    <div key={sess.id} className="p-4 border border-zinc-700 bg-black">
                      <div className="flex items-center justify-between text-xs font-mono-numbers text-zinc-400">
                        <span
                          className={`font-black px-1.5 py-0.5 text-[10px] ${
                            sess.status === 'LIVE'
                              ? 'bg-emerald-500 text-black'
                              : sess.status === 'UPCOMING'
                              ? 'bg-white text-black'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {sess.status === 'LIVE' ? 'LIVE NOW' : `${sess.dateLabel} · ${sess.timeLabel}`}
                        </span>
                        <span>ROOM #{sess.roomNumber}</span>
                      </div>
                      <h4 className="font-heading font-bold uppercase text-sm mt-2 text-white">
                        {sess.courseCode}: {sess.title}
                      </h4>
                      <div className="text-xs text-zinc-400 mt-1">
                        With {sess.hostName} · {sess.durationMinutes} mins
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveLiveSession(sess)}
                        className="mt-3 w-full min-h-[44px] py-2 bg-zinc-900 border border-white text-white text-xs font-bold uppercase hover:bg-white hover:text-black transition-colors"
                      >
                        {sess.status === 'LIVE' ? 'Enter Live Classroom' : 'Open Session Brief & Check-In'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800 text-xs font-mono-numbers text-zinc-500">
              CHECK IN TO ANY LIVE SESSION TO AUTO-LOG +1.0H TO YOUR WEEKLY TRACKER
            </div>
          </div>
        </div>

        {/* Purchase History & Receipts Table */}
        <section className="bg-zinc-950 border-2 border-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#ffffff]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
            <div>
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                FINANCIAL LEDGER
              </span>
              <h3 className="text-xl sm:text-2xl font-heading font-black uppercase mt-1">
                Purchase History &amp; Receipts
              </h3>
            </div>
            <span className="text-xs font-mono-numbers text-zinc-400">
              {orders.length} Invoices
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-400 font-mono-numbers">
              No orders logged yet. Purchases made via Razorpay will generate receipts here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-numbers">
                <thead>
                  <tr className="border-b-2 border-white text-zinc-400 uppercase">
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Items Purchased</th>
                    <th className="py-3 px-2">Method</th>
                    <th className="py-3 px-2">Total Amount</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-900 transition-colors">
                      <td className="py-3 px-2 font-bold text-white">{ord.id}</td>
                      <td className="py-3 px-2 text-zinc-400">{ord.date}</td>
                      <td className="py-3 px-2 text-zinc-200">
                        {ord.items.map((i) => i.title).join(', ')}
                      </td>
                      <td className="py-3 px-2 text-zinc-400">{ord.paymentMethod}</td>
                      <td className="py-3 px-2 font-black text-white">₹{ord.total}</td>
                      <td className="py-3 px-2">
                        <span className="px-1.5 py-0.5 border border-white text-white text-[10px] font-bold">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingReceipt(ord)}
                          className="min-h-[40px] px-3 py-1.5 bg-white text-black hover:bg-zinc-200 font-bold uppercase text-[10px] transition-colors"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Interactive Study Reader Modal */}
      {activeCourseToStudy && (() => {
        const currentEnrollment = enrolledCourses.find(
          (e) => e.courseId === activeCourseToStudy.id
        );
        const syllabusList =
          activeCourseToStudy.syllabus && activeCourseToStudy.syllabus.length > 0
            ? activeCourseToStudy.syllabus
            : [
                {
                  title: 'Module 01: Core University Proofs & Derivations',
                  duration: activeCourseToStudy.duration || '2 Hours',
                  topics: ['High-yield concepts', 'Past-year numericals']
                }
              ];
        const safeModIdx = Math.min(selectedModuleIdx, syllabusList.length - 1);
        const activeMod = syllabusList[safeModIdx];
        const completedList = currentEnrollment?.completedModules || [];
        const focusMins = Math.floor(focusSeconds / 60);
        const focusRemSecs = focusSeconds % 60;
        const formattedTimer = `${String(focusMins).padStart(2, '0')}:${String(focusRemSecs).padStart(2, '0')}`;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Course Study Desk"
            onClick={() => setActiveCourseToStudy(null)}
          >
            <div
              className="bg-black border-4 border-white text-white w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-[12px_12px_0px_0px_#ffffff] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 bg-zinc-950 border-b-2 border-white flex items-center justify-between sticky top-0 z-10 gap-3">
                <div>
                  <span className="text-xs font-mono-numbers text-zinc-400 uppercase">
                    ACTIVE STUDY DESK · {activeCourseToStudy.code} · {currentEnrollment?.progressPercent ?? 0}% COMPLETE
                  </span>
                  <h3 className="text-xl font-heading font-black uppercase mt-1">
                    {activeCourseToStudy.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCourseToStudy(null)}
                  aria-label="Close study desk"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-zinc-700 hover:border-white hover:bg-white hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Interactive Module Stream & Focus Session Player */}
                <div className="w-full bg-zinc-950 border-2 border-white p-6 text-center space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-numbers text-zinc-400 border-b border-zinc-800 pb-3">
                    <span>
                      MODULE {safeModIdx + 1} OF {syllabusList.length}
                    </span>
                    <span className="text-white font-bold">
                      SESSION TIMER: {formattedTimer}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFocusPlaying((prev) => !prev)}
                    aria-label={isFocusPlaying ? 'Pause focus session' : 'Start focus session'}
                    className="w-16 h-16 mx-auto border-2 border-white bg-black flex items-center justify-center shadow-[4px_4px_0px_0px_#ffffff] hover:scale-105 transition-transform"
                  >
                    {isFocusPlaying ? (
                      <PauseCircle className="w-10 h-10 text-emerald-400" />
                    ) : (
                      <PlayCircle className="w-10 h-10 text-white" />
                    )}
                  </button>

                  <div>
                    <div className="font-heading font-black text-lg uppercase text-white">
                      {activeMod.title}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1 font-mono-numbers">
                      Duration: {activeMod.duration} · Taught by {activeCourseToStudy.teacher}
                    </div>
                    {activeMod.topics && activeMod.topics.length > 0 && (
                      <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {activeMod.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-black border border-zinc-700 text-[11px] font-mono-numbers text-zinc-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const fileName = downloadCourseStudyPack(activeCourseToStudy);
                        if (onMarkNotesDownloaded) {
                          onMarkNotesDownloaded(activeCourseToStudy.id);
                        }
                        notifyLocal(`Downloaded ${fileName}`, 'success');
                      }}
                      className="min-h-[44px] px-4 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Complete Study Pack</span>
                    </button>

                    {focusSeconds >= 30 && (
                      <button
                        type="button"
                        onClick={() => {
                          adjustDayHours(todayDayIdx, 0.5);
                          setFocusSeconds(0);
                          setIsFocusPlaying(false);
                        }}
                        className="min-h-[44px] px-4 py-2 border border-emerald-400 text-emerald-300 hover:bg-emerald-500 hover:text-black font-mono-numbers font-bold uppercase text-xs"
                      >
                        Log +0.5h Study to Tracker
                      </button>
                    )}
                  </div>
                </div>

                {/* Faculty Uploaded Notes Content if available */}
                {activeCourseToStudy.notesContent && (
                  <div className="p-4 border-2 border-zinc-700 bg-zinc-950 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono-numbers text-zinc-400">
                      <span className="uppercase font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        <span>Faculty Attached Notes ({activeCourseToStudy.uploadedFileName || 'Manuscript'})</span>
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs font-mono-numbers text-zinc-200 bg-black p-3 border border-zinc-800 max-h-48 overflow-y-auto">
                      {activeCourseToStudy.notesContent}
                    </pre>
                  </div>
                )}

                {/* Modules Checklist */}
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers mb-3">
                    INTERACTIVE SYLLABUS MODULES ({completedList.length}/{syllabusList.length} DONE)
                  </h4>
                  <div className="space-y-2">
                    {syllabusList.map((mod, i) => {
                      const modId = `mod-${i + 1}`;
                      const isModDone = completedList.includes(modId);
                      const isActiveRow = i === safeModIdx;
                      return (
                        <div
                          key={modId}
                          onClick={() => setSelectedModuleIdx(i)}
                          className={`p-3 border cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            isActiveRow
                              ? 'border-white bg-zinc-900'
                              : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <CheckCircle
                              className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${
                                isModDone ? 'text-emerald-400' : 'text-zinc-600'
                              }`}
                            />
                            <div>
                              <div className="text-xs font-bold text-white uppercase">{mod.title}</div>
                              <div className="text-[11px] text-zinc-400">
                                {mod.duration} · {mod.topics.join(' · ')}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleModuleCompletion) {
                                onToggleModuleCompletion(
                                  activeCourseToStudy.id,
                                  modId,
                                  mod.title,
                                  syllabusList.length
                                );
                              } else {
                                const fallbackPct = Math.round(((i + 1) / syllabusList.length) * 100);
                                onUpdateProgress(activeCourseToStudy.id, fallbackPct);
                              }
                            }}
                            className={`min-h-[40px] px-3 py-1.5 text-[10px] font-mono-numbers font-bold border uppercase shrink-0 transition-colors ${
                              isModDone
                                ? 'border-emerald-400 bg-emerald-500 text-black'
                                : 'border-zinc-700 hover:border-white text-zinc-300 hover:text-white'
                            }`}
                          >
                            {isModDone ? 'Completed ✓' : 'Mark Done'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Official Receipt Modal */}
      {viewingReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Official Tax Receipt"
          onClick={() => setViewingReceipt(null)}
        >
          <div
            className="bg-white text-black border-4 border-black p-6 sm:p-8 max-w-lg w-full shadow-[12px_12px_0px_0px_#000000] relative font-mono-numbers"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setViewingReceipt(null)}
              aria-label="Close receipt modal"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center absolute top-3 right-3 border-2 border-black hover:bg-black hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-4 border-b-2 border-black">
              <div className="font-heading font-black text-lg uppercase tracking-tight">
                TECHIE TEACHER'S TRIBE TRUST
              </div>
              <div className="text-[10px] text-zinc-600 mt-0.5">
                OFFICIAL TAX INVOICE &amp; ACADEMIC RECEIPT
              </div>
            </div>

            <div className="py-4 space-y-2 text-xs border-b border-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-600">INVOICE NO:</span>
                <span className="font-bold">{viewingReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">DATE:</span>
                <span>{viewingReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">TRANSACTION ID:</span>
                <span className="font-bold">{viewingReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">ISSUED TO:</span>
                <span>{viewingReceipt.studentEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">PAYMENT VIA:</span>
                <span>RAZORPAY ({viewingReceipt.paymentMethod})</span>
              </div>
            </div>

            <div className="py-4 border-b-2 border-black">
              <div className="text-[11px] font-bold uppercase mb-2">PURCHASED LINE ITEMS:</div>
              {viewingReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs py-1">
                  <span>{item.title}</span>
                  <span className="font-bold">₹{item.price}</span>
                </div>
              ))}
            </div>

            <div className="py-4 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>₹{viewingReceipt.subtotal}</span>
              </div>
              {viewingReceipt.discount > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>PROMO DISCOUNT:</span>
                  <span>-₹{viewingReceipt.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-2 border-t border-black">
                <span>TOTAL PAID:</span>
                <span>₹{viewingReceipt.total}</span>
              </div>
            </div>

            <div className="text-[10px] text-zinc-600 text-center pt-2">
              All courses grant immediate digital lifetime access.
            </div>

            <div className="mt-4 pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  const fileName = downloadOrderReceipt(viewingReceipt, currentUser.name);
                  notifyLocal(`Downloaded ${fileName}`, 'success');
                }}
                className="flex-1 min-h-[44px] py-2 bg-white text-black border-2 border-black hover:bg-zinc-100 text-xs font-black uppercase flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 min-h-[44px] py-2 bg-black text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 hover:bg-zinc-900"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile & Target SGPA Modal */}
      {isProfileModalOpen && (
        <StudentProfileModal
          isOpen={isProfileModalOpen}
          user={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onSaveProfile={async (patch) => {
            if (onUpdateProfileAndGoals) {
              await onUpdateProfileAndGoals(patch);
            }
            notifyLocal('Profile & Target SGPA saved to your account.', 'success');
          }}
        />
      )}

      {/* Live Classroom Modal */}
      <LiveClassroomModal
        session={activeLiveSession}
        onClose={() => setActiveLiveSession(null)}
        onCheckInHours={(hrs, sessionTitle) => {
          adjustDayHours(todayDayIdx, hrs);
          notifyLocal(`Checked in to "${sessionTitle}" (+${hrs}h logged)!`, 'success');
        }}
      />
    </div>
  );
};
