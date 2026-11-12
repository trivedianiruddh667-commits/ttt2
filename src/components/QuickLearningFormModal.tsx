import React, { useState, useEffect, useRef } from 'react';
import { QuickLearningItem, ContentStatus } from '../data/db';
import {
  X,
  Zap,
  Upload,
  FileText,
  Video,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Trash2,
  Plus
} from 'lucide-react';
import { uploadMediaToCloud } from '../lib/firebase';

interface QuickLearningFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: QuickLearningItem) => void;
  initialItem?: QuickLearningItem | null;
}

export const QuickLearningFormModal: React.FC<QuickLearningFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem
}) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<QuickLearningItem['category']>('Fast-Track Sprint');
  const [duration, setDuration] = useState('120 Mins');
  const [description, setDescription] = useState('');
  const [keyPointsText, setKeyPointsText] = useState('');
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [learningMaterialsUrl, setLearningMaterialsUrl] = useState('');
  const [materialsFileName, setMaterialsFileName] = useState('');

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const materialInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || '');
      setTopic(initialItem.topic || '');
      setSubject(initialItem.subject || '');
      setCategory(initialItem.category || 'Fast-Track Sprint');
      setDuration(initialItem.duration || '120 Mins');
      setDescription(initialItem.description || '');
      setKeyPointsText((initialItem.keyPoints || []).join('\n'));
      setStatus(initialItem.status || 'draft');
      setImageUrl(initialItem.imageUrl || '');
      setVideoUrl(initialItem.videoUrl || '');
      setLearningMaterialsUrl(initialItem.learningMaterialsUrl || '');
      setMaterialsFileName(initialItem.materialsFileName || '');
    } else {
      setTitle('');
      setTopic('');
      setSubject('');
      setCategory('Fast-Track Sprint');
      setDuration('120 Mins');
      setDescription('');
      setKeyPointsText(
        'Step-by-step formula breakdown\n10-year recurring university numerical derivations\nPrintable quick-revision cheat sheet'
      );
      setStatus('draft');
      setImageUrl('');
      setVideoUrl('');
      setLearningMaterialsUrl('');
      setMaterialsFileName('');
    }
    setFormError(null);
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setIsUploadingImage(true);
    setFormError(null);
    try {
      const url = await uploadMediaToCloud(file, 'cms');
      setImageUrl(url);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleMaterialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMaterialsFileName(file.name.slice(0, 160));
    setIsUploadingMaterial(true);
    setFormError(null);
    try {
      const url = await uploadMediaToCloud(file, 'courses');
      setLearningMaterialsUrl(url);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to upload material.');
    } finally {
      setIsUploadingMaterial(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim() || !description.trim()) {
      setFormError('Please fill in Topic Title, Topic Focus, and Description.');
      return;
    }

    const keyPoints = keyPointsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const item: QuickLearningItem = {
      id: initialItem?.id || `ql-item-${Date.now()}`,
      title: title.trim(),
      topic: topic.trim(),
      subject: subject.trim() || 'General Engineering Sprints',
      category,
      duration: duration.trim() || '120 Mins',
      description: description.trim(),
      status,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['Core exam derivation proof and formulas'],
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      learningMaterialsUrl: learningMaterialsUrl.trim() || undefined,
      materialsFileName: materialsFileName.trim() || undefined,
      viewsCount: initialItem?.viewsCount ?? 0,
      createdAt: initialItem?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSave(item);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Learning Topic Form"
      onClick={onClose}
    >
      <div
        className="bg-black border-4 border-white text-white w-full max-w-3xl max-h-[92vh] flex flex-col shadow-[12px_12px_0px_0px_#ffffff] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b-2 border-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-black">
              <Zap className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-black uppercase tracking-wider">
                {initialItem ? 'Edit Quick Learning Topic' : 'Create Quick Learning Topic'}
              </h3>
              <p className="text-xs text-zinc-400 font-mono-numbers">
                Fast-track educational modules, high-contrast derivation sheets & lecture links
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 border-2 border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-5">
          {formError && (
            <div className="p-3 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-mono-numbers">
              {formError}
            </div>
          )}

          {/* Title & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Topic Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dynamic Programming: 3-Hour Sprint"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Specific Topic Focus *
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 0/1 Knapsack & Matrix Chain Multiplication"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white font-medium"
              />
            </div>
          </div>

          {/* Subject, Category & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Subject / Course Code
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Data Structures (CS-301)"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QuickLearningItem['category'])}
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white uppercase font-bold focus:outline-none focus:border-white"
              >
                <option value="Fast-Track Sprint">Fast-Track Sprint</option>
                <option value="Crash Course">Crash Course</option>
                <option value="Exam Booster">Exam Booster</option>
                <option value="Handwritten Notes">Handwritten Notes</option>
                <option value="Cheat Sheet">Cheat Sheet</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Sprint Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 180 Mins or 3 Hours"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Status & Publication Control */}
          <div className="p-4 bg-zinc-950 border-2 border-zinc-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-300">
                Publication Status (Control Public Visibility)
              </label>
              <span
                className={`text-[10px] font-mono-numbers font-black px-2 py-0.5 uppercase ${
                  status === 'published'
                    ? 'bg-emerald-500 text-black'
                    : status === 'archived'
                    ? 'bg-zinc-700 text-zinc-300'
                    : 'bg-amber-400 text-black'
                }`}
              >
                {status.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['draft', 'published', 'archived'] as ContentStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 text-xs font-black uppercase font-mono-numbers border-2 transition-all text-center ${
                    status === st
                      ? 'border-white bg-white text-black shadow-[2px_2px_0px_0px_#ffffff]'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  {st === 'draft' ? 'Draft (Private)' : st === 'published' ? 'Published (Live)' : 'Archived'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 font-mono-numbers">
              {status === 'published'
                ? '✓ Will appear live on the public Quick Learning page and be accessible to all students.'
                : '🔒 Hidden from public visitors. Visible only inside the Admin Panel as a template/draft.'}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Description / High-Yield Summary *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the concepts covered, typical exam weightage, and high-scoring numerical templates..."
              className="w-full bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2.5 text-xs text-white leading-relaxed focus:outline-none focus:border-white font-medium"
            />
          </div>

          {/* Key Points / High-Yield Takeaways */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Key Concepts & Formulas Covered (1 per line)
            </label>
            <textarea
              rows={3}
              value={keyPointsText}
              onChange={(e) => setKeyPointsText(e.target.value)}
              placeholder="Matrix Tabulation algorithm\nStep-by-step state transition formula\nSolved 10-year recurring university numericals"
              className="w-full bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
            />
          </div>

          {/* Video & Media Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>Video Lesson URL (YouTube, Vimeo, Stream)</span>
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Topic Diagram / Banner (Upload or URL)</span>
              </label>
              <div className="flex gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... or click Upload"
                  className="flex-1 bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3 py-2 bg-white text-black font-black uppercase text-[10px] hover:bg-zinc-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Upload</span>
                </button>
              </div>
            </div>
          </div>

          {/* Learning Materials / Printable Notes */}
          <div className="p-4 bg-zinc-950 border-2 border-zinc-800 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Attach Downloadable Cheat Sheet / PDF Manuscript</span>
            </label>
            <div className="flex gap-2">
              <input
                ref={materialInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleMaterialUpload}
                className="hidden"
              />
              <input
                type="text"
                value={learningMaterialsUrl}
                onChange={(e) => setLearningMaterialsUrl(e.target.value)}
                placeholder="Cloud Storage document link..."
                className="flex-1 bg-black border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
              />
              <button
                type="button"
                disabled={isUploadingMaterial}
                onClick={() => materialInputRef.current?.click()}
                className="px-3.5 py-2 bg-white text-black font-black uppercase text-[10px] hover:bg-zinc-200 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {isUploadingMaterial ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{materialsFileName ? `Attached: ${materialsFileName}` : 'Upload PDF'}</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
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
              className="min-h-[44px] px-6 py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border-2 border-white shadow-[2px_2px_0px_0px_#ffffff] flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialItem ? 'Update Topic' : 'Save Topic'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
