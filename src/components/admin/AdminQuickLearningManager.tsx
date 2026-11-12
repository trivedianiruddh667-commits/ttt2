import React, { useState, useMemo } from 'react';
import { QuickLearningItem, ContentStatus } from '../../data/db';
import {
  Plus,
  Search,
  Zap,
  Clock,
  Video,
  FileText,
  Copy,
  Edit3,
  Trash2,
  Archive,
  RotateCcw,
  CheckCircle,
  Eye,
  ExternalLink
} from 'lucide-react';

interface AdminQuickLearningManagerProps {
  items: QuickLearningItem[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (item: QuickLearningItem) => void;
  onDuplicateItem: (item: QuickLearningItem) => void;
  onUpdateStatus: (itemId: string, status: ContentStatus) => void;
  onDeleteItem: (itemId: string) => void;
}

export const AdminQuickLearningManager: React.FC<AdminQuickLearningManagerProps> = ({
  items,
  onOpenCreateModal,
  onOpenEditModal,
  onDuplicateItem,
  onUpdateStatus,
  onDeleteItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContentStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ? true : item.status === statusFilter;

      const matchesCat =
        categoryFilter === 'all' || item.subject === categoryFilter;

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [items, searchQuery, statusFilter, categoryFilter]);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.subject) set.add(i.subject);
    });
    return Array.from(set);
  }, [items]);

  const counts = useMemo(() => {
    let pub = 0;
    let draft = 0;
    let arch = 0;
    items.forEach((i) => {
      if (i.status === 'published') pub++;
      else if (i.status === 'archived') arch++;
      else draft++;
    });
    return { pub, draft, arch, total: items.length };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono-numbers">
            EXAM NIGHT ACCELERATOR CMS
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase text-white mt-1">
            Quick Learning Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Create and manage fast-track educational sprint topics, video lectures, and study manuscripts.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-5 py-3 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Quick Learning Topic</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3 text-left border-2 transition-colors ${
            statusFilter === 'all'
              ? 'border-white bg-white text-black'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block">Total Topics</span>
          <span className="text-xl font-heading font-black">{counts.total}</span>
        </button>

        <button
          onClick={() => setStatusFilter('published')}
          className={`p-3 text-left border-2 transition-colors ${
            statusFilter === 'published'
              ? 'border-emerald-400 bg-emerald-500 text-black'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block text-emerald-400">
            Published (Live)
          </span>
          <span className="text-xl font-heading font-black">{counts.pub}</span>
        </button>

        <button
          onClick={() => setStatusFilter('draft')}
          className={`p-3 text-left border-2 transition-colors ${
            statusFilter === 'draft'
              ? 'border-amber-400 bg-amber-400 text-black'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block text-amber-400">
            Drafts / Templates
          </span>
          <span className="text-xl font-heading font-black">{counts.draft}</span>
        </button>

        <button
          onClick={() => setStatusFilter('archived')}
          className={`p-3 text-left border-2 transition-colors ${
            statusFilter === 'archived'
              ? 'border-zinc-400 bg-zinc-700 text-white'
              : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
          }`}
        >
          <span className="text-[10px] font-mono-numbers uppercase tracking-wider block text-zinc-400">
            Archived
          </span>
          <span className="text-xl font-heading font-black">{counts.arch}</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quick learning topics by title, subject, or description..."
            className="w-full bg-black border-2 border-zinc-800 pl-9 pr-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter quick learning by subject"
          className="bg-black border-2 border-zinc-800 px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-white"
        >
          <option value="all">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {/* Topics Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center border-2 border-zinc-800 bg-zinc-950">
          <Zap className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-heading font-bold text-zinc-300 uppercase">
            No quick learning topics match the active filter
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Click "Add Quick Learning Topic" or reset your search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isPub = item.status === 'published';
            const isArch = item.status === 'archived';

            return (
              <div
                key={item.id}
                className="p-5 bg-zinc-950 border-2 border-zinc-800 hover:border-zinc-500 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-black border border-zinc-700 text-[10px] font-mono-numbers text-zinc-300 uppercase">
                      {item.subject}
                    </span>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono-numbers font-black uppercase border ${
                        isPub
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                          : isArch
                          ? 'border-zinc-500 bg-zinc-800 text-zinc-400'
                          : 'border-amber-400 bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-base font-heading font-black uppercase text-white leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-zinc-900 text-[11px] font-mono-numbers text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-white" />
                      {item.durationMinutes} mins
                    </span>

                    {item.videoUrl && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Video className="w-3.5 h-3.5" />
                        Video Attached
                      </span>
                    )}

                    {item.materialsUrl && (
                      <span className="flex items-center gap-1 text-white">
                        <FileText className="w-3.5 h-3.5" />
                        Notes PDF
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action Strip */}
                <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <div>
                    {isPub ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(item.id, 'draft')}
                        className="px-2.5 py-1 bg-black border border-zinc-700 text-zinc-300 hover:border-white text-[10px] font-mono-numbers uppercase transition-colors"
                      >
                        Unpublish to Draft
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(item.id, 'published')}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-mono-numbers font-black uppercase transition-colors"
                      >
                        Publish Live
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(item)}
                      className="p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                      title="Edit Topic"
                      aria-label={`Edit ${item.title}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicateItem(item)}
                      className="p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                      title="Duplicate as new Draft Template"
                      aria-label={`Duplicate ${item.title}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {isArch ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(item.id, 'draft')}
                        className="p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
                        title="Restore to Draft"
                        aria-label={`Restore ${item.title}`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(item.id, 'archived')}
                        className="p-1.5 border border-zinc-700 hover:border-white text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Archive Topic"
                        aria-label={`Archive ${item.title}`}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Delete Permanently"
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
