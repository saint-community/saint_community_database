import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Filter,
  Plus,
  Download,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  MoreVertical,
  X,
  TrendingUp,
  ShieldCheck,
  Building2,
  Edit2,
  Trash2,
  Phone,
  HeartPulse,
  UserCheck,
  Flame,
  ChevronRight,
  Sparkles,
  Info,
  MoreHorizontal,
  Home,
  Repeat,
  List,
  User,
  Activity,
  Sliders,
  ChevronDown,
  Check,
  FileText,
  Music,
  QrCode,
  FileSpreadsheet,
  BookOpen,
  Clock3,
  BarChart as BarChartIcon,
  UserSearch,
  CheckSquare,
  Square,
  AlertCircle,
  UserMinus,
  LayoutGrid,
  PieChart as PieChartIcon,
  MousePointer2,
  Layers,
  Zap,
  ChevronLeft,
  Mail,
  Eye,
  ChevronUp,
  Link2,
  ExternalLink,
  Globe,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import {
  EvangelismSession,
  EvangelismRecord,
  FollowUpSession,
  FollowUpRecord,
  Meeting,
  AttendanceSubmission,
  MeetingType,
  MeetingFrequency,
} from '../../types';
import { Logo, COLORS } from '../../constants';
import {
  mockEvangelismSessions,
  mockFollowUpSessions,
  attendanceTrend,
  attendanceComparisonData,
} from '../../data/mockData';
import {
  evangelismAPI,
  followUpAPI,
  attendanceAPI,
  prayerGroupAPI,
  studyGroupAPI,
  memberAPI,
  structureAPI,
  getAuthToken,
  parseJwt,
} from '../../api';

import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import CodeCountdown from '../../components/CodeCountdown';
import DatePickerCalendar from '../../components/DatePickerCalendar';
import {
  WORKERS_LIST,
  MEMBERS_LIST,
  ROLES,
  FIRST_TIMERS_EXAMPLES,
} from '../../data/lists';
import { getMemberGroup } from '../../utils/helpers';

interface ChurchMeetingsModuleProps {
  user?: any;
}

const ChurchMeetingsModule: React.FC<ChurchMeetingsModuleProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [templates, setTemplates] = useState<any[]>([]); // New State
  const [submissions, setSubmissions] = useState<AttendanceSubmission[]>([]);
  const [activeCodes, setActiveCodes] = useState<
    Record<string, { code: string; expiresAt: number }>
  >({});
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false); // New Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false); // New Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null); // New State
  const [isViewMeetingModalOpen, setIsViewMeetingModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [selectedMeetingForView, setSelectedMeetingForView] =
    useState<Meeting | null>(null);
  const [selectedMeetingForAttendance, setSelectedMeetingForAttendance] =
    useState<Meeting | null>(null);
  const [viewingSubmission, setViewingSubmission] =
    useState<AttendanceSubmission | null>(null);
  const [submissionSubTab, setSubmissionSubTab] = useState<
    'Pending' | 'Approved' | 'Rejected'
  >('Pending');
  const [historySubTab, setHistorySubTab] = useState<'Past' | 'Upcoming'>(
    'Past'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attStats, setAttStats] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [availableChurches, setAvailableChurches] = useState<any[]>([]);
  const [availableFellowships, setAvailableFellowships] = useState<any[]>([]);
  const [availableCells, setAvailableCells] = useState<any[]>([]);
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);

  const [selectedChurchContext, setSelectedChurchContext] =
    useState<string>(() => localStorage.getItem('selected_church_id') || ''); // Church ID or 'global'
  const [mScope, setMScope] = useState('Global Ministry');
  const [mScopeId, setMScopeId] = useState<string>('');
  const [mDate, setMDate] = useState('');
  const [mTime, setMTime] = useState('');
  const [mTitle, setMTitle] = useState('');
  const [mType, setMType] = useState<MeetingType>('Sunday Service');
  const [mFreq, setMFreq] = useState<MeetingFrequency>('Weekly');
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);

  // Extract User Role
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const decoded = parseJwt(token);
      if (decoded?.admin_meta?.role) {
        setCurrentUserRole(decoded.admin_meta.role);
      }
    }
  }, []);

  // Load meetings and history on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch churches from user profile instead of API (to avoid 403 permission error)
        const userChurches = user?.churches || [];
        setAvailableChurches(userChurches);

        // Fetch fellowships, cells for everyone (needed for dropdowns)
        try {
          const [fData, celData] = await Promise.all([
            structureAPI.getFellowships(),
            structureAPI.getCells(),
          ]);
          setAvailableFellowships(fData);
          setAvailableCells(celData);
        } catch (e) {
          console.error('Failed to fetch structure data', e);
        }

        // 1. Fetch Meetings & Templates (Critical)
        try {
          const [meetingsData, templatesData] = await Promise.all([
            attendanceAPI.getMeetings(),
            attendanceAPI.getTemplates()
          ]);
          setMeetings(meetingsData);
          setTemplates(templatesData);
        } catch (e) {
          console.error('Failed to fetch meetings/templates', e);
        }

        // 2. Fetch History & Stats (Secondary)
        try {
          const [historyData, statsData] = await Promise.all([
            attendanceAPI.getAdminSubmissions(),
            attendanceAPI.getStats(),
          ]);
          setSubmissions(historyData);
          setAttStats(statsData);
        } catch (e) {
          console.error('Failed to fetch history/stats', e);
        }

        // 3. Fetch Directory Data (Workers/Members)
        try {
          const [workersData, membersData] = await Promise.all([
            structureAPI.getWorkers(),
            memberAPI.getAllMembers(),
          ]);
          setAllWorkers(workersData);
          setAllMembers(membersData);
        } catch (e) {
          console.error('Failed to fetch directory data', e);
        }

        setIsLoading(false);
      } catch (err: any) {
        // Fallback for unexpected sync errors
        console.error('Unexpected error in loadData:', err);
        setError(err.message || 'Failed to load data');
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Manual Attendance Form State
  const [attendanceFellowship, setAttendanceFellowship] = useState<string>('');
  const [attendanceWorkers, setAttendanceWorkers] = useState<string[]>([]);
  const [attendanceMembers, setAttendanceMembers] = useState<string[]>([]);
  const [attendanceFirstTimers, setAttendanceFirstTimers] = useState<string[]>([
    '',
  ]);
  const [attendanceReturningFirstTimers, setAttendanceReturningFirstTimers] =
    useState<string[]>(['']);
  const [attendanceAdultCount, setAttendanceAdultCount] = useState<number>(0);
  const [attendanceChildrenCount, setAttendanceChildrenCount] =
    useState<number>(0);
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // Workflow for Granular Approvals
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [selectedFirstTimers, setSelectedFirstTimers] = useState<string[]>([]);

  const filteredWorkers = useMemo(() => {
    return WORKERS_LIST.filter((w) =>
      w.toLowerCase().includes(workerSearchTerm.toLowerCase())
    );
  }, [workerSearchTerm]);

  const filteredMembers = useMemo(() => {
    return MEMBERS_LIST.filter((m) =>
      m.toLowerCase().includes(memberSearchTerm.toLowerCase())
    );
  }, [memberSearchTerm]);

  const handleFullRejection = (subId: string) => {
    setSubmissions(
      submissions.map((s) =>
        s.id === subId ? { ...s, status: 'Rejected' } : s
      )
    );
    setViewingSubmission(null);
  };

  const handleApproveSelected = () => {
    if (!viewingSubmission) return;

    const remainingParticipants = viewingSubmission.participants.filter(
      (p) => !selectedParticipants.includes(p)
    );
    const remainingFirstTimers = viewingSubmission.firstTimers.filter(
      (ft) => !selectedFirstTimers.includes(ft)
    );

    const isFullApproval =
      remainingParticipants.length === 0 && remainingFirstTimers.length === 0;

    if (isFullApproval) {
      setSubmissions(
        submissions.map((s) =>
          s.id === viewingSubmission.id ? { ...s, status: 'Approved' } : s
        )
      );
    } else {
      const approvedSub: AttendanceSubmission = {
        ...viewingSubmission,
        id: `sub-appr-${Date.now()}`,
        participants: [...selectedParticipants],
        firstTimers: [...selectedFirstTimers],
        status: 'Approved',
        createdAt: new Date().toISOString(),
      };

      const updatedPendingSub: AttendanceSubmission = {
        ...viewingSubmission,
        participants: remainingParticipants,
        firstTimers: remainingFirstTimers,
        status: 'Pending',
      };

      setSubmissions((prev) => [
        ...prev.filter((s) => s.id !== viewingSubmission.id),
        updatedPendingSub,
        approvedSub,
      ]);
    }

    setViewingSubmission(null);
  };

  const handleRevertIndividual = (name: string, isFirstTimer: boolean) => {
    if (!viewingSubmission) return;

    const updatedSubmission: AttendanceSubmission = {
      ...viewingSubmission,
      participants: isFirstTimer
        ? viewingSubmission.participants
        : viewingSubmission.participants.filter((n) => n !== name),
      firstTimers: isFirstTimer
        ? viewingSubmission.firstTimers.filter((n) => n !== name)
        : viewingSubmission.firstTimers,
    };

    const pendingSub = submissions.find(
      (s) =>
        s.meetingId === viewingSubmission.meetingId &&
        s.date === viewingSubmission.date &&
        s.status === 'Pending'
    );

    let updatedSubmissions = [
      ...submissions.filter((s) => s.id !== viewingSubmission.id),
    ];

    if (pendingSub) {
      const updatedPending: AttendanceSubmission = {
        ...pendingSub,
        participants: isFirstTimer
          ? pendingSub.participants
          : Array.from(new Set([...pendingSub.participants, name])),
        firstTimers: isFirstTimer
          ? Array.from(new Set([...pendingSub.firstTimers, name]))
          : pendingSub.firstTimers,
      };
      updatedSubmissions = [
        ...updatedSubmissions.filter((s) => s.id !== pendingSub.id),
        updatedPending,
      ];
    } else {
      const newPending: AttendanceSubmission = {
        ...viewingSubmission,
        id: `sub-pending-revert-${Date.now()}`,
        participants: isFirstTimer ? [] : [name],
        firstTimers: isFirstTimer ? [name] : [],
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      updatedSubmissions.push(newPending);
    }

    if (
      updatedSubmission.participants.length > 0 ||
      updatedSubmission.firstTimers.length > 0
    ) {
      updatedSubmissions.push(updatedSubmission);
    }

    setSubmissions(updatedSubmissions);
    setViewingSubmission(null);
  };

  const generateMeetingCode = async (meetingId: string) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) return;

    try {
      // Use existing find-or-create logic in backend
      const payload = {
        title: meeting.title,
        type: meeting.type,
        frequency: meeting.frequency,
        scope: meeting.scope,
        scope_type: meeting.scope_type || 'Church',
        scope_id: meeting.scope_id || '',
        scope_value: meeting.scope_value || '', // fallbacks
        date: meeting.date,
        time: meeting.time,
        location: meeting.location || 'Main Auditorium',
        assignedEntities: meeting.assignedEntities || [],
        status: meeting.status || 'Active',
        attendance_code: Math.floor(100000 + Math.random() * 900000).toString(),
        code_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      setIsLoading(true);
      const res = await attendanceAPI.updateMeeting(meetingId, payload as any);
      setIsLoading(false);

      if (res && res.data && res.data.attendance_code) {
        // Update local display state with CONFIRMED backend code
        setActiveCodes({
          ...activeCodes,
          [meetingId]: {
            code: res.data.attendance_code,
            expiresAt: new Date(res.data.code_expires_at).getTime(),
          },
        });
        // Also refresh list to stay in sync
        const updated = await attendanceAPI.getMeetings();
        setMeetings(updated);
      }
    } catch (err) {
      console.error("Failed to generate code:", err);
      setIsLoading(false);
      alert("Failed to generate code. Please checks network.");
    }
  };

  const openCreateModal = () => {
    setEditingMeeting(null);
    setMTitle('');
    setMType('Sunday Service');
    setMFreq('Weekly');
    setMScope('Global Ministry'); // Default per requirement
    setMScopeId('');
    setMTime('08:00');
    setMDate(new Date().toISOString().split('T')[0]);

    if (activeTab === 'Recurring') {
      setIsTemplateModalOpen(true);
    } else {
      setIsMeetingModalOpen(true);
    }
  };


  const openMarkAttendanceModal = (meeting: Meeting) => {
    setSelectedMeetingForAttendance(meeting);

    // Reset state
    setAttendanceFellowship('');
    setAttendanceWorkers([]);
    setAttendanceMembers([]);
    setAttendanceFirstTimers(['']);
    setAttendanceReturningFirstTimers(['']);
    setAttendanceAdultCount(0);
    setAttendanceChildrenCount(0);
    setWorkerSearchTerm('');
    setMemberSearchTerm('');

    // Pre-fill Fellowship/Cell if scoped
    let targetUnit = '';
    if (meeting.scope_type === 'Fellowship') {
      // Try ID first
      const f = availableFellowships.find(
        (f) =>
          meeting.scope_id && f.id.toString() === meeting.scope_id.toString()
      );
      if (f) targetUnit = f.name;
      else if (meeting.assignedEntities && meeting.assignedEntities.length > 0)
        targetUnit = meeting.assignedEntities[0];
      else targetUnit = meeting.scope;
    } else if (meeting.scope_type === 'Cell') {
      const c = availableCells.find(
        (ce) =>
          meeting.scope_id && ce.id.toString() === meeting.scope_id.toString()
      );
      if (c) targetUnit = c.name;
      else if (meeting.assignedEntities && meeting.assignedEntities.length > 0)
        targetUnit = meeting.assignedEntities[0];
      else targetUnit = meeting.scope;
    }

    if (targetUnit) {
      setAttendanceFellowship(targetUnit);
    }

    setIsAttendanceModalOpen(true);
  };

  const openEditModal = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setMTitle(meeting.title);
    setMType(meeting.type);
    setMFreq(meeting.frequency);
    setMScope(meeting.scope);
    setMScopeId(meeting.scope_id ? meeting.scope_id.toString() : '');
    setMTime(meeting.time);
    setMDate(meeting.date || new Date().toISOString().split('T')[0]);
    setIsMeetingModalOpen(true);
  };

  const deleteMeeting = async (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this meeting? This action cannot be undone.'
      )
    ) {
      try {
        await attendanceAPI.deleteMeeting(id);
        setMeetings(meetings.filter((m) => m.id !== id));
      } catch (err) {
        console.error('Failed to delete meeting:', err);
        alert('Failed to delete meeting. Please try again.');
      }
    }
  };

  const saveTemplate = async () => {
    // Determine Scope Type and Value based on selection
    let scopeType = 'Church';
    let scopeValue: string | number = mScope;

    if (mScope === 'Global Ministry') {
      scopeType = 'Global';
      scopeValue = 'all';
    } else {
      const isChurch = availableChurches.some((c) => c.name === mScope);
      if (isChurch) {
        scopeType = 'Church';
        const church = availableChurches.find((c) => c.name === mScope);
        scopeValue = church ? church.id : mScope;
      } else {
        const isFellowship = availableFellowships.some((f) => f.name === mScope);
        if (isFellowship) {
          scopeType = 'Fellowship';
          const fellowship = availableFellowships.find((f) => f.name === mScope);
          scopeValue = fellowship ? fellowship.id : mScope;
        } else {
          const isCell = availableCells.some((c) => c.name === mScope);
          if (isCell) {
            scopeType = 'Cell';
            const cell = availableCells.find((c) => c.name === mScope);
            scopeValue = cell ? cell.id : mScope;
          }
        }
      }
    }

    if (mScopeId) {
      scopeValue = mScopeId;
    }

    const payload = {
      title: mTitle,
      type: mType,
      frequency: mFreq,
      scope: mScope,
      scope_type: scopeType,
      scope_id: scopeValue,
      scope_value: scopeValue,
      default_time: mTime,
    };

    try {
      setIsLoading(true);
      await attendanceAPI.createTemplate(payload);
      const updatedTemplates = await attendanceAPI.getTemplates();
      setTemplates(updatedTemplates);
      setIsTemplateModalOpen(false);
      resetMeetingForm();
    } catch (err: any) {
      console.error('Failed to create template:', err);
      setError(err.message || 'Failed to create template');
      alert('Failed to create template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMeeting = async () => {
    if (!selectedTemplate) return;
    try {
      setIsLoading(true);
      // Use either _id or id depending on what the backend returns
      await attendanceAPI.generateMeetingFromTemplate(selectedTemplate._id || selectedTemplate.id, mDate);
      const updatedMeetings = await attendanceAPI.getMeetings();
      setMeetings(updatedMeetings);
      setIsGenerateModalOpen(false);
      setActiveTab('Meetings');
      alert('Meeting generated successfully!');
    } catch (err: any) {
      console.error('Failed to generate meeting:', err);
      setError(err.message || 'Failed to generate meeting');
      alert('Failed to generate meeting.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveMeeting = async () => {
    // Determine Scope Type and Value based on selection
    let scopeType = 'Church';
    let scopeValue = mScope;

    if (mScope === 'Global Ministry') {
      scopeType = 'Global';
      scopeValue = 'all'; // or appropriate global identifier
    } else {
      // Check if it's a church
      const isChurch = availableChurches.some((c) => c.name === mScope);
      if (isChurch) {
        scopeType = 'Church';
        const church = availableChurches.find((c) => c.name === mScope);
        scopeValue = church ? church.id : mScope;
      } else {
        // Check Fellowship
        const isFellowship = availableFellowships.some(
          (f) => f.name === mScope
        );
        if (isFellowship) {
          scopeType = 'Fellowship';
          const fellowship = availableFellowships.find(
            (f) => f.name === mScope
          );
          scopeValue = fellowship ? fellowship.id : mScope;
        } else {
          // Check Cell
          const isCell = availableCells.some((c) => c.name === mScope);
          if (isCell) {
            scopeType = 'Cell';
            const cell = availableCells.find((c) => c.name === mScope);
            scopeValue = cell ? cell.id : mScope;
          }
        }
      }
    }

    // Explicitly use mScopeId if available (overrides derived scopeValue for precision)
    if (mScopeId) {
      scopeValue = mScopeId;
    }

    // Derive church_id and fellowship_id based on scope_type
    let churchId: number | undefined;
    let fellowshipId: number | undefined;

    if (scopeType === 'Church') {
      // For church-level meetings, church_id = scope_id
      churchId = scopeValue ? Number(scopeValue) : undefined;
    } else if (scopeType === 'Fellowship') {
      // For fellowship meetings, find the fellowship and get its church_id
      const fellowship = availableFellowships.find(
        (f) => f.id.toString() === scopeValue?.toString() || f.name === mScope
      );
      if (fellowship) {
        churchId = fellowship.church_id;
        fellowshipId = fellowship.id;
      }
    } else if (scopeType === 'Cell') {
      // For cell meetings, find the cell and get its church_id and fellowship_id
      const cell = availableCells.find(
        (c) => c.id.toString() === scopeValue?.toString() || c.name === mScope
      );
      if (cell) {
        churchId = cell.church_id;
        fellowshipId = cell.fellowship_id;
      }
    }
    // For Global Ministry, both remain undefined (null in backend)

    // Generate code and expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours from now

    const meetingData = {
      title: mTitle,
      type: mType,
      frequency: mFreq,
      scope: mScope, // Legacy/Display
      scope_type: scopeType,
      scope_value: scopeValue,
      scope_id: scopeValue, // CRITICAL FIX: Backend expects scope_id for linking parent church
      church_id: churchId, // NEW: Church context
      fellowship_id: fellowshipId, // NEW: Fellowship context
      attendance_code: code,
      code_expires_at: expiresAt,
      time: mTime,
      date: mDate,
      location: 'Main Auditorium', // Consider making dynamic if needed
      assignedEntities: [mScope],
      status: 'Active',
    };

    try {
      setIsLoading(true);
      if (editingMeeting) {
        // For edit, maybe don't regenerate code if existed, but for now safe to send
        await attendanceAPI.updateMeeting(editingMeeting.id, meetingData);
      } else {
        await attendanceAPI.createMeeting(meetingData);
      }
      const updatedMeetings = await attendanceAPI.getMeetings();
      setMeetings(updatedMeetings);
      setIsMeetingModalOpen(false);
      setError(null);
    } catch (err: any) {
      console.error('Failed to save meeting:', err);
      setError(err.message || 'Failed to save meeting');
      alert('Failed to save meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetMeetingForm = () => {
    setMTitle('');
    setMType('Sunday Service');
    setMFreq('Weekly');
    setMScope('Global Ministry');
    setMScopeId('');
    setMDate('');
    setMTime('');
    // Initialize with current church from localStorage (church switcher)
    const currentChurchId = localStorage.getItem('selected_church_id');
    setSelectedChurchContext(currentChurchId || '');
  };

  const openViewModal = (meeting: Meeting) => {
    setIsReadOnlyMode(true);
    setMTitle(meeting.title);
    setMType(meeting.type);
    setMFreq(meeting.frequency);
    setMScope(meeting.scope);
    setMDate(meeting.date || '');
    setMTime(meeting.time || '');
    setEditingMeeting(meeting);

    // Set context based on scope or assignment logic (simplified)
    console.log('DEBUG: openViewModal meeting:', meeting);
    console.log(
      'DEBUG: openViewModal scope_type:',
      meeting.scope_type,
      'scope_id:',
      meeting.scope_id
    );

    if (meeting.scope === 'Global Ministry' || meeting.scope === 'Global') {
      setSelectedChurchContext('global');
      console.log('DEBUG: Setting context to global');
    } else {
      // If scope matches a church name
      const church = availableChurches.find((c) => c.name === meeting.scope);
      if (church) {
        setSelectedChurchContext(church.id.toString());
        console.log(
          'DEBUG: Found church by name:',
          church.name,
          'ID:',
          church.id
        );
      } else if (meeting.scope_type === 'Church' && meeting.scope_id) {
        // Try to match by ID if type is Church
        const churchById = availableChurches.find(
          (c) => c.id.toString() === meeting.scope_id?.toString()
        );
        if (churchById) {
          setSelectedChurchContext(churchById.id.toString());
          console.log(
            'DEBUG: Found church by ID:',
            churchById.name,
            'ID:',
            churchById.id
          );
        } else {
          console.log(
            'DEBUG: Church ID not found in availableChurches:',
            meeting.scope_id
          );
        }
      } else if (meeting.scope_type === 'Fellowship') {
        // Find fellowship to get church_id
        const fellowship = availableFellowships.find(
          (f) =>
            (meeting.scope_id &&
              f.id.toString() === meeting.scope_id.toString()) ||
            f.name === meeting.scope
        );
        if (fellowship && fellowship.church_id) {
          setSelectedChurchContext(fellowship.church_id.toString());
          console.log(
            'DEBUG: Found church for Fellowship:',
            fellowship.church_id
          );
        } else {
          console.log(
            'DEBUG: Could not find fellowship or church_id for scope:',
            meeting.scope
          );
          // Fallback: try to find by name if scope_id wasn't used or failed
          if (!fellowship) {
            const fellowshipByName = availableFellowships.find(
              (f) => f.name === meeting.scope
            );
            if (fellowshipByName && fellowshipByName.church_id) {
              setSelectedChurchContext(fellowshipByName.church_id.toString());
            } else {
              setSelectedChurchContext('');
            }
          } else {
            setSelectedChurchContext('');
          }
        }
      } else if (meeting.scope_type === 'Cell') {
        // Find cell to get church_id
        const cell = availableCells.find(
          (c) =>
            (meeting.scope_id &&
              c.id.toString() === meeting.scope_id.toString()) ||
            c.name === meeting.scope
        );
        if (cell && cell.church_id) {
          setSelectedChurchContext(cell.church_id.toString());
          console.log('DEBUG: Found church for Cell:', cell.church_id);
        } else {
          // Fallback by name
          const cellByName = availableCells.find(
            (c) => c.name === meeting.scope
          );
          if (cellByName && cellByName.church_id) {
            setSelectedChurchContext(cellByName.church_id.toString());
          } else {
            setSelectedChurchContext('');
          }
        }
      } else {
        // Fallback for unrecognized strings or explicit Global
        // Just empty it, or set to 'global' if safe
        console.log('DEBUG: Fallback unhandled scope. setting empty context.');
        setSelectedChurchContext('');
      }
    }

    setIsMeetingModalOpen(true);
  };

  const submitManualAttendance = async () => {
    if (!selectedMeetingForAttendance) return;

    const data = {
      meetingId: selectedMeetingForAttendance.id,
      meetingTitle: selectedMeetingForAttendance.title,
      submittedBy: attendanceWorkers.join(', '),
      date:
        selectedMeetingForAttendance.date ||
        new Date().toISOString().split('T')[0],
      participants: attendanceMembers,
      firstTimers: attendanceFirstTimers.filter((ft) => ft.trim() !== ''),
      returningFirstTimers: attendanceReturningFirstTimers.filter(
        (ft) => ft.trim() !== ''
      ), // For frontend state mostly, backend expects specific struct
      adult_count: attendanceAdultCount,
      children_count: attendanceChildrenCount,
      // Map returning first timers to expected backend format if needed, or api.ts handles it?
      // The markAttendance payload in api.ts is any.
      // Backend expects returning_first_timers_details: {name, phone, email}[]
      // We only have names here. So we map names to objects.
      returning_first_timers_details: attendanceReturningFirstTimers
        .filter((ft) => ft.trim() !== '')
        .map((name) => ({ name, phone: '', email: '' })),
      first_timers_details: attendanceFirstTimers
        .filter((ft) => ft.trim() !== '')
        .map((name) => ({ name, phone: '', email: '' })), // Also map fresh first timers
      first_timers_count: attendanceFirstTimers.filter((ft) => ft.trim() !== '')
        .length,
      code: 'MANUAL',
      status: 'Pending',
    };

    try {
      setIsLoading(true);
      await attendanceAPI.bulkMarkAttendance(data);
      const updatedHistory = await attendanceAPI.getAdminSubmissions();
      setSubmissions(updatedHistory);
      setIsAttendanceModalOpen(false);
      setSelectedMeetingForAttendance(null);
      setAttendanceFellowship('');
      setAttendanceWorkers([]);
      setAttendanceMembers([]);
      setAttendanceMembers([]);
      setAttendanceFirstTimers(['']);
      setAttendanceReturningFirstTimers(['']);
      setAttendanceAdultCount(0);
      setAttendanceChildrenCount(0);
      setWorkerSearchTerm('');
      setMemberSearchTerm('');
      setError(null);
    } catch (err: any) {
      console.error('Failed to submit attendance:', err);
      setError(err.message || 'Failed to submit attendance');
      alert('Failed to submit attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAllInSubmission = (submission: AttendanceSubmission) => {
    const isAllSelected =
      selectedParticipants.length === submission.participants.length &&
      selectedFirstTimers.length === submission.firstTimers.length;

    if (isAllSelected) {
      setSelectedParticipants([]);
      setSelectedFirstTimers([]);
    } else {
      setSelectedParticipants([...submission.participants]);
      setSelectedFirstTimers([...submission.firstTimers]);
    }
  };

  // Grouping logic for Detailed History View
  const groupedPastAttendance = useMemo(() => {
    if (!viewingSubmission || viewingSubmission.status !== 'Approved')
      return null;

    const fellowships: Record<
      string,
      { workers: string[]; members: string[]; firstTimers: string[] }
    > = {};

    // Process Workers (from submittedBy)
    const workers = viewingSubmission.submittedBy
      .split(',')
      .map((w) => w.trim())
      .filter((w) => w !== 'Admin');
    workers.forEach((w) => {
      const group = getMemberGroup(w);
      if (!fellowships[group])
        fellowships[group] = { workers: [], members: [], firstTimers: [] };
      fellowships[group].workers.push(w);
    });

    // Process Members (from participants)
    viewingSubmission.participants.forEach((m) => {
      const group = getMemberGroup(m);
      if (!fellowships[group])
        fellowships[group] = { workers: [], members: [], firstTimers: [] };
      fellowships[group].members.push(m);
    });

    // Process First Timers
    viewingSubmission.firstTimers.forEach((ft) => {
      const group = getMemberGroup(ft); // Simulating group for first timers too
      if (!fellowships[group])
        fellowships[group] = { workers: [], members: [], firstTimers: [] };
      fellowships[group].firstTimers.push(ft);
    });

    return fellowships;
  }, [viewingSubmission]);

  const statsChartData = useMemo(() => {
    if (!attStats || Object.keys(attStats).length === 0)
      return attendanceComparisonData;
    return Object.entries(attStats).map(([name, data]: [string, any]) => ({
      name,
      value: data.attendance,
    }));
  }, [attStats]);

  return (
    <div className='space-y-8 animate-in fade-in duration-500'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-black text-[#1A1C1E] tracking-tight'>
            Church Meetings
          </h2>
          <p className='text-slate-500 text-sm mt-1'>
            Manage global and local services, fellowships, and attendance
            records.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className='bg-[#1A1C1E] text-white px-6 py-3 rounded text-sm font-bold shadow hover:bg-slate-800 transition-all flex items-center gap-2'
        >
          <Plus size={18} /> Create Meeting
        </button>
      </div>

      <div className='flex gap-4 border-b border-slate-200'>
        {['Overview', 'Meetings', 'Recurring', 'Attendance Submissions', 'History'].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === tab ? 'border-[#CCA856] text-[#1A1C1E]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {activeTab === 'Overview' && (
        <div className='space-y-10'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <StatCard
              title='Sunday Service'
              value={(
                attStats?.['Sunday Service']?.attendance || 0
              ).toLocaleString()}
              icon={<Music size={18} />}
              variant='default'
              trend='+5%'
            />
            <StatCard
              title='Midweek Service'
              value={(
                attStats?.['Midweek Service']?.attendance || 0
              ).toLocaleString()}
              icon={<BookOpen size={18} />}
              variant='default'
              trend='+2%'
            />
            <StatCard
              title='Fellowship Meeting'
              value={(
                attStats?.['Fellowship Meeting']?.attendance || 0
              ).toLocaleString()}
              icon={<Users size={18} />}
              variant='default'
            />
            <StatCard
              title='Cell Meeting'
              value={(
                attStats?.['Cell Meeting']?.attendance || 0
              ).toLocaleString()}
              icon={<Home size={18} />}
              variant='default'
            />
            <StatCard
              title='Charis Campmeeting'
              value={(
                attStats?.['Charis Campmeeting']?.attendance || 0
              ).toLocaleString()}
              icon={<Flame size={18} />}
              variant='gold'
            />
            <StatCard
              title='Believers Convention'
              value={(
                attStats?.['Believers Convention']?.attendance || 0
              ).toLocaleString()}
              icon={<Sparkles size={18} />}
              variant='gold'
            />
            <StatCard
              title='World Changers'
              value={(
                attStats?.['World Changers Conference']?.attendance || 0
              ).toLocaleString()}
              icon={<TrendingUp size={18} />}
              variant='gold'
            />
            <StatCard
              title='Total First Timers'
              value={Object.values(attStats || {})
                .reduce(
                  (acc: number, curr: any) => acc + (curr.first_timers || 0),
                  0
                )
                .toLocaleString()}
              icon={<CheckCircle2 size={18} />}
              variant='green'
            />
          </div>
          <div className='bg-white p-8 rounded border border-slate-200 shadow-sm'>
            <div className='h-[350px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={statsChartData}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    stroke='#F1F3F5'
                  />
                  <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  />
                  <Tooltip cursor={{ fill: '#F8F9FA' }} />
                  <Bar dataKey='value' fill='#CCA856' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Meetings' && (
        <div className='bg-white border border-slate-200 rounded shadow-sm overflow-hidden'>
          <table className='w-full text-left'>
            <thead className='bg-[#F8F9FA] text-slate-500 border-b border-slate-200'>
              <tr>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                  Title & Type
                </th>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                  Frequency / Scope
                </th>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider text-right'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {meetings.map((meeting) => (
                <tr
                  key={meeting.id}
                  className='hover:bg-slate-50 transition-colors'
                >
                  <td className='px-6 py-5 font-bold text-sm text-[#1A1C1E]'>
                    {meeting.title}
                  </td>
                  <td className='px-6 py-5 text-xs text-slate-600 font-medium'>
                    {meeting.frequency} • {meeting.type}
                  </td>
                  <td className='px-6 py-5 text-right'>
                    <div className='flex justify-end gap-1'>
                      <button
                        onClick={() => {
                          setSelectedMeetingForView(meeting);
                          setIsViewMeetingModalOpen(true);
                        }}
                        className='p-2 text-slate-300 hover:text-[#CCA856] transition-colors'
                        title='View Meeting Details'
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(meeting)}
                        className='p-2 text-slate-300 hover:text-[#CCA856] transition-colors'
                        title='Edit Meeting'
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteMeeting(meeting.id)}
                        className='p-2 text-slate-300 hover:text-[#E74C3C] transition-colors'
                        title='Delete Meeting'
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
      )}

      {/* ... (existing Attendance Submissions and History tabs) ... */}

      {activeTab === 'Attendance Submissions' && (
        <div className='space-y-6'>
          <div className='flex bg-slate-100 p-1 rounded w-fit'>
            {(['Pending', 'Approved', 'Rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSubmissionSubTab(tab)}
                className={`px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${submissionSubTab === tab ? 'bg-white shadow text-[#1A1C1E]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className='bg-white border border-slate-200 rounded shadow-sm overflow-hidden'>
            <table className='w-full text-left'>
              <thead className='bg-[#F8F9FA] text-slate-500 border-b border-slate-200'>
                <tr>
                  <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                    Meeting Title
                  </th>
                  <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                    Submitted By
                  </th>
                  <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                    Total Count
                  </th>
                  <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                    Date
                  </th>
                  <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider text-right'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {submissions
                  .filter((s) => s.status === submissionSubTab)
                  .map((sub) => (
                    <tr
                      key={sub.id}
                      className='hover:bg-slate-50 transition-colors'
                    >
                      <td className='px-6 py-5 font-bold text-sm text-[#1A1C1E]'>
                        {sub.meetingTitle}
                      </td>
                      <td className='px-6 py-5'>
                        <div className='flex items-center gap-2'>
                          <div className='w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200'>
                            {sub.submittedBy
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <span className='text-xs font-bold text-slate-600 truncate max-w-[150px]'>
                            {sub.submittedBy}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-5'>
                        <span
                          className={`px-2.5 py-1 text-[11px] font-black rounded border ${submissionSubTab === 'Pending' ? 'bg-[#CCA856]/10 text-[#CCA856] border-[#CCA856]/20' : submissionSubTab === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                        >
                          {sub.participants.length + sub.firstTimers.length}{' '}
                          People
                        </span>
                      </td>
                      <td className='px-6 py-5 text-xs text-slate-500 font-medium'>
                        {sub.date}
                      </td>
                      <td className='px-6 py-5 text-right'>
                        <button
                          onClick={() => {
                            setViewingSubmission(sub);
                            setSelectedParticipants([...sub.participants]);
                            setSelectedFirstTimers([...sub.firstTimers]);
                          }}
                          className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ml-auto ${submissionSubTab === 'Pending' ? 'bg-[#1A1C1E] text-white hover:bg-slate-800' : 'bg-white border border-slate-200 text-[#1A1C1E] hover:border-[#CCA856]'}`}
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
                {submissions.filter((s) => s.status === submissionSubTab)
                  .length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className='px-6 py-12 text-center text-slate-400 text-xs italic uppercase tracking-widest'
                      >
                        No {submissionSubTab.toLowerCase()} submissions found.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'History' && (
        <div className='space-y-6'>
          <div className='flex bg-slate-100 p-1 rounded w-fit'>
            <button
              onClick={() => setHistorySubTab('Past')}
              className={`px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${historySubTab === 'Past' ? 'bg-white shadow text-[#1A1C1E]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Past
            </button>
            <button
              onClick={() => setHistorySubTab('Upcoming')}
              className={`px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${historySubTab === 'Upcoming' ? 'bg-white shadow text-[#1A1C1E]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Upcoming
            </button>
          </div>

          <div className='bg-white border border-slate-200 rounded shadow-sm overflow-hidden'>
            {historySubTab === 'Past' ? (
              <table className='w-full text-left'>
                <thead className='bg-[#F8F9FA] text-slate-500 border-b border-slate-200'>
                  <tr>
                    <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                      Date
                    </th>
                    <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                      Meeting Title
                    </th>
                    <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider text-right'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {submissions
                    .filter((s) => s.status === 'Approved')
                    .map((sub) => (
                      <tr
                        key={sub.id}
                        className='hover:bg-slate-50 transition-colors group'
                      >
                        <td className='px-6 py-5 text-sm font-bold text-[#1A1C1E]'>
                          {sub.date}
                        </td>
                        <td className='px-6 py-5 font-bold text-sm text-slate-700'>
                          {sub.meetingTitle}
                        </td>
                        <td className='px-6 py-5 text-right'>
                          <button
                            onClick={() => setViewingSubmission(sub)}
                            className='p-2 text-slate-300 hover:text-[#CCA856] transition-colors'
                            title='View Attendance Details'
                          >
                            <FileText size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {submissions.filter((s) => s.status === 'Approved').length ===
                    0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className='px-6 py-12 text-center text-slate-400 text-xs italic uppercase tracking-widest'
                        >
                          No past meeting records found.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            ) : (
              <table className='w-full text-left'>
                <thead className='bg-[#F8F9FA] text-slate-500 border-b border-slate-200'>
                  <tr>
                    <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                      Timeline Date
                    </th>
                    <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                      Meeting Title
                    </th>
                    <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                      Attendance Code
                    </th>
                    <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider text-right'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {meetings.map((m, idx) => (
                    <tr
                      key={m.id}
                      className='hover:bg-slate-50 transition-colors'
                    >
                      <td className='px-6 py-5 text-xs font-black text-[#1A1C1E]'>
                        {m.date || `May ${25 + idx}, 2024`}
                      </td>
                      <td className='px-6 py-5 font-bold text-sm text-slate-700'>
                        {m.title}
                      </td>
                      <td className='px-6 py-5'>
                        {activeCodes[m.id] || (m.attendance_code && new Date(m.code_expires_at) > new Date()) ? (
                          <div className='flex items-center gap-3'>
                            <span className='px-3 py-1 bg-gold/10 text-[#CCA856] rounded font-mono font-black text-sm border border-gold/20'>
                              {activeCodes[m.id]?.code || m.attendance_code}
                            </span>
                            <CodeCountdown
                              expiresAt={
                                activeCodes[m.id]?.expiresAt ||
                                (m.code_expires_at ? new Date(m.code_expires_at).getTime() : 0)
                              }
                            />
                          </div>
                        ) : (
                          <span className='text-[10px] font-black text-slate-300 uppercase tracking-widest italic'>
                            No active code
                          </span>
                        )}
                      </td>
                      <td className='px-6 py-5 text-right'>
                        <div className='flex justify-end gap-2'>
                          <button
                            onClick={() => generateMeetingCode(m.id)}
                            className='flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-[10px] font-black uppercase hover:border-[#CCA856] transition-all'
                          >
                            <QrCode size={14} /> Generate Code
                          </button>
                          <button
                            onClick={() => openMarkAttendanceModal(m)}
                            className='flex items-center gap-2 px-3 py-1.5 bg-[#1A1C1E] text-white border border-[#1A1C1E] rounded text-[10px] font-black uppercase hover:bg-slate-800 transition-all shadow-sm'
                          >
                            <CheckSquare size={12} className='text-[#CCA856]' />{' '}
                            Mark Attendance
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
      )}

      {/* DEDICATED VIEW MEETING DETAILS MODAL */}
      <Modal
        isOpen={isViewMeetingModalOpen}
        onClose={() => setIsViewMeetingModalOpen(false)}
        title='Meeting Details'
        size='md'
      >
        <div className='space-y-6'>
          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
              Meeting Title
            </label>
            <input
              type='text'
              readOnly
              value={selectedMeetingForView?.title || ''}
              className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm cursor-default'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Type
              </label>
              <input
                type='text'
                readOnly
                value={selectedMeetingForView?.type || ''}
                className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm cursor-default'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Frequency
              </label>
              <input
                type='text'
                readOnly
                value={selectedMeetingForView?.frequency || 'Weekly'}
                className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm cursor-default'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Start Date
              </label>
              <input
                type='text'
                readOnly
                value={selectedMeetingForView?.date || ''}
                className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm cursor-default'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Time of Meeting
              </label>
              <input
                type='text'
                readOnly
                value={selectedMeetingForView?.time || ''}
                className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm cursor-default'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
              Meeting Context
            </label>
            <input
              type='text'
              readOnly
              value={(() => {
                if (!selectedMeetingForView) return '';
                const m = selectedMeetingForView;

                if (m.scope === 'Global Ministry' || m.scope === 'Global')
                  return 'Global Ministry';

                // Helper to find church by ID with type coercion
                const findChurchById = (churchId: any) => {
                  return availableChurches.find(
                    (c) => c.id?.toString() === churchId?.toString()
                  );
                };

                // Same logic as fixed openViewModal to find context name
                if (m.scope_type === 'Fellowship') {
                  const f = availableFellowships.find(
                    (f) =>
                      (m.scope_id &&
                        f.id.toString() === m.scope_id.toString()) ||
                      f.name === m.scope
                  );
                  if (f && f.church_id) {
                    const c = findChurchById(f.church_id);
                    if (c) return c.name;
                  }
                  // Fallback: Try to get church from current user context
                  if (user?.church_name) return user.church_name;
                  return m.scope; // Fallback
                } else if (m.scope_type === 'Cell') {
                  const c = availableCells.find(
                    (ce) =>
                      (m.scope_id &&
                        ce.id.toString() === m.scope_id.toString()) ||
                      ce.name === m.scope
                  );
                  if (c && c.church_id) {
                    const ch = findChurchById(c.church_id);
                    if (ch) return ch.name;
                  }
                  // Fallback: Try to get church from current user context
                  if (user?.church_name) return user.church_name;
                  return m.scope;
                } else {
                  // Try to match scope name to a church
                  const church = availableChurches.find(
                    (c) => c.name === m.scope
                  );
                  if (church) return church.name;
                  // Or via scope_id if it was a Church type
                  if (m.scope_type === 'Church' && m.scope_id) {
                    const ch = findChurchById(m.scope_id);
                    if (ch) return ch.name;
                  }
                  // Final fallback: Use current user's church
                  if (user?.church_name) return user.church_name;
                }

                return m.scope || 'N/A';
              })()}
              className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm cursor-default'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
              Scope / Entity Name
            </label>
            <input
              type='text'
              readOnly
              value={(() => {
                if (!selectedMeetingForView) return '';
                const m = selectedMeetingForView;

                if (m.scope === 'Global Ministry' || m.scope === 'Global')
                  return 'Global Ministry';

                if (m.scope_type === 'Fellowship') {
                  // Try to find by ID first
                  const f = availableFellowships.find(
                    (f) =>
                      m.scope_id && f.id.toString() === m.scope_id.toString()
                  );
                  if (f) return f.name;

                  // If not found by ID, checks if scope matches a name in the list
                  const fByName = availableFellowships.find(
                    (f) => f.name === m.scope
                  );
                  if (fByName) return fByName.name;

                  // If still not found, check assignedEntities as it might be stored there (as per user JSON)
                  if (m.assignedEntities && m.assignedEntities.length > 0)
                    return m.assignedEntities[0];

                  return m.scope;
                } else if (m.scope_type === 'Cell') {
                  // Try to find by ID first
                  const c = availableCells.find(
                    (ce) =>
                      m.scope_id && ce.id.toString() === m.scope_id.toString()
                  );
                  if (c) return c.name;

                  // If not found by ID, checks if scope matches a name in the list
                  const cByName = availableCells.find(
                    (ce) => ce.name === m.scope
                  );
                  if (cByName) return cByName.name;

                  // If still not found, check assignedEntities
                  if (m.assignedEntities && m.assignedEntities.length > 0)
                    return m.assignedEntities[0];

                  return m.scope;
                } else if (m.scope_type === 'Church') {
                  const ch = availableChurches.find(
                    (c) =>
                      (m.scope_id &&
                        c.id.toString() === m.scope_id.toString()) ||
                      c.name === m.scope
                  );
                  return ch ? ch.name : m.scope;
                }

                return m.scope || 'N/A';
              })()}
              className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm cursor-default'
            />
          </div>

          <div className='flex justify-end pt-4'>
            <button
              onClick={() => setIsViewMeetingModalOpen(false)}
              className='px-6 py-2.5 bg-slate-100 text-slate-500 rounded font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all'
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* DETAILED ATTENDANCE REVIEW / HISTORY MODAL */}
      <Modal
        isOpen={!!viewingSubmission}
        onClose={() => setViewingSubmission(null)}
        title={
          viewingSubmission?.status === 'Pending'
            ? 'Approve Attendance Submission'
            : 'Attendance Record Details'
        }
        size='xl'
      >
        {viewingSubmission && viewingSubmission.status !== 'Approved' && (
          <div className='space-y-8 pb-10'>
            <div
              className={`p-6 rounded-lg text-white border-l-8 shadow-xl flex justify-between items-center ${viewingSubmission.status === 'Rejected' ? 'bg-[#1A1C1E] border-red-500' : 'bg-[#1A1C1E] border-[#CCA856]'}`}
            >
              <div>
                <h4 className='text-lg font-black uppercase tracking-widest'>
                  {viewingSubmission.meetingTitle}
                </h4>
                <div className='flex items-center gap-4 mt-2'>
                  <p className='text-[11px] text-slate-400 font-bold uppercase flex items-center gap-2'>
                    <Calendar size={12} /> {viewingSubmission.date}
                  </p>
                  <p className='text-[11px] text-[#CCA856] font-black uppercase flex items-center gap-2'>
                    <User size={12} /> Submitted By:{' '}
                    {viewingSubmission.submittedBy}
                  </p>
                  <p className='text-[11px] font-black uppercase flex items-center gap-2'>
                    <AlertCircle size={12} /> Status:{' '}
                    <span
                      className={
                        viewingSubmission.status === 'Rejected'
                          ? 'text-red-400'
                          : 'text-[#CCA856]'
                      }
                    >
                      {viewingSubmission.status}
                    </span>
                  </p>
                </div>
              </div>
              {viewingSubmission.status === 'Pending' && (
                <button
                  onClick={() => toggleAllInSubmission(viewingSubmission)}
                  className='flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-[10px] font-black uppercase tracking-widest transition-all'
                >
                  {selectedParticipants.length ===
                    viewingSubmission.participants.length &&
                    selectedFirstTimers.length ===
                    viewingSubmission.firstTimers.length ? (
                    <CheckSquare size={14} className='text-[#CCA856]' />
                  ) : (
                    <Square size={14} />
                  )}{' '}
                  Mark All Present
                </button>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              {/* Members Section */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
                  <h5 className='text-[11px] font-black text-[#1A1C1E] uppercase tracking-widest flex items-center gap-2'>
                    <Users size={16} className='text-[#CCA856]' /> Regular
                    Members
                  </h5>
                  {viewingSubmission.status === 'Pending' && (
                    <span className='text-[10px] font-black text-slate-400'>
                      {selectedParticipants.length} Selected
                    </span>
                  )}
                </div>
                <div className='bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar'>
                  {viewingSubmission.participants.map((name) => {
                    const isSelected = selectedParticipants.includes(name);
                    return (
                      <div
                        key={name}
                        onClick={() => {
                          if (viewingSubmission.status === 'Pending') {
                            setSelectedParticipants((prev) =>
                              isSelected
                                ? prev.filter((n) => n !== name)
                                : [...prev, name]
                            );
                          }
                        }}
                        className={`flex items-center justify-between p-4 transition-all ${viewingSubmission.status === 'Pending' ? 'cursor-pointer hover:bg-slate-50' : ''} ${isSelected && viewingSubmission.status === 'Pending' ? 'bg-[#CCA856]/5' : ''}`}
                      >
                        <div className='flex items-center gap-3'>
                          {viewingSubmission.status === 'Pending' ? (
                            isSelected ? (
                              <CheckCircle2
                                size={18}
                                className='text-[#CCA856]'
                              />
                            ) : (
                              <Square size={18} className='text-slate-300' />
                            )
                          ) : (
                            <div className='w-1.5 h-1.5 rounded-full bg-slate-400'></div>
                          )}
                          <span
                            className={`text-sm font-bold ${viewingSubmission.status !== 'Pending' ? 'text-[#1A1C1E]' : isSelected ? 'text-[#1A1C1E]' : 'text-slate-500'}`}
                          >
                            {name}
                          </span>
                        </div>
                        <span className='text-[9px] font-black text-slate-300 uppercase tracking-widest'>
                          {getMemberGroup(name)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* First Timers Section */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
                  <h5 className='text-[11px] font-black text-[#1A1C1E] uppercase tracking-widest flex items-center gap-2'>
                    <Sparkles size={16} className='text-gold' /> First Timers
                  </h5>
                  {viewingSubmission.status === 'Pending' && (
                    <span className='text-[10px] font-black text-slate-400'>
                      {selectedFirstTimers.length} Selected
                    </span>
                  )}
                </div>
                <div className='bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar'>
                  {viewingSubmission.firstTimers.length > 0 ? (
                    viewingSubmission.firstTimers.map((name) => {
                      const isSelected = selectedFirstTimers.includes(name);
                      return (
                        <div
                          key={name}
                          onClick={() => {
                            if (viewingSubmission.status === 'Pending') {
                              setSelectedFirstTimers((prev) =>
                                isSelected
                                  ? prev.filter((n) => n !== name)
                                  : [...prev, name]
                              );
                            }
                          }}
                          className={`flex items-center justify-between p-4 transition-all ${viewingSubmission.status === 'Pending' ? 'cursor-pointer hover:bg-slate-50' : ''} ${isSelected && viewingSubmission.status === 'Pending' ? 'bg-gold/5' : ''}`}
                        >
                          <div className='flex items-center gap-3'>
                            {viewingSubmission.status === 'Pending' ? (
                              isSelected ? (
                                <CheckCircle2 size={18} className='text-gold' />
                              ) : (
                                <Square size={18} className='text-slate-300' />
                              )
                            ) : (
                              <div className='w-1.5 h-1.5 rounded-full bg-slate-400'></div>
                            )}
                            <span
                              className={`text-sm font-bold ${viewingSubmission.status !== 'Pending' ? 'text-[#1A1C1E]' : isSelected ? 'text-[#1A1C1E]' : 'text-slate-500'}`}
                            >
                              {name}
                            </span>
                          </div>
                          <span className='text-[9px] font-black text-slate-300 uppercase tracking-widest'>
                            New Soul
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className='p-8 text-center text-slate-300 italic text-[10px] uppercase tracking-widest'>
                      No first timers in this batch
                    </div>
                  )}
                </div>
              </div>
            </div>

            {viewingSubmission.status === 'Pending' && (
              <div className='flex gap-4 pt-6'>
                <button
                  onClick={() => handleFullRejection(viewingSubmission.id)}
                  className='flex-1 py-4 border border-red-200 text-red-500 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all'
                >
                  Reject Entire Batch
                </button>
                <button
                  onClick={handleApproveSelected}
                  disabled={
                    selectedParticipants.length === 0 &&
                    selectedFirstTimers.length === 0
                  }
                  className={`flex-[2] py-4 bg-[#1A1C1E] text-white rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#CCA856] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-200`}
                >
                  Approve{' '}
                  {selectedParticipants.length + selectedFirstTimers.length}{' '}
                  Selected Entries
                </button>
              </div>
            )}
          </div>
        )}

        {/* PAST ATTENDANCE DETAILED VIEW */}
        {viewingSubmission &&
          viewingSubmission.status === 'Approved' &&
          groupedPastAttendance && (
            <div className='space-y-10 pb-8 animate-in fade-in slide-in-from-bottom-2 duration-500'>
              {/* Header / Top Stats Row */}
              <div className='bg-[#1A1C1E] p-8 rounded border-l-8 border-[#CCA856] shadow-2xl text-white'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
                  <div>
                    <h2 className='text-2xl font-black tracking-tight'>
                      {viewingSubmission.meetingTitle}
                    </h2>
                    <div className='flex flex-wrap items-center gap-5 mt-3'>
                      <div className='flex items-center gap-2 text-[11px] font-black text-[#CCA856] uppercase tracking-[0.15em] bg-white/5 px-3 py-1.5 rounded border border-white/5'>
                        <Calendar size={14} /> {viewingSubmission.date}
                      </div>
                      <div className='flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] bg-white/5 px-3 py-1.5 rounded border border-white/5'>
                        <Clock size={14} /> 08:00 AM
                      </div>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto'>
                    <div className='text-center p-3 bg-white/5 rounded border border-white/10 min-w-[100px]'>
                      <p className='text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1'>
                        Total
                      </p>
                      <h4 className='text-xl font-black text-white'>
                        {viewingSubmission.participants.length +
                          viewingSubmission.firstTimers.length +
                          viewingSubmission.submittedBy
                            .split(',')
                            .filter((w) => w.trim() !== 'Admin').length}
                      </h4>
                    </div>
                    <div className='text-center p-3 bg-white/5 rounded border border-white/10 min-w-[100px]'>
                      <p className='text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1'>
                        Workers
                      </p>
                      <h4 className='text-xl font-black text-[#CCA856]'>
                        {
                          viewingSubmission.submittedBy
                            .split(',')
                            .filter((w) => w.trim() !== 'Admin').length
                        }
                      </h4>
                    </div>
                    <div className='text-center p-3 bg-white/5 rounded border border-white/10 min-w-[100px]'>
                      <p className='text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1'>
                        Members
                      </p>
                      <h4 className='text-xl font-black text-white'>
                        {viewingSubmission.participants.length}
                      </h4>
                    </div>
                    <div className='text-center p-3 bg-white/5 rounded border border-white/10 min-w-[100px]'>
                      <p className='text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1'>
                        First Timers
                      </p>
                      <h4 className='text-xl font-black text-gold'>
                        {viewingSubmission.firstTimers.length}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance List per Fellowship */}
              <div className='space-y-8'>
                <h3 className='text-xs font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-200 pb-3 flex items-center gap-3'>
                  <LayoutGrid size={16} /> Attendance Breakdown By Unit
                </h3>

                <div className='grid grid-cols-1 gap-8'>
                  {/* DO explicitly cast Object.entries result to fix 'unknown' type property access errors */}
                  {(
                    Object.entries(groupedPastAttendance) as [
                      string,
                      {
                        workers: string[];
                        members: string[];
                        firstTimers: string[];
                      },
                    ][]
                  ).map(([fellowship, data]) => (
                    <div
                      key={fellowship}
                      className='bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all'
                    >
                      <div className='px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center'>
                        <h4 className='text-sm font-black text-[#1A1C1E] uppercase tracking-widest flex items-center gap-3'>
                          <Home size={16} className='text-[#CCA856]' />{' '}
                          {fellowship}
                        </h4>
                        <div className='flex gap-4'>
                          <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                            W: {data.workers.length}
                          </span>
                          <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                            M: {data.members.length}
                          </span>
                          <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                            FT: {data.firstTimers.length}
                          </span>
                        </div>
                      </div>
                      <div className='p-8 grid grid-cols-1 md:grid-cols-3 gap-8'>
                        {/* Workers Subsection */}
                        <div className='space-y-4'>
                          <p className='text-[10px] font-black text-[#CCA856] uppercase tracking-[0.2em] border-b border-gold/10 pb-2'>
                            Workers
                          </p>
                          <div className='space-y-2'>
                            {data.workers.map((w) => (
                              <div
                                key={w}
                                className='flex items-center gap-3 group'
                              >
                                <div className='w-1.5 h-1.5 rounded-full bg-[#CCA856] group-hover:scale-125 transition-transform'></div>
                                <span className='text-sm font-bold text-slate-700'>
                                  {w}
                                </span>
                              </div>
                            ))}
                            {data.workers.length === 0 && (
                              <span className='text-[11px] text-slate-300 italic'>
                                No workers listed
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Members Subsection */}
                        <div className='space-y-4'>
                          <p className='text-[10px] font-black text-[#1A1C1E] uppercase tracking-[0.2em] border-b border-slate-100 pb-2'>
                            Members
                          </p>
                          <div className='space-y-2'>
                            {data.members.map((m) => (
                              <div
                                key={m}
                                className='flex items-center gap-3 group'
                              >
                                <div className='w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#1A1C1E] transition-colors'></div>
                                <span className='text-sm font-bold text-slate-700'>
                                  {m}
                                </span>
                              </div>
                            ))}
                            {data.members.length === 0 && (
                              <span className='text-[11px] text-slate-300 italic'>
                                No members listed
                              </span>
                            )}
                          </div>
                        </div>

                        {/* First Timers Subsection */}
                        <div className='space-y-4'>
                          <p className='text-[10px] font-black text-gold uppercase tracking-[0.2em] border-b border-gold/10 pb-2'>
                            First Timers
                          </p>
                          <div className='space-y-2'>
                            {data.firstTimers.map((ft) => (
                              <div
                                key={ft}
                                className='flex items-center gap-3 group'
                              >
                                <Sparkles
                                  size={12}
                                  className='text-gold group-hover:rotate-12 transition-transform'
                                />
                                <span className='text-sm font-bold text-slate-700'>
                                  {ft}
                                </span>
                              </div>
                            ))}
                            {data.firstTimers.length === 0 && (
                              <span className='text-[11px] text-slate-300 italic'>
                                No first timers listed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex justify-end pt-6'>
                <button
                  onClick={() => setViewingSubmission(null)}
                  className='px-8 py-3 bg-[#1A1C1E] text-white rounded font-black text-[11px] uppercase tracking-widest hover:bg-[#CCA856] transition-all shadow-xl'
                >
                  Close Record
                </button>
              </div>
            </div>
          )}
      </Modal>

      {/* RECORD ATTENDANCE MODAL (Enhanced Flow) */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setWorkerSearchTerm('');
          setMemberSearchTerm('');
        }}
        title={`Record Attendance: ${selectedMeetingForAttendance?.title}`}
        size='lg'
      >
        <div className='space-y-10 pb-6'>
          {/* Fellowship/Cell Selection */}
          <div className='space-y-4'>
            <label className='text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2'>
              <MapPin size={14} className='text-[#CCA856]' /> 1. Select
              Fellowship or Cell (
              {selectedMeetingForAttendance?.scope_type || 'General'})
            </label>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {(() => {
                let unitsToShow: string[] = [];
                // Determine what to show based on meeting scope type
                const mScopeType = selectedMeetingForAttendance?.scope_type;
                const mScope = selectedMeetingForAttendance?.scope;

                if (mScopeType === 'Fellowship') {
                  // Resolve name dynamically for display
                  let displayName = mScope;
                  const f = availableFellowships.find(
                    (f) =>
                      selectedMeetingForAttendance.scope_id &&
                      f.id.toString() ===
                      selectedMeetingForAttendance.scope_id.toString()
                  );
                  if (f) displayName = f.name;
                  else if (
                    selectedMeetingForAttendance.assignedEntities &&
                    selectedMeetingForAttendance.assignedEntities.length > 0
                  )
                    displayName =
                      selectedMeetingForAttendance.assignedEntities[0];

                  unitsToShow = [displayName || ''];
                } else if (mScopeType === 'Cell') {
                  let displayName = mScope;
                  const c = availableCells.find(
                    (ce) =>
                      selectedMeetingForAttendance.scope_id &&
                      ce.id.toString() ===
                      selectedMeetingForAttendance.scope_id.toString()
                  );
                  if (c) displayName = c.name;
                  else if (
                    selectedMeetingForAttendance.assignedEntities &&
                    selectedMeetingForAttendance.assignedEntities.length > 0
                  )
                    displayName =
                      selectedMeetingForAttendance.assignedEntities[0];

                  unitsToShow = [displayName || ''];
                } else {
                  // Church/Global context
                  const isFellowshipMeeting =
                    selectedMeetingForAttendance?.title
                      .toLowerCase()
                      .includes('fellowship') ||
                    selectedMeetingForAttendance?.type.includes('Fellowship');

                  if (isFellowshipMeeting) {
                    unitsToShow = availableFellowships.map((f) => f.name);
                  } else {
                    // Default to all for now
                    unitsToShow = [
                      ...availableFellowships.map((f) => f.name),
                      ...availableCells.map((c) => c.name),
                    ];
                  }
                }

                // Perform filtering
                return unitsToShow
                  .filter((u) => u)
                  .map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setAttendanceFellowship(unit)}
                      className={`px-3 py-2.5 rounded border text-[11px] font-black uppercase tracking-tight transition-all ${attendanceFellowship === unit ? 'bg-[#1A1C1E] text-white border-[#1A1C1E] shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-[#CCA856]'}`}
                    >
                      {unit}
                    </button>
                  ));
              })()}
            </div>
          </div>

          {/* Workers Selection with Search */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <label className='text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2'>
                <ShieldCheck size={14} className='text-[#CCA856]' /> 2. Select
                Worker(s)
              </label>
              <div className='relative'>
                <Search
                  size={14}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-300'
                />
                <input
                  type='text'
                  placeholder='Search workers...'
                  value={workerSearchTerm}
                  onChange={(e) => setWorkerSearchTerm(e.target.value)}
                  className='pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold outline-none focus:border-[#CCA856] w-[180px]'
                />
              </div>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto custom-scrollbar p-1'>
              {allWorkers
                .filter((w) =>
                  (w.name || '')
                    .toLowerCase()
                    .includes(workerSearchTerm.toLowerCase())
                )
                .map((w, idx) => {
                  const isSelected = attendanceWorkers.includes(w.name);
                  return (
                    <button
                      key={w.id || idx}
                      onClick={() =>
                        setAttendanceWorkers((prev) =>
                          isSelected
                            ? prev.filter((x) => x !== w.name)
                            : [...prev, w.name]
                        )
                      }
                      className={`px-3 py-2.5 rounded border text-[11px] font-black transition-all text-left flex items-center justify-between ${isSelected ? 'bg-gold/5 border-[#CCA856] text-[#CCA856]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#CCA856]'}`}
                    >
                      <span className='truncate'>{w.name}</span>
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              {allWorkers.length === 0 && (
                <p className='col-span-3 text-center py-4 text-[10px] text-slate-400 italic'>
                  No workers found.
                </p>
              )}
            </div>
          </div>

          {/* Members Selection with Search */}
          {/* Members Selection with Search */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <label className='text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2'>
                <Users size={14} className='text-[#CCA856]' /> 3. Select
                Member(s)
              </label>
              <div className='relative'>
                <Search
                  size={14}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-300'
                />
                <input
                  type='text'
                  placeholder='Search members...'
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                  className='pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold outline-none focus:border-[#CCA856] w-[180px]'
                />
              </div>
            </div>
            <div className='bg-white border border-slate-200 rounded-lg p-2 max-h-[220px] overflow-y-auto custom-scrollbar'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-1'>
                {(() => {
                  // Filter members based on meeting scope
                  let filteredMembers = allMembers;

                  if (selectedMeetingForAttendance) {
                    const { church_id, fellowship_id, scope_type } = selectedMeetingForAttendance;

                    // Apply filters based on scope type
                    if (scope_type === 'Fellowship' && fellowship_id) {
                      // For fellowship meetings, show only members from that fellowship
                      filteredMembers = allMembers.filter(
                        (m) => m.fellowship_id?.toString() === fellowship_id?.toString()
                      );
                    } else if (scope_type === 'Church' && church_id) {
                      // For church meetings, show all members from that church
                      filteredMembers = allMembers.filter(
                        (m) => m.church_id?.toString() === church_id?.toString()
                      );
                    } else if (scope_type === 'Cell') {
                      // For cell meetings, filter by cell_id if available
                      const cell_id = selectedMeetingForAttendance.scope_id;
                      if (cell_id) {
                        filteredMembers = allMembers.filter(
                          (m) => m.cell_id?.toString() === cell_id?.toString()
                        );
                      }
                    }
                    // For Global meetings, show all members (no filter)
                  }

                  // Apply search filter
                  const searchFiltered = filteredMembers.filter((m) =>
                    (m.name || '')
                      .toLowerCase()
                      .includes(memberSearchTerm.toLowerCase())
                  );

                  return searchFiltered.length > 0 ? (
                    searchFiltered.map((m, idx) => {
                      const isSelected = attendanceMembers.includes(
                        m.id || m.name
                      );
                      return (
                        <div
                          key={m.id || idx}
                          onClick={() =>
                            setAttendanceMembers((prev) =>
                              isSelected
                                ? prev.filter((x) => x !== (m.id || m.name))
                                : [...prev, m.id || m.name]
                            )
                          }
                          className={`p-2.5 rounded cursor-pointer transition-all flex items-center gap-3 border ${isSelected ? 'border-[#1A1C1E] bg-slate-50' : 'border-transparent hover:bg-slate-50'}`}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className='text-[#1A1C1E]' />
                          ) : (
                            <Square size={16} className='text-slate-300' />
                          )}
                          <span className='text-[13px] font-bold text-slate-700'>
                            {m.name}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className='col-span-2 text-center py-6 text-[11px] text-slate-400 italic'>
                      {filteredMembers.length === 0
                        ? `No members found in this ${selectedMeetingForAttendance?.scope_type?.toLowerCase() || 'scope'}.`
                        : 'No members match your search.'}
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Adult and Children Counts */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <label className='text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2'>
                <Users size={14} className='text-[#CCA856]' /> 4. Headcount
                stats
              </label>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className='text-[10px] font-bold text-slate-500 uppercase tracking-wider'>
                  Adult Numbers
                </label>
                <input
                  type='number'
                  min='0'
                  value={attendanceAdultCount}
                  onChange={(e) =>
                    setAttendanceAdultCount(parseInt(e.target.value) || 0)
                  }
                  className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm focus:border-[#CCA856]'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-bold text-slate-500 uppercase tracking-wider'>
                  Children Numbers
                </label>
                <input
                  type='number'
                  min='0'
                  value={attendanceChildrenCount}
                  onChange={(e) =>
                    setAttendanceChildrenCount(parseInt(e.target.value) || 0)
                  }
                  className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm focus:border-[#CCA856]'
                />
              </div>
            </div>
          </div>

          {/* First Timers Input */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <label className='text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2'>
                <Sparkles size={14} className='text-gold' /> 5. First Timers
              </label>
              <button
                onClick={() =>
                  setAttendanceFirstTimers([...attendanceFirstTimers, ''])
                }
                className='flex items-center gap-1 text-[10px] font-black text-[#CCA856] uppercase hover:underline'
              >
                <Plus size={14} /> Add Name
              </button>
            </div>
            <div className='space-y-2'>
              {attendanceFirstTimers.map((ft, idx) => (
                <div
                  key={idx}
                  className='flex gap-2 animate-in slide-in-from-left-1 duration-200'
                >
                  <input
                    type='text'
                    placeholder='Enter full name...'
                    value={ft}
                    onChange={(e) => {
                      const newFt = [...attendanceFirstTimers];
                      newFt[idx] = e.target.value;
                      setAttendanceFirstTimers(newFt);
                    }}
                    className='flex-1 px-4 py-2 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm focus:border-gold/50'
                  />
                  {attendanceFirstTimers.length > 1 && (
                    <button
                      onClick={() =>
                        setAttendanceFirstTimers(
                          attendanceFirstTimers.filter((_, i) => i !== idx)
                        )
                      }
                      className='p-2 text-slate-300 hover:text-red-500 transition-colors'
                    >
                      <UserMinus size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Returning First Timers Input */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <label className='text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2'>
                <Repeat size={14} className='text-[#CCA856]' /> 6. Returning
                First Timers
              </label>
              <button
                onClick={() =>
                  setAttendanceReturningFirstTimers([
                    ...attendanceReturningFirstTimers,
                    '',
                  ])
                }
                className='flex items-center gap-1 text-[10px] font-black text-[#CCA856] uppercase hover:underline'
              >
                <Plus size={14} /> Add Name
              </button>
            </div>
            <div className='space-y-2'>
              {attendanceReturningFirstTimers.map((ft, idx) => (
                <div
                  key={idx}
                  className='flex gap-2 animate-in slide-in-from-left-1 duration-200'
                >
                  <input
                    type='text'
                    placeholder='Enter full name...'
                    value={ft}
                    onChange={(e) => {
                      const newFt = [...attendanceReturningFirstTimers];
                      newFt[idx] = e.target.value;
                      setAttendanceReturningFirstTimers(newFt);
                    }}
                    className='flex-1 px-4 py-2 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm focus:border-gold/50'
                  />
                  {attendanceReturningFirstTimers.length > 1 && (
                    <button
                      onClick={() =>
                        setAttendanceReturningFirstTimers(
                          attendanceReturningFirstTimers.filter(
                            (_, i) => i !== idx
                          )
                        )
                      }
                      className='p-2 text-slate-300 hover:text-red-500 transition-colors'
                    >
                      <UserMinus size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className='pt-4 border-t border-slate-100 flex gap-4'>
            <button
              onClick={() => setIsAttendanceModalOpen(false)}
              className='flex-1 py-4 bg-slate-50 text-slate-400 rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all'
            >
              Cancel
            </button>
            <button
              disabled={
                !attendanceFellowship ||
                attendanceWorkers.length === 0 ||
                (attendanceMembers.length === 0 &&
                  attendanceFirstTimers.every((ft) => ft.trim() === ''))
              }
              onClick={submitManualAttendance}
              className='flex-[2] py-4 bg-[#1A1C1E] text-white rounded-lg font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#CCA856] transition-all disabled:opacity-30 disabled:cursor-not-allowed'
            >
              Submit Attendance
            </button>
          </div>
        </div>
      </Modal>

      {/* DEFINE / EDIT MEETING MODAL */}
      <Modal
        isOpen={isMeetingModalOpen || isTemplateModalOpen}
        onClose={() => {
          setIsMeetingModalOpen(false);
          setIsTemplateModalOpen(false);
          setIsReadOnlyMode(false);
          setEditingMeeting(null);
          resetMeetingForm();
        }}
        title={
          isTemplateModalOpen
            ? 'Create Recurring Template'
            : isReadOnlyMode
              ? 'Meeting Details'
              : editingMeeting
                ? 'Edit Meeting Structure'
                : 'Define New Meeting Structure'
        }
        size='md'
      >
        <div className='space-y-6'>
          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
              Meeting Title
            </label>
            <input
              type='text'
              placeholder='Sunday Celebration'
              value={mTitle}
              onChange={(e) => setMTitle(e.target.value)}
              disabled={isReadOnlyMode}
              className={`w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm focus:border-[#CCA856] ${isReadOnlyMode ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Type
              </label>
              <select
                value={mType}
                onChange={(e) => setMType(e.target.value as MeetingType)}
                disabled={isReadOnlyMode}
                className={`w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm ${isReadOnlyMode ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                <option>Soul Winners Conference</option>
                <option>Fortress Campmeeting</option>
              </select>
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Frequency
              </label>
              <select
                value={mFreq}
                onChange={(e) => setMFreq(e.target.value as MeetingFrequency)}
                disabled={isReadOnlyMode}
                className={`w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm ${isReadOnlyMode ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
                <option>One-off</option>
              </select>
            </div>
          </div>

          <div className={`grid gap-4 ${isTemplateModalOpen ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {!isTemplateModalOpen && (
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Start Date
                </label>
                <input
                  type='date'
                  value={mDate}
                  onChange={(e) => setMDate(e.target.value)}
                  disabled={isReadOnlyMode}
                  className={`w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm focus:border-[#CCA856] ${isReadOnlyMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            )}
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Time of Meeting
              </label>
              <input
                type='time'
                value={mTime}
                onChange={(e) => setMTime(e.target.value)}
                disabled={isReadOnlyMode}
                className={`w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm focus:border-[#CCA856] ${isReadOnlyMode ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Meeting Context
              </label>
              <select
                value={selectedChurchContext}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedChurchContext(val);
                  if (val === 'global') {
                    setMScope('Global Ministry');
                  } else {
                    // Default to entire church when context filtered
                    const church = availableChurches.find(
                      (c) => c.id.toString() === val
                    );
                    if (church) setMScope(church.name);
                  }
                }}
                className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm'
              >
                {!selectedChurchContext && (
                  <option value=''>Select Context...</option>
                )}
                {currentUserRole === 'admin' ? (
                  <>
                    <option value='global'>Global Ministry</option>
                    <optgroup label='Specific Churches'>
                      {availableChurches.map((c: any) => (
                        <option key={c.id} value={c.id.toString()}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  </>
                ) : (
                  <option value='local'>Local Church</option>
                )}
              </select>
            </div>

            {selectedChurchContext &&
              selectedChurchContext !== 'global' &&
              currentUserRole === 'admin' && (
                <div className='space-y-2 animate-in slide-in-from-top-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                    Refine Scope
                  </label>
                  <select
                    value={mScope}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setMScope(selectedName);

                      if (
                        selectedName ===
                        'Entire ' +
                        (availableChurches.find(
                          (c) => c.id.toString() === selectedChurchContext
                        )?.name || 'Church')
                      ) {
                        setMScopeId(selectedChurchContext);
                        return;
                      }

                      // Find ID for Fellowship or Cell
                      const fellowship = availableFellowships.find(
                        (f) =>
                          f.name === selectedName &&
                          f.church_id?.toString() === selectedChurchContext
                      );
                      if (fellowship) {
                        setMScopeId(fellowship.id.toString());
                        return;
                      }

                      const cell = availableCells.find(
                        (c) =>
                          c.name === selectedName &&
                          c.church_id?.toString() === selectedChurchContext
                      );
                      if (cell) {
                        setMScopeId(cell.id.toString());
                        return;
                      }

                      setMScopeId(''); // Fallback
                    }}
                    className='w-full px-4 py-3 bg-white border-2 border-[#CCA856]/20 rounded-lg outline-none font-bold text-sm shadow-sm text-[#CCA856]'
                  >
                    {(() => {
                      const church = availableChurches.find(
                        (c) => c.id.toString() === selectedChurchContext
                      );
                      const churchName = church ? church.name : 'Church';
                      const filteredFellowships = availableFellowships.filter(
                        (f) => f.church_id?.toString() === selectedChurchContext
                      );
                      const filteredCells = availableCells.filter(
                        (c) => c.church_id?.toString() === selectedChurchContext
                      );

                      return (
                        <>
                          <option value={churchName}>
                            Entire {churchName}
                          </option>
                          {filteredFellowships.length > 0 && (
                            <optgroup label='Fellowships'>
                              {filteredFellowships.map((f) => (
                                <option key={f.id} value={f.name}>
                                  {f.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {filteredCells.length > 0 && (
                            <optgroup label='Cells'>
                              {filteredCells.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </>
                      );
                    })()}
                  </select>
                </div>
              )}

            {/* Fallback/Legacy for Non-Admins */}
            {currentUserRole !== 'admin' && (
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Target Group
                </label>
                <select
                  value={mScope}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMScope(val);

                    // Attempt to find ID for non-admin selection
                    // If "Entire Church", clear ID.
                    if (val === 'Entire Church') {
                      setMScopeId('');
                      return;
                    }

                    // Check Fellowship
                    const fellowship = availableFellowships.find(
                      (f) => f.name === val
                    );
                    if (fellowship) {
                      setMScopeId(fellowship.id.toString());
                      return;
                    }

                    // Check Cell
                    const cell = availableCells.find((c) => c.name === val);
                    if (cell) {
                      setMScopeId(cell.id.toString());
                      return;
                    }

                    setMScopeId('');
                  }}
                  className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm'
                >
                  <option>Entire Church</option>
                  {availableFellowships.length > 0 && (
                    <optgroup label='Fellowship'>
                      {availableFellowships.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {availableCells.length > 0 && (
                    <optgroup label='Cell'>
                      {availableCells.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            )}
          </div>

          {!isReadOnlyMode && (
            <button
              onClick={isTemplateModalOpen ? saveTemplate : saveMeeting}
              className='w-full py-4 bg-[#1A1C1E] text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-2xl mt-4 hover:bg-[#CCA856] transition-all'
            >
              {isTemplateModalOpen
                ? 'Save Template'
                : (editingMeeting
                  ? 'Update Configuration'
                  : 'Save Meeting Configuration')}
            </button>
          )}
        </div>
      </Modal>

      {/* GENERATE MEETING MODAL */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => {
          setIsGenerateModalOpen(false);
          setSelectedTemplate(null);
        }}
        title='Generate Meeting Instance'
        size='md'
      >
        <div className='bg-white p-6'>
          <p className='text-sm text-slate-600 mb-6'>
            Generate a new meeting instance for <strong>{selectedTemplate?.title}</strong>.
            <br />Please confirm the date below.
          </p>

          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
              Meeting Date
            </label>
            <input
              type='date'
              value={mDate}
              onChange={(e) => setMDate(e.target.value)}
              className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm focus:border-[#CCA856]'
            />
          </div>

          <button
            onClick={generateMeeting}
            className='w-full py-4 bg-[#1A1C1E] text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-2xl mt-6 hover:bg-green-600 transition-all flex items-center justify-center gap-2'
          >
            <Zap size={16} /> Generate Meeting
          </button>
        </div>
      </Modal>
    </div>
  );
};
export default ChurchMeetingsModule;
