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
  FELLOWSHIPS,
  CELLS,
} from '../../data/lists';
import { getMemberGroup } from '../../utils/helpers';
const PrayerModule = () => {
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

  // Multi-select and Search States for Add Participant
  const [selectedFellowships, setSelectedFellowships] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch Prayer Groups (Configs)
  const [meetingPeriods, setMeetingPeriods] = useState<string[]>([]);
  const [meetingConfigs, setMeetingConfigs] = useState<any[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groups = await prayerGroupAPI.getAllMeetings();
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
  }, []);

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

  // Filtered members based on fellowship and cell
  const suggestedMembers = useMemo(() => {
    let filtered = MEMBERS_LIST.map((m) => ({
      name: m,
      fellowship: getMemberGroup(m),
      cell: getMemberGroup(m),
    })); // Mock mapping
    if (selectedFellowships.length > 0) {
      filtered = filtered.filter((m) =>
        selectedFellowships.includes(m.fellowship)
      );
    }
    if (selectedCells.length > 0) {
      filtered = filtered.filter((m) => selectedCells.includes(m.cell));
    }
    if (participantSearch.trim()) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(participantSearch.toLowerCase())
      );
    }
    return filtered;
  }, [selectedFellowships, selectedCells, participantSearch]);

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

    // Let's check:
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (currentDayIndex === targetDayIndex) {
      if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
        return 'Ongoing';
      }
      if (nowMinutes > endMinutes) {
        return 'Past'; // Or 'Past'
      }
    }
    return 'Scheduled';
  };

  // Fetch Prayer Meetings
  const fetchMeetings = async () => {
    try {
      setIsLoadingMeetings(true);
      const data = await prayerGroupAPI.getAllMeetings();
      console.log('fetchMeetings API data:', data);
      const mapped = data.map((m: any) => ({
        id: m.id || m.prayergroup_id || Math.random(),
        day: m.prayergroup_day || m.day || 'Unknown Day',
        period: m.period || 'Evening',
        time:
          m.start_time && m.end_time
            ? `${m.start_time} - ${m.end_time}`
            : m.time || '00:00 - 00:00',
        church: m.church_name || 'Isolo Church',
        participants: m.attendees?.length || m.participants || 0,
        status: calculateMeetingStatus(m.prayergroup_day, m.start_time, m.end_time),
        code: m.prayer_code || m.code || '------',
        expiresAt: m.expiresAt || Date.now() + 2 * 3600000,
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
  }, [activeTab]);

  // Mock Submissions Data - Moved to State
  const [submissions, setSubmissions] = useState([
    {
      id: 101,
      title: 'Friday Evening',
      submittedBy: 'Michael B.',
      count: 3,
      date: '2024-05-26',
      status: 'Pending',
      participants: [
        { name: 'Joy E.', cell: 'Oke-afa Cell 1' },
        { name: 'Kelechi U.', cell: 'Aswan Cell' },
        { name: 'Chioma A.', cell: 'Oke-afa Cell 1' },
      ],
    },
    {
      id: 102,
      title: 'Friday Evening',
      code: 'PRGAFA',
      submittedBy: 'Pastor Robert, Gbenga Adeniji, Funmi Adeniji',
      count: 13,
      date: '2024-05-19',
      status: 'Approved',
      participants: [
        { name: 'Robert', cell: 'Oke-afa Cell 1' },
        { name: 'Mary J.', cell: 'Oke-afa Cell 1' },
        { name: 'Chinwe Onwe', cell: 'Oke-afa Cell 1' },
        { name: 'Gbemi Goriola', cell: 'Oke-afa Cell 1' },
        { name: 'Tola A.', cell: 'Unit 2' },
        { name: 'Bisi B.', cell: 'Unit 2' },
        { name: 'Kunle C.', cell: 'Unit 3' },
        { name: 'Wale D.', cell: 'Unit 3' },
      ],
    },
    {
      id: 103,
      title: 'Friday evening',
      submittedBy: 'Michael B.',
      count: 3,
      date: '2024-05-26',
      status: 'Rejected',
      participants: [
        { name: 'Joy E.', cell: 'Oke-afa Cell 1' },
        { name: 'Kelechi U.', cell: 'Aswan Cell' },
      ],
    },
  ]);

  const handleApprove = (id: number) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Approved' } : s))
    );
    setReviewingSubmission(null);
  };

  const handleReject = (id: number) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Rejected' } : s))
    );
    setReviewingSubmission(null);
  };

  const handleGenerateCode = async (specificPeriod?: string) => {
    try {
      // Use specific period if passed (e.g. from row button), otherwise use state (though global button is removed)
      const labelToUse = typeof specificPeriod === 'string' ? specificPeriod : meetingPeriod;
      const selectedLabel = labelToUse.replace(' Prayer Meeting', '');

      const config = meetingConfigs.find((c: any) => {
        const configLabel = `${c.prayergroup_day} ${c.period}`;
        return configLabel.toLowerCase() === selectedLabel.toLowerCase();
      });

      const meetingData = {
        prayergroup_day: config?.prayergroup_day || selectedLabel.split(' ')[0] || 'Friday',
        start_time: config?.start_time || '18:00',
        end_time: config?.end_time || '20:00',
        period: config?.period || selectedLabel.split(' ')[1] || 'Evening',
        prayergroup_leader: config?.prayergroup_leader
          ? (Array.isArray(config.prayergroup_leader) ? config.prayergroup_leader : [config.prayergroup_leader])
          : ['Current User'],
      };

      // Call the INSTANCE creation endpoint (which generates code)
      await prayerGroupAPI.generateInstance(meetingData);

      // Refresh list to see the new code
      fetchMeetings();

    } catch (error) {
      console.error('Failed to generate code', error);
      alert('Failed to generate prayer code. Please try again.');
    }
  };


  const getTimerDisplay = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'EXPIRED';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  const toggleSelection = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addParticipantFromSearch = (name: string) => {
    if (name.trim() && !selectedParticipants.includes(name)) {
      setSelectedParticipants([...selectedParticipants, name]);
      setParticipantSearch('');
      setShowSuggestions(false);
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
                  data={[
                    { name: 'W1', value: 320 },
                    { name: 'W2', value: 450 },
                    { name: 'W3', value: 390 },
                    { name: 'W4', value: 680 },
                    { name: 'W5', value: 540 },
                  ]}
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
              value='2,380'
              icon={<Users size={20} />}
              trend='+14.2%'
              variant='default'
            />
            <StatCard
              title='Monthly Target'
              value='On Track'
              icon={<Activity size={20} />}
              variant='gold'
            />
            <StatCard
              title='Avg Attendance'
              value='450'
              icon={<BarChart3 size={20} />}
              variant='default'
            />
            <StatCard
              title='Active Cells'
              value='12'
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
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]'>
                    Status
                  </th>
                  <th className='px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]'>
                    Code / Timer
                  </th>
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
                        Isolo Church
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
                          <button className='p-2 text-slate-300 hover:text-red-500 transition-colors'>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                  : prayerMeetings
                    .filter((m) => m.status === meetingsFilter)
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
                                onClick={() => handleGenerateCode(`${meeting.day} ${meeting.period} Prayer Meeting`)}
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
                        <td className='px-8 py-6 text-right'>
                          <div className='flex items-center justify-end gap-4'>
                            <button
                              onClick={() => setViewingMeeting(meeting)}
                              className='text-[10px] font-black uppercase tracking-widest text-[#E74C3C] hover:underline'
                            >
                              View Details
                            </button>
                            <button className='p-2 text-slate-300 hover:text-red-500 transition-colors'>
                              <Trash2 size={18} />
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
                title='Time Started'
                value={viewingMeeting.time.split(' - ')[0]}
                icon={<Clock size={20} />}
                variant='default'
              />
              <StatCard
                title='Time Ended'
                value={viewingMeeting.time.split(' - ')[1]}
                icon={<Clock3 size={20} />}
                variant='default'
              />
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
                    onClick={() => handleGenerateCode(`${viewingMeeting.day} Evening Prayer Meeting`)}
                    className='flex items-center gap-2 px-6 py-4 bg-[#E74C3C] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all'
                  >
                    <Zap size={18} /> Generate Code
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedFellowships([]);
                    setSelectedCells([]);
                    setSelectedParticipants([]);
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
                  {viewingMeeting.participants === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className='px-8 py-16 text-center text-slate-300 italic font-medium'
                      >
                        No participants added to this session yet.
                      </td>
                    </tr>
                  ) : (
                    <tr className='hover:bg-slate-50'>
                      <td className='px-8 py-6 font-bold text-[#1A1C1E]'>
                        John Smith
                      </td>
                      <td className='px-8 py-6 text-slate-500 font-medium'>
                        Oke Afa Fellowship
                      </td>
                      <td className='px-8 py-6'>
                        <span className='px-3 py-1 bg-green-50 text-green-500 rounded-full text-[9px] font-black uppercase tracking-widest'>
                          Present
                        </span>
                      </td>
                      <td className='px-8 py-6 text-right'>
                        <button className='text-red-400 hover:text-red-600 transition-colors'>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
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
        onClose={() => setIsAddParticipantOpen(false)}
        title='Add Participant'
        size='lg'
      >
        <div className='p-10 space-y-8'>
          {/* Church Section (Static) */}
          <div className='space-y-2'>
            <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
              Church
            </label>
            <div className='w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-500'>
              Isolo Church
            </div>
          </div>

          {/* Fellowship and Cell Multi-select Section */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2'>
                Select Fellowships
              </label>
              <div className='flex flex-wrap gap-2'>
                {FELLOWSHIPS.map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      toggleSelection(
                        selectedFellowships,
                        setSelectedFellowships,
                        f
                      )
                    }
                    className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${selectedFellowships.includes(f) ? 'bg-[#1A1C1E] text-white border-[#1A1C1E] shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className='space-y-4'>
              <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2'>
                Select Cells
              </label>
              <div className='flex flex-wrap gap-2'>
                {CELLS.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      toggleSelection(selectedCells, setSelectedCells, c)
                    }
                    className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${selectedCells.includes(c) ? 'bg-[#1A1C1E] text-white border-[#1A1C1E] shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Searchable Multi-select Participants */}
          <div className='space-y-4 relative'>
            <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2'>
              Participant Name *
            </label>

            <div className='flex flex-wrap gap-2 mb-3'>
              {selectedParticipants.map((name) => (
                <div
                  key={name}
                  className='flex items-center gap-2 px-4 py-2 bg-[#CCA856] text-white rounded-lg text-xs font-black uppercase tracking-widest'
                >
                  {name}
                  <button
                    onClick={() =>
                      setSelectedParticipants(
                        selectedParticipants.filter((p) => p !== name)
                      )
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
                    addParticipantFromSearch(participantSearch);
                  }
                }}
              />

              {showSuggestions && (
                <div className='absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[110] max-h-64 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 p-2'>
                  {suggestedMembers.length > 0 ? (
                    suggestedMembers.map((member) => (
                      <button
                        key={member.name}
                        onClick={() => addParticipantFromSearch(member.name)}
                        className='w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-all rounded-lg flex items-center justify-between group'
                      >
                        <div>
                          <p className='text-sm font-black text-[#1A1C1E] group-hover:text-[#CCA856]'>
                            {member.name}
                          </p>
                          <p className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>
                            {member.fellowship} • {member.cell}
                          </p>
                        </div>
                        {selectedParticipants.includes(member.name) && (
                          <Check size={16} className='text-green-500' />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className='px-5 py-8 text-center'>
                      <p className='text-xs font-bold text-slate-400 uppercase'>
                        No members found matching filters
                      </p>
                      <button
                        onClick={() =>
                          addParticipantFromSearch(participantSearch)
                        }
                        className='mt-2 text-[10px] font-black text-[#E74C3C] uppercase tracking-widest hover:underline'
                      >
                        Click to add "{participantSearch}" as custom entry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className='text-[10px] text-slate-300 font-medium italic'>
              Auto-filtered based on selected Fellowships and Cells. You can
              also type custom names.
            </p>
          </div>

          <div className='flex gap-4 pt-4'>
            <button
              onClick={() => {
                setIsAddParticipantOpen(false);
                setShowSuggestions(false);
              }}
              className='flex-1 py-5 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsAddParticipantOpen(false);
                setShowSuggestions(false);
                // In a real app, logic to save these selectedParticipants would go here
              }}
              className='flex-1 py-5 bg-[#1A1C1E] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-[#CCA856] transition-all'
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
          <div className='p-10 space-y-10'>
            <div className='flex justify-between items-start'>
              <div>
                <h4 className='text-3xl font-black text-[#1A1C1E] tracking-tight uppercase'>
                  {reviewingSubmission.title}
                </h4>
                <p className='text-sm font-bold text-slate-400 uppercase tracking-widest mt-1'>
                  {reviewingSubmission.date}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-[10px] font-black uppercase text-slate-400'>
                  Submitted By
                </p>
                <p className='text-sm font-bold text-[#1A1C1E]'>
                  {reviewingSubmission.submittedBy}
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
              <button className='px-6 py-3 bg-white text-[#1A1C1E] rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm'>
                Mark All Present
              </button>
            </div>

            <div className='space-y-4'>
              <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                {reviewingSubmission.participants.length} Participants Selected
              </p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {reviewingSubmission.participants.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between p-6 bg-white border border-slate-100 rounded-xl hover:border-[#CCA856] transition-all cursor-pointer group'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 font-black text-[10px] group-hover:bg-[#CCA856] group-hover:text-white transition-all'>
                        {p.name[0]}
                      </div>
                      <div>
                        <p className='text-sm font-black text-[#1A1C1E]'>
                          {p.name}
                        </p>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>
                          {p.cell}
                        </p>
                      </div>
                    </div>
                    <div className='w-6 h-6 rounded-full border-2 border-slate-100 flex items-center justify-center text-green-500'>
                      <Check size={14} />
                    </div>
                  </div>

                ))}
              </div>
            </div>

            <div className='flex gap-6 pt-4'>
              <button
                onClick={() => handleReject(reviewingSubmission.id)}
                className='flex-1 py-5 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-50 hover:border-red-100 transition-all'
              >
                Reject Entire Batch
              </button>
              <button
                onClick={() => handleApprove(reviewingSubmission.id)}
                className='flex-1 py-5 bg-[#1A1C1E] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-[#CCA856] transition-all'
              >
                Approve {reviewingSubmission.participants.length} Selected
                Entries
              </button>

            </div>
          </div>
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
                title='Submitted By'
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

            <div className='space-y-6'>
              <h5 className='text-sm font-black uppercase tracking-widest text-[#1A1C1E]'>
                Attendance Breakdown By Unit
              </h5>
              <div className='space-y-4'>
                {Object.entries(
                  detailsSubmission.participants.reduce((acc: any, p: any) => {
                    const cell = p.cell || 'Unknown Cell';
                    if (!acc[cell]) acc[cell] = [];
                    acc[cell].push(p);
                    return acc;
                  }, {})
                ).map(([cellName, parts]: [string, any]) => (
                  <div
                    key={cellName}
                    className='p-8 bg-white border border-slate-100 rounded-2xl shadow-sm'
                  >
                    <div className='flex justify-between items-center mb-6'>
                      <span className='text-base font-black text-[#1A1C1E]'>
                        {cellName}
                      </span>
                      <span className='text-xs font-black text-[#CCA856] uppercase tracking-widest'>
                        Participants: {parts.length}
                      </span>
                    </div>
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
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default PrayerModule;
