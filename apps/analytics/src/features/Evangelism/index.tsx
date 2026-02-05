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
const EvangelismModule = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [sessions, setSessions] = useState<EvangelismSession[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingSession, setViewingSession] =
    useState<EvangelismSession | null>(null);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [detailSearch, setDetailSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = ['Overview', 'Records'];

  // Session-based state for form
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sessionTime, setSessionTime] = useState('19:20');
  const [sessionParticipants, setSessionParticipants] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [sessionLocation, setSessionLocation] = useState('');
  const [formRecords, setFormRecords] = useState<EvangelismRecord[]>([
    {
      id: Date.now().toString(),
      personReached: '',
      gender: 'Male',
      age: 25,
      phone: '',
      address: '',
      isSaved: true,
      isFilled: false,
      isHealed: false,
      comments: '',
    },
  ]);

  // Load sessions from API on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const data = await evangelismAPI.getHistory();
        setSessions(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load evangelism sessions:', err);
        setError(err.message || 'Failed to load sessions');
        // Fallback to mock data if API fails
        setSessions(mockEvangelismSessions);
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
        const statsData = await evangelismAPI.getStats();
        setBackendStats(statsData);
      } catch (err) {
        console.error('Failed to load evangelism stats:', err);
      }
    };
    if (activeTab === 'Overview') loadStats();
  }, [activeTab]);

  // Computed Stats for Overview
  const stats = useMemo(() => {
    if (backendStats) {
      // Use new backend stats format
      return {
        saved: backendStats.totalSaved || 0,
        filled: backendStats.totalFilled || 0,
        healed: backendStats.totalHealed || 0,
        workersInvolved: backendStats.workersInvolved || 0,
        membersInvolved: backendStats.membersInvolved || 0,
      };
    }

    // Fallback: Calculate from local sessions data
    const uniqueParticipants = new Set<string>();
    let saved = 0,
      filled = 0,
      healed = 0;

    sessions.forEach((s) => {
      s.participants.forEach((p) => uniqueParticipants.add(p));
      s.records.forEach((r) => {
        if (r.isSaved) saved++;
        if (r.isFilled) filled++;
        if (r.isHealed) healed++;
      });
    });

    return {
      saved,
      filled,
      healed,
      workersInvolved: uniqueParticipants.size,
      membersInvolved: 0,
    };
  }, [sessions, backendStats]);

  const addRecordRow = () => {
    setFormRecords([
      ...formRecords,
      {
        id: Date.now().toString() + Math.random(),
        personReached: '',
        gender: 'Male',
        age: 25,
        phone: '',
        address: '',
        isSaved: true,
        isFilled: false,
        isHealed: false,
        comments: '',
        healedConditionBefore: '',
        healedConditionAfter: '',
      },
    ]);
  };

  const removeRecordRow = (id: string) => {
    if (formRecords.length > 1)
      setFormRecords(formRecords.filter((r) => r.id !== id));
  };

  const updateRecord = (id: string, updates: Partial<EvangelismRecord>) => {
    setFormRecords(
      formRecords.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(
      (s) =>
        s.participants
          .join(', ')
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [sessions, search]);

  const [allParticipants, setAllParticipants] = useState<string[]>([]);

  // Load participants (Members + Workers)
  useEffect(() => {
    const loadParticipants = async () => {
      console.log('Fetching participants...');
      try {
        // Log tokens before fetching
        console.log('Sanctum Token:', localStorage.getItem('sanctum_token'));
        console.log('Auth Token:', localStorage.getItem('auth_token'));

        const [membersData, workersData] = await Promise.all([
          memberAPI.getAllMembers(),
          structureAPI.getWorkers(),
        ]);

        console.log('Members Data Raw:', membersData);
        console.log('Workers Data Raw:', workersData);

        const memberNames = Array.isArray(membersData)
          ? membersData.map((m: any) => m.name || m.full_name || 'Unknown Member')
          : [];

        const workerNames = Array.isArray(workersData)
          ? workersData.map((w: any) =>
            `${w.name || w.full_name || w.first_name || 'Unknown Worker'} (w)`
          )
          : [];

        const uniqueNames = Array.from(
          new Set([...memberNames, ...workerNames])
        ).sort();
        setAllParticipants(uniqueNames);
      } catch (error) {
        console.error('Failed to load participants:', error);
        setAllParticipants([]);
      }
    };
    loadParticipants();
  }, []);

  const filteredMembersForSelection = (searchVal: string) => {
    return allParticipants.filter((m) =>
      m.toLowerCase().includes(searchVal.toLowerCase())
    );
  };

  const handleSaveSession = async () => {
    const newSession: EvangelismSession = {
      id: `session - ${Date.now()} `,
      date: sessionDate,
      time: sessionTime,
      location: sessionLocation,
      participants: sessionParticipants,
      records: formRecords,
      createdAt: new Date().toISOString(),
    };

    try {
      setIsLoading(true);
      await evangelismAPI.create(newSession);
      // Reload sessions after successful create
      const updatedSessions = await evangelismAPI.getHistory();
      setSessions(updatedSessions);
      setIsFormOpen(false);
      setFormRecords([
        {
          id: Date.now().toString(),
          personReached: '',
          gender: 'Male',
          age: 25,
          phone: '',
          address: '',
          isSaved: true,
          isFilled: false,
          isHealed: false,
          comments: '',
          healedConditionBefore: '',
          healedConditionAfter: '',
        },
      ]);
      setSessionLocation('');
      setSessionParticipants([]);
      setParticipantSearch('');
      setError(null);
      alert('Evangelism session created successfully!');
    } catch (err: any) {
      console.error('Failed to save session:', err);
      setError(err.message || 'Failed to save session');
      alert('Failed to save evangelism session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateViewingSession = async () => {
    if (viewingSession) {
      try {
        setIsLoading(true);
        await evangelismAPI.update(viewingSession.id, viewingSession);
        const updatedSessions = await evangelismAPI.getHistory();
        setSessions(updatedSessions);
        setIsEditingSession(false);
        setViewingSession(null);
        setError(null);
        alert('Evangelism session details updated successfully!');
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
      !window.confirm(
        'Are you sure you want to delete this evangelism session?'
      )
    )
      return;

    try {
      setIsLoading(true);
      await evangelismAPI.delete(id);
      const updatedSessions = await evangelismAPI.getHistory();
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

  const toggleParticipant = (
    member: string,
    currentParticipants: string[],
    setter: (val: string[]) => void
  ) => {
    if (currentParticipants.includes(member))
      setter(currentParticipants.filter((p) => p !== member));
    else setter([...currentParticipants, member]);
  };

  const exportToCSV = (session: EvangelismSession) => {
    const headers = [
      'Session Date',
      'Start Time',
      'Location',
      'Participants',
      'Record #',
      'Person Reached',
      'Gender',
      'Age',
      'Saved',
      'Filled',
      'Healed',
      'Condition Before',
      'Condition After',
      'Phone',
      'Address',
      'Comments/Testimony',
    ];
    const rows = session.records.map((r, idx) => [
      session.date,
      session.time,
      session.location,
      session.participants.join('; '),
      idx + 1,
      r.personReached,
      r.gender,
      r.age,
      r.isSaved ? 'Yes' : 'No',
      r.isFilled ? 'Yes' : 'No',
      r.isHealed ? 'Yes' : 'No',
      r.healedConditionBefore || '',
      r.healedConditionAfter || '',
      r.phone,
      r.address,
      r.comments,
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(', ')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `Evangelism_Session_${session.date}.csv`);
    link.click();
  };

  const updateViewingRecord = (
    id: string,
    updates: Partial<EvangelismRecord>
  ) => {
    if (viewingSession) {
      const updatedRecords = viewingSession.records.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      );
      setViewingSession({ ...viewingSession, records: updatedRecords });
    }
  };

  const removeViewingRecord = (id: string) => {
    if (viewingSession && viewingSession.records.length > 1) {
      setViewingSession({
        ...viewingSession,
        records: viewingSession.records.filter((r) => r.id !== id),
      });
    }
  };

  const addViewingRecord = () => {
    if (viewingSession) {
      const newRec: EvangelismRecord = {
        id: Date.now().toString(),
        personReached: '',
        gender: 'Male',
        age: 25,
        phone: '',
        address: '',
        isSaved: true,
        isFilled: false,
        isHealed: false,
        comments: '',
      };
      setViewingSession({
        ...viewingSession,
        records: [...viewingSession.records, newRec],
      });
    }
  };

  return (
    <div className='space-y-8 animate-in fade-in duration-500'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-black text-[#1A1C1E] tracking-tight'>
            Evangelism Outreach
          </h2>
          <p className='text-slate-500 text-sm mt-1'>
            Spiritual impact tracking and soul-winning directory.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className='bg-[#E74C3C] text-white px-6 py-3 rounded text-sm font-bold shadow hover:bg-red-600 transition-all flex items-center gap-2'
        >
          <Plus size={18} /> Add Evangelism Record
        </button>
      </div>
      <div className='flex gap-4 border-b border-slate-200'>
        {tabs.map((tab) => (
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
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <StatCard
              title='Total Saved'
              value={stats.saved}
              icon={<UserCheck size={20} />}
              variant='red'
            />
            <StatCard
              title='Total Filled'
              value={stats.filled}
              icon={<Flame size={20} />}
              variant='gold'
            />
            <StatCard
              title='Total Healed'
              value={stats.healed}
              icon={<HeartPulse size={20} />}
              variant='green'
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-white p-6 rounded border border-slate-200 flex items-center justify-between'>
              <div>
                <p className='text-slate-400 text-[10px] font-black uppercase tracking-widest'>
                  Workers Involved
                </p>
                <div className='flex items-baseline gap-2 mt-1'>
                  <h4 className='text-2xl font-black text-[#1A1C1E]'>
                    {stats.workersInvolved}
                  </h4>
                  <span className='text-slate-300 font-bold text-sm'>
                    / {WORKERS_LIST.length} Total Workers
                  </span>
                </div>
              </div>
              <div className='w-16 h-16 rounded-full border-4 border-slate-50 border-t-[#CCA856] flex items-center justify-center'>
                <span className='text-[10px] font-black text-[#CCA856]'>
                  {Math.round(
                    (stats.workersInvolved / WORKERS_LIST.length) * 100
                  )}
                  %
                </span>
              </div>
            </div>
            <div className='bg-white p-6 rounded border border-slate-200 flex items-center justify-between'>
              <div>
                <p className='text-slate-400 text-[10px] font-black uppercase tracking-widest'>
                  Members Involved
                </p>
                <div className='flex items-baseline gap-2 mt-1'>
                  <h4 className='text-2xl font-black text-[#1A1C1E]'>
                    {stats.membersInvolved}
                  </h4>
                  <span className='text-slate-300 font-bold text-sm'>
                    / {MEMBERS_LIST.length} Total Members
                  </span>
                </div>
              </div>
              <div className='w-16 h-16 rounded-full border-4 border-slate-50 border-t-green-500 flex items-center justify-center'>
                <span className='text-[10px] font-black text-green-500'>
                  {Math.round(
                    (stats.membersInvolved / MEMBERS_LIST.length) * 100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Records' && (
        <div className='bg-white border border-slate-200 rounded shadow-sm overflow-hidden'>
          <table className='w-full text-left'>
            <thead className='bg-[#F8F9FA] text-slate-500 border-b border-slate-200'>
              <tr>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                  Participants
                </th>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                  Date & Time
                </th>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                  Records
                </th>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                  Location
                </th>
                <th className='px-6 py-4 text-[11px] font-black uppercase tracking-wider'>
                  Impact
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
                    setViewingSession(session);
                    setIsEditingSession(false);
                  }}
                  className='hover:bg-slate-50/80 transition-colors cursor-pointer group'
                >
                  <td className='px-6 py-5 font-bold text-sm text-[#1A1C1E]'>
                    {session.participants.join(', ')}
                  </td>
                  <td className='px-6 py-5 text-xs text-slate-600 font-medium'>
                    {session.date} @ {session.time}
                  </td>
                  <td className='px-6 py-5'>
                    <span className='px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-black rounded border border-slate-200'>
                      {session.records.length} Records
                    </span>
                  </td>
                  <td className='px-6 py-5 text-xs text-slate-500 font-medium'>
                    {session.location}
                  </td>
                  <td className='px-6 py-5'>
                    <div className='flex gap-2'>
                      {session.records.some((r) => r.isSaved) && (
                        <UserCheck size={14} className='text-red-500' />
                      )}
                      {session.records.some((r) => r.isFilled) && (
                        <Flame size={14} className='text-gold' />
                      )}
                      {session.records.some((r) => r.isHealed) && (
                        <HeartPulse size={14} className='text-green-500' />
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-5 text-right'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingSession(session);
                        setIsEditingSession(false);
                      }}
                      className='p-2 text-slate-300 hover:text-slate-900 transition-colors'
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: ADD EVANGELISM RECORD */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title='Add Evangelism Record'
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
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className='w-full px-4 py-2.5 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm text-[#1A1C1E]'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Start Time
              </label>
              <input
                type='time'
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
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
                value={sessionLocation}
                onChange={(e) => setSessionLocation(e.target.value)}
                className='w-full px-4 py-2.5 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm text-[#1A1C1E]'
              />
            </div>
            <div className='md:col-span-3 space-y-2 pt-4 border-t border-slate-100'>
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
                  placeholder='Search and select workers who participated...'
                  className='w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-xs'
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                />
              </div>
              <div className='flex flex-wrap gap-2 py-2'>
                {sessionParticipants.map((p) => (
                  <span
                    key={p}
                    className='flex items-center gap-1 px-2.5 py-1 bg-[#1A1C1E] text-white rounded text-[10px] font-black tracking-tight uppercase'
                  >
                    {p}
                    <button
                      onClick={() =>
                        toggleParticipant(
                          p,
                          sessionParticipants,
                          setSessionParticipants
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
                {filteredMembersForSelection(participantSearch).map(
                  (member) => (
                    <label
                      key={member}
                      className='flex items-center gap-2 cursor-pointer group'
                    >
                      <input
                        type='checkbox'
                        checked={sessionParticipants.includes(member)}
                        onChange={() =>
                          toggleParticipant(
                            member,
                            sessionParticipants,
                            setSessionParticipants
                          )
                        }
                        className='w-3.5 h-3.5 rounded border-slate-300 text-[#CCA856] focus:ring-[#CCA856]'
                      />
                      <span className='text-[11px] font-bold text-slate-500 group-hover:text-[#1A1C1E] line-clamp-1'>
                        {member}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>
          </section>

          <section className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h4 className='text-sm font-black text-[#1A1C1E] uppercase tracking-[0.2em] border-l-4 border-[#CCA856] pl-3'>
                Impact Details
              </h4>
              <button
                onClick={addRecordRow}
                className='flex items-center gap-2 px-4 py-2 bg-[#E74C3C] text-white rounded text-xs font-bold shadow-sm hover:bg-red-600 transition-all'
              >
                <Plus size={14} /> Add Soul Reached
              </button>
            </div>
            <div className='space-y-6'>
              {formRecords.map((rec, i) => (
                <div
                  key={rec.id}
                  className='p-6 bg-white rounded border border-slate-200 relative shadow-sm'
                >
                  <div className='absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-200 rounded shadow-sm'>
                    <span className='text-[9px] font-black text-[#CCA856] uppercase tracking-[0.2em]'>
                      Record #{i + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => removeRecordRow(rec.id)}
                    className='absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 transition-colors'
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-6 pt-2'>
                    <div className='md:col-span-2 space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase ml-1'>
                        Full Name
                      </label>
                      <input
                        type='text'
                        placeholder="Reached person's name..."
                        value={rec.personReached}
                        onChange={(e) =>
                          updateRecord(rec.id, {
                            personReached: e.target.value,
                          })
                        }
                        className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-bold text-sm'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase ml-1'>
                        Gender
                      </label>
                      <select
                        value={rec.gender}
                        onChange={(e) =>
                          updateRecord(rec.id, {
                            gender: e.target.value as any,
                          })
                        }
                        className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-bold text-sm'
                      >
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase ml-1'>
                        Age
                      </label>
                      <input
                        type='number'
                        value={rec.age}
                        onChange={(e) =>
                          updateRecord(rec.id, {
                            age: parseInt(e.target.value) || 0,
                          })
                        }
                        className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-bold text-sm'
                      />
                    </div>
                  </div>
                  <div className='mt-6 flex flex-wrap gap-6 items-center'>
                    <button
                      onClick={() =>
                        updateRecord(rec.id, { isSaved: !rec.isSaved })
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${rec.isSaved ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-300'}`}
                    >
                      <UserCheck size={16} />
                      <span className='text-xs font-black uppercase tracking-wider'>
                        Saved
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        updateRecord(rec.id, { isFilled: !rec.isFilled })
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${rec.isFilled ? 'bg-gold/10 border-gold/20 text-[#CCA856]' : 'bg-white border-slate-200 text-slate-300'}`}
                    >
                      <Flame size={16} />
                      <span className='text-xs font-black uppercase tracking-wider'>
                        Filled
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        updateRecord(rec.id, { isHealed: !rec.isHealed })
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${rec.isHealed ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-300'}`}
                    >
                      <HeartPulse size={16} />
                      <span className='text-xs font-black uppercase tracking-wider'>
                        Healed
                      </span>
                    </button>
                  </div>
                  {rec.isHealed && (
                    <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2'>
                      <div className='space-y-1'>
                        <label className='text-[10px] font-black text-slate-400 uppercase ml-1'>
                          Condition Before
                        </label>
                        <input
                          type='text'
                          placeholder='e.g. Crippled, Deaf...'
                          value={rec.healedConditionBefore || ''}
                          onChange={(e) =>
                            updateRecord(rec.id, {
                              healedConditionBefore: e.target.value,
                            })
                          }
                          className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-medium text-sm'
                        />
                      </div>
                      <div className='space-y-1'>
                        <label className='text-[10px] font-black text-slate-400 uppercase ml-1'>
                          Condition After
                        </label>
                        <input
                          type='text'
                          placeholder='e.g. Walking, Hearing...'
                          value={rec.healedConditionAfter || ''}
                          onChange={(e) =>
                            updateRecord(rec.id, {
                              healedConditionAfter: e.target.value,
                            })
                          }
                          className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-medium text-sm'
                        />
                      </div>
                    </div>
                  )}
                  <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase ml-1'>
                        Phone
                      </label>
                      <input
                        type='tel'
                        value={rec.phone}
                        onChange={(e) =>
                          updateRecord(rec.id, { phone: e.target.value })
                        }
                        className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-bold text-sm'
                      />
                    </div>
                    <div className='md:col-span-2 space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase ml-1'>
                        Address
                      </label>
                      <input
                        type='text'
                        value={rec.address}
                        onChange={(e) =>
                          updateRecord(rec.id, { address: e.target.value })
                        }
                        className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-bold text-sm'
                      />
                    </div>
                  </div>
                  <div className='mt-4'>
                    <label className='text-[10px] font-black text-slate-400 uppercase ml-1'>
                      Testimony / Comments
                    </label>
                    <textarea
                      value={rec.comments}
                      onChange={(e) =>
                        updateRecord(rec.id, { comments: e.target.value })
                      }
                      className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-medium text-sm min-h-[80px]'
                      placeholder='Summary of the encounter...'
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
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

      {/* MODAL: VIEW/EDIT EVANGELISM SESSION DETAILS */}
      <Modal
        isOpen={!!viewingSession}
        onClose={() => {
          setViewingSession(null);
          setIsEditingSession(false);
        }}
        title='Evangelism Session Details'
        size='xl'
      >
        {viewingSession && (
          <div className='space-y-8 pb-10'>
            <div className='flex justify-between items-center px-6 py-4 bg-[#1A1C1E] text-white rounded shadow-lg'>
              <div>
                <h4 className='text-sm font-black uppercase tracking-[0.2em]'>
                  {viewingSession.location} Outreach
                </h4>
                <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1'>
                  {viewingSession.date} • {viewingSession.time}
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => setIsEditingSession(!isEditingSession)}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isEditingSession ? 'bg-red-500 text-white' : 'bg-white text-[#1A1C1E] hover:bg-slate-50'}`}
                >
                  {isEditingSession ? <X size={16} /> : <Edit2 size={16} />}
                  {isEditingSession ? 'Cancel Edit' : 'Edit Details'}
                </button>
                <button
                  onClick={() => exportToCSV(viewingSession)}
                  className='flex items-center gap-2 px-4 py-2 bg-[#CCA856] text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-[#b8954d] transition-all shadow-sm'
                >
                  <FileSpreadsheet size={16} /> Export CSV
                </button>
              </div>
            </div>

            <section className='bg-white p-6 rounded border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Session Date
                </label>
                <input
                  type='date'
                  value={viewingSession.date}
                  disabled={!isEditingSession}
                  onChange={(e) =>
                    setViewingSession({
                      ...viewingSession,
                      date: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2.5 rounded font-bold text-sm ${isEditingSession ? 'bg-[#F8F9FA] border border-slate-200 text-[#1A1C1E]' : 'bg-transparent border-transparent text-slate-400 opacity-60'}`}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Start Time
                </label>
                <input
                  type='time'
                  value={viewingSession.time}
                  disabled={!isEditingSession}
                  onChange={(e) =>
                    setViewingSession({
                      ...viewingSession,
                      time: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2.5 rounded font-bold text-sm ${isEditingSession ? 'bg-[#F8F9FA] border border-slate-200 text-[#1A1C1E]' : 'bg-transparent border-transparent text-slate-400 opacity-60'}`}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Location Area
                </label>
                <input
                  type='text'
                  value={viewingSession.location}
                  disabled={!isEditingSession}
                  onChange={(e) =>
                    setViewingSession({
                      ...viewingSession,
                      location: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2.5 rounded font-bold text-sm ${isEditingSession ? 'bg-[#F8F9FA] border border-slate-200 text-[#1A1C1E]' : 'bg-transparent border-transparent text-slate-400 opacity-60'}`}
                />
              </div>
              <div className='md:col-span-3 space-y-2 pt-4 border-t border-slate-100'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Participants
                </label>
                {isEditingSession ? (
                  <div className='space-y-3'>
                    <div className='relative group'>
                      <Search
                        className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                        size={14}
                      />
                      <input
                        type='text'
                        placeholder='Search workers...'
                        className='w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-xs'
                        value={participantSearch}
                        onChange={(e) => setParticipantSearch(e.target.value)}
                      />
                    </div>
                    <div className='flex flex-wrap gap-2 py-2'>
                      {viewingSession.participants.map((p) => (
                        <span
                          key={p}
                          className='flex items-center gap-1 px-2.5 py-1 bg-[#1A1C1E] text-white rounded text-[10px] font-black uppercase'
                        >
                          {p}
                          <button
                            onClick={() =>
                              setViewingSession({
                                ...viewingSession,
                                participants:
                                  viewingSession.participants.filter(
                                    (x) => x !== p
                                  ),
                              })
                            }
                            className='hover:text-[#CCA856]'
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[100px] overflow-y-auto custom-scrollbar p-3 bg-[#F8F9FA] border border-slate-200 rounded'>
                      {filteredMembersForSelection(participantSearch).map(
                        (member) => (
                          <label
                            key={member}
                            className='flex items-center gap-2 cursor-pointer group'
                          >
                            <input
                              type='checkbox'
                              checked={viewingSession.participants.includes(
                                member
                              )}
                              onChange={() => {
                                if (
                                  viewingSession.participants.includes(member)
                                )
                                  setViewingSession({
                                    ...viewingSession,
                                    participants:
                                      viewingSession.participants.filter(
                                        (x) => x !== member
                                      ),
                                  });
                                else
                                  setViewingSession({
                                    ...viewingSession,
                                    participants: [
                                      ...viewingSession.participants,
                                      member,
                                    ],
                                  });
                              }}
                              className='w-3.5 h-3.5 rounded border-slate-300 text-[#CCA856]'
                            />
                            <span className='text-[11px] font-bold text-slate-500 group-hover:text-[#1A1C1E] line-clamp-1'>
                              {member}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-wrap gap-2 py-2'>
                    {viewingSession.participants.map((p) => (
                      <span
                        key={p}
                        className='px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-black tracking-tight uppercase border border-slate-200'
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
                  Soul Winning Records
                </h4>
                {isEditingSession && (
                  <button
                    onClick={addViewingRecord}
                    className='flex items-center gap-2 px-4 py-2 bg-[#E74C3C] text-white rounded text-[10px] font-black uppercase shadow-sm hover:bg-red-600 transition-all'
                  >
                    <Plus size={14} /> Add Record
                  </button>
                )}
              </div>
              <div className='space-y-6'>
                {viewingSession.records.map((rec, i) => (
                  <div
                    key={rec.id}
                    className='p-6 bg-white rounded border border-slate-200 relative shadow-sm'
                  >
                    <div className='absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-200 rounded shadow-sm'>
                      <span className='text-[9px] font-black text-[#CCA856] uppercase tracking-[0.2em]'>
                        Record #{i + 1}
                      </span>
                    </div>
                    {isEditingSession && (
                      <button
                        onClick={() => removeViewingRecord(rec.id)}
                        className='absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 transition-colors'
                      >
                        <Trash2 size={18} />
                      </button>
                    )}

                    {isEditingSession ? (
                      <div className='space-y-6 pt-2'>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                          <div className='md:col-span-2 space-y-1'>
                            <label className='text-[9px] font-black text-slate-400 uppercase'>
                              Full Name
                            </label>
                            <input
                              type='text'
                              value={rec.personReached}
                              onChange={(e) =>
                                updateViewingRecord(rec.id, {
                                  personReached: e.target.value,
                                })
                              }
                              className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded font-bold text-sm'
                            />
                          </div>
                          <div className='space-y-1'>
                            <label className='text-[9px] font-black text-slate-400 uppercase'>
                              Gender
                            </label>
                            <select
                              value={rec.gender}
                              onChange={(e) =>
                                updateViewingRecord(rec.id, {
                                  gender: e.target.value as any,
                                })
                              }
                              className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded font-bold text-sm'
                            >
                              <option>Male</option>
                              <option>Female</option>
                            </select>
                          </div>
                          <div className='space-y-1'>
                            <label className='text-[9px] font-black text-slate-400 uppercase'>
                              Age
                            </label>
                            <input
                              type='number'
                              value={rec.age}
                              onChange={(e) =>
                                updateViewingRecord(rec.id, {
                                  age: parseInt(e.target.value) || 0,
                                })
                              }
                              className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded font-bold text-sm'
                            />
                          </div>
                        </div>
                        <div className='flex flex-wrap gap-4'>
                          <button
                            onClick={() =>
                              updateViewingRecord(rec.id, {
                                isSaved: !rec.isSaved,
                              })
                            }
                            className={`flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] font-black uppercase transition-all ${rec.isSaved ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-300'}`}
                          >
                            <UserCheck size={14} /> Saved
                          </button>
                          <button
                            onClick={() =>
                              updateViewingRecord(rec.id, {
                                isFilled: !rec.isFilled,
                              })
                            }
                            className={`flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] font-black uppercase transition-all ${rec.isFilled ? 'bg-gold/10 border-gold/20 text-[#CCA856]' : 'bg-white border-slate-200 text-slate-300'}`}
                          >
                            <Flame size={14} /> Filled
                          </button>
                          <button
                            onClick={() =>
                              updateViewingRecord(rec.id, {
                                isHealed: !rec.isHealed,
                              })
                            }
                            className={`flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] font-black uppercase transition-all ${rec.isHealed ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-300'}`}
                          >
                            <HeartPulse size={14} /> Healed
                          </button>
                        </div>
                        {rec.isHealed && (
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='space-y-1'>
                              <label className='text-[9px] font-black text-slate-400 uppercase'>
                                Condition Before
                              </label>
                              <input
                                type='text'
                                value={rec.healedConditionBefore || ''}
                                onChange={(e) =>
                                  updateViewingRecord(rec.id, {
                                    healedConditionBefore: e.target.value,
                                  })
                                }
                                className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded text-sm'
                              />
                            </div>
                            <div className='space-y-1'>
                              <label className='text-[9px] font-black text-slate-400 uppercase'>
                                Condition After
                              </label>
                              <input
                                type='text'
                                value={rec.healedConditionAfter || ''}
                                onChange={(e) =>
                                  updateViewingRecord(rec.id, {
                                    healedConditionAfter: e.target.value,
                                  })
                                }
                                className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded text-sm'
                              />
                            </div>
                          </div>
                        )}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                          <div className='space-y-1'>
                            <label className='text-[9px] font-black text-slate-400 uppercase'>
                              Phone
                            </label>
                            <input
                              type='tel'
                              value={rec.phone}
                              onChange={(e) =>
                                updateViewingRecord(rec.id, {
                                  phone: e.target.value,
                                })
                              }
                              className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded font-bold text-sm'
                            />
                          </div>
                          <div className='md:col-span-2 space-y-1'>
                            <label className='text-[9px] font-black text-slate-400 uppercase'>
                              Address
                            </label>
                            <input
                              type='text'
                              value={rec.address}
                              onChange={(e) =>
                                updateViewingRecord(rec.id, {
                                  address: e.target.value,
                                })
                              }
                              className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded font-bold text-sm'
                            />
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <label className='text-[9px] font-black text-slate-400 uppercase'>
                            Testimony / Comments
                          </label>
                          <textarea
                            value={rec.comments}
                            onChange={(e) =>
                              updateViewingRecord(rec.id, {
                                comments: e.target.value,
                              })
                            }
                            className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded text-sm min-h-[60px]'
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 pt-2'>
                          <div className='md:col-span-2'>
                            <p className='text-[10px] font-black text-slate-400 uppercase'>
                              Full Name
                            </p>
                            <p className='font-bold text-sm text-[#1A1C1E]'>
                              {rec.personReached}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] font-black text-slate-400 uppercase'>
                              Gender
                            </p>
                            <p className='font-bold text-sm text-[#1A1C1E]'>
                              {rec.gender}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] font-black text-slate-400 uppercase'>
                              Age
                            </p>
                            <p className='font-bold text-sm text-[#1A1C1E]'>
                              {rec.age}
                            </p>
                          </div>
                        </div>
                        <div className='mt-6 flex flex-wrap gap-4'>
                          {rec.isSaved && (
                            <span className='px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-black uppercase'>
                              Saved
                            </span>
                          )}
                          {rec.isFilled && (
                            <span className='px-3 py-1 bg-gold/10 text-[#CCA856] border border-gold/20 rounded text-[10px] font-black uppercase'>
                              Filled
                            </span>
                          )}
                          {rec.isHealed && (
                            <span className='px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded text-[10px] font-black uppercase'>
                              Healed
                            </span>
                          )}
                        </div>
                        {rec.isHealed && (
                          <div className='mt-4 p-4 bg-green-50/50 border border-green-100 rounded flex gap-8'>
                            <div>
                              <p className='text-[9px] font-black text-green-600 uppercase'>
                                Before
                              </p>
                              <p className='text-xs font-bold'>
                                {rec.healedConditionBefore}
                              </p>
                            </div>
                            <div>
                              <p className='text-[9px] font-black text-green-600 uppercase'>
                                After
                              </p>
                              <p className='text-xs font-bold'>
                                {rec.healedConditionAfter}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-50 pt-4'>
                          <div>
                            <p className='text-[10px] font-black text-slate-400 uppercase'>
                              Phone
                            </p>
                            <p className='text-sm font-bold text-slate-600'>
                              {rec.phone || 'N/A'}
                            </p>
                          </div>
                          <div className='md:col-span-2'>
                            <p className='text-[10px] font-black text-slate-400 uppercase'>
                              Address
                            </p>
                            <p className='text-sm font-bold text-slate-600'>
                              {rec.address || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className='mt-4 p-4 bg-[#F8F9FA] rounded border border-slate-100'>
                          <p className='text-[10px] font-black text-slate-400 uppercase mb-1'>
                            Testimony / Comments
                          </p>
                          <p className='text-xs font-medium text-slate-600 italic'>
                            "{rec.comments}"
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className='flex justify-end gap-3 pt-8 border-t border-slate-100'>
              {isEditingSession ? (
                <>
                  <button
                    onClick={() => setIsEditingSession(false)}
                    className='px-8 py-3 bg-slate-100 text-slate-600 rounded text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all'
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleUpdateViewingSession}
                    className='px-10 py-3 bg-[#CCA856] text-white rounded font-black shadow-lg uppercase tracking-widest text-xs hover:bg-[#b8954d] transition-all'
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setViewingSession(null)}
                  className='px-10 py-3 bg-[#1A1C1E] text-white rounded font-black shadow-lg uppercase tracking-widest text-xs'
                >
                  Close Details
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/**
 * FOLLOW UP MODULE
 */


export default EvangelismModule;
