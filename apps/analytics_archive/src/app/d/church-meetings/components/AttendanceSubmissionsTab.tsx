'use client';

import React from 'react';
import { AttendanceSubmission } from '../types';
import { CheckCircle2, Info } from 'lucide-react';

interface AttendanceSubmissionsTabProps {
  submissions: AttendanceSubmission[];
  submissionSubTab: 'Pending' | 'Approved' | 'Rejected';
  setSubmissionSubTab: (tab: 'Pending' | 'Approved' | 'Rejected') => void;
  onViewSubmission: (submission: AttendanceSubmission) => void;
}

export function AttendanceSubmissionsTab({
  submissions,
  submissionSubTab,
  setSubmissionSubTab,
  onViewSubmission
}: AttendanceSubmissionsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 p-1 rounded w-fit">
        {(['Pending', 'Approved', 'Rejected'] as const).map(tab => (
          <button 
            key={tab} 
            onClick={() => setSubmissionSubTab(tab)} 
            className={`px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${
              submissionSubTab === tab 
                ? 'bg-white shadow text-[#1A1C1E]' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F8F9FA] text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Meeting Title</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Submitted By</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Total Count</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.filter(s => s.status === submissionSubTab).map(sub => (
              <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 font-bold text-sm text-[#1A1C1E]">{sub.meetingTitle}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200">
                      {sub.submittedBy.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{sub.submittedBy}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 text-[11px] font-black rounded border ${
                    submissionSubTab === 'Pending' 
                      ? 'bg-[#CCA856]/10 text-[#CCA856] border-[#CCA856]/20' 
                      : submissionSubTab === 'Approved' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {sub.participants.length + sub.firstTimers.length} People
                  </span>
                </td>
                <td className="px-6 py-5 text-xs text-slate-500 font-medium">{sub.date}</td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => onViewSubmission(sub)} 
                    className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ml-auto ${
                      submissionSubTab === 'Pending' 
                        ? 'bg-[#1A1C1E] text-white hover:bg-slate-800' 
                        : 'bg-white border border-slate-200 text-[#1A1C1E] hover:border-[#CCA856]'
                    }`}
                  >
                    {submissionSubTab === 'Pending' ? (
                      <>
                        <CheckCircle2 size={12} /> Review
                      </>
                    ) : (
                      <>
                        <Info size={12} /> Details
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {submissions.filter(s => s.status === submissionSubTab).length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs italic uppercase tracking-widest">
                  No {submissionSubTab.toLowerCase()} submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};