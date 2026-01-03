'use client';

import React from 'react';
import { Meeting, MeetingType, MeetingFrequency, MeetingScope } from '../types';
import { Edit2, Trash2 } from 'lucide-react';

interface MeetingsListTabProps {
  meetings: Meeting[];
  onEditMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (id: string) => void;
}

export const MeetingsListTab: React.FC<MeetingsListTabProps> = ({
  meetings,
  onEditMeeting,
  onDeleteMeeting
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-[#F8F9FA] text-slate-500 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Title & Type</th>
            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Frequency / Scope</th>
            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {meetings.map(meeting => (
            <tr key={meeting.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-5 font-bold text-sm text-[#1A1C1E]">{meeting.title}</td>
              <td className="px-6 py-5 text-xs text-slate-600 font-medium">{meeting.frequency} • {meeting.type}</td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-1">
                  <button 
                    onClick={() => onEditMeeting(meeting)} 
                    className="p-2 text-slate-300 hover:text-[#CCA856] transition-colors" 
                    title="Edit Meeting"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDeleteMeeting(meeting.id)} 
                    className="p-2 text-slate-300 hover:text-[#E74C3C] transition-colors" 
                    title="Delete Meeting"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};