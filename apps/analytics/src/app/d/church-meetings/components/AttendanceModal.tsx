'use client';

import React, { useMemo } from 'react';
import { Meeting } from '../types';
import { FELLOWSHIPS, CELLS, WORKERS_LIST, MEMBERS_LIST } from '../constants';
import { Modal } from './Modal';
import { MapPin, ShieldCheck, Users, Sparkles, Search, Check, CheckSquare, Square, Plus, UserMinus } from 'lucide-react';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMeeting: Meeting | null;
  attendanceFellowship: string;
  setAttendanceFellowship: (value: string) => void;
  attendanceWorkers: string[];
  setAttendanceWorkers: React.Dispatch<React.SetStateAction<string[]>>;
  attendanceMembers: string[];
  setAttendanceMembers: React.Dispatch<React.SetStateAction<string[]>>;
  attendanceFirstTimers: string[];
  setAttendanceFirstTimers: React.Dispatch<React.SetStateAction<string[]>>;
  workerSearchTerm: string;
  setWorkerSearchTerm: (value: string) => void;
  memberSearchTerm: string;
  setMemberSearchTerm: (value: string) => void;
  onSubmit: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  selectedMeeting,
  attendanceFellowship,
  setAttendanceFellowship,
  attendanceWorkers,
  setAttendanceWorkers,
  attendanceMembers,
  setAttendanceMembers,
  attendanceFirstTimers,
  setAttendanceFirstTimers,
  workerSearchTerm,
  setWorkerSearchTerm,
  memberSearchTerm,
  setMemberSearchTerm,
  onSubmit
}) => {
  const filteredWorkers = useMemo(() => {
    return WORKERS_LIST.filter(w => w.toLowerCase().includes(workerSearchTerm.toLowerCase()));
  }, [workerSearchTerm]);

  const filteredMembers = useMemo(() => {
    return MEMBERS_LIST.filter(m => m.toLowerCase().includes(memberSearchTerm.toLowerCase()));
  }, [memberSearchTerm]);

  const handleCloseModal = () => {
    setWorkerSearchTerm('');
    setMemberSearchTerm('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCloseModal} 
      title={`Record Attendance: ${selectedMeeting?.title}`}
      size="lg"
    >
      <div className="space-y-10 pb-6">
        {/* Fellowship/Cell Selection */}
        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <MapPin size={14} className="text-[#CCA856]" /> 1. Select Fellowship or Cell
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[...FELLOWSHIPS, ...CELLS].map(unit => (
              <button 
                key={unit}
                onClick={() => setAttendanceFellowship(unit)}
                className={`px-3 py-2.5 rounded border text-[11px] font-black uppercase tracking-tight transition-all ${
                  attendanceFellowship === unit 
                    ? 'bg-[#1A1C1E] text-white border-[#1A1C1E] shadow-md' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-[#CCA856]'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Workers Selection with Search */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#CCA856]" /> 2. Select Worker(s)
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search workers..."
                value={workerSearchTerm}
                onChange={(e) => setWorkerSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold outline-none focus:border-[#CCA856] w-[180px]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto custom-scrollbar p-1">
            {filteredWorkers.map(w => {
              const isSelected = attendanceWorkers.includes(w);
              return (
                <button 
                  key={w}
                  onClick={() => setAttendanceWorkers((prev: string[]) => isSelected ? prev.filter(x => x !== w) : [...prev, w])}
                  className={`px-3 py-2.5 rounded border text-[11px] font-black transition-all text-left flex items-center justify-between ${
                    isSelected 
                      ? 'bg-gold/5 border-[#CCA856] text-[#CCA856]' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-[#CCA856]'
                  }`}
                >
                  <span className="truncate">{w}</span>
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}
            {filteredWorkers.length === 0 && (
              <p className="col-span-3 text-center py-4 text-[10px] text-slate-400 italic">
                No workers found matching your search.
              </p>
            )}
          </div>
        </div>

        {/* Members Selection with Search */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Users size={14} className="text-[#CCA856]" /> 3. Select Member(s)
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search members..."
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold outline-none focus:border-[#CCA856] w-[180px]"
              />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-2 max-h-[220px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {filteredMembers.map(m => {
                const isSelected = attendanceMembers.includes(m);
                return (
                  <div 
                    key={m}
                    onClick={() => setAttendanceMembers((prev: string[]) => isSelected ? prev.filter(x => x !== m) : [...prev, m])}
                    className={`p-2.5 rounded cursor-pointer transition-all flex items-center gap-3 border ${
                      isSelected 
                        ? 'border-[#1A1C1E] bg-slate-50' 
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? <CheckSquare size={16} className="text-[#1A1C1E]" /> : <Square size={16} className="text-slate-300" />}
                    <span className="text-[13px] font-bold text-slate-700">{m}</span>
                  </div>
                );
              })}
              {filteredMembers.length === 0 && (
                <p className="col-span-2 text-center py-6 text-[11px] text-slate-400 italic">
                  No members found matching your search.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* First Timers Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles size={14} className="text-gold" /> 4. First Timers
            </label>
            <button 
              onClick={() => setAttendanceFirstTimers([...attendanceFirstTimers, ''])}
              className="flex items-center gap-1 text-[10px] font-black text-[#CCA856] uppercase hover:underline"
            >
              <Plus size={14} /> Add Name
            </button>
          </div>
          <div className="space-y-2">
            {attendanceFirstTimers.map((ft, idx) => (
              <div key={idx} className="flex gap-2 animate-in slide-in-from-left-1 duration-200">
                <input 
                  type="text" 
                  placeholder="Enter full name..."
                  value={ft}
                  onChange={(e) => {
                    const newFt = [...attendanceFirstTimers];
                    newFt[idx] = e.target.value;
                    setAttendanceFirstTimers(newFt);
                  }}
                  className="flex-1 px-4 py-2 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm focus:border-gold/50"
                />
                {attendanceFirstTimers.length > 1 && (
                  <button 
                    onClick={() => setAttendanceFirstTimers(attendanceFirstTimers.filter((_, i) => i !== idx))}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <UserMinus size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex gap-4">
          <button 
            onClick={handleCloseModal}
            className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button 
            disabled={!attendanceFellowship || attendanceWorkers.length === 0 || (attendanceMembers.length === 0 && attendanceFirstTimers.every(ft => ft.trim() === ''))}
            onClick={onSubmit}
            className="flex-[2] py-4 bg-[#1A1C1E] text-white rounded-lg font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#CCA856] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Submit Attendance
          </button>
        </div>
      </div>
    </Modal>
  );
};