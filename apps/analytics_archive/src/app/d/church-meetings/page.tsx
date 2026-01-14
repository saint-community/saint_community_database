/** 
 * CHURCH MEETINGS MODULE
 */
'use client'

import { Plus } from "lucide-react";
import { useState } from "react";
import { Meeting, AttendanceSubmission, MeetingType, MeetingFrequency, MeetingScope } from './types';
import { mockMeetings, mockAttendanceSubmissions } from './constants';

// Components
import { OverviewTab } from './components/OverviewTab';
import { MeetingsListTab } from './components/MeetingsListTab';
import { AttendanceSubmissionsTab } from './components/AttendanceSubmissionsTab';
import { HistoryTab } from './components/HistoryTab';
import { CreateMeetingModal } from './components/CreateMeetingModal';
import { AttendanceModal } from './components/AttendanceModal';
import { AttendanceReviewModal } from './components/AttendanceReviewModal';

const ChurchMeetingsModule = () => {
  // State for tabs
  const [activeTab, setActiveTab] = useState('Overview');
  const [historySubTab, setHistorySubTab] = useState<'Past' | 'Upcoming'>('Past');
  const [submissionSubTab, setSubmissionSubTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');

  // Data state
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [submissions, setSubmissions] = useState<AttendanceSubmission[]>(mockAttendanceSubmissions);

  // Modal state
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<AttendanceSubmission | null>(null);
  const [selectedMeetingForAttendance, setSelectedMeetingForAttendance] = useState<Meeting | null>(null);
  
  // Active codes state
  const [activeCodes, setActiveCodes] = useState<Record<string, { code: string; expiresAt: number }>>({});

  // Form state for meetings
  const [mTitle, setMTitle] = useState('');
  const [mType, setMType] = useState<MeetingType>('Sunday Service');
  const [mFreq, setMFreq] = useState<MeetingFrequency>('Weekly');
  const [mScope, setMScope] = useState<MeetingScope>('Church-wide');
  const [mTime, setMTime] = useState('08:00');
  const [mDate, setMDate] = useState(new Date().toISOString().split('T')[0] || '');

  // Manual Attendance Form State
  const [attendanceFellowship, setAttendanceFellowship] = useState<string>('');
  const [attendanceWorkers, setAttendanceWorkers] = useState<string[]>([]);
  const [attendanceMembers, setAttendanceMembers] = useState<string[]>([]);
  const [attendanceFirstTimers, setAttendanceFirstTimers] = useState<string[]>(['']);
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // Review workflow state
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedFirstTimers, setSelectedFirstTimers] = useState<string[]>([]);

  // Meeting handlers
  const openCreateModal = () => {
    setEditingMeeting(null);
    setMTitle('');
    setMType('Sunday Service');
    setMFreq('Weekly');
    setMScope('Church-wide');
    setMTime('08:00');
    setMDate(new Date().toISOString().split('T')[0] || '');
    setIsMeetingModalOpen(true);
  };

  const openEditModal = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setMTitle(meeting.title);
    setMType(meeting.type);
    setMFreq(meeting.frequency);
    setMScope(meeting.scope);
    setMTime(meeting.time);
    setMDate(meeting.date || new Date().toISOString().split('T')[0] || '');
    setIsMeetingModalOpen(true);
  };

  const deleteMeeting = (id: string) => {
    if (window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      setMeetings(meetings.filter(m => m.id !== id));
    }
  };

  const saveMeeting = () => {
    if (editingMeeting) {
      setMeetings(meetings.map(m => m.id === editingMeeting.id ? {
        ...m,
        title: mTitle,
        type: mType,
        frequency: mFreq,
        scope: mScope,
        time: mTime,
        date: mDate
      } : m));
    } else {
      const newM: Meeting = {
        id: `meet-${Date.now()}`,
        title: mTitle,
        type: mType,
        frequency: mFreq,
        scope: mScope,
        time: mTime,
        date: mDate,
        location: 'Main Auditorium',
        assignedEntities: [mScope],
        status: 'Active'
      };
      setMeetings([newM, ...meetings]);
    }
    setIsMeetingModalOpen(false);
  };

  // Attendance handlers
  const generateMeetingCode = (meetingId: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
    setActiveCodes({ ...activeCodes, [meetingId]: { code, expiresAt } });
  };

  const handleRecordAttendance = (meeting: Meeting) => {
    setSelectedMeetingForAttendance(meeting);
    setIsAttendanceModalOpen(true);
  };

  const submitManualAttendance = () => {
    if (!selectedMeetingForAttendance) return;

    const newSub: AttendanceSubmission = {
      id: `manual-sub-${Date.now()}`,
      meetingId: selectedMeetingForAttendance.id,
      meetingTitle: selectedMeetingForAttendance.title,
      submittedBy: attendanceWorkers.join(', '),
      date: selectedMeetingForAttendance.date || new Date().toISOString().split('T')[0] || '',
      participants: attendanceMembers,
      firstTimers: attendanceFirstTimers.filter(ft => ft.trim() !== ''),
      code: 'MANUAL',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setSubmissions([newSub, ...submissions]);
    setIsAttendanceModalOpen(false);
    setSelectedMeetingForAttendance(null);
    setAttendanceFellowship('');
    setAttendanceWorkers([]);
    setAttendanceMembers([]);
    setAttendanceFirstTimers(['']);
    setWorkerSearchTerm('');
    setMemberSearchTerm('');
  };

  // Submission handlers
  const handleViewSubmission = (submission: AttendanceSubmission) => {
    setViewingSubmission(submission);
    setSelectedParticipants([...submission.participants]);
    setSelectedFirstTimers([...submission.firstTimers]);
  };

  const handleFullRejection = (subId: string) => {
    setSubmissions(submissions.map(s => s.id === subId ? { ...s, status: 'Rejected' } : s));
    setViewingSubmission(null);
  };

  const handleApproveSelected = () => {
    if (!viewingSubmission) return;

    const remainingParticipants = viewingSubmission.participants.filter(p => !selectedParticipants.includes(p));
    const remainingFirstTimers = viewingSubmission.firstTimers.filter(ft => !selectedFirstTimers.includes(ft));

    const isFullApproval = remainingParticipants.length === 0 && remainingFirstTimers.length === 0;

    if (isFullApproval) {
      setSubmissions(submissions.map(s => s.id === viewingSubmission.id ? { ...s, status: 'Approved' } : s));
    } else {
      const approvedSub: AttendanceSubmission = {
        ...viewingSubmission,
        id: `sub-appr-${Date.now()}`,
        participants: [...selectedParticipants],
        firstTimers: [...selectedFirstTimers],
        status: 'Approved',
        createdAt: new Date().toISOString()
      };

      const updatedPendingSub: AttendanceSubmission = {
        ...viewingSubmission,
        participants: remainingParticipants,
        firstTimers: remainingFirstTimers,
        status: 'Pending'
      };

      setSubmissions(prev => [
        ...prev.filter(s => s.id !== viewingSubmission.id),
        updatedPendingSub,
        approvedSub
      ]);
    }

    setViewingSubmission(null);
  };

  const toggleAllInSubmission = (submission: AttendanceSubmission) => {
    const isAllSelected = selectedParticipants.length === submission.participants.length && 
                          selectedFirstTimers.length === submission.firstTimers.length;
    
    if (isAllSelected) {
      setSelectedParticipants([]);
      setSelectedFirstTimers([]);
    } else {
      setSelectedParticipants([...submission.participants]);
      setSelectedFirstTimers([...submission.firstTimers]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#1A1C1E] tracking-tight">Church Meetings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage global and local services, fellowships, and attendance records.</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="bg-[#1A1C1E] text-white px-6 py-3 rounded text-sm font-bold shadow hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Create Meeting
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        {['Overview', 'Meetings', 'Attendance Submissions', 'History'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-[#CCA856] text-[#1A1C1E]' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && <OverviewTab />}

      {activeTab === 'Meetings' && (
        <MeetingsListTab 
          meetings={meetings}
          onEditMeeting={openEditModal}
          onDeleteMeeting={deleteMeeting}
        />
      )}

      {activeTab === 'Attendance Submissions' && (
        <AttendanceSubmissionsTab 
          submissions={submissions}
          submissionSubTab={submissionSubTab}
          setSubmissionSubTab={setSubmissionSubTab}
          onViewSubmission={handleViewSubmission}
        />
      )}

      {activeTab === 'History' && (
        <HistoryTab 
          historySubTab={historySubTab}
          setHistorySubTab={setHistorySubTab}
          submissions={submissions}
          meetings={meetings}
          activeCodes={activeCodes}
          onViewSubmission={setViewingSubmission}
          onGenerateMeetingCode={generateMeetingCode}
          onRecordAttendance={handleRecordAttendance}
        />
      )}

      {/* Modals */}
      <CreateMeetingModal 
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        editingMeeting={editingMeeting}
        mTitle={mTitle}
        setMTitle={setMTitle}
        mType={mType}
        setMType={setMType}
        mFreq={mFreq}
        setMFreq={setMFreq}
        mScope={mScope}
        setMScope={setMScope}
        mTime={mTime}
        setMTime={setMTime}
        mDate={mDate}
        setMDate={setMDate}
        onSave={saveMeeting}
      />

      <AttendanceModal 
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        selectedMeeting={selectedMeetingForAttendance}
        attendanceFellowship={attendanceFellowship}
        setAttendanceFellowship={setAttendanceFellowship}
        attendanceWorkers={attendanceWorkers}
        setAttendanceWorkers={setAttendanceWorkers}
        attendanceMembers={attendanceMembers}
        setAttendanceMembers={setAttendanceMembers}
        attendanceFirstTimers={attendanceFirstTimers}
        setAttendanceFirstTimers={setAttendanceFirstTimers}
        workerSearchTerm={workerSearchTerm}
        setWorkerSearchTerm={setWorkerSearchTerm}
        memberSearchTerm={memberSearchTerm}
        setMemberSearchTerm={setMemberSearchTerm}
        onSubmit={submitManualAttendance}
      />

      <AttendanceReviewModal 
        submission={viewingSubmission}
        isOpen={!!viewingSubmission}
        onClose={() => setViewingSubmission(null)}
        selectedParticipants={selectedParticipants}
        selectedFirstTimers={selectedFirstTimers}
        setSelectedParticipants={setSelectedParticipants}
        setSelectedFirstTimers={setSelectedFirstTimers}
        onApproveSelected={handleApproveSelected}
        onRejectFull={() => viewingSubmission && handleFullRejection(viewingSubmission.id)}
        onToggleAll={() => viewingSubmission && toggleAllInSubmission(viewingSubmission)}
      />
    </div>
  );
};

export default ChurchMeetingsModule;