import React, { useState } from 'react';
import { BrandLogo } from '../components/BrandLogo';
import {
  Course,
  User,
  DailyNewsItem,
  QuerySubmission,
  TeacherAccessRequest,
  VerifiedTeacherProfile,
  LiveSession,
  QuickLearningItem,
  ContentStatus
} from '../data/db';
import { SiteContent } from '../data/siteContent';
import { AdminCMSManager } from '../components/AdminCMSManager';
import { NavPage } from '../components/Navbar';
import {
  TeacherProfileModal,
  TeacherProfileFormData
} from '../components/TeacherProfileModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { LiveSessionFormModal } from '../components/LiveSessionFormModal';
import { QuickLearningFormModal } from '../components/QuickLearningFormModal';
import { CoursePreviewModal } from '../components/CoursePreviewModal';
import { AdminCoursesManager } from '../components/admin/AdminCoursesManager';
import { AdminQuickLearningManager } from '../components/admin/AdminQuickLearningManager';
import { AdminUnifiedStatusView } from '../components/admin/AdminUnifiedStatusView';
import { AdminMediaLibrary } from '../components/admin/AdminMediaLibrary';
import {
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Newspaper,
  LayoutTemplate,
  MessageSquare,
  Phone,
  Mail,
  KeyRound,
  Lock,
  Search,
  ExternalLink,
  UserCheck,
  UserX,
  GraduationCap,
  Building2,
  BookOpen,
  Check,
  XCircle,
  Award,
  Users,
  Cloud,
  RefreshCw,
  Loader2,
  Radio,
  Star,
  Zap,
  Sliders,
  Save,
  RotateCcw
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { BOOTSTRAPPED_ADMIN_EMAIL, formatFirebaseAuthError } from '../lib/firebase';
import {
  getAllTeachersRatingList,
  getAllCoursesRatingList,
  getAllQuickLearningRatingList,
  normalizeRatingKey,
  QUICK_LEARNING_MODULES
} from '../lib/ratings';

interface AdminPanelPageProps {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isFirebaseAdmin: boolean;
  onFirebaseGoogleSignIn: () => Promise<void>;
  onSyncCatalogToCloud: () => Promise<{
    coursesCount: number;
    teachersCount: number;
    newsCount?: number;
    liveSessionsCount?: number;
    reviewsCount?: number;
  }>;
  onLoginAdmin: (user: User) => void;
  onLogout: () => void;
  onNavigate: (page: NavPage) => void;
  // Teacher email verification, requests & verified profiles
  teacherRequests: TeacherAccessRequest[];
  verifiedTeacherEmails: string[];
  teacherProfiles: VerifiedTeacherProfile[];
  onApproveTeacherRequest: (
    requestId: string,
    profileOverrides?: TeacherProfileFormData
  ) => void;
  onRejectTeacherRequest: (requestId: string) => void;
  onRevokeTeacherEmail: (email: string) => void;
  onDeleteTeacherRequest: (requestId: string) => void;
  onAddVerifiedTeacherEmail: (data: {
    email: string;
    name: string;
    college: string;
    department: string;
    qualification?: string;
    intro?: string;
    photoUrl?: string;
    isVisible?: boolean;
  }) => { ok: boolean; message: string };
  onSaveTeacherProfile: (profileData: TeacherProfileFormData) => void;
  onToggleTeacherProfileVisibility: (email: string) => void;
  // Courses
  courses: Course[];
  onOpenCreateCourse: () => void;
  onOpenEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onToggleApproval: (courseId: string) => void;
  // News
  newsList: DailyNewsItem[];
  onDeleteNews: (newsId: string) => void;
  onOpenCreateNews: () => void;
  onOpenEditNews: (news: DailyNewsItem) => void;
  // Live Sessions
  liveSessions?: LiveSession[];
  onSaveLiveSession?: (session: LiveSession) => Promise<void> | void;
  onDeleteLiveSession?: (sessionId: string) => void;
  // Site Content CMS
  siteContent: SiteContent;
  onSaveSiteContent: (newContent: SiteContent) => void;
  onResetSiteContent: () => void;
  // Queries
  queries: QuerySubmission[];
  onUpdateQueryStatus: (queryId: string, status: 'Received' | 'In Review' | 'Answered') => void;
  onDeleteQuery: (queryId: string) => void;
  // Quick Learning CMS
  quickLearningItems?: QuickLearningItem[];
  onSaveQuickLearning?: (item: QuickLearningItem) => Promise<void> | void;
  onDeleteQuickLearning?: (itemId: string) => Promise<void> | void;
  // Duplication & Status Management
  onDuplicateCourse?: (course: Course) => void;
  onDuplicateQuickLearning?: (item: QuickLearningItem) => void;
  onDuplicateTeacherProfile?: (profile: VerifiedTeacherProfile) => void;
  onUpdateCourseStatus?: (courseId: string, status: ContentStatus) => void;
  onUpdateQuickLearningStatus?: (itemId: string, status: ContentStatus) => void;
  onUpdateTeacherProfileStatus?: (email: string, status: ContentStatus) => void;
  onNotify?: (msg: string, variant?: 'success' | 'error' | 'info') => void;
}

export const AdminPanelPage: React.FC<AdminPanelPageProps> = ({
  currentUser,
  firebaseUser,
  isFirebaseAdmin,
  onFirebaseGoogleSignIn,
  onSyncCatalogToCloud,
  onLoginAdmin,
  onLogout,
  onNavigate,
  teacherRequests,
  verifiedTeacherEmails,
  teacherProfiles,
  onApproveTeacherRequest,
  onRejectTeacherRequest,
  onRevokeTeacherEmail,
  onDeleteTeacherRequest,
  onAddVerifiedTeacherEmail,
  onSaveTeacherProfile,
  onToggleTeacherProfileVisibility,
  courses,
  onOpenCreateCourse,
  onOpenEditCourse,
  onDeleteCourse,
  onToggleApproval,
  newsList,
  onDeleteNews,
  onOpenCreateNews,
  onOpenEditNews,
  liveSessions = [],
  onSaveLiveSession,
  onDeleteLiveSession,
  siteContent,
  onSaveSiteContent,
  onResetSiteContent,
  queries,
  onUpdateQueryStatus,
  onDeleteQuery,
  quickLearningItems = [],
  onSaveQuickLearning,
  onDeleteQuickLearning,
  onDuplicateCourse,
  onDuplicateQuickLearning,
  onDuplicateTeacherProfile,
  onUpdateCourseStatus,
  onUpdateQuickLearningStatus,
  onUpdateTeacherProfileStatus,
  onNotify
}) => {
  const ADMIN_PASSKEY = 'ajaywedsaditi$#&1234';
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  // Active tab: organized into Courses, Quick Learning, Teachers, Drafts, Published, Archived, Media Library
  const [activeTab, setActiveTab] = useState<
    | 'courses'
    | 'quick-learning'
    | 'teachers'
    | 'drafts'
    | 'published'
    | 'archived'
    | 'media-library'
    | 'teacher-requests'
    | 'teacher-profiles'
    | 'queries'
    | 'ratings'
    | 'cms'
    | 'live-sessions'
    | 'news'
  >('courses');

  // Preview Course Modal State
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  // Quick Learning Form Modal State
  const [qlModalState, setQlModalState] = useState<{
    isOpen: boolean;
    item: QuickLearningItem | null;
  }>({
    isOpen: false,
    item: null
  });

  // Rating Control State
  const [ratingSubTab, setRatingSubTab] = useState<'teachers' | 'courses' | 'quickLearning'>('teachers');
  const [ratingSearch, setRatingSearch] = useState('');
  const [editingTeacherRatings, setEditingTeacherRatings] = useState<Record<string, number>>({});
  const [editingCourseRatings, setEditingCourseRatings] = useState<Record<string, number>>({});
  const [editingQlRatings, setEditingQlRatings] = useState<Record<string, number>>({});

  // Teacher requests filters & direct pre-verify form
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState<'All' | 'PENDING' | 'APPROVED' | 'REJECTED'>('All');
  const [directEmail, setDirectEmail] = useState('');
  const [directName, setDirectName] = useState('');
  const [directCollege, setDirectCollege] = useState('');
  const [directDepartment, setDirectDepartment] = useState('Computer Science & IT');

  // Verified teacher profiles search & filter
  const [profileSearch, setProfileSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState<'All' | 'LIVE' | 'HIDDEN' | 'REVOKED'>('All');

  // Profile Modal state (used both when approving an email AND editing a profile)
  const [profileModalState, setProfileModalState] = useState<{
    isOpen: boolean;
    mode: 'approve' | 'edit';
    actionType: 'approve-request' | 'direct-verify' | 'edit-profile';
    requestId?: string;
    directMeta?: { college: string; department: string };
    initialData: TeacherProfileFormData | null;
  }>({
    isOpen: false,
    mode: 'edit',
    actionType: 'edit-profile',
    initialData: null
  });

  // Live Session Modal & Confirm Modal state
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

  // Queries search & filter
  const [querySearch, setQuerySearch] = useState('');
  const [queryStatusFilter, setQueryStatusFilter] = useState<'All' | 'Received' | 'In Review' | 'Answered'>('All');

  // Notice banner & Cloud sync state
  const [portalNotice, setPortalNotice] = useState<string | null>(null);
  const [isCloudConnecting, setIsCloudConnecting] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const showNotice = (msg: string, variant: 'success' | 'error' | 'info' = 'success') => {
    if (onNotify) {
      onNotify(msg, variant);
    } else {
      setPortalNotice(msg);
      setTimeout(() => setPortalNotice(null), 3500);
    }
  };

  const isAdmin = currentUser?.role === 'admin' || isFirebaseAdmin;

  if (!isAdmin) {
    const handlePasskeySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (passkeyInput.trim() === ADMIN_PASSKEY) {
        setPasskeyError(null);
        const adminUser: User = {
          id: 'usr_trust_admin',
          name: 'Trust Directorate (Super Admin)',
          email: 'admin@techieteachertribe.org',
          role: 'admin',
          department: 'Central Administration & Governance'
        };
        onLoginAdmin(adminUser);
      } else {
        setPasskeyError('Invalid Admin Passkey. Access Denied. Please enter the correct key.');
      }
    };

    return (
      <div className="w-full min-h-[90vh] bg-black text-white flex flex-col justify-center items-center p-4 sm:p-8 select-none">
        <div className="max-w-md w-full border-4 border-white p-8 sm:p-10 bg-zinc-950 shadow-[12px_12px_0px_0px_#ffffff]">
          <div className="flex flex-col items-center text-center mb-6">
            <BrandLogo variant="navbar" />
            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-black text-[10px] uppercase font-mono-numbers font-black tracking-widest mb-2 border border-black">
                <Lock className="w-3 h-3" />
                <span>RESTRICTED ACCESS · TRUST ADMIN CONSOLE</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
                Admin Passkey Required
              </h2>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Approve teacher email verification requests, manage student SOS queries, edit site CMS content, and oversee university courses.
              </p>
            </div>
          </div>

          {passkeyError && (
            <div className="mb-5 p-3.5 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-mono-numbers flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{passkeyError}</span>
            </div>
          )}

          {/* Direct Google Directorate Sign-In */}
          <div className="mb-6">
            <button
              type="button"
              disabled={isCloudConnecting}
              onClick={async () => {
                setIsCloudConnecting(true);
                try {
                  await onFirebaseGoogleSignIn();
                  showNotice('Google account authenticated. Unlocking Cloud Admin...');
                } catch (err) {
                  showNotice(formatFirebaseAuthError(err).message, 'error');
                } finally {
                  setIsCloudConnecting(false);
                }
              }}
              className="w-full py-3.5 bg-white text-black font-black uppercase tracking-wider text-xs sm:text-sm hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isCloudConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Cloud className="w-4 h-4 text-emerald-600" />
              )}
              <span>Sign In with Google (Trust Directorate)</span>
            </button>
            <p className="text-[10px] text-zinc-400 font-mono-numbers text-center mt-2">
              Instant Cloud authentication for authorized admins (trivedianiruddh667@gmail.com / nrddhtrivedi@gmail.com)
            </p>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono-numbers">
              Or Use Directorate Passkey
            </span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form onSubmit={handlePasskeySubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1 flex items-center justify-between">
                <span>Admin Passkey</span>
                <span className="text-[10px] text-zinc-500 font-mono-numbers">CONFIDENTIAL</span>
              </label>
              <div className="relative">
                <input
                  type={showPasskey ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passkeyInput}
                  onChange={(e) => {
                    setPasskeyInput(e.target.value);
                    if (passkeyError) setPasskeyError(null);
                  }}
                  placeholder="Enter admin passkey..."
                  className="w-full bg-black border-2 border-zinc-700 px-4 py-3 text-sm text-white focus:outline-none focus:border-white font-mono-numbers tracking-wider pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                  title={showPasskey ? 'Hide passkey' : 'Show passkey'}
                >
                  {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-white text-black font-black uppercase tracking-wider text-xs sm:text-sm hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <p className="text-[11px] text-zinc-500 font-mono-numbers">
              Direct access reserved for Techie Teacher's Tribe Trust Admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pendingRequestsCount = teacherRequests.filter((r) => r.status === 'PENDING').length;
  const verifiedSet = new Set(verifiedTeacherEmails.map((em) => em.trim().toLowerCase()));
  const liveProfilesCount = teacherProfiles.filter(
    (p) => verifiedSet.has(p.email.trim().toLowerCase()) && p.isVisible
  ).length;

  const openApproveModalForRequest = (req: TeacherAccessRequest) => {
    const emailNorm = req.email.trim().toLowerCase();
    const existing = teacherProfiles.find((p) => p.email.trim().toLowerCase() === emailNorm);
    const qualParts = [req.department, req.college, req.experienceYears].filter(Boolean);

    setProfileModalState({
      isOpen: true,
      mode: 'approve',
      actionType: 'approve-request',
      requestId: req.id,
      initialData: {
        email: emailNorm,
        name: existing?.name || req.name || 'Verified Faculty',
        qualification:
          existing?.qualification || qualParts.join(' · ') || 'Verified University Educator',
        intro:
          existing?.intro ||
          req.notes ||
          (req.subjectsTaught
            ? `University educator specializing in ${req.subjectsTaught}.`
            : `Verified faculty member at ${req.college || 'Partner University'}.`),
        photoUrl: existing?.photoUrl || '',
        isVisible: true
      }
    });
  };

  const openEditModalForProfile = (email: string) => {
    const emailNorm = email.trim().toLowerCase();
    const existing = teacherProfiles.find((p) => p.email.trim().toLowerCase() === emailNorm);
    const matchingReq = teacherRequests.find((r) => r.email.trim().toLowerCase() === emailNorm);
    const qualParts = matchingReq
      ? [matchingReq.department, matchingReq.college, matchingReq.experienceYears].filter(Boolean)
      : [];

    setProfileModalState({
      isOpen: true,
      mode: 'edit',
      actionType: 'edit-profile',
      initialData: {
        email: emailNorm,
        name: existing?.name || matchingReq?.name || 'Verified Faculty',
        qualification:
          existing?.qualification || qualParts.join(' · ') || 'Verified University Educator',
        intro:
          existing?.intro ||
          matchingReq?.notes ||
          'Verified faculty member at Techie Teacher’s Tribe Trust.',
        photoUrl: existing?.photoUrl || '',
        isVisible: existing ? existing.isVisible : true
      }
    });
  };

  const handleDirectVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailNorm = directEmail.trim().toLowerCase();
    if (!emailNorm || !emailNorm.includes('@')) {
      showNotice('Please enter a valid teacher email address.');
      return;
    }

    const existing = teacherProfiles.find((p) => p.email.trim().toLowerCase() === emailNorm);
    const collegeText = directCollege.trim() || 'Partner University';
    const deptText = directDepartment.trim() || 'Engineering Faculty';

    setProfileModalState({
      isOpen: true,
      mode: 'approve',
      actionType: 'direct-verify',
      directMeta: { college: collegeText, department: deptText },
      initialData: {
        email: emailNorm,
        name: directName.trim() || existing?.name || 'Verified Faculty',
        qualification: existing?.qualification || `${deptText} · ${collegeText}`,
        intro:
          existing?.intro ||
          `Verified educator in ${deptText} (${collegeText}), mentoring university students across core engineering subjects.`,
        photoUrl: existing?.photoUrl || '',
        isVisible: true
      }
    });
  };

  const handleProfileModalSubmit = (data: TeacherProfileFormData) => {
    if (profileModalState.actionType === 'approve-request' && profileModalState.requestId) {
      onApproveTeacherRequest(profileModalState.requestId, data);
      showNotice(`${data.email} approved & teacher profile published!`);
    } else if (profileModalState.actionType === 'direct-verify') {
      const res = onAddVerifiedTeacherEmail({
        email: data.email,
        name: data.name,
        college: profileModalState.directMeta?.college || 'Partner University',
        department: profileModalState.directMeta?.department || 'Engineering Faculty',
        qualification: data.qualification,
        intro: data.intro,
        photoUrl: data.photoUrl,
        isVisible: data.isVisible
      });
      showNotice(res.message);
      if (res.ok) {
        setDirectEmail('');
        setDirectName('');
        setDirectCollege('');
      }
    } else {
      onSaveTeacherProfile(data);
      showNotice(`Updated teacher profile for ${data.name}`);
    }
  };

  return (
    <div className="w-full bg-black text-white select-none min-h-screen">
      {/* Header bar */}
      <section className="border-b-2 border-white py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-400 uppercase">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>TRUST EXECUTIVE GOVERNANCE · SUPER ADMIN</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase mt-2">
              Admin & Executive Suite
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Logged in as{' '}
              <strong className="text-white">
                {currentUser?.name || firebaseUser?.displayName || 'Trust Directorate (Super Admin)'}
              </strong>{' '}
              ({currentUser?.email || firebaseUser?.email || 'admin@techieteachertribe.org'})
              <span className="ml-2 px-2 py-0.5 bg-white text-black font-black font-mono-numbers text-[10px] uppercase">
                Root Admin
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('teacher-portal')}
              className="px-4 py-2.5 bg-zinc-900 border-2 border-white text-white hover:bg-white hover:text-black text-xs font-mono-numbers font-bold uppercase flex items-center gap-1.5 transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Open Teachers Portal</span>
            </button>

            {activeTab === 'courses' && (
              <button
                onClick={onOpenCreateCourse}
                className="px-5 py-2.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Course</span>
              </button>
            )}

            {activeTab === 'news' && (
              <button
                onClick={onOpenCreateNews}
                className="px-5 py-2.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
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
                <span>Schedule Live Class</span>
              </button>
            )}

            {activeTab === 'cms' && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="min-h-[44px] px-4 py-2.5 bg-zinc-900 border-2 border-zinc-700 hover:border-white text-white text-xs font-mono-numbers uppercase flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Live Site</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="min-h-[44px] px-4 py-2 border-2 border-zinc-700 bg-zinc-900 text-zinc-300 text-xs font-bold uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* Cloud Firestore Admin Sync Bar */}
        <div className="max-w-7xl mx-auto mt-6 p-4 bg-black border-2 border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3 text-xs font-mono-numbers">
            <Cloud className={`w-4 h-4 shrink-0 mt-0.5 md:mt-0 ${isFirebaseAdmin ? 'text-emerald-400' : 'text-amber-400'}`} />
            {isFirebaseAdmin ? (
              <div>
                <span className="text-emerald-400 font-black uppercase">CLOUD FIRESTORE ADMIN SYNC: ACTIVE</span>
                <span className="text-zinc-400 ml-2">
                  Signed in as <strong className="text-white">{firebaseUser?.email}</strong> — all approvals, profiles, courses, news, live classes &amp; CMS sync live to Firestore.
                </span>
              </div>
            ) : (
              <div>
                <span className="text-amber-300 font-black uppercase">PASSKEY LOCAL MODE</span>
                <span className="text-zinc-400 ml-2">
                  {firebaseUser?.email
                    ? `Signed in as ${firebaseUser.email} (not on Authorized Admin Allowlist).`
                    : `Sign in with Google as Authorized Admin (trivedianiruddh667@gmail.com / nrddhtrivedi@gmail.com) to persist Admin changes directly to Cloud Firestore.`}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isFirebaseAdmin ? (
              <button
                type="button"
                disabled={isCloudSyncing}
                onClick={async () => {
                  setIsCloudSyncing(true);
                  try {
                    const res = await onSyncCatalogToCloud();
                    showNotice(
                      `Synced ${res.coursesCount} courses, ${res.teachersCount} teachers, ${res.newsCount ?? newsList.length} news, ${res.liveSessionsCount ?? liveSessions.length} live sessions & CMS to Firestore!`
                    );
                  } catch (err) {
                    showNotice(formatFirebaseAuthError(err).message, 'error');
                  } finally {
                    setIsCloudSyncing(false);
                  }
                }}
                className="min-h-[44px] px-3.5 py-2 border-2 border-emerald-400 bg-emerald-500 text-black font-mono-numbers text-xs font-black uppercase hover:bg-emerald-400 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isCloudSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>{isCloudSyncing ? 'Syncing...' : 'Sync All Seed Data to Cloud'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isCloudConnecting}
                onClick={async () => {
                  setIsCloudConnecting(true);
                  try {
                    await onFirebaseGoogleSignIn();
                    showNotice('Google account connected! Checking Cloud Admin authorization...');
                  } catch (err) {
                    showNotice(formatFirebaseAuthError(err).message, 'error');
                  } finally {
                    setIsCloudConnecting(false);
                  }
                }}
                className="min-h-[44px] px-3.5 py-2 border-2 border-white bg-white text-black font-mono-numbers text-xs font-black uppercase hover:bg-zinc-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isCloudConnecting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5" />
                )}
                <span>{isCloudConnecting ? 'Connecting...' : 'Connect Cloud Admin (Google)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Admin Tab Switcher */}
        <div className="max-w-7xl mx-auto mt-8 flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-6">
          <button
            type="button"
            onClick={() => setActiveTab('teacher-requests')}
            className={`min-h-[44px] px-4 py-2 text-xs font-mono-numbers font-black uppercase tracking-wider transition-colors border-2 flex items-center gap-2 ${
              activeTab === 'teacher-requests'
                ? 'border-white bg-white text-black shadow-[3px_3px_0px_0px_#ffffff]'
                : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Teacher Email Requests</span>
            {pendingRequestsCount > 0 && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === 'teacher-requests'
                    ? 'bg-black text-white'
                    : 'bg-amber-400 text-black'
                }`}
              >
                {pendingRequestsCount} PENDING
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teacher-profiles')}
            className={`min-h-[44px] px-4 py-2 text-xs font-mono-numbers font-black uppercase tracking-wider transition-colors border-2 flex items-center gap-2 ${
              activeTab === 'teacher-profiles'
                ? 'border-white bg-white text-black shadow-[3px_3px_0px_0px_#ffffff]'
                : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Verified Teacher Profiles ({liveProfilesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queries')}
            className={`min-h-[44px] px-4 py-2 text-xs font-mono-numbers font-black uppercase tracking-wider transition-colors border-2 flex items-center gap-2 ${
              activeTab === 'queries'
                ? 'border-white bg-white text-black shadow-[3px_3px_0px_0px_#ffffff]'
                : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Student Queries &amp; SOS</span>
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold ${
                activeTab === 'queries' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {queries.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ratings')}
            className={`min-h-[44px] px-4 py-2 text-xs font-mono-numbers font-black uppercase tracking-wider transition-colors border-2 flex items-center gap-2 ${
              activeTab === 'ratings'
                ? 'border-white bg-white text-black shadow-[3px_3px_0px_0px_#ffffff]'
                : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Rating System &amp; Control</span>
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold ${
                activeTab === 'ratings' ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {queries.filter((q) => typeof q.rating === 'number').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cms')}
            className={`min-h-[44px] px-4 py-2 text-xs font-mono-numbers font-black uppercase tracking-wider transition-colors border-2 flex items-center gap-2 ${
              activeTab === 'cms'
                ? 'border-white bg-white text-black shadow-[3px_3px_0px_0px_#ffffff]'
                : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Pages &amp; Site Content (CMS)</span>
          </button>

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
            <span>Courses &amp; Notes ({courses.length})</span>
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
            <span>Live Doubt Classes ({liveSessions.length})</span>
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
            <span>Daily News ({newsList.length})</span>
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* TAB 0: TEACHER EMAIL REQUESTS & VERIFICATION */}
        {activeTab === 'teacher-requests' && (
          <div className="space-y-8">
            {/* Header Info Banner */}
            <div className="p-6 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>TEACHER PORTAL ACCESS GATEKEEPER</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
                  Teacher Email Verification & Approval Queue
                </h2>
                <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                  The Teachers Portal is hidden from all users by default. Review incoming faculty requests below and click <strong>Approve Email</strong> to verify an email address and grant Teachers Portal visibility & access.
                </p>
              </div>
              <div className="shrink-0 p-4 border-2 border-zinc-800 bg-black text-center font-mono-numbers">
                <div className="text-[10px] text-zinc-400 uppercase">VERIFIED TEACHER EMAILS</div>
                <div className="text-3xl font-black text-white mt-0.5">
                  {verifiedTeacherEmails.length}
                </div>
              </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-black border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono-numbers">
                  TOTAL REQUESTS
                </div>
                <div className="text-3xl font-black font-mono-numbers mt-1 text-white">
                  {teacherRequests.length}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
                  ALL EMAIL APPLICATIONS
                </div>
              </div>

              <div className="p-5 bg-black border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                <div className="text-[11px] uppercase tracking-wider text-amber-400 font-mono-numbers">
                  PENDING APPROVAL
                </div>
                <div className="text-3xl font-black font-mono-numbers mt-1 text-white">
                  {teacherRequests.filter((r) => r.status === 'PENDING').length}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
                  AWAITING ADMIN REVIEW
                </div>
              </div>

              <div className="p-5 bg-black border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-mono-numbers">
                  APPROVED / VERIFIED
                </div>
                <div className="text-3xl font-black font-mono-numbers mt-1 text-white">
                  {verifiedTeacherEmails.length}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
                  ACTIVE TEACHER EMAILS
                </div>
              </div>

              <div className="p-5 bg-black border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                <div className="text-[11px] uppercase tracking-wider text-red-400 font-mono-numbers">
                  REJECTED / REVOKED
                </div>
                <div className="text-3xl font-black font-mono-numbers mt-1 text-white">
                  {teacherRequests.filter((r) => r.status === 'REJECTED').length}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
                  PORTAL ACCESS BLOCKED
                </div>
              </div>
            </div>

            {/* Quick Pre-Verify Any Email Directly */}
            <div className="p-6 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff]">
              <div className="mb-4">
                <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 font-bold">
                  DIRECT VERIFICATION · WHITELIST EMAIL
                </span>
                <h3 className="text-lg font-heading font-black uppercase mt-0.5">
                  Directly Verify & Grant Teacher Email Access
                </h3>
              </div>

              <form onSubmit={handleDirectVerifySubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Teacher Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={directEmail}
                    onChange={(e) => setDirectEmail(e.target.value)}
                    placeholder="professor@university.ac.in"
                    className="w-full bg-black border-2 border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Faculty Name
                  </label>
                  <input
                    type="text"
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    placeholder="Prof. Name"
                    className="w-full bg-black border-2 border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Department / College
                  </label>
                  <input
                    type="text"
                    value={directCollege}
                    onChange={(e) => setDirectCollege(e.target.value)}
                    placeholder="DTU / Computer Science"
                    className="w-full bg-black border-2 border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border-2 border-white flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Verify Email</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Active Verified Teacher Emails Registry */}
            <div className="p-6 bg-black border-2 border-zinc-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800 mb-4">
                <div>
                  <span className="text-[11px] font-mono-numbers uppercase tracking-widest text-zinc-400">
                    ACTIVE WHITELIST
                  </span>
                  <h3 className="text-lg font-heading font-black uppercase mt-0.5">
                    Currently Verified Teacher Emails ({verifiedTeacherEmails.length})
                  </h3>
                </div>
                <span className="text-[11px] font-mono-numbers text-zinc-400">
                  Only users signed in with these emails see the Teachers Portal
                </span>
              </div>

              {verifiedTeacherEmails.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono-numbers">
                  No verified teacher emails yet. Approve a request below or add an email above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {verifiedTeacherEmails.map((em) => (
                    <div
                      key={em}
                      className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-white text-xs font-mono-numbers"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-white font-bold">{em}</span>
                      <button
                        onClick={() => openEditModalForProfile(em)}
                        className="ml-1 text-zinc-400 hover:text-white transition-colors"
                        title={`Edit public profile for ${em}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          onRevokeTeacherEmail(em);
                          showNotice(`Revoked teacher access & hid public profile for ${em}`);
                        }}
                        className="text-zinc-400 hover:text-red-400 transition-colors"
                        title={`Revoke teacher access for ${em}`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter & Search Bar for Requests */}
            <div className="p-4 bg-zinc-950 border-2 border-white flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={reqSearch}
                  onChange={(e) => setReqSearch(e.target.value)}
                  placeholder="Search requests by name, email, college, department, or subjects..."
                  className="w-full bg-black border-2 border-zinc-700 pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-mono-numbers font-bold">
                {(['All', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setReqStatusFilter(st)}
                    className={`px-3 py-1.5 border uppercase transition-colors shrink-0 ${
                      reqStatusFilter === st
                        ? 'border-white bg-white text-black'
                        : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    {st === 'All'
                      ? `All (${teacherRequests.length})`
                      : `${st} (${teacherRequests.filter((r) => r.status === st).length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Teacher Requests Cards */}
            {(() => {
              const filtered = teacherRequests.filter((r) => {
                const matchesStatus = reqStatusFilter === 'All' || r.status === reqStatusFilter;
                const s = reqSearch.toLowerCase().trim();
                if (!s) return matchesStatus;
                const matchesSearch =
                  r.name.toLowerCase().includes(s) ||
                  r.email.toLowerCase().includes(s) ||
                  r.college.toLowerCase().includes(s) ||
                  r.department.toLowerCase().includes(s) ||
                  (r.subjectsTaught || '').toLowerCase().includes(s) ||
                  r.id.toLowerCase().includes(s);
                return matchesStatus && matchesSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-12 border-2 border-white bg-zinc-950 text-center shadow-[6px_6px_0px_0px_#ffffff]">
                    <GraduationCap className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-heading font-black uppercase text-white">
                      No Teacher Verification Requests Found
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                      Whenever an educator submits their email to request Teachers Portal access, it appears here for your approval.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((req) => {
                    const isVerified = verifiedTeacherEmails.includes(req.email.trim().toLowerCase());
                    return (
                      <div
                        key={req.id}
                        className="p-6 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] transition-transform hover:-translate-y-0.5"
                      >
                        {/* Top Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-heading font-black text-lg text-white">
                              {req.name}
                            </span>
                            <span className="px-2 py-0.5 bg-black border border-zinc-700 text-[10px] font-mono-numbers font-bold text-zinc-300 uppercase">
                              {req.id}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono-numbers flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              <span>Requested: {req.requestedAt}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-mono-numbers font-black uppercase border ${
                                req.status === 'APPROVED' && isVerified
                                  ? 'bg-emerald-500 text-black border-emerald-400'
                                  : req.status === 'PENDING'
                                  ? 'bg-amber-400 text-black border-amber-300'
                                  : 'bg-red-950 text-red-200 border-red-500'
                              }`}
                            >
                              {req.status === 'APPROVED' && isVerified
                                ? 'VERIFIED TEACHER EMAIL'
                                : req.status}
                            </span>
                          </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono-numbers border-b border-zinc-800">
                          <div className="flex items-center gap-2 text-white font-bold">
                            <Mail className="w-3.5 h-3.5 text-white shrink-0" />
                            <span className="truncate">{req.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{req.college}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{req.department}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <BookOpen className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">
                              {req.subjectsTaught || 'General Engineering'} ({req.experienceYears || 'Faculty'})
                            </span>
                          </div>
                        </div>

                        {/* Notes & Approval Info */}
                        {(req.notes || req.approvedAt) && (
                          <div className="my-4 p-4 bg-black border border-zinc-800 space-y-2">
                            {req.notes && (
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono-numbers mb-1">
                                  CREDENTIALS / STATEMENT:
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                                  {req.notes}
                                </p>
                              </div>
                            )}
                            {req.approvedAt && req.status === 'APPROVED' && (
                              <div className="text-[11px] font-mono-numbers text-emerald-400 pt-1">
                                Approved on {req.approvedAt} by {req.approvedBy || 'Admin'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {(!isVerified || req.status !== 'APPROVED') && (
                              <button
                                onClick={() => openApproveModalForRequest(req)}
                                className="px-4 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5 border-2 border-white font-mono-numbers shadow-[3px_3px_0px_0px_#ffffff]"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve & Setup Profile</span>
                              </button>
                            )}

                            {isVerified && (
                              <button
                                onClick={() => openEditModalForProfile(req.email)}
                                className="px-4 py-2 bg-zinc-900 text-white font-bold uppercase text-xs hover:bg-white hover:text-black transition-colors flex items-center gap-1.5 border border-white font-mono-numbers"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Public Profile</span>
                              </button>
                            )}

                            {req.status === 'PENDING' && (
                              <button
                                onClick={() => {
                                  onRejectTeacherRequest(req.id);
                                  showNotice(`Rejected request for ${req.email}.`);
                                }}
                                className="px-4 py-2 bg-black text-red-300 font-bold uppercase text-xs hover:border-red-400 hover:text-red-200 transition-colors flex items-center gap-1.5 border border-zinc-700 font-mono-numbers"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Reject Request</span>
                              </button>
                            )}

                            {isVerified && (
                              <button
                                onClick={() => {
                                  onRevokeTeacherEmail(req.email);
                                  showNotice(`Revoked teacher access & hid public profile for ${req.email}.`);
                                }}
                                className="px-4 py-2 bg-black text-amber-300 font-bold uppercase text-xs hover:border-amber-400 transition-colors flex items-center gap-1.5 border border-zinc-700 font-mono-numbers"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Revoke Teacher Access</span>
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setConfirmState({
                                isOpen: true,
                                title: 'Delete Teacher Request',
                                message: `Remove teacher verification request ${req.id} (${req.email})?`,
                                onConfirm: () => {
                                  onDeleteTeacherRequest(req.id);
                                  showNotice(`Deleted request ${req.id}`);
                                  setConfirmState((prev) => ({ ...prev, isOpen: false }));
                                }
                              })
                            }
                            aria-label={`Delete request ${req.id}`}
                            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center p-2 border border-zinc-800 hover:border-red-500 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete request record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 0.5: VERIFIED TEACHER PROFILES MANAGER */}
        {activeTab === 'teacher-profiles' && (
          <div className="space-y-8">
            <div className="p-6 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers flex items-center gap-2">
                  <Award className="w-4 h-4 text-white" />
                  <span>PUBLIC TEACHERS DIRECTORY GOVERNANCE</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
                  Verified Teacher Profiles (Photo, Name, Qualification & Intro)
                </h2>
                <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                  Profiles are automatically created whenever an email is approved. Edit details anytime, toggle visibility, or revoke access (which automatically hides the teacher from the public Teachers page).
                </p>
              </div>
              <button
                onClick={() => onNavigate('teachers')}
                className="px-5 py-3 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors border-2 border-white shadow-[3px_3px_0px_0px_#ffffff] shrink-0 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Public Teachers Page</span>
              </button>
            </div>

            {/* Profile KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-black border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-mono-numbers">
                  LIVE PUBLIC PROFILES
                </div>
                <div className="text-3xl font-black font-mono-numbers mt-1 text-white tabular-nums">
                  {
                    teacherProfiles.filter(
                      (p) => verifiedSet.has(p.email.trim().toLowerCase()) && p.isVisible
                    ).length
                  }
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
                  VISIBLE TO ALL VISITORS ON TEACHERS PAGE
                </div>
              </div>

              <div className="p-5 bg-black border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                <div className="text-[11px] uppercase tracking-wider text-amber-400 font-mono-numbers">
                  HIDDEN BY TOGGLE
                </div>
                <div className="text-3xl font-black font-mono-numbers mt-1 text-white tabular-nums">
                  {
                    teacherProfiles.filter(
                      (p) => verifiedSet.has(p.email.trim().toLowerCase()) && !p.isVisible
                    ).length
                  }
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
                  VERIFIED EMAIL · MANUALLY HIDDEN
                </div>
              </div>

              <div className="p-5 bg-black border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                <div className="text-[11px] uppercase tracking-wider text-red-400 font-mono-numbers">
                  REVOKED / AUTO-HIDDEN
                </div>
                <div className="text-3xl font-black font-mono-numbers mt-1 text-white tabular-nums">
                  {
                    teacherProfiles.filter(
                      (p) => !verifiedSet.has(p.email.trim().toLowerCase())
                    ).length
                  }
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono-numbers">
                  SAVED ARCHIVE · HIDDEN UNTIL RE-VERIFIED
                </div>
              </div>
            </div>

            {/* Profile Search & Status Filter */}
            <div className="p-4 bg-zinc-950 border-2 border-white flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                  placeholder="Search profiles by name, email, qualification, or intro..."
                  className="w-full bg-black border-2 border-zinc-700 pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-mono-numbers font-bold">
                {(
                  [
                    { id: 'All', label: `All (${teacherProfiles.length})` },
                    { id: 'LIVE', label: 'Live Public' },
                    { id: 'HIDDEN', label: 'Hidden' },
                    { id: 'REVOKED', label: 'Revoked' }
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setProfileFilter(f.id)}
                    className={`px-3 py-1.5 border uppercase transition-colors shrink-0 ${
                      profileFilter === f.id
                        ? 'border-white bg-white text-black'
                        : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Teacher Profiles List */}
            {(() => {
              const filteredProfiles = teacherProfiles.filter((profile) => {
                const isVerified = verifiedSet.has(profile.email.trim().toLowerCase());
                const matchesFilter =
                  profileFilter === 'All' ||
                  (profileFilter === 'LIVE' && isVerified && profile.isVisible) ||
                  (profileFilter === 'HIDDEN' && isVerified && !profile.isVisible) ||
                  (profileFilter === 'REVOKED' && !isVerified);

                const s = profileSearch.trim().toLowerCase();
                if (!s) return matchesFilter;

                const matchesSearch =
                  profile.name.toLowerCase().includes(s) ||
                  profile.email.toLowerCase().includes(s) ||
                  profile.qualification.toLowerCase().includes(s) ||
                  profile.intro.toLowerCase().includes(s);

                return matchesFilter && matchesSearch;
              });

              if (filteredProfiles.length === 0) {
                return (
                  <div className="p-12 border-2 border-white bg-zinc-950 text-center shadow-[6px_6px_0px_0px_#ffffff]">
                    <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-heading font-black uppercase text-white">
                      No Teacher Profiles Found
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                      Approve any teacher email request or verify an email directly in the Teacher Email Requests tab to auto-create a profile.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredProfiles.map((profile) => {
                    const emailNorm = profile.email.trim().toLowerCase();
                    const isVerified = verifiedSet.has(emailNorm);
                    const initials = (profile.name || profile.email)
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() || '')
                      .join('');

                    return (
                      <div
                        key={profile.id}
                        className="bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] flex flex-col justify-between"
                      >
                        <div className="p-6 space-y-4">
                          {/* Top Row: Thumbnail + Name/Email + Status */}
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="w-28 h-24 shrink-0 border-2 border-white bg-zinc-900 overflow-hidden flex items-center justify-center">
                              {profile.photoUrl ? (
                                <img
                                  src={profile.photoUrl}
                                  alt={profile.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover filter grayscale contrast-125"
                                />
                              ) : (
                                <span className="font-heading font-black text-xl text-white">
                                  {initials || 'TT'}
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-mono-numbers font-black uppercase border inline-flex items-center gap-1 ${
                                    !isVerified
                                      ? 'bg-red-950 text-red-200 border-red-500'
                                      : profile.isVisible
                                      ? 'bg-emerald-500 text-black border-emerald-400'
                                      : 'bg-amber-400 text-black border-amber-300'
                                  }`}
                                >
                                  {!isVerified ? (
                                    <>
                                      <ShieldAlert className="w-3 h-3" />
                                      <span>REVOKED · AUTO-HIDDEN</span>
                                    </>
                                  ) : profile.isVisible ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      <span>LIVE ON PUBLIC PAGE</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3 h-3" />
                                      <span>HIDDEN BY ADMIN</span>
                                    </>
                                  )}
                                </span>

                                <span className="text-[10px] font-mono-numbers text-zinc-500">
                                  {profile.id}
                                </span>
                              </div>

                              <h3 className="text-xl font-heading font-black uppercase text-white truncate">
                                {profile.name}
                              </h3>

                              <div className="flex items-center gap-1.5 text-xs font-mono-numbers text-emerald-400 font-bold truncate">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{profile.email}</span>
                              </div>
                            </div>
                          </div>

                          {/* Qualification & Intro */}
                          <div className="p-4 bg-black border border-zinc-800 space-y-2">
                            <div className="text-xs font-mono-numbers font-bold text-white flex items-start gap-2">
                              <Award className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                              <span>{profile.qualification}</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed">
                              {profile.intro}
                            </p>
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="p-4 bg-black border-t-2 border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => openEditModalForProfile(profile.email)}
                              className="px-3.5 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5 border border-white font-mono-numbers"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Profile</span>
                            </button>

                            {isVerified && (
                              <button
                                onClick={() => {
                                  onToggleTeacherProfileVisibility(profile.email);
                                  showNotice(
                                    profile.isVisible
                                      ? `Hid ${profile.name} from public Teachers page`
                                      : `Published ${profile.name} to public Teachers page`
                                  );
                                }}
                                className="px-3.5 py-2 bg-zinc-900 text-zinc-200 hover:text-white border border-zinc-700 hover:border-white text-xs font-mono-numbers font-bold uppercase flex items-center gap-1.5 transition-colors"
                              >
                                {profile.isVisible ? (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5" />
                                    <span>Hide Public</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Show Public</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {isVerified ? (
                            <button
                              onClick={() => {
                                onRevokeTeacherEmail(profile.email);
                                showNotice(
                                  `Revoked email & automatically hid ${profile.name} from public Teachers page.`
                                );
                              }}
                              className="px-3 py-2 bg-black text-red-300 hover:text-red-200 border border-zinc-800 hover:border-red-500 text-xs font-mono-numbers font-bold uppercase flex items-center gap-1.5 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Revoke Email</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setProfileModalState({
                                  isOpen: true,
                                  mode: 'approve',
                                  actionType: 'direct-verify',
                                  directMeta: {
                                    college: 'Re-verified Faculty',
                                    department: profile.qualification
                                  },
                                  initialData: {
                                    email: profile.email,
                                    name: profile.name,
                                    qualification: profile.qualification,
                                    intro: profile.intro,
                                    photoUrl: profile.photoUrl,
                                    isVisible: true
                                  }
                                });
                              }}
                              className="px-3 py-2 bg-emerald-500 text-black font-black uppercase text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1.5 font-mono-numbers"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Re-Verify & Publish</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 1: STUDENT QUERIES & SOS */}
        {activeTab === 'queries' && (
          <div className="space-y-8">
            <div className="p-6 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>RESTRICTED REPOSITORY · STUDENT SOS DESK</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
                  Student Contact Queries & Exam Inquiries
                </h2>
                <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                  Every query submitted through the website Contact form is logged here for authorized admin review.
                </p>
              </div>
              <button
                onClick={() => {
                  setQuerySearch('');
                  setQueryStatusFilter('All');
                  showNotice('Queries inbox refreshed.');
                }}
                className="px-3.5 py-2 border border-zinc-700 bg-black hover:border-white text-zinc-300 hover:text-white text-xs font-mono-numbers font-bold uppercase transition-colors"
              >
                Refresh Inbox
              </button>
            </div>

            <div className="p-4 bg-zinc-950 border-2 border-white flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={querySearch}
                  onChange={(e) => setQuerySearch(e.target.value)}
                  placeholder="Search by student name, email, phone, branch, or keywords..."
                  className="w-full bg-black border-2 border-zinc-700 pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-mono-numbers font-bold">
                {(['All', 'Received', 'In Review', 'Answered'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setQueryStatusFilter(st)}
                    className={`px-3 py-1.5 border uppercase transition-colors shrink-0 ${
                      queryStatusFilter === st
                        ? 'border-white bg-white text-black'
                        : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    {st === 'All'
                      ? `All (${queries.length})`
                      : `${st} (${queries.filter((q) => q.status === st).length})`}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const filtered = queries.filter((q) => {
                const matchesStatus = queryStatusFilter === 'All' || q.status === queryStatusFilter;
                const s = querySearch.toLowerCase().trim();
                if (!s) return matchesStatus;
                const matchesSearch =
                  q.studentName.toLowerCase().includes(s) ||
                  q.email.toLowerCase().includes(s) ||
                  q.contactNumber.toLowerCase().includes(s) ||
                  q.query.toLowerCase().includes(s) ||
                  q.id.toLowerCase().includes(s);
                return matchesStatus && matchesSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-12 border-2 border-white bg-zinc-950 text-center shadow-[6px_6px_0px_0px_#ffffff]">
                    <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-heading font-black uppercase text-white">
                      No Student Queries Found
                    </h3>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((item) => {
                    const cleanPhone = item.contactNumber.replace(/[^0-9]/g, '');
                    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Hello ${item.studentName}, this is Techie Teacher's Tribe Trust faculty replying to your query [${item.id}]: `
                    )}`;
                    const mailLink = `mailto:${item.email}?subject=${encodeURIComponent(
                      `Re: Techie Teacher's Tribe Trust Query [${item.id}]`
                    )}`;

                    return (
                      <div
                        key={item.id}
                        className="p-6 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff]"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-heading font-black text-lg text-white">
                              {item.studentName}
                            </span>
                            <span className="px-2 py-0.5 bg-black border border-zinc-700 text-[10px] font-mono-numbers font-bold text-zinc-300 uppercase">
                              {item.id}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono-numbers flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{item.timestamp}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-mono-numbers text-zinc-400">
                              STATUS:
                            </span>
                            <div className="inline-flex border border-zinc-700 bg-black p-0.5">
                              {(['Received', 'In Review', 'Answered'] as const).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => {
                                    onUpdateQueryStatus(item.id, st);
                                    showNotice(`Query ${item.id} status updated to: ${st}`);
                                  }}
                                  className={`px-2.5 py-1 text-[10px] font-mono-numbers font-bold uppercase transition-colors ${
                                    item.status === st
                                      ? st === 'Received'
                                        ? 'bg-amber-500 text-black'
                                        : st === 'In Review'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-black'
                                      : 'text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono-numbers border-b border-zinc-800">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Phone className="w-3.5 h-3.5 text-white shrink-0" />
                            <span>{item.contactNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Mail className="w-3.5 h-3.5 text-white shrink-0" />
                            <span className="truncate">{item.email}</span>
                          </div>
                          <div className="text-zinc-400">
                            <span className="text-zinc-500">Route: </span>
                            <span className="text-white font-bold">Contact SOS Form</span>
                          </div>
                        </div>

                        <div className="my-4 p-4 bg-black border border-zinc-800">
                          {typeof item.rating === 'number' && (
                            <div className="mb-3 p-3 bg-zinc-900 border border-zinc-700 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#ffffff]">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <div className="flex items-center text-white">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3.5 h-3.5 ${
                                        s <= item.rating! ? 'fill-white text-white' : 'text-zinc-700'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-white text-xs font-mono-numbers">
                                  {item.rating}.0 ★
                                </span>
                                <span className="text-[10px] uppercase font-mono-numbers px-2 py-0.5 bg-black border border-zinc-600 text-zinc-300 font-bold">
                                  {item.ratingCategory === 'teacher'
                                    ? 'FACULTY EVALUATION'
                                    : item.ratingCategory === 'course'
                                    ? 'COURSE EVALUATION'
                                    : 'QUICK LEARNING EVALUATION'}
                                </span>
                                <span className="text-xs text-white font-bold">
                                  {item.targetName}
                                </span>
                              </div>
                              {item.feedbackText && (
                                <div className="text-xs text-zinc-300 font-mono-numbers italic">
                                  "{item.feedbackText}"
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                            {item.query}
                          </p>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5 border border-white font-mono-numbers"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp Student</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <a
                              href={mailLink}
                              className="px-3.5 py-2 bg-black text-white font-bold uppercase text-xs hover:bg-zinc-900 transition-colors flex items-center gap-1.5 border border-zinc-700 font-mono-numbers"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Send Email</span>
                            </a>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setConfirmState({
                                isOpen: true,
                                title: 'Delete Student Query',
                                message: `Delete SOS query ${item.id} from ${item.studentName}?`,
                                onConfirm: () => {
                                  onDeleteQuery(item.id);
                                  showNotice(`Deleted query ${item.id}`);
                                  setConfirmState((prev) => ({ ...prev, isOpen: false }));
                                }
                              })
                            }
                            aria-label={`Delete query ${item.id}`}
                            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center p-2 border border-zinc-800 hover:border-red-500 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete this query"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB: RATING MANAGEMENT & EVALUATION CONTROL */}
        {activeTab === 'ratings' && (() => {
          const teacherOverrides = siteContent.ratingOverrides?.teachers || {};
          const courseOverrides = siteContent.ratingOverrides?.courses || {};
          const qlOverrides = siteContent.ratingOverrides?.quickLearning || {};

          const teachersList = getAllTeachersRatingList(siteContent, teacherProfiles, queries);
          const coursesList = getAllCoursesRatingList(courses, [], queries, siteContent);
          const qlList = getAllQuickLearningRatingList(queries, siteContent);

          const studentRatedQueries = queries.filter(
            (q) => typeof q.rating === 'number' && q.rating >= 1 && q.rating <= 5
          );

          const totalOverridesCount =
            Object.keys(teacherOverrides).length +
            Object.keys(courseOverrides).length +
            Object.keys(qlOverrides).length;

          // Helper to save a single teacher rating
          const handleSaveTeacherRating = (teacherKey: string, newRating: number) => {
            const cleanRating = Math.min(5, Math.max(1, Number(newRating.toFixed(2))));
            const updated = {
              ...siteContent,
              ratingOverrides: {
                ...siteContent.ratingOverrides,
                teachers: {
                  ...teacherOverrides,
                  [teacherKey]: cleanRating
                }
              }
            };
            onSaveSiteContent(updated);
            showNotice(`Rating for teacher updated to ${cleanRating}★. Changes are live.`);
          };

          const handleResetTeacherRating = (teacherKey: string) => {
            const copy = { ...teacherOverrides };
            delete copy[teacherKey];
            const updated = {
              ...siteContent,
              ratingOverrides: {
                ...siteContent.ratingOverrides,
                teachers: copy
              }
            };
            onSaveSiteContent(updated);
            showNotice(`Teacher rating reset to student-calculated average.`);
          };

          // Helper to save a single course rating
          const handleSaveCourseRating = (courseId: string, newRating: number) => {
            const cleanRating = Math.min(5, Math.max(1, Number(newRating.toFixed(2))));
            const updated = {
              ...siteContent,
              ratingOverrides: {
                ...siteContent.ratingOverrides,
                courses: {
                  ...courseOverrides,
                  [courseId]: cleanRating
                }
              }
            };
            onSaveSiteContent(updated);
            showNotice(`Course rating updated to ${cleanRating}★. Changes are live.`);
          };

          const handleResetCourseRating = (courseId: string) => {
            const copy = { ...courseOverrides };
            delete copy[courseId];
            const updated = {
              ...siteContent,
              ratingOverrides: {
                ...siteContent.ratingOverrides,
                courses: copy
              }
            };
            onSaveSiteContent(updated);
            showNotice(`Course rating reset to student review average.`);
          };

          // Helper to save a single quick learning rating
          const handleSaveQlRating = (qlId: string, newRating: number) => {
            const cleanRating = Math.min(5, Math.max(1, Number(newRating.toFixed(2))));
            const updated = {
              ...siteContent,
              ratingOverrides: {
                ...siteContent.ratingOverrides,
                quickLearning: {
                  ...qlOverrides,
                  [qlId]: cleanRating
                }
              }
            };
            onSaveSiteContent(updated);
            showNotice(`Quick Learning rating updated to ${cleanRating}★.`);
          };

          const handleResetQlRating = (qlId: string) => {
            const copy = { ...qlOverrides };
            delete copy[qlId];
            const updated = {
              ...siteContent,
              ratingOverrides: {
                ...siteContent.ratingOverrides,
                quickLearning: copy
              }
            };
            onSaveSiteContent(updated);
            showNotice(`Quick learning rating reset to student average.`);
          };

          // Bulk save all pending edits
          const handleBulkSaveAllRatings = () => {
            const mergedTeachers = { ...teacherOverrides, ...editingTeacherRatings };
            const mergedCourses = { ...courseOverrides, ...editingCourseRatings };
            const mergedQl = { ...qlOverrides, ...editingQlRatings };

            const updated = {
              ...siteContent,
              ratingOverrides: {
                teachers: mergedTeachers,
                courses: mergedCourses,
                quickLearning: mergedQl
              }
            };
            onSaveSiteContent(updated);
            showNotice(`All teacher, course & quick learning ratings updated successfully!`);
          };

          const handleResetAllOverrides = () => {
            const updated = {
              ...siteContent,
              ratingOverrides: {
                teachers: {},
                courses: {},
                quickLearning: {}
              }
            };
            setEditingTeacherRatings({});
            setEditingCourseRatings({});
            setEditingQlRatings({});
            onSaveSiteContent(updated);
            showNotice(`All manual rating overrides reset. System using live student averages.`);
          };

          // Filter lists by search
          const qSearch = ratingSearch.toLowerCase().trim();
          const filteredTeachers = teachersList.filter((t) => {
            if (!qSearch) return true;
            return (
              t.name.toLowerCase().includes(qSearch) ||
              t.role.toLowerCase().includes(qSearch) ||
              (t.subject && t.subject.toLowerCase().includes(qSearch))
            );
          });

          const filteredCourses = coursesList.filter((c) => {
            if (!qSearch) return true;
            return (
              c.title.toLowerCase().includes(qSearch) ||
              c.code.toLowerCase().includes(qSearch) ||
              c.teacher.toLowerCase().includes(qSearch) ||
              c.branch.toLowerCase().includes(qSearch)
            );
          });

          const filteredQl = qlList.filter((m) => {
            if (!qSearch) return true;
            return (
              m.title.toLowerCase().includes(qSearch) ||
              m.badge.toLowerCase().includes(qSearch) ||
              m.description.toLowerCase().includes(qSearch)
            );
          });

          return (
            <div className="space-y-8">
              {/* Top Banner with Stats & Bulk Actions */}
              <div className="p-6 sm:p-8 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white text-black text-xs font-mono-numbers font-black uppercase mb-3">
                    <Star className="w-3.5 h-3.5 fill-black" />
                    <span>CENTRAL RATING GOVERNANCE DESK</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase">
                    Teacher, Course &amp; Quick Learning Rating System
                  </h2>
                  <p className="text-xs text-zinc-400 mt-2 max-w-3xl leading-relaxed">
                    Student evaluations submitted through the query system are linked to faculty profiles and course catalog items. You can audit live student averages, edit public display ratings, or reset overrides at any time.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleBulkSaveAllRatings}
                    className="min-h-[44px] px-4 py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[3px_3px_0px_0px_#ffffff] font-mono-numbers"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All Ratings</span>
                  </button>

                  {totalOverridesCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmState({
                          isOpen: true,
                          title: 'Reset All Rating Overrides',
                          message:
                            'Are you sure you want to clear all manual rating overrides? The platform will revert to calculating raw live averages from student query reviews.',
                          onConfirm: () => {
                            handleResetAllOverrides();
                            setConfirmState((prev) => ({ ...prev, isOpen: false }));
                          }
                        })
                      }
                      className="min-h-[44px] px-3.5 py-2.5 bg-black border-2 border-zinc-700 hover:border-red-500 text-zinc-300 hover:text-red-400 font-bold uppercase text-xs transition-colors flex items-center gap-2 font-mono-numbers"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Overrides ({totalOverridesCount})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Metric KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                  <div className="text-[10px] font-mono-numbers uppercase text-zinc-400">
                    Faculty Profiles
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-white mt-1">
                    {teachersList.length}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono-numbers mt-0.5">
                    Avg:{' '}
                    {(
                      teachersList.reduce((sum, t) => sum + t.finalRating, 0) /
                      (teachersList.length || 1)
                    ).toFixed(2)}
                    ★
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                  <div className="text-[10px] font-mono-numbers uppercase text-zinc-400">
                    Courses Catalog
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-white mt-1">
                    {coursesList.length}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono-numbers mt-0.5">
                    Avg:{' '}
                    {(
                      coursesList.reduce((sum, c) => sum + c.finalRating, 0) /
                      (coursesList.length || 1)
                    ).toFixed(2)}
                    ★
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                  <div className="text-[10px] font-mono-numbers uppercase text-zinc-400">
                    Quick Learning
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-white mt-1">
                    {qlList.length}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono-numbers mt-0.5">
                    Sprint modules
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                  <div className="text-[10px] font-mono-numbers uppercase text-zinc-400">
                    Student Query Evals
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-white mt-1">
                    {studentRatedQueries.length}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono-numbers mt-0.5">
                    {totalOverridesCount} overrides active
                  </div>
                </div>
              </div>

              {/* Sub-tab navigation & search */}
              <div className="p-4 bg-zinc-950 border-2 border-white flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRatingSubTab('teachers')}
                    className={`min-h-[40px] px-3.5 py-2 text-xs font-mono-numbers font-bold uppercase transition-colors border ${
                      ratingSubTab === 'teachers'
                        ? 'border-white bg-white text-black'
                        : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    Faculty &amp; Teachers ({teachersList.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setRatingSubTab('courses')}
                    className={`min-h-[40px] px-3.5 py-2 text-xs font-mono-numbers font-bold uppercase transition-colors border ${
                      ratingSubTab === 'courses'
                        ? 'border-white bg-white text-black'
                        : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    Courses Catalog ({coursesList.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setRatingSubTab('quickLearning')}
                    className={`min-h-[40px] px-3.5 py-2 text-xs font-mono-numbers font-bold uppercase transition-colors border ${
                      ratingSubTab === 'quickLearning'
                        ? 'border-white bg-white text-black'
                        : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    Quick Learning ({qlList.length})
                  </button>
                </div>

                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={ratingSearch}
                    onChange={(e) => setRatingSearch(e.target.value)}
                    placeholder="Search by name, code, role, or module..."
                    className="w-full bg-black border-2 border-zinc-700 pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
              </div>

              {/* 1. TEACHERS RATING SECTION */}
              {ratingSubTab === 'teachers' && (
                <div className="space-y-4">
                  {filteredTeachers.map((teacher) => {
                    const activeRating =
                      editingTeacherRatings[teacher.key] ?? teacher.finalRating;

                    return (
                      <div
                        key={teacher.key}
                        className="p-5 sm:p-6 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                      >
                        {/* Profile Info */}
                        <div className="flex items-start sm:items-center gap-4 min-w-0">
                          <div className="w-14 h-14 border-2 border-white bg-black shrink-0 overflow-hidden flex items-center justify-center">
                            {teacher.imageUrl ? (
                              <img
                                src={teacher.imageUrl}
                                alt={teacher.name}
                                className="w-full h-full object-cover object-top filter grayscale contrast-125"
                              />
                            ) : (
                              <GraduationCap className="w-6 h-6 text-white" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-heading font-black uppercase text-white truncate">
                                {teacher.name}
                              </h3>
                              {teacher.isOverridden ? (
                                <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-mono-numbers font-black uppercase">
                                  MANUAL OVERRIDE
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-mono-numbers font-bold uppercase">
                                  STUDENT AVERAGE
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-400 font-mono-numbers mt-0.5">
                              {teacher.role} {teacher.subject ? `· ${teacher.subject}` : ''}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono-numbers text-zinc-500 mt-2">
                              <span>Base: {teacher.baseRating}★</span>
                              <span>•</span>
                              <span>
                                Student Avg:{' '}
                                <strong className="text-zinc-300">
                                  {teacher.studentRatingsCount > 0
                                    ? `${teacher.studentAverage}★ (${teacher.studentRatingsCount} evals)`
                                    : 'No query evals yet'}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Rating Editor Form */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0 p-3 bg-black border border-zinc-800">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-white text-white" />
                            <span className="text-xs font-mono-numbers font-bold text-zinc-400 uppercase">
                              Rating:
                            </span>
                          </div>

                          <input
                            type="number"
                            min="1.0"
                            max="5.0"
                            step="0.05"
                            value={activeRating}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                setEditingTeacherRatings((prev) => ({
                                  ...prev,
                                  [teacher.key]: val
                                }));
                              }
                            }}
                            className="w-20 bg-zinc-950 border-2 border-zinc-700 px-2 py-1.5 text-center text-sm font-mono-numbers font-black text-white focus:outline-none focus:border-white"
                          />

                          {/* Quick adjust stepper buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = Math.max(1, Number((activeRating - 0.1).toFixed(2)));
                                setEditingTeacherRatings((prev) => ({
                                  ...prev,
                                  [teacher.key]: nextVal
                                }));
                              }}
                              className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-mono-numbers text-white"
                              title="Decrease by 0.1"
                            >
                              -0.1
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = Math.min(5, Number((activeRating + 0.1).toFixed(2)));
                                setEditingTeacherRatings((prev) => ({
                                  ...prev,
                                  [teacher.key]: nextVal
                                }));
                              }}
                              className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-mono-numbers text-white"
                              title="Increase by 0.1"
                            >
                              +0.1
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTeacherRatings((prev) => ({
                                  ...prev,
                                  [teacher.key]: 5.0
                                }));
                              }}
                              className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-mono-numbers text-white"
                              title="Set to 5.0"
                            >
                              5.0
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSaveTeacherRating(teacher.key, activeRating)}
                            className="px-3.5 py-1.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border border-white font-mono-numbers"
                          >
                            Update
                          </button>

                          {teacher.isOverridden && (
                            <button
                              type="button"
                              onClick={() => handleResetTeacherRating(teacher.key)}
                              className="px-2.5 py-1.5 bg-black text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 text-xs font-mono-numbers"
                              title="Revert to student calculated average"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. COURSES RATING SECTION */}
              {ratingSubTab === 'courses' && (
                <div className="space-y-4">
                  {filteredCourses.map((course) => {
                    const activeRating =
                      editingCourseRatings[course.courseId] ?? course.finalRating;

                    return (
                      <div
                        key={course.courseId}
                        className="p-5 sm:p-6 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 bg-white text-black font-mono-numbers font-black text-xs uppercase">
                              {course.code}
                            </span>
                            <h3 className="text-lg font-heading font-black uppercase text-white truncate">
                              {course.title}
                            </h3>
                            {course.isOverridden ? (
                              <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-mono-numbers font-black uppercase">
                                OVERRIDDEN
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-mono-numbers font-bold uppercase">
                                DYNAMIC AVG
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 font-mono-numbers mt-1">
                            Instructor: <span className="text-zinc-200 font-bold">{course.teacher}</span> · {course.branch}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono-numbers text-zinc-500 mt-2">
                            <span>Base: {course.baseRating}★</span>
                            <span>•</span>
                            <span>Total Reviews: {course.reviewsCount}</span>
                            <span>•</span>
                            <span>
                              Student Avg:{' '}
                              <strong className="text-zinc-300">
                                {course.studentRatingsCount > 0
                                  ? `${course.studentAverage}★ (${course.studentRatingsCount} evals)`
                                  : 'No query evals yet'}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Interactive Course Rating Form */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0 p-3 bg-black border border-zinc-800">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-white text-white" />
                            <span className="text-xs font-mono-numbers font-bold text-zinc-400 uppercase">
                              Rating:
                            </span>
                          </div>

                          <input
                            type="number"
                            min="1.0"
                            max="5.0"
                            step="0.05"
                            value={activeRating}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                setEditingCourseRatings((prev) => ({
                                  ...prev,
                                  [course.courseId]: val
                                }));
                              }
                            }}
                            className="w-20 bg-zinc-950 border-2 border-zinc-700 px-2 py-1.5 text-center text-sm font-mono-numbers font-black text-white focus:outline-none focus:border-white"
                          />

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = Math.max(1, Number((activeRating - 0.1).toFixed(2)));
                                setEditingCourseRatings((prev) => ({
                                  ...prev,
                                  [course.courseId]: nextVal
                                }));
                              }}
                              className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-mono-numbers text-white"
                            >
                              -0.1
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = Math.min(5, Number((activeRating + 0.1).toFixed(2)));
                                setEditingCourseRatings((prev) => ({
                                  ...prev,
                                  [course.courseId]: nextVal
                                }));
                              }}
                              className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-mono-numbers text-white"
                            >
                              +0.1
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSaveCourseRating(course.courseId, activeRating)}
                            className="px-3.5 py-1.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border border-white font-mono-numbers"
                          >
                            Update
                          </button>

                          {course.isOverridden && (
                            <button
                              type="button"
                              onClick={() => handleResetCourseRating(course.courseId)}
                              className="px-2.5 py-1.5 bg-black text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 text-xs font-mono-numbers"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. QUICK LEARNING RATING SECTION */}
              {ratingSubTab === 'quickLearning' && (
                <div className="space-y-4">
                  {filteredQl.map((mod) => {
                    const activeRating =
                      editingQlRatings[mod.id] ?? mod.finalRating;

                    return (
                      <div
                        key={mod.id}
                        className="p-5 sm:p-6 bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 bg-white text-black font-mono-numbers font-black text-xs uppercase">
                              {mod.badge}
                            </span>
                            <h3 className="text-lg font-heading font-black uppercase text-white truncate">
                              {mod.title}
                            </h3>
                            {mod.isOverridden ? (
                              <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-mono-numbers font-black uppercase">
                                OVERRIDDEN
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-mono-numbers font-bold uppercase">
                                DYNAMIC AVG
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                            {mod.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono-numbers text-zinc-500 mt-2">
                            <span>Base: {mod.baseRating}★</span>
                            <span>•</span>
                            <span>
                              Student Avg:{' '}
                              <strong className="text-zinc-300">
                                {mod.studentRatingsCount > 0
                                  ? `${mod.studentAverage}★ (${mod.studentRatingsCount} evals)`
                                  : 'No student evals yet'}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Interactive Quick Learning Rating Form */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0 p-3 bg-black border border-zinc-800">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-white text-white" />
                            <span className="text-xs font-mono-numbers font-bold text-zinc-400 uppercase">
                              Rating:
                            </span>
                          </div>

                          <input
                            type="number"
                            min="1.0"
                            max="5.0"
                            step="0.05"
                            value={activeRating}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                setEditingQlRatings((prev) => ({
                                  ...prev,
                                  [mod.id]: val
                                }));
                              }
                            }}
                            className="w-20 bg-zinc-950 border-2 border-zinc-700 px-2 py-1.5 text-center text-sm font-mono-numbers font-black text-white focus:outline-none focus:border-white"
                          />

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = Math.max(1, Number((activeRating - 0.1).toFixed(2)));
                                setEditingQlRatings((prev) => ({
                                  ...prev,
                                  [mod.id]: nextVal
                                }));
                              }}
                              className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-mono-numbers text-white"
                            >
                              -0.1
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = Math.min(5, Number((activeRating + 0.1).toFixed(2)));
                                setEditingQlRatings((prev) => ({
                                  ...prev,
                                  [mod.id]: nextVal
                                }));
                              }}
                              className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-mono-numbers text-white"
                            >
                              +0.1
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSaveQlRating(mod.id, activeRating)}
                            className="px-3.5 py-1.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border border-white font-mono-numbers"
                          >
                            Update
                          </button>

                          {mod.isOverridden && (
                            <button
                              type="button"
                              onClick={() => handleResetQlRating(mod.id)}
                              className="px-2.5 py-1.5 bg-black text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 text-xs font-mono-numbers"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 2: CMS */}
        {activeTab === 'cms' && (
          <AdminCMSManager
            content={siteContent}
            onSaveContent={onSaveSiteContent}
            onResetContent={onResetSiteContent}
            onNavigate={onNavigate}
          />
        )}

        {/* TAB 3: COURSES */}
        {activeTab === 'courses' && (
          <section className="bg-zinc-950 border-2 border-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#ffffff]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-zinc-800 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                  CATALOG GOVERNANCE
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-black uppercase mt-1">
                  All Courses & Notes Listings ({courses.length})
                </h2>
              </div>
              <button
                onClick={onOpenCreateCourse}
                className="px-4 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Course</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-numbers">
                <thead>
                  <tr className="border-b-2 border-white text-zinc-400 uppercase">
                    <th className="py-3 px-2">Code</th>
                    <th className="py-3 px-2">Course Title</th>
                    <th className="py-3 px-2">Format</th>
                    <th className="py-3 px-2">Price</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-zinc-900 transition-colors">
                      <td className="py-3.5 px-2 font-bold text-white">{course.code}</td>
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-white text-sm">{course.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          By {course.teacher} · {course.duration}
                        </div>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="border border-zinc-700 px-2 py-0.5 text-zinc-300">
                          {course.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 font-black text-white">₹{course.price}</td>
                      <td className="py-3.5 px-2">
                        <button
                          onClick={() => {
                            onToggleApproval(course.id);
                            showNotice(`Status changed for ${course.title}`);
                          }}
                          className={`px-2 py-0.5 text-[10px] font-bold border ${
                            course.isApproved
                              ? 'border-white bg-white text-black'
                              : 'border-zinc-600 bg-zinc-900 text-zinc-400'
                          }`}
                        >
                          {course.isApproved ? 'LIVE / APPROVED' : 'PENDING REVIEW'}
                        </button>
                      </td>
                      <td className="py-3.5 px-2 text-right space-x-2">
                        <button
                          onClick={() => onOpenEditCourse(course)}
                          className="p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
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
                              message: `Permanently delete "${course.title}" (${course.code})?`,
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3.5: LIVE DOUBT SESSIONS */}
        {activeTab === 'live-sessions' && (
          <section className="bg-zinc-950 border-2 border-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#ffffff]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-zinc-800 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                  LIVE CLASSROOM GOVERNANCE
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-black uppercase mt-1">
                  Live Doubt Sessions ({liveSessions.length})
                </h2>
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
                <span>Schedule Live Class</span>
              </button>
            </div>

            {liveSessions.length === 0 ? (
              <div className="p-10 border border-zinc-800 bg-black text-center text-xs font-mono-numbers text-zinc-400">
                No live doubt classes scheduled yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {liveSessions.map((sess) => (
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

                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono-numbers text-zinc-400 uppercase">
                        {sess.isPublished ? 'Published to Students' : 'Hidden Draft'}
                      </span>
                      <div className="flex items-center gap-2">
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
                              message: `Delete live session "${sess.title}"?`,
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 4: NEWS */}
        {activeTab === 'news' && (
          <section className="bg-zinc-950 border-2 border-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#ffffff]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-zinc-800 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                  COMMUNICATION CELL
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-black uppercase mt-1">
                  Daily News &amp; Campus Bulletins
                </h2>
              </div>
              <button
                type="button"
                onClick={onOpenCreateNews}
                className="min-h-[44px] px-4 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
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
                    <th className="py-3 px-2">Headline &amp; Excerpt</th>
                    <th className="py-3 px-2">Author</th>
                    <th className="py-3 px-2">Date</th>
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
                      <td className="py-3.5 px-2 text-zinc-300">{item.author}</td>
                      <td className="py-3.5 px-2 text-zinc-400 text-[11px]">{item.date}</td>
                      <td className="py-3.5 px-2 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => onOpenEditNews(item)}
                          aria-label={`Edit ${item.title}`}
                          className="min-w-[38px] min-h-[38px] inline-flex items-center justify-center p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                          title="Edit article"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmState({
                              isOpen: true,
                              title: 'Delete News Article',
                              message: `Permanently delete news article "${item.title}"?`,
                              onConfirm: () => {
                                onDeleteNews(item.id);
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

      {/* Teacher Profile Create/Edit Modal */}
      <TeacherProfileModal
        isOpen={profileModalState.isOpen}
        mode={profileModalState.mode}
        initialData={profileModalState.initialData}
        onClose={() =>
          setProfileModalState((prev) => ({
            ...prev,
            isOpen: false
          }))
        }
        onSubmit={handleProfileModalSubmit}
      />

      {/* Live Doubt Session Form Modal */}
      <LiveSessionFormModal
        isOpen={isLiveModalOpen}
        editingSession={editingLiveSession}
        defaultHostName={currentUser?.name || 'Verified Faculty'}
        defaultHostEmail={currentUser?.email}
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
          <CheckCircle className="w-4 h-4 text-black shrink-0" />
          <span>{portalNotice}</span>
        </div>
      )}
    </div>
  );
};
