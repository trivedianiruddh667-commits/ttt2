import React, { useEffect } from 'react';
import { X, ShieldCheck, BookOpenCheck, RefreshCw, ArrowRight } from 'lucide-react';
import { NavPage } from './Navbar';

export type LegalPolicyTab = 'terms' | 'ethics' | 'refund';

interface LegalPolicyModalProps {
  isOpen: boolean;
  activeTab: LegalPolicyTab;
  onChangeTab: (tab: LegalPolicyTab) => void;
  onClose: () => void;
  onNavigate: (page: NavPage) => void;
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  isOpen,
  activeTab,
  onChangeTab,
  onClose,
  onNavigate
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Trust Legal and Academic Policies"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-zinc-950 border-4 border-white text-white shadow-[12px_12px_0px_0px_#ffffff]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 bg-black border-b-2 border-white flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono-numbers uppercase tracking-widest text-zinc-400">
              TECHIE TEACHER&apos;S TRIBE TRUST · GOVERNANCE & CHARTER
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-black uppercase mt-1">
              Trust Policies & Academic Charter
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close legal policies"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center border-2 border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Tabs */}
        <div className="grid grid-cols-3 border-b-2 border-white bg-black text-xs font-mono-numbers font-bold uppercase">
          <button
            type="button"
            onClick={() => onChangeTab('terms')}
            className={`min-h-[44px] py-3 px-2 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'terms' ? 'bg-white text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Terms of Trust</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('ethics')}
            className={`min-h-[44px] py-3 px-2 flex items-center justify-center gap-1.5 border-l border-zinc-800 transition-colors ${
              activeTab === 'ethics' ? 'bg-white text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BookOpenCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Code of Ethics</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('refund')}
            className={`min-h-[44px] py-3 px-2 flex items-center justify-center gap-1.5 border-l border-zinc-800 transition-colors ${
              activeTab === 'refund' ? 'bg-white text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Refund Policy</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {activeTab === 'terms' && (
            <>
              <h3 className="text-base sm:text-lg font-heading font-black uppercase text-white">
                1. Non-Commercial Educational Trust Mandate
              </h3>
              <p>
                Techie Teacher&apos;s Tribe Trust operates as a registered student-first academic initiative. Every paid course, crash sprint, and handwritten study pack grants a single-student, multi-device lifetime revision license for personal university preparation.
              </p>
              <h3 className="text-base sm:text-lg font-heading font-black uppercase text-white pt-2">
                2. Account Verification & Academic Integrity
              </h3>
              <p>
                All Educator uploads in the Teachers Portal require Trust Admin verification and Firebase email confirmation. Student purchases are tied securely to your Firebase account and accessible anytime inside the Student Dashboard.
              </p>
            </>
          )}

          {activeTab === 'ethics' && (
            <>
              <h3 className="text-base sm:text-lg font-heading font-black uppercase text-white">
                Student Code of Academic Ethics
              </h3>
              <ul className="space-y-2 list-disc list-inside text-zinc-300">
                <li>Use handwritten formula vaults and solved proofs strictly to build mastery—never for unauthorized exam-hall misconduct.</li>
                <li>Respect faculty intellectual property: commercial re-distribution, Telegram piracy reselling, or watermark stripping revokes account access.</li>
                <li>Maintain respectful peer conduct inside Live Doubt Rooms and course review discussions.</li>
              </ul>
            </>
          )}

          {activeTab === 'refund' && (
            <>
              <h3 className="text-base sm:text-lg font-heading font-black uppercase text-white">
                7-Day No-Questions-Asked Exam Trust Refund Guarantee
              </h3>
              <p>
                If a course or crash pack does not align with your university syllabus or you purchased the wrong semester code by mistake, raise a ticket via the Contact Page within 7 days of transaction with your Receipt ID (<code className="font-mono-numbers text-white">ORD-...</code>).
              </p>
              <p className="text-zinc-400 font-mono-numbers text-xs">
                Verified Trust refunds are processed back to your original UPI / Card account within 48 business hours.
              </p>
            </>
          )}
        </div>

        <div className="p-5 bg-black border-t-2 border-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate('contact');
            }}
            className="min-h-[44px] px-4 py-2.5 border border-zinc-700 hover:border-white text-xs font-mono-numbers uppercase font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
          >
            <span>Need Help? Contact Trust Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border-2 border-white"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
