import React, { useEffect, useState } from 'react';
import { User } from '../data/db';
import { X, Save, Loader2, GraduationCap } from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSaveProfile: (patch: {
    name: string;
    college: string;
    semester: string;
    department: string;
    targetSgpa: number;
  }) => Promise<void>;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onSaveProfile
}) => {
  const [name, setName] = useState(user.name);
  const [college, setCollege] = useState(user.college || '');
  const [semester, setSemester] = useState(user.semester || 'Semester 4');
  const [department, setDepartment] = useState(user.department || 'Computer Science & IT');
  const [targetSgpa, setTargetSgpa] = useState(user.targetSgpa ?? 9.2);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user.name || '');
      setCollege(user.college || '');
      setSemester(user.semester || 'Semester 4');
      setDepartment(user.department || 'Computer Science & IT');
      setTargetSgpa(user.targetSgpa ?? 9.2);
      setIsSaving(false);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const clampedSgpa = Math.min(10, Math.max(4, Number(targetSgpa) || 9.0));
      await onSaveProfile({
        name: name.trim(),
        college: college.trim() || 'Engineering University',
        semester: semester.trim() || 'Semester 4',
        department: department.trim() || 'Computer Science & IT',
        targetSgpa: Number(clampedSgpa.toFixed(1))
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Student Profile and SGPA Goal"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-zinc-950 border-4 border-white text-white shadow-[12px_12px_0px_0px_#ffffff]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 bg-black border-b-2 border-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-white shrink-0" />
            <div>
              <span className="text-[10px] font-mono-numbers uppercase tracking-widest text-zinc-400">
                ACADEMIC IDENTITY & GOAL
              </span>
              <h2 className="text-xl font-heading font-black uppercase">
                Profile &amp; Target SGPA
              </h2>
            </div>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close profile settings"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              University / College
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. DTU / VIT / SPPU"
              className="w-full bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-black border-2 border-zinc-700 px-3 py-2.5 text-xs text-white font-bold uppercase focus:outline-none focus:border-white"
              >
                {[
                  'Semester 1',
                  'Semester 2',
                  'Semester 3',
                  'Semester 4',
                  'Semester 5',
                  'Semester 6',
                  'Semester 7',
                  'Semester 8'
                ].map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Target SGPA (4.0 - 10.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="4"
                max="10"
                required
                value={targetSgpa}
                onChange={(e) => setTargetSgpa(Number(e.target.value))}
                className="w-full bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white font-mono-numbers font-bold focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Engineering Department / Branch
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 border border-zinc-700 hover:border-white text-xs font-bold uppercase text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-[44px] px-6 py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : 'Save Profile & Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
