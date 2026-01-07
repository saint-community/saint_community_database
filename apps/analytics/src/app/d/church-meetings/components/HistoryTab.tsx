'use client';

import React from 'react';
import { Meeting, AttendanceSubmission } from '../types';
import { FileText, QrCode, PlusCircle } from 'lucide-react';
import { CodeCountdown } from './CodeCountdown';

interface HistoryTabProps {
  historySubTab: 'Past' | 'Upcoming';
  setHistorySubTab: (tab: 'Past' | 'Upcoming') => void;
  submissions: AttendanceSubmission[];
  meetings: Meeting[];
  activeCodes: Record<string, { code: string; expiresAt: number }>;
  onViewSubmission: (submission: AttendanceSubmission) => void;
  onGenerateMeetingCode: (meetingId: string) => void;
  onRecordAttendance: (meeting: Meeting) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  historySubTab,
  setHistorySubTab,
  submissions,
  meetings,
  activeCodes,
  onViewSubmission,
  onGenerateMeetingCode,
  onRecordAttendance
}) => {
  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 p-1 rounded w-fit">
        <button 
          onClick={() => setHistorySubTab('Past')} 
          className={`px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${
            historySubTab === 'Past' 
              ? 'bg-white shadow text-[#1A1C1E]' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Past
        </button>
        <button 
          onClick={() => setHistorySubTab('Upcoming')} 
          className={`px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${
            historySubTab === 'Upcoming' 
              ? 'bg-white shadow text-[#1A1C1E]' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Upcoming
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        {historySubTab === 'Past' ? (
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FA] text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Meeting Title</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.filter(s => s.status === 'Approved').map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5 text-sm font-bold text-[#1A1C1E]">{sub.date}</td>
                  <td className="px-6 py-5 font-bold text-sm text-slate-700">{sub.meetingTitle}</td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => onViewSubmission(sub)}
                      className="p-2 text-slate-300 hover:text-[#CCA856] transition-colors" 
                      title="View Attendance Details"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.filter(s => s.status === 'Approved').length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-xs italic uppercase tracking-widest">
                    No past meeting records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FA] text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Timeline Date</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Meeting Title</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Attendance Code</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meetings.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-xs font-black text-[#1A1C1E]">
                    {m.date || `May ${25 + idx}, 2024`}
                  </td>
                  <td className="px-6 py-5 font-bold text-sm text-slate-700">{m.title}</td>
                  <td className="px-6 py-5">
                    {activeCodes[m.id] ? (
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-gold/10 text-[#CCA856] rounded font-mono font-black text-sm border border-gold/20">
                          {activeCodes[m.id]?.code}
                        </span>
                        <CodeCountdown expiresAt={activeCodes[m.id]?.expiresAt || 0} />
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                        No code
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onGenerateMeetingCode(m.id)} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-[10px] font-black uppercase hover:border-[#CCA856] transition-all"
                      >
                        <QrCode size={14} /> Generate Code
                      </button>
                      <button 
                        onClick={() => onRecordAttendance(m)} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1C1E] text-white border border-[#1A1C1E] rounded text-[10px] font-black uppercase hover:bg-slate-800 transition-all shadow-sm"
                      >
                        <PlusCircle size={14} /> Record Attendance
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};