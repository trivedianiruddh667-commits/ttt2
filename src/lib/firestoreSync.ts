import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  db,
  emailToSafeDocId,
  handleFirestoreError,
  OperationType
} from './firebase';
import {
  Course,
  CourseReview,
  DailyNewsItem,
  EnrolledCourse,
  LiveSession,
  Order,
  QuerySubmission,
  TeacherAccessRequest,
  User,
  VerifiedTeacherProfile
} from '../data/db';
import { SiteContent } from '../data/siteContent';

export interface SyncedUserResult {
  user: User;
  enrolledCourses: EnrolledCourse[];
}

const sanitizeDocId = (raw: string, prefix = 'id'): string => {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned || `${prefix}_${Date.now()}`;
};

const inFlightUserSync = new Map<string, Promise<SyncedUserResult>>();

export async function syncUserProfileOnAuth(
  fbUser: FirebaseUser,
  overrides?: { name?: string; college?: string; semester?: string }
): Promise<SyncedUserResult> {
  const uid = sanitizeDocId(fbUser.uid, 'usr');
  const existingInFlight = inFlightUserSync.get(uid);
  if (existingInFlight) {
    const res = await existingInFlight;
    if (overrides?.name || overrides?.college) {
      const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (overrides.name) patch.name = overrides.name.trim().slice(0, 120);
      if (overrides.college) patch.college = overrides.college.trim().slice(0, 180);
      try {
        await updateDoc(doc(db, 'users', uid), patch);
        return {
          ...res,
          user: {
            ...res.user,
            name: overrides.name ? overrides.name.trim().slice(0, 120) : res.user.name,
            college: overrides.college ? overrides.college.trim().slice(0, 180) : res.user.college
          }
        };
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
      }
    }
    return res;
  }

  const runSync = async (): Promise<SyncedUserResult> => {
    const userPath = `users/${uid}`;
    const userRef = doc(db, 'users', uid);

    try {
      const snap = await getDoc(userRef);
      const normalizedEmail = (fbUser.email || '').trim().toLowerCase();

      if (snap.exists()) {
        const data = snap.data();
        const loadedUser: User = {
          id: uid,
          name: String(
            overrides?.name?.trim() ||
              data.name ||
              fbUser.displayName ||
              normalizedEmail.split('@')[0] ||
              'Student'
          ),
          email: String(data.email || normalizedEmail).trim().toLowerCase(),
          role: 'student',
          college: String(
            overrides?.college?.trim() || data.college || 'Engineering University'
          ),
          semester: String(data.semester || overrides?.semester || 'Active Semester'),
          department: data.department ? String(data.department) : undefined,
          targetSgpa: data.targetSgpa !== undefined ? Number(data.targetSgpa) : 9.2,
          weeklyStudyHours:
            Array.isArray(data.weeklyStudyHours) && data.weeklyStudyHours.length === 7
              ? data.weeklyStudyHours.map((n: unknown) => Number(n) || 0)
              : [2.5, 3.5, 1.5, 4.0, 2.0, 5.0, 3.0]
        };
        const enrolled: EnrolledCourse[] = Array.isArray(data.enrolledCourses)
          ? (data.enrolledCourses as EnrolledCourse[])
          : [];
        return { user: loadedUser, enrolledCourses: enrolled };
      }

      const displayName = (
        overrides?.name ||
        fbUser.displayName ||
        normalizedEmail.split('@')[0] ||
        'Student Cadet'
      ).slice(0, 120);
      const college = (overrides?.college || 'Engineering University').slice(0, 180);
      const semester = (overrides?.semester || 'Active Semester').slice(0, 80);
      const defaultHours = [2.5, 3.5, 1.5, 4.0, 2.0, 5.0, 3.0];

      const payload = {
        uid,
        name: displayName,
        email: normalizedEmail,
        college,
        semester,
        targetSgpa: 9.2,
        weeklyStudyHours: defaultHours,
        enrolledCourses: [] as EnrolledCourse[],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, payload);

      return {
        user: {
          id: uid,
          name: displayName,
          email: normalizedEmail,
          role: 'student',
          college,
          semester,
          targetSgpa: 9.2,
          weeklyStudyHours: defaultHours
        },
        enrolledCourses: []
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  };

  const promise = runSync().finally(() => {
    inFlightUserSync.delete(uid);
  });
  inFlightUserSync.set(uid, promise);
  return promise;
}

export async function updateUserEnrolledCoursesInCloud(
  uid: string,
  enrolledCourses: EnrolledCourse[]
): Promise<void> {
  const safeUid = sanitizeDocId(uid, 'usr');
  const path = `users/${safeUid}`;
  try {
    await updateDoc(doc(db, 'users', safeUid), {
      enrolledCourses: enrolledCourses.slice(0, 100),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserProfileAndGoalsInCloud(
  uid: string,
  patch: {
    name?: string;
    college?: string;
    semester?: string;
    department?: string;
    targetSgpa?: number;
    weeklyStudyHours?: number[];
  }
): Promise<void> {
  const safeUid = sanitizeDocId(uid, 'usr');
  const path = `users/${safeUid}`;
  try {
    const updatePayload: Record<string, unknown> = {
      updatedAt: serverTimestamp()
    };
    if (patch.name !== undefined) updatePayload.name = patch.name.trim().slice(0, 120);
    if (patch.college !== undefined) updatePayload.college = patch.college.trim().slice(0, 180);
    if (patch.semester !== undefined) updatePayload.semester = patch.semester.trim().slice(0, 80);
    if (patch.department !== undefined) updatePayload.department = patch.department.trim().slice(0, 120);
    if (patch.targetSgpa !== undefined) {
      updatePayload.targetSgpa = Math.min(10, Math.max(0, Number(patch.targetSgpa) || 9.0));
    }
    if (patch.weeklyStudyHours && patch.weeklyStudyHours.length === 7) {
      updatePayload.weeklyStudyHours = patch.weeklyStudyHours.map((h) =>
        Math.min(24, Math.max(0, Number(h) || 0))
      );
    }
    await updateDoc(doc(db, 'users', safeUid), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveOrderToCloud(uid: string, order: Order): Promise<void> {
  const safeUid = sanitizeDocId(uid, 'usr');
  const safeOrderId = sanitizeDocId(order.id, 'ORD');
  const path = `orders/${safeOrderId}`;
  try {
    await setDoc(doc(db, 'orders', safeOrderId), {
      id: safeOrderId,
      userId: safeUid,
      studentEmail: order.studentEmail.trim().toLowerCase().slice(0, 160),
      date: order.date.slice(0, 64),
      items: order.items.slice(0, 50),
      subtotal: Number(order.subtotal) || 0,
      discount: Number(order.discount) || 0,
      total: Number(order.total) || 0,
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId.slice(0, 128),
      status: order.status,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserOrders(
  uid: string,
  onOrders: (orders: Order[]) => void
): Unsubscribe {
  const safeUid = sanitizeDocId(uid, 'usr');
  const q = query(collection(db, 'orders'), where('userId', '==', safeUid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Order[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          date: String(data.date || ''),
          items: Array.isArray(data.items) ? data.items : [],
          subtotal: Number(data.subtotal || 0),
          discount: Number(data.discount || 0),
          total: Number(data.total || 0),
          paymentMethod: (data.paymentMethod || 'UPI') as Order['paymentMethod'],
          transactionId: String(data.transactionId || ''),
          status: (data.status || 'SUCCESS') as Order['status'],
          studentEmail: String(data.studentEmail || '')
        };
      });
      onOrders(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  );
}

export function subscribePublicCourses(onCourses: (courses: Course[]) => void): Unsubscribe {
  const q = query(collection(db, 'courses'), where('isApproved', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Course[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          title: String(data.title || ''),
          code: String(data.code || ''),
          teacher: String(data.teacher || ''),
          teacherEmail: data.teacherEmail ? String(data.teacherEmail) : undefined,
          teacherUid: data.teacherUid ? String(data.teacherUid) : undefined,
          teacherRole: String(data.teacherRole || ''),
          branch: String(data.branch || ''),
          semester: String(data.semester || ''),
          category: (data.category || 'Crash Course') as Course['category'],
          price: Number(data.price || 0),
          originalPrice: Number(data.originalPrice || 0),
          rating: Number(data.rating || 5),
          reviewsCount: Number(data.reviewsCount || 0),
          enrolledCount: Number(data.enrolledCount || 0),
          duration: String(data.duration || ''),
          modulesCount: Number(data.modulesCount || 0),
          pdfPages: data.pdfPages !== undefined ? Number(data.pdfPages) : undefined,
          description: String(data.description || ''),
          learningOutcomes: Array.isArray(data.learningOutcomes) ? data.learningOutcomes : [],
          isTrending: Boolean(data.isTrending),
          trendingRank: data.trendingRank !== undefined ? Number(data.trendingRank) : undefined,
          fastTrackMinutes:
            data.fastTrackMinutes !== undefined ? Number(data.fastTrackMinutes) : undefined,
          isApproved: Boolean(data.isApproved),
          syllabus: Array.isArray(data.syllabus) ? data.syllabus : [],
          pdfNotesUrl: data.pdfNotesUrl ? String(data.pdfNotesUrl) : undefined,
          uploadedFileName: data.uploadedFileName ? String(data.uploadedFileName) : undefined,
          notesContent: data.notesContent ? String(data.notesContent) : undefined,
          isNew: Boolean(data.isNew)
        };
      });
      onCourses(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    }
  );
}

export function subscribeTeacherOwnCourses(
  teacherUid: string,
  onCourses: (courses: Course[]) => void
): Unsubscribe {
  const safeUid = sanitizeDocId(teacherUid, 'usr');
  const q = query(collection(db, 'courses'), where('teacherUid', '==', safeUid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Course[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          title: String(data.title || ''),
          code: String(data.code || ''),
          teacher: String(data.teacher || ''),
          teacherEmail: data.teacherEmail ? String(data.teacherEmail) : undefined,
          teacherUid: data.teacherUid ? String(data.teacherUid) : undefined,
          teacherRole: String(data.teacherRole || ''),
          branch: String(data.branch || ''),
          semester: String(data.semester || ''),
          category: (data.category || 'Crash Course') as Course['category'],
          price: Number(data.price || 0),
          originalPrice: Number(data.originalPrice || 0),
          rating: Number(data.rating || 5),
          reviewsCount: Number(data.reviewsCount || 0),
          enrolledCount: Number(data.enrolledCount || 0),
          duration: String(data.duration || ''),
          modulesCount: Number(data.modulesCount || 0),
          pdfPages: data.pdfPages !== undefined ? Number(data.pdfPages) : undefined,
          description: String(data.description || ''),
          learningOutcomes: Array.isArray(data.learningOutcomes) ? data.learningOutcomes : [],
          isTrending: Boolean(data.isTrending),
          trendingRank: data.trendingRank !== undefined ? Number(data.trendingRank) : undefined,
          fastTrackMinutes:
            data.fastTrackMinutes !== undefined ? Number(data.fastTrackMinutes) : undefined,
          isApproved: Boolean(data.isApproved),
          syllabus: Array.isArray(data.syllabus) ? data.syllabus : [],
          pdfNotesUrl: data.pdfNotesUrl ? String(data.pdfNotesUrl) : undefined,
          uploadedFileName: data.uploadedFileName ? String(data.uploadedFileName) : undefined,
          notesContent: data.notesContent ? String(data.notesContent) : undefined,
          isNew: Boolean(data.isNew)
        };
      });
      onCourses(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    }
  );
}

export async function checkTeacherVerifiedInCloud(email: string): Promise<boolean> {
  const norm = email.trim().toLowerCase();
  if (!norm) return false;
  try {
    const snap = await getDoc(doc(db, 'verifiedTeachers', emailToSafeDocId(norm)));
    return snap.exists() && snap.data()?.isVerified === true;
  } catch {
    return false;
  }
}

export function subscribeAllCoursesForAdmin(onCourses: (courses: Course[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'courses'),
    (snapshot) => {
      const list: Course[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          title: String(data.title || ''),
          code: String(data.code || ''),
          teacher: String(data.teacher || ''),
          teacherEmail: data.teacherEmail ? String(data.teacherEmail) : undefined,
          teacherUid: data.teacherUid ? String(data.teacherUid) : undefined,
          teacherRole: String(data.teacherRole || ''),
          branch: String(data.branch || ''),
          semester: String(data.semester || ''),
          category: (data.category || 'Crash Course') as Course['category'],
          price: Number(data.price || 0),
          originalPrice: Number(data.originalPrice || 0),
          rating: Number(data.rating || 5),
          reviewsCount: Number(data.reviewsCount || 0),
          enrolledCount: Number(data.enrolledCount || 0),
          duration: String(data.duration || ''),
          modulesCount: Number(data.modulesCount || 0),
          pdfPages: data.pdfPages !== undefined ? Number(data.pdfPages) : undefined,
          description: String(data.description || ''),
          learningOutcomes: Array.isArray(data.learningOutcomes) ? data.learningOutcomes : [],
          isTrending: Boolean(data.isTrending),
          trendingRank: data.trendingRank !== undefined ? Number(data.trendingRank) : undefined,
          fastTrackMinutes:
            data.fastTrackMinutes !== undefined ? Number(data.fastTrackMinutes) : undefined,
          isApproved: Boolean(data.isApproved),
          syllabus: Array.isArray(data.syllabus) ? data.syllabus : [],
          pdfNotesUrl: data.pdfNotesUrl ? String(data.pdfNotesUrl) : undefined,
          uploadedFileName: data.uploadedFileName ? String(data.uploadedFileName) : undefined,
          notesContent: data.notesContent ? String(data.notesContent) : undefined,
          isNew: Boolean(data.isNew)
        };
      });
      onCourses(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    }
  );
}

export async function saveCourseToCloud(course: Course, teacherUid?: string): Promise<void> {
  const safeId = sanitizeDocId(course.id, 'course');
  const path = `courses/${safeId}`;
  const courseRef = doc(db, 'courses', safeId);

  try {
    const existingSnap = await getDoc(courseRef);
    const basePayload: Record<string, unknown> = {
      id: safeId,
      title: (course.title.trim() || 'Untitled Course').slice(0, 200),
      code: (course.code.trim() || 'CS-101').slice(0, 32),
      teacher: (course.teacher.trim() || 'Verified Faculty').slice(0, 120),
      teacherRole: (course.teacherRole || 'University Mentor').slice(0, 160),
      branch: (course.branch || 'Computer Science & IT').slice(0, 120),
      semester: (course.semester || 'Semester 4').slice(0, 64),
      category: course.category,
      price: Math.max(0, Number(course.price) || 0),
      originalPrice: Math.max(0, Number(course.originalPrice) || 0),
      rating: Math.min(5, Math.max(0, Number(course.rating) || 5)),
      reviewsCount: Math.max(0, Number(course.reviewsCount) || 0),
      enrolledCount: Math.max(0, Number(course.enrolledCount) || 0),
      duration: (course.duration || '6 Hours').slice(0, 48),
      modulesCount: Math.max(0, Number(course.modulesCount) || 0),
      description: (course.description.trim() || 'University exam crash notes and syllabus guide.').slice(0, 2000),
      learningOutcomes: (course.learningOutcomes || []).slice(0, 25),
      isApproved: Boolean(course.isApproved),
      syllabus: (course.syllabus || []).slice(0, 30),
      updatedAt: serverTimestamp()
    };

    if (course.teacherEmail) {
      basePayload.teacherEmail = course.teacherEmail.trim().toLowerCase().slice(0, 160);
    }
    const resolvedUid = teacherUid || course.teacherUid;
    if (resolvedUid) {
      basePayload.teacherUid = sanitizeDocId(resolvedUid, 'usr');
    }
    if (course.pdfPages !== undefined) {
      basePayload.pdfPages = Math.max(0, Number(course.pdfPages) || 0);
    }
    if (course.isTrending !== undefined) {
      basePayload.isTrending = Boolean(course.isTrending);
    }
    if (course.isNew !== undefined) {
      basePayload.isNew = Boolean(course.isNew);
    }
    if (course.pdfNotesUrl) {
      basePayload.pdfNotesUrl = course.pdfNotesUrl.slice(0, 500);
    }
    if (course.uploadedFileName) {
      basePayload.uploadedFileName = course.uploadedFileName.slice(0, 160);
    }
    if (course.notesContent) {
      basePayload.notesContent = course.notesContent.slice(0, 20000);
    }

    if (existingSnap.exists()) {
      basePayload.createdAt = existingSnap.data().createdAt;
      if (!basePayload.teacherUid && existingSnap.data().teacherUid) {
        basePayload.teacherUid = existingSnap.data().teacherUid;
      }
      await setDoc(courseRef, basePayload);
    } else {
      basePayload.createdAt = serverTimestamp();
      await setDoc(courseRef, basePayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCourseFromCloud(courseId: string): Promise<void> {
  const safeId = sanitizeDocId(courseId, 'course');
  const path = `courses/${safeId}`;
  try {
    await deleteDoc(doc(db, 'courses', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribePublicVerifiedTeachers(
  onProfiles: (profiles: VerifiedTeacherProfile[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'verifiedTeachers'),
    where('isVerified', '==', true),
    where('isVisible', '==', true)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const list: VerifiedTeacherProfile[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          email: String(data.email || '').trim().toLowerCase(),
          name: String(data.name || ''),
          qualification: String(data.qualification || ''),
          intro: String(data.intro || ''),
          photoUrl: String(data.photoUrl || ''),
          isVisible: Boolean(data.isVisible),
          approvedAt: data.approvedAt ? String(data.approvedAt) : undefined
        };
      });
      onProfiles(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'verifiedTeachers');
    }
  );
}

export function subscribeAllVerifiedTeachersForAdmin(
  onProfiles: (profiles: VerifiedTeacherProfile[], verifiedEmails: string[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'verifiedTeachers'),
    (snapshot) => {
      const list: VerifiedTeacherProfile[] = [];
      const emails: string[] = [];
      snapshot.docs.forEach((d) => {
        const data = d.data();
        const email = String(data.email || '').trim().toLowerCase();
        list.push({
          id: String(data.id || d.id),
          email,
          name: String(data.name || ''),
          qualification: String(data.qualification || ''),
          intro: String(data.intro || ''),
          photoUrl: String(data.photoUrl || ''),
          isVisible: Boolean(data.isVisible),
          approvedAt: data.approvedAt ? String(data.approvedAt) : undefined
        });
        if (data.isVerified === true && email) {
          emails.push(email);
        }
      });
      onProfiles(list, emails);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'verifiedTeachers');
    }
  );
}

export async function saveVerifiedTeacherToCloud(
  profile: VerifiedTeacherProfile,
  isVerified: boolean
): Promise<void> {
  const docId = emailToSafeDocId(profile.email);
  const path = `verifiedTeachers/${docId}`;
  try {
    await setDoc(doc(db, 'verifiedTeachers', docId), {
      id: docId,
      email: profile.email.trim().toLowerCase().slice(0, 160),
      name: (profile.name.trim() || 'Verified Faculty').slice(0, 120),
      qualification: (profile.qualification.trim() || 'Verified University Educator').slice(0, 240),
      intro: (profile.intro.trim() || 'Verified faculty member at Techie Teacher’s Tribe Trust.').slice(0, 1500),
      photoUrl: (profile.photoUrl || '').slice(0, 400000),
      isVisible: Boolean(profile.isVisible),
      isVerified: Boolean(isVerified),
      approvedAt: (profile.approvedAt || 'Verified').slice(0, 64),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function submitTeacherAccessRequestToCloud(
  applicantUid: string,
  req: TeacherAccessRequest
): Promise<void> {
  const safeReqId = sanitizeDocId(req.id, 'TREQ');
  const safeUid = sanitizeDocId(applicantUid, 'usr');
  const path = `teacherAccessRequests/${safeReqId}`;
  try {
    const payload: Record<string, unknown> = {
      id: safeReqId,
      applicantUid: safeUid,
      email: req.email.trim().toLowerCase().slice(0, 160),
      name: req.name.slice(0, 120),
      college: req.college.slice(0, 180),
      department: req.department.slice(0, 120),
      status: 'PENDING',
      requestedAt: req.requestedAt.slice(0, 64),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    if (req.phone) payload.phone = req.phone.slice(0, 32);
    if (req.subjectsTaught) payload.subjectsTaught = req.subjectsTaught.slice(0, 240);
    if (req.experienceYears) payload.experienceYears = req.experienceYears.slice(0, 40);
    if (req.notes) payload.notes = req.notes.slice(0, 1200);

    await setDoc(doc(db, 'teacherAccessRequests', safeReqId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTeacherAccessRequestInCloud(
  reqId: string,
  patch: {
    name?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedAt?: string;
    approvedBy?: string;
    notes?: string;
  }
): Promise<void> {
  const safeReqId = sanitizeDocId(reqId, 'TREQ');
  const path = `teacherAccessRequests/${safeReqId}`;
  try {
    const updatePayload: Record<string, unknown> = {
      status: patch.status,
      updatedAt: serverTimestamp()
    };
    if (patch.name) updatePayload.name = patch.name.slice(0, 120);
    if (patch.approvedAt) updatePayload.approvedAt = patch.approvedAt.slice(0, 64);
    if (patch.approvedBy) updatePayload.approvedBy = patch.approvedBy.slice(0, 120);
    if (patch.notes) updatePayload.notes = patch.notes.slice(0, 1200);
    await updateDoc(doc(db, 'teacherAccessRequests', safeReqId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTeacherAccessRequestFromCloud(reqId: string): Promise<void> {
  const safeReqId = sanitizeDocId(reqId, 'TREQ');
  const path = `teacherAccessRequests/${safeReqId}`;
  try {
    await deleteDoc(doc(db, 'teacherAccessRequests', safeReqId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeAllTeacherRequestsForAdmin(
  onRequests: (requests: TeacherAccessRequest[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'teacherAccessRequests'),
    (snapshot) => {
      const list: TeacherAccessRequest[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          email: String(data.email || ''),
          name: String(data.name || ''),
          phone: data.phone ? String(data.phone) : undefined,
          college: String(data.college || ''),
          department: String(data.department || ''),
          subjectsTaught: data.subjectsTaught ? String(data.subjectsTaught) : undefined,
          experienceYears: data.experienceYears ? String(data.experienceYears) : undefined,
          status: (data.status || 'PENDING') as TeacherAccessRequest['status'],
          requestedAt: String(data.requestedAt || ''),
          approvedAt: data.approvedAt ? String(data.approvedAt) : undefined,
          approvedBy: data.approvedBy ? String(data.approvedBy) : undefined,
          notes: data.notes ? String(data.notes) : undefined
        };
      });
      onRequests(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'teacherAccessRequests');
    }
  );
}

export function subscribeTeacherRequestsForUser(
  uid: string,
  onRequests: (requests: TeacherAccessRequest[]) => void
): Unsubscribe {
  const safeUid = sanitizeDocId(uid, 'usr');
  const q = query(collection(db, 'teacherAccessRequests'), where('applicantUid', '==', safeUid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: TeacherAccessRequest[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          email: String(data.email || ''),
          name: String(data.name || ''),
          phone: data.phone ? String(data.phone) : undefined,
          college: String(data.college || ''),
          department: String(data.department || ''),
          subjectsTaught: data.subjectsTaught ? String(data.subjectsTaught) : undefined,
          experienceYears: data.experienceYears ? String(data.experienceYears) : undefined,
          status: (data.status || 'PENDING') as TeacherAccessRequest['status'],
          requestedAt: String(data.requestedAt || ''),
          approvedAt: data.approvedAt ? String(data.approvedAt) : undefined,
          approvedBy: data.approvedBy ? String(data.approvedBy) : undefined,
          notes: data.notes ? String(data.notes) : undefined
        };
      });
      onRequests(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'teacherAccessRequests');
    }
  );
}

// ============================================================
// DAILY NEWS SYNC
// ============================================================

export function subscribePublicNews(onNews: (items: DailyNewsItem[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'news'),
    (snapshot) => {
      const list: DailyNewsItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          title: String(data.title || ''),
          category: (data.category || 'Exam Alert') as DailyNewsItem['category'],
          summary: String(data.summary || ''),
          content: String(data.content || ''),
          date: String(data.date || ''),
          readTime: String(data.readTime || '3 min read'),
          author: String(data.author || 'Tribe Cell'),
          authorRole: data.authorRole ? String(data.authorRole) : undefined,
          isBreaking: Boolean(data.isBreaking),
          isPinned: Boolean(data.isPinned),
          tags: Array.isArray(data.tags) ? data.tags.map((t: unknown) => String(t)) : []
        };
      });
      onNews(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'news');
    }
  );
}

export async function saveNewsToCloud(item: DailyNewsItem): Promise<void> {
  const safeId = sanitizeDocId(item.id, 'news');
  const path = `news/${safeId}`;
  const newsRef = doc(db, 'news', safeId);
  try {
    const existingSnap = await getDoc(newsRef);
    const payload: Record<string, unknown> = {
      id: safeId,
      title: item.title.trim().slice(0, 220),
      category: item.category,
      summary: item.summary.trim().slice(0, 600),
      content: item.content.trim().slice(0, 12000),
      date: (item.date || '').slice(0, 64),
      readTime: (item.readTime || '3 min read').slice(0, 32),
      author: (item.author || 'Tribe Faculty').trim().slice(0, 120),
      isBreaking: Boolean(item.isBreaking),
      isPinned: Boolean(item.isPinned),
      tags: (item.tags || []).slice(0, 20),
      updatedAt: serverTimestamp()
    };
    if (item.authorRole) {
      payload.authorRole = item.authorRole.trim().slice(0, 140);
    }
    if (existingSnap.exists()) {
      payload.createdAt = existingSnap.data().createdAt;
      await setDoc(newsRef, payload);
    } else {
      payload.createdAt = serverTimestamp();
      await setDoc(newsRef, payload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteNewsFromCloud(newsId: string): Promise<void> {
  const safeId = sanitizeDocId(newsId, 'news');
  const path = `news/${safeId}`;
  try {
    await deleteDoc(doc(db, 'news', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================
// COURSE REVIEWS SYNC
// ============================================================

export function subscribeCourseReviews(onReviews: (reviews: CourseReview[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'reviews'),
    (snapshot) => {
      const list: CourseReview[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          courseId: String(data.courseId || ''),
          studentId: String(data.studentId || ''),
          studentName: String(data.studentName || 'Student'),
          studentCollege: data.studentCollege ? String(data.studentCollege) : undefined,
          studentBranch: data.studentBranch ? String(data.studentBranch) : undefined,
          rating: Number(data.rating || 5),
          comment: String(data.comment || ''),
          gradeReceived: data.gradeReceived ? String(data.gradeReceived) : undefined,
          examType: data.examType ? String(data.examType) : undefined,
          createdAt: String(data.createdAt || ''),
          verifiedCompletion: Boolean(data.verifiedCompletion),
          helpfulCount: Number(data.helpfulCount || 0),
          helpfulVoterIds: Array.isArray(data.helpfulVoterIds)
            ? data.helpfulVoterIds.map((v: unknown) => String(v))
            : []
        };
      });
      onReviews(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
    }
  );
}

export async function saveCourseReviewToCloud(review: CourseReview): Promise<void> {
  const safeId = sanitizeDocId(review.id, 'rev');
  const path = `reviews/${safeId}`;
  const revRef = doc(db, 'reviews', safeId);
  try {
    const existingSnap = await getDoc(revRef);
    if (existingSnap.exists()) {
      const updatePayload: Record<string, unknown> = {
        rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
        comment: review.comment.trim().slice(0, 2000),
        updatedAt: serverTimestamp()
      };
      if (review.gradeReceived) {
        updatePayload.gradeReceived = review.gradeReceived.trim().slice(0, 80);
      }
      if (review.examType) {
        updatePayload.examType = review.examType.trim().slice(0, 80);
      }
      await updateDoc(revRef, updatePayload);
    } else {
      const createPayload: Record<string, unknown> = {
        id: safeId,
        courseId: sanitizeDocId(review.courseId, 'course'),
        studentId: sanitizeDocId(review.studentId, 'usr'),
        studentName: review.studentName.trim().slice(0, 120),
        rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
        comment: review.comment.trim().slice(0, 2000),
        createdAt: review.createdAt.slice(0, 64),
        verifiedCompletion: Boolean(review.verifiedCompletion),
        helpfulCount: Math.max(0, Number(review.helpfulCount) || 0),
        helpfulVoterIds: (review.helpfulVoterIds || []).slice(0, 500),
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      if (review.studentCollege) {
        createPayload.studentCollege = review.studentCollege.trim().slice(0, 180);
      }
      if (review.studentBranch) {
        createPayload.studentBranch = review.studentBranch.trim().slice(0, 120);
      }
      if (review.gradeReceived) {
        createPayload.gradeReceived = review.gradeReceived.trim().slice(0, 80);
      }
      if (review.examType) {
        createPayload.examType = review.examType.trim().slice(0, 80);
      }
      await setDoc(revRef, createPayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function voteReviewHelpfulInCloud(reviewId: string, voterUid: string): Promise<void> {
  const safeId = sanitizeDocId(reviewId, 'rev');
  const safeVoter = sanitizeDocId(voterUid, 'usr');
  const path = `reviews/${safeId}`;
  const revRef = doc(db, 'reviews', safeId);
  try {
    const snap = await getDoc(revRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const existingVoters: string[] = Array.isArray(data.helpfulVoterIds)
      ? data.helpfulVoterIds.map((v: unknown) => String(v))
      : [];
    if (existingVoters.includes(safeVoter)) return;
    await updateDoc(revRef, {
      helpfulCount: Number(data.helpfulCount || 0) + 1,
      helpfulVoterIds: [...existingVoters, safeVoter].slice(0, 500),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ============================================================
// QUERIES SYNC
// ============================================================

export async function submitQueryToCloud(
  q: QuerySubmission,
  applicantUid?: string
): Promise<void> {
  const safeId = sanitizeDocId(q.id, 'QRY');
  const path = `queries/${safeId}`;
  try {
    const payload: Record<string, unknown> = {
      id: safeId,
      studentName: q.studentName.trim().slice(0, 120),
      contactNumber: q.contactNumber.trim().slice(0, 40),
      email: q.email.trim().toLowerCase().slice(0, 160),
      query: q.query.trim().slice(0, 3000),
      timestamp: q.timestamp.slice(0, 64),
      status: 'Received',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    if (applicantUid) {
      payload.applicantUid = sanitizeDocId(applicantUid, 'usr');
    }
    await setDoc(doc(db, 'queries', safeId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeAllQueriesForAdmin(
  onQueries: (items: QuerySubmission[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'queries'),
    (snapshot) => {
      const list: QuerySubmission[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          applicantUid: data.applicantUid ? String(data.applicantUid) : undefined,
          studentName: String(data.studentName || ''),
          contactNumber: String(data.contactNumber || ''),
          email: String(data.email || ''),
          query: String(data.query || ''),
          timestamp: String(data.timestamp || ''),
          status: (data.status || 'Received') as QuerySubmission['status']
        };
      });
      onQueries(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'queries');
    }
  );
}

export async function updateQueryStatusInCloud(
  queryId: string,
  status: QuerySubmission['status']
): Promise<void> {
  const safeId = sanitizeDocId(queryId, 'QRY');
  const path = `queries/${safeId}`;
  try {
    await updateDoc(doc(db, 'queries', safeId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteQueryFromCloud(queryId: string): Promise<void> {
  const safeId = sanitizeDocId(queryId, 'QRY');
  const path = `queries/${safeId}`;
  try {
    await deleteDoc(doc(db, 'queries', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================
// LIVE SESSIONS SYNC
// ============================================================

export function subscribePublishedLiveSessions(
  onSessions: (sessions: LiveSession[]) => void
): Unsubscribe {
  const q = query(collection(db, 'liveSessions'), where('isPublished', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: LiveSession[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          title: String(data.title || ''),
          courseCode: String(data.courseCode || ''),
          hostName: String(data.hostName || ''),
          hostEmail: data.hostEmail ? String(data.hostEmail) : undefined,
          dateLabel: String(data.dateLabel || ''),
          timeLabel: String(data.timeLabel || ''),
          durationMinutes: Number(data.durationMinutes || 60),
          roomNumber: String(data.roomNumber || '101'),
          meetingUrl: data.meetingUrl ? String(data.meetingUrl) : undefined,
          agenda: data.agenda ? String(data.agenda) : undefined,
          status: (data.status || 'UPCOMING') as LiveSession['status'],
          isPublished: Boolean(data.isPublished)
        };
      });
      onSessions(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'liveSessions');
    }
  );
}

export function subscribeAllLiveSessionsForAdmin(
  onSessions: (sessions: LiveSession[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'liveSessions'),
    (snapshot) => {
      const list: LiveSession[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          title: String(data.title || ''),
          courseCode: String(data.courseCode || ''),
          hostName: String(data.hostName || ''),
          hostEmail: data.hostEmail ? String(data.hostEmail) : undefined,
          dateLabel: String(data.dateLabel || ''),
          timeLabel: String(data.timeLabel || ''),
          durationMinutes: Number(data.durationMinutes || 60),
          roomNumber: String(data.roomNumber || '101'),
          meetingUrl: data.meetingUrl ? String(data.meetingUrl) : undefined,
          agenda: data.agenda ? String(data.agenda) : undefined,
          status: (data.status || 'UPCOMING') as LiveSession['status'],
          isPublished: Boolean(data.isPublished)
        };
      });
      onSessions(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'liveSessions');
    }
  );
}

export async function saveLiveSessionToCloud(session: LiveSession): Promise<void> {
  const safeId = sanitizeDocId(session.id, 'live');
  const path = `liveSessions/${safeId}`;
  const ref = doc(db, 'liveSessions', safeId);
  try {
    const existingSnap = await getDoc(ref);
    const payload: Record<string, unknown> = {
      id: safeId,
      title: session.title.trim().slice(0, 200),
      courseCode: session.courseCode.trim().slice(0, 32),
      hostName: session.hostName.trim().slice(0, 120),
      dateLabel: session.dateLabel.trim().slice(0, 64),
      timeLabel: session.timeLabel.trim().slice(0, 64),
      durationMinutes: Math.max(5, Math.min(480, Number(session.durationMinutes) || 60)),
      roomNumber: session.roomNumber.trim().slice(0, 48),
      status: session.status,
      isPublished: Boolean(session.isPublished),
      updatedAt: serverTimestamp()
    };
    if (session.hostEmail) payload.hostEmail = session.hostEmail.trim().toLowerCase().slice(0, 160);
    if (session.meetingUrl) payload.meetingUrl = session.meetingUrl.trim().slice(0, 500);
    if (session.agenda) payload.agenda = session.agenda.trim().slice(0, 1500);

    if (existingSnap.exists()) {
      payload.createdAt = existingSnap.data().createdAt;
      await setDoc(ref, payload);
    } else {
      payload.createdAt = serverTimestamp();
      await setDoc(ref, payload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteLiveSessionFromCloud(sessionId: string): Promise<void> {
  const safeId = sanitizeDocId(sessionId, 'live');
  const path = `liveSessions/${safeId}`;
  try {
    await deleteDoc(doc(db, 'liveSessions', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================
// SITE CONTENT CMS SYNC
// ============================================================

export function subscribeSiteContent(
  onContent: (content: Partial<SiteContent>) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, 'siteContent', 'main'),
    (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.data();
        if (raw && typeof raw.data === 'object' && raw.data !== null) {
          onContent(raw.data as Partial<SiteContent>);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'siteContent/main');
    }
  );
}

export async function saveSiteContentToCloud(content: SiteContent): Promise<void> {
  const path = 'siteContent/main';
  try {
    await setDoc(doc(db, 'siteContent', 'main'), {
      id: 'main',
      data: content,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

