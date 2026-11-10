import React, { useEffect, useState } from 'react';
import { LiveSession } from '../data/db';
import {
  X,
  Radio,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  CheckCircle2,
  MapPin,
  Loader2
} from 'lucide-react';

interface LiveClassroomModalProps {
  session: LiveSession | null;
  onClose: () => void;
  onCheckInHours: (hoursToAdd: number, sessionTitle: string) => Promise<void> | void;
}

export const LiveClassroomModal: React.FC<LiveClassroomModalProps> = ({
  session,
  onClose,
  onCheckInHours
}) => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (!session) return;
    setCheckedIn(false);
    setIsLogging(false);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [session, onClose]);

  if (!session) return null;

  const handleCheckIn = async () => {
    if (isLogging || checkedIn) return;
    setIsLogging(true);
    try {
      await onCheckInHours(1, session.title);
      setCheckedIn(true);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Live Doubt Classroom"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-zinc-950 border-4 border-white text-white shadow-[12px_12px_0px_0px_#ffffff]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-black border-b-2 border-white flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-numbers uppercase">
              <span
                className={`px-2 py-0.5 font-black border ${
                  session.status === 'LIVE'
                    ? 'bg-emerald-500 text-black border-emerald-400'
                    : session.status === 'UPCOMING'
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
              >
                {session.status}
              </span>
              <span className="text-zinc-400 font-bold">{session.courseCode}</span>
              <span className="text-zinc-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Room #{session.roomNumber}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black uppercase mt-2">
              {session.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close live classroom modal"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center border-2 border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-numbers">
            <div className="p-3 bg-black border border-zinc-800">
              <div className="text-zinc-500 uppercase text-[10px]">Mentor Host</div>
              <div className="text-white font-bold mt-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{session.hostName}</span>
              </div>
            </div>
            <div className="p-3 bg-black border border-zinc-800">
              <div className="text-zinc-500 uppercase text-[10px]">Schedule</div>
              <div className="text-white font-bold mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>
                  {session.dateLabel} · {session.timeLabel}
                </span>
              </div>
            </div>
            <div className="p-3 bg-black border border-zinc-800">
              <div className="text-zinc-500 uppercase text-[10px]">Session Length</div>
              <div className="text-white font-bold mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{session.durationMinutes} Mins</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-black border-2 border-zinc-800 space-y-2">
            <div className="text-[11px] font-mono-numbers uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-white" />
              <span>Session Agenda & Pre-Exam Brief</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {session.agenda ||
                'Interactive live walkthrough of previous university numericals, derivation steps, and student Q&A doubts.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            {session.meetingUrl ? (
              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] px-5 py-3 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] flex items-center justify-center gap-2"
              >
                <span>Open Live Stream Link</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="flex-1 px-4 py-3 border-2 border-zinc-800 bg-black text-xs font-mono-numbers text-zinc-400 flex items-center justify-center">
                Tribe Room #{session.roomNumber} · Check in below to log study attendance
              </div>
            )}

            <button
              type="button"
              disabled={isLogging || checkedIn}
              onClick={handleCheckIn}
              className={`min-h-[44px] px-5 py-3 border-2 text-xs font-mono-numbers font-black uppercase transition-colors flex items-center justify-center gap-2 ${
                checkedIn
                  ? 'border-emerald-400 bg-emerald-500 text-black'
                  : 'border-white bg-black text-white hover:bg-zinc-900'
              }`}
            >
              {isLogging ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{checkedIn ? 'Attendance Logged (+1h)' : 'Check In & Log +1h Study'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
