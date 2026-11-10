import React, { useState, useMemo } from 'react';
import { DailyNewsItem } from '../data/db';
import {
  Newspaper,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Edit3,
  Trash2,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';

interface DailyNewsSectionProps {
  newsList: DailyNewsItem[];
  canManageContent?: boolean;
  onOpenArticle: (news: DailyNewsItem) => void;
  onOpenCreateNews: () => void;
  onOpenEditNews: (news: DailyNewsItem) => void;
  onDeleteNews: (newsId: string) => void;
}

export const DailyNewsSection: React.FC<DailyNewsSectionProps> = ({
  newsList,
  canManageContent = false,
  onOpenArticle,
  onOpenCreateNews,
  onOpenEditNews,
  onDeleteNews
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Exam Alert',
    'Curriculum Update',
    'Tech & Placements',
    'Campus News',
    'Tribe Dispatch'
  ];

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [newsList, selectedCategory, searchQuery]);

  // Breaking items for ticker
  const breakingItems = newsList.filter((n) => n.isBreaking);

  // Featured article: first pinned or breaking item
  const featuredArticle = filteredNews[0] || null;
  const secondaryArticles = filteredNews.slice(1);

  return (
    <section className="border-b-2 border-white bg-black py-20 px-4 sm:px-6 lg:px-8 relative select-none">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b-2 border-white pb-6 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-zinc-400 font-mono-numbers">
              <Newspaper className="w-4 h-4 text-white" />
              <span>CAMPUS DISPATCH & EXAM INTEL</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-black uppercase tracking-tight mt-2">
              Daily News & Bulletins
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Real-time intelligence on university timetables, AICTE syllabus overhauls, placement trends, and Tribe release notes. Updated daily by our faculty.
            </p>
          </div>

          {canManageContent && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenCreateNews}
                className="px-5 py-3 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-transform active:scale-95 flex items-center gap-2 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]"
              >
                <Plus className="w-4 h-4" />
                <span>Add News Article</span>
              </button>
            </div>
          )}
        </div>

        {/* Breaking News Marquee/Ticker Bar */}
        {breakingItems.length > 0 && (
          <div className="mb-8 p-3 bg-zinc-950 border-2 border-white flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-[4px_4px_0px_0px_#ffffff]">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-red-600 text-white text-[11px] font-mono-numbers font-black uppercase shrink-0">
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>BREAKING INTEL</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-4 text-xs font-mono-numbers text-zinc-300">
                <span className="font-bold text-white hover:underline cursor-pointer" onClick={() => onOpenArticle(breakingItems[0])}>
                  {breakingItems[0].title}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">{breakingItems[0].summary}</span>
              </div>
            </div>
            <button
              onClick={() => onOpenArticle(breakingItems[0])}
              className="text-[11px] font-mono-numbers font-bold text-white hover:underline uppercase shrink-0 flex items-center gap-1"
            >
              <span>Read Bulletin</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono-numbers font-bold uppercase transition-colors border ${
                  selectedCategory === cat
                    ? 'border-white bg-white text-black'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news by topic, university, keyword..."
              className="w-full bg-zinc-950 border-2 border-zinc-800 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white font-mono-numbers"
            />
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="p-12 text-center bg-zinc-950 border-2 border-dashed border-zinc-800">
            <Newspaper className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-heading font-black uppercase text-zinc-300">
              No matching bulletins found
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Try adjusting your search terms or filter selection.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 border border-zinc-700 hover:border-white text-xs uppercase font-mono-numbers"
              >
                Reset Filters
              </button>
              {canManageContent && (
                <button
                  onClick={onOpenCreateNews}
                  className="px-4 py-2 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200"
                >
                  + Add New Article
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Featured Hero News Card */}
            {featuredArticle && (
              <div className="border-4 border-white bg-zinc-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ffffff] grid grid-cols-1 lg:grid-cols-12 gap-6 relative group">
                <div className="lg:col-span-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs uppercase font-mono-numbers font-black px-2 py-0.5 border border-white bg-white text-black">
                        {featuredArticle.category}
                      </span>
                      {featuredArticle.isBreaking && (
                        <span className="text-xs uppercase font-mono-numbers font-bold px-2 py-0.5 bg-red-600 text-white">
                          BREAKING
                        </span>
                      )}
                      {featuredArticle.isPinned && (
                        <span className="text-xs uppercase font-mono-numbers font-bold px-2 py-0.5 border border-zinc-700 bg-black text-zinc-300">
                          PINNED TOP
                        </span>
                      )}
                      <span className="text-xs font-mono-numbers text-zinc-400 ml-auto">
                        {featuredArticle.date} · {featuredArticle.readTime}
                      </span>
                    </div>

                    <h3
                      onClick={() => onOpenArticle(featuredArticle)}
                      className="text-xl sm:text-3xl font-heading font-black uppercase tracking-tight text-white hover:underline cursor-pointer leading-tight"
                    >
                      {featuredArticle.title}
                    </h3>

                    <p className="text-sm text-zinc-300 mt-4 leading-relaxed line-clamp-3">
                      {featuredArticle.summary}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-400">
                      <User className="w-3.5 h-3.5 text-white" />
                      <span>
                        By <strong className="text-white">{featuredArticle.author}</strong>
                        {featuredArticle.authorRole && ` (${featuredArticle.authorRole})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {canManageContent && (
                        <>
                          <button
                            onClick={() => onOpenEditNews(featuredArticle)}
                            className="px-3 py-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-xs font-mono-numbers uppercase flex items-center gap-1.5 transition-colors"
                            title="Edit this news article"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteNews(featuredArticle.id)}
                            className="p-2 border border-zinc-800 hover:border-red-500 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onOpenArticle(featuredArticle)}
                        className="px-4 py-1.5 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 flex items-center gap-2 transition-colors border border-white"
                      >
                        <span>Read Full Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-black border-2 border-white p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-2 font-bold">
                      KEY TAKEAWAYS FOR STUDENTS
                    </span>
                    <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
                      <p className="line-clamp-4">
                        {featuredArticle.content.slice(0, 220)}...
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-900">
                    <div className="flex flex-wrap gap-1.5">
                      {featuredArticle.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-mono-numbers border border-zinc-800 text-zinc-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Articles Grid */}
            {secondaryArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {secondaryArticles.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-950 border-2 border-white flex flex-col justify-between shadow-[6px_6px_0px_0px_#ffffff] hover:-translate-y-1 transition-transform group"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono-numbers font-bold px-2 py-0.5 border border-zinc-700 bg-black text-zinc-300 uppercase">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1">
                          {item.isBreaking && (
                            <span className="text-[10px] font-mono-numbers font-black px-1.5 py-0.5 bg-red-600 text-white uppercase">
                              BREAKING
                            </span>
                          )}
                          <span className="text-[11px] font-mono-numbers text-zinc-500">
                            {item.date}
                          </span>
                        </div>
                      </div>

                      <h4
                        onClick={() => onOpenArticle(item)}
                        className="text-base font-heading font-black uppercase text-white hover:underline cursor-pointer leading-snug line-clamp-2"
                      >
                        {item.title}
                      </h4>

                      <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed line-clamp-3">
                        {item.summary}
                      </p>
                    </div>

                    <div className="p-4 bg-black border-t-2 border-white flex items-center justify-between text-xs font-mono-numbers">
                      <div className="text-[11px] text-zinc-500 truncate max-w-[120px]">
                        By {item.author}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {canManageContent && (
                          <>
                            <button
                              onClick={() => onOpenEditNews(item)}
                              className="p-1.5 border border-zinc-800 hover:border-white text-zinc-400 hover:text-white transition-colors"
                              title="Edit this article"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteNews(item.id)}
                              className="p-1.5 border border-zinc-800 hover:border-red-500 text-zinc-500 hover:text-red-400 transition-colors"
                              title="Delete article"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onOpenArticle(item)}
                          className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-white bg-white text-black hover:bg-zinc-200 transition-colors"
                        >
                          Read
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
