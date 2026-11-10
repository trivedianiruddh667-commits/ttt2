import React, { useState } from 'react';
import { SiteContent, AVAILABLE_GALLERY_IMAGES } from '../data/siteContent';
import { NavPage } from './Navbar';
import {
  Save,
  RotateCcw,
  ExternalLink,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  FileText,
  Home,
  Info,
  Users,
  Handshake,
  Zap,
  PhoneCall,
  LayoutTemplate,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface AdminCMSManagerProps {
  content: SiteContent;
  onSaveContent: (newContent: SiteContent) => void;
  onResetContent: () => void;
  onNavigate: (page: NavPage) => void;
}

type CMSPageKey = 'home' | 'about' | 'team' | 'collabs' | 'quickLearning' | 'contact' | 'footer';

export const AdminCMSManager: React.FC<AdminCMSManagerProps> = ({
  content,
  onSaveContent,
  onResetContent,
  onNavigate
}) => {
  const [formData, setFormData] = useState<SiteContent>(() => {
    const data = JSON.parse(JSON.stringify(content)) as SiteContent;
    if (data.team) {
      if (
        data.team.founderTitle === 'Er. Siddharth Sharma' ||
        data.team.founderTitle === 'Er. Siddharth "Techie" Sharma' ||
        !data.team.founderImageUrl ||
        !data.team.founderImageUrl.includes('Founder_photo')
      ) {
        data.team.founderTitle = 'Ajay "Techie" Kalki';
        data.team.founderBio =
          'Over the past decade, Ajay has mentored more than 1500 students across India. Disillusioned with outdated university slides and bulky foreign textbooks, he created the high-yield note methodology that turned average semester scorers into university rank holders.';
        data.team.founderImageUrl = '/assets/aistudio/Founder_photo_94b319e5.png';
      }
    }
    if (!data.team.technicalHeader) {
      data.team.technicalHeader = {
        badge: 'INFRASTRUCTURE & SYSTEMS CADRE',
        title: 'Technical Tribal',
        description:
          'The systems engineers and software architects building the high-speed infrastructure that delivers semester courses, real-time live doubt sessions, and handwritten notes without downtime.'
      };
    }
    if (!data.team.technicalMembers || data.team.technicalMembers.length === 0) {
      data.team.technicalMembers = [
        {
          name: 'Aniruddh Trivedi',
          role: 'Website Designer and Administrator',
          domain: 'UI/UX Architecture, Web Performance & Platform Administration',
          bio: "Lead designer and platform administrator of Techie Teacher's Tribe Trust. Architect of the high-impact visual design system, responsive student interfaces, and cloud platform operations.",
          experience: 'Lead Designer & Administrator',
          rating: 4.99,
          impactMetric: 'OFFICIAL PLATFORM ARCHITECT',
          imageUrl: '/assets/aistudio/Aniruddh_photo_47ab7886.png'
        },
        {
          name: 'Aryan Yadav',
          role: 'Researcher and Content Organiser',
          domain: 'Structuring Raw Information Into Organised Digital Assets, Websites And Knowledge Bases',
          bio: 'Specializes in structuring and transforming complex engineering curricula and raw research notes into organized, high-yield digital learning assets, structured portals, and student knowledge vaults.',
          experience: 'Content & Research Lead',
          rating: 4.97,
          impactMetric: 'CURRICULUM RESEARCH LEAD',
          imageUrl: '/assets/aistudio/Aryan_photo_2feeb48f.png'
        }
      ];
    }
    return data;
  });
  const [activePageKey, setActivePageKey] = useState<CMSPageKey>('home');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSave = () => {
    onSaveContent(formData);
    setHasUnsavedChanges(false);
    showNotification('All page modifications saved and published live!');
  };

  const handleConfirmReset = () => {
    onResetContent();
    setFormData(content);
    setHasUnsavedChanges(false);
    setConfirmResetOpen(false);
    showNotification('Content reverted to original settings.');
  };

  // Helper updater
  const updateSection = (updater: (prev: SiteContent) => SiteContent) => {
    setFormData((prev) => {
      const next = updater(JSON.parse(JSON.stringify(prev)));
      setHasUnsavedChanges(true);
      return next;
    });
  };

  const pagesList: { key: CMSPageKey; label: string; icon: any; targetNav: NavPage }[] = [
    { key: 'home', label: '1. Home Page', icon: Home, targetNav: 'home' },
    { key: 'about', label: '2. About Us', icon: Info, targetNav: 'about' },
    { key: 'team', label: '3. Our Tribe / Faculty', icon: Users, targetNav: 'team' },
    { key: 'collabs', label: '4. Collabs & Delivery', icon: Handshake, targetNav: 'collabs' },
    { key: 'quickLearning', label: '5. Quick Learning SOS', icon: Zap, targetNav: 'quick-learning' },
    { key: 'contact', label: '6. Contact & FAQs', icon: PhoneCall, targetNav: 'contact' },
    { key: 'footer', label: '7. Global Brand & Footer', icon: LayoutTemplate, targetNav: 'home' }
  ];

  const currentPageObj = pagesList.find((p) => p.key === activePageKey)!;

  return (
    <div className="bg-zinc-950 border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] p-6 sm:p-8 select-none">
      {/* Top Header of CMS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-8 border-b-2 border-white gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-400 uppercase font-bold">
            <LayoutTemplate className="w-4 h-4 text-white" />
            <span>CENTRALIZED SITE CONTENT MANAGEMENT SYSTEM (CMS)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase mt-1">
            Website Content & Media Editor
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Edit live headlines, body paragraphs, student testimonials, partner cards, FAQs, and imagery across every single page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate(currentPageObj.targetNav)}
            className="px-3.5 py-2 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-xs font-mono-numbers uppercase flex items-center gap-1.5 transition-colors"
            title="Preview live page in new view"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Live Page</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="px-3.5 py-2 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400 text-xs font-mono-numbers uppercase flex items-center gap-1.5 transition-colors"
            title="Reset text to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className={`px-5 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 border-white transition-all shadow-[3px_3px_0px_0px_#ffffff] ${
              hasUnsavedChanges
                ? 'bg-white text-black animate-pulse'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{hasUnsavedChanges ? 'Save Changes *' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Page Tabs Sidebar / Grid Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-zinc-800 pb-4">
        {pagesList.map((p) => {
          const Icon = p.icon;
          const isActive = activePageKey === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setActivePageKey(p.key)}
              className={`px-3.5 py-2 text-xs font-mono-numbers font-bold uppercase transition-colors flex items-center gap-2 border ${
                isActive
                  ? 'border-white bg-white text-black shadow-[2px_2px_0px_0px_#ffffff]'
                  : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Page Form Content */}
      <div className="space-y-8">
        {/* ========================================================= */}
        {/* 1. HOME PAGE CMS */}
        {/* ========================================================= */}
        {activePageKey === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Hero Block */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                HOME · HERO BANNER & CALLS TO ACTION
              </span>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Top Trust Badge / Eyebrow
                  </label>
                  <input
                    type="text"
                    value={formData.home.hero.badge}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.home.hero.badge = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Main Headline (Line 1 - White)
                    </label>
                    <input
                      type="text"
                      value={formData.home.hero.headlinePart1}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.hero.headlinePart1 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Main Headline (Line 2 - Grey)
                    </label>
                    <input
                      type="text"
                      value={formData.home.hero.headlinePart2}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.hero.headlinePart2 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-zinc-300 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Hero Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.home.hero.description}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.home.hero.description = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Primary CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={formData.home.hero.ctaExploreLabel}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.hero.ctaExploreLabel = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Secondary CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={formData.home.hero.ctaJoinLabel}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.hero.ctaJoinLabel = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Trust Strip Badges (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.home.hero.trustStrip.join(', ')}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.home.hero.trustStrip = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0);
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                  />
                </div>
              </div>
            </div>

            {/* Editorial Reality Check Block & Image Picker */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                HOME · EDITORIAL "REALITY CHECK" & FEATURED PHOTO
              </span>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Section Tag / Eyebrow
                    </label>
                    <input
                      type="text"
                      value={formData.home.editorial.badge}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.editorial.badge = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Editorial Headline
                    </label>
                    <input
                      type="text"
                      value={formData.home.editorial.headline}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.editorial.headline = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Editorial Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={formData.home.editorial.description}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.home.editorial.description = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Image Picker with live preview */}
                <div className="p-4 border border-zinc-800 bg-zinc-950">
                  <label className="block text-[11px] font-bold uppercase text-white mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-white" />
                    <span>Featured Image Source</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-8 space-y-2">
                      <select
                        value={formData.home.editorial.imageUrl}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.home.editorial.imageUrl = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-3 py-2 text-xs text-white"
                      >
                        {AVAILABLE_GALLERY_IMAGES.map((img) => (
                          <option key={img.id} value={img.url}>
                            {img.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Or enter custom image URL"
                        value={formData.home.editorial.imageUrl}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.home.editorial.imageUrl = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono-numbers"
                      />
                    </div>
                    <div className="sm:col-span-4 border border-zinc-700 h-24 overflow-hidden relative bg-black flex items-center justify-center">
                      <img
                        src={formData.home.editorial.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover filter grayscale"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Checkmark Bullets (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.home.editorial.checkPoints.join('\n')}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.home.editorial.checkPoints = e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0);
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                  />
                </div>
              </div>
            </div>

            {/* Stats Block */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                HOME · STATS COUNTERS (4 METRICS)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {formData.home.stats.map((stat, idx) => (
                  <div key={idx} className="p-3 border border-zinc-800 bg-zinc-950 space-y-2">
                    <span className="text-[10px] text-zinc-500 font-mono-numbers uppercase">
                      Stat #{idx + 1}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-mono-numbers">
                          Value
                        </label>
                        <input
                          type="number"
                          value={stat.value}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.home.stats[idx].value = Number(e.target.value);
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2 py-1 text-xs text-white font-mono-numbers font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase font-mono-numbers">
                          Suffix
                        </label>
                        <input
                          type="text"
                          value={stat.suffix}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.home.stats[idx].suffix = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2 py-1 text-xs text-white font-mono-numbers"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono-numbers">
                        Label
                      </label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.home.stats[idx].label = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-2 py-1 text-xs text-white font-mono-numbers"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials Block */}
            <div className="p-6 bg-black border-2 border-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 font-bold">
                  HOME · STUDENT TESTIMONIALS ({formData.home.testimonials.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateSection((d) => {
                      d.home.testimonials.push({
                        student: 'New Cadet Name',
                        score: 'SGPA 9.0',
                        college: 'University Institute of Technology',
                        branch: 'Computer Science, 4th Sem',
                        quote: 'The handwritten notes gave me clarity right before the end-term!'
                      });
                      return d;
                    })
                  }
                  className="px-3 py-1 bg-white text-black font-bold uppercase text-[11px] font-mono-numbers flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Testimonial</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.home.testimonials.map((t, idx) => (
                  <div key={idx} className="p-4 border border-zinc-800 bg-zinc-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono-numbers">
                        Testimonial #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSection((d) => {
                            d.home.testimonials.splice(idx, 1);
                            return d;
                          })
                        }
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete testimonial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Student Name</label>
                        <input
                          type="text"
                          value={t.student}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.home.testimonials[idx].student = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Score / Badge</label>
                        <input
                          type="text"
                          value={t.score}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.home.testimonials[idx].score = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">College / University</label>
                        <input
                          type="text"
                          value={t.college}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.home.testimonials[idx].college = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Branch & Sem</label>
                        <input
                          type="text"
                          value={t.branch}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.home.testimonials[idx].branch = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase">Quote Review</label>
                      <textarea
                        rows={2}
                        value={t.quote}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.home.testimonials[idx].quote = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slogan Banners */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                HOME · 3 MONOCHROME SLOGAN BANNERS
              </span>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Banner 1 Slogan</label>
                    <input
                      type="text"
                      value={formData.home.slogans.slogan1}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.slogans.slogan1 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Banner 1 Subtext</label>
                    <input
                      type="text"
                      value={formData.home.slogans.subtext1}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.slogans.subtext1 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Banner 2 Slogan (Inverted)</label>
                    <input
                      type="text"
                      value={formData.home.slogans.slogan2}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.slogans.slogan2 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Banner 2 Subtext</label>
                    <input
                      type="text"
                      value={formData.home.slogans.subtext2}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.slogans.subtext2 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Banner 3 Slogan</label>
                    <input
                      type="text"
                      value={formData.home.slogans.slogan3}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.slogans.slogan3 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Banner 3 Subtext</label>
                    <input
                      type="text"
                      value={formData.home.slogans.subtext3}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.home.slogans.subtext3 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. ABOUT US PAGE CMS */}
        {/* ========================================================= */}
        {activePageKey === 'about' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                ABOUT · HEADER HERO BLOCK
              </span>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={formData.about.header.badge}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.about.header.badge = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Title Line 1
                    </label>
                    <input
                      type="text"
                      value={formData.about.header.titleLine1}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.about.header.titleLine1 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Title Line 2 (Sub-color)
                    </label>
                    <input
                      type="text"
                      value={formData.about.header.titleLine2}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.about.header.titleLine2 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-zinc-300 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Introduction Paragraph
                  </label>
                  <textarea
                    rows={2}
                    value={formData.about.header.description}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.about.header.description = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Story & Photo */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                ABOUT · CHAPTER 01 STORY & CAMPUS PHOTO
              </span>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Chapter Badge
                    </label>
                    <input
                      type="text"
                      value={formData.about.story.badge}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.about.story.badge = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Story Headline
                    </label>
                    <input
                      type="text"
                      value={formData.about.story.headline}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.about.story.headline = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Paragraph 1
                  </label>
                  <textarea
                    rows={2}
                    value={formData.about.story.paragraph1}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.about.story.paragraph1 = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Paragraph 2
                  </label>
                  <textarea
                    rows={2}
                    value={formData.about.story.paragraph2}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.about.story.paragraph2 = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Callout Quote Box
                  </label>
                  <input
                    type="text"
                    value={formData.about.story.quoteBox}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.about.story.quoteBox = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                  />
                </div>

                {/* Campus image */}
                <div className="p-4 border border-zinc-800 bg-zinc-950">
                  <label className="block text-[11px] font-bold uppercase text-white mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-white" />
                    <span>Story Photograph</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-8 space-y-2">
                      <select
                        value={formData.about.story.imageUrl}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.about.story.imageUrl = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-3 py-2 text-xs text-white"
                      >
                        {AVAILABLE_GALLERY_IMAGES.map((img) => (
                          <option key={img.id} value={img.url}>
                            {img.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Or custom image URL"
                        value={formData.about.story.imageUrl}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.about.story.imageUrl = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono-numbers"
                      />
                    </div>
                    <div className="sm:col-span-4 border border-zinc-700 h-24 overflow-hidden relative bg-black flex items-center justify-center">
                      <img
                        src={formData.about.story.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover filter grayscale"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Laws / Pillars */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                ABOUT · THE THREE LAWS / PILLARS
              </span>
              <div className="space-y-4">
                {formData.about.pillars.map((pillar, idx) => (
                  <div key={idx} className="p-4 border border-zinc-800 bg-zinc-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono-numbers">
                        Pillar #{pillar.number}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Title</label>
                        <input
                          type="text"
                          value={pillar.title}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.about.pillars[idx].title = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Tag / Sub-label</label>
                        <input
                          type="text"
                          value={pillar.tag}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.about.pillars[idx].tag = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase">Description</label>
                      <textarea
                        rows={2}
                        value={pillar.description}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.about.pillars[idx].description = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. OUR TRIBE / TEAM PAGE CMS */}
        {/* ========================================================= */}
        {activePageKey === 'team' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                TEAM · PAGE HEADER
              </span>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Tag Badge
                    </label>
                    <input
                      type="text"
                      value={formData.team.header.badge}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.team.header.badge = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={formData.team.header.title}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.team.header.title = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.team.header.description}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.team.header.description = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Founder Spotlight */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                TEAM · FOUNDER SPOTLIGHT SECTION
              </span>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Founder Name & Title
                    </label>
                    <input
                      type="text"
                      value={formData.team.founderTitle}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.team.founderTitle = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Role & Credentials
                    </label>
                    <input
                      type="text"
                      value={formData.team.founderSub}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.team.founderSub = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Founder Bio / Story
                  </label>
                  <textarea
                    rows={3}
                    value={formData.team.founderBio}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.team.founderBio = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Founder Direct Quote
                  </label>
                  <input
                    type="text"
                    value={formData.team.founderQuote}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.team.founderQuote = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Founder Photo */}
                <div className="p-4 border border-zinc-800 bg-zinc-950">
                  <label className="block text-[11px] font-bold uppercase text-white mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-white" />
                    <span>Founder Portrait Photo</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-8 space-y-2">
                      <select
                        value={formData.team.founderImageUrl}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.team.founderImageUrl = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-3 py-2 text-xs text-white"
                      >
                        {AVAILABLE_GALLERY_IMAGES.map((img) => (
                          <option key={img.id} value={img.url}>
                            {img.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Or custom image URL"
                        value={formData.team.founderImageUrl}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.team.founderImageUrl = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono-numbers"
                      />
                    </div>
                    <div className="sm:col-span-4 border border-zinc-700 h-24 overflow-hidden relative bg-black flex items-center justify-center">
                      <img
                        src={formData.team.founderImageUrl}
                        alt="Founder Preview"
                        className="w-full h-full object-cover filter grayscale"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Faculty Members List */}
            <div className="p-6 bg-black border-2 border-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 font-bold">
                  TEAM · FACULTY MENTORS ({formData.team.members.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateSection((d) => {
                      d.team.members.push({
                        name: 'Prof. New Mentor',
                        role: 'Senior Academician',
                        subject: 'Engineering Subject Specialist',
                        bio: 'Specialist in making core engineering concepts intuitive.',
                        experience: '8 Years Teaching',
                        rating: 4.9,
                        studentsTaught: '15,000+'
                      });
                      return d;
                    })
                  }
                  className="px-3 py-1 bg-white text-black font-bold uppercase text-[11px] font-mono-numbers flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Faculty Mentor</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.team.members.map((m, idx) => (
                  <div key={idx} className="p-4 border border-zinc-800 bg-zinc-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono-numbers">
                        Faculty #{idx + 1}: {m.name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSection((d) => {
                            d.team.members.splice(idx, 1);
                            return d;
                          })
                        }
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Name</label>
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.team.members[idx].name = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Role / Title</label>
                        <input
                          type="text"
                          value={m.role}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.team.members[idx].role = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Subject Domain</label>
                        <input
                          type="text"
                          value={m.subject}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.team.members[idx].subject = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase">Bio / Background</label>
                      <textarea
                        rows={2}
                        value={m.bio}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.team.members[idx].bio = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Experience</label>
                        <input
                          type="text"
                          value={m.experience}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.team.members[idx].experience = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Rating</label>
                        <input
                          type="number"
                          step={0.01}
                          value={m.rating}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.team.members[idx].rating = Number(e.target.value);
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Students Taught</label>
                        <input
                          type="text"
                          value={m.studentsTaught}
                          onChange={(e) =>
                            updateSection((d) => {
                              d.team.members[idx].studentsTaught = e.target.value;
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Tribal Section Header & Staff */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                TEAM · TECHNICAL TRIBAL SECTION HEADER
              </span>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Section Tag / Badge
                    </label>
                    <input
                      type="text"
                      value={formData.team.technicalHeader?.badge || 'INFRASTRUCTURE & SYSTEMS CADRE'}
                      onChange={(e) =>
                        updateSection((d) => {
                          if (!d.team.technicalHeader) {
                            d.team.technicalHeader = {
                              badge: e.target.value,
                              title: 'Technical Tribal',
                              description: ''
                            };
                          } else {
                            d.team.technicalHeader.badge = e.target.value;
                          }
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Section Heading
                    </label>
                    <input
                      type="text"
                      value={formData.team.technicalHeader?.title || 'Technical Tribal'}
                      onChange={(e) =>
                        updateSection((d) => {
                          if (!d.team.technicalHeader) {
                            d.team.technicalHeader = {
                              badge: 'INFRASTRUCTURE & SYSTEMS CADRE',
                              title: e.target.value,
                              description: ''
                            };
                          } else {
                            d.team.technicalHeader.title = e.target.value;
                          }
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Section Description
                  </label>
                  <textarea
                    rows={2}
                    value={
                      formData.team.technicalHeader?.description ||
                      'The systems engineers and software architects building the high-speed infrastructure that delivers semester courses, real-time live doubt sessions, and handwritten notes without downtime.'
                    }
                    onChange={(e) =>
                      updateSection((d) => {
                        if (!d.team.technicalHeader) {
                          d.team.technicalHeader = {
                            badge: 'INFRASTRUCTURE & SYSTEMS CADRE',
                            title: 'Technical Tribal',
                            description: e.target.value
                          };
                        } else {
                          d.team.technicalHeader.description = e.target.value;
                        }
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Technical Tribal Staff Profiles List */}
            <div className="p-6 bg-black border-2 border-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 font-bold">
                  TEAM · TECHNICAL TRIBAL STAFF ({(formData.team.technicalMembers || []).length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateSection((d) => {
                      if (!d.team.technicalMembers) d.team.technicalMembers = [];
                      d.team.technicalMembers.push({
                        name: 'Er. New Technical Staff',
                        role: 'Systems Engineer',
                        domain: 'Cloud Infrastructure & Automation',
                        bio: 'Specialist in scaling high-throughput academic delivery clusters.',
                        experience: '6+ Years Systems',
                        rating: 4.9,
                        impactMetric: '99.95% UPTIME'
                      });
                      return d;
                    })
                  }
                  className="px-3 py-1 bg-white text-black font-bold uppercase text-[11px] font-mono-numbers flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Technical Staff</span>
                </button>
              </div>

              <div className="space-y-4">
                {(formData.team.technicalMembers || []).map((m, idx) => (
                  <div key={idx} className="p-4 border border-zinc-800 bg-zinc-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono-numbers">
                        Staff #{idx + 1}: {m.name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSection((d) => {
                            if (d.team.technicalMembers) {
                              d.team.technicalMembers.splice(idx, 1);
                            }
                            return d;
                          })
                        }
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete technical staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Name</label>
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) =>
                            updateSection((d) => {
                              if (d.team.technicalMembers) {
                                d.team.technicalMembers[idx].name = e.target.value;
                              }
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Role / Title</label>
                        <input
                          type="text"
                          value={m.role}
                          onChange={(e) =>
                            updateSection((d) => {
                              if (d.team.technicalMembers) {
                                d.team.technicalMembers[idx].role = e.target.value;
                              }
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Specialization / Domain</label>
                        <input
                          type="text"
                          value={m.domain}
                          onChange={(e) =>
                            updateSection((d) => {
                              if (d.team.technicalMembers) {
                                d.team.technicalMembers[idx].domain = e.target.value;
                              }
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase">Bio / Background</label>
                      <textarea
                        rows={2}
                        value={m.bio}
                        onChange={(e) =>
                          updateSection((d) => {
                            if (d.team.technicalMembers) {
                              d.team.technicalMembers[idx].bio = e.target.value;
                            }
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Experience</label>
                        <input
                          type="text"
                          value={m.experience}
                          onChange={(e) =>
                            updateSection((d) => {
                              if (d.team.technicalMembers) {
                                d.team.technicalMembers[idx].experience = e.target.value;
                              }
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Rating</label>
                        <input
                          type="number"
                          step={0.01}
                          value={m.rating}
                          onChange={(e) =>
                            updateSection((d) => {
                              if (d.team.technicalMembers) {
                                d.team.technicalMembers[idx].rating = Number(e.target.value);
                              }
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 uppercase">Impact Metric</label>
                        <input
                          type="text"
                          value={m.impactMetric}
                          onChange={(e) =>
                            updateSection((d) => {
                              if (d.team.technicalMembers) {
                                d.team.technicalMembers[idx].impactMetric = e.target.value;
                              }
                              return d;
                            })
                          }
                          className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                        />
                      </div>
                    </div>

                    {/* Image URL with preview */}
                    <div className="pt-2 border-t border-zinc-900">
                      <label className="text-[10px] text-zinc-400 uppercase flex items-center gap-1.5 mb-1">
                        <ImageIcon className="w-3 h-3 text-white" />
                        <span>Staff Portrait Image URL</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-9">
                          <input
                            type="text"
                            placeholder="Enter image URL or select from gallery"
                            value={m.imageUrl || ''}
                            onChange={(e) =>
                              updateSection((d) => {
                                if (d.team.technicalMembers) {
                                  d.team.technicalMembers[idx].imageUrl = e.target.value;
                                }
                                return d;
                              })
                            }
                            className="w-full bg-black border border-zinc-700 px-2.5 py-1.5 text-xs text-white font-mono-numbers"
                          />
                        </div>
                        <div className="sm:col-span-3 border border-zinc-800 bg-black h-14 flex items-center justify-center overflow-hidden">
                          {m.imageUrl ? (
                            <img
                              src={m.imageUrl}
                              alt="Staff preview"
                              className="w-full h-full object-cover filter grayscale"
                            />
                          ) : (
                            <span className="text-[10px] text-zinc-600 font-mono-numbers">NO PHOTO</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. COLLABS PAGE CMS */}
        {/* ========================================================= */}
        {activePageKey === 'collabs' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                COLLABS · PAGE HEADER
              </span>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Header Badge
                    </label>
                    <input
                      type="text"
                      value={formData.collabs.header.badge}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.collabs.header.badge = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={formData.collabs.header.title}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.collabs.header.title = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Introduction Paragraph
                  </label>
                  <textarea
                    rows={2}
                    value={formData.collabs.header.description}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.collabs.header.description = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Blinkit Card */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                COLLABS · BLINKIT 10-MINUTE PRINT PARTNERSHIP
              </span>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Partner Headline</label>
                    <input
                      type="text"
                      value={formData.collabs.blinkit.headline}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.collabs.blinkit.headline = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Badge Label</label>
                    <input
                      type="text"
                      value={formData.collabs.blinkit.partnerBadge}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.collabs.blinkit.partnerBadge = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Description</label>
                  <textarea
                    rows={2}
                    value={formData.collabs.blinkit.description}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.collabs.blinkit.description = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Promo Coupon Code</label>
                    <input
                      type="text"
                      value={formData.collabs.blinkit.promoCode}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.collabs.blinkit.promoCode = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono-numbers font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Discount Callout</label>
                    <input
                      type="text"
                      value={formData.collabs.blinkit.discountText}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.collabs.blinkit.discountText = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Features (1 per line)</label>
                  <textarea
                    rows={3}
                    value={formData.collabs.blinkit.features.join('\n')}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.collabs.blinkit.features = e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0);
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono-numbers"
                  />
                </div>
              </div>
            </div>

            {/* Zepto Card */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                COLLABS · ZEPTO NIGHT SPRINT PARTNERSHIP
              </span>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Partner Headline</label>
                    <input
                      type="text"
                      value={formData.collabs.zepto.headline}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.collabs.zepto.headline = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Badge Label</label>
                    <input
                      type="text"
                      value={formData.collabs.zepto.partnerBadge}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.collabs.zepto.partnerBadge = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Description</label>
                  <textarea
                    rows={2}
                    value={formData.collabs.zepto.description}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.collabs.zepto.description = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Promo Coupon Code</label>
                    <input
                      type="text"
                      value={formData.collabs.zepto.promoCode}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.collabs.zepto.promoCode = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono-numbers font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase">Discount Callout</label>
                    <input
                      type="text"
                      value={formData.collabs.zepto.discountText}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.collabs.zepto.discountText = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Features (1 per line)</label>
                  <textarea
                    rows={3}
                    value={formData.collabs.zepto.features.join('\n')}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.collabs.zepto.features = e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0);
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white font-mono-numbers"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. QUICK LEARNING PAGE CMS */}
        {/* ========================================================= */}
        {activePageKey === 'quickLearning' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                QUICK LEARNING · PAGE HEADER & SOS BANNER
              </span>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Header Badge
                    </label>
                    <input
                      type="text"
                      value={formData.quickLearning.header.badge}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.quickLearning.header.badge = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={formData.quickLearning.header.title}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.quickLearning.header.title = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Introduction Paragraph
                  </label>
                  <textarea
                    rows={2}
                    value={formData.quickLearning.header.description}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.quickLearning.header.description = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      SOS Rescue Banner Headline
                    </label>
                    <input
                      type="text"
                      value={formData.quickLearning.sosBannerTitle}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.quickLearning.sosBannerTitle = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-bold font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      SOS Rescue Banner Subtext
                    </label>
                    <input
                      type="text"
                      value={formData.quickLearning.sosBannerSubtext}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.quickLearning.sosBannerSubtext = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                QUICK LEARNING · 3 SPRINT ADVANTAGES
              </span>
              <div className="space-y-4">
                {formData.quickLearning.features.map((f, idx) => (
                  <div key={idx} className="p-3 border border-zinc-800 bg-zinc-950 space-y-2">
                    <span className="text-[10px] text-zinc-500 font-mono-numbers uppercase">
                      Advantage #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={f.title}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.quickLearning.features[idx].title = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-black border border-zinc-700 px-3 py-1.5 text-xs text-white font-bold"
                    />
                    <textarea
                      rows={2}
                      value={f.description}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.quickLearning.features[idx].description = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-black border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. CONTACT & FAQS PAGE CMS */}
        {/* ========================================================= */}
        {activePageKey === 'contact' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                CONTACT · PAGE HEADER & SOS HELPLINE DETAILS
              </span>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Header Badge
                    </label>
                    <input
                      type="text"
                      value={formData.contact.header.badge}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.contact.header.badge = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={formData.contact.header.title}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.contact.header.title = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Introduction Paragraph
                  </label>
                  <textarea
                    rows={2}
                    value={formData.contact.header.description}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.contact.header.description = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      SOS Phone Line 1
                    </label>
                    <input
                      type="text"
                      value={formData.contact.phone1}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.contact.phone1 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      SOS Phone Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.contact.phone2}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.contact.phone2 = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact.emailSupport}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.contact.emailSupport = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Directorate / Grievance Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact.emailGrievance}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.contact.emailGrievance = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Physical Headquarters Address
                  </label>
                  <input
                    type="text"
                    value={formData.contact.officeAddress}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.contact.officeAddress = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Office Hours Availability
                  </label>
                  <input
                    type="text"
                    value={formData.contact.officeHours}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.contact.officeHours = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                  />
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="p-6 bg-black border-2 border-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 font-bold">
                  CONTACT · FREQUENTLY ASKED QUESTIONS ({formData.contact.faqs.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateSection((d) => {
                      d.contact.faqs.push({
                        question: 'New Question for University Students?',
                        answer: 'Clear explanation and guidance provided here.'
                      });
                      return d;
                    })
                  }
                  className="px-3 py-1 bg-white text-black font-bold uppercase text-[11px] font-mono-numbers flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add FAQ Item</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.contact.faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 border border-zinc-800 bg-zinc-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono-numbers">
                        FAQ #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSection((d) => {
                            d.contact.faqs.splice(idx, 1);
                            return d;
                          })
                        }
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase">Question</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.contact.faqs[idx].question = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-3 py-1.5 text-xs text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase">Answer</label>
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) =>
                          updateSection((d) => {
                            d.contact.faqs[idx].answer = e.target.value;
                            return d;
                          })
                        }
                        className="w-full bg-black border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. GLOBAL BRAND & FOOTER CMS */}
        {/* ========================================================= */}
        {activePageKey === 'footer' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div className="p-6 bg-black border-2 border-white">
              <span className="text-xs font-mono-numbers uppercase tracking-widest text-zinc-400 block mb-3 font-bold">
                GLOBAL FOOTER & BRAND METADATA
              </span>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Footer Brand Statement / Overview
                  </label>
                  <textarea
                    rows={3}
                    value={formData.footer.brandDescription}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.footer.brandDescription = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Establishment Year Tag
                    </label>
                    <input
                      type="text"
                      value={formData.footer.estYear}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.footer.estYear = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Enrolled Tagline
                    </label>
                    <input
                      type="text"
                      value={formData.footer.enrolledCount}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.footer.enrolledCount = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      ISO Compliance Tag
                    </label>
                    <input
                      type="text"
                      value={formData.footer.isoCompliance}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.footer.isoCompliance = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Emergency Desk Email
                    </label>
                    <input
                      type="text"
                      value={formData.footer.emergencyEmail}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.footer.emergencyEmail = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Telegram Cadet Handle
                    </label>
                    <input
                      type="text"
                      value={formData.footer.telegramCommunity}
                      onChange={(e) =>
                        updateSection((d) => {
                          d.footer.telegramCommunity = e.target.value;
                          return d;
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Legal Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={formData.footer.copyrightText}
                    onChange={(e) =>
                      updateSection((d) => {
                        d.footer.copyrightText = e.target.value;
                        return d;
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-zinc-300 font-mono-numbers"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Save confirmation notification */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-black p-4 border-2 border-black font-mono-numbers text-xs font-bold shadow-[6px_6px_0px_0px_#000000] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Reset Site Copy to Defaults"
        message="This will revert ALL home slogans, banners, about text, contact information, and footer details back to factory defaults. This cannot be undone."
        confirmLabel="Yes, Reset All Copy"
        variant="danger"
        onConfirm={handleConfirmReset}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
