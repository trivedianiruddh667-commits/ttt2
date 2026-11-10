import React, { useState, useEffect } from 'react';
import { DailyNewsItem } from '../data/db';
import { X, Sparkles, Newspaper, Tag, AlertCircle } from 'lucide-react';

interface NewsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newsItem: DailyNewsItem) => void;
  initialNews?: DailyNewsItem | null;
}

export const NewsFormModal: React.FC<NewsFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNews
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DailyNewsItem['category']>('Exam Alert');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [readTime, setReadTime] = useState('3 min read');
  const [author, setAuthor] = useState('Tribe Academic Cell');
  const [authorRole, setAuthorRole] = useState('Senior Mentor');
  const [tagsInput, setTagsInput] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (initialNews) {
      setTitle(initialNews.title);
      setCategory(initialNews.category);
      setSummary(initialNews.summary);
      setContent(initialNews.content);
      setDate(initialNews.date);
      setReadTime(initialNews.readTime);
      setAuthor(initialNews.author);
      setAuthorRole(initialNews.authorRole || '');
      setTagsInput(initialNews.tags.join(', '));
      setIsBreaking(!!initialNews.isBreaking);
      setIsPinned(!!initialNews.isPinned);
    } else {
      // Default for new news
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      setTitle('');
      setCategory('Exam Alert');
      setSummary('');
      setContent('');
      setDate(formattedDate);
      setReadTime('3 min read');
      setAuthor('Tribe Academic Cell');
      setAuthorRole('Faculty Lead');
      setTagsInput('Exam Alert, B.Tech, 2026');
      setIsBreaking(false);
      setIsPinned(false);
    }
  }, [initialNews, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const newsData: DailyNewsItem = {
      id: initialNews ? initialNews.id : `news-${Date.now()}`,
      title: title.trim(),
      category,
      summary: summary.trim(),
      content: content.trim(),
      date: date.trim() || 'Today',
      readTime: readTime.trim() || '3 min read',
      author: author.trim() || 'Tribe Academic Cell',
      authorRole: authorRole.trim() || undefined,
      isBreaking,
      isPinned,
      tags: parsedTags.length > 0 ? parsedTags : ['Curriculum', 'University']
    };

    onSave(newsData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none"
      role="dialog"
      aria-modal="true"
      aria-label="News Article Editor"
      onClick={onClose}
    >
      <div
        className="bg-black border-4 border-white text-white w-full max-w-2xl max-h-[92vh] flex flex-col shadow-[12px_12px_0px_0px_#ffffff] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b-2 border-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-white" />
            <div>
              <span className="text-[10px] font-mono-numbers uppercase tracking-widest text-zinc-400">
                {initialNews ? 'EDIT BULLETIN' : 'PUBLISH DAILY DISPATCH'}
              </span>
              <h3 className="text-xl font-heading font-black uppercase">
                {initialNews ? 'Edit News Article' : 'Add New Daily Article'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close form"
            className="p-1 border border-zinc-700 hover:border-white hover:bg-white hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-5">
          {/* Headline */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Article Headline / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. End-Term Exam Pattern Revised: 10-Mark Proof Section Added"
              className="w-full bg-zinc-950 border-2 border-zinc-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white font-medium"
            />
          </div>

          {/* Category & Date & Read Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                News Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white uppercase font-bold focus:outline-none focus:border-white"
              >
                <option value="Exam Alert">Exam Alert</option>
                <option value="Curriculum Update">Curriculum Update</option>
                <option value="Campus News">Campus News</option>
                <option value="Tech & Placements">Tech & Placements</option>
                <option value="Tribe Dispatch">Tribe Dispatch</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Display Date *
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 09 Nov 2026"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Estimated Read Time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 3 min read"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Author info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Author / Source Name *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Prof. Alok Verma or Tribe Academic Cell"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Author Role / Division
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="e.g. Head of Algorithms"
                className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Flags (Breaking, Pinned) */}
          <div className="flex flex-wrap items-center gap-6 p-3 bg-zinc-950 border border-zinc-800">
            <label className="flex items-center gap-2 text-xs font-mono-numbers cursor-pointer">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4 accent-white rounded-none cursor-pointer"
              />
              <span className="font-bold text-white uppercase">Mark as Breaking News</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-mono-numbers cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 accent-white rounded-none cursor-pointer"
              />
              <span className="font-bold text-white uppercase">Pin to Top of Feed</span>
            </label>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Short Summary / Teaser * (Shown on Cards)
            </label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="1-2 sentences summarizing the core update for fast browsing..."
              className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white leading-relaxed focus:outline-none focus:border-white"
            />
          </div>

          {/* Full Content */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Full Article Body * (Supports Multi-Paragraph Breakdown)
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full report, guidelines, or announcement breakdown here..."
              className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-white"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Tags (Comma-Separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. AKTU, Exam Dates, B.Tech, 4th Sem, Timetable"
              className="w-full bg-zinc-950 border-2 border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3 sticky bottom-0 bg-black py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-zinc-700 text-xs font-bold uppercase hover:border-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border-2 border-white shadow-[2px_2px_0px_0px_#ffffff]"
            >
              {initialNews ? 'Save Changes' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
