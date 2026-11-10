import React, { useState } from 'react';
import { SloganBanner } from '../components/SloganBanner';
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Star,
  Award,
  BookOpen,
  Zap,
  Users
} from 'lucide-react';
import { QuerySubmission, User, Course, VerifiedTeacherProfile } from '../data/db';
import { SiteContent } from '../data/siteContent';
import { copyTextSafely } from '../lib/downloadUtils';
import { QUICK_LEARNING_MODULES, getAllTeachersRatingList } from '../lib/ratings';

interface ContactPageProps {
  content?: SiteContent['contact'];
  siteContent?: SiteContent;
  courses?: Course[];
  teacherProfiles?: VerifiedTeacherProfile[];
  currentUser?: User | null;
  onAddQuery: (query: QuerySubmission) => Promise<void> | void;
  onNotify?: (msg: string, variant?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_CONTACT: SiteContent['contact'] = {
  header: {
    badge: 'DIRECT STUDENT DESK',
    title: 'Contact & Academic SOS',
    description:
      'Have a question regarding syllabus modules, notes delivery via Blinkit/Zepto, or need custom university coverage? We respond within 30 minutes.'
  },
  sosDirectLineTitle: 'Instant WhatsApp Faculty Hotline',
  sosDirectLineSub: 'Direct peer connection with our subject convenor. Operational 24/7 during exam weeks.',
  phone1: '+91 11 4099 8800',
  phone2: '+91 80 2345 6789',
  emailSupport: 'queries@techieteachertribe.org',
  emailGrievance: 'director@techieteachertribe.org',
  officeAddress: "Techie Teacher's Tribe Trust, Block B, Technology Incubator Park, New Delhi 110016",
  officeHours: '08:00 AM - 10:00 PM IST (Mon-Sat)',
  faqs: [
    {
      question: 'How quickly are handwritten notes delivered to my hostel?',
      answer:
        'Through our partnerships with Blinkit and Zepto, physical spiral-bound booklets reach campus hostel gates in 10 minutes flat across 40+ engineering college zones.'
    },
    {
      question: 'Are digital course videos downloadable for offline viewing?',
      answer:
        'Yes! Once enrolled in any fast-track sprint or full syllabus module, you can access materials seamlessly via the Student Dashboard on desktop or mobile.'
    },
    {
      question: 'What if my university syllabus has unique derivations?',
      answer:
        'Drop a query right here or ping us on WhatsApp with your syllabus code. Our faculty team reviews and adds custom derivation sheets within 48 hours.'
    }
  ]
};

export const ContactPage: React.FC<ContactPageProps> = ({
  content = DEFAULT_CONTACT,
  siteContent,
  courses = [],
  teacherProfiles = [],
  currentUser,
  onAddQuery,
  onNotify
}) => {
  const [studentName, setStudentName] = useState(currentUser?.name || '');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [queryText, setQueryText] = useState('');
  const [branch, setBranch] = useState('Computer Science & IT');
  const [submittedQuery, setSubmittedQuery] = useState<QuerySubmission | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Student Rating System State under Query System
  const [includeRating, setIncludeRating] = useState(true);
  const [ratingCategory, setRatingCategory] = useState<'teacher' | 'course' | 'quickLearning'>('teacher');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingFeedback, setRatingFeedback] = useState('');

  // Available Teachers compiled from SiteContent, Core Teachers and Verified Profiles
  const allTeachers = React.useMemo(() => {
    if (siteContent) {
      return getAllTeachersRatingList(siteContent, teacherProfiles, []);
    }
    return [
      { key: 'ajay_kalki', name: 'Ajay "Techie" Kalki', role: 'Founder & Tribe Architect' },
      { key: 'alok_verma', name: 'Prof. Alok Verma', role: 'Lead Mentor · Algorithms' },
      { key: 'sneha_iyer', name: 'Dr. Sneha Iyer', role: 'Senior Academician · Mathematics' },
      { key: 'kabir_rao', name: 'Prof. Kabir Rao', role: 'Hardware Systems Lead' },
      { key: 'nandini_sen', name: 'Dr. Nandini Sen', role: 'Systems Mentor · Databases' },
      { key: 'priya_desai', name: 'Er. Priya Desai', role: 'Network Specialist' },
      { key: 'aniruddh_trivedi', name: 'Aniruddh Trivedi', role: 'Website Designer and Administrator' },
      { key: 'aryan_yadav', name: 'Aryan Yadav', role: 'Researcher and Content Organiser' }
    ];
  }, [siteContent, teacherProfiles]);

  const approvedCourses = React.useMemo(() => courses.filter((c) => c.isApproved), [courses]);

  // Set initial target when switching category
  React.useEffect(() => {
    if (ratingCategory === 'teacher' && allTeachers.length > 0 && !selectedTargetId) {
      setSelectedTargetId(allTeachers[0].name);
    } else if (ratingCategory === 'course' && approvedCourses.length > 0 && !selectedTargetId) {
      setSelectedTargetId(approvedCourses[0].id);
    } else if (ratingCategory === 'quickLearning' && !selectedTargetId) {
      setSelectedTargetId(QUICK_LEARNING_MODULES[0].id);
    }
  }, [ratingCategory, allTeachers, approvedCourses, selectedTargetId]);

  const phoneDigits = content.phone1.replace(/[^0-9]/g, '');
  const waPhone = phoneDigits.length >= 10 ? phoneDigits : '911140998800';
  const waHref = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    "Hi Techie Teacher's Tribe Trust, I have a question regarding my semester notes/courses."
  )}`;

  const handleCopy = async (label: string, val: string) => {
    const ok = await copyTextSafely(val);
    if (ok) {
      setCopiedField(label);
      onNotify?.(`${label} copied to clipboard.`, 'success');
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const cleanName = studentName.trim();
    const cleanPhone = contactNumber.trim();
    const cleanEmail = email.trim();
    const cleanQuery = queryText.trim();

    if (cleanName.length < 2) {
      setSubmitError('Please enter your full name.');
      return;
    }
    if (cleanPhone.replace(/[^0-9]/g, '').length < 8) {
      setSubmitError('Please enter a valid 10-digit contact number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setSubmitError('Please enter a valid email address.');
      return;
    }
    if (cleanQuery.length < 10) {
      setSubmitError('Please describe your query in at least 10 characters.');
      return;
    }

    // Determine target entity info if rating included
    let targetName = '';
    let targetId = '';
    if (includeRating) {
      if (ratingCategory === 'teacher') {
        const t = allTeachers.find((item) => item.name === selectedTargetId) || allTeachers[0];
        targetName = t?.name || 'Faculty Member';
        targetId = t?.name || 'teacher';
      } else if (ratingCategory === 'course') {
        const c = approvedCourses.find((item) => item.id === selectedTargetId) || approvedCourses[0];
        targetName = c ? `${c.code}: ${c.title}` : 'Course';
        targetId = c?.id || 'course';
      } else if (ratingCategory === 'quickLearning') {
        const ql = QUICK_LEARNING_MODULES.find((m) => m.id === selectedTargetId) || QUICK_LEARNING_MODULES[0];
        targetName = ql?.title || 'Quick Learning Module';
        targetId = ql?.id || 'ql-3hr';
      }
    }

    const ratingNote = includeRating
      ? ` [STUDENT RATING: ${ratingValue}★ for ${ratingCategory.toUpperCase()}: ${targetName}${
          ratingFeedback ? ` - "${ratingFeedback.trim()}"` : ''
        }]`
      : '';

    const newQuery: QuerySubmission = {
      id: `QRY-${Date.now().toString().slice(-5)}`,
      studentName: cleanName,
      contactNumber: cleanPhone,
      email: cleanEmail,
      query: `[Branch: ${branch}]${ratingNote} ${cleanQuery}`,
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'Received',
      applicantUid: currentUser?.id,
      ...(includeRating
        ? {
            ratingCategory,
            targetId,
            targetName,
            rating: ratingValue,
            feedbackText: ratingFeedback.trim() || undefined
          }
        : {})
    };

    setIsSubmitting(true);
    try {
      await onAddQuery(newQuery);
      setSubmittedQuery(newQuery);
      setQueryText('');
      setRatingFeedback('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not dispatch query right now. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-black text-white select-none">
      {/* Header section */}
      <section className="border-b-2 border-white py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-mono-numbers">
            {content.header.badge}
          </span>
          <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight uppercase mt-2">
            {content.header.title}
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-3 max-w-xl">
            {content.header.description}
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Direct Communication Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                INSTANT REACH
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
                {content.sosDirectLineTitle}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                {content.sosDirectLineSub}
              </p>
            </div>

            {/* WhatsApp Click-to-Chat Button */}
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="p-6 border-4 border-white bg-white text-black flex items-center justify-between group shadow-[6px_6px_0px_0px_#ffffff] hover:bg-zinc-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center border border-black shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono-numbers font-black uppercase text-zinc-600">
                    CLICK TO CHAT
                  </div>
                  <div className="font-heading font-black text-lg uppercase">
                    WhatsApp Faculty Desk
                  </div>
                  <div className="text-xs font-mono-numbers text-zinc-700">
                    {content.phone1}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform shrink-0" />
            </a>

            {/* Phone & Email Cards */}
            <div className="space-y-4">
              <div className="p-6 border-2 border-white bg-zinc-950 flex items-start justify-between gap-3">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 border border-white bg-black flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 font-mono-numbers">
                      CAMPUS HELPLINE NUMBER
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white font-mono-numbers mt-0.5 flex flex-wrap gap-x-2">
                      <a href={`tel:${content.phone1.replace(/[^+\d]/g, '')}`} className="hover:underline">
                        {content.phone1}
                      </a>
                      <span>/</span>
                      <a href={`tel:${content.phone2.replace(/[^+\d]/g, '')}`} className="hover:underline">
                        {content.phone2}
                      </a>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Operating Hours: {content.officeHours}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('Phone', content.phone1)}
                  aria-label="Copy helpline number"
                  className="min-h-[44px] min-w-[44px] p-2 border border-zinc-800 hover:border-white text-zinc-400 hover:text-white flex items-center justify-center shrink-0"
                >
                  {copiedField === 'Phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-6 border-2 border-white bg-zinc-950 flex items-start justify-between gap-3">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 border border-white bg-black flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 font-mono-numbers">
                      OFFICIAL QUERY EMAIL
                    </div>
                    <a
                      href={`mailto:${content.emailSupport}`}
                      className="text-sm sm:text-base font-bold text-white font-mono-numbers mt-0.5 block truncate hover:underline"
                    >
                      {content.emailSupport}
                    </a>
                    <div className="text-xs text-zinc-500 mt-1 truncate">
                      Grievance:{' '}
                      <a href={`mailto:${content.emailGrievance}`} className="hover:text-white hover:underline">
                        {content.emailGrievance}
                      </a>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('Email', content.emailSupport)}
                  aria-label="Copy official email"
                  className="min-h-[44px] min-w-[44px] p-2 border border-zinc-800 hover:border-white text-zinc-400 hover:text-white flex items-center justify-center shrink-0"
                >
                  {copiedField === 'Email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-6 border-2 border-zinc-800 bg-black flex items-start gap-4">
                <div className="w-10 h-10 border border-zinc-700 bg-zinc-900 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-400 font-mono-numbers">
                    REGISTERED ACADEMIC TRUST
                  </div>
                  <div className="text-sm font-semibold text-zinc-300 mt-0.5">
                    {content.officeAddress}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Query Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 border-4 border-white bg-zinc-950 shadow-[10px_10px_0px_0px_#ffffff]">
              <div className="mb-6">
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
                  STUDENT DISPATCH
                </span>
                <h3 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
                  Send Your Query
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Submissions are synced to the Admin SOS Desk ({content.emailSupport}) and prioritized by academic urgency.
                </p>
              </div>

              {submitError && (
                <div className="mb-6 p-4 border-2 border-red-500 bg-red-950/80 text-red-200 flex items-start gap-3 text-xs font-mono-numbers">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {submittedQuery && (
                <div className="mb-6 p-4 border-2 border-white bg-black flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-white uppercase font-mono-numbers">
                      QUERY DISPATCHED · REF: {submittedQuery.id}
                    </div>
                    <div className="text-zinc-400 mt-0.5">
                      Thank you, {submittedQuery.studentName}. Your query has been saved to our Faculty Desk queue. We will reach back on {submittedQuery.contactNumber} / {submittedQuery.email}.
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Aryan Sharma"
                      className="w-full min-h-[44px] bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full min-h-[44px] bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-white font-mono-numbers transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@college.edu"
                      className="w-full min-h-[44px] bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-white font-mono-numbers transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                      Department / Branch
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full min-h-[44px] bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white uppercase font-bold"
                    >
                      <option value="Computer Science & IT">Computer Science & IT</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Mechanical & Civil">Mechanical & Civil</option>
                      <option value="Applied Sciences & Math">Applied Sciences & Math</option>
                      <option value="General Query">General / Other</option>
                    </select>
                  </div>
                </div>

                {/* STUDENT RATING SYSTEM LINKED TO FACULTY, COURSES & QUICK LEARNING */}
                <div className="p-4 sm:p-5 border-2 border-white bg-black space-y-4 shadow-[4px_4px_0px_0px_#ffffff]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-white text-white" />
                      <span className="text-xs font-heading font-black uppercase text-white tracking-wider">
                        Student Rating & Evaluation System
                      </span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono-numbers">
                      <input
                        type="checkbox"
                        checked={includeRating}
                        onChange={(e) => setIncludeRating(e.target.checked)}
                        className="w-4 h-4 accent-white rounded-none cursor-pointer"
                      />
                      <span className="text-zinc-300 font-bold uppercase text-[11px]">
                        Include Rating with Query
                      </span>
                    </label>
                  </div>

                  {includeRating && (
                    <div className="space-y-4 pt-1">
                      {/* Category selector */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                          Select What You Are Rating
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRatingCategory('teacher');
                              if (allTeachers.length > 0) setSelectedTargetId(allTeachers[0].name);
                            }}
                            className={`p-2.5 border text-left text-xs font-mono-numbers font-bold uppercase transition-colors flex items-center gap-2 ${
                              ratingCategory === 'teacher'
                                ? 'border-white bg-white text-black'
                                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-white'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Faculty & Mentors</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRatingCategory('course');
                              if (approvedCourses.length > 0) setSelectedTargetId(approvedCourses[0].id);
                            }}
                            className={`p-2.5 border text-left text-xs font-mono-numbers font-bold uppercase transition-colors flex items-center gap-2 ${
                              ratingCategory === 'course'
                                ? 'border-white bg-white text-black'
                                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-white'
                            }`}
                          >
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Courses</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRatingCategory('quickLearning');
                              setSelectedTargetId(QUICK_LEARNING_MODULES[0].id);
                            }}
                            className={`p-2.5 border text-left text-xs font-mono-numbers font-bold uppercase transition-colors flex items-center gap-2 ${
                              ratingCategory === 'quickLearning'
                                ? 'border-white bg-white text-black'
                                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-white'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Quick Learning</span>
                          </button>
                        </div>
                      </div>

                      {/* Target Select Dropdown */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                          {ratingCategory === 'teacher' && 'Select Teacher / Faculty Member *'}
                          {ratingCategory === 'course' && 'Select University Course *'}
                          {ratingCategory === 'quickLearning' && 'Select Quick Learning Module *'}
                        </label>

                        {ratingCategory === 'teacher' && (
                          <select
                            value={selectedTargetId}
                            onChange={(e) => setSelectedTargetId(e.target.value)}
                            className="w-full min-h-[44px] bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                          >
                            {allTeachers.map((t) => (
                              <option key={t.key} value={t.name}>
                                {t.name} · {t.role}
                              </option>
                            ))}
                          </select>
                        )}

                        {ratingCategory === 'course' && (
                          <select
                            value={selectedTargetId}
                            onChange={(e) => setSelectedTargetId(e.target.value)}
                            className="w-full min-h-[44px] bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                          >
                            {approvedCourses.map((c) => (
                              <option key={c.id} value={c.id}>
                                [{c.code}] {c.title} — {c.teacher} ({c.branch})
                              </option>
                            ))}
                          </select>
                        )}

                        {ratingCategory === 'quickLearning' && (
                          <select
                            value={selectedTargetId}
                            onChange={(e) => setSelectedTargetId(e.target.value)}
                            className="w-full min-h-[44px] bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                          >
                            {QUICK_LEARNING_MODULES.map((m) => (
                              <option key={m.id} value={m.id}>
                                [{m.badge}] {m.title} (~{m.fastTrackMinutes}m)
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Interactive 5-Star Rating Selector */}
                      <div className="p-3.5 border border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] uppercase font-mono-numbers text-zinc-400">
                            YOUR SCORE (1 TO 5 STARS)
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRatingValue(star)}
                                className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                                aria-label={`Rate ${star} star`}
                              >
                                <Star
                                  className={`w-6 h-6 transition-colors ${
                                    (hoverRating || ratingValue) >= star
                                      ? 'fill-white text-white'
                                      : 'text-zinc-700 hover:text-zinc-500'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-block bg-white text-black font-black text-xs px-2.5 py-1 font-mono-numbers uppercase">
                            {ratingValue}.0 ★{' '}
                            {ratingValue === 5
                              ? 'EXCEPTIONAL'
                              : ratingValue === 4
                              ? 'VERY GOOD'
                              : ratingValue === 3
                              ? 'GOOD'
                              : ratingValue === 2
                              ? 'FAIR'
                              : 'POOR'}
                          </span>
                          <div className="text-[10px] text-zinc-500 font-mono-numbers mt-1">
                            Factored into live teacher/course average
                          </div>
                        </div>
                      </div>

                      {/* Rating Note */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                          Optional Evaluation Comment / Exam Feedback
                        </label>
                        <input
                          type="text"
                          value={ratingFeedback}
                          onChange={(e) => setRatingFeedback(e.target.value)}
                          placeholder="e.g. Cleared all Section C numericals in end-term without confusion!"
                          className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    Your Query / Syllabus Details *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Describe your subject question, university name, or notes requirement..."
                    className="w-full bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[48px] w-full py-4 bg-white text-black font-black uppercase tracking-wider text-xs sm:text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isSubmitting ? 'Dispatching Query...' : 'Submit Query to Faculty Desk'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section (Editable via CMS) */}
      {content.faqs && content.faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t-2 border-white">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
              FREQUENTLY ASKED
            </span>
            <h3 className="text-2xl sm:text-4xl font-heading font-black uppercase mt-1">
              Campus Queries Answered
            </h3>
          </div>

          <div className="space-y-4">
            {content.faqs.map((faq, idx) => {
              const isOpen = expandedFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border-2 border-white bg-zinc-950 transition-colors shadow-[4px_4px_0px_0px_#ffffff]"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                    className="min-h-[48px] w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base uppercase"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 shrink-0 text-white" />
                    ) : (
                      <ChevronDown className="w-5 h-5 shrink-0 text-zinc-400" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 border-t border-zinc-800 leading-relaxed font-normal">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Slogan Banner */}
      <SloganBanner
        variant="standard"
        slogan="From Notes to Knowledge."
        subtext="Every query answered by senior educators, not automated bots."
      />
    </div>
  );
};
