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

interface ParticipationSubmission {
  id: string;
  title: string;
  submittedBy: string;
  submittedByRole?: string;
  count: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  code: string;
  participants: {
    name: string;
    cell: string;
    status: string;
    id: string;
  }[];
  ids?: string[];
  sortAt?: number;
  instanceId?: string;
  instanceDate?: string;
  instanceEndTime?: string;
  isExpired?: boolean;
}

type ParticipantEntry = {
  name: string;
  fellowship: string;
  fellowship_id: number;
  cell?: string;
  cell_id?: any;
  id?: any;
  type?: string;
};

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
  FELLOWSHIPS,
  CELLS,
} from '../../data/lists';
import { getMemberGroup } from '../../utils/helpers';
const PrayerModule = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Prayer Meetings' | 'Prayer Submissions'
  >('Overview');
  const [meetingPeriod, setMeetingPeriod] = useState(
    'Friday Evening Prayer Meeting'
  );

  const [meetingsFilter, setMeetingsFilter] = useState<'Past' | 'Ongoing' | 'Scheduled'>(
    'Scheduled'
  );
  const [submissionsTab, setSubmissionsTab] = useState<
    'Pending' | 'Approved' | 'Rejected'
  >('Pending');

  // Date Picker State
  const [selectedMonth, setSelectedMonth] = useState('January 2024');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Modal States
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [viewingMeeting, setViewingMeeting] = useState<any>(null);
  const [reviewingSubmission, setReviewingSubmission] = useState<any>(null);
  const [detailsSubmission, setDetailsSubmission] = useState<any>(null);
  const [addParticipantForInstanceId, setAddParticipantForInstanceId] = useState<string | null>(null);
  const [meetingParticipantsList, setMeetingParticipantsList] = useState<any[]>([]);
  const [loadingMeetingParticipants, setLoadingMeetingParticipants] = useState(false);

  const [participantSearch, setParticipantSearch] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<ParticipantEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch Prayer Groups (Configs)
  const [meetingPeriods, setMeetingPeriods] = useState<string[]>([]);
  const [meetingConfigs, setMeetingConfigs] = useState<any[]>([]);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>({
    totalParticipants: 0,
    activeCells: 0,
    avgAttendance: 0,
    graphData: [],
    monthlyTarget: 'On Track'
  });

  const fetchAnalytics = async () => {
    try {
      const data = await prayerGroupAPI.getAnalytics(user?.church_id);
      // Ensure graph data has at least empty structure if missing
      if (!data.graphData || data.graphData.length === 0) {
        data.graphData = [
          { name: 'W1', value: 0 },
          { name: 'W2', value: 0 },
          { name: 'W3', value: 0 },
          { name: 'W4', value: 0 },
          { name: 'W5', value: 0 },
        ];
      }
      setAnalyticsData(data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.church_id]);

  useEffect(() => {
    const fetchGroups = async () => {
      let groups = [];
      try {
        try {
          groups = await prayerGroupAPI.getAllMeetings(user?.church_id);
        } catch (err: any) {
          if (err.response && (err.response.status === 403 || err.response.status === 401)) {
            console.warn("fetchGroups: getAllMeetings failed (401/403), falling back to getMyGroups");
            groups = await prayerGroupAPI.getMyGroups();
          } else {
            throw err;
          }
        }

        if (groups && groups.length > 0) {
          const periods = groups.map((g: any) => `${g.prayergroup_day} ${g.period}`);
          const uniquePeriods = Array.from(new Set(periods));
          setMeetingPeriods(uniquePeriods);
          setMeetingConfigs(groups);

          // Smart Default Selection
          const now = new Date();
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const currentDay = days[now.getDay()];
          const currentHour = now.getHours();
          const currentMin = now.getMinutes();
          const nowMinutes = currentHour * 60 + currentMin;

          const activeConfig = groups.find((g: any) => {
            if (g.prayergroup_day !== currentDay) return false;
            const [sh, sm] = g.start_time.split(':').map(Number);
            const [eh, em] = g.end_time.split(':').map(Number);
            const startM = sh * 60 + sm;
            const endM = eh * 60 + em;
            return nowMinutes >= startM && nowMinutes <= endM;
          });

          if (activeConfig) {
            setMeetingPeriod(`${activeConfig.prayergroup_day} ${activeConfig.period} Prayer Meeting`);
          } else if (uniquePeriods.length > 0) {
            // Fallback to first if no active meeting found
            setMeetingPeriod(`${uniquePeriods[0]} Prayer Meeting`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch prayer groups for dropdown:', error);
      }
    };
    fetchGroups();
  }, [user?.church_id]);

  const monthsList = [
    'January 2024',
    'February 2024',
    'March 2024',
    'April 2024',
    'May 2024',
    'June 2024',
    'July 2024',
    'August 2024',
    'September 2024',
    'October 2024',
    'November 2024',
    'December 2024',
  ];

  const [fellowshipsList, setFellowshipsList] = useState<any[]>([]);
  const [cellsList, setCellsList] = useState<any[]>([]);
  const [churchName, setChurchName] = useState<string>('');
  const [addParticipantPeople, setAddParticipantPeople] = useState<any[]>([]);
  const [isLoadingAddParticipantPeople, setIsLoadingAddParticipantPeople] = useState(false);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const churchId = user?.church_id;
        const [fs, cs, churches] = await Promise.all([
          structureAPI.getFellowships().catch(e => { console.warn("Fellowships fetch failed", e); return []; }),
          structureAPI.getCells().catch(e => { console.warn("Cells fetch failed", e); return []; }),
          (user?.churches && user.churches.length > 0) ? Promise.resolve(user.churches) : structureAPI.getChurches().catch(e => { console.warn("Churches fetch failed", e); return []; })
        ]);

        const churchIdToUse = churchId ?? (churches?.[0]?.id ?? churches?.[0]?._id);
        const currentChurch = churches?.find((c: any) => (c.id ?? c._id) == churchIdToUse);
        setChurchName(currentChurch?.name || 'Church');

        if (churchIdToUse != null) {
          const filteredFellowships = (Array.isArray(fs) ? fs : []).filter((f: any) => f.church_id == churchIdToUse || f.church_id === churchIdToUse);
          const filteredCells = (Array.isArray(cs) ? cs : []).filter((c: any) => c.church_id == churchIdToUse || c.church_id === churchIdToUse);
          setFellowshipsList(filteredFellowships);
          setCellsList(filteredCells);
        } else {
          setFellowshipsList(Array.isArray(fs) ? fs : []);
          setCellsList(Array.isArray(cs) ? cs : []);
        }
      } catch (error) {
        console.error("Critical error in fetchStructure", error);
        setFellowshipsList([]);
        setCellsList([]);
      }
    };
    fetchStructure();
  }, [user?.church_id, user?.churches]);

  useEffect(() => {
    if (!isAddParticipantOpen) return;
    const loadPeople = async () => {
      setIsLoadingAddParticipantPeople(true);
      try {
        const [membersRes, workersRes] = await Promise.all([
          memberAPI.getAllMembers().catch(() => []),
          structureAPI.getWorkers().catch(() => [])
        ]);
        const members = Array.isArray(membersRes) ? membersRes : [];
        const workers = Array.isArray(workersRes) ? workersRes : [];
        const getFellowshipName = (id: any) => fellowshipsList.find((f: any) => String(f.id ?? f._id) === String(id))?.name || '';
        const getCellName = (id: any) => cellsList.find((c: any) => String(c.id ?? c._id) === String(id))?.name;
        const memberEntries: ParticipantEntry[] = members.map((m: any) => ({
          name: m.full_name || m.name || 'Unknown',
          fellowship: m.fellowship_name || m.fellowship || getFellowshipName(m.fellowship_id) || 'Church',
          fellowship_id: Number(m.fellowship_id),
          cell: m.cell_name || m.cell || getCellName(m.cell_id),
          cell_id: m.cell_id,
          id: m._id || m.id,
          type: 'member'
        })).filter((p: ParticipantEntry) => Number.isFinite(p.fellowship_id));
        const workerEntries: ParticipantEntry[] = workers.map((w: any) => ({
          name: w.name || w.full_name || `${w.first_name || ''} ${w.last_name || ''}`.trim() || 'Unknown',
          fellowship: w.fellowship_name || w.fellowship || getFellowshipName(w.fellowship_id) || 'Church',
          fellowship_id: Number(w.fellowship_id),
          cell: w.cell_name || w.cell || getCellName(w.cell_id),
          cell_id: w.cell_id,
          id: w.worker_id ?? w.id ?? w._id,
          type: 'worker'
        })).filter((p: ParticipantEntry) => Number.isFinite(p.fellowship_id));
        setAddParticipantPeople([...memberEntries, ...workerEntries]);
      } catch (e) {
        console.error("Failed to load members/workers for Add Participant", e);
        setAddParticipantPeople([]);
      } finally {
        setIsLoadingAddParticipantPeople(false);
      }
    };
    loadPeople();
  }, [isAddParticipantOpen, fellowshipsList, cellsList]);

  // Mock Prayer Meetings Data
  // Prayer Meetings Data
  const [prayerMeetings, setPrayerMeetings] = useState<any[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);

  // Helper to calculate meeting status
  const calculateMeetingStatus = (day: string, start: string, end: string) => {
    if (!day || !start || !end) return 'Upcoming';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const currentDayIndex = now.getDay();
    const targetDayIndex = days.indexOf(day);

    if (targetDayIndex === -1) return 'Upcoming';

    // Create date objects for start and end times today
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    // Logic:
    // If today is NOT the meeting day:
    // To decide if it's "Past" (last week) or "Upcoming" (next week), strictly speaking the "meeting" instance
    // usually refers to the *next* or *current* specific recurrence.
    // However, usually "Ongoing" is the critical one.
    // If today != meetingDay, it's definitely not Ongoing.
    // Let's stick to a simple weekly view:
    // If today > meetingDay => Past (this week) ? No, that's confusing.
    // Let's define:
    // Ongoing: Today is the day, and current time is between start and end.
    // Past: Today is the day and time > end, OR today > day? 
    // Actually, usually these lists show the *definitions* of meetings.
    // But the user sees "Ongoing" and "Past" tabs.
    // "Ongoing" tab usually implies "Active right now" or "Upcoming".
    // "Past" implies "Finished".

    // Wait, the UI has filter "Ongoing" | "Past". 
    // If I incorrectly mark everything as Past, they might disappear from the default "Ongoing" tab.
    // Let's assume:
    // Ongoing = Scheduled for future or currently happening.
    // Past = Happened already (e.g. yesterday). 
    // But these appear to be *recurring* configurations.
    // Recurring meetings are effectively *always* "Upcoming" or "Ongoing" in a sense.
    // UNLESS this list represents *specific instances* (which it might not, given the "create meeting" flow).
    // The previous code `m.status || 'Ongoing'` suggests the backend might have intended to send status.
    // But the seeded data has no status.

    // Let's try this logic:
    // If currently within the time window on the correct day -> "Ongoing" (green).
    // If not -> "Upcoming" (maybe grey or blue).
    // Why did the user say "Why always ongoing?" They probably want to see "Upcoming" or distinguish active ones.
    // The screenshot shows status "ONGOING" in green. 
    // If I change it to "Upcoming" or "Scheduled", does the UI support that?
    // Line 657: `meeting.status === 'Ongoing' ? 'bg-green-50...' : 'bg-slate-100...'`
    // So it supports non-Ongoing styles.

    // Revised logic:
    // Active Now = "Ongoing"
    // Else = "Scheduled" (or maintain 'Ongoing' if it just means 'Active Configuration')
    // But the user plainly thinks "Always Ongoing" is a bug. They likely expect to see:
    // - "Ongoing" ONLY when it is actually happening right now.
    // - "Scheduled" or "Upcoming" otherwise.

    const WIGGLE_MINUTES = 2 * 60;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;

    if (endMinutes === 0) {
      endMinutes = 24 * 60;
    }
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    const endWithWiggle = endMinutes + WIGGLE_MINUTES;

    if (currentDayIndex === targetDayIndex) {
      if (nowMinutes >= startMinutes && nowMinutes < endWithWiggle) {
        return 'Ongoing';
      }
    }
    return 'Scheduled';
  };

  // Fetch Prayer Meetings
  const fetchMeetings = async () => {
    try {
      setIsLoadingMeetings(true);

      // Check user role to decide which endpoint to hit
      const token = getAuthToken();
      let isSuperAdmin = false;
      if (token) {
        const decoded = parseJwt(token);
        // Assuming 'super_admin' or specific role distinguishes. 
        // For now, let's try getMyGroups first if we want to enforce leader view, 
        // OR if we strictly want to support the user request: "update frontend to use the new endpoint".
        // If I just swap it, Super Admins might see only their own groups (empty?).
        // Let's try to fetch "My Groups". If empty, maybe fetch All?
        // Or better: Fetch "My Groups" as the default view for "Leaders".
        // If the user is a "Super Admin", maybe they want to see all.
        // Let's default to `getAllMeetings` but if it fails (403) or is empty, maybe strict leader?
        // Actually, let's use the new endpoint as requested.
        // We can add a toggle later.
        // For now, I will use `getMyGroups` effectively.
      }

      // STRATEGY: Try to get "All". If that fails (403), try "My Groups". 
      // This handles the "Leader restricted" case automatically.
      // Optimize fetch based on role
      let data = [];
      try {
        data = await prayerGroupAPI.getAllMeetings(user?.church_id);
      } catch (err: any) {
        console.warn("getAllMeetings failed, trying getMyGroups...", err);
        if (err.response && (err.response.status === 403 || err.response.status === 401)) {
          data = await prayerGroupAPI.getMyGroups();
        } else {
          throw err;
        }
      }

      // Ensure data is array
      if (!Array.isArray(data)) data = [];

      console.log('fetchMeetings API data:', data);
      const mapped = data.map((m: any) => ({
        id: m._id || m.id || m.prayergroup_id || m.prayer_meeting_id || Math.random(),
        day: m.prayergroup_day || m.day || 'Unknown Day',
        period: m.period || 'Evening',
        start_time: m.start_time,
        end_time: m.end_time,
        time:
          m.start_time && m.end_time
            ? `${m.start_time} - ${m.end_time}`
            : m.time || '00:00 - 00:00',
        church: m.church_name || m.church || churchName || 'Church',
        participants: m.attendees?.length || m.participants || 0,
        status: calculateMeetingStatus(m.prayergroup_day, m.start_time, m.end_time),
        code: m.prayer_code || m.code || '------',
        expiresAt: m.expiresAt || Date.now() + 2 * 3600000,
        instanceId: m.instance_id ?? m.instanceId ?? m._id ?? m.id ?? null,
      }));
      console.log('fetchMeetings mapped:', mapped);
      setPrayerMeetings(mapped);
    } catch (error) {
      console.error('Failed to fetch prayer meetings:', error);
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Prayer Meetings') {
      fetchMeetings();
    }
  }, [activeTab, user?.church_id, churchName]);

  // Mock Submissions Data - Moved to State
  // Submissions Data
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setIsLoadingSubmissions(true);
      const data = await prayerGroupAPI.getAllRecords(user?.church_id);

      let list: ParticipationSubmission[];
      if (Array.isArray(data)) {
        list = groupSubmissions(data);
        list.sort((a, b) => (b.sortAt ?? new Date(b.date).getTime()) - (a.sortAt ?? new Date(a.date).getTime()));
      } else {
        const records = (data as any).records ?? [];
        const instancesWithoutRecords = (data as any).instancesWithoutRecords ?? [];
        list = groupSubmissions(records);
        instancesWithoutRecords.forEach((inst: any) => {
          const createdAt = inst.createdAt ? new Date(inst.createdAt).getTime() : Date.now();
          const dateStr = inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : (inst.date || '');
          list.push({
            id: inst._id ?? inst.id,
            title: inst.prayergroup_day ? `${inst.prayergroup_day} Prayer` : 'Prayer Meeting',
            submittedBy: '—',
            count: 0,
            date: dateStr,
            status: 'Pending',
            code: inst.prayer_code || '——',
            participants: [],
            ids: [],
            sortAt: createdAt,
            instanceId: inst._id != null ? String(inst._id) : inst.id,
            instanceDate: inst.date,
            instanceEndTime: inst.end_time,
            isExpired: inst.is_expired,
          });
        });
        list.sort((a, b) => (b.sortAt ?? new Date(b.date).getTime()) - (a.sortAt ?? new Date(a.date).getTime()));
      }
      setSubmissions(list);
    } catch (error) {
      console.error("Failed to fetch past prayer submissions", error);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const groupSubmissions = (records: any[]): ParticipationSubmission[] => {
    const groups: Record<string, ParticipationSubmission> = {};

    records.forEach(record => {
      const code = record.prayergroup?.prayer_code || 'UNKNOWN';
      const date = new Date(record.createdAt).toLocaleDateString();
      const key = `${code}-${date}`;
      const sortAt = record.createdAt ? new Date(record.createdAt).getTime() : undefined;
      const instanceId = record.prayergroup?._id != null ? String(record.prayergroup._id) : undefined;
      const instanceDate = record.prayergroup?.date;
      const instanceEndTime = record.prayergroup?.end_time;
      const isExpired = record.prayergroup?.is_expired;

      if (!groups[key]) {
        groups[key] = {
          id: record._id,
          title: record.prayergroup?.prayergroup_day
            ? `${record.prayergroup.prayergroup_day} Prayer`
            : 'Prayer Meeting',
          submittedBy: record.submitted_by_name ?? record.name ?? 'Unknown',
          submittedByRole: record.submitted_by_role,
          participants: [],
          count: 0,
          date: date,
          status: 'Pending',
          code: code,
          ids: [],
          sortAt,
          instanceId,
          instanceDate,
          instanceEndTime,
          isExpired,
        };
      }
      if (sortAt != null && (groups[key].sortAt == null || sortAt > (groups[key].sortAt ?? 0))) {
        groups[key].sortAt = sortAt;
      }

      groups[key].participants.push({
        name: record.name || 'Unknown',
        cell: record.fellowship || '',
        status: record.status || 'Pending',
        id: record._id
      });
      groups[key].count += 1;
      groups[key].ids?.push(record._id);
    });

    Object.values(groups).forEach(group => {
      const hasPending = group.participants.some(p => !p.status || p.status === 'Pending' || p.status === 'pending');
      const allRejected = group.participants.every(p => p.status === 'Rejected');

      if (hasPending) group.status = 'Pending';
      else if (allRejected) group.status = 'Rejected';
      else group.status = 'Approved';
    });

    const result = Object.values(groups);
    result.sort((a, b) => (b.sortAt ?? new Date(b.date).getTime()) - (a.sortAt ?? new Date(a.date).getTime()));
    return result;
  };


  useEffect(() => {
    if (activeTab === 'Prayer Meetings' && meetingsFilter === 'Past') {
      fetchSubmissions();
    }
    // Also fetch if tab is 'Prayer Submissions'
    if (activeTab === 'Prayer Submissions') {
      fetchSubmissions();
    }
  }, [activeTab, meetingsFilter, user?.church_id]);

  const handleApprove = async (submissionId: string, recordIds?: string[]) => {
    try {
      // recordIds are the IDs of the specific attendees being approved (or all if undefined)
      // If recordIds is missing, we might be approving the whole batch? Current usage passes specific IDs.
      const targetIds = recordIds || [submissionId];

      await prayerGroupAPI.updateRecordStatus(targetIds, 'Approved');

      // Update local state: Find the submission, update its participants, and recalculate its aggregate status.
      setSubmissions((prev) =>
        prev.map((s) => {
          // Only update the submission group we are working on (optimization, though IDs are unique globally usually)
          // Actually, targetIds might belong to submission 's'. 
          // Check if ANY of the targetIds are in this submission's participants?
          // Or simpler: Update ALL participants across ALL submissions whose ID is in targetIds.

          const updatedParticipants = s.participants.map((p: any) =>
            targetIds.includes(p.id) ? { ...p, status: 'Approved' } : p
          );

          // Check if this submission was affected
          if (updatedParticipants === s.participants) return s; // No change

          // Recalculate Group Status
          const hasPending = updatedParticipants.some((p: any) => !p.status || p.status === 'Pending' || p.status === 'pending');
          const allRejected = updatedParticipants.every((p: any) => p.status === 'Rejected');

          let newStatus = 'Approved';
          if (hasPending) newStatus = 'Pending';
          else if (allRejected) newStatus = 'Rejected';

          return {
            ...s,
            participants: updatedParticipants,
            status: newStatus
          };
        })
      );

      setReviewingSubmission(null);
      // fetchSubmissions(); // Re-fetch to be 100% sure if needed, but optimistic is fast.
    } catch (error) {
      console.error("Failed to approve submission", error);
    }
  };

  const handleReject = async (submissionId: string, recordIds?: string[]) => {
    try {
      const targetIds = recordIds || [submissionId];
      await prayerGroupAPI.updateRecordStatus(targetIds, 'Rejected');

      setSubmissions((prev) =>
        prev.map((s) => {
          const updatedParticipants = s.participants.map((p: any) =>
            targetIds.includes(p.id) ? { ...p, status: 'Rejected' } : p
          );

          if (updatedParticipants === s.participants) return s;

          const hasPending = updatedParticipants.some((p: any) => !p.status || p.status === 'Pending' || p.status === 'pending');
          const allRejected = updatedParticipants.every((p: any) => p.status === 'Rejected');
          let newStatus = 'Approved';

          if (hasPending) newStatus = 'Pending';
          else if (allRejected) newStatus = 'Rejected';

          return {
            ...s,
            participants: updatedParticipants,
            status: newStatus
          };
        })
      );

      setReviewingSubmission(null);
    } catch (error) {
      console.error("Failed to reject submission", error);
    }
  };

  const handleGenerateCode = async (meeting?: any) => {
    try {
      if (!meeting) {
        // Fallback for global button (if any) or error safety
        console.error("No meeting data provided to generate code");
        return;
      }

      console.log('Generating code for meeting:', meeting);

      // Construct payload directly from the meeting object in the row
      // The row data comes from 'prayerMeetings' state which comes from 'getAllMeetings'
      // properties: id, day, period, time (string), church... but we need start_time/end_time in HH:mm
      // 'fetchMeetings' maps them: 
      // time: `${m.start_time} - ${m.end_time}`
      // So the original start_time / end_time might be lost if we don't preserve them in the map.
      // Let's check fetchMeetings map. 
      // It DOES NOT preserve raw start_time/end_time in the mapped object currently?
      // Wait, let's look at fetchMeetings in the file.
      // It maps `time`. It does NOT map start_time/end_time to the final object.
      // We need to ensure start_time and end_time are preserved in the prayerMeetings state.

      const startTime = meeting.start_time || (meeting.time ? meeting.time.split(' - ')[0] : '18:00');
      const endTime = meeting.end_time || (meeting.time ? meeting.time.split(' - ')[1] : '20:00');

      const meetingData = {
        prayergroup_day: meeting.day,
        start_time: startTime || '18:00',
        end_time: endTime || '20:00',
        period: meeting.period,
        prayergroup_leader: ['Current User'],
        prayer_meeting_id: meeting.id,
        church: meeting.church
      };

      const response = await prayerGroupAPI.generateInstance(meetingData);

      const newCode = response?.prayer_code ?? response?.data?.prayer_code;
      const instanceId = response?.prayergroup_id ?? response?.data?.prayergroup_id ?? response?._id ?? response?.id;

      if (newCode) {
        setPrayerMeetings(prev => prev.map(m =>
          m.id === meeting.id ? { ...m, code: newCode, status: 'Ongoing', instanceId: instanceId ?? m.instanceId } : m
        ));

        if (viewingMeeting && (viewingMeeting.id === meeting.id || viewingMeeting.id === meeting.prayer_meeting_id)) {
          setViewingMeeting(prev => ({ ...prev, code: newCode, status: 'Ongoing', instanceId: instanceId ?? prev?.instanceId }));
        }
      }

      // Refresh list to see the new code (full sync)
      fetchMeetings();

    } catch (error) {
      console.error('Failed to generate code', error);
      // alert('Failed to generate prayer code. Please try again.');
    }
  };


  const getTimerDisplay = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'EXPIRED';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  const effectiveInstanceId =
    addParticipantForInstanceId ??
    viewingMeeting?.instanceId ??
    (viewingMeeting?.id != null
      ? prayerMeetings.find((m: any) => m.id === viewingMeeting.id)?.instanceId
      : undefined);

  const isInstanceCodeExpired = (instanceDate?: string, instanceEndTime?: string): boolean => {
    if (!instanceDate || !instanceEndTime) return false;
    const WIGGLE_MS = 2 * 60 * 60 * 1000;
    try {
      const parts = instanceDate.split(/[-/]/);
      const d = parseInt(parts[0] || '', 10);
      const m = parseInt(parts[1] || '', 10) - 1;
      const y = parseInt(parts[2] || '', 10);
      if (parts.length === 3 && !isNaN(y) && !isNaN(m) && !isNaN(d)) {
        const [eh, em] = instanceEndTime.split(':').map(Number);
        const endMs = (eh * 60 + (em || 0)) * 60 * 1000;
        const expiry = new Date(y, m, d).getTime() + endMs + WIGGLE_MS;
        return Date.now() > expiry;
      }
    } catch {
      return false;
    }
    return false;
  };

  const loadMeetingParticipants = async (instanceId: string) => {
    setLoadingMeetingParticipants(true);
    try {
      const res = await prayerGroupAPI.getRecord(instanceId);
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setMeetingParticipantsList(list);
    } catch (e) {
      console.error('Failed to load meeting participants', e);
      setMeetingParticipantsList([]);
    } finally {
      setLoadingMeetingParticipants(false);
    }
  };

  useEffect(() => {
    if (!effectiveInstanceId) {
      setMeetingParticipantsList([]);
      return;
    }
    loadMeetingParticipants(String(effectiveInstanceId));
  }, [effectiveInstanceId]);

  const existingAttendeeIds = useMemo(
    () => new Set(
      meetingParticipantsList
        .map((p: any) => String(p.attendee_id ?? p._id ?? ''))
        .filter(Boolean)
    ),
    [meetingParticipantsList]
  );

  const filteredParticipantSuggestions = useMemo(() => {
    let list = addParticipantPeople.filter(
      (p: any) => !existingAttendeeIds.has(String(p.id ?? ''))
    );
    const q = (participantSearch || '').trim().toLowerCase();
    if (q) {
      list = list.filter((p: any) => (p.name || '').toLowerCase().includes(q));
    }
    return list.slice(0, 50);
  }, [addParticipantPeople, participantSearch, existingAttendeeIds]);

  const addParticipantFromSearch = (entry: ParticipantEntry | string) => {
    const defaultFellowship = fellowshipsList[0];
    const toAdd: ParticipantEntry = typeof entry === 'string'
      ? { name: entry.trim(), fellowship: defaultFellowship?.name ?? 'Church', fellowship_id: Number(defaultFellowship?.id ?? defaultFellowship?._id ?? NaN) }
      : entry;
    if (!toAdd.name) return;
    if (!Number.isFinite(toAdd.fellowship_id)) {
      console.warn('Participant missing valid fellowship_id', toAdd);
      return;
    }
    const alreadyInSelection = selectedParticipants.some(p => p.name === toAdd.name && p.fellowship_id === toAdd.fellowship_id);
    const alreadyInSession = toAdd.id != null && existingAttendeeIds.has(String(toAdd.id));
    if (!alreadyInSelection && !alreadyInSession) {
      setSelectedParticipants(prev => [...prev, toAdd]);
      setParticipantSearch('');
      setShowSuggestions(false);
    }
  };

  const handleAddParticipantsSubmit = async () => {
    const instanceId = effectiveInstanceId;
    if (!instanceId) {
      console.warn('No prayer group instance id (generate code first)');
      return;
    }
    if (selectedParticipants.length === 0) return;
    const openedFromDetails = !!addParticipantForInstanceId;
    try {
      const attendeesPayload = selectedParticipants.map((p) => {
        const fid = Number(p.fellowship_id);
        if (!Number.isFinite(fid)) {
          throw new Error(`Invalid fellowship_id for ${p.name}`);
        }
        return {
          name: p.name,
          fellowship: p.fellowship,
          fellowship_id: fid,
          attendee_id: p.id != null && p.id !== '' ? String(p.id) : undefined,
        };
      });
      await prayerGroupAPI.addMember({
        prayergroup_id: String(instanceId),
        attendees: attendeesPayload,
      });
      setSelectedParticipants([]);
      setParticipantSearch('');
      setIsAddParticipantOpen(false);
      setAddParticipantForInstanceId(null);
      setShowSuggestions(false);
      setViewingMeeting((prev) => prev ? { ...prev, participants: (prev.participants || 0) + selectedParticipants.length } : prev);
      fetchMeetings();
      if (effectiveInstanceId) loadMeetingParticipants(String(effectiveInstanceId));
      if (openedFromDetails) {
        const data = await prayerGroupAPI.getAllRecords(user?.church_id);
        const records = Array.isArray(data) ? data : (data?.records ?? []);
        const instancesWithoutRecords = Array.isArray(data) ? [] : (data?.instancesWithoutRecords ?? []);
        const list = groupSubmissions(records);
        instancesWithoutRecords.forEach((inst: any) => {
          const createdAt = inst.createdAt ? new Date(inst.createdAt).getTime() : Date.now();
          const dateStr = inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : (inst.date || '');
          list.push({
            id: inst._id ?? inst.id,
            title: inst.prayergroup_day ? `${inst.prayergroup_day} Prayer` : 'Prayer Meeting',
            submittedBy: '—',
            count: 0,
            date: dateStr,
            status: 'Pending',
            code: inst.prayer_code || '——',
            participants: [],
            ids: [],
            sortAt: createdAt,
            instanceId: inst._id != null ? String(inst._id) : inst.id,
            instanceDate: inst.date,
            instanceEndTime: inst.end_time,
            isExpired: inst.is_expired,
          });
        });
        list.sort((a, b) => (b.sortAt ?? new Date(b.date).getTime()) - (a.sortAt ?? new Date(a.date).getTime()));
        setSubmissions(list);
        const updated = list.find((s: any) => s.instanceId === String(instanceId));
        if (updated) setDetailsSubmission(updated);
      }
    } catch (e) {
      console.error('Failed to add participants', e);
    }
  };

  return (
    <div className='space-y-8 animate-in fade-in duration-700'>
      {/* Top Header & Selector */}


      <div className='flex border-b border-slate-100'>
        {(['Overview', 'Prayer Meetings', 'Prayer Submissions'] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-[#1A1C1E]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
              {activeTab === tab && (
                <div className='absolute bottom-0 left-0 right-0 h-1 bg-[#CCA856] rounded-t-full'></div>
              )}
            </button>
          )
        )}
      </div>

      {activeTab === 'Overview' && (
        <div className='space-y-10'>
          <div className='flex justify-between items-end'>
            <div>
              <h3 className='text-sm font-black uppercase tracking-widest text-slate-400'>
                Activity Analytics
              </h3>
              <h4 className='text-3xl font-black text-[#1A1C1E] tracking-tight mt-1'>
                Engagement Trends
              </h4>
            </div>
            <div className='flex gap-4'>
              <div className='relative'>
                <button
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className='px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all'
                >
                  <Calendar size={16} className='text-[#CCA856]' />
                  {selectedMonth}
                  <ChevronDown size={14} />
                </button>
                {isDatePickerOpen && (
                  <>
                    <div
                      className='fixed inset-0 z-40'
                      onClick={() => setIsDatePickerOpen(false)}
                    ></div>
                    <div className='absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 p-2 animate-in slide-in-from-top-2'>
                      {monthsList.map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setSelectedMonth(m);
                            setIsDatePickerOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${selectedMonth === m ? 'bg-slate-100 text-[#1A1C1E]' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className='px-5 py-3 bg-[#1A1C1E] text-white rounded-xl text-xs font-black uppercase tracking-widest'>
                This Month
              </div>
            </div>
          </div>

          <div className='bg-white border border-slate-200 p-8 rounded shadow-sm relative overflow-hidden'>
            <div className='flex justify-between mb-10'>
              <h5 className='text-sm font-black uppercase tracking-widest text-[#1A1C1E]'>
                Prayer Meetings Tracked (5 Weeks)
              </h5>
              <div className='flex items-center gap-6'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-[#E74C3C]'></div>
                  <span className='text-[10px] font-black uppercase text-slate-400'>
                    Participants Count
                  </span>
                </div>
              </div>
            </div>
            <div className='h-[400px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={analyticsData.graphData}
                >
                  <defs>
                    <linearGradient id='colorVal' x1='0' y1='0' x2='0' y2='1'>
                      <stop
                        offset='5%'
                        stopColor='#E74C3C'
                        stopOpacity={0.15}
                      />
                      <stop offset='95%' stopColor='#E74C3C' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    stroke='#F1F3F5'
                  />
                  <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#CBD5E1', fontSize: 11, fontWeight: 900 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#CBD5E1', fontSize: 11, fontWeight: 900 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '24px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type='monotone'
                    dataKey='value'
                    stroke='#E74C3C'
                    strokeWidth={5}
                    fillOpacity={1}
                    fill='url(#colorVal)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <StatCard
              title='Total Participants'
              value={analyticsData.totalParticipants?.toLocaleString() || '0'}
              icon={<Users size={20} />}
              trend='+0%' // We can calculate trend later if needed
              variant='default'
            />
            <StatCard
              title='Monthly Target'
              value={analyticsData.monthlyTarget || 'On Track'}
              icon={<Activity size={20} />}
              variant='gold'
            />
            <StatCard
              title='Avg Attendance'
              value={analyticsData.avgAttendance?.toLocaleString() || '0'}
              icon={<BarChart3 size={20} />}
              variant='default'
            />
            <StatCard
              title='Active Cells'
              value={analyticsData.activeCells?.toString() || '0'}
              icon={<Layers size={20} />}
              variant='green'
            />
          </div>
        </div>
      )}

      {activeTab === 'Prayer Meetings' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center bg-slate-50 p-4 rounded-xl'>
            <div className='flex gap-2'>
              {(['Scheduled', 'Ongoing', 'Past'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setMeetingsFilter(f)}
                  className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${meetingsFilter === f ? 'bg-white text-[#1A1C1E] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className='relative'>
              <Search
                size={18}
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-300'
              />
              <input
                type='text'
                placeholder='Search prayer meetings...'
                className='pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-lg outline-none text-xs font-bold w-64 shadow-sm'
              />
            </div>
          </div>

          <div className='overflow-x-auto rounded-2xl border border-slate-50'>
            <table className='w-full text-left'>
              <thead className='bg-[#1A1C1E] text-white'>
                <tr>
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]'>
                    Day & Period
                  </th>
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]'>
                    Time / Date
                  </th>
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]'>
                    Church
                  </th>
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]'>
                    Participants
                  </th>
                  {meetingsFilter !== 'Scheduled' && (
                    <>
                      <th className='px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]'>
                        Status
                      </th>
                      <th className='px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]'>
                        Code / Timer
                      </th>
                    </>
                  )}
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-50'>
                {meetingsFilter === 'Past'
                  ? submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className='hover:bg-slate-50 transition-colors group'
                    >
                      <td className='px-8 py-6 text-sm font-black text-[#1A1C1E]'>
                        {submission.title}
                      </td>
                      <td className='px-8 py-6 text-sm font-bold text-slate-500'>
                        {submission.date}
                      </td>
                      <td className='px-8 py-6 text-sm font-medium text-slate-400 italic'>
                        {churchName || 'Church'}
                      </td>
                      <td className='px-8 py-6 text-sm font-black text-[#CCA856]'>
                        {submission.count}
                      </td>
                      <td className='px-8 py-6'>
                        <span
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${submission.status === 'Approved'
                            ? 'bg-green-50 text-green-500'
                            : submission.status === 'Rejected'
                              ? 'bg-red-50 text-red-500'
                              : 'bg-yellow-50 text-yellow-500'
                            }`}
                        >
                          {submission.status.toUpperCase()}
                        </span>
                      </td>
                      <td className='px-8 py-6'>
                        <div className='flex flex-col gap-1'>
                          <span className='text-xs font-black text-[#1A1C1E] font-mono tracking-widest'>
                            {submission.code || '------'}
                          </span>
                        </div>
                      </td>
                      <td className='px-8 py-6 text-right'>
                        <div className='flex items-center justify-end gap-4'>
                          <button
                            onClick={() => setDetailsSubmission(submission)}
                            className='text-[10px] font-black uppercase tracking-widest text-[#E74C3C] hover:underline'
                          >
                            View Details
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                  : prayerMeetings
                    .filter((m) =>
                      meetingsFilter === 'Scheduled'
                        ? (m.status === 'Scheduled' || m.status === 'Ongoing')
                        : m.status === meetingsFilter
                    )
                    .map((meeting) => (
                      <tr
                        key={meeting.id}
                        className='hover:bg-slate-50 transition-colors group'
                      >
                        <td className='px-8 py-6 text-sm font-black text-[#1A1C1E]'>
                          {meeting.day}
                        </td>
                        <td className='px-8 py-6 text-sm font-bold text-slate-500'>
                          {meeting.time}
                        </td>
                        <td className='px-8 py-6 text-sm font-medium text-slate-400 italic'>
                          {meeting.church}
                        </td>
                        <td className='px-8 py-6 text-sm font-black text-[#CCA856]'>
                          {meeting.participants}
                        </td>
                        {meetingsFilter !== 'Scheduled' && (
                          <>
                            <td className='px-8 py-6'>
                              <span
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${meeting.status === 'Ongoing' ? 'bg-green-50 text-green-500' : 'bg-slate-100 text-slate-400'}`}
                              >
                                {meeting.status}
                              </span>
                            </td>
                            <td className='px-8 py-6'>
                              <div className='flex flex-col gap-1'>
                                {meeting.status === 'Ongoing' && (!meeting.code || meeting.code === '-------' || meeting.code === '------') ? (
                                  <button
                                    onClick={() => handleGenerateCode(meeting)}
                                    className='px-3 py-1.5 bg-[#E74C3C] text-white text-[9px] font-black uppercase tracking-widest rounded shadow-sm hover:bg-red-600 transition-all'
                                  >
                                    Generate
                                  </button>
                                ) : (
                                  <>
                                    <span className='text-xs font-black text-[#1A1C1E] font-mono tracking-widest'>
                                      {meeting.code || '------'}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold ${getTimerDisplay(meeting.expiresAt) === 'EXPIRED' ? 'text-red-500' : 'text-slate-400'}`}
                                    >
                                      {getTimerDisplay(meeting.expiresAt)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                        <td className='px-8 py-6 text-right'>
                          <div className='flex items-center justify-end gap-4'>
                            <button
                              onClick={() => setViewingMeeting(meeting)}
                              className='text-[10px] font-black uppercase tracking-widest text-[#E74C3C] hover:underline'
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Prayer Submissions' && (
        <div className='space-y-6'>
          <div className='flex gap-4'>
            {(['Pending', 'Approved', 'Rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSubmissionsTab(tab)}
                className={`px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${submissionsTab === tab ? 'bg-[#1A1C1E] text-white shadow-xl translate-y-[-2px]' : 'bg-slate-50 text-slate-400'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className='overflow-x-auto rounded-2xl border border-slate-50'>
            <table className='w-full text-left'>
              <thead className='bg-slate-50'>
                <tr>
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Meeting Title
                  </th>
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Submitted By
                  </th>
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Total Count
                  </th>
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Date
                  </th>
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-50'>
                {submissions
                  .filter((s) => s.status === submissionsTab)
                  .map((sub) => (
                    <tr
                      key={sub.id}
                      className='hover:bg-slate-50 transition-colors group'
                    >
                      <td className='px-8 py-6 flex items-center gap-3'>
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-[10px] ${sub.status === 'Approved' ? 'bg-green-50 text-green-500' : sub.status === 'Rejected' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-500'}`}
                        >
                          {sub.title.substring(0, 2).toUpperCase()}
                        </div>
                        <span className='text-sm font-black text-[#1A1C1E]'>
                          {sub.title}
                        </span>
                      </td>
                      <td className='px-8 py-6 text-sm font-bold text-slate-600 truncate max-w-[200px]'>
                        {sub.submittedBy}
                      </td>
                      <td className='px-8 py-6 text-sm font-black text-[#CCA856]'>
                        {sub.count} People
                      </td>
                      <td className='px-8 py-6 text-sm font-bold text-slate-400'>
                        {sub.date}
                      </td>
                      <td className='px-8 py-6 text-right'>
                        {submissionsTab === 'Pending' ? (
                          <button
                            onClick={() => setReviewingSubmission(sub)}
                            className='px-6 py-2.5 bg-[#1A1C1E] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#CCA856] transition-all'
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            onClick={() => setDetailsSubmission(sub)}
                            className='text-[10px] font-black uppercase tracking-widest text-[#E74C3C] hover:underline'
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {viewingMeeting && (
        <Modal
          isOpen={true}
          onClose={() => setViewingMeeting(null)}
          title='Meeting Logistics'
          size='xl'
        >
          <div className='p-10 space-y-12'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <StatCard
                title='Time'
                value={viewingMeeting.time}
                icon={<Clock size={20} />}
                variant='default'
              />
              {viewingMeeting.status === 'Ongoing' && viewingMeeting.code && (
                <StatCard
                  title='Passcode'
                  value={viewingMeeting.code}
                  icon={<Zap size={20} />}
                  variant='gold'
                />
              )}
              <StatCard
                title='Day'
                value={viewingMeeting.day}
                icon={<Calendar size={20} />}
                variant='gold'
              />
              <StatCard
                title='Participants'
                value={viewingMeeting.participants}
                icon={<Users size={20} />}
                variant='green'
              />
            </div>

            <div className='flex justify-between items-center'>
              <h5 className='text-xl font-black text-[#1A1C1E] tracking-tight'>
                Prayer Group Participants
              </h5>
              <div className='flex items-center gap-4'>
                {viewingMeeting.status === 'Ongoing' && (!viewingMeeting.code || viewingMeeting.code === '-------' || viewingMeeting.code === '------') && (
                  <button
                    onClick={() => handleGenerateCode(viewingMeeting)}
                    className='flex items-center gap-2 px-6 py-4 bg-[#E74C3C] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all'
                  >
                    <Zap size={18} /> Generate Code
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedParticipants([]);
                    setAddParticipantForInstanceId(null);
                    setIsAddParticipantOpen(true);
                  }}
                  className='flex items-center gap-2 px-8 py-4 bg-[#1A1C1E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all'
                >
                  <Plus size={18} /> Add Participant
                </button>
              </div>
            </div>

            <div className='overflow-hidden rounded-2xl border border-slate-50'>
              <table className='w-full text-left'>
                <thead className='bg-[#E74C3C] text-white'>
                  <tr>
                    <th className='px-8 py-5 text-[10px] font-black uppercase'>
                      Name
                    </th>
                    <th className='px-8 py-5 text-[10px] font-black uppercase'>
                      Fellowship
                    </th>
                    <th className='px-8 py-5 text-[10px] font-black uppercase'>
                      Status
                    </th>
                    <th className='px-8 py-5 text-[10px] font-black uppercase text-right'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-50'>
                  {loadingMeetingParticipants ? (
                    <tr>
                      <td colSpan={4} className='px-8 py-16 text-center text-slate-400 text-sm'>
                        Loading participants…
                      </td>
                    </tr>
                  ) : meetingParticipantsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className='px-8 py-16 text-center text-slate-300 italic font-medium'
                      >
                        No participants added to this session yet.
                      </td>
                    </tr>
                  ) : (
                    meetingParticipantsList.map((p: any) => (
                      <tr key={p.attendee_id ?? p._id ?? p.name} className='hover:bg-slate-50'>
                        <td className='px-8 py-6 font-bold text-[#1A1C1E]'>
                          {p.name || '—'}
                        </td>
                        <td className='px-8 py-6 text-slate-500 font-medium'>
                          {p.fellowship || '—'}
                        </td>
                        <td className='px-8 py-6'>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${(p.status || '').toLowerCase() === 'approved' || (p.status || '').toLowerCase() === 'present' ? 'bg-green-50 text-green-500' : 'bg-slate-100 text-slate-500'}`}>
                            {(p.status || 'Pending') === 'Approved' ? 'Present' : (p.status || 'Pending')}
                          </span>
                        </td>
                        <td className='px-8 py-6 text-right'>
                          <button
                            type='button'
                            onClick={() => {
                              const id = effectiveInstanceId && (p.attendee_id ?? p._id);
                              if (id && window.confirm('Remove this participant from the session?')) {
                                prayerGroupAPI.removeMember(String(effectiveInstanceId), String(id)).then(() => loadMeetingParticipants(String(effectiveInstanceId)));
                              }
                            }}
                            className='text-red-400 hover:text-red-600 transition-colors'
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Participant Modal */}
      <Modal
        isOpen={isAddParticipantOpen}
        onClose={() => {
          setIsAddParticipantOpen(false);
          setAddParticipantForInstanceId(null);
        }}
        title='Add Participant'
        size='lg'
        stackAbove
      >
        <div className='p-10 space-y-8'>
          <div className='space-y-2'>
            <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
              Church
            </label>
            <div className='w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-500'>
              {churchName || 'Church'}
            </div>
          </div>

          <div className='space-y-4 relative'>
            <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2'>
              Participant Name *
            </label>

            <div className='flex flex-wrap gap-2 mb-3'>
              {selectedParticipants.map((p, idx) => (
                <div
                  key={`${p.name}-${p.fellowship_id}-${idx}`}
                  className='flex items-center gap-2 px-4 py-2 bg-[#CCA856] text-white rounded-lg text-xs font-black uppercase tracking-widest'
                >
                  {p.name}
                  <button
                    type='button'
                    onClick={() =>
                      setSelectedParticipants((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className='hover:text-red-200'
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className='relative'>
              <Search
                size={18}
                className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-300'
              />
              <input
                type='text'
                placeholder='Type name or search members...'
                value={participantSearch}
                onChange={(e) => {
                  setParticipantSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className='w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-2xl outline-none text-sm font-bold shadow-sm focus:shadow-md focus:border-[#CCA856] transition-all'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && participantSearch.trim()) {
                    addParticipantFromSearch(participantSearch.trim());
                  }
                }}
              />

              {showSuggestions && (
                <div className='absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[110] max-h-64 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 p-2'>
                  {isLoadingAddParticipantPeople ? (
                    <div className='px-5 py-8 text-center text-slate-400 text-sm'>Loading members and workers...</div>
                  ) : filteredParticipantSuggestions.length > 0 ? (
                    filteredParticipantSuggestions.map((person: any, idx: number) => {
                      const isSelected = selectedParticipants.some(p => p.name === person.name && p.fellowship_id === person.fellowship_id);
                      return (
                        <button
                          type='button'
                          key={person.id ?? person.name ?? idx}
                          onClick={() => addParticipantFromSearch(person)}
                          className='w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-all rounded-lg flex items-center justify-between group'
                        >
                          <div>
                            <p className='text-sm font-black text-[#1A1C1E] group-hover:text-[#CCA856]'>
                              {person.name}
                            </p>
                            <p className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>
                              {person.fellowship} {person.cell ? `• ${person.cell}` : ''}
                            </p>
                          </div>
                          {isSelected && (
                            <Check size={16} className='text-green-500' />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className='px-5 py-8 text-center'>
                      <p className='text-xs font-bold text-slate-400 uppercase'>
                        No members or workers match
                      </p>
                      {participantSearch.trim() && (
                        <button
                          type='button'
                          onClick={() => addParticipantFromSearch(participantSearch.trim())}
                          className='mt-2 text-[10px] font-black text-[#E74C3C] uppercase tracking-widest hover:underline'
                        >
                          Click to add &quot;{participantSearch}&quot; as custom entry
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className='text-[10px] text-slate-300 font-medium italic'>
              Search by name or type a custom name to add.
            </p>
          </div>

          <div className='flex gap-4 pt-4'>
            <button
              type='button'
              onClick={() => {
                setIsAddParticipantOpen(false);
                setAddParticipantForInstanceId(null);
                setShowSuggestions(false);
              }}
              className='flex-1 py-5 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleAddParticipantsSubmit}
              disabled={selectedParticipants.length === 0 || !effectiveInstanceId}
              title={!effectiveInstanceId ? 'Generate code first to add participants' : undefined}
              className='flex-1 py-5 bg-[#1A1C1E] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-[#CCA856] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Add {selectedParticipants.length} Participants
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Submission Modal */}
      {reviewingSubmission && (
        <Modal
          isOpen={true}
          onClose={() => setReviewingSubmission(null)}
          title='Approve Prayer Submission'
          size='lg'
        >
          <ReviewSubmissionContent
            submission={reviewingSubmission}
            onClose={() => setReviewingSubmission(null)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </Modal>
      )}

      {/* Attendance Record Details (Approved/Rejected) */}
      {detailsSubmission && (
        <Modal
          isOpen={true}
          onClose={() => setDetailsSubmission(null)}
          title='Attendance Record Details'
          size='lg'
        >
          <div className='p-10 space-y-10'>
            <div className='flex justify-between items-start'>
              <div>
                <h4 className='text-3xl font-black text-[#1A1C1E] tracking-tight uppercase'>
                  {detailsSubmission.title}
                </h4>
                <p className='text-sm font-bold text-slate-400 uppercase tracking-widest mt-1'>
                  {detailsSubmission.date} •{' '}
                  {detailsSubmission.code || 'NO CODE'}
                </p>
              </div>
              <div
                className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest ${detailsSubmission.status === 'Approved' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}
              >
                {detailsSubmission.status}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <StatCard
                title={detailsSubmission.submittedByRole ? `Submitted by ${detailsSubmission.submittedByRole}` : 'Submitted By'}
                value={detailsSubmission.submittedBy}
                icon={<User size={18} />}
                variant='default'
              />
              <StatCard
                title='Total Participants'
                value={detailsSubmission.count}
                icon={<Users size={18} />}
                variant='gold'
              />
            </div>

            {detailsSubmission.instanceId &&
              (detailsSubmission.isExpired === false ||
                (detailsSubmission.isExpired !== true && !isInstanceCodeExpired(detailsSubmission.instanceDate, detailsSubmission.instanceEndTime))) && (
              <div className='flex justify-start'>
                <button
                  type='button'
                  onClick={() => {
                    setAddParticipantForInstanceId(detailsSubmission.instanceId);
                    setSelectedParticipants([]);
                    setParticipantSearch('');
                    setIsAddParticipantOpen(true);
                  }}
                  className='flex items-center gap-2 px-8 py-4 bg-[#1A1C1E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all'
                >
                  <Plus size={18} /> Add Participant
                </button>
              </div>
            )}

            <div className='space-y-6'>
              <h5 className='text-sm font-black uppercase tracking-widest text-[#1A1C1E]'>
                Attendance Breakdown
              </h5>
              <div className='space-y-4'>
                {Object.entries(
                  detailsSubmission.participants.reduce((acc: any, p: any) => {
                    const raw = p.cell || '';
                    const isUnknown = /^unknown\s+(fellowship|cell|unit)$/i.test(raw.trim()) || raw.trim() === '';
                    const cell = isUnknown ? '__no_unit__' : (raw || 'Other');
                    if (!acc[cell]) acc[cell] = [];
                    acc[cell].push(p);
                    return acc;
                  }, {})
                )
                  .map(([cellName, parts]: [string, any]) => {
                    const isUnknownUnit = cellName === '__no_unit__';
                    const displayName = isUnknownUnit ? '' : cellName;
                    return (
                      <div
                        key={cellName}
                        className='p-8 bg-white border border-slate-100 rounded-2xl shadow-sm'
                      >
                        {displayName ? (
                          <div className='flex justify-between items-center mb-6'>
                            <span className='text-base font-black text-[#1A1C1E]'>
                              {displayName}
                            </span>
                            <span className='text-xs font-black text-[#CCA856] uppercase tracking-widest'>
                              Participants: {parts.length}
                            </span>
                          </div>
                        ) : (
                          <div className='flex justify-end items-center mb-6'>
                            <span className='text-xs font-black text-[#CCA856] uppercase tracking-widest'>
                              Participants: {parts.length}
                            </span>
                          </div>
                        )}
                        <div className='grid grid-cols-2 gap-4'>
                          {parts.map((p: any, idx: number) => (
                            <div key={idx} className='flex items-center gap-3'>
                              <div className='w-2 h-2 rounded-full bg-green-500'></div>
                              <span className='text-sm font-bold text-slate-600'>
                                {p.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const ReviewSubmissionContent = ({ submission, onClose, onApprove, onReject }: any) => {
  const [checkedParticipants, setCheckedParticipants] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<string[]>([]);

  // Split participants
  const pendingParticipants = useMemo(() =>
    submission?.participants?.filter((p: any) => p.status !== 'Approved') || [],
    [submission]);

  const approvedParticipants = useMemo(() =>
    submission?.participants?.filter((p: any) => p.status === 'Approved') || [],
    [submission]);

  useEffect(() => {
    // 1. Initialize checked list (check all PENDING items by default)
    if (pendingParticipants.length > 0) {
      setCheckedParticipants(pendingParticipants.map((p: any) => p.id));
    }

    // 2. Identify Duplicates
    if (submission?.participants) {
      const idCounts: Record<string, number> = {};
      const duplicateIds: string[] = [];

      submission.participants.forEach((p: any) => {
        const key = p.id;
        if (!key) return;
        idCounts[key] = (idCounts[key] || 0) + 1;
      });

      Object.keys(idCounts).forEach(key => {
        if (idCounts[key] > 1) duplicateIds.push(key);
      });
      setDuplicates(duplicateIds);
    }
  }, [submission, pendingParticipants]);

  const toggleParticipant = (id: string, status: string) => {
    if (status === 'Approved') return;

    setCheckedParticipants(prev =>
      prev.includes(id)
        ? prev.filter(pId => pId !== id)
        : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    const allPendingSelected = pendingParticipants.every((p: any) => checkedParticipants.includes(p.id));

    if (allPendingSelected) {
      setCheckedParticipants([]);
    } else {
      setCheckedParticipants(pendingParticipants.map((p: any) => p.id));
    }
  };

  const areAllSelected = pendingParticipants.length > 0 &&
    pendingParticipants.every((p: any) => checkedParticipants.includes(p.id));

  return (
    <div className='p-10 space-y-10'>
      <div className='flex justify-between items-start'>
        <div>
          <h4 className='text-3xl font-black text-[#1A1C1E] tracking-tight uppercase'>
            {submission.title}
          </h4>
          <p className='text-sm font-bold text-slate-400 uppercase tracking-widest mt-1'>
            {submission.date}
          </p>
        </div>
        <div className='text-right'>
          <p className='text-[10px] font-black uppercase text-slate-400'>
            {submission.submittedByRole ? `Submitted by ${submission.submittedByRole}` : 'Submitted By'}
          </p>
          <p className='text-sm font-bold text-[#1A1C1E]'>
            {submission.submittedBy}
          </p>
        </div>
      </div>

      <div className='flex items-center justify-between p-6 bg-yellow-50 rounded-2xl border border-yellow-100'>
        <div className='flex items-center gap-4'>
          <Info className='text-yellow-500' size={24} />
          <div>
            <p className='text-xs font-black text-yellow-600 uppercase'>
              Reviewing Pending Batch
            </p>
            <p className='text-[11px] font-medium text-yellow-500'>
              Carefully verify participants before approving for database
              sync.
            </p>
          </div>
        </div>
        <button
          onClick={handleToggleAll}
          className='px-6 py-3 bg-white text-[#1A1C1E] rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-[#CCA856] hover:text-white transition-all w-48'
        >
          {areAllSelected ? 'Unselect All' : 'Mark All Present'}
        </button>
      </div>

      <div className='space-y-4'>
        <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
          {checkedParticipants.length} Participants Selected
        </p>

        {/* PENDING / REJECTED GRID */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {pendingParticipants.map((p: any, idx: number) => {
            const isChecked = checkedParticipants.includes(p.id);
            const isDuplicate = duplicates.includes(p.id);

            return (
              <div
                key={p.id || idx}
                onClick={() => toggleParticipant(p.id, p.status)}
                className={`first-letter:flex items-center justify-between p-6 bg-white border rounded-xl transition-all group relative cursor-pointer
                  ${isChecked ? 'border-[#CCA856] ring-1 ring-[#CCA856]/20' : 'border-slate-100 hover:border-slate-200'}
                  ${isDuplicate ? 'ring-2 ring-red-500/10 border-red-500/50' : ''}`}
              >
                {isDuplicate && (
                  <div className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm z-10">
                    Duplicate
                  </div>
                )}

                <div className='flex items-center justify-between w-full'>
                  <div className='flex items-center gap-4'>
                    <div>
                      <p className='text-sm font-black text-[#1A1C1E]'>
                        {p.name}
                      </p>
                      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>
                        {p.cell}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${p.status === 'Rejected' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-500'}`}>
                      {p.status || 'Pending'}
                    </span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all 
                        ${isChecked ? 'border-green-500 bg-green-500 text-white' : 'border-slate-200 text-transparent'}`}>
                      <Check size={14} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* APPROVED SECTION */}
      {approvedParticipants.length > 0 && (
        <div className='space-y-4 pt-6 border-t border-slate-100'>
          <p className='text-[10px] font-black uppercase tracking-widest text-[#1A1C1E]'>
            Approved Participants ({approvedParticipants.length})
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {approvedParticipants.map((p: any, idx: number) => (
              <div
                key={p.id || idx}
                className='flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-xl opacity-60'
              >
                <div className='flex items-center gap-4'>
                  <div>
                    <p className='text-sm font-black text-[#1A1C1E]'>
                      {p.name}
                    </p>
                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>
                      {p.cell}
                    </p>
                  </div>
                </div>
                <span className='px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest bg-green-50 text-green-500'>
                  Approved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='flex gap-6 pt-4'>
        <button
          disabled={checkedParticipants.length === 0}
          onClick={() => onReject(submission.id, checkedParticipants)}
          className={`flex-1 py-4 px-6 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
            ${checkedParticipants.length > 0 ? 'text-red-400 hover:bg-red-50 hover:border-red-100' : 'text-slate-300 cursor-not-allowed'}`}
        >
          Reject {checkedParticipants.length > 0 ? `${checkedParticipants.length} Selected` : 'Selection'}
        </button>
        <button
          disabled={checkedParticipants.length === 0}
          onClick={() => onApprove(submission.id, checkedParticipants)}
          className={`flex-1 py-4 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 transition-all
            ${checkedParticipants.length > 0
              ? 'bg-[#1A1C1E] text-white hover:bg-[#CCA856]'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}`}
        >
          Approve {checkedParticipants.length > 0 ? `${checkedParticipants.length} Selected` : 'Selection'}
        </button>

      </div>
    </div>
  );
};

export default PrayerModule;
