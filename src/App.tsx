import React, { useState, useEffect, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  BOOTSTRAPPED_ADMIN_EMAIL
} from './lib/firebase';
import {
  syncUserProfileOnAuth,
  updateUserEnrolledCoursesInCloud,
  updateUserProfileAndGoalsInCloud,
  saveOrderToCloud,
  subscribeUserOrders,
  subscribePublicCourses,
  subscribeTeacherOwnCourses,
  checkTeacherVerifiedInCloud,
  subscribeAllCoursesForAdmin,
  saveCourseToCloud,
  deleteCourseFromCloud,
  subscribePublicVerifiedTeachers,
  subscribeAllVerifiedTeachersForAdmin,
  saveVerifiedTeacherToCloud,
  submitTeacherAccessRequestToCloud,
  updateTeacherAccessRequestInCloud,
  deleteTeacherAccessRequestFromCloud,
  subscribeAllTeacherRequestsForAdmin,
  subscribeTeacherRequestsForUser,
  subscribePublicNews,
  saveNewsToCloud,
  deleteNewsFromCloud,
  subscribeCourseReviews,
  saveCourseReviewToCloud,
  voteReviewHelpfulInCloud,
  submitQueryToCloud,
  subscribeAllQueriesForAdmin,
  updateQueryStatusInCloud,
  deleteQueryFromCloud,
  subscribePublishedLiveSessions,
  subscribeAllLiveSessionsForAdmin,
  saveLiveSessionToCloud,
  deleteLiveSessionFromCloud,
  subscribeSiteContent,
  saveSiteContentToCloud
} from './lib/firestoreSync';
import { Navbar, NavPage, PlatformNotification } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { CoursesPage } from './pages/CoursesPage';
import { QuickLearningPage } from './pages/QuickLearningPage';
import { TeamPage } from './pages/TeamPage';
import { TeachersPage } from './pages/TeachersPage';
import { ContactPage } from './pages/ContactPage';
import { CollabsPage } from './pages/CollabsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { CartPage } from './pages/CartPage';
import { TeacherPortalPage } from './pages/TeacherPortalPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { RazorpayModal } from './components/RazorpayModal';
import { CourseDetailsModal } from './components/CourseDetailsModal';
import { NewsArticleModal } from './components/NewsArticleModal';
import { NewsFormModal } from './components/NewsFormModal';
import { CourseFormModal } from './components/CourseFormModal';
import { TeacherRequestModal } from './components/TeacherRequestModal';
import { TeacherProfileFormData } from './components/TeacherProfileModal';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import {
  Course,
  DailyNewsItem,
  User,
  CartItem,
  Order,
  EnrolledCourse,
  QuerySubmission,
  CourseReview,
  TeacherAccessRequest,
  VerifiedTeacherProfile,
  LiveSession,
  INITIAL_COURSES,
  INITIAL_REVIEWS,
  INITIAL_NEWS,
  INITIAL_QUERIES,
  INITIAL_TEACHER_REQUESTS,
  INITIAL_VERIFIED_TEACHER_EMAILS,
  INITIAL_TEACHER_PROFILES,
  INITIAL_LIVE_SESSIONS
} from './data/db';
import { SiteContent, INITIAL_SITE_CONTENT } from './data/siteContent';

export default function App() {
  // Navigation & Cross-Page Deep Link State
  const [currentPage, setCurrentPage] = useState<NavPage>('home');
  const [selectedTeacherEmail, setSelectedTeacherEmail] = useState<string | null>(null);
  const [instructorFilter, setInstructorFilter] = useState<string | null>(null);
  const [pendingPromoCode, setPendingPromoCode] = useState<string | null>(null);

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authRefreshTick, setAuthRefreshTick] = useState(0);
  const pendingSignupOverridesRef = useRef<{ name?: string; college?: string } | null>(null);

  const handleNavigate = (page: NavPage) => {
    if (page === 'teachers') {
      setSelectedTeacherEmail(null);
    }
    if (page !== 'courses') {
      setInstructorFilter(null);
    }
    setCurrentPage(page);
  };

  // Courses database with persistence
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_courses');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_COURSES;
  });

  // Site Content CMS database with persistence
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem('tttt_site_content');
      if (saved) {
        const parsed = JSON.parse(saved) as SiteContent;
        if (!parsed.team?.technicalHeader) {
          parsed.team.technicalHeader = INITIAL_SITE_CONTENT.team.technicalHeader;
        }
        if (parsed.team) {
          parsed.team.founderTitle = 'Ajay "Techie" Kalki';
          parsed.team.founderBio =
            'Over the past decade, Ajay has mentored more than 1500 students across India. Disillusioned with outdated university slides and bulky foreign textbooks, he created the high-yield note methodology that turned average semester scorers into university rank holders.';
          parsed.team.founderImageUrl = '/assets/aistudio/Founder_photo_94b319e5.png';
        }
        if (!parsed.team?.technicalMembers || parsed.team.technicalMembers.length === 0) {
          parsed.team.technicalMembers = INITIAL_SITE_CONTENT.team.technicalMembers;
        } else {
          if (parsed.team.technicalMembers[0]) {
            parsed.team.technicalMembers[0].name = 'Aniruddh Trivedi';
            parsed.team.technicalMembers[0].role = 'Website Designer and Administrator';
            parsed.team.technicalMembers[0].domain = 'UI/UX Architecture, Web Performance & Platform Administration';
            parsed.team.technicalMembers[0].imageUrl = '/assets/aistudio/Aniruddh_photo_47ab7886.png';
          }
          if (parsed.team.technicalMembers[1]) {
            parsed.team.technicalMembers[1].name = 'Aryan Yadav';
            parsed.team.technicalMembers[1].role = 'Researcher and Content Organiser';
            parsed.team.technicalMembers[1].domain =
              'Structuring Raw Information Into Organised Digital Assets, Websites And Knowledge Bases';
            parsed.team.technicalMembers[1].imageUrl = '/assets/aistudio/Aryan_photo_2feeb48f.png';
          }
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SITE_CONTENT;
  });

  // Current logged in user (Firebase user, Passkey Admin, or null)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('tttt_user');
      if (saved) {
        const parsed = JSON.parse(saved) as User;
        if (parsed.id === 'usr_demo_student') {
          localStorage.removeItem('tttt_user');
          return null;
        }
        if (parsed.role === 'admin' || parsed.id) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return null;
  });

  // Reviews database with persistence
  const [reviews, setReviews] = useState<CourseReview[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_reviews');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS;
  });

  // Cart items (starts empty cleanly unless user saved items)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Orders / Purchase History (strictly empty for guests, real orders synced on login)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((o: Order) => o.id !== 'ORD-892144' && o.studentEmail !== 'aryan.sharma@dtu.ac.in');
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Enrolled courses for student dashboard (strictly empty for guests, synced from Firestore on login)
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_enrolled');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Contact queries
  const [queries, setQueries] = useState<QuerySubmission[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_queries');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_QUERIES;
  });

  // News database with persistence
  const [news, setNews] = useState<DailyNewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_news');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_NEWS;
  });

  // Teacher Email Verification & Requests state with persistence
  const [teacherRequests, setTeacherRequests] = useState<TeacherAccessRequest[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_teacher_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_TEACHER_REQUESTS;
  });

  const [verifiedTeacherEmails, setVerifiedTeacherEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_verified_teacher_emails');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_VERIFIED_TEACHER_EMAILS;
  });

  const [teacherProfiles, setTeacherProfiles] = useState<VerifiedTeacherProfile[]>(() => {
    let baseProfiles: VerifiedTeacherProfile[] = INITIAL_TEACHER_PROFILES;
    try {
      const saved = localStorage.getItem('tttt_teacher_profiles');
      if (saved) {
        baseProfiles = JSON.parse(saved);
      }
    } catch (e) {
      // fallback
    }

    const existingEmails = new Set(baseProfiles.map((p) => p.email.trim().toLowerCase()));
    const missingProfiles: VerifiedTeacherProfile[] = verifiedTeacherEmails
      .map((em) => em.trim().toLowerCase())
      .filter((em) => em && !existingEmails.has(em))
      .map((em, idx) => {
        const req = teacherRequests.find((r) => r.email.trim().toLowerCase() === em);
        const qualParts = req
          ? [req.department, req.college, req.experienceYears].filter(Boolean)
          : [];
        return {
          id: `TPROF-${4100 + idx}`,
          email: em,
          name: req?.name || 'Verified Faculty',
          qualification: qualParts.join(' · ') || 'Verified University Educator',
          intro:
            req?.notes ||
            (req?.subjectsTaught
              ? `University educator specializing in ${req.subjectsTaught}.`
              : 'Verified faculty member at Techie Teacher’s Tribe Trust.'),
          photoUrl: '',
          isVisible: true,
          approvedAt: req?.approvedAt || 'Verified Educator',
          updatedAt: req?.approvedAt || 'Verified Educator'
        };
      });

    return missingProfiles.length > 0 ? [...missingProfiles, ...baseProfiles] : baseProfiles;
  });

  // Live Doubt Sessions & Notification Read State
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_live_sessions');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_LIVE_SESSIONS;
  });

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tttt_read_notifs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // News, Course & Teacher Request Modals State
  const [selectedNewsForModal, setSelectedNewsForModal] = useState<DailyNewsItem | null>(null);
  const [isNewsFormOpen, setIsNewsFormOpen] = useState(false);
  const [newsToEdit, setNewsToEdit] = useState<DailyNewsItem | null>(null);

  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [isTeacherRequestModalOpen, setIsTeacherRequestModalOpen] = useState(false);

  // Quick multi-variant feedback toast
  const [toastState, setToastState] = useState<{
    message: string;
    variant: 'success' | 'error' | 'info';
  } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const showToast = (message: string, variant: 'success' | 'error' | 'info' = 'success') => {
    setToastState({ message, variant });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastState(null);
    }, 3400);
  };

  // Razorpay Checkout Modal State
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);

  // Course Details Preview Modal
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('tttt_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('tttt_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tttt_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tttt_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('tttt_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('tttt_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('tttt_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('tttt_enrolled', JSON.stringify(enrolledCourses));
  }, [enrolledCourses]);

  useEffect(() => {
    localStorage.setItem('tttt_queries', JSON.stringify(queries));
  }, [queries]);

  useEffect(() => {
    localStorage.setItem('tttt_site_content', JSON.stringify(siteContent));
  }, [siteContent]);

  useEffect(() => {
    localStorage.setItem('tttt_teacher_requests', JSON.stringify(teacherRequests));
  }, [teacherRequests]);

  useEffect(() => {
    localStorage.setItem('tttt_verified_teacher_emails', JSON.stringify(verifiedTeacherEmails));
  }, [verifiedTeacherEmails]);

  useEffect(() => {
    localStorage.setItem('tttt_teacher_profiles', JSON.stringify(teacherProfiles));
  }, [teacherProfiles]);

  useEffect(() => {
    localStorage.setItem('tttt_live_sessions', JSON.stringify(liveSessions));
  }, [liveSessions]);

  useEffect(() => {
    localStorage.setItem('tttt_read_notifs', JSON.stringify(readNotificationIds));
  }, [readNotificationIds]);

  // Keep refs updated for async Firebase callbacks
  const currentUserRef = useRef<User | null>(currentUser);
  currentUserRef.current = currentUser;
  const verifiedEmailsRef = useRef<string[]>(verifiedTeacherEmails);
  verifiedEmailsRef.current = verifiedTeacherEmails;

  const isFirebaseAdmin = Boolean(
    firebaseUser &&
      firebaseUser.emailVerified &&
      firebaseUser.email?.trim().toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
  );

  // 1. Firebase Auth State Listener & User Profile Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        const cur = currentUserRef.current;
        if (cur && cur.role !== 'admin') {
          setCurrentUser(null);
          setOrders([]);
          setEnrolledCourses([]);
        }
        return;
      }

      const normEmail = (fbUser.email || '').trim().toLowerCase();
      const isFbAdmin = Boolean(
        fbUser.emailVerified && normEmail === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
      );

      if (currentUserRef.current?.role === 'admin' && isFbAdmin) {
        setCurrentUser({
          ...currentUserRef.current,
          id: fbUser.uid,
          email: normEmail,
          name: fbUser.displayName || currentUserRef.current.name
        });
        return;
      }

      try {
        const overrides = pendingSignupOverridesRef.current || undefined;
        pendingSignupOverridesRef.current = null;
        const synced = await syncUserProfileOnAuth(fbUser, overrides);
        const isTeacher = verifiedEmailsRef.current.includes(normEmail);
        setCurrentUser({
          ...synced.user,
          role: isTeacher ? 'teacher' : 'student'
        });
        setEnrolledCourses(synced.enrolledCourses);
      } catch (err) {
        console.error('Failed to sync Firebase user profile:', err);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Listeners: Courses
  useEffect(() => {
    const mergeCourses = (prev: Course[], cloudList: Course[]): Course[] => {
      if (cloudList.length === 0) return prev;
      const cloudMap = new Map(cloudList.map((c) => [c.id, c]));
      const updatedExisting = prev.map((c) => cloudMap.get(c.id) || c);
      const existingIds = new Set(prev.map((c) => c.id));
      const newFromCloud = cloudList.filter((c) => !existingIds.has(c.id));
      return [...newFromCloud, ...updatedExisting];
    };

    const unsubMain = isFirebaseAdmin
      ? subscribeAllCoursesForAdmin((cloudCourses) => {
          setCourses((prev) => mergeCourses(prev, cloudCourses));
        })
      : subscribePublicCourses((cloudCourses) => {
          setCourses((prev) => mergeCourses(prev, cloudCourses));
        });

    let unsubOwn: (() => void) | undefined;
    let cancelled = false;
    const normEmail = (firebaseUser?.email || '').trim().toLowerCase();
    if (!isFirebaseAdmin && firebaseUser?.emailVerified && firebaseUser?.uid && normEmail) {
      checkTeacherVerifiedInCloud(normEmail).then((existsInCloud) => {
        if (!cancelled && existsInCloud && firebaseUser.uid) {
          unsubOwn = subscribeTeacherOwnCourses(firebaseUser.uid, (ownCourses) => {
            setCourses((prev) => mergeCourses(prev, ownCourses));
          });
        }
      });
    }

    return () => {
      cancelled = true;
      unsubMain();
      if (unsubOwn) unsubOwn();
    };
  }, [isFirebaseAdmin, firebaseUser?.uid, firebaseUser?.emailVerified, firebaseUser?.email, authRefreshTick]);

  // 3. Real-time Firestore Listeners: Verified Teachers & Profiles
  useEffect(() => {
    if (isFirebaseAdmin) {
      return subscribeAllVerifiedTeachersForAdmin((cloudProfiles, cloudVerifiedEmails) => {
        if (cloudProfiles.length === 0) return;
        const cloudByEmail = new Map(
          cloudProfiles.map((p) => [p.email.trim().toLowerCase(), p])
        );
        setTeacherProfiles((prev) => {
          const updated = prev.map((p) => cloudByEmail.get(p.email.trim().toLowerCase()) || p);
          const prevEmails = new Set(prev.map((p) => p.email.trim().toLowerCase()));
          const added = cloudProfiles.filter(
            (cp) => !prevEmails.has(cp.email.trim().toLowerCase())
          );
          return [...added, ...updated];
        });
        const cloudVerifiedSet = new Set(cloudVerifiedEmails);
        setVerifiedTeacherEmails((prev) => {
          const filtered = prev.filter((em) => {
            const norm = em.trim().toLowerCase();
            return !cloudByEmail.has(norm) || cloudVerifiedSet.has(norm);
          });
          const existingSet = new Set(filtered.map((e) => e.trim().toLowerCase()));
          const newVerified = cloudVerifiedEmails.filter((e) => !existingSet.has(e));
          return [...newVerified, ...filtered];
        });
      });
    }

    return subscribePublicVerifiedTeachers((cloudPublicProfiles) => {
      if (cloudPublicProfiles.length === 0) return;
      const cloudByEmail = new Map(
        cloudPublicProfiles.map((p) => [p.email.trim().toLowerCase(), p])
      );
      setTeacherProfiles((prev) => {
        const updated = prev.map((p) => cloudByEmail.get(p.email.trim().toLowerCase()) || p);
        const prevEmails = new Set(prev.map((p) => p.email.trim().toLowerCase()));
        const added = cloudPublicProfiles.filter(
          (cp) => !prevEmails.has(cp.email.trim().toLowerCase())
        );
        return [...added, ...updated];
      });
      setVerifiedTeacherEmails((prev) => {
        const existingSet = new Set(prev.map((e) => e.trim().toLowerCase()));
        const newVerified = cloudPublicProfiles
          .map((p) => p.email.trim().toLowerCase())
          .filter((em) => em && !existingSet.has(em));
        return newVerified.length > 0 ? [...newVerified, ...prev] : prev;
      });
    });
  }, [isFirebaseAdmin]);

  // 4. Real-time Firestore Listeners: Orders & Teacher Requests
  useEffect(() => {
    if (!firebaseUser?.uid) return;
    return subscribeUserOrders(firebaseUser.uid, (cloudOrders) => {
      setOrders(cloudOrders);
    });
  }, [firebaseUser?.uid]);

  useEffect(() => {
    const mergeRequests = (prev: TeacherAccessRequest[], cloudReqs: TeacherAccessRequest[]) => {
      if (cloudReqs.length === 0) return prev;
      const cloudMap = new Map(cloudReqs.map((r) => [r.id, r]));
      const updated = prev.map((r) => cloudMap.get(r.id) || r);
      const prevIds = new Set(prev.map((r) => r.id));
      const added = cloudReqs.filter((r) => !prevIds.has(r.id));
      return [...added, ...updated];
    };

    if (isFirebaseAdmin) {
      return subscribeAllTeacherRequestsForAdmin((cloudReqs) => {
        setTeacherRequests((prev) => mergeRequests(prev, cloudReqs));
      });
    }
    if (firebaseUser?.uid) {
      return subscribeTeacherRequestsForUser(firebaseUser.uid, (cloudReqs) => {
        setTeacherRequests((prev) => mergeRequests(prev, cloudReqs));
      });
    }
  }, [isFirebaseAdmin, firebaseUser?.uid]);

  // 5. Real-time Firestore Listeners: News, Reviews, Queries, Live Sessions & CMS SiteContent
  useEffect(() => {
    return subscribePublicNews((cloudNews) => {
      if (cloudNews.length === 0) return;
      setNews((prev) => {
        const cloudMap = new Map(cloudNews.map((n) => [n.id, n]));
        const updated = prev.map((n) => cloudMap.get(n.id) || n);
        const existingIds = new Set(prev.map((n) => n.id));
        const added = cloudNews.filter((n) => !existingIds.has(n.id));
        return [...added, ...updated];
      });
    });
  }, []);

  useEffect(() => {
    return subscribeCourseReviews((cloudReviews) => {
      if (cloudReviews.length === 0) return;
      setReviews((prev) => {
        const cloudMap = new Map(cloudReviews.map((r) => [r.id, r]));
        const updated = prev.map((r) => cloudMap.get(r.id) || r);
        const existingIds = new Set(prev.map((r) => r.id));
        const added = cloudReviews.filter((r) => !existingIds.has(r.id));
        return [...added, ...updated];
      });
    });
  }, []);

  useEffect(() => {
    if (!isFirebaseAdmin) return;
    return subscribeAllQueriesForAdmin((cloudQueries) => {
      if (cloudQueries.length === 0) return;
      setQueries((prev) => {
        const cloudMap = new Map(cloudQueries.map((q) => [q.id, q]));
        const updated = prev.map((q) => cloudMap.get(q.id) || q);
        const existingIds = new Set(prev.map((q) => q.id));
        const added = cloudQueries.filter((q) => !existingIds.has(q.id));
        return [...added, ...updated];
      });
    });
  }, [isFirebaseAdmin]);

  useEffect(() => {
    const mergeSessions = (prev: LiveSession[], cloudList: LiveSession[]) => {
      if (cloudList.length === 0) return prev;
      const cloudMap = new Map(cloudList.map((s) => [s.id, s]));
      const updated = prev.map((s) => cloudMap.get(s.id) || s);
      const existingIds = new Set(prev.map((s) => s.id));
      const added = cloudList.filter((s) => !existingIds.has(s.id));
      return [...added, ...updated];
    };

    const isCloudTeacher = Boolean(
      firebaseUser?.emailVerified &&
        verifiedTeacherEmails.includes((firebaseUser.email || '').trim().toLowerCase())
    );

    if (isFirebaseAdmin || isCloudTeacher) {
      return subscribeAllLiveSessionsForAdmin((cloudList) => {
        setLiveSessions((prev) => mergeSessions(prev, cloudList));
      });
    }
    return subscribePublishedLiveSessions((cloudList) => {
      setLiveSessions((prev) => mergeSessions(prev, cloudList));
    });
  }, [isFirebaseAdmin, firebaseUser?.emailVerified, firebaseUser?.email, verifiedTeacherEmails]);

  useEffect(() => {
    return subscribeSiteContent((cloudPatch) => {
      setSiteContent((prev) => ({ ...prev, ...cloudPatch }));
    });
  }, []);

  // Firebase Auth Action Handlers
  const handleFirebaseEmailLogin = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    showToast(`Signed in as ${email.trim()}`);
  };

  const handleFirebaseEmailSignUp = async (data: {
    name: string;
    college: string;
    email: string;
    password: string;
  }) => {
    pendingSignupOverridesRef.current = {
      name: data.name.trim(),
      college: data.college.trim()
    };
    const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
    await updateProfile(cred.user, { displayName: data.name.trim() }).catch(() => {});
    const synced = await syncUserProfileOnAuth(cred.user, {
      name: data.name.trim(),
      college: data.college.trim()
    });
    const normEmail = (cred.user.email || data.email).trim().toLowerCase();
    const isTeacher = verifiedEmailsRef.current.includes(normEmail);
    setCurrentUser({
      ...synced.user,
      role: isTeacher ? 'teacher' : 'student'
    });
    setEnrolledCourses(synced.enrolledCourses);
    sendEmailVerification(cred.user).catch((err) => {
      console.warn('Email verification send skipped:', err);
    });
    showToast(`Account created! Welcome, ${data.name.trim()}.`);
  };

  const handleFirebaseGoogleSignIn = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    showToast(`Signed in with Google (${cred.user.email})`);
  };

  const handleFirebasePasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const handleResendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
  };

  const handleRefreshVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    setAuthRefreshTick((t) => t + 1);
    setFirebaseUser(auth.currentUser);
    return Boolean(auth.currentUser.emailVerified);
  };

  const handleLogout = () => {
    if (auth.currentUser) {
      signOut(auth).catch((e) => console.error('Sign out error:', e));
    }
    setCurrentUser(null);
    setOrders([]);
    setEnrolledCourses([]);
    localStorage.removeItem('tttt_user');
    showToast('Signed out.');
  };

  // Site Content CMS handlers
  const handleSaveSiteContent = (newContent: SiteContent) => {
    setSiteContent(newContent);
    if (isFirebaseAdmin) {
      saveSiteContentToCloud(newContent).catch((err) => {
        console.error('Failed to sync CMS content to Firestore:', err);
        showToast('Saved locally. Sign in as Cloud Admin to sync CMS to Firestore.', 'info');
      });
    }
    showToast('Page content saved and updated live!');
  };

  const handleResetSiteContent = () => {
    setSiteContent(INITIAL_SITE_CONTENT);
    localStorage.removeItem('tttt_site_content');
    if (isFirebaseAdmin) {
      saveSiteContentToCloud(INITIAL_SITE_CONTENT).catch((err) =>
        console.error('Failed to reset CMS content in Firestore:', err)
      );
    }
    showToast('All page content restored to factory defaults.');
  };

  // Cart operations
  const handleAddToCart = (course: Course) => {
    if (cart.some((item) => item.course.id === course.id)) {
      // already in cart, navigate to cart
      setCurrentPage('cart');
      return;
    }
    setCart((prev) => [...prev, { course, addedAt: new Date().toISOString() }]);
  };

  const handleRemoveFromCart = (courseId: string) => {
    setCart((prev) => prev.filter((item) => item.course.id !== courseId));
  };

  const isInCart = (courseId: string) => {
    return cart.some((item) => item.course.id === courseId);
  };

  // Direct Buy: Add to cart and open Razorpay directly
  const handleDirectBuy = (course: Course) => {
    if (!cart.some((item) => item.course.id === course.id)) {
      setCart((prev) => [...prev, { course, addedAt: new Date().toISOString() }]);
    }
    setSelectedCourseForModal(null);
    setCurrentPage('cart');
    setIsRazorpayOpen(true);
  };

  // Open Checkout from Cart
  const handleOpenCheckout = (discountAmount: number) => {
    setCheckoutDiscount(discountAmount);
    setIsRazorpayOpen(true);
  };

  // Handle successful payment in Razorpay
  const handlePaymentSuccess = async (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Automatically enroll in all purchased courses
    const newEnrolled: EnrolledCourse[] = newOrder.items.map((item) => ({
      courseId: item.id,
      enrolledAt: new Date().toISOString(),
      progressPercent: 0,
      lastAccessedModule: 'Module 1: Foundations & Core Formulas',
      completedModules: [],
      notesDownloaded: true
    }));

    const existingIds = new Set(enrolledCourses.map((e) => e.courseId));
    const fresh = newEnrolled.filter((e) => !existingIds.has(e.courseId));
    const updatedEnrolled = [...fresh, ...enrolledCourses];
    setEnrolledCourses(updatedEnrolled);

    // Sync order & enrolled courses to Cloud Firestore when signed in via Firebase
    if (firebaseUser?.uid) {
      try {
        await Promise.all([
          saveOrderToCloud(firebaseUser.uid, newOrder),
          updateUserEnrolledCoursesInCloud(firebaseUser.uid, updatedEnrolled)
        ]);
      } catch (err) {
        console.error('Failed to sync order/enrollment to Firestore:', err);
        showToast('Enrolled locally — cloud sync will retry when online.', 'info');
      }
    }

    // Clear cart
    setCart([]);
    setPendingPromoCode(null);

    // If no student is logged in, auto-login student locally
    if (!currentUser || (currentUser.role !== 'student' && currentUser.role !== 'teacher')) {
      const studentUser: User = {
        id: `usr_${Date.now().toString().slice(-4)}`,
        name: 'Student Cadet',
        email: newOrder.studentEmail,
        role: 'student',
        college: 'Engineering University',
        semester: 'Active Semester',
        targetSgpa: 9.2,
        weeklyStudyHours: [2.5, 3.5, 1.5, 4.0, 2.0, 5.0, 3.0]
      };
      setCurrentUser(studentUser);
    }

    showToast(`Order ${newOrder.id} confirmed! Enrolled courses unlocked.`);
  };

  // Student progress, module completion & goal updaters
  const handleUpdateProgress = (courseId: string, newProgress: number) => {
    const updated = enrolledCourses.map((e) =>
      e.courseId === courseId ? { ...e, progressPercent: newProgress } : e
    );
    setEnrolledCourses(updated);
    if (firebaseUser?.uid) {
      updateUserEnrolledCoursesInCloud(firebaseUser.uid, updated).catch((err) =>
        console.error('Failed to sync course progress to Firestore:', err)
      );
    }
  };

  const handleToggleModuleCompletion = (
    courseId: string,
    moduleId: string,
    moduleTitle: string,
    totalModules: number
  ) => {
    const updated = enrolledCourses.map((enr) => {
      if (enr.courseId !== courseId) return enr;
      const existing = Array.isArray(enr.completedModules) ? enr.completedModules : [];
      const isDone = existing.includes(moduleId);
      const nextCompleted = isDone
        ? existing.filter((id) => id !== moduleId)
        : [...existing, moduleId];
      const nextPercent = Math.min(
        100,
        Math.round((nextCompleted.length / Math.max(1, totalModules)) * 100)
      );
      return {
        ...enr,
        completedModules: nextCompleted,
        progressPercent: nextPercent,
        lastAccessedModule: moduleTitle
      };
    });
    setEnrolledCourses(updated);
    if (firebaseUser?.uid) {
      updateUserEnrolledCoursesInCloud(firebaseUser.uid, updated).catch((err) =>
        console.error('Failed to sync module progress to Firestore:', err)
      );
    }
    const matched = updated.find((u) => u.courseId === courseId);
    showToast(`Progress updated: ${matched?.progressPercent ?? 0}%`, 'success');
  };

  const handleMarkNotesDownloaded = (courseId: string) => {
    const updated = enrolledCourses.map((e) =>
      e.courseId === courseId ? { ...e, notesDownloaded: true } : e
    );
    setEnrolledCourses(updated);
    if (firebaseUser?.uid) {
      updateUserEnrolledCoursesInCloud(firebaseUser.uid, updated).catch((err) =>
        console.error('Failed to sync download flag to Firestore:', err)
      );
    }
  };

  const handleUpdateProfileAndGoals = async (patch: {
    name: string;
    college: string;
    semester: string;
    department: string;
    targetSgpa: number;
  }) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      ...patch
    });
    if (firebaseUser?.uid) {
      await updateUserProfileAndGoalsInCloud(firebaseUser.uid, patch);
    }
  };

  const handleUpdateStudyHours = async (hours: number[]) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      weeklyStudyHours: hours
    });
    if (firebaseUser?.uid) {
      updateUserProfileAndGoalsInCloud(firebaseUser.uid, { weeklyStudyHours: hours }).catch((err) =>
        console.error('Failed to sync study hours to Firestore:', err)
      );
    }
  };

  // Add or update review and recalculate course rating without stale closure
  const handleAddReview = (newReview: CourseReview) => {
    let nextReviewsSnapshot: CourseReview[] = [];
    setReviews((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.courseId === newReview.courseId && r.studentId === newReview.studentId
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newReview;
        nextReviewsSnapshot = copy;
        return copy;
      }
      nextReviewsSnapshot = [newReview, ...prev];
      return nextReviewsSnapshot;
    });

    if (firebaseUser?.uid) {
      saveCourseReviewToCloud(newReview).catch((err) =>
        console.error('Failed to sync review to Firestore:', err)
      );
    }

    // Update course average rating and review count using fresh nextReviewsSnapshot
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id !== newReview.courseId) return c;
        const courseRevs = nextReviewsSnapshot.filter((r) => r.courseId === c.id);
        const avgRating =
          courseRevs.length > 0
            ? Number(
                (courseRevs.reduce((sum, r) => sum + r.rating, 0) / courseRevs.length).toFixed(1)
              )
            : newReview.rating;
        const updatedCourse: Course = {
          ...c,
          rating: avgRating,
          reviewsCount: Math.max(c.reviewsCount, courseRevs.length)
        };
        if (selectedCourseForModal?.id === c.id) {
          setSelectedCourseForModal(updatedCourse);
        }
        return updatedCourse;
      })
    );
    showToast('Review published! Thank you for sharing your exam outcome.', 'success');
  };

  const handleVoteHelpful = (reviewId: string) => {
    const voterKey = currentUser?.id || 'guest_visitor';
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const voters = r.helpfulVoterIds || [];
        if (voters.includes(voterKey)) return r;
        return {
          ...r,
          helpfulCount: r.helpfulCount + 1,
          helpfulVoterIds: [...voters, voterKey]
        };
      })
    );
    if (firebaseUser?.uid) {
      voteReviewHelpfulInCloud(reviewId, firebaseUser.uid).catch((err) =>
        console.error('Failed to sync helpful vote to Firestore:', err)
      );
    }
  };

  // Cloud permissions check for faculty/admin content
  const canWriteCoursesToCloud = Boolean(
    isFirebaseAdmin ||
      (firebaseUser?.emailVerified &&
        verifiedTeacherEmails.includes((firebaseUser.email || '').trim().toLowerCase()))
  );

  // News management handlers
  const handleSaveNews = (newsItem: DailyNewsItem) => {
    setNews((prev) => {
      const existingIdx = prev.findIndex((n) => n.id === newsItem.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newsItem;
        return copy;
      }
      return [newsItem, ...prev];
    });
    if (canWriteCoursesToCloud) {
      saveNewsToCloud(newsItem).catch((err) =>
        console.error('Failed to sync news article to Firestore:', err)
      );
    }
    showToast(`News article saved: "${newsItem.title}"`);
  };

  const handleDeleteNews = (newsId: string) => {
    setNews((prev) => prev.filter((n) => n.id !== newsId));
    if (canWriteCoursesToCloud) {
      deleteNewsFromCloud(newsId).catch((err) =>
        console.error('Failed to delete news article in Firestore:', err)
      );
    }
    showToast('News article deleted.');
  };

  // Live Doubt Sessions handlers
  const handleSaveLiveSession = async (session: LiveSession) => {
    setLiveSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === session.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = session;
        return copy;
      }
      return [session, ...prev];
    });
    if (canWriteCoursesToCloud) {
      await saveLiveSessionToCloud(session).catch((err) =>
        console.error('Failed to save live session to Firestore:', err)
      );
    }
    showToast(`Live session saved: "${session.title}"`);
  };

  const handleDeleteLiveSession = (sessionId: string) => {
    setLiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (canWriteCoursesToCloud) {
      deleteLiveSessionFromCloud(sessionId).catch((err) =>
        console.error('Failed to delete live session in Firestore:', err)
      );
    }
    showToast('Live session removed.');
  };

  // General course creation/editing from modals
  const handleSaveCourse = (courseData: Course) => {
    setCourses((prev) => {
      const existingIdx = prev.findIndex((c) => c.id === courseData.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = courseData;
        return copy;
      }
      return [courseData, ...prev];
    });
    if (canWriteCoursesToCloud) {
      saveCourseToCloud(courseData, firebaseUser?.uid).catch((err) =>
        console.error('Failed to save course to Firestore:', err)
      );
    }
    showToast(`Course saved: "${courseData.title}"`);
  };

  // Teacher portal operations
  const handleCreateCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    if (canWriteCoursesToCloud) {
      saveCourseToCloud(newCourse, firebaseUser?.uid).catch((err) =>
        console.error('Failed to publish course to Firestore:', err)
      );
    }
    showToast(`Course published: "${newCourse.title}"`);
  };

  const handleUpdateCourse = (updated: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (canWriteCoursesToCloud) {
      saveCourseToCloud(updated, firebaseUser?.uid).catch((err) =>
        console.error('Failed to update course in Firestore:', err)
      );
    }
    showToast(`Course updated: "${updated.title}"`);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    if (canWriteCoursesToCloud) {
      deleteCourseFromCloud(courseId).catch((err) =>
        console.error('Failed to delete course from Firestore:', err)
      );
    }
    showToast('Course removed.');
  };

  const handleToggleApproval = (courseId: string) => {
    const target = courses.find((c) => c.id === courseId);
    if (!target) return;
    const toggled: Course = { ...target, isApproved: !target.isApproved };
    setCourses((prev) => prev.map((c) => (c.id === courseId ? toggled : c)));
    if (canWriteCoursesToCloud) {
      saveCourseToCloud(toggled, firebaseUser?.uid).catch((err) =>
        console.error('Failed to update course approval in Firestore:', err)
      );
    }
  };

  // Contact query submission & management
  const handleAddQuery = async (newQuery: QuerySubmission) => {
    setQueries((prev) => [newQuery, ...prev]);
    try {
      await submitQueryToCloud(newQuery, firebaseUser?.uid);
      showToast(`Query submitted! Reference: ${newQuery.id}`);
    } catch (err) {
      console.error('Cloud query submission warning:', err);
      showToast(`Saved ticket ${newQuery.id} locally (cloud sync pending).`, 'info');
    }
  };

  const handleUpdateQueryStatus = (
    queryId: string,
    status: 'Received' | 'In Review' | 'Answered'
  ) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === queryId ? { ...q, status } : q))
    );
    if (isFirebaseAdmin) {
      updateQueryStatusInCloud(queryId, status).catch((err) =>
        console.error('Failed to update query status in Firestore:', err)
      );
    }
    showToast(`Query ${queryId} marked as ${status}`);
  };

  const handleDeleteQuery = (queryId: string) => {
    setQueries((prev) => prev.filter((q) => q.id !== queryId));
    if (isFirebaseAdmin) {
      deleteQueryFromCloud(queryId).catch((err) =>
        console.error('Failed to delete query in Firestore:', err)
      );
    }
    showToast(`Query ${queryId} removed.`);
  };

  // Teacher Email Verification & Request Handlers
  const normalizedUserEmail = currentUser?.email?.trim().toLowerCase() || '';
  const isVerifiedTeacher = Boolean(
    currentUser &&
      (currentUser.role === 'admin' ||
        isFirebaseAdmin ||
        verifiedTeacherEmails.includes(normalizedUserEmail))
  );
  const pendingTeacherRequestsCount = teacherRequests.filter((r) => r.status === 'PENDING').length;
  const currentUserTeacherRequest = normalizedUserEmail
    ? teacherRequests.find((r) => r.email.trim().toLowerCase() === normalizedUserEmail)
    : undefined;

  const handleSubmitTeacherRequest = (
    data: Omit<TeacherAccessRequest, 'id' | 'status' | 'requestedAt'>
  ): { ok: boolean; message: string } => {
    const emailNorm = data.email.trim().toLowerCase();
    if (verifiedTeacherEmails.includes(emailNorm)) {
      return {
        ok: false,
        message: `${emailNorm} is already a verified teacher email. Sign in with this email to open the Teachers Portal.`
      };
    }

    const existing = teacherRequests.find((r) => r.email.trim().toLowerCase() === emailNorm);
    if (existing && existing.status === 'PENDING') {
      return {
        ok: false,
        message: `A request for ${emailNorm} (${existing.id}) is already pending Admin approval.`
      };
    }

    const nowFormatted = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (existing && existing.status === 'REJECTED') {
      setTeacherRequests((prev) =>
        prev.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                ...data,
                email: emailNorm,
                status: 'PENDING',
                requestedAt: nowFormatted,
                approvedAt: undefined,
                approvedBy: undefined
              }
            : r
        )
      );
      showToast(`Re-submitted teacher verification request for ${emailNorm}`);
      return {
        ok: true,
        message: `Your updated verification request for ${emailNorm} has been sent to the Admin Panel.`
      };
    }

    const newReq: TeacherAccessRequest = {
      id: `TREQ-${Math.floor(1000 + Math.random() * 9000)}`,
      ...data,
      email: emailNorm,
      status: 'PENDING',
      requestedAt: nowFormatted
    };

    setTeacherRequests((prev) => [newReq, ...prev]);
    if (firebaseUser?.uid) {
      submitTeacherAccessRequestToCloud(firebaseUser.uid, newReq).catch((err) =>
        console.error('Failed to submit teacher request to Firestore:', err)
      );
    }
    showToast(`Teacher access request submitted for ${emailNorm}`);
    return {
      ok: true,
      message: `Verification request (${newReq.id}) submitted for ${emailNorm}. Teachers Portal will unlock once Admin approves it.`
    };
  };

  const upsertVerifiedTeacherProfile = (profileInput: {
    email: string;
    name: string;
    qualification: string;
    intro: string;
    photoUrl: string;
    isVisible?: boolean;
    approvedAt?: string;
  }) => {
    const emailNorm = profileInput.email.trim().toLowerCase();
    const nowFormatted = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const existing = teacherProfiles.find((p) => p.email.trim().toLowerCase() === emailNorm);
    const savedProfile: VerifiedTeacherProfile = existing
      ? {
          ...existing,
          email: emailNorm,
          name: profileInput.name,
          qualification: profileInput.qualification,
          intro: profileInput.intro,
          photoUrl: profileInput.photoUrl,
          isVisible: profileInput.isVisible ?? existing.isVisible,
          approvedAt: profileInput.approvedAt || existing.approvedAt || nowFormatted,
          updatedAt: nowFormatted
        }
      : {
          id: `TPROF-${Math.floor(1000 + Math.random() * 9000)}`,
          email: emailNorm,
          name: profileInput.name,
          qualification: profileInput.qualification,
          intro: profileInput.intro,
          photoUrl: profileInput.photoUrl,
          isVisible: profileInput.isVisible ?? true,
          approvedAt: profileInput.approvedAt || nowFormatted,
          updatedAt: nowFormatted
        };

    setTeacherProfiles((prev) => {
      const idx = prev.findIndex((p) => p.email.trim().toLowerCase() === emailNorm);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedProfile;
        return copy;
      }
      return [savedProfile, ...prev];
    });

    if (isFirebaseAdmin) {
      saveVerifiedTeacherToCloud(savedProfile, true).catch((err) =>
        console.error('Failed to sync teacher profile to Firestore:', err)
      );
    }
  };

  const handleSaveTeacherProfile = (profileData: TeacherProfileFormData) => {
    upsertVerifiedTeacherProfile(profileData);
    showToast(`Saved verified teacher profile for ${profileData.name}`);
  };

  const handleToggleTeacherProfileVisibility = (email: string) => {
    const emailNorm = email.trim().toLowerCase();
    const nowFormatted = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const target = teacherProfiles.find((p) => p.email.trim().toLowerCase() === emailNorm);
    if (!target) return;
    const updatedProfile: VerifiedTeacherProfile = {
      ...target,
      isVisible: !target.isVisible,
      updatedAt: nowFormatted
    };

    setTeacherProfiles((prev) =>
      prev.map((p) => (p.email.trim().toLowerCase() === emailNorm ? updatedProfile : p))
    );

    if (isFirebaseAdmin) {
      const stillVerified = verifiedTeacherEmails.includes(emailNorm);
      saveVerifiedTeacherToCloud(updatedProfile, stillVerified).catch((err) =>
        console.error('Failed to update teacher visibility in Firestore:', err)
      );
    }
  };

  const handleApproveTeacherRequest = (
    requestId: string,
    profileOverrides?: TeacherProfileFormData
  ) => {
    const target = teacherRequests.find((r) => r.id === requestId);
    if (!target) return;

    const emailNorm = target.email.trim().toLowerCase();
    const nowFormatted = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const adminApprover = currentUser?.name || 'Trust Directorate (Super Admin)';

    setTeacherRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              approvedAt: nowFormatted,
              approvedBy: adminApprover
            }
          : r
      )
    );

    setVerifiedTeacherEmails((prev) => (prev.includes(emailNorm) ? prev : [emailNorm, ...prev]));

    // Automatically create or update verified teacher profile upon approval
    const qualParts = [target.department, target.college, target.experienceYears].filter(Boolean);
    upsertVerifiedTeacherProfile({
      email: emailNorm,
      name: profileOverrides?.name || target.name || 'Verified Faculty',
      qualification:
        profileOverrides?.qualification || qualParts.join(' · ') || 'Verified University Educator',
      intro:
        profileOverrides?.intro ||
        target.notes ||
        (target.subjectsTaught
          ? `University educator specializing in ${target.subjectsTaught}.`
          : `Verified faculty member at ${target.college || 'Partner University'}.`),
      photoUrl: profileOverrides?.photoUrl ?? '',
      isVisible: profileOverrides?.isVisible ?? true,
      approvedAt: nowFormatted
    });

    if (isFirebaseAdmin) {
      updateTeacherAccessRequestInCloud(requestId, {
        status: 'APPROVED',
        approvedAt: nowFormatted,
        approvedBy: adminApprover
      }).catch((err) => console.error('Failed to update teacher request in Firestore:', err));
    }

    if (currentUser && currentUser.email.trim().toLowerCase() === emailNorm && currentUser.role !== 'admin') {
      setCurrentUser({
        ...currentUser,
        role: 'teacher',
        department: target.department || currentUser.department
      });
    }

    showToast(`${emailNorm} approved & verified teacher profile created!`);
  };

  const handleRejectTeacherRequest = (requestId: string) => {
    const target = teacherRequests.find((r) => r.id === requestId);
    if (!target) return;
    const emailNorm = target.email.trim().toLowerCase();

    setTeacherRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED' } : r))
    );
    setVerifiedTeacherEmails((prev) => prev.filter((e) => e !== emailNorm));

    if (isFirebaseAdmin) {
      updateTeacherAccessRequestInCloud(requestId, { status: 'REJECTED' }).catch((err) =>
        console.error('Failed to reject request in Firestore:', err)
      );
      const profile = teacherProfiles.find((p) => p.email.trim().toLowerCase() === emailNorm);
      if (profile) {
        saveVerifiedTeacherToCloud({ ...profile, isVisible: false }, false).catch((err) =>
          console.error('Failed to revoke teacher in Firestore:', err)
        );
      }
    }

    if (currentUser && currentUser.email.trim().toLowerCase() === emailNorm && currentUser.role === 'teacher') {
      setCurrentUser({ ...currentUser, role: 'student' });
    }
    showToast(`Request for ${emailNorm} rejected. Profile hidden from public directory.`);
  };

  const handleRevokeTeacherEmail = (email: string) => {
    const emailNorm = email.trim().toLowerCase();
    setVerifiedTeacherEmails((prev) => prev.filter((e) => e !== emailNorm));
    setTeacherRequests((prev) =>
      prev.map((r) =>
        r.email.trim().toLowerCase() === emailNorm && r.status === 'APPROVED'
          ? { ...r, status: 'REJECTED' }
          : r
      )
    );

    if (isFirebaseAdmin) {
      const profile = teacherProfiles.find((p) => p.email.trim().toLowerCase() === emailNorm);
      if (profile) {
        saveVerifiedTeacherToCloud({ ...profile, isVisible: false }, false).catch((err) =>
          console.error('Failed to revoke teacher profile in Firestore:', err)
        );
      }
      teacherRequests
        .filter((r) => r.email.trim().toLowerCase() === emailNorm && r.status === 'APPROVED')
        .forEach((r) => {
          updateTeacherAccessRequestInCloud(r.id, { status: 'REJECTED' }).catch((err) =>
            console.error('Failed to reject teacher request on revoke:', err)
          );
        });
    }

    if (currentUser && currentUser.email.trim().toLowerCase() === emailNorm && currentUser.role === 'teacher') {
      setCurrentUser({ ...currentUser, role: 'student' });
    }
    showToast(`Revoked teacher access & hid public profile for ${emailNorm}`);
  };

  const handleAddVerifiedTeacherEmail = (data: {
    email: string;
    name: string;
    college: string;
    department: string;
    qualification?: string;
    intro?: string;
    photoUrl?: string;
    isVisible?: boolean;
  }): { ok: boolean; message: string } => {
    const emailNorm = data.email.trim().toLowerCase();
    if (!emailNorm || !emailNorm.includes('@')) {
      return { ok: false, message: 'Please enter a valid email address.' };
    }

    const nowFormatted = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const adminApprover = currentUser?.name || 'Trust Directorate (Super Admin)';

    setVerifiedTeacherEmails((prev) => (prev.includes(emailNorm) ? prev : [emailNorm, ...prev]));

    const existingReq = teacherRequests.find((r) => r.email.trim().toLowerCase() === emailNorm);
    setTeacherRequests((prev) => {
      if (existingReq) {
        return prev.map((r) =>
          r.id === existingReq.id
            ? {
                ...r,
                name: data.name || r.name,
                status: 'APPROVED',
                approvedAt: nowFormatted,
                approvedBy: adminApprover
              }
            : r
        );
      }
      const newApproved: TeacherAccessRequest = {
        id: `TREQ-${Math.floor(1000 + Math.random() * 9000)}`,
        email: emailNorm,
        name: data.name,
        college: data.college,
        department: data.department,
        status: 'APPROVED',
        requestedAt: nowFormatted,
        approvedAt: nowFormatted,
        approvedBy: adminApprover,
        notes: data.intro || 'Directly verified by Trust Admin.'
      };
      return [newApproved, ...prev];
    });

    if (isFirebaseAdmin && existingReq) {
      updateTeacherAccessRequestInCloud(existingReq.id, {
        name: data.name || existingReq.name,
        status: 'APPROVED',
        approvedAt: nowFormatted,
        approvedBy: adminApprover
      }).catch((err) => console.error('Failed to sync teacher request:', err));
    }

    // Automatically create or update verified teacher profile
    upsertVerifiedTeacherProfile({
      email: emailNorm,
      name: data.name || 'Verified Faculty',
      qualification: data.qualification || `${data.department} · ${data.college}`,
      intro:
        data.intro ||
        `Verified educator in ${data.department} (${data.college}), mentoring university students across core engineering subjects.`,
      photoUrl: data.photoUrl ?? '',
      isVisible: data.isVisible ?? true,
      approvedAt: nowFormatted
    });

    if (currentUser && currentUser.email.trim().toLowerCase() === emailNorm && currentUser.role !== 'admin') {
      setCurrentUser({ ...currentUser, role: 'teacher', department: data.department });
    }

    return { ok: true, message: `${emailNorm} verified and profile published to Teachers page.` };
  };

  const handleDeleteTeacherRequest = (requestId: string) => {
    setTeacherRequests((prev) => prev.filter((r) => r.id !== requestId));
    if (isFirebaseAdmin) {
      deleteTeacherAccessRequestFromCloud(requestId).catch((err) =>
        console.error('Failed to delete teacher request in Firestore:', err)
      );
    }
  };

  const handleSyncCatalogToCloud = async (): Promise<{
    coursesCount: number;
    teachersCount: number;
    newsCount: number;
    liveSessionsCount: number;
    reviewsCount: number;
  }> => {
    if (!isFirebaseAdmin) {
      throw new Error('Sign in with Admin Google account first to sync to Firestore.');
    }
    const verifiedSet = new Set(verifiedTeacherEmails.map((em) => em.trim().toLowerCase()));
    await Promise.all([
      ...courses.map((course) => saveCourseToCloud(course, firebaseUser?.uid)),
      ...teacherProfiles.map((profile) =>
        saveVerifiedTeacherToCloud(profile, verifiedSet.has(profile.email.trim().toLowerCase()))
      ),
      ...news.map((item) => saveNewsToCloud(item)),
      ...liveSessions.map((sess) => saveLiveSessionToCloud(sess)),
      ...reviews.map((rev) => saveCourseReviewToCloud(rev)),
      saveSiteContentToCloud(siteContent)
    ]);
    return {
      coursesCount: courses.length,
      teachersCount: teacherProfiles.length,
      newsCount: news.length,
      liveSessionsCount: liveSessions.length,
      reviewsCount: reviews.length
    };
  };

  // Build real-time notification feed from live state
  const platformNotifications: PlatformNotification[] = [
    ...liveSessions
      .filter((s) => s.isPublished && (s.status === 'LIVE' || s.status === 'UPCOMING'))
      .slice(0, 2)
      .map((s) => ({
        id: `notif-live-${s.id}`,
        title: `${s.status === 'LIVE' ? 'LIVE NOW' : 'UPCOMING'}: ${s.courseCode} — ${s.title}`,
        meta: `${s.hostName} · ${s.dateLabel} ${s.timeLabel}`,
        targetPage: 'student-login' as NavPage,
        isUrgent: s.status === 'LIVE'
      })),
    ...news
      .filter((n) => n.isBreaking || n.isPinned)
      .slice(0, 3)
      .map((n) => ({
        id: `notif-news-${n.id}`,
        title: n.title,
        meta: `${n.category} · ${n.date}`,
        targetPage: 'home' as NavPage,
        isUrgent: Boolean(n.isBreaking)
      })),
    ...(currentUser?.role === 'admin' || isFirebaseAdmin
      ? [
          ...(pendingTeacherRequestsCount > 0
            ? [
                {
                  id: `notif-treq-${pendingTeacherRequestsCount}`,
                  title: `${pendingTeacherRequestsCount} Faculty Verification Request(s) Pending`,
                  meta: 'Admin Action Required · Teacher Queue',
                  targetPage: 'admin-panel' as NavPage,
                  isUrgent: true
                }
              ]
            : []),
          ...(queries.filter((q) => q.status === 'Received').length > 0
            ? [
                {
                  id: `notif-qry-${queries.filter((q) => q.status === 'Received').length}`,
                  title: `${queries.filter((q) => q.status === 'Received').length} Unread Student SOS Query(s)`,
                  meta: 'Student Help Desk Inbox',
                  targetPage: 'admin-panel' as NavPage,
                  isUrgent: false
                }
              ]
            : [])
        ]
      : [])
  ];

  // Calculate cart pricing for Razorpay modal
  const cartSubtotal = cart.reduce((sum, item) => sum + item.course.price, 0);
  const cartTotal = Math.max(0, cartSubtotal - checkoutDiscount);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Sticky Navbar with notifications & verified-teacher-only Teachers Portal */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartCount={cart.length}
        currentUser={currentUser}
        isVerifiedTeacher={isVerifiedTeacher}
        pendingTeacherRequestsCount={pendingTeacherRequestsCount}
        notifications={platformNotifications}
        readNotificationIds={readNotificationIds}
        onMarkNotificationRead={(id) =>
          setReadNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
        }
        onMarkAllNotificationsRead={() =>
          setReadNotificationIds(platformNotifications.map((n) => n.id))
        }
        onLogout={handleLogout}
      />

      {/* Main Pages Router */}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <HomePage
            courses={courses}
            newsList={news}
            siteContent={siteContent}
            canManageContent={isVerifiedTeacher}
            onNavigate={setCurrentPage}
            onAddToCart={handleAddToCart}
            onSelectCourse={(course) => setSelectedCourseForModal(course)}
            isInCart={isInCart}
            onOpenArticle={(item) => setSelectedNewsForModal(item)}
            onOpenCreateNews={() => {
              setNewsToEdit(null);
              setIsNewsFormOpen(true);
            }}
            onOpenEditNews={(item) => {
              setNewsToEdit(item);
              setIsNewsFormOpen(true);
            }}
            onDeleteNews={handleDeleteNews}
            onOpenCreateCourse={() => {
              setCourseToEdit(null);
              setIsCourseFormOpen(true);
            }}
            onOpenEditCourse={(course) => {
              setCourseToEdit(course);
              setIsCourseFormOpen(true);
            }}
            onDeleteCourse={handleDeleteCourse}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage content={siteContent.about} onNavigate={setCurrentPage} />
        )}

        {currentPage === 'courses' && (
          <CoursesPage
            courses={courses}
            onAddToCart={handleAddToCart}
            onDirectBuy={handleDirectBuy}
            isInCart={isInCart}
            selectedCourseForModal={selectedCourseForModal}
            onOpenCourseModal={(course) => setSelectedCourseForModal(course)}
            onCloseCourseModal={() => setSelectedCourseForModal(null)}
            initialInstructorFilter={instructorFilter}
            onClearInstructorFilter={() => setInstructorFilter(null)}
            onNotify={(msg) => showToast(msg, 'info')}
          />
        )}

        {currentPage === 'quick-learning' && (
          <QuickLearningPage
            courses={courses}
            content={siteContent.quickLearning}
            onAddToCart={handleAddToCart}
            onDirectBuy={handleDirectBuy}
            onOpenCourseModal={(course) => setSelectedCourseForModal(course)}
            isInCart={isInCart}
          />
        )}

        {currentPage === 'teachers' && (
          <TeachersPage
            teacherProfiles={teacherProfiles}
            verifiedTeacherEmails={verifiedTeacherEmails}
            courses={courses}
            onAddToCart={handleAddToCart}
            onDirectBuy={handleDirectBuy}
            isInCart={isInCart}
            onOpenCourseModal={(course) => setSelectedCourseForModal(course)}
            selectedTeacherEmail={selectedTeacherEmail}
            onSelectTeacherEmail={setSelectedTeacherEmail}
            onNavigate={handleNavigate}
            onOpenRequestTeacherModal={() => setIsTeacherRequestModalOpen(true)}
            onNotify={(msg) => showToast(msg, 'info')}
          />
        )}

        {currentPage === 'team' && (
          <TeamPage
            content={siteContent.team}
            onNavigate={setCurrentPage}
            onOpenRequestTeacherModal={() => setIsTeacherRequestModalOpen(true)}
            onViewFacultyCourses={(teacherName) => {
              setInstructorFilter(teacherName);
              setCurrentPage('courses');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage
            content={siteContent.contact}
            currentUser={currentUser}
            onAddQuery={handleAddQuery}
            onNotify={showToast}
          />
        )}

        {currentPage === 'collabs' && (
          <CollabsPage
            content={siteContent.collabs}
            onNavigate={setCurrentPage}
            onApplyPromoAndCheckout={(code) => {
              setPendingPromoCode(code);
              setCurrentPage('cart');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNotify={(msg) => showToast(msg, 'info')}
          />
        )}

        {currentPage === 'student-login' && (
          <StudentDashboardPage
            currentUser={currentUser}
            firebaseUser={firebaseUser}
            onFirebaseEmailLogin={handleFirebaseEmailLogin}
            onFirebaseEmailSignUp={handleFirebaseEmailSignUp}
            onFirebaseGoogleSignIn={handleFirebaseGoogleSignIn}
            onFirebasePasswordReset={handleFirebasePasswordReset}
            onResendVerificationEmail={handleResendVerificationEmail}
            onRefreshVerificationStatus={handleRefreshVerificationStatus}
            onLogout={handleLogout}
            onNavigate={setCurrentPage}
            courses={courses}
            orders={orders}
            enrolledCourses={enrolledCourses}
            liveSessions={liveSessions}
            onUpdateProgress={handleUpdateProgress}
            onToggleModuleCompletion={handleToggleModuleCompletion}
            onMarkNotesDownloaded={handleMarkNotesDownloaded}
            onUpdateProfileAndGoals={handleUpdateProfileAndGoals}
            onUpdateStudyHours={handleUpdateStudyHours}
            onOpenCourseModal={(course) => setSelectedCourseForModal(course)}
            isVerifiedTeacher={isVerifiedTeacher}
            teacherRequestStatus={currentUserTeacherRequest?.status || null}
            onOpenRequestTeacherModal={() => setIsTeacherRequestModalOpen(true)}
            onNotify={showToast}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage
            cart={cart}
            onRemoveFromCart={handleRemoveFromCart}
            onNavigate={setCurrentPage}
            onOpenCheckout={handleOpenCheckout}
            initialPromoCode={pendingPromoCode}
            onClearInitialPromoCode={() => setPendingPromoCode(null)}
          />
        )}

        {currentPage === 'teacher-portal' && (
          <TeacherPortalPage
            currentUser={currentUser}
            firebaseUser={firebaseUser}
            isVerifiedTeacher={isVerifiedTeacher}
            verifiedTeacherEmails={verifiedTeacherEmails}
            teacherRequests={teacherRequests}
            onFirebaseEmailLogin={handleFirebaseEmailLogin}
            onFirebaseGoogleSignIn={handleFirebaseGoogleSignIn}
            onResendVerificationEmail={handleResendVerificationEmail}
            onRefreshVerificationStatus={handleRefreshVerificationStatus}
            onLogout={handleLogout}
            onNavigate={setCurrentPage}
            onOpenRequestTeacherModal={() => setIsTeacherRequestModalOpen(true)}
            courses={courses}
            onCreateCourse={handleCreateCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            onToggleApproval={handleToggleApproval}
            newsList={news}
            onDeleteNews={handleDeleteNews}
            onOpenCreateNews={() => {
              setNewsToEdit(null);
              setIsNewsFormOpen(true);
            }}
            onOpenEditNews={(item) => {
              setNewsToEdit(item);
              setIsNewsFormOpen(true);
            }}
            liveSessions={liveSessions}
            onSaveLiveSession={handleSaveLiveSession}
            onDeleteLiveSession={handleDeleteLiveSession}
            onNotify={showToast}
          />
        )}

        {currentPage === 'admin-panel' && (
          <AdminPanelPage
            currentUser={currentUser}
            firebaseUser={firebaseUser}
            isFirebaseAdmin={isFirebaseAdmin}
            onFirebaseGoogleSignIn={handleFirebaseGoogleSignIn}
            onSyncCatalogToCloud={handleSyncCatalogToCloud}
            onLoginAdmin={(user) => setCurrentUser(user)}
            onLogout={handleLogout}
            onNavigate={setCurrentPage}
            teacherRequests={teacherRequests}
            verifiedTeacherEmails={verifiedTeacherEmails}
            teacherProfiles={teacherProfiles}
            onApproveTeacherRequest={handleApproveTeacherRequest}
            onRejectTeacherRequest={handleRejectTeacherRequest}
            onRevokeTeacherEmail={handleRevokeTeacherEmail}
            onDeleteTeacherRequest={handleDeleteTeacherRequest}
            onAddVerifiedTeacherEmail={handleAddVerifiedTeacherEmail}
            onSaveTeacherProfile={handleSaveTeacherProfile}
            onToggleTeacherProfileVisibility={handleToggleTeacherProfileVisibility}
            courses={courses}
            onOpenCreateCourse={() => {
              setCourseToEdit(null);
              setIsCourseFormOpen(true);
            }}
            onOpenEditCourse={(course) => {
              setCourseToEdit(course);
              setIsCourseFormOpen(true);
            }}
            onDeleteCourse={handleDeleteCourse}
            onToggleApproval={handleToggleApproval}
            newsList={news}
            onDeleteNews={handleDeleteNews}
            onOpenCreateNews={() => {
              setNewsToEdit(null);
              setIsNewsFormOpen(true);
            }}
            onOpenEditNews={(item) => {
              setNewsToEdit(item);
              setIsNewsFormOpen(true);
            }}
            liveSessions={liveSessions}
            onSaveLiveSession={handleSaveLiveSession}
            onDeleteLiveSession={handleDeleteLiveSession}
            siteContent={siteContent}
            onSaveSiteContent={handleSaveSiteContent}
            onResetSiteContent={handleResetSiteContent}
            queries={queries}
            onUpdateQueryStatus={handleUpdateQueryStatus}
            onDeleteQuery={handleDeleteQuery}
            onNotify={showToast}
          />
        )}
      </main>

      {/* Razorpay Secure Payment Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => {
          setIsRazorpayOpen(false);
          if (orders.length > 0 && cart.length === 0) {
            setCurrentPage('student-login');
          }
        }}
        items={cart}
        subtotal={cartSubtotal}
        discount={checkoutDiscount}
        total={cartTotal}
        studentEmail={currentUser?.email || 'student@university.edu'}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Course Details Modal with Leave a Review & Star Ratings */}
      <CourseDetailsModal
        course={selectedCourseForModal}
        isOpen={!!selectedCourseForModal}
        onClose={() => setSelectedCourseForModal(null)}
        currentUser={currentUser}
        enrolledCourses={enrolledCourses}
        reviews={reviews}
        onAddReview={handleAddReview}
        onVoteHelpful={handleVoteHelpful}
        onUpdateProgress={handleUpdateProgress}
        onAddToCart={handleAddToCart}
        onDirectBuy={handleDirectBuy}
        isInCart={isInCart}
        onNavigateToStudentDashboard={() => setCurrentPage('student-login')}
      />

      {/* News Reader Modal */}
      <NewsArticleModal
        news={selectedNewsForModal}
        isOpen={!!selectedNewsForModal}
        canManageContent={isVerifiedTeacher}
        onClose={() => setSelectedNewsForModal(null)}
        onEdit={(item) => {
          setNewsToEdit(item);
          setIsNewsFormOpen(true);
        }}
        onDelete={handleDeleteNews}
      />

      {/* News Form Modal (Add & Edit Article) */}
      <NewsFormModal
        isOpen={isNewsFormOpen}
        onClose={() => {
          setIsNewsFormOpen(false);
          setNewsToEdit(null);
        }}
        onSave={handleSaveNews}
        initialNews={newsToEdit}
      />

      {/* Course Form Modal (Add & Edit Course) */}
      <CourseFormModal
        isOpen={isCourseFormOpen}
        onClose={() => {
          setIsCourseFormOpen(false);
          setCourseToEdit(null);
        }}
        onSave={handleSaveCourse}
        initialCourse={courseToEdit}
        verifiedTeachers={teacherProfiles.filter((p) =>
          verifiedTeacherEmails.includes(p.email.trim().toLowerCase())
        )}
      />

      {/* Teacher Email Verification Request Modal */}
      <TeacherRequestModal
        isOpen={isTeacherRequestModalOpen}
        onClose={() => setIsTeacherRequestModalOpen(false)}
        currentUser={currentUser}
        teacherRequests={teacherRequests}
        verifiedTeacherEmails={verifiedTeacherEmails}
        onSubmitRequest={handleSubmitTeacherRequest}
      />

      {/* Multi-variant Action Feedback Toast */}
      {toastState && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 max-w-md p-4 border-2 font-mono-numbers text-xs font-bold flex items-center gap-2.5 ${
            toastState.variant === 'error'
              ? 'bg-red-950 text-red-100 border-red-400 shadow-[6px_6px_0px_0px_#f87171]'
              : toastState.variant === 'info'
              ? 'bg-zinc-900 text-white border-white shadow-[6px_6px_0px_0px_#ffffff]'
              : 'bg-white text-black border-black shadow-[6px_6px_0px_0px_#000000]'
          }`}
        >
          {toastState.variant === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
          ) : toastState.variant === 'info' ? (
            <Info className="w-4 h-4 text-white shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-black shrink-0" />
          )}
          <span className="flex-1">{toastState.message}</span>
          <button
            type="button"
            onClick={() => setToastState(null)}
            aria-label="Dismiss notification"
            className="p-1 opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Footer */}
      <Footer
        content={siteContent.footer}
        onNavigate={handleNavigate}
        isVerifiedTeacher={isVerifiedTeacher}
        onOpenRequestTeacherModal={() => setIsTeacherRequestModalOpen(true)}
      />
    </div>
  );
}
