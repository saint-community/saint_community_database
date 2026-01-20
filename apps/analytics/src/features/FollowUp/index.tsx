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
import RecordBlock from '../../components/RecordBlock';
const FollowUpModule = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [sessions, setSessions] = useState<FollowUpSession[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingSession, setViewingSession] = useState<FollowUpSession | null>(
    null
  );
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combined searchable people list
  const [allParticipants, setAllParticipants] = useState<string[]>([]);
  const [membersOnly, setMembersOnly] = useState<string[]>([]);

  // Load participants (Members + Workers)
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const [membersData, workersData] = await Promise.all([
          memberAPI.getAllMembers(),
          structureAPI.getWorkers(),
        ]);

        const memberNames = Array.isArray(membersData)
          ? membersData.map((m: any) =>
            m.first_name || m.last_name
              ? `${m.first_name || ''} ${m.last_name || ''}`.trim()
              : m.email
          )
          : [];

        const workerNames = Array.isArray(workersData)
          ? workersData.map((w: any) => `${w.first_name} ${w.last_name}`.trim())
          : [];

        const uniqueNames = Array.from(
          new Set([...memberNames, ...workerNames])
        ).sort();
        setAllParticipants(uniqueNames);
        setMembersOnly(memberNames.sort());
      } catch (error) {
        console.error('Failed to load participants:', error);
      }
    };
    loadParticipants();
  }, []);

  // Normalizer for duration parsing
  const parseToMinutes = (durationStr: string) => {
    if (durationStr.includes(':')) {
      const parts = durationStr.split(':');
      if (parts.length === 3)
        return (
          parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60
        );
      if (parts.length === 2)
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return parseInt(durationStr) || 0;
  };

  // Load sessions from API on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const data = await followUpAPI.getHistory();
        setSessions(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load follow-up sessions:', err);
        setError(err.message || 'Failed to load sessions');
        setSessions(mockFollowUpSessions);
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, []);

  const [backendStats, setBackendStats] = useState<any>(null);

  // Load backend stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await followUpAPI.getStats();
        setBackendStats(statsData);
      } catch (err) {
        console.error('Failed to load follow-up stats:', err);
      }
    };
    if (activeTab === 'Overview') loadStats();
  }, [activeTab]);

  // Stats calculation
  const stats = useMemo(() => {
    if (backendStats) {
      return {
        totalSessions: backendStats.total_sessions || 0,
        completionCount: 0,
        completionRate: 0,
        totalHours: Math.round((backendStats.total_minutes || 0) / 60),
        avgDuration: 0,
        activeMembers: backendStats.total_members_taught || 0,
      };
    }

    const memberCounts: Record<string, number> = {};
    let totalMinutes = 0;
    let totalRecords = 0;
    const uniqueMembers = new Set<string>();

    sessions.forEach((s) => {
      s.records.forEach((r) => {
        totalRecords++;
        totalMinutes += parseToMinutes(r.duration);
        // personFollowedUp might be a comma separated list
        const names = r.personFollowedUp
          .split(', ')
          .map((n) => n.trim())
          .filter(Boolean);
        names.forEach((name) => {
          memberCounts[name] = (memberCounts[name] || 0) + 1;
          uniqueMembers.add(name);
        });
      });
    });

    const completionCount = Object.values(memberCounts).filter(
      (count) => count >= 10
    ).length;
    const completionRate =
      uniqueMembers.size > 0 ? (completionCount / uniqueMembers.size) * 100 : 0;
    const avgDuration = totalRecords > 0 ? totalMinutes / totalRecords : 0;

    return {
      totalSessions: sessions.length,
      completionCount,
      completionRate: Math.round(completionRate),
      totalHours: Math.round(totalMinutes / 60),
      avgDuration: Math.round(avgDuration),
      activeMembers: uniqueMembers.size,
    };
  }, [sessions, backendStats]);

  // Calculate Monthly Trends from real data
  const monthlyTrend = useMemo(() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const trendMap = new Array(12).fill(0);

    sessions.forEach((session) => {
      if (session.date) {
        const date = new Date(session.date);
        if (!isNaN(date.getTime())) {
          const monthIndex = date.getMonth(); // 0-11
          trendMap[monthIndex]++;
        }
      }
    });

    return months.map((month, index) => ({
      name: month,
      value2: trendMap[index],
    }));
  }, [sessions]);

  // Form states for adding a new session
  const [fuDate, setFuDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuTime, setFuTime] = useState('19:20');
  const [fuLocation, setFuLocation] = useState('');
  const [fuParticipants, setFuParticipants] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [fuSummary, setFuSummary] = useState('');
  const [fuRecords, setFuRecords] = useState<FollowUpRecord[]>([
    {
      id: Date.now().toString(),
      personFollowedUp: '',
      subjectTaught: '',
      materialSource: '',
      duration: '30',
      comments: '',
    },
  ]);

  const [recordMemberSearch, setRecordMemberSearch] = useState<
    Record<string, string>
  >({});

  const toggleSelection = (
    item: string,
    list: string[],
    setter: (val: string[]) => void
  ) => {
    if (list.includes(item)) setter(list.filter((p) => p !== item));
    else setter([...list, item]);
  };

  const addFuRecord = () => {
    setFuRecords([
      ...fuRecords,
      {
        id: (Date.now() + Math.random()).toString(),
        personFollowedUp: '',
        subjectTaught: '',
        materialSource: '',
        duration: '30',
        comments: '',
      },
    ]);
  };

  const updateFuRecord = (id: string, updates: Partial<FollowUpRecord>) => {
    setFuRecords(
      fuRecords.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const removeFuRecord = (id: string) => {
    if (fuRecords.length > 1)
      setFuRecords(fuRecords.filter((r) => r.id !== id));
  };

  const handleSaveSession = async () => {
    // Validation: Ensure location is provided
    if (!fuLocation || fuLocation.trim() === '') {
      alert('Location Area is required.');
      return;
    }

    // Validation: Ensure no empty records
    if (
      fuRecords.some(
        (r) => !r.personFollowedUp || r.personFollowedUp.trim() === ''
      )
    ) {
      alert('Please select at least one member taught for all soul entries.');
      return;
    }

    const newSession: FollowUpSession = {
      id: `fu-session-${Date.now()}`,
      date: fuDate,
      time: fuTime,
      worker: fuParticipants[0] || 'Unknown',
      location: fuLocation,
      summary: fuSummary,
      participants: fuParticipants,
      records: fuRecords,
      createdAt: new Date().toISOString(),
    };

    try {
      setIsLoading(true);
      await followUpAPI.create(newSession);
      const updatedSessions = await followUpAPI.getHistory();
      setSessions(updatedSessions);
      setIsFormOpen(false);
      setFuRecords([
        {
          id: Date.now().toString(),
          personFollowedUp: '',
          subjectTaught: '',
          materialSource: '',
          duration: '30',
          comments: '',
        },
      ]);
      setFuSummary('');
      setFuLocation('');
      setError(null);
      alert('Follow-up session created successfully!');
    } catch (err: any) {
      console.error('Failed to save follow-up session:', err);
      setError(err.message || 'Failed to save session');
      alert('Failed to save follow-up session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateViewingSession = async () => {
    if (viewingSession) {
      try {
        setIsLoading(true);
        await followUpAPI.update(viewingSession.id, viewingSession);
        const updatedSessions = await followUpAPI.getHistory();
        setSessions(updatedSessions);
        setViewingSession(null);
        setError(null);
        alert('Follow-up session details updated successfully!');
      } catch (err: any) {
        console.error('Failed to update session:', err);
        setError(err.message || 'Failed to update session');
        alert('Failed to update session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (
      !window.confirm('Are you sure you want to delete this follow-up session?')
    )
      return;

    try {
      setIsLoading(true);
      await followUpAPI.delete(id);
      const updatedSessions = await followUpAPI.getHistory();
      setSessions(updatedSessions);
      setViewingSession(null);
      setError(null);
    } catch (err: any) {
      console.error('Failed to delete session:', err);
      setError(err.message || 'Failed to delete session');
      alert('Failed to delete session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(
      (s) =>
        s.participants
          .join(', ')
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        s.records.some((r) =>
          r.personFollowedUp.toLowerCase().includes(search.toLowerCase())
        )
    );
  }, [sessions, search]);

  const exportFollowUpToCSV = (session: FollowUpSession) => {
    const headers = [
      'Session Date',
      'Start Time',
      'Location',
      'Participants',
      'Record #',
      'Members Taught',
      'Topic',
      'Material Used',
      'Duration (min)',
      'Comments',
    ];
    const rows = session.records.map((r, idx) => [
      session.date,
      session.time || '19:20',
      session.location || 'Church Hall',
      session.participants.join('; '),
      idx + 1,
      r.personFollowedUp,
      r.subjectTaught,
      r.materialSource || '',
      r.duration,
      r.comments,
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `FollowUp_Session_${session.date}.csv`);
    link.click();
  };

  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  return (
    <div className='space-y-8 animate-in fade-in duration-500'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-black text-[#1A1C1E] tracking-tight'>
            Follow Up Ministry
          </h2>
          <p className='text-slate-500 text-sm mt-1'>
            Review discipleship engagement across members and leaders.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className='bg-[#E74C3C] text-white px-6 py-3 rounded text-sm font-bold shadow hover:bg-red-600 transition-all flex items-center gap-2'
        >
          <Plus size={18} /> New Follow Up
        </button>
      </div>

      <div className='flex gap-4 border-b border-slate-200'>
        {['Overview', 'Records'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === tab ? 'border-[#CCA856] text-[#1A1C1E]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className='space-y-10'>
          {/* REFINED STAT CARDS */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            <StatCard
              title='Total Sessions'
              value={stats.totalSessions}
              icon={<Calendar size={18} />}
              variant='default'
            />
            <StatCard
              title='Completion (10+)'
              value={`${stats.completionCount} (${stats.completionRate}%)`}
              icon={<CheckCircle2 size={18} />}
              variant='gold'
            />
            <StatCard
              title='Total Hours'
              value={stats.totalHours}
              icon={<Clock size={18} />}
              variant='default'
            />
            <StatCard
              title='Avg Duration'
              value={`${stats.avgDuration}m`}
              icon={<Clock3 size={18} />}
              variant='default'
            />
            <StatCard
              title='Active Members'
              value={stats.activeMembers}
              icon={<Users size={18} />}
              variant='green'
            />
          </div>

          {/* TREND GRAPH */}
          <div className='bg-white p-8 rounded border border-slate-200 shadow-sm'>
            <div className='flex justify-between items-center mb-10'>
              <div>
                <h3 className='text-lg font-black text-[#1A1C1E] tracking-tight uppercase'>
                  Follow-Up Trends
                </h3>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1'>
                  Engagement frequency over time
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-sm bg-[#CCA856]'></div>
                <span className='text-[9px] text-slate-500 font-black uppercase tracking-widest'>
                  Growth Rate
                </span>
              </div>
            </div>
            <div className='h-[350px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id='colorFU' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#CCA856' stopOpacity={0.1} />
                      <stop offset='95%' stopColor='#CCA856' stopOpacity={0} />
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
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  />
                  <Tooltip />
                  <Area
                    type='monotone'
                    dataKey='value2'
                    stroke='#CCA856'
                    fillOpacity={1}
                    fill='url(#colorFU)'
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Records' && (
        <div className='bg-white border border-slate-200 rounded shadow-sm overflow-hidden min-h-[400px]'>
          <table className='w-full text-left'>
            <thead className='bg-[#F8F9FA] text-slate-500 border-b border-slate-200'>
              <tr>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                  Date
                </th>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                  Participants
                </th>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                  Logs
                </th>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider text-right'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {filteredSessions.map((session) => (
                <tr
                  key={session.id}
                  onClick={() => {
                    setIsEditingSession(false);
                    setViewingSession(session);
                  }}
                  className='hover:bg-slate-50 transition-colors cursor-pointer group'
                >
                  <td className='px-6 py-5 text-sm font-bold text-[#1A1C1E]'>
                    {session.date}
                  </td>
                  <td className='px-6 py-5 font-bold text-slate-700'>
                    {session.participants.join(', ')}
                  </td>
                  <td className='px-6 py-5'>
                    <span className='px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-black rounded border border-slate-200'>
                      {session.records.length} Entries
                    </span>
                  </td>
                  <td className='px-6 py-5 text-right relative'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenActionMenu(
                          openActionMenu === session.id ? null : session.id
                        );
                      }}
                      className='p-2 text-slate-300 hover:text-slate-600 transition-colors'
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openActionMenu === session.id && (
                      <div className='absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-50 py-1 animate-in fade-in zoom-in-95 duration-200'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingSession(false);
                            setViewingSession(session);
                            setOpenActionMenu(null);
                          }}
                          className='w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1A1C1E] flex items-center gap-2'
                        >
                          <Eye size={14} /> View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingSession(true);
                            setViewingSession(session);
                            setOpenActionMenu(null);
                          }}
                          className='w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1A1C1E] flex items-center gap-2'
                        >
                          <Edit2 size={14} /> Edit Session
                        </button>
                        <div className='h-px bg-slate-100 my-1'></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                            setOpenActionMenu(null);
                          }}
                          className='w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2'
                        >
                          <Trash2 size={14} /> Delete Session
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: LOG FOLLOW UP SESSION (ADD NEW) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title='Log Follow-Up Session'
        size='xl'
      >
        <div className='space-y-8 pb-10'>
          <section className='bg-white p-6 rounded border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Session Date
              </label>
              <input
                type='date'
                value={fuDate}
                onChange={(e) => setFuDate(e.target.value)}
                className='w-full px-4 py-2.5 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm text-[#1A1C1E]'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Start Time
              </label>
              <input
                type='time'
                value={fuTime}
                onChange={(e) => setFuTime(e.target.value)}
                className='w-full px-4 py-2.5 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm text-[#1A1C1E]'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Location Area
              </label>
              <input
                type='text'
                placeholder='e.g. Alausa Market'
                value={fuLocation}
                onChange={(e) => setFuLocation(e.target.value)}
                className='w-full px-4 py-2.5 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm text-[#1A1C1E]'
              />
            </div>
            <div className='col-span-3 space-y-2 pt-4 border-t border-slate-100'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Participant(s)
              </label>
              <div className='relative group'>
                <Search
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                  size={14}
                />
                <input
                  type='text'
                  placeholder='Search workers / members who participated...'
                  className='w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-xs'
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                />
              </div>
              <div className='flex flex-wrap gap-2 py-2'>
                {fuParticipants.map((p) => (
                  <span
                    key={p}
                    className='flex items-center gap-1 px-2.5 py-1 bg-[#1A1C1E] text-white rounded text-[10px] font-black tracking-tight uppercase'
                  >
                    {p}
                    <button
                      onClick={() =>
                        toggleSelection(p, fuParticipants, setFuParticipants)
                      }
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[120px] overflow-y-auto custom-scrollbar p-3 bg-[#F8F9FA] border border-slate-200 rounded'>
                {allParticipants
                  .filter((p) =>
                    p.toLowerCase().includes(participantSearch.toLowerCase())
                  )
                  .map((person) => (
                    <label
                      key={person}
                      className='flex items-center gap-2 cursor-pointer group'
                    >
                      <input
                        type='checkbox'
                        checked={fuParticipants.includes(person)}
                        onChange={() =>
                          toggleSelection(
                            person,
                            fuParticipants,
                            setFuParticipants
                          )
                        }
                        className='w-3.5 h-3.5 rounded border-slate-300 text-[#CCA856] focus:ring-[#CCA856]'
                      />
                      <span
                        className={`text-[11px] font-bold ${fuParticipants.includes(person) ? 'text-[#1A1C1E]' : 'text-slate-500'} group-hover:text-[#1A1C1E] transition-colors line-clamp-1`}
                      >
                        {person}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          </section>

          <section className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h4 className='text-sm font-black text-[#1A1C1E] uppercase tracking-[0.2em] border-l-4 border-[#CCA856] pl-3'>
                Follow Up Details
              </h4>
              <button
                onClick={addFuRecord}
                className='flex items-center gap-2 px-4 py-2 bg-[#E74C3C] text-white rounded text-xs font-bold shadow-sm hover:bg-red-600 transition-all'
              >
                <Plus size={14} /> Add Soul Entry
              </button>
            </div>
            <div className='space-y-6'>
              {fuRecords.map((rec, i) => (
                <RecordBlock
                  key={rec.id}
                  rec={rec}
                  i={i}
                  onUpdate={updateFuRecord}
                  onRemove={removeFuRecord}
                  searches={recordMemberSearch}
                  setSearches={setRecordMemberSearch}
                  exclude={fuParticipants}
                  membersOnly={membersOnly}
                />
              ))}
            </div>
          </section>

          <section className='space-y-3 pt-6 border-t border-slate-100'>
            <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
              Summary of the Follow up
            </label>
            <textarea
              value={fuSummary}
              onChange={(e) => setFuSummary(e.target.value)}
              className='w-full px-4 py-4 bg-white border border-slate-200 rounded outline-none font-medium text-sm min-h-[140px] shadow-sm'
              placeholder='Provide a holistic summary of the entire session results...'
            ></textarea>
          </section>

          <div className='flex justify-end gap-3 pt-8 border-t border-slate-100'>
            <button
              onClick={() => setIsFormOpen(false)}
              className='px-8 py-3 bg-slate-100 text-slate-600 rounded text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSession}
              className='px-10 py-3 bg-[#1A1C1E] text-white rounded font-black shadow-lg uppercase tracking-widest text-xs hover:bg-[#2d3035] transition-all active:scale-95'
            >
              Complete Session Report
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: DISCIPLESHIP SESSION VIEW (EDIT/VIEW) */}
      <Modal
        isOpen={!!viewingSession}
        onClose={() => setViewingSession(null)}
        title={
          isEditingSession
            ? 'Edit Discipleship Session'
            : 'Discipleship Session View'
        }
        size='xl'
      >
        {viewingSession && (
          <div className='space-y-8 pb-10'>
            <div className='flex justify-between items-center px-6 py-4 bg-[#1A1C1E] text-white rounded shadow-lg'>
              <div>
                <h4 className='text-sm font-black uppercase tracking-[0.2em]'>
                  Discipleship Session
                </h4>
                <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1'>
                  {viewingSession.date}
                </p>
              </div>
              <button
                onClick={() => exportFollowUpToCSV(viewingSession)}
                className='flex items-center gap-2 px-4 py-2 bg-[#CCA856] text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-[#b8954d] transition-all shadow-sm'
              >
                <FileSpreadsheet size={16} /> Export CSV
              </button>
            </div>

            <section className='bg-white p-6 rounded border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Session Date
                </label>
                <input
                  type='date'
                  disabled={!isEditingSession}
                  value={viewingSession.date}
                  onChange={(e) =>
                    setViewingSession({
                      ...viewingSession,
                      date: e.target.value,
                    })
                  }
                  className='w-full px-4 py-2.5 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm text-[#1A1C1E] disabled:opacity-75 disabled:cursor-not-allowed'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Start Time
                </label>
                <input
                  type='time'
                  value={viewingSession.time || ''}
                  disabled={!isEditingSession}
                  onChange={(e) =>
                    setViewingSession({
                      ...viewingSession,
                      time: e.target.value,
                    })
                  }
                  className='w-full px-4 py-2.5 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm text-[#1A1C1E] disabled:opacity-75 disabled:cursor-not-allowed'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Location Area
                </label>
                <input
                  type='text'
                  disabled={!isEditingSession}
                  value={viewingSession.location || ''}
                  onChange={(e) =>
                    setViewingSession({
                      ...viewingSession,
                      location: e.target.value,
                    })
                  }
                  className='w-full px-4 py-2.5 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm text-[#1A1C1E] disabled:opacity-75 disabled:cursor-not-allowed'
                />
              </div>
              <div className='col-span-3 space-y-2 pt-4 border-t border-slate-100'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Participant(s)
                </label>
                {isEditingSession ? (
                  <>
                    <div className='flex flex-wrap gap-2 py-2'>
                      {viewingSession.participants.map((p) => (
                        <span
                          key={p}
                          className='flex items-center gap-1 px-2.5 py-1 bg-[#1A1C1E] text-white rounded text-[10px] font-black tracking-tight uppercase'
                        >
                          {p}
                          <button
                            onClick={() =>
                              toggleSelection(
                                p,
                                viewingSession.participants,
                                (val) =>
                                  setViewingSession({
                                    ...viewingSession,
                                    participants: val,
                                  })
                              )
                            }
                            className='hover:text-[#CCA856]'
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[120px] overflow-y-auto custom-scrollbar p-3 bg-[#F8F9FA] border border-slate-200 rounded'>
                      {allParticipants.map((person) => (
                        <label
                          key={person}
                          className='flex items-center gap-2 cursor-pointer group'
                        >
                          <input
                            type='checkbox'
                            checked={viewingSession.participants.includes(
                              person
                            )}
                            onChange={() =>
                              toggleSelection(
                                person,
                                viewingSession.participants,
                                (val) =>
                                  setViewingSession({
                                    ...viewingSession,
                                    participants: val,
                                  })
                              )
                            }
                            className='w-3.5 h-3.5 rounded border-slate-300 text-[#CCA856] focus:ring-[#CCA856]'
                          />
                          <span
                            className={`text-[11px] font-bold ${viewingSession.participants.includes(person) ? 'text-[#1A1C1E]' : 'text-slate-500'} group-hover:text-[#1A1C1E] transition-colors line-clamp-1`}
                          >
                            {person}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className='flex flex-wrap gap-2 py-2'>
                    {viewingSession.participants.map((p) => (
                      <span
                        key={p}
                        className='flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-black tracking-tight uppercase'
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className='space-y-6'>
              <div className='flex justify-between items-center'>
                <h4 className='text-sm font-black text-[#1A1C1E] uppercase tracking-[0.2em] border-l-4 border-[#CCA856] pl-3'>
                  Follow Up Details
                </h4>
                {isEditingSession && (
                  <button
                    onClick={() => {
                      const newRec = {
                        id: Date.now().toString(),
                        personFollowedUp: '',
                        subjectTaught: '',
                        materialSource: '',
                        duration: '30',
                        comments: '',
                      };
                      setViewingSession({
                        ...viewingSession,
                        records: [...viewingSession.records, newRec],
                      });
                    }}
                    className='flex items-center gap-2 px-4 py-2 bg-[#E74C3C] text-white rounded text-xs font-bold shadow-sm hover:bg-red-600 transition-all'
                  >
                    <Plus size={14} /> Add Soul Entry
                  </button>
                )}
              </div>
              <div className='space-y-6'>
                {viewingSession.records.map((rec, i) => (
                  <RecordBlock
                    key={rec.id}
                    rec={rec}
                    i={i}
                    readOnly={!isEditingSession}
                    onUpdate={(rid: string, updates: any) => {
                      const n = [...viewingSession.records];
                      const idx = n.findIndex((x) => x.id === rid);
                      n[idx] = { ...n[idx], ...updates };
                      setViewingSession({ ...viewingSession, records: n });
                    }}
                    onRemove={(rid: string) =>
                      setViewingSession({
                        ...viewingSession,
                        records: viewingSession.records.filter(
                          (x) => x.id !== rid
                        ),
                      })
                    }
                    searches={recordMemberSearch}
                    setSearches={setRecordMemberSearch}
                    membersOnly={membersOnly}
                  />
                ))}
              </div>
            </section>

            <section className='space-y-3 pt-6 border-t border-slate-100'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Summary of the Follow up
              </label>
              <textarea
                disabled={!isEditingSession}
                value={
                  viewingSession.summary ||
                  ''
                }
                onChange={(e) =>
                  setViewingSession({
                    ...viewingSession,
                    summary: e.target.value,
                  })
                }
                className='w-full px-4 py-4 bg-white border border-slate-200 rounded outline-none font-medium text-sm min-h-[140px] shadow-sm disabled:opacity-75 disabled:cursor-not-allowed'
                placeholder='Provide a holistic summary...'
              ></textarea>
            </section>

            <div className='flex justify-end gap-3 pt-8 border-t border-slate-100'>
              <button
                onClick={() => setViewingSession(null)}
                className='px-8 py-3 bg-slate-100 text-slate-600 rounded text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all'
              >
                Close
              </button>
              {isEditingSession ? (
                <button
                  onClick={handleUpdateViewingSession}
                  className='px-10 py-3 bg-[#1A1C1E] text-white rounded font-black shadow-lg uppercase tracking-widest text-xs hover:bg-[#2d3035] transition-all active:scale-95'
                >
                  Update Session
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingSession(true)}
                  className='px-10 py-3 bg-[#CCA856] text-white rounded font-black shadow-lg uppercase tracking-widest text-xs hover:bg-[#b8954d] transition-all active:scale-95'
                >
                  Edit Session
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default FollowUpModule;
