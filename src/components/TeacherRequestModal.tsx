import React, { useState, useEffect } from 'react';
import { TeacherAccessRequest, User } from '../data/db';
import {
  X,
  GraduationCap,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send
} from 'lucide-react';

interface TeacherRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  teacherRequests: TeacherAccessRequest[];
  verifiedTeacherEmails: string[];
  onSubmitRequest: (req: Omit<TeacherAccessRequest, 'id' | 'status' | 'requestedAt'>) => {
    ok: boolean;
    message: string;
  };
}

export const TeacherRequestModal: React.FC<TeacherRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  teacherRequests,
  verifiedTeacherEmails,
  onSubmitRequest
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('Computer Science & IT');
  const [subjectsTaught, setSubjectsTaught] = useState('');
  const [experienceYears, setExperienceYears] = useState('3+ Years');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      if (currentUser) {
        setName((prev) => prev || currentUser.name || '');
        setEmail((prev) => prev || currentUser.email || '');
        setCollege((prev) => prev || currentUser.college || '');
      }
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const isAlreadyVerified = normalizedEmail ? verifiedTeacherEmails.includes(normalizedEmail) : false;
  const existingRequest = normalizedEmail
    ? teacherRequests.find((r) => r.email.trim().toLowerCase() === normalizedEmail)
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !college.trim() || !department.trim()) {
      setFeedback({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    const res = onSubmitRequest({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      college: college.trim(),
      department: department.trim(),
      subjectsTaught: subjectsTaught.trim(),
      experienceYears: experienceYears.trim(),
      notes: notes.trim()
    });

    if (res.ok) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Request Teachers Portal Access"
      onClick={onClose}
    >
      <div
        className="bg-black border-4 border-white text-white w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-[12px_12px_0px_0px_#ffffff] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b-2 border-white flex items-start justify-between gap-4 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-400 uppercase">
              <GraduationCap className="w-4 h-4 text-white" />
              <span>FACULTY EMAIL VERIFICATION REQUEST</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black uppercase mt-1">
              Request Teachers Portal Access
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Teachers Portal is strictly visible to Admin-verified teacher emails. Submit your email below for Trust Admin approval.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 border border-zinc-700 hover:border-white hover:bg-white hover:text-black transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Live Email Status Indicator */}
          {normalizedEmail && (isAlreadyVerified || existingRequest) && (
            <div
              className={`p-3.5 border-2 text-xs font-mono-numbers flex items-start gap-2.5 ${
                isAlreadyVerified
                  ? 'bg-emerald-950/50 border-emerald-400 text-emerald-200'
                  : existingRequest?.status === 'PENDING'
                  ? 'bg-amber-950/50 border-amber-400 text-amber-200'
                  : 'bg-red-950/50 border-red-400 text-red-200'
              }`}
            >
              {isAlreadyVerified ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : existingRequest?.status === 'PENDING' ? (
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                {isAlreadyVerified ? (
                  <span>
                    <strong>{normalizedEmail}</strong> is already a <strong>VERIFIED TEACHER EMAIL</strong>. Sign in with this email to access the Teachers Portal!
                  </span>
                ) : existingRequest?.status === 'PENDING' ? (
                  <span>
                    A verification request for <strong>{normalizedEmail}</strong> ({existingRequest.id}) is currently <strong>PENDING ADMIN APPROVAL</strong>.
                  </span>
                ) : (
                  <span>
                    Previous request for <strong>{normalizedEmail}</strong> was marked <strong>REJECTED</strong>. You can update your credentials and re-submit below.
                  </span>
                )}
              </div>
            </div>
          )}

          {feedback && (
            <div
              className={`p-3.5 border-2 text-xs font-mono-numbers flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-red-950/80 border-red-500 text-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Meera Nair"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Faculty / Official Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (feedback) setFeedback(null);
                }}
                placeholder="faculty@university.ac.in"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono-numbers"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Institution / College *
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. DTU / NSUT / COEP"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Subjects Taught
              </label>
              <input
                type="text"
                value={subjectsTaught}
                onChange={(e) => setSubjectsTaught(e.target.value)}
                placeholder="e.g. DSA, Operating Systems, Compiler Design"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Phone (Optional)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white font-mono-numbers"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Teaching Experience
              </label>
              <select
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-xs text-white font-bold uppercase"
              >
                <option value="1-2 Years">1-2 Years</option>
                <option value="3+ Years">3+ Years</option>
                <option value="5+ Years">5+ Years</option>
                <option value="10+ Years">10+ Years</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Verification Pitch / Credentials
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Brief note on notes/courses you want to publish..."
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-zinc-500 font-mono-numbers">
              Approved emails immediately unlock the Teachers Portal.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-zinc-700 text-xs font-bold uppercase hover:border-white"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isAlreadyVerified || existingRequest?.status === 'PENDING'}
                className="px-5 py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border-2 border-white shadow-[3px_3px_0px_0px_#ffffff] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Verification Request</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
