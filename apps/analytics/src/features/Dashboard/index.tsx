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
const DashboardModule = () => {
  const [evStats, setEvStats] = useState<any>(null);
  const [fuStats, setFuStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllStats = async () => {
      try {
        setIsLoading(true);
        const [evData, fuData] = await Promise.all([
          evangelismAPI.getStats(),
          followUpAPI.getStats(),
        ]);
        setEvStats(evData);
        setFuStats(fuData);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load dashboard stats:', err);
        setError(err.message || 'Failed to load dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };
    loadAllStats();
  }, []);

  return (
    <div className='space-y-10 animate-in fade-in duration-1000'>
      {isLoading && (
        <div className='fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center'>
          <div className='flex flex-col items-center gap-4'>
            <div className='w-12 h-12 border-4 border-[#CCA856] border-t-transparent rounded-full animate-spin'></div>
            <p className='text-sm font-black text-[#1A1C1E] uppercase tracking-widest'>
              Crunching data...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-4 flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <AlertCircle className='text-red-500' size={20} />
            <p className='text-sm font-bold text-red-700'>{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className='text-red-500 hover:text-red-700'
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-8'>
        <div>
          <h2 className='text-2xl font-black text-[#1A1C1E] tracking-tighter'>
            Executive Dashboard
          </h2>
          <p className='text-slate-500 text-sm mt-1'>
            Growth overview & spiritual impact.
          </p>
        </div>
        <div className='flex gap-4'>
          <button className='flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded text-xs font-black text-[#1A1C1E] shadow-sm uppercase tracking-widest hover:bg-slate-50 transition-all'>
            <Calendar size={18} className='text-[#CCA856]' /> Last 30 Days
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Total Salvations'
          value={(evStats?.total_saved || 0).toLocaleString()}
          icon={<UserCheck size={20} />}
          trend='+15%'
        />
        <StatCard
          title='Total Holy Ghost Filled'
          value={(evStats?.total_filled || 0).toLocaleString()}
          icon={<Flame size={20} />}
          variant='gold'
        />
        <StatCard
          title='Total Members Taught'
          value={(fuStats?.total_members_taught || 0).toLocaleString()}
          icon={<Users size={20} />}
          trend='+28%'
        />
        <StatCard
          title='Total Reach'
          value={(
            (evStats?.total_souls || 0) + (fuStats?.total_members_taught || 0)
          ).toLocaleString()}
          icon={<HeartPulse size={20} />}
          trend='+12%'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2 bg-white p-8 rounded border border-slate-200 shadow-sm'>
          <div className='flex justify-between items-center mb-10'>
            <div>
              <h3 className='text-lg font-black text-[#1A1C1E] tracking-tight uppercase'>
                Impact Trajectory
              </h3>
            </div>
          </div>
          <div className='h-[350px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={[
                  { name: 'Jan', value: 0, value2: 0 },
                  { name: 'Feb', value: 0, value2: 0 },
                  { name: 'Mar', value: 0, value2: 0 },
                  { name: 'Apr', value: evStats?.total_saved || 0, value2: 0 },
                  {
                    name: 'May',
                    value: (evStats?.total_saved || 0) * 1.2,
                    value2: 0,
                  },
                ]}
              >
                <defs>
                  <linearGradient id='colorValue' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor={COLORS.gold}
                      stopOpacity={0.15}
                    />
                    <stop
                      offset='95%'
                      stopColor={COLORS.gold}
                      stopOpacity={0}
                    />
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
                  dataKey='value'
                  stroke={COLORS.gold}
                  fillOpacity={1}
                  fill='url(#colorValue)'
                  strokeWidth={3}
                />
                <Area
                  type='monotone'
                  dataKey='value2'
                  stroke='#CBD5E1'
                  fillOpacity={0}
                  strokeWidth={2}
                  strokeDasharray='4 4'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className='bg-white p-8 rounded border border-slate-200 shadow-sm'>
          <div className='flex justify-between items-center mb-8'>
            <h3 className='text-lg font-black text-[#1A1C1E] tracking-tight uppercase'>
              Top Workers
            </h3>
          </div>
          <div className='space-y-5'>
            {[
              {
                name: 'John Doe',
                role: 'Pastor',
                score: '98 pts',
                avatar: 'JD',
              },
              {
                name: 'Sarah Smith',
                role: 'Youth Leader',
                score: '92 pts',
                avatar: 'SS',
              },
              {
                name: 'Gbenga Adeniji',
                role: 'Worker',
                score: '85 pts',
                avatar: 'GA',
              },
            ].map((worker, i) => (
              <div
                key={i}
                className='flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-all'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded bg-slate-100 flex items-center justify-center font-black text-xs border border-slate-200 shadow-sm'>
                    {worker.avatar}
                  </div>
                  <div>
                    <p className='text-sm font-black text-[#1A1C1E]'>
                      {worker.name}
                    </p>
                    <p className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>
                      {worker.role}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-xs font-black text-[#CCA856]'>
                    {worker.score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardModule;
