'use client';

import React, { useMemo } from 'react';
import { AttendanceSubmission } from '../types';
import { getMemberGroup } from '../constants';
import { Modal } from './Modal';
import { Calendar, Clock, User, AlertCircle, CheckSquare, Square, CheckCircle2, Users, Sparkles, Home, LayoutGrid } from 'lucide-react';

interface AttendanceReviewModalProps {
  submission: AttendanceSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  selectedParticipants: string[];
  selectedFirstTimers: string[];
  setSelectedParticipants: (participants: string[]) => void;
  setSelectedFirstTimers: (firstTimers: string[]) => void;
  onApproveSelected: () => void;
  onRejectFull: () => void;
  onToggleAll: () => void;
}

export const AttendanceReviewModal: React.FC<AttendanceReviewModalProps> = ({
  submission,
  isOpen,
  onClose,
  selectedParticipants,
  selectedFirstTimers,
  setSelectedParticipants,
  setSelectedFirstTimers,
  onApproveSelected,
  onRejectFull,
  onToggleAll
}) => {
  const groupedPastAttendance = useMemo(() => {
    if (!submission || submission.status !== 'Approved') return null;

    const fellowships: Record<string, { workers: string[], members: string[], firstTimers: string[] }> = {};
    
    // Process Workers (from submittedBy)
    const workers = submission.submittedBy.split(',').map(w => w.trim());
    workers.forEach(w => {
      const group = getMemberGroup(w);
      if (!fellowships[group]) fellowships[group] = { workers: [], members: [], firstTimers: [] };
      fellowships[group].workers.push(w);
    });

    // Process Members (from participants)
    submission.participants.forEach(m => {
      const group = getMemberGroup(m);
      if (!fellowships[group]) fellowships[group] = { workers: [], members: [], firstTimers: [] };
      fellowships[group].members.push(m);
    });

    // Process First Timers
    submission.firstTimers.forEach(ft => {
      const group = getMemberGroup(ft);
      if (!fellowships[group]) fellowships[group] = { workers: [], members: [], firstTimers: [] };
      fellowships[group].firstTimers.push(ft);
    });

    return fellowships;
  }, [submission]);

  if (!submission) return null;

  const isAllSelected = selectedParticipants.length === submission.participants.length && 
                      selectedFirstTimers.length === submission.firstTimers.length;

  // For pending submissions - review mode
  if (submission.status === 'Pending') {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Approve Attendance Submission" 
        size="xl"
      >
        <div className="space-y-8 pb-10">
          <div className="p-6 rounded-lg text-white border-l-8 shadow-xl flex justify-between items-center bg-[#1A1C1E] border-[#CCA856]">
            <div>
              <h4 className="text-lg font-black uppercase tracking-widest">{submission.meetingTitle}</h4>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-2">
                  <Calendar size={12} /> {submission.date}
                </p>
                <p className="text-[11px] text-[#CCA856] font-black uppercase flex items-center gap-2">
                  <User size={12} /> Submitted By: {submission.submittedBy}
                </p>
                <p className="text-[11px] font-black uppercase flex items-center gap-2">
                  <AlertCircle size={12} /> Status: <span className="text-[#CCA856]">{submission.status}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onToggleAll}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {isAllSelected ? <CheckSquare size={14} className="text-[#CCA856]" /> : <Square size={14} />} 
              Mark All Present
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Members Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h5 className="text-[11px] font-black text-[#1A1C1E] uppercase tracking-widest flex items-center gap-2">
                  <Users size={16} className="text-[#CCA856]" /> Regular Members
                </h5>
                <span className="text-[10px] font-black text-slate-400">{selectedParticipants.length} Selected</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                {submission.participants.map(name => {
                  const isSelected = selectedParticipants.includes(name);
                  return (
                    <div 
                      key={name} 
                      onClick={() => {
                        setSelectedParticipants(isSelected ? selectedParticipants.filter(n => n !== name) : [...selectedParticipants, name]);
                      }}
                      className={`flex items-center justify-between p-4 transition-all cursor-pointer hover:bg-slate-50 ${isSelected ? 'bg-[#CCA856]/5' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {isSelected ? <CheckCircle2 size={18} className="text-[#CCA856]" /> : <Square size={18} className="text-slate-300" />}
                        <span className={`text-sm font-bold ${isSelected ? 'text-[#1A1C1E]' : 'text-slate-500'}`}>{name}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{getMemberGroup(name)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* First Timers Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h5 className="text-[11px] font-black text-[#1A1C1E] uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={16} className="text-gold" /> First Timers
                </h5>
                <span className="text-[10px] font-black text-slate-400">{selectedFirstTimers.length} Selected</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                {submission.firstTimers.length > 0 ? submission.firstTimers.map(name => {
                  const isSelected = selectedFirstTimers.includes(name);
                  return (
                    <div 
                      key={name} 
                      onClick={() => {
                        setSelectedFirstTimers(isSelected ? selectedFirstTimers.filter(n => n !== name) : [...selectedFirstTimers, name]);
                      }}
                      className={`flex items-center justify-between p-4 transition-all cursor-pointer hover:bg-slate-50 ${isSelected ? 'bg-gold/5' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {isSelected ? <CheckCircle2 size={18} className="text-gold" /> : <Square size={18} className="text-slate-300" />}
                        <span className={`text-sm font-bold ${isSelected ? 'text-[#1A1C1E]' : 'text-slate-500'}`}>{name}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">New Soul</span>
                    </div>
                  );
                }) : (
                  <div className="p-8 text-center text-slate-300 italic text-[10px] uppercase tracking-widest">
                    No first timers in this batch
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              onClick={onRejectFull}
              className="flex-1 py-4 border border-red-200 text-red-500 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all"
            >
              Reject Entire Batch
            </button>
            <button 
              onClick={onApproveSelected}
              disabled={selectedParticipants.length === 0 && selectedFirstTimers.length === 0}
              className={`flex-[2] py-4 bg-[#1A1C1E] text-white rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#CCA856] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-200`}
            >
              Approve {selectedParticipants.length + selectedFirstTimers.length} Selected Entries
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // For approved submissions - detailed view
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Attendance Record Details" 
      size="xl"
    >
      {groupedPastAttendance && (
        <div className="space-y-10 pb-8">
          {/* Header */}
          <div className="bg-[#1A1C1E] p-8 rounded border-l-8 border-[#CCA856] shadow-2xl text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight">{submission.meetingTitle}</h2>
                <div className="flex flex-wrap items-center gap-5 mt-3">
                  <div className="flex items-center gap-2 text-[11px] font-black text-[#CCA856] uppercase tracking-[0.15em] bg-white/5 px-3 py-1.5 rounded border border-white/5">
                    <Calendar size={14} /> {submission.date}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] bg-white/5 px-3 py-1.5 rounded border border-white/5">
                    <Clock size={14} /> 08:00 AM
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
                <div className="text-center p-3 bg-white/5 rounded border border-white/10 min-w-[100px]">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total</p>
                  <h4 className="text-xl font-black text-white">{submission.participants.length + submission.firstTimers.length + submission.submittedBy.split(',').length}</h4>
                </div>
                <div className="text-center p-3 bg-white/5 rounded border border-white/10 min-w-[100px]">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Workers</p>
                  <h4 className="text-xl font-black text-[#CCA856]">{submission.submittedBy.split(',').length}</h4>
                </div>
                <div className="text-center p-3 bg-white/5 rounded border border-white/10 min-w-[100px]">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Members</p>
                  <h4 className="text-xl font-black text-white">{submission.participants.length}</h4>
                </div>
                <div className="text-center p-3 bg-white/5 rounded border border-white/10 min-w-[100px]">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">First Timers</p>
                  <h4 className="text-xl font-black text-gold">{submission.firstTimers.length}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance breakdown */}
          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-200 pb-3 flex items-center gap-3">
              <LayoutGrid size={16} /> Attendance Breakdown By Unit
            </h3>
            
            <div className="grid grid-cols-1 gap-8">
              {Object.entries(groupedPastAttendance).map(([fellowship, data]) => (
                <div key={fellowship} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h4 className="text-sm font-black text-[#1A1C1E] uppercase tracking-widest flex items-center gap-3">
                      <Home size={16} className="text-[#CCA856]" /> {fellowship}
                    </h4>
                    <div className="flex gap-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">W: {data.workers.length}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">M: {data.members.length}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FT: {data.firstTimers.length}</span>
                    </div>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-[#CCA856] uppercase tracking-[0.2em] border-b border-gold/10 pb-2">Workers</p>
                      <div className="space-y-2">
                        {data.workers.map(w => (
                          <div key={w} className="flex items-center gap-3 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#CCA856] group-hover:scale-125 transition-transform"></div>
                            <span className="text-sm font-bold text-slate-700">{w}</span>
                          </div>
                        ))}
                        {data.workers.length === 0 && <span className="text-[11px] text-slate-300 italic">No workers listed</span>}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-[#1A1C1E] uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Members</p>
                      <div className="space-y-2">
                        {data.members.map(m => (
                          <div key={m} className="flex items-center gap-3 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#1A1C1E] transition-colors"></div>
                            <span className="text-sm font-bold text-slate-700">{m}</span>
                          </div>
                        ))}
                        {data.members.length === 0 && <span className="text-[11px] text-slate-300 italic">No members listed</span>}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] border-b border-gold/10 pb-2">First Timers</p>
                      <div className="space-y-2">
                        {data.firstTimers.map(ft => (
                          <div key={ft} className="flex items-center gap-3 group">
                            <Sparkles size={12} className="text-gold group-hover:rotate-12 transition-transform" />
                            <span className="text-sm font-bold text-slate-700">{ft}</span>
                          </div>
                        ))}
                        {data.firstTimers.length === 0 && <span className="text-[11px] text-slate-300 italic">No first timers listed</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-[#1A1C1E] text-white rounded font-black text-[11px] uppercase tracking-widest hover:bg-[#CCA856] transition-all shadow-xl"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};