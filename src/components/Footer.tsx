import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { NavPage } from './Navbar';
import { MessageSquare, Mail, Phone, ArrowUpRight, Lock, GraduationCap, Send } from 'lucide-react';
import { SiteContent } from '../data/siteContent';
import { LegalPolicyModal, LegalPolicyTab } from './LegalPolicyModal';

interface FooterProps {
  content?: SiteContent['footer'];
  contactContent?: SiteContent['contact'];
  onNavigate: (page: NavPage) => void;
  isVerifiedTeacher?: boolean;
  onOpenRequestTeacherModal?: () => void;
}

const DEFAULT_FOOTER: SiteContent['footer'] = {
  brandDescription:
    "Techie Teacher's Tribe Trust is an autonomous engineering ed-tech initiative. We produce zero-fluff semester crash courses, handwritten exam booster formulas, and syllabus masterpacks for college and university students nationwide.",
  estYear: 'EST. 2024',
  enrolledCount: '42,000+ ENROLLED',
  isoCompliance: 'ISO 9001:2015 COMPLIANT CURRICULUM',
  copyrightText: "TECHIE TEACHER'S TRIBE TRUST. ALL RIGHTS RESERVED.",
  emergencyEmail: 'sos@techieteachertribe.org',
  telegramCommunity: 'https://t.me/techieteachertribe'
};

export const Footer: React.FC<FooterProps> = ({
  content = DEFAULT_FOOTER,
  contactContent,
  onNavigate,
  isVerifiedTeacher = false,
  onOpenRequestTeacherModal
}) => {
  const [legalTab, setLegalTab] = useState<LegalPolicyTab | null>(null);

  const phone1Display = contactContent?.phone1 || '+91 98765 43210';
  const phone1Digits = phone1Display.replace(/\D/g, '') || '919876543210';
  const phone2Display = contactContent?.phone2 || '+91 11 4099 8800';
  const phone2Href = `tel:${phone2Display.replace(/[^+\d]/g, '') || '+911140998800'}`;
  const supportEmail = contactContent?.emailSupport || 'queries@techieteachertribe.org';
  const emergencyEmail = content.emergencyEmail || 'sos@techieteachertribe.org';
  const telegramHref = content.telegramCommunity.startsWith('http')
    ? content.telegramCommunity
    : `https://t.me/${content.telegramCommunity.replace(/^@/, '')}`;

  const quickLinks: { id: NavPage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'courses', label: 'All Courses' },
    { id: 'quick-learning', label: 'Quick Learning' },
    { id: 'teachers', label: 'Verified Teachers' },
    { id: 'team', label: 'Our Tribe' },
    { id: 'contact', label: 'Contact & SOS' },
    { id: 'collabs', label: 'Blinkit & Zepto Collabs' },
    { id: 'student-login', label: 'Student Portal' },
    ...(isVerifiedTeacher ? [{ id: 'teacher-portal' as NavPage, label: 'Teachers Portal' }] : []),
    { id: 'admin-panel', label: 'Admin Panel (Passkey)' }
  ];

  return (
    <footer className="bg-black text-white border-t-4 border-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Column 1: Brand & Identity (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            <BrandLogo variant="footer" />
            <p className="text-zinc-400 text-sm max-w-sm leading-relaxed font-normal">
              {content.brandDescription}
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono-numbers text-zinc-500">
              <span>{content.estYear}</span>
              <span>·</span>
              <span>{content.enrolledCount}</span>
              <span>·</span>
              <span>{content.isoCompliance}</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 font-mono-numbers">
              NAVIGATION
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="min-h-[36px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Portals & Collabs */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 font-mono-numbers">
              PORTALS &amp; COLLABS
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.slice(5).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="min-h-[36px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
              {onOpenRequestTeacherModal && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenRequestTeacherModal}
                    className="min-h-[36px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Apply as Faculty</span>
                  </button>
                </li>
              )}
              <li className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('admin-panel');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="min-h-[44px] px-3 py-2 border border-zinc-700 bg-zinc-900 text-white text-xs font-semibold flex items-center gap-2 hover:bg-white hover:text-black transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Admin Panel (Passkey)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Emergency Desk */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 font-mono-numbers">
              CAMPUS DESK
            </h4>
            <div className="space-y-3 text-sm text-zinc-400">
              <a
                href={`https://wa.me/${phone1Digits}?text=Hello%20Techie%20Teacher's%20Tribe%20Trust`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <MessageSquare className="w-4 h-4 shrink-0 text-white" />
                <span>WhatsApp: {phone1Display}</span>
              </a>
              <a
                href={phone2Href}
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0 text-white" />
                <span>Helpline: {phone2Display}</span>
              </a>
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors break-all"
              >
                <Mail className="w-4 h-4 shrink-0 text-white" />
                <span>{supportEmail}</span>
              </a>
              <a
                href={`mailto:${emergencyEmail}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors text-xs text-zinc-400 break-all"
              >
                <Mail className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                <span>Exam SOS: {emergencyEmail}</span>
              </a>
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition-colors text-xs text-zinc-400"
              >
                <Send className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                <span>Join Telegram Tribe Channel</span>
              </a>
              <p className="text-xs text-zinc-500 pt-1">
                Mon - Sat · 08:00 to 22:00 IST<br />
                Exam Night SOS: 24/7 on WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar with stark divider */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono-numbers">
          <p>© {new Date().getFullYear()} {content.copyrightText}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => setLegalTab('terms')}
              className="min-h-[40px] px-1 hover:text-white transition-colors cursor-pointer uppercase"
            >
              TERMS OF TRUST
            </button>
            <button
              type="button"
              onClick={() => setLegalTab('ethics')}
              className="min-h-[40px] px-1 hover:text-white transition-colors cursor-pointer uppercase"
            >
              STUDENT CODE OF ETHICS
            </button>
            <button
              type="button"
              onClick={() => setLegalTab('refund')}
              className="min-h-[40px] px-1 hover:text-white transition-colors cursor-pointer uppercase"
            >
              REFUND POLICY
            </button>
          </div>
        </div>
      </div>

      <LegalPolicyModal
        isOpen={legalTab !== null}
        activeTab={legalTab || 'terms'}
        onChangeTab={(tab) => setLegalTab(tab)}
        onClose={() => setLegalTab(null)}
        onNavigate={onNavigate}
      />
    </footer>
  );
};
