'use client';

import React from 'react';
import { Meeting, MeetingType, MeetingFrequency, MeetingScope } from '../types';
import { FELLOWSHIPS, CELLS } from '../constants';
import { Modal } from './Modal';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMeeting: Meeting | null;
  mTitle: string;
  setMTitle: (value: string) => void;
  mType: MeetingType;
  setMType: (value: MeetingType) => void;
  mFreq: MeetingFrequency;
  setMFreq: (value: MeetingFrequency) => void;
  mScope: MeetingScope;
  setMScope: (value: MeetingScope) => void;
  mTime: string;
  setMTime: (value: string) => void;
  mDate: string;
  setMDate: (value: string) => void;
  onSave: () => void;
}

export function CreateMeetingModal({
  isOpen,
  onClose,
  editingMeeting,
  mTitle,
  setMTitle,
  mType,
  setMType,
  mFreq,
  setMFreq,
  mScope,
  setMScope,
  mTime,
  setMTime,
  mDate,
  setMDate,
  onSave
}: CreateMeetingModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingMeeting ? "Edit Meeting Structure" : "Define New Meeting Structure"} 
      size="md"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Title</label>
          <input 
            type="text" 
            placeholder="Sunday Celebration" 
            value={mTitle}
            onChange={(e) => setMTitle(e.target.value)}
            className="w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm focus:border-[#CCA856]" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
            <select 
              value={mType}
              onChange={(e) => setMType(e.target.value as MeetingType)}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm"
            >
              <option>Sunday Service</option>
              <option>Midweek Service</option>
              <option>Vigil</option>
              <option>Cell Meeting</option>
              <option>Fellowship Meeting</option>
              <option>Charis Campmeeting</option>
              <option>Believers Convention</option>
              <option>World Changers Conference</option>
              <option>Workers Convention</option>
              <option>Workers Meetings / Congresses</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
            <select 
              value={mFreq}
              onChange={(e) => setMFreq(e.target.value as MeetingFrequency)}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm"
            >
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Yearly</option>
              <option>One-off</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
            <input 
              type="date" 
              value={mDate}
              onChange={(e) => setMDate(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm focus:border-[#CCA856]" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time of Meeting</label>
            <input 
              type="time" 
              value={mTime}
              onChange={(e) => setMTime(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm focus:border-[#CCA856]" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting coverage</label>
          <select 
            value={mScope}
            onChange={(e) => setMScope(e.target.value as MeetingScope)}
            className="w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm"
          >
            <option>Entire Church</option>
            <optgroup label="Fellowship">
              {FELLOWSHIPS.map(f => <option key={f}>{f}</option>)}
            </optgroup>
            <optgroup label="Cell">
              {CELLS.map(c => <option key={c}>{c}</option>)}
            </optgroup>
          </select>
        </div>
        
        <button 
          onClick={onSave} 
          className="w-full py-4 bg-[#1A1C1E] text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-2xl mt-4 hover:bg-[#CCA856] transition-all"
        >
          {editingMeeting ? "Update Configuration" : "Save Meeting Configuration"}
        </button>
      </div>
    </Modal>
  );
};