import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  CheckCircle,
  UserCheck,
  GraduationCap,
  Image as ImageIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Trash2
} from 'lucide-react';

export interface TeacherProfileFormData {
  email: string;
  name: string;
  qualification: string;
  intro: string;
  photoUrl: string;
  isVisible: boolean;
}

interface TeacherProfileModalProps {
  isOpen: boolean;
  mode: 'approve' | 'edit';
  initialData: TeacherProfileFormData | null;
  onClose: () => void;
  onSubmit: (data: TeacherProfileFormData) => void;
}

const STUDIO_GALLERY_PHOTOS = [
  {
    label: 'Academic Desk',
    url: '/src/assets/images/student_desk_bw_1793717857911.jpg'
  },
  {
    label: 'Tribe Campus',
    url: '/src/assets/images/tribe_campus_bw_1793717857750.jpg'
  },
  {
    label: 'Lecture Hall',
    url: '/src/assets/images/hero_students_bw_1793717856347.jpg'
  }
];

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [qualification, setQualification] = useState('');
  const [intro, setIntro] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [photoError, setPhotoError] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name || '');
      setQualification(initialData.qualification || '');
      setIntro(initialData.intro || '');
      setPhotoUrl(initialData.photoUrl || '');
      setIsVisible(initialData.isVisible ?? true);
      setPhotoError(false);
      setUploadError(null);
      setIsCompressingPhoto(false);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !initialData) return null;

  const normalizedEmail = initialData.email.trim().toLowerCase();

  const initials = (name || normalizedEmail)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  const compressImageToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }

          const tryEncode = (maxDim: number, qualities: number[]): string | null => {
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            const targetW = Math.max(1, Math.round(img.width * scale));
            const targetH = Math.max(1, Math.round(img.height * scale));
            canvas.width = targetW;
            canvas.height = targetH;
            ctx.clearRect(0, 0, targetW, targetH);
            ctx.drawImage(img, 0, 0, targetW, targetH);

            for (const q of qualities) {
              const dataUrl = canvas.toDataURL('image/jpeg', q);
              if (dataUrl.length <= 360000) {
                return dataUrl;
              }
            }
            return null;
          };

          const encoded =
            tryEncode(720, [0.85, 0.72, 0.58, 0.45]) ||
            tryEncode(480, [0.65, 0.5, 0.35]);

          if (encoded) {
            resolve(encoded);
          } else {
            reject(new Error('Image remains too large after compression. Please choose a smaller portrait or paste an image URL.'));
          }
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load selected image file.'));
      };
      img.src = objectUrl;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image exceeds 10 MB limit. Please pick a smaller portrait or paste an image URL.');
      return;
    }

    setIsCompressingPhoto(true);
    setUploadError(null);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file);
      setPhotoUrl(compressedDataUrl);
      setPhotoError(false);
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : 'Failed to process image file. Please try another file or enter a URL.'
      );
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !qualification.trim() || !intro.trim()) return;
    if (photoUrl.trim().length > 395000) {
      setUploadError('Photo URL / data exceeds Firestore 395 KB limit. Please upload via device button or use a shorter image URL.');
      return;
    }
    onSubmit({
      email: normalizedEmail,
      name: name.trim(),
      qualification: qualification.trim(),
      intro: intro.trim(),
      photoUrl: photoUrl.trim(),
      isVisible
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Teacher Profile Setup"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-zinc-950 border-4 border-white shadow-[12px_12px_0px_0px_#ffffff] my-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between p-6 border-b-2 border-white bg-black">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-numbers uppercase tracking-widest text-zinc-400">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {mode === 'approve'
                  ? 'APPROVE EMAIL & AUTO-CREATE PUBLIC PROFILE'
                  : 'EDIT VERIFIED TEACHER PROFILE'}
              </span>
            </span>
            <h2 className="text-2xl font-heading font-black uppercase mt-1">
              {mode === 'approve' ? 'Verify Email & Setup Teacher Card' : 'Update Teacher Profile'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 border-2 border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Verified Email Lock Pill */}
          <div className="p-4 bg-black border-2 border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-mono-numbers uppercase tracking-wider text-zinc-500">
                  {mode === 'approve' ? 'EMAIL TO APPROVE & PUBLISH' : 'VERIFIED TEACHER EMAIL'}
                </div>
                <div className="text-sm font-mono-numbers font-bold text-white truncate">
                  {normalizedEmail}
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-black text-[10px] font-mono-numbers font-black uppercase shrink-0 border border-emerald-400">
              <CheckCircle className="w-3 h-3" />
              <span>VERIFIED EMAIL BADGE</span>
            </span>
          </div>

          {/* Photo Section: Preview + Device Upload + URL */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Live Portrait Preview */}
            <div className="md:col-span-5">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Profile Photo Preview
              </label>
              <div className="aspect-[4/3] w-full border-2 border-white bg-zinc-900 overflow-hidden relative flex items-center justify-center shadow-[4px_4px_0px_0px_#ffffff]">
                {photoUrl.trim() && !photoError ? (
                  <img
                    src={photoUrl}
                    alt={name || 'Teacher portrait'}
                    referrerPolicy="no-referrer"
                    onError={() => setPhotoError(true)}
                    className="w-full h-full object-cover filter grayscale contrast-125"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-zinc-900">
                    <div className="w-16 h-16 border-2 border-white bg-black flex items-center justify-center mb-2">
                      {initials ? (
                        <span className="font-heading font-black text-xl text-white">
                          {initials}
                        </span>
                      ) : (
                        <GraduationCap className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono-numbers text-zinc-400 uppercase">
                      {photoError ? 'Image failed to load · Fallback shown' : 'Monogram Fallback Active'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Photo Inputs */}
            <div className="md:col-span-7 space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Provide Teacher Photo (Upload or URL)
              </label>

              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isCompressingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border-2 border-white flex items-center gap-2 font-mono-numbers disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isCompressingPhoto ? 'Optimizing Photo...' : 'Upload From Device'}</span>
                </button>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrl('');
                      setPhotoError(false);
                      setUploadError(null);
                    }}
                    className="px-3 py-2.5 bg-black text-zinc-300 hover:text-white border border-zinc-700 hover:border-white text-xs font-mono-numbers uppercase flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Photo</span>
                  </button>
                )}
              </div>

              {uploadError && (
                <div className="p-2.5 bg-red-950/80 border border-red-500 text-red-200 text-xs font-mono-numbers flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono-numbers uppercase text-zinc-500 mb-1">
                  Or Paste Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={photoUrl.startsWith('data:') ? '' : photoUrl}
                    onChange={(e) => {
                      setPhotoUrl(e.target.value);
                      setPhotoError(false);
                      setUploadError(null);
                    }}
                    placeholder={
                      photoUrl.startsWith('data:')
                        ? 'Uploaded device image loaded (paste URL to replace)'
                        : 'https://example.com/teacher-photo.jpg'
                    }
                    className="w-full bg-black border-2 border-zinc-700 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-numbers"
                  />
                </div>
              </div>

              {/* Quick Editorial Presets */}
              <div className="pt-1">
                <span className="block text-[10px] font-mono-numbers uppercase text-zinc-500 mb-1.5">
                  Quick Studio Portraits:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {STUDIO_GALLERY_PHOTOS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        setPhotoUrl(preset.url);
                        setPhotoError(false);
                        setUploadError(null);
                      }}
                      className={`px-2 py-1 text-[10px] font-mono-numbers uppercase border transition-colors ${
                        photoUrl === preset.url
                          ? 'border-white bg-white text-black font-bold'
                          : 'border-zinc-700 bg-black text-zinc-400 hover:border-white hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Name & Qualification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Teacher Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Meera Nair"
                className="w-full bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Qualification & Credentials *
              </label>
              <input
                type="text"
                required
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. Ph.D. Computer Science · 8 Years Teaching"
                className="w-full bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Small Intro */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Small Intro (Public Bio) *
              </label>
              <span className="text-[10px] font-mono-numbers text-zinc-500 tabular-nums">
                {intro.length} chars
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Write a concise intro covering subjects taught, academic background, and exam expertise..."
              className="w-full bg-black border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white leading-relaxed"
            />
          </div>

          {/* Visibility Switch */}
          <div className="p-4 bg-black border-2 border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-heading font-black uppercase text-white flex items-center gap-2">
                {isVisible ? (
                  <Eye className="w-4 h-4 text-emerald-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-zinc-400" />
                )}
                <span>
                  {isVisible ? 'Visible on Public Teachers Page' : 'Hidden from Public Teachers Page'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Only active verified teacher emails with visibility enabled are displayed to website visitors.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className={`px-3.5 py-2 border-2 text-xs font-mono-numbers font-black uppercase transition-colors shrink-0 ${
                isVisible
                  ? 'border-emerald-400 bg-emerald-500 text-black'
                  : 'border-zinc-600 bg-zinc-900 text-zinc-300 hover:border-white'
              }`}
            >
              {isVisible ? 'PUBLIC: ON' : 'PUBLIC: OFF'}
            </button>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border-2 border-zinc-700 bg-black text-zinc-300 hover:border-white hover:text-white text-xs font-mono-numbers font-bold uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {mode === 'approve' ? 'Approve Email & Save Profile' : 'Save Profile Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
