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
const AnalyticsModule = () => {
  const [activeTab, setActiveTab] = useState<'Analytics' | 'Reports'>(
    'Analytics'
  );

  // Date Filter State for Analytics Header
  const [startDate, setStartDate] = useState<Date | null>(new Date(2024, 0, 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // New Report BI Modal State
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState<any>({
    dimension: 'Fellowship',
    dimensionValue: 'Oke-afa Fellowship',
    measures: ['Study Group (NUM)'],
    aggregation: 'Sum',
    dateStart: new Date(2024, 10, 13),
    dateEnd: new Date(2025, 10, 13),
    visualization: 'Line Chart',
  });

  // Reports Dynamic Columns State
  const [reportColumns, setReportColumns] = useState<string[]>([
    'Church',
    'Fellowship',
    'Cell',
    'Name',
    'Role',
  ]);
  const [isColPickerOpen, setIsColPickerOpen] = useState(false);

  // Advanced Filtering State for Reports
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    churches: [],
    fellowships: [],
    cells: [],
    name: '',
    roles: [],
    dateJoinedStart: null,
    dateJoinedEnd: null,
    address: '',
    email: '',
    phone: '',
    showDatePicker: false,
    evangelismMin: '',
    followUpMin: '',
    sundayMin: '',
    midweekMin: '',
    charisMin: '',
    believersMin: '',
    worldMin: '',
    workersMin: '',
    membersMin: '',
    prayerMin: '',
    studyMin: '',
  });

  // Drilldown State
  const [drilldownEntity, setDrilldownEntity] = useState<{
    type: 'church' | 'fellowship' | 'cell';
    name: string;
  } | null>(null);
  const [drilldownColumns, setDrilldownColumns] = useState<string[]>([]);
  const [isDrillColPickerOpen, setIsDrillColPickerOpen] = useState(false);

  // Profile Modal State
  const [profileIndividual, setProfileIndividual] = useState<string | null>(
    null
  );

  const ALL_POSSIBLE_COLUMNS = [
    'Church',
    'Fellowship',
    'Cell',
    'Name',
    'Role',
    'Date Joined Church',
    'Address',
    'Email',
    'Phone Number',
    'Evangelism (NUM)',
    'Follow Up (NUM)',
    'Sunday Service (NUM)',
    'Midweek Service (NUM)',
    'Charis Campmeeting (NUM)',
    "Believers' Convention (NUM)",
    "World Changers' Conference (NUM)",
    "Workers' Convention (NUM)",
    'Members List (NUM)',
    'Prayer Group (NUM)',
    'Study Group (NUM)',
  ];

  const DIMENSION_OPTIONS = [
    'Church',
    'Fellowship',
    'Cell',
    'Role',
    'Prayer Day',
    'Department',
  ];
  const MEASURE_OPTIONS = [
    'Sunday Service (NUM)',
    'Midweek Service (NUM)',
    'Charis Campmeeting (NUM)',
    "Believers' Convention (NUM)",
    "World Changers' Conference (NUM)",
    "Workers' Convention (NUM)",
    'Evangelism: Saved',
    'Evangelism: Filled',
    'Evangelism: Healed',
    'Follow Up Sessions',
    'Study Group (NUM)',
    'Prayer Group (NUM)',
  ];
  const AGG_OPTIONS = ['Sum', 'Average', 'Count', 'Median', 'Min', 'Max'];
  const VIZ_OPTIONS = [
    { label: 'Bar Chart', icon: <BarChartIcon size={20} /> },
    { label: 'Line Chart', icon: <TrendingUp size={20} /> },
    { label: 'Pie Chart', icon: <PieChartIcon size={20} /> },
    { label: 'Area Chart', icon: <Layers size={20} /> },
    { label: 'Scatter Plot', icon: <MousePointer2 size={20} /> },
  ];

  // Data States
  const [analyticsData, setAnalyticsData] = useState({
    attendanceStats: {
      sunday_service: { value: 0, firstTimers: 0, growth: 0 },
      midweek_service: { value: 0, firstTimers: 0, growth: 0 },
      fellowship_meetings: { value: 0, firstTimers: 0, growth: 0 },
      cell_meetings: { value: 0, firstTimers: 0, growth: 0 },
      charis_campmeeting: { value: 0, firstTimers: 0, growth: 0 },
      believers_convention: { value: 0, firstTimers: 0, growth: 0 },
      world_changers: { value: 0, firstTimers: 0, growth: 0 },
      total_first_timers: 0,
    },
    evangelismStats: { total: 0, growth: 0, saved: 0 },
    followUpStats: { total: 0, growth: 0 },
    studyGroupStats: { total: 0, growth: 0 },
    prayerGroupStats: { total: 0, growth: 0 },
    attendanceTrend: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [
          attStats,
          evanStats,
          followStats,
          studyStats,
          prayerStats,
          attHistory,
        ] = await Promise.all([
          attendanceAPI.getStats(),
          evangelismAPI.getStats(),
          followUpAPI.getStats(),
          studyGroupAPI.getStats(),
          prayerGroupAPI.getStats(),
          attendanceAPI.getHistory(),
        ]);

        setAnalyticsData({
          attendanceStats: attStats,
          evangelismStats: evanStats,
          followUpStats: followStats,
          studyGroupStats: studyStats,
          prayerGroupStats: prayerStats,
          attendanceTrend: attHistory,
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleEntityClick = (
    type: 'church' | 'fellowship' | 'cell',
    name: string
  ) => {
    let initialCols: string[] = [];
    if (type === 'church') {
      initialCols = [
        'Name',
        'Role',
        'Fellowship',
        'Cell',
        'Church',
        'Date Joined Church',
      ];
    } else {
      initialCols = ['Name', 'Role', 'Date Joined Church'];
    }
    setDrilldownColumns(initialCols);
    setDrilldownEntity({ type, name });
  };

  const toggleSelect = (
    val: string,
    set: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    set((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const statCards = [
    {
      title: 'Sunday Service',
      value:
        (
          analyticsData.attendanceStats as any
        ).sunday_service?.value?.toString() || '0',
      firstTimers:
        (
          analyticsData.attendanceStats as any
        ).sunday_service?.firstTimers?.toString() || '0',
      icon: <Music className='text-[#CCA856]' size={16} />,
      trend: `+ ${(analyticsData.attendanceStats as any).sunday_service?.growth || 0}% `,
    },
    {
      title: 'Midweek Service',
      value:
        (
          analyticsData.attendanceStats as any
        ).midweek_service?.value?.toString() || '0',
      firstTimers:
        (
          analyticsData.attendanceStats as any
        ).midweek_service?.firstTimers?.toString() || '0',
      icon: <BookOpen className='text-[#CCA856]' size={16} />,
      trend: `+ ${(analyticsData.attendanceStats as any).midweek_service?.growth || 0}% `,
    },
    {
      title: 'Fellowship Meetings',
      value:
        (
          analyticsData.attendanceStats as any
        ).fellowship_meetings?.value?.toString() || '0',
      firstTimers:
        (
          analyticsData.attendanceStats as any
        ).fellowship_meetings?.firstTimers?.toString() || '0',
      icon: <Users className='text-[#CCA856]' size={16} />,
      trend: `+ ${(analyticsData.attendanceStats as any).fellowship_meetings?.growth || 0}% `,
    },
    {
      title: 'Cell Group',
      value:
        (
          analyticsData.attendanceStats as any
        ).cell_meetings?.value?.toString() || '0',
      firstTimers:
        (
          analyticsData.attendanceStats as any
        ).cell_meetings?.firstTimers?.toString() || '0',
      icon: <Home className='text-[#CCA856]' size={16} />,
      trend: `+ ${(analyticsData.attendanceStats as any).cell_meetings?.growth || 0}% `,
    },
    {
      title: 'Charis Campmeeting',
      value:
        (
          analyticsData.attendanceStats as any
        ).charis_campmeeting?.value?.toString() || '0',
      icon: <Flame className='text-[#CCA856]' size={16} />,
      trend: `+ ${(analyticsData.attendanceStats as any).charis_campmeeting?.growth || 0}% `,
    },
    {
      title: 'Believers Convention',
      value:
        (
          analyticsData.attendanceStats as any
        ).believers_convention?.value?.toString() || '0',
      icon: <Sparkles className='text-[#CCA856]' size={16} />,
      trend: `+ ${(analyticsData.attendanceStats as any).believers_convention?.growth || 0}% `,
    },
    {
      title: 'World Changers',
      value:
        (
          analyticsData.attendanceStats as any
        ).world_changers?.value?.toString() || '0',
      icon: <TrendingUp className='text-[#CCA856]' size={16} />,
      trend: `+ ${(analyticsData.attendanceStats as any).world_changers?.growth || 0}% `,
    },
    {
      title: 'Total First Timers',
      value:
        (analyticsData.attendanceStats as any).total_first_timers?.toString() ||
        '0',
      icon: <CheckCircle2 className='text-green-600' size={16} />,
      trend: '',
      variant: 'green' as const, // Use 'const' assertion to match literal type
    },
  ];

  const specialMeetings = [
    { name: 'Charis Campmeeting', value: '1,200' },
    { name: "Believers' Convention", value: '950' },
    { name: "World Changers' Conference", value: '1,100' },
    { name: "Workers' Convention", value: '800' },
  ];

  const getCellValue = (person: string, col: string) => {
    if (col === 'Name') return person;
    if (col === 'Church') return 'Main Parish';
    if (col === 'Fellowship')
      return getMemberGroup(person).includes('Fellowship')
        ? getMemberGroup(person)
        : 'Grace Fellowship';
    if (col === 'Cell')
      return getMemberGroup(person).includes('Cell')
        ? getMemberGroup(person)
        : 'Aswan Cell';
    const role = WORKERS_LIST.includes(person)
      ? person.includes('Pastor')
        ? 'Church Pastor'
        : 'Worker'
      : 'Member';
    if (col === 'Role') return role;
    if (col === 'Date Joined Church') return '2022-04-12';
    if (col === 'Address') return '123 Heaven Gate Ave.';
    if (col === 'Email')
      return `${person.toLowerCase().replace(/\s/g, '.')} @saints.com`;
    if (col === 'Phone Number') return '0800-SAINTS-1';

    const metrics: Record<string, number> = {
      'Evangelism (NUM)': 12,
      'Follow Up (NUM)': 4,
      'Sunday Service (NUM)': 45,
      'Midweek Service (NUM)': 22,
      'Charis Campmeeting (NUM)': 1,
      "Believers' Convention (NUM)": 1,
      "World Changers' Conference (NUM)": 0,
      "Workers' Convention (NUM)": 1,
      'Members List (NUM)': role === 'Member' ? 0 : 5,
      'Prayer Group (NUM)': 4,
      'Study Group (NUM)': 4,
    };

    if (col.includes('(NUM)')) return (metrics[col] ?? 0).toString();
    return '-';
  };

  const filteredDirectory = useMemo(() => {
    return [...WORKERS_LIST, ...MEMBERS_LIST].filter((person) => {
      const church = getCellValue(person, 'Church');
      const fellowship = getCellValue(person, 'Fellowship');
      const cell = getCellValue(person, 'Cell');
      const role = getCellValue(person, 'Role');
      const dateJoinedStr = getCellValue(person, 'Date Joined Church');

      if (
        filterValues.churches.length > 0 &&
        !filterValues.churches.includes(church)
      )
        return false;
      if (
        filterValues.fellowships.length > 0 &&
        !filterValues.fellowships.includes(fellowship)
      )
        return false;
      if (filterValues.cells.length > 0 && !filterValues.cells.includes(cell))
        return false;
      if (filterValues.roles.length > 0 && !filterValues.roles.includes(role))
        return false;
      if (
        filterValues.name &&
        !person.toLowerCase().includes(filterValues.name.toLowerCase())
      )
        return false;
      if (
        filterValues.email &&
        !getCellValue(person, 'Email')
          .toLowerCase()
          .includes(filterValues.email.toLowerCase())
      )
        return false;
      if (
        filterValues.phone &&
        !getCellValue(person, 'Phone Number').includes(filterValues.phone)
      )
        return false;
      if (
        filterValues.address &&
        !getCellValue(person, 'Address')
          .toLowerCase()
          .includes(filterValues.address.toLowerCase())
      )
        return false;

      if (filterValues.dateJoinedStart || filterValues.dateJoinedEnd) {
        const joinedDate = new Date(dateJoinedStr);
        if (
          filterValues.dateJoinedStart &&
          joinedDate < filterValues.dateJoinedStart
        )
          return false;
        if (
          filterValues.dateJoinedEnd &&
          joinedDate > filterValues.dateJoinedEnd
        )
          return false;
      }

      const checkNum = (field: string, val: string) => {
        if (!val) return true;
        const currentVal = parseInt(getCellValue(person, field));
        return currentVal >= parseInt(val);
      };

      if (!checkNum('Evangelism (NUM)', filterValues.evangelismMin))
        return false;
      if (!checkNum('Follow Up (NUM)', filterValues.followUpMin)) return false;
      if (!checkNum('Sunday Service (NUM)', filterValues.sundayMin))
        return false;
      if (!checkNum('Midweek Service (NUM)', filterValues.midweekMin))
        return false;
      if (!checkNum('Charis Campmeeting (NUM)', filterValues.charisMin))
        return false;
      if (!checkNum("Believers' Convention (NUM)", filterValues.believersMin))
        return false;
      if (!checkNum("World Changers' Conference (NUM)", filterValues.worldMin))
        return false;
      if (!checkNum("Workers' Convention (NUM)", filterValues.workersMin))
        return false;
      if (!checkNum('Members List (NUM)', filterValues.membersMin))
        return false;
      if (!checkNum('Prayer Group (NUM)', filterValues.prayerMin)) return false;
      if (!checkNum('Study Group (NUM)', filterValues.studyMin)) return false;

      return true;
    });
  }, [filterValues]);

  const updateFilter = (key: string, val: any) => {
    setFilterValues((prev) => ({ ...prev, [key]: val }));
  };

  const updateReportConfig = (key: string, val: any) => {
    setReportConfig((prev: any) => ({ ...prev, [key]: val }));
  };

  const toggleMeasure = (measure: string) => {
    setReportConfig((prev: any) => {
      const exists = prev.measures.includes(measure);
      return {
        ...prev,
        measures: exists
          ? prev.measures.filter((m: string) => m !== measure)
          : [...prev.measures, measure],
      };
    });
  };

  return (
    <div className='space-y-10 animate-in fade-in duration-500'>
      <div className='flex border-b border-slate-200'>
        {(['Analytics', 'Reports'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-[#1A1C1E]' : 'text-slate-400 hover:text-slate-600'} `}
          >
            {tab}
            {activeTab === tab && (
              <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-[#CCA856] animate-in slide-in-from-left duration-300'></div>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Analytics' && (
        <div className='space-y-12 pb-20'>
          <div className='flex flex-col gap-2'>
            <h2 className='text-2xl font-black text-[#1A1C1E] tracking-tighter'>
              Analytics Overview
            </h2>
            <div className='flex items-center gap-4 text-sm text-slate-500'>
              <span className='flex items-center gap-1.5 font-medium'>
                <Calendar size={14} /> Quarter 1, 2024
              </span>
              <span className='w-1 h-1 rounded-full bg-slate-300'></span>
              <button
                onClick={() => setIsDateModalOpen(true)}
                className='flex items-center gap-1.5 text-[#CCA856] hover:text-[#B89648] font-black uppercase tracking-wider text-[10px] transition-colors'
              >
                {startDate?.toLocaleDateString()} -{' '}
                {endDate?.toLocaleDateString()} <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div className='grid grid-cols-4 gap-6'>
            {statCards.map((card, idx) => {
              const cardType = (card as any).type;
              return (
                <div
                  key={idx}
                  className={`${cardType === 'breakdown' ? 'col-span-2' : ''} bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group h-full`}
                >
                  {cardType === 'breakdown' ? (
                    <div className='flex h-full items-center justify-between gap-6'>
                      <div>
                        <div className='flex items-center gap-3 mb-4'>
                          <div className='p-2 rounded bg-slate-50 text-slate-400 group-hover:text-[#CCA856] group-hover:bg-[#CCA856]/10 transition-colors'>
                            {card.icon}
                          </div>
                          <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                            {card.title}
                          </span>
                        </div>
                        <div className='flex gap-8'>
                          {/* @ts-ignore */}
                          {card.data.map((item: any, i: number) => (
                            <div key={i}>
                              <div className='flex items-center gap-2 mb-1'>
                                {item.icon}
                                <span className='text-xs font-semibold text-slate-600'>
                                  {item.label}
                                </span>
                              </div>
                              <span className='text-xl font-black text-[#1A1C1E]'>
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className='flex justify-between items-start mb-4'>
                        <div className='p-2 rounded bg-slate-50 text-slate-400 group-hover:text-[#CCA856] group-hover:bg-[#CCA856]/10 transition-colors'>
                          {card.icon}
                        </div>
                        <div
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${card.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} `}
                        >
                          {card.trend}
                        </div>
                      </div>
                      <div>
                        <span className='text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1'>
                          {card.title}
                        </span>
                        <div className='flex items-baseline gap-2'>
                          <h3 className='text-2xl font-black text-[#1A1C1E]'>
                            {card.value}
                          </h3>
                          <span className='text-[10px] text-slate-400 font-medium'>
                            {/* @ts-ignore */}
                            {card.firstTimers > 0 && (
                              <span className='text-[#CCA856] font-bold'>
                                {card.firstTimers} FT
                              </span>
                            )}
                            {/* @ts-ignore */}
                            {card.sub && <span>{card.sub}</span>}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className='grid grid-cols-3 gap-6'>
            <div className='col-span-2 bg-white rounded-xl p-6 border border-slate-100 shadow-sm'>
              <div className='flex justify-between items-center mb-6'>
                <div>
                  <h3 className='font-bold text-[#1A1C1E]'>
                    Weekly Attendance Trend
                  </h3>
                  <p className='text-xs text-slate-400 mt-1'>
                    Compararison showing +12% growth
                  </p>
                </div>
                <div className='flex gap-2'>
                  <div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500'>
                    <span className='w-2 h-2 rounded-full bg-[#1A1C1E]'></span>{' '}
                    Sunday
                  </div>
                  <div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500'>
                    <span className='w-2 h-2 rounded-full bg-[#CCA856]'></span>{' '}
                    Midweek
                  </div>
                </div>
              </div>
              <div className='h-[300px]'>
                {loading ? (
                  <div className='h-full flex items-center justify-center text-slate-400 text-xs'>
                    Loading chart data...
                  </div>
                ) : (
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart
                      data={
                        analyticsData.attendanceTrend.length > 0
                          ? analyticsData.attendanceTrend
                          : attendanceTrend
                      }
                    >
                      <defs>
                        <linearGradient
                          id='colorSunday'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor='#1A1C1E'
                            stopOpacity={0.1}
                          />
                          <stop
                            offset='95%'
                            stopColor='#1A1C1E'
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id='colorMidweek'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor='#CCA856'
                            stopOpacity={0.1}
                          />
                          <stop
                            offset='95%'
                            stopColor='#CCA856'
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray='3 3'
                        vertical={false}
                        stroke='#f1f5f9'
                      />
                      <XAxis
                        dataKey='name'
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                      />
                      <Area
                        type='monotone'
                        dataKey='value'
                        stroke='#1A1C1E'
                        strokeWidth={2}
                        fillOpacity={1}
                        fill='url(#colorSunday)'
                      />
                      <Area
                        type='monotone'
                        dataKey='value2'
                        stroke='#CCA856'
                        strokeWidth={2}
                        fillOpacity={1}
                        fill='url(#colorMidweek)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className='bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex flex-col'>
              <h3 className='font-bold text-[#1A1C1E] mb-6'>
                Retention Funnel
              </h3>
              <div className='flex-1 flex flex-col justify-center gap-6'>
                {/* Mock Funnel Mockup since Recharts Funnel is complex */}
                {[
                  {
                    label: 'First Timers',
                    val: '100%',
                    count: '145',
                    color: 'bg-slate-100',
                    text: 'text-slate-600',
                  },
                  {
                    label: 'New Converts',
                    val: '65%',
                    count: '94',
                    color: 'bg-slate-200',
                    text: 'text-slate-700',
                  },
                  {
                    label: 'Baptized',
                    val: '45%',
                    count: '65',
                    color: 'bg-[#CCA856]/20',
                    text: 'text-[#CCA856]',
                  },
                  {
                    label: 'Workers Training',
                    val: '25%',
                    count: '36',
                    color: 'bg-[#CCA856]/60',
                    text: 'text-white',
                  },
                  {
                    label: 'Active Workers',
                    val: '15%',
                    count: '22',
                    color: 'bg-[#1A1C1E]',
                    text: 'text-white',
                  },
                ].map((step, i) => (
                  <div key={i} className='relative group cursor-default'>
                    <div className='flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1'>
                      <span>{step.label}</span>
                      <span>{step.count}</span>
                    </div>
                    <div className='h-2 w-full bg-slate-50 rounded-full overflow-hidden'>
                      <div
                        className={`h-full ${step.color} rounded-full transition-all duration-500`}
                        style={{ width: step.val }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Reports' && (
        <div className='space-y-10 pb-20 animate-in slide-in-from-bottom-2 duration-500'>
          <div className='flex justify-between items-end'>
            <div>
              <h2 className='text-2xl font-black text-[#1A1C1E] tracking-tighter'>
                Custom Reports
              </h2>
              <p className='text-slate-500 text-sm mt-1'>
                Generate dynamic reports across all dimensions.
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${showAdvancedFilters ? 'bg-[#1A1C1E] text-white border-[#1A1C1E]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'} `}
              >
                <Filter size={14} /> Filter
              </button>
              <button
                onClick={() => setIsColPickerOpen(true)}
                className='flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors'
              >
                <LayoutDashboard size={14} /> Columns
              </button>
              <button className='flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors'>
                <Download size={14} /> Export
              </button>
              <button
                onClick={() => setIsNewReportModalOpen(true)}
                className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1A1C1E] text-white text-xs font-bold hover:bg-[#2D3E50] transition-colors shadow-lg hover:shadow-xl'
              >
                <Plus size={16} /> New BI Report
              </button>
            </div>
          </div>

          {showAdvancedFilters && (
            <div className='bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='font-bold text-[#1A1C1E]'>Advanced Filters</h3>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className='text-slate-400 hover:text-slate-600'
                >
                  <X size={16} />
                </button>
              </div>
              <div className='grid grid-cols-4 gap-4'>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Church
                  </label>
                  <select
                    className='w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#CCA856]'
                    onChange={(e) =>
                      updateFilter(
                        'churches',
                        e.target.value ? [e.target.value] : []
                      )
                    }
                  >
                    <option value=''>All Churches</option>
                    <option value='Main Parish'>Main Parish</option>
                  </select>
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Fellowship
                  </label>
                  <select
                    className='w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#CCA856]'
                    onChange={(e) =>
                      updateFilter(
                        'fellowships',
                        e.target.value ? [e.target.value] : []
                      )
                    }
                  >
                    <option value=''>All Fellowships</option>
                    {FELLOWSHIPS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Cell
                  </label>
                  <select
                    className='w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#CCA856]'
                    onChange={(e) =>
                      updateFilter(
                        'cells',
                        e.target.value ? [e.target.value] : []
                      )
                    }
                  >
                    <option value=''>All Cells</option>
                    {CELLS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Role
                  </label>
                  <select
                    className='w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#CCA856]'
                    onChange={(e) =>
                      updateFilter(
                        'roles',
                        e.target.value ? [e.target.value] : []
                      )
                    }
                  >
                    <option value=''>All Roles</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Name Search
                  </label>
                  <div className='relative'>
                    <Search
                      className='absolute left-3 top-3 text-slate-400'
                      size={14}
                    />
                    <input
                      type='text'
                      placeholder='Search member name...'
                      className='w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#CCA856]'
                      onChange={(e) => updateFilter('name', e.target.value)}
                    />
                  </div>
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Min. Evangelism (Last 30d)
                  </label>
                  <input
                    type='number'
                    className='w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#CCA856]'
                    onChange={(e) =>
                      updateFilter('evangelismMin', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className='bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-slate-50 border-b border-slate-200'>
                  <tr>
                    <th className='px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#CCA856] w-[60px]'>
                      #
                    </th>
                    {reportColumns.map((col) => (
                      <th
                        key={col}
                        className='px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap'
                      >
                        {col}
                      </th>
                    ))}
                    <th className='px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {filteredDirectory.map((person, idx) => (
                    <tr
                      key={idx}
                      className='hover:bg-slate-50/80 transition-colors group cursor-pointer'
                      onClick={() => setProfileIndividual(person)}
                    >
                      <td className='px-6 py-4 text-xs font-medium text-slate-400'>
                        {idx + 1}
                      </td>
                      {reportColumns.map((col) => (
                        <td
                          key={col}
                          className='px-6 py-4 text-xs text-slate-600 font-medium whitespace-nowrap'
                        >
                          {col === 'Name' ? (
                            <div className='flex items-center gap-3'>
                              <div className='w-8 h-8 rounded-full bg-[#1A1C1E] flex items-center justify-center text-white text-[10px] font-black'>
                                {getCellValue(person, 'Name')
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')}
                              </div>
                              <div>
                                <span className='font-bold text-[#1A1C1E] block'>
                                  {getCellValue(person, 'Name')}
                                </span>
                                <span className='text-[10px] text-slate-400'>
                                  {getCellValue(person, 'Email')}
                                </span>
                              </div>
                            </div>
                          ) : col === 'Role' ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCellValue(person, 'Role').includes('Pastor') ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-100 text-slate-500 border-slate-200'} `}
                            >
                              {getCellValue(person, 'Role')}
                            </span>
                          ) : (
                            getCellValue(person, col)
                          )}
                        </td>
                      ))}
                      <td className='px-6 py-4 text-right'>
                        <button className='p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-[#1A1C1E] transition-colors'>
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDirectory.length === 0 && (
                <div className='p-12 text-center text-slate-400'>
                  <Search size={32} className='mx-auto mb-3 opacity-20' />
                  <p className='text-sm font-medium'>
                    No results found matching your filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        title='Select Date Period'
        size='lg'
      >
        <div className='flex gap-8 p-1'>
          <DatePickerCalendar
            date={startDate}
            onSelect={setStartDate}
            label='Start Date'
          />
          <DatePickerCalendar
            date={endDate}
            onSelect={setEndDate}
            label='End Date'
          />
          <div className='border-l border-slate-100 pl-8 w-64'>
            <h4 className='font-bold text-[#1A1C1E] mb-4'>Quick Ranges</h4>
            <div className='space-y-2'>
              <button className='w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#CCA856] transition-colors'>
                This Week
              </button>
              <button className='w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#CCA856] transition-colors'>
                Last Week
              </button>
              <button className='w-full text-left px-4 py-3 rounded-lg text-sm font-bold bg-[#1A1C1E] text-white'>
                This Month
              </button>
              <button className='w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#CCA856] transition-colors'>
                Last Quarter
              </button>
              <button className='w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#CCA856] transition-colors'>
                Year to Date (YTD)
              </button>
            </div>
            <button
              onClick={() => setIsDateModalOpen(false)}
              className='w-full mt-8 bg-[#CCA856] text-white font-bold py-3 rounded-xl hover:bg-[#B89648] transition-colors shadow-lg shadow-[#CCA856]/20'
            >
              Apply Range
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isColPickerOpen}
        onClose={() => setIsColPickerOpen(false)}
        title='Customize Columns'
        size='md'
      >
        <div className='space-y-4'>
          <p className='text-sm text-slate-500'>
            Select columns to display in the report.
          </p>
          <div className='grid grid-cols-2 gap-3'>
            {ALL_POSSIBLE_COLUMNS.map((col) => (
              <label
                key={col}
                className='flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors'
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${reportColumns.includes(col) ? 'bg-[#1A1C1E] border-[#1A1C1E]' : 'border-slate-300'} `}
                >
                  {reportColumns.includes(col) && (
                    <Check size={12} className='text-white' />
                  )}
                </div>
                <input
                  type='checkbox'
                  className='hidden'
                  checked={reportColumns.includes(col)}
                  onChange={() => toggleSelect(col, setReportColumns)}
                />
                <span
                  className={`text-xs font-bold ${reportColumns.includes(col) ? 'text-[#1A1C1E]' : 'text-slate-500'} `}
                >
                  {col}
                </span>
              </label>
            ))}
          </div>
          <div className='pt-4 flex justify-end'>
            <button
              onClick={() => setIsColPickerOpen(false)}
              className='bg-[#1A1C1E] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2D3E50] transition-colors'
            >
              Save Columns
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        title='Create New Analysis Report'
        size='lg'
      >
        <div className='space-y-8'>
          <div className='grid grid-cols-2 gap-8'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                Primary Dimension
              </label>
              <div className='grid grid-cols-2 gap-2'>
                {DIMENSION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateReportConfig('dimension', opt)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-all ${reportConfig.dimension === opt ? 'bg-[#1A1C1E] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'} `}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                  Measure (Y-Axis)
                </label>
                <div className='h-40 overflow-y-auto custom-scrollbar border border-slate-100 rounded-lg p-2 space-y-1'>
                  {MEASURE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleMeasure(opt)}
                      className={`w-full flex justify-between items-center px-3 py-2 rounded text-xs font-medium transition-all ${reportConfig.measures.includes(opt) ? 'bg-[#CCA856]/10 text-[#CCA856]' : 'text-slate-500 hover:bg-slate-50'} `}
                    >
                      {opt}
                      {reportConfig.measures.includes(opt) && (
                        <Check size={12} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                  Aggregation
                </label>
                <div className='flex bg-slate-50 p-1 rounded-lg'>
                  {AGG_OPTIONS.slice(0, 3).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateReportConfig('aggregation', opt)}
                      className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all ${reportConfig.aggregation === opt ? 'bg-white shadow-sm text-[#1A1C1E]' : 'text-slate-400'} `}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className='space-y-2'>
            <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
              Visualization Type
            </label>
            <div className='flex gap-4'>
              {VIZ_OPTIONS.map((viz) => (
                <button
                  key={viz.label}
                  onClick={() => updateReportConfig('visualization', viz.label)}
                  className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${reportConfig.visualization === viz.label ? 'border-[#CCA856] bg-[#CCA856]/5 text-[#CCA856]' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'} `}
                >
                  {viz.icon}
                  <span className='text-[10px] font-bold uppercase tracking-wider'>
                    {viz.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className='pt-4 border-t border-slate-100 flex justify-end gap-3'>
            <button
              onClick={() => setIsNewReportModalOpen(false)}
              className='px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50'
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setActiveTab('Reports');
                setIsNewReportModalOpen(false);
              }}
              className='px-6 py-3 rounded-xl bg-[#1A1C1E] text-white text-xs font-bold hover:bg-[#2D3E50] shadow-lg'
            >
              Generate Report
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={!!drilldownEntity}
        onClose={() => setDrilldownEntity(null)}
        title={
          drilldownEntity
            ? `${drilldownEntity.name} - Detailed Analysis`
            : 'Details'
        }
        size='xl'
      >
        <div className='space-y-8'>
          <div className='flex gap-4'>
            <div className='w-1/3 space-y-4'>
              <div className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
                <h4 className='font-bold text-[#1A1C1E] text-sm mb-4'>
                  Performance Metrics
                </h4>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center text-xs'>
                    <span className='text-slate-500'>Avg. Attendance</span>
                    <span className='font-black text-[#1A1C1E]'>124</span>
                  </div>
                  <div className='flex justify-between items-center text-xs'>
                    <span className='text-slate-500'>Growth Rate</span>
                    <span className='font-black text-green-600'>+12%</span>
                  </div>
                  <div className='flex justify-between items-center text-xs'>
                    <span className='text-slate-500'>Retention</span>
                    <span className='font-black text-[#CCA856]'>85%</span>
                  </div>
                </div>
              </div>
              <div className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
                <h4 className='font-bold text-[#1A1C1E] text-sm mb-4'>
                  Leadership
                </h4>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-full bg-[#1A1C1E] flex items-center justify-center text-white font-black text-xs'>
                    PA
                  </div>
                  <div>
                    <p className='font-bold text-[#1A1C1E] text-sm'>
                      Pastor Ade
                    </p>
                    <p className='text-[10px] text-slate-400 uppercase tracking-widest'>
                      Coordinator
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='w-2/3 bg-white rounded-xl border border-slate-100 p-4 h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient id='colorDrill' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#CCA856' stopOpacity={0.1} />
                      <stop offset='95%' stopColor='#CCA856' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    stroke='#f1f5f9'
                  />
                  <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip />
                  <Area
                    type='monotone'
                    dataKey='value'
                    stroke='#CCA856'
                    strokeWidth={2}
                    fillOpacity={1}
                    fill='url(#colorDrill)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h4 className='font-bold text-[#1A1C1E]'>Members Breakdown</h4>
              <button
                onClick={() => setIsDrillColPickerOpen(true)}
                className='text-xs font-bold text-slate-500 hover:text-[#1A1C1E] flex items-center gap-1'
              >
                <LayoutDashboard size={12} /> Columns
              </button>
            </div>
            <div className='bg-white rounded-xl border border-slate-200 overflow-hidden'>
              <table className='w-full'>
                <thead className='bg-slate-50 border-b border-slate-200'>
                  <tr>
                    {drilldownColumns.map((col) => (
                      <th
                        key={col}
                        className='px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500'
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {[...MEMBERS_LIST].slice(0, 5).map((person, idx) => (
                    <tr key={idx} className='hover:bg-slate-50'>
                      {drilldownColumns.map((col) => (
                        <td
                          key={col}
                          className='px-6 py-3 text-xs text-slate-600 font-medium'
                        >
                          {getCellValue(person, col)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={!!profileIndividual}
        onClose={() => setProfileIndividual(null)}
        title='Member Profile'
        size='md'
      >
        {profileIndividual && (
          <div className='text-center pt-4 pb-8'>
            <div className='w-24 h-24 rounded-full bg-[#1A1C1E] text-white text-3xl font-black flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#1A1C1E]/20'>
              {profileIndividual
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <h2 className='text-2xl font-black text-[#1A1C1E] mb-1'>
              {profileIndividual}
            </h2>
            <span className='px-3 py-1 rounded-full bg-[#CCA856]/10 text-[#CCA856] text-xs font-bold border border-[#CCA856]/20'>
              {getCellValue(profileIndividual, 'Role')}
            </span>

            <div className='grid grid-cols-2 gap-4 mt-8 text-left'>
              <div className='p-4 rounded-xl bg-slate-50 border border-slate-100'>
                <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1'>
                  Contact
                </p>
                <p className='text-xs font-bold text-[#1A1C1E]'>
                  {getCellValue(profileIndividual, 'Phone Number')}
                </p>
                <p className='text-xs text-slate-500 mt-1'>
                  {getCellValue(profileIndividual, 'Email')}
                </p>
              </div>
              <div className='p-4 rounded-xl bg-slate-50 border border-slate-100'>
                <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1'>
                  Location
                </p>
                <p className='text-xs font-bold text-[#1A1C1E]'>
                  {getCellValue(profileIndividual, 'Address')}
                </p>
              </div>
              <div className='p-4 rounded-xl bg-slate-50 border border-slate-100'>
                <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1'>
                  Structure
                </p>
                <p className='text-xs font-bold text-[#1A1C1E]'>
                  {getCellValue(profileIndividual, 'Fellowship')}
                </p>
                <p className='text-xs text-slate-500 mt-1'>
                  {getCellValue(profileIndividual, 'Cell')}
                </p>
              </div>
              <div className='p-4 rounded-xl bg-slate-50 border border-slate-100'>
                <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1'>
                  Joined
                </p>
                <p className='text-xs font-bold text-[#1A1C1E]'>
                  {getCellValue(profileIndividual, 'Date Joined Church')}
                </p>
              </div>
            </div>

            <div className='mt-8 flex gap-3'>
              <button className='flex-1 py-3 rounded-xl bg-[#1A1C1E] text-white text-xs font-bold hover:bg-[#2D3E50] transition-colors shadow-lg'>
                View Full History
              </button>
              <button className='flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors'>
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default AnalyticsModule;
