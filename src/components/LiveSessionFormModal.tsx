import React, { useEffect, useState } from 'react';
import { LiveSession } from '../data/db';
import { X, Save, Loader2, Radio } from 'lucide-react';

interface LiveSessionFormModalProps {
  isOpen: boolean;
  editingSession: LiveSession | null;
  defaultHostName: string;
  defaultHostEmail?: string;
  onClose: () => void;
  onSave: (session: LiveSession) => Promise<void> | void;
}

export const LiveSessionFormModal: React.FC<LiveSessionFormModalProps> = ({
  isOpen,
  editingSession,
  defaultHostName,
  defaultHostEmail,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('CS-301');
  const [hostName, setHostName] = useState(defaultHostName);
  const [dateLabel, setDateLabel] = useState('Tonight');
  const [timeLabel, setTimeLabel] = useState('09:00 PM IST');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [roomNumber, setRoomNumber] = useState('402');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [agenda, setAgenda] = useState('');
  const [status, setStatus] = useState<LiveSession['status']>('UPCOMING');
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingSession) {
      setTitle(editingSession.title);
      setCourseCode(editingSession.courseCode);
      setHostName(editingSession.hostName);
      setDateLabel(editingSession.dateLabel);
      setTimeLabel(editingSession.timeLabel);
      setDurationMinutes(editingSession.durationMinutes);
      setRoomNumber(editingSession.roomNumber);
      setMeetingUrl(editingSession.meetingUrl || '');
      setAgenda(editingSession.agenda || '');
      setStatus(editingSession.status);
      setIsPublished(editingSession.isPublished);
    } else {
      setTitle('');
      setCourseCode('CS-301');
      setHostName(defaultHostName);
      setDateLabel('Tonight');
      setTimeLabel('09:00 PM IST');
      setDurationMinutes(60);
      setRoomNumber(String(Math.floor(100 + Math.random() * 800)));
      setMeetingUrl('');
      setAgenda('');
      setStatus('UPCOMING');
      setIsPublished(true);
    }
    setIsSaving(false);
  }, [isOpen, editingSession, defaultHostName]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseCode.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const payload: LiveSession = {
        id: editingSession?.id || `live-${Date.now().toString().slice(-6)}`,
        title: title.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        hostName: hostName.trim() || defaultHostName,
        hostEmail: editingSession?.hostEmail || defaultHostEmail,
        dateLabel: dateLabel.trim() || 'Tonight',
        timeLabel: timeLabel.trim() || '09:00 PM IST',
        durationMinutes: Math.max(15, Math.min(360, Number(durationMinutes) || 60)),
        roomNumber: roomNumber.trim() || '401',
        meetingUrl: meetingUrl.trim() || undefined,
        agenda: agenda.trim() || undefined,
        status,
        isPublished
      };
      await onSave(payload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm select-none overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Schedule Live Doubt Session"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div
        className="w-full max-w-xl bg-zinc-950 border-4 border-white text-white shadow-[12px_12px_0px_0px_#ffffff] my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 bg-black border-b-2 border-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-white shrink-0" />
            <div>
              <span className="text-[10px] font-mono-numbers uppercase tracking-widest text-zinc-400">
                FACULTY LIVE CLASSROOM SCHEDULER
              </span>
              <h2 className="text-xl font-heading font-black uppercase">
                {editingSession ? 'Edit Live Session' : 'Schedule Live Doubt Session'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close live session modal"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Session Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DSA Dynamic Programming Doubt Marathon"
                className="w-full bg-black border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="CS-301"
                className="w-full bg-black border-2 border-zinc-700 px-3 py-2.5 text-sm text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Mentor Host *
              </label>
              <input
                type="text"
                required
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full bg-black border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Date Label *
              </label>
              <input
                type="text"
                required
                value={dateLabel}
                onChange={(e) => setDateLabel(e.target.value)}
                placeholder="Tonight / Tomorrow"
                className="w-full bg-black border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Time Slot *
              </label>
              <input
                type="text"
                required
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
                placeholder="09:00 PM IST"
                className="w-full bg-black border-2 border-zinc-700 px-3 py-2.5 text-sm text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                min="15"
                max="360"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-black border-2 border-zinc-700 px-3 py-2.5 text-sm text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Tribe Room #
              </label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full bg-black border-2 border-zinc-700 px-3 py-2.5 text-sm text-white font-mono-numbers focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Session Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LiveSession['status'])}
                className="w-full bg-black border-2 border-zinc-700 px-3 py-2.5 text-xs text-white font-bold uppercase focus:outline-none focus:border-white"
              >
                <option value="LIVE">LIVE NOW</option>
                <option value="UPCOMING">UPCOMING</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              External Stream / Meet URL (Optional)
            </label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full bg-black border-2 border-zinc-700 px-3 py-2.5 text-sm text-white font-mono-numbers focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              Session Agenda & Topics Covered
            </label>
            <textarea
              rows={2}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Matrix Chain Multiplication numericals, Banker's Algorithm Q&A..."
              className="w-full bg-black border-2 border-zinc-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-mono-numbers text-zinc-300">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-white"
            />
            <span>Publish immediately to Student Study Desks</span>
          </label>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 border border-zinc-700 hover:border-white text-xs font-bold uppercase text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-[44px] px-6 py-2.5 bg-white text-black font-black uppercase text-xs hover:bg-zinc-200 transition-colors border-2 border-white shadow-[4px_4px_0px_0px_#ffffff] flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : editingSession ? 'Update Session' : 'Publish Live Session'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
