import { Course, CourseReview, QuerySubmission, TEACHERS_LIST, VerifiedTeacherProfile } from '../data/db';
import { SiteContent } from '../data/siteContent';

export interface QuickLearningModuleItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  baseRating: number;
  fastTrackMinutes: number;
}

export const QUICK_LEARNING_MODULES: QuickLearningModuleItem[] = [
  {
    id: 'ql-3hr',
    title: '3-Hour Complete Syllabus Overviews',
    badge: 'EXAM SOS',
    description: 'Zero waffle, strictly high-yield concepts that appear in Part B & Part C university examination questions.',
    baseRating: 4.96,
    fastTrackMinutes: 180
  },
  {
    id: 'ql-proofs',
    title: 'Handwritten Proof & Derivation Sheets',
    badge: 'TOPPER DERIVATIONS',
    description: 'Scanned 600 DPI crisp handwritten pages with color-coded key step markings and examiner marking schemes.',
    baseRating: 4.98,
    fastTrackMinutes: 120
  },
  {
    id: 'ql-matrix',
    title: '10-Year Question Trend Matrix',
    badge: 'PROBABILITY RADAR',
    description: 'Predictable repeat questions flagged with high-probability markers and university-wise frequency breakdown.',
    baseRating: 4.92,
    fastTrackMinutes: 90
  },
  {
    id: 'ql-crash',
    title: 'Exam Night Fast-Track Crash Packs',
    badge: 'LAST 48 HOURS',
    description: 'Sprint bundles designed specifically for students staring down tomorrow morning’s 09:30 AM examination.',
    baseRating: 4.95,
    fastTrackMinutes: 150
  }
];

export const normalizeRatingKey = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/^(prof\.|dr\.|er\.|mr\.|ms\.|mrs\.)\s+/i, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

export interface TeacherRatingResult {
  key: string;
  name: string;
  role: string;
  subject?: string;
  imageUrl?: string;
  baseRating: number;
  studentRatingsCount: number;
  studentAverage: number;
  finalRating: number;
  isOverridden: boolean;
  adminOverride?: number;
}

export interface CourseRatingResult {
  courseId: string;
  title: string;
  code: string;
  branch: string;
  teacher: string;
  baseRating: number;
  reviewsCount: number;
  studentRatingsCount: number;
  studentAverage: number;
  finalRating: number;
  isOverridden: boolean;
  adminOverride?: number;
}

export interface QuickLearningRatingResult {
  id: string;
  title: string;
  badge: string;
  description: string;
  baseRating: number;
  studentRatingsCount: number;
  studentAverage: number;
  finalRating: number;
  isOverridden: boolean;
  adminOverride?: number;
}

/**
 * Calculates teacher rating dynamically combining base rating, student query evaluations, and admin overrides.
 */
export function getTeacherRating(
  teacherName: string,
  queries: QuerySubmission[],
  overrides?: Record<string, number>,
  baseFallback: number = 4.92
): {
  finalRating: number;
  studentRatingsCount: number;
  studentAverage: number;
  isOverridden: boolean;
  adminOverride?: number;
} {
  const normKey = normalizeRatingKey(teacherName);
  const adminOverride = overrides?.[normKey] ?? overrides?.[teacherName];

  // Match queries by normalized targetName or targetId
  const matchingQueries = queries.filter((q) => {
    if (q.ratingCategory !== 'teacher' || typeof q.rating !== 'number' || q.rating <= 0) {
      return false;
    }
    const qKey = normalizeRatingKey(q.targetName || q.targetId || '');
    return qKey === normKey || qKey.includes(normKey) || normKey.includes(qKey);
  });

  const studentCount = matchingQueries.length;
  const studentSum = matchingQueries.reduce((acc, q) => acc + (q.rating || 0), 0);
  const studentAverage = studentCount > 0 ? Number((studentSum / studentCount).toFixed(2)) : baseFallback;

  if (typeof adminOverride === 'number' && adminOverride >= 1 && adminOverride <= 5) {
    return {
      finalRating: Number(adminOverride.toFixed(2)),
      studentRatingsCount: studentCount,
      studentAverage,
      isOverridden: true,
      adminOverride: Number(adminOverride.toFixed(2))
    };
  }

  // Blended average: base rating weighted by 3 + student ratings
  const finalRating =
    studentCount > 0
      ? Number(((baseFallback * 3 + studentSum) / (3 + studentCount)).toFixed(2))
      : Number(baseFallback.toFixed(2));

  return {
    finalRating,
    studentRatingsCount: studentCount,
    studentAverage,
    isOverridden: false
  };
}

/**
 * Calculates course rating dynamically.
 */
export function getCourseRating(
  course: Course,
  reviews: CourseReview[],
  queries: QuerySubmission[],
  overrides?: Record<string, number>
): {
  finalRating: number;
  reviewsCount: number;
  studentRatingsCount: number;
  studentAverage: number;
  isOverridden: boolean;
  adminOverride?: number;
} {
  const adminOverride = overrides?.[course.id] ?? overrides?.[course.code];

  // Matching query ratings
  const matchingQueries = queries.filter((q) => {
    if (q.ratingCategory !== 'course' || typeof q.rating !== 'number' || q.rating <= 0) {
      return false;
    }
    return q.targetId === course.id || q.targetName?.toLowerCase() === course.title.toLowerCase();
  });

  // Course reviews
  const matchingReviews = reviews.filter((r) => r.courseId === course.id);

  const totalStudentRatings = matchingQueries.length + matchingReviews.length;
  const totalStudentSum =
    matchingQueries.reduce((sum, q) => sum + (q.rating || 0), 0) +
    matchingReviews.reduce((sum, r) => sum + (r.rating || 0), 0);

  const studentAverage =
    totalStudentRatings > 0
      ? Number((totalStudentSum / totalStudentRatings).toFixed(2))
      : Number((course.rating || 4.9).toFixed(2));

  const totalReviewsCount = (course.reviewsCount || 0) + matchingQueries.length;

  if (typeof adminOverride === 'number' && adminOverride >= 1 && adminOverride <= 5) {
    return {
      finalRating: Number(adminOverride.toFixed(2)),
      reviewsCount: totalReviewsCount,
      studentRatingsCount: totalStudentRatings,
      studentAverage,
      isOverridden: true,
      adminOverride: Number(adminOverride.toFixed(2))
    };
  }

  const baseRating = course.rating || 4.9;
  const finalRating =
    totalStudentRatings > 0
      ? Number(((baseRating * 4 + totalStudentSum) / (4 + totalStudentRatings)).toFixed(2))
      : Number(baseRating.toFixed(2));

  return {
    finalRating,
    reviewsCount: totalReviewsCount,
    studentRatingsCount: totalStudentRatings,
    studentAverage,
    isOverridden: false
  };
}

/**
 * Calculates Quick Learning topic rating dynamically.
 */
export function getQuickLearningRating(
  moduleId: string,
  queries: QuerySubmission[],
  overrides?: Record<string, number>,
  baseFallback: number = 4.95
): {
  finalRating: number;
  studentRatingsCount: number;
  studentAverage: number;
  isOverridden: boolean;
  adminOverride?: number;
} {
  const adminOverride = overrides?.[moduleId];

  const matchingQueries = queries.filter((q) => {
    if (q.ratingCategory !== 'quickLearning' || typeof q.rating !== 'number' || q.rating <= 0) {
      return false;
    }
    return q.targetId === moduleId || q.targetName?.toLowerCase().includes(moduleId.replace('ql-', ''));
  });

  const count = matchingQueries.length;
  const sum = matchingQueries.reduce((acc, q) => acc + (q.rating || 0), 0);
  const studentAverage = count > 0 ? Number((sum / count).toFixed(2)) : baseFallback;

  if (typeof adminOverride === 'number' && adminOverride >= 1 && adminOverride <= 5) {
    return {
      finalRating: Number(adminOverride.toFixed(2)),
      studentRatingsCount: count,
      studentAverage,
      isOverridden: true,
      adminOverride: Number(adminOverride.toFixed(2))
    };
  }

  const finalRating =
    count > 0 ? Number(((baseFallback * 3 + sum) / (3 + count)).toFixed(2)) : Number(baseFallback.toFixed(2));

  return {
    finalRating,
    studentRatingsCount: count,
    studentAverage,
    isOverridden: false
  };
}

/**
 * Compiles comprehensive list of all teachers (Founder, Core Faculty, Technical Tribal, and Verified Profiles)
 */
export function getAllTeachersRatingList(
  siteContent: SiteContent,
  verifiedProfiles: VerifiedTeacherProfile[] = [],
  queries: QuerySubmission[] = []
): TeacherRatingResult[] {
  const teacherOverrides = siteContent.ratingOverrides?.teachers || {};
  const list: TeacherRatingResult[] = [];

  // 1. Founder: Ajay "Techie" Kalki
  const founderName = siteContent.team.founderTitle || 'Ajay "Techie" Kalki';
  const founderRole = siteContent.team.founderSub || 'Founder & Tribe Architect';
  const founderStats = getTeacherRating(founderName, queries, teacherOverrides, 4.98);
  list.push({
    key: normalizeRatingKey(founderName),
    name: founderName,
    role: founderRole,
    subject: 'Core Engineering Systems & Exam Strategy',
    imageUrl: siteContent.team.founderImageUrl,
    baseRating: 4.98,
    ...founderStats
  });

  // 2. Core Faculty Members
  const facultySource =
    siteContent.team.members && siteContent.team.members.length > 0
      ? siteContent.team.members
      : TEACHERS_LIST.slice(1);

  facultySource.forEach((member) => {
    const stats = getTeacherRating(member.name, queries, teacherOverrides, member.rating || 4.92);
    const memberImg = 'imageUrl' in member ? (member as { imageUrl?: string }).imageUrl : undefined;
    list.push({
      key: normalizeRatingKey(member.name),
      name: member.name,
      role: member.role,
      subject: member.subject,
      imageUrl: memberImg,
      baseRating: member.rating || 4.92,
      ...stats
    });
  });

  // 3. Technical Tribal Staff (Aniruddh Trivedi & Aryan Yadav)
  if (siteContent.team.technicalMembers && siteContent.team.technicalMembers.length > 0) {
    siteContent.team.technicalMembers.forEach((tech) => {
      const stats = getTeacherRating(tech.name, queries, teacherOverrides, tech.rating || 4.95);
      list.push({
        key: normalizeRatingKey(tech.name),
        name: tech.name,
        role: tech.role,
        subject: tech.domain,
        imageUrl: tech.imageUrl,
        baseRating: tech.rating || 4.95,
        ...stats
      });
    });
  }

  // 4. Custom Verified Teacher Profiles added to the platform
  verifiedProfiles.forEach((vp) => {
    if (!vp.isVisible) return;
    const exists = list.some((item) => normalizeRatingKey(item.name) === normalizeRatingKey(vp.name));
    if (!exists) {
      const stats = getTeacherRating(vp.name, queries, teacherOverrides, 4.9);
      list.push({
        key: normalizeRatingKey(vp.name),
        name: vp.name,
        role: vp.qualification || 'Verified Faculty',
        subject: vp.intro,
        imageUrl: vp.photoUrl,
        baseRating: 4.9,
        ...stats
      });
    }
  });

  return list;
}

/**
 * Compiles comprehensive list of all courses with their computed rating stats
 */
export function getAllCoursesRatingList(
  courses: Course[],
  reviews: CourseReview[] = [],
  queries: QuerySubmission[] = [],
  siteContent: SiteContent
): CourseRatingResult[] {
  const courseOverrides = siteContent.ratingOverrides?.courses || {};

  return courses.map((course) => {
    const stats = getCourseRating(course, reviews, queries, courseOverrides);
    return {
      courseId: course.id,
      title: course.title,
      code: course.code,
      branch: course.branch,
      teacher: course.teacher,
      baseRating: course.rating || 4.9,
      ...stats
    };
  });
}

/**
 * Compiles comprehensive list of all Quick Learning modules with their computed rating stats
 */
export function getAllQuickLearningRatingList(
  queries: QuerySubmission[] = [],
  siteContent: SiteContent
): QuickLearningRatingResult[] {
  const qlOverrides = siteContent.ratingOverrides?.quickLearning || {};

  return QUICK_LEARNING_MODULES.map((mod) => {
    const stats = getQuickLearningRating(mod.id, queries, qlOverrides, mod.baseRating);
    return {
      id: mod.id,
      title: mod.title,
      badge: mod.badge,
      description: mod.description,
      baseRating: mod.baseRating,
      ...stats
    };
  });
}
