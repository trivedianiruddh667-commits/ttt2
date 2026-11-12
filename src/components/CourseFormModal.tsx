import React, { useState, useEffect, useRef } from 'react';
import { Course, VerifiedTeacherProfile, ContentStatus } from '../data/db';
import { X, BookOpen, Plus, Trash2, Upload, FileText, Loader2, Eye, EyeOff } from 'lucide-react';
import { uploadMediaToCloud } from '../lib/firebase';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  initialCourse?: Course | null;
  verifiedTeachers?: VerifiedTeacherProfile[];
}

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCourse,
  verifiedTeachers = []
}) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [branch, setBranch] = useState('Computer Science & IT');
  const [semester, setSemester] = useState('Semester 4');
  const [category, setCategory] = useState<Course['category']>('Crash Course');
  const [price, setPrice] = useState(699);
  const [originalPrice, setOriginalPrice] = useState(1799);
  const [teacher, setTeacher] = useState('Prof. Alok Verma');
  const [teacherEmail, setTeacherEmail] = useState('alok.verma@techieteachertribe.org');
  const [teacherRole, setTeacherRole] = useState('Head of Algorithm Engineering');
  const [duration, setDuration] = useState('8 Hours');
  const [pdfPages, setPdfPages] = useState(90);
  const [description, setDescription] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [pdfNotesUrl, setPdfNotesUrl] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [isUploadingNotes, setIsUploadingNotes] = useState(false);
  const [syllabusModules, setSyllabusModules] = useState<
    { title: string; duration: string; topicsText: string }[]
  >([]);
  const [isNew, setIsNew] = useState(true);
  const [isTrending, setIsTrending] = useState(false);
  const [status, setStatus] = useState<ContentStatus>('draft');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialCourse) {
      setTitle(initialCourse.title);
      setCode(initialCourse.code);
      setBranch(initialCourse.branch);
      setSemester(initialCourse.semester);
      setCategory(initialCourse.category);
      setPrice(initialCourse.price);
      setOriginalPrice(initialCourse.originalPrice);
      setTeacher(initialCourse.teacher);
      setTeacherEmail(initialCourse.teacherEmail || '');
      setTeacherRole(initialCourse.teacherRole);
      setDuration(initialCourse.duration);
      setPdfPages(initialCourse.pdfPages || 80);
      setDescription(initialCourse.description);
      setLearningOutcomes(initialCourse.learningOutcomes.join('\n'));
      setUploadedFileName(initialCourse.uploadedFileName || '');
      setPdfNotesUrl(initialCourse.pdfNotesUrl || '');
      setNotesContent(initialCourse.notesContent || '');
      setSyllabusModules(
        (initialCourse.syllabus || []).map((m) => ({
          title: m.title,
          duration: m.duration,
          topicsText: (m.topics || []).join(', ')
        }))
      );
      setIsNew(initialCourse.isNew ?? false);
      setIsTrending(!!initialCourse.isTrending);
      setStatus(initialCourse.status || (initialCourse.isApproved ? 'published' : 'draft'));
    } else {
      setTitle('');
      setCode('CS-');
      setBranch('Computer Science & IT');
      setSemester('Semester 4');
      setCategory('Crash Course');
      setPrice(799);
      setOriginalPrice(1999);
      setTeacher('Prof. Alok Verma');
      setTeacherEmail('alok.verma@techieteachertribe.org');
      setTeacherRole('Systems & Algorithms Mentor');
      setDuration('8 Hours');
      setPdfPages(95);
      setDescription('');
      setLearningOutcomes(
        'Master university derivation proofs & recurrence relations\nSolve previous 10 years end-term exam question patterns\nHandwritten high-yield diagrams for all algorithms'
      );
      setUploadedFileName('');
      setPdfNotesUrl('');
      setNotesContent('');
      setSyllabusModules([
        {
          title: 'Module 1: Foundations & Core Proofs',
          duration: '2h 00m',
          topicsText: 'Core definitions, Exam derivation templates'
        },
        {
          title: 'Module 2: Mid-Sem Numerical Problem Solving',
          duration: '2h 30m',
          topicsText: 'Step-by-step calculations, Marking criteria hints'
        },
        {
          title: 'Module 3: End-Term High-Yield Questions',
          duration: '2h 30m',
          topicsText: '10-mark theory patterns, Final formula sheets'
        }
      ]);
      setIsNew(true);
      setIsTrending(false);
      setStatus('draft');
    }
  }, [initialCourse, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotesFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name.slice(0, 160));
    setIsUploadingNotes(true);
    try {
      const cloudUrl = await uploadMediaToCloud(file, 'courses');
      if (cloudUrl && cloudUrl.startsWith('http')) {
        setPdfNotesUrl(cloudUrl.slice(0, 500));
      }
    } catch (uploadErr) {
      console.warn('Storage upload fallback:', uploadErr);
    } finally {
      setIsUploadingNotes(false);
    }

    if (
      file.type.startsWith('text/') ||
      /\.(txt|md|csv)$/i.test(file.name)
    ) {
      try {
        const text = await file.text();
        setNotesContent(text.slice(0, 19500));
      } catch {
        // Fallback silently; filename still stored
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || !description.trim()) return;

    const outcomesArray = learningOutcomes
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedSyllabus = syllabusModules
      .filter((m) => m.title.trim())
      .map((m) => ({
        title: m.title.trim(),
        duration: m.duration.trim() || '1h 30m',
        topics: m.topicsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      }));

    const finalSyllabus =
      parsedSyllabus.length > 0
        ? parsedSyllabus
        : [
            {
              title: 'Module 1: Core Exam Revision',
              duration: '2h 00m',
              topics: ['Core formulas', 'Solved university problems']
            }
          ];

    const courseData: Course = {
      id: initialCourse ? initialCourse.id : `course-new-${Date.now()}`,
      title: title.trim(),
      code: code.trim(),
      branch,
      semester,
      category,
      price: Number(price),
      originalPrice: Number(originalPrice),
      teacher: teacher.trim() || 'Senior Faculty',
      teacherEmail: teacherEmail.trim().toLowerCase() || undefined,
      teacherUid: initialCourse?.teacherUid,
      teacherRole: teacherRole.trim() || 'University Mentor',
      duration: duration.trim() || '6 Hours',
      modulesCount: finalSyllabus.length,
      pdfPages: Number(pdfPages) || 75,
      description: description.trim(),
      learningOutcomes:
        outcomesArray.length > 0 ? outcomesArray : ['Comprehensive exam syllabus breakdown'],
      rating: initialCourse ? initialCourse.rating : 5.0,
      reviewsCount: initialCourse ? initialCourse.reviewsCount : 0,
      enrolledCount: initialCourse ? initialCourse.enrolledCount : 1,
      isApproved: status === 'published',
      status,
      isNew,
      createdAt: initialCourse?.createdAt || new Date().toISOString().split('T')[0],
      isTrending,
      uploadedFileName: uploadedFileName.trim() || undefined,
      pdfNotesUrl: pdfNotesUrl.trim() || undefined,
      notesContent: notesContent.trim() || undefined,
      syllabus: finalSyllabus
    };

    onSave(courseData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Course Form"
      onClick={onClose}
    >
      <div
        className="bg-black border-4 border-white text-white w-full max-w-3xl max-h-[92vh] flex flex-col shadow-[12px_12px_0px_0px_#ffffff] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b-2 border-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-white" />
            <div>
              <span className="text-[10px] font-mono-numbers uppercase tracking-widest text-zinc-400">
                {initialCourse ? 'EDIT CATALOG LISTING' : 'LAUNCH NEW COURSE / NOTES'}
              </span>
              <h3 className="text-xl font-heading font-black uppercase">
                {initialCourse ? `Edit Course: ${initialCourse.code}` : 'Add New Course / Topper Notes'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close course modal"
            className="min-w-[40px] min-h-[40px] p-1 border border-zinc-700 hover:border-white hover:bg-white hover:text-black transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-5">
          {/* Title & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Systems & Concurrency Fast-Track"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS-502"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2 text-sm text-white font-mono-numbers focus:outline-none focus:border-white uppercase"
              />
            </div>
          </div>

          {/* Department, Category, Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Department / Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white uppercase font-bold focus:outline-none focus:border-white"
              >
                <option value="Computer Science & IT">Computer Science &amp; IT</option>
                <option value="Electronics & Communication">Electronics &amp; Communication</option>
                <option value="Common for All Branches">Common for All Branches</option>
                <option value="Mechanical & Civil">Mechanical &amp; Civil</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Format Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Course['category'])}
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white uppercase font-bold focus:outline-none focus:border-white"
              >
                <option value="Crash Course">Crash Course</option>
                <option value="Handwritten Notes">Handwritten Notes</option>
                <option value="Full Course">Full Course</option>
                <option value="Exam Booster">Exam Booster</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Semester Target
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white uppercase font-bold focus:outline-none focus:border-white"
              >
                <option value="Semester 1 & 2">Semester 1 &amp; 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 3 & 4">Semester 3 &amp; 4</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 5 & 6">Semester 5 &amp; 6</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7 & 8">Semester 7 &amp; 8</option>
              </select>
            </div>
          </div>

          {/* Pricing, Duration, Pages */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-sm text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                required
                min={0}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-sm text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Video Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 8 Hours"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-sm text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                PDF Pages
              </label>
              <input
                type="number"
                min={1}
                value={pdfPages}
                onChange={(e) => setPdfPages(Number(e.target.value))}
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-sm text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Teacher and Role */}
          {verifiedTeachers.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Link Verified Teacher Profile (Optional)
              </label>
              <select
                value={teacherEmail}
                onChange={(e) => {
                  const chosenEmail = e.target.value;
                  setTeacherEmail(chosenEmail);
                  const found = verifiedTeachers.find(
                    (t) => t.email.trim().toLowerCase() === chosenEmail.trim().toLowerCase()
                  );
                  if (found) {
                    setTeacher(found.name);
                    setTeacherRole(found.qualification);
                  }
                }}
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
              >
                <option value="">-- Custom / Unlinked Instructor --</option>
                {verifiedTeachers.map((t) => (
                  <option key={t.id} value={t.email} className="bg-black text-white">
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Instructor Name
              </label>
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="e.g. Prof. Alok Verma"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Instructor Email (Attribution)
              </label>
              <input
                type="email"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                placeholder="faculty@university.ac.in"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Instructor Credential / Role
              </label>
              <input
                type="text"
                value={teacherRole}
                onChange={(e) => setTeacherRole(e.target.value)}
                placeholder="e.g. Systems Architect"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Badges / Flags */}
          <div className="flex flex-wrap items-center gap-6 p-3 bg-zinc-950 border border-zinc-800">
            <label className="flex items-center gap-2 text-xs font-mono-numbers cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 accent-white rounded-none cursor-pointer"
              />
              <span className="font-bold text-white uppercase">Mark as New Course</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-mono-numbers cursor-pointer">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="w-4 h-4 accent-white rounded-none cursor-pointer"
              />
              <span className="font-bold text-white uppercase">Feature on Trending Strip</span>
            </label>
          </div>

          {/* Syllabus Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Course Description &amp; Syllabus Coverage *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how this course prepares students for university mid-term and end-term exams..."
              className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-white leading-relaxed"
            />
          </div>

          {/* Key Learning Outcomes */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Key Learning Outcomes (1 bullet per line)
            </label>
            <textarea
              rows={3}
              value={learningOutcomes}
              onChange={(e) => setLearningOutcomes(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs sm:text-sm text-white font-mono-numbers focus:outline-none focus:border-white leading-relaxed"
            />
          </div>

          {/* Interactive Syllabus Builder */}
          <div className="p-4 bg-zinc-950 border-2 border-zinc-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-300">
                Syllabus Modules ({syllabusModules.length})
              </label>
              <button
                type="button"
                onClick={() =>
                  setSyllabusModules((prev) => [
                    ...prev,
                    {
                      title: `Module ${prev.length + 1}: New Topic Unit`,
                      duration: '1h 30m',
                      topicsText: 'Core theory, Past exam numericals'
                    }
                  ])
                }
                className="px-2.5 py-1 border border-white bg-black hover:bg-white hover:text-black text-[11px] font-mono-numbers font-bold uppercase flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Module</span>
              </button>
            </div>
            <div className="space-y-2.5">
              {syllabusModules.map((mod, idx) => (
                <div key={idx} className="p-3 bg-black border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) =>
                        setSyllabusModules((prev) =>
                          prev.map((m, i) => (i === idx ? { ...m, title: e.target.value } : m))
                        )
                      }
                      placeholder="Module Title"
                      className="flex-1 bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
                    />
                    <input
                      type="text"
                      value={mod.duration}
                      onChange={(e) =>
                        setSyllabusModules((prev) =>
                          prev.map((m, i) => (i === idx ? { ...m, duration: e.target.value } : m))
                        )
                      }
                      placeholder="1h 30m"
                      className="w-24 bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
                    />
                    {syllabusModules.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSyllabusModules((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 border border-zinc-800 hover:border-red-500 text-zinc-500 hover:text-red-400"
                        aria-label="Remove module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={mod.topicsText}
                    onChange={(e) =>
                      setSyllabusModules((prev) =>
                        prev.map((m, i) => (i === idx ? { ...m, topicsText: e.target.value } : m))
                      )
                    }
                    placeholder="Comma-separated topics (e.g. AVL trees, Red-black balancing)"
                    className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-[11px] text-zinc-300 font-mono-numbers focus:outline-none focus:border-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Study Notes Upload / Attached Manuscript */}
          <div className="p-4 bg-zinc-950 border-2 border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Attach Study Notes / Cheat Sheet Content (Downloadable by Students)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf,.doc,.docx"
                onChange={handleNotesFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploadingNotes}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 border border-white bg-white text-black font-black text-[11px] uppercase hover:bg-zinc-200 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUploadingNotes ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>
                  {isUploadingNotes
                    ? 'Uploading to Cloud...'
                    : uploadedFileName
                    ? `Attached: ${uploadedFileName}`
                    : 'Upload Notes File'}
                </span>
              </button>
            </div>
            <textarea
              rows={3}
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              placeholder="Paste formula summaries or upload a .txt/.md study manuscript — included in student Study Pack downloads..."
              className="w-full bg-black border border-zinc-700 px-3 py-2 text-xs text-zinc-200 font-mono-numbers focus:outline-none focus:border-white"
            />
          </div>

          {/* Publishing Status Selector */}
          <div className="p-4 bg-zinc-950 border-2 border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-heading font-black uppercase text-white flex items-center gap-2">
                  {status === 'published' ? (
                    <Eye className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-zinc-400" />
                  )}
                  <span>Course Publishing Status</span>
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Only <strong>Published</strong> courses are visible to students and public visitors. Draft & Archived courses stay strictly within Admin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`py-2 px-3 border-2 text-xs font-mono-numbers font-black uppercase transition-colors ${
                  status === 'draft'
                    ? 'border-amber-400 bg-amber-400 text-black'
                    : 'border-zinc-700 bg-black text-zinc-400 hover:border-white hover:text-white'
                }`}
              >
                Draft (Private)
              </button>
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`py-2 px-3 border-2 text-xs font-mono-numbers font-black uppercase transition-colors ${
                  status === 'published'
                    ? 'border-emerald-400 bg-emerald-500 text-black'
                    : 'border-zinc-700 bg-black text-zinc-400 hover:border-white hover:text-white'
                }`}
              >
                Published (Live)
              </button>
              <button
                type="button"
                onClick={() => setStatus('archived')}
                className={`py-2 px-3 border-2 text-xs font-mono-numbers font-black uppercase transition-colors ${
                  status === 'archived'
                    ? 'border-zinc-400 bg-zinc-700 text-white'
                    : 'border-zinc-700 bg-black text-zinc-400 hover:border-white hover:text-white'
                }`}
              >
                Archived
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3 sticky bottom-0 bg-black py-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 border border-zinc-700 text-xs font-bold uppercase hover:border-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
            >
              {initialCourse ? 'Save Changes' : 'Publish Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
