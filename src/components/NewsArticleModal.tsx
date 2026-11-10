import React, { useEffect, useState } from 'react';
import { DailyNewsItem } from '../data/db';
import { X, Calendar, Clock, User, Tag, Edit3, Trash2, Share2, Check } from 'lucide-react';
import { shareContentSafely } from '../lib/downloadUtils';

interface NewsArticleModalProps {
  news: DailyNewsItem | null;
  isOpen: boolean;
  canManageContent?: boolean;
  onClose: () => void;
  onEdit: (news: DailyNewsItem) => void;
  onDelete: (newsId: string) => void;
}

export const NewsArticleModal: React.FC<NewsArticleModalProps> = ({
  news,
  isOpen,
  canManageContent = false,
  onClose,
  onEdit,
  onDelete
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCopied(false);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !news) return null;

  const handleShareArticle = async () => {
    const res = await shareContentSafely({
      title: news.title,
      text: news.summary
    });
    if (res !== 'failed') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none"
      role="dialog"
      aria-modal="true"
      aria-label={news.title}
      onClick={onClose}
    >
      <div
        className="bg-black border-4 border-white text-white w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[12px_12px_0px_0px_#ffffff] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-zinc-950 border-b-2 border-white flex items-start justify-between gap-4 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-mono-numbers font-black px-2 py-0.5 border border-white bg-white text-black">
                {news.category}
              </span>
              {news.isBreaking && (
                <span className="text-xs uppercase font-mono-numbers font-bold px-2 py-0.5 border border-red-500 bg-red-600 text-white">
                  BREAKING INTEL
                </span>
              )}
              {news.isPinned && (
                <span className="text-xs uppercase font-mono-numbers font-bold px-2 py-0.5 border border-zinc-500 bg-zinc-900 text-zinc-300">
                  PINNED
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight mt-2 leading-tight">
              {news.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[40px] min-h-[40px] p-1.5 border border-zinc-700 hover:border-white hover:bg-white hover:text-black transition-colors flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Meta Bar */}
        <div className="px-6 py-3 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-numbers text-zinc-400">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>{news.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white" />
              <span>{news.readTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-white" />
              <span>
                By <strong className="text-white">{news.author}</strong>
                {news.authorRole && ` (${news.authorRole})`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareArticle}
              className="min-h-[36px] px-2.5 py-1 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white flex items-center gap-1 text-[11px] uppercase transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
            {canManageContent && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(news);
                  }}
                  className="min-h-[36px] px-2.5 py-1 border border-zinc-700 hover:border-white text-white hover:bg-zinc-800 flex items-center gap-1 text-[11px] uppercase transition-colors font-bold"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Article</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(news.id);
                  }}
                  className="min-h-[36px] px-2.5 py-1 border border-zinc-800 hover:border-red-500 text-zinc-400 hover:text-red-400 flex items-center gap-1 text-[11px] uppercase transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-zinc-300 leading-relaxed">
          {/* Summary Callout Box */}
          <div className="p-4 bg-zinc-950 border-2 border-white">
            <span className="text-[10px] font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-1 font-bold">
              BULLETIN BRIEF
            </span>
            <p className="text-zinc-200 font-medium text-sm leading-relaxed">
              {news.summary}
            </p>
          </div>

          {/* Full Content */}
          <div className="space-y-4 whitespace-pre-line text-sm text-zinc-300 font-normal leading-relaxed">
            {news.content}
          </div>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="pt-6 border-t border-zinc-800 flex flex-wrap items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-500 font-mono-numbers uppercase">Topics:</span>
              {news.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs font-mono-numbers border border-zinc-800 bg-zinc-950 text-zinc-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t-2 border-white flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono-numbers text-zinc-500 truncate">
            TECHIE TEACHER&apos;S TRIBE TRUST · VERIFIED ACADEMIC BULLETIN
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 border-2 border-white shadow-[2px_2px_0px_0px_#ffffff] shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
