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
} from './types';
import { Logo, COLORS } from './constants';
import LoginPage from './LoginPage';
import {
  mockEvangelismSessions,
  mockFollowUpSessions,
  attendanceTrend,
  attendanceComparisonData,
} from './mockData';
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
} from './api';

/**
 * REUSABLE UI COMPONENTS
 */

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  variant?: 'default' | 'gold' | 'red' | 'green';
}> = ({ title, value, icon, trend, variant = 'default' }) => {
  const variantStyles = {
    default: 'text-[#2D3E50] group-hover:bg-[#CCA856] group-hover:text-white',
    gold: 'text-[#CCA856] bg-gold/5 border-gold/10',
    red: 'text-[#E74C3C] bg-red-50 border-red-100',
    green: 'text-green-600 bg-green-50 border-green-100',
  };

  return (
    <div className='bg-white p-6 rounded border border-slate-200 shadow-sm hover:shadow-md transition-all group'>
      <div className='flex justify-between items-start'>
        <div className='flex items-center gap-4'>
          <div
            className={`p-3 rounded transition-colors border ${variantStyles[variant]} `}
          >
            {icon}
          </div>
          <div className='flex flex-col'>
            <p className='text-slate-500 text-[10px] font-black uppercase tracking-widest'>
              {title}
            </p>
            <h3 className='text-2xl font-black text-[#1A1C1E] mt-0.5'>
              {value}
            </h3>
          </div>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${trend.startsWith('+') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'} `}
          >
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | 'full';
}> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  if (!isOpen) return null;
  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  };
  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1A1C1E]/60 backdrop-blur-sm animate-in fade-in duration-200'>
      <div
        className={`bg-white rounded-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200`}
      >
        <div className='px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10'>
          <div>
            <h3 className='text-lg font-black text-[#1A1C1E] tracking-tight uppercase tracking-[0.1em]'>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-slate-100 rounded text-slate-400 transition-colors'
          >
            <X size={20} />
          </button>
        </div>
        <div className='flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#FAFAFA]'>
          {children}
        </div>
      </div>
    </div>
  );
};

const WORKERS_LIST = [
  'Pastor Robert',
  'Pastor John',
  'Sarah Smith',
  'David K.',
  'Jane Doe',
  'Michael B.',
  'Peter P.',
  'Alex G.',
  'Gbenga Adeniji',
  'Funmi Adeniji',
];

const MEMBERS_LIST = [
  'Adebayo T.',
  'Chioma N.',
  'Emeka O.',
  'Funmi A.',
  'Gideon S.',
  'Hassan M.',
  'Ibrahim K.',
  'Joy E.',
  'Kelechi U.',
  'Lekan B.',
  'Mary J.',
  'Nkechi W.',
  'Olawale D.',
  'Priscilla T.',
  'Quincy R.',
  'Samuel P.',
  'Tunde G.',
  'Victor L.',
  'Aanu Lawson',
  'Chinwe Onwe',
  'Gbemi Goriola',
  'Stephen King',
];

const ROLES = [
  'Super Admin',
  'Church Pastor',
  'Church Admin',
  'Fellowship Coordinator',
  'Cell Leader',
  'Worker',
  'Member',
];

const FIRST_TIMERS_EXAMPLES = [
  'Razak Okoya',
  'Bola Ahmed Tinubu',
  'Layal Tinubu',
];

const FELLOWSHIPS = [
  'Oke-afa Fellowship',
  'Ire-Akari Fellowship',
  'Ago-Ejigbo Fellowship',
];
const CELLS = ['Oke-afa Cell 1', 'Aswan Cell', 'Ile-Iwe Cell'];

const getMemberGroup = (name: string): string => {
  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const groups = [...FELLOWSHIPS, ...CELLS];
  return groups[hash % groups.length];
};

const CodeCountdown: React.FC<{ expiresAt: number; onExpire?: () => void }> = ({
  expiresAt,
  onExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(expiresAt - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        if (onExpire) onExpire();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (timeLeft <= 0)
    return <span className='text-red-500 font-black'>EXPIRED</span>;

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <span className='font-mono font-black text-xs text-[#CCA856]'>
      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
      {seconds.toString().padStart(2, '0')}
    </span>
  );
};

/**
 * EVANGELISM MODULE
 */

/**
 * CUSTOM CALENDAR PICKER
 */
const DatePickerCalendar = ({
  date,
  onSelect,
  label,
}: {
  date: Date | null;
  onSelect: (d: Date) => void;
  label: string;
}) => {
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handlePrevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  const handleNextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const days = Array.from(
    { length: daysInMonth(currentMonth, currentYear) },
    (_, i) => i + 1
  );
  const blanks = Array.from(
    { length: firstDayOfMonth(currentMonth, currentYear) },
    (_, i) => i
  );

  return (
    <div className='bg-white p-4 rounded-xl border border-slate-100 shadow-sm w-full max-w-[280px]'>
      <p className='text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest'>
        {label}
      </p>
      <div className='flex justify-between items-center mb-4'>
        <button
          onClick={handlePrevMonth}
          className='p-1 hover:bg-slate-50 rounded text-slate-400'
        >
          <ChevronLeft size={16} />
        </button>
        <span className='text-xs font-black text-[#1A1C1E] uppercase'>
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button
          onClick={handleNextMonth}
          className='p-1 hover:bg-slate-50 rounded text-slate-400'
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className='grid grid-cols-7 gap-1 text-center mb-2'>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
          <span key={d} className='text-[9px] font-black text-slate-300'>
            {d}
          </span>
        ))}
      </div>
      <div className='grid grid-cols-7 gap-1'>
        {blanks.map((b) => (
          <div key={`b-${b} `} className='h-8'></div>
        ))}
        {days.map((d) => {
          const isSelected =
            date &&
            date.getDate() === d &&
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear;
          return (
            <button
              key={d}
              onClick={() => onSelect(new Date(currentYear, currentMonth, d))}
              className={`h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${isSelected ? 'bg-[#1A1C1E] text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'} `}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ANALYTICS & REPORTING MODULE
 */

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
    // Always calculate involved from sessions as backend stats might not include it yet
    const uniqueParticipants = new Set<string>();
    sessions.forEach((s) => {
      s.participants.forEach((p) => uniqueParticipants.add(p));
    });
    const totalInvolved = uniqueParticipants.size;

    if (backendStats) {
      return {
        saved: backendStats.total_saved || 0,
        filled: backendStats.total_filled || 0,
        healed: backendStats.total_healed || 0,
        workersInvolved: totalInvolved,
        membersInvolved: 0, // Keep members 0 for now as we only track "participants" which are mixed
      };
    }

    let saved = 0,
      filled = 0,
      healed = 0;

    sessions.forEach((s) => {
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
      workersInvolved: totalInvolved,
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
          ? membersData.map((m: any) =>
              m.first_name || m.last_name
                ? `${m.first_name || ''} ${m.last_name || ''} `.trim()
                : m.email
            )
          : [];

        const workerNames = Array.isArray(workersData)
          ? workersData.map((w: any) =>
              `${w.first_name} ${w.last_name} `.trim()
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

const RecordBlock = ({
  rec,
  i,
  onUpdate,
  onRemove,
  searches,
  setSearches,
  exclude = [],
  membersOnly = [],
  readOnly = false,
}: any) => (
  <div className='p-6 bg-white rounded border border-slate-200 relative shadow-sm'>
    <div className='absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-200 rounded shadow-sm'>
      <span className='text-[9px] font-black text-[#CCA856] uppercase tracking-[0.2em]'>
        Record #{i + 1}
      </span>
    </div>
    {!readOnly && (
      <button
        onClick={() => onRemove(rec.id)}
        className='absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 transition-colors'
      >
        <Trash2 size={18} />
      </button>
    )}
    <div className='space-y-4 pt-4'>
      <div className='space-y-2'>
        <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
          Member(s) taught
        </label>
        {!readOnly && (
          <div className='relative group'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
              size={14}
            />
            <input
              type='text'
              placeholder='Select from list or type a name...'
              className='w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-xs'
              value={searches[rec.id] || ''}
              onChange={(e) =>
                setSearches({ ...searches, [rec.id]: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searches[rec.id]) {
                  const current = rec.personFollowedUp
                    ? rec.personFollowedUp.split(', ')
                    : [];
                  if (!current.includes(searches[rec.id])) {
                    onUpdate(rec.id, {
                      personFollowedUp: [...current, searches[rec.id]].join(
                        ', '
                      ),
                    });
                    setSearches({ ...searches, [rec.id]: '' });
                  }
                }
              }}
            />
          </div>
        )}
        <div className='flex flex-wrap gap-2 py-1'>
          {(rec.personFollowedUp ? rec.personFollowedUp.split(', ') : [])
            .filter(Boolean)
            .map((m: string) => (
              <span
                key={m}
                className='flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[9px] font-black uppercase'
              >
                {m}
                {!readOnly && (
                  <button
                    onClick={() => {
                      const updated = rec.personFollowedUp
                        .split(', ')
                        .filter((x: string) => x !== m)
                        .join(', ');
                      onUpdate(rec.id, { personFollowedUp: updated });
                    }}
                    className='hover:text-red-500'
                  >
                    <X size={10} />
                  </button>
                )}
              </span>
            ))}
        </div>
        {!readOnly && (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[100px] overflow-y-auto custom-scrollbar p-2 bg-[#F8F9FA] border border-slate-100 rounded'>
            {membersOnly
              .filter((m) => !exclude.includes(m))
              .filter((m) =>
                m.toLowerCase().includes((searches[rec.id] || '').toLowerCase())
              )
              .map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    const current = rec.personFollowedUp
                      ? rec.personFollowedUp.split(', ')
                      : [];
                    if (!current.includes(m))
                      onUpdate(rec.id, {
                        personFollowedUp: [...current, m].join(', '),
                      });
                  }}
                  className='text-left px-2 py-1 hover:bg-white rounded text-[10px] font-bold text-slate-500 hover:text-[#1A1C1E] transition-all'
                >
                  + {m}
                </button>
              ))}
          </div>
        )}
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
            Topic / Subject
          </label>
          <input
            type='text'
            disabled={readOnly}
            placeholder='e.g. Foundation School Class 1'
            value={rec.subjectTaught}
            onChange={(e) =>
              onUpdate(rec.id, { subjectTaught: e.target.value })
            }
            className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-bold text-sm disabled:opacity-75 disabled:cursor-not-allowed'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
            Material Used
          </label>
          <input
            type='text'
            disabled={readOnly}
            placeholder='specify the name of the audio or book used'
            value={rec.materialSource}
            onChange={(e) =>
              onUpdate(rec.id, { materialSource: e.target.value })
            }
            className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-bold text-sm disabled:opacity-75 disabled:cursor-not-allowed'
          />
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1'>
            <Clock3 size={12} /> Duration (min)
          </label>
          <input
            type='number'
            disabled={readOnly}
            min='0'
            placeholder='30'
            value={rec.duration}
            onChange={(e) => onUpdate(rec.id, { duration: e.target.value })}
            className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-bold text-sm disabled:opacity-75 disabled:cursor-not-allowed'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
            Comments
          </label>
          <textarea
            disabled={readOnly}
            value={rec.comments}
            onChange={(e) => onUpdate(rec.id, { comments: e.target.value })}
            className='w-full px-4 py-2 bg-[#F8F9FA] border border-slate-100 rounded outline-none font-medium text-sm min-h-[80px] disabled:opacity-75 disabled:cursor-not-allowed'
            placeholder='Specific notes...'
          ></textarea>
        </div>
      </div>
    </div>
  </div>
);

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
      worker: fuParticipants[0] || 'Unknown',
      location: fuLocation,
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
      '19:20',
      'Location',
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
                  value='19:20'
                  disabled
                  className='w-full px-4 py-2.5 bg-[#F8F9FA] border border-slate-200 rounded outline-none font-bold text-sm text-[#1A1C1E] opacity-60'
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
                  fuSummary ||
                  'Initial session summary recorded for this discipleship meeting.'
                }
                onChange={(e) => setFuSummary(e.target.value)}
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

/**
 * CHURCH MEETINGS MODULE
 */

const ChurchMeetingsModule = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [submissions, setSubmissions] = useState<AttendanceSubmission[]>([]);
  const [activeCodes, setActiveCodes] = useState<
    Record<string, { code: string; expiresAt: number }>
  >({});
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
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
    useState<string>(''); // Church ID or 'global'
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

        // Fetch churches if admin
        let churches = [];
        const token = getAuthToken();
        if (token) {
          const decoded = parseJwt(token);
          if (decoded?.admin_meta?.role) {
            setCurrentUserRole(decoded.admin_meta.role);
          }
          if (decoded?.admin_meta?.role === 'admin') {
            try {
              const [cData, fData, celData] = await Promise.all([
                structureAPI.getChurches(),
                structureAPI.getFellowships(),
                structureAPI.getCells(),
              ]);
              setAvailableChurches(cData);
              setAvailableFellowships(fData);
              setAvailableCells(celData);
            } catch (e) {
              console.error('Failed to fetch structure data for admin', e);
            }
          }
        }

        // 1. Fetch Meetings (Critical)
        try {
          const meetingsData = await attendanceAPI.getMeetings();
          setMeetings(meetingsData);
        } catch (e) {
          console.error('Failed to fetch meetings', e);
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

  const generateMeetingCode = (meetingId: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
    setActiveCodes({ ...activeCodes, [meetingId]: { code, expiresAt } });
  };

  const openCreateModal = () => {
    setEditingMeeting(null);
    setMTitle('');
    setMType('Sunday Service');
    setMFreq('Weekly');
    setMScope('Church-wide');
    setMScopeId('');
    setMTime('08:00');
    setMDate(new Date().toISOString().split('T')[0]);
    setIsMeetingModalOpen(true);
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

    // Generate code and expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

    const meetingData = {
      title: mTitle,
      type: mType,
      frequency: mFreq,
      scope: mScope, // Legacy/Display
      scope_type: scopeType,
      scope_value: scopeValue,
      scope_id: scopeValue, // CRITICAL FIX: Backend expects scope_id for linking parent church
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
        await attendanceAPI.createMeeting({
          ...meetingData,
          id: editingMeeting.id,
        });
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
    setSelectedChurchContext('');
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
        {['Overview', 'Meetings', 'Attendance Submissions', 'History'].map(
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
                        {activeCodes[m.id] ? (
                          <div className='flex items-center gap-3'>
                            <span className='px-3 py-1 bg-gold/10 text-[#CCA856] rounded font-mono font-black text-sm border border-gold/20'>
                              {activeCodes[m.id].code}
                            </span>
                            <CodeCountdown
                              expiresAt={activeCodes[m.id].expiresAt}
                            />
                          </div>
                        ) : (
                          <span className='text-[10px] font-black text-slate-300 uppercase tracking-widest italic'>
                            No code
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

                // Same logic as fixed openViewModal to find context name
                if (m.scope_type === 'Fellowship') {
                  const f = availableFellowships.find(
                    (f) =>
                      (m.scope_id &&
                        f.id.toString() === m.scope_id.toString()) ||
                      f.name === m.scope
                  );
                  if (f && f.church_id) {
                    const c = availableChurches.find(
                      (c) => c.id.toString() === f.church_id.toString()
                    );
                    return c ? c.name : 'Unknown Church';
                  }
                  return m.scope; // Fallback
                } else if (m.scope_type === 'Cell') {
                  const c = availableCells.find(
                    (ce) =>
                      (m.scope_id &&
                        ce.id.toString() === m.scope_id.toString()) ||
                      ce.name === m.scope
                  );
                  if (c && c.church_id) {
                    const ch = availableChurches.find(
                      (ch) => ch.id.toString() === c.church_id.toString()
                    );
                    return ch ? ch.name : 'Unknown Church';
                  }
                  return m.scope;
                } else {
                  // Try to match scope name to a church
                  const church = availableChurches.find(
                    (c) => c.name === m.scope
                  );
                  if (church) return church.name;
                  // Or via scope_id if it was a Church type
                  if (m.scope_type === 'Church' && m.scope_id) {
                    const ch = availableChurches.find(
                      (c) => c.id.toString() === m.scope_id?.toString()
                    );
                    if (ch) return ch.name;
                  }
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
                {allMembers
                  .filter((m) =>
                    (m.name || '')
                      .toLowerCase()
                      .includes(memberSearchTerm.toLowerCase())
                  )
                  .map((m, idx) => {
                    const isSelected = attendanceMembers.includes(
                      m.id || m.name
                    ); // Fallback to name if ID missing, but prefer ID
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
                  })}
                {allMembers.length === 0 && (
                  <p className='col-span-2 text-center py-6 text-[11px] text-slate-400 italic'>
                    No members found.
                  </p>
                )}
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
        isOpen={isMeetingModalOpen}
        onClose={() => {
          setIsMeetingModalOpen(false);
          setIsReadOnlyMode(false);
          setEditingMeeting(null);
          resetMeetingForm();
        }}
        title={
          isReadOnlyMode
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

          <div className='grid grid-cols-2 gap-4'>
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
                  onChange={(e) => setMScope(e.target.value)}
                  className='w-full px-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-lg outline-none font-bold text-sm shadow-sm'
                >
                  <option>Entire Church</option>
                  <optgroup label='Fellowship'>
                    {FELLOWSHIPS.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </optgroup>
                  <optgroup label='Cell'>
                    {CELLS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}
          </div>

          {!isReadOnlyMode && (
            <button
              onClick={saveMeeting}
              className='w-full py-4 bg-[#1A1C1E] text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-2xl mt-4 hover:bg-[#CCA856] transition-all'
            >
              {editingMeeting
                ? 'Update Configuration'
                : 'Save Meeting Configuration'}
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

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

const ExternalLinkIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
    <polyline points='15 3 21 3 21 9' />
    <line x1='10' y1='14' x2='21' y2='3' />
  </svg>
);

/**
 * MODULE: STUDY GROUP
 */
const StudyGroupModule = () => {
  const [activeTab, setActiveTab] = useState<
    'Assignments' | 'Submissions' | 'History'
  >('Assignments');
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [isAddSubmissionOpen, setIsAddSubmissionOpen] = useState(false);
  const [isEditAssignmentOpen, setIsEditAssignmentOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(
    null
  );
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(
    null
  );
  const [showEmptyState, setShowEmptyState] = useState(false);

  // New Submission Form States
  const [submissionForm, setSubmissionForm] = useState({
    church: '',
    fellowship: 'None',
    cell: 'None',
    member: '',
    assignment: '',
    isOffline: false,
    link: '',
    notes: '',
  });

  // Auto-select based on User Role (JWT)
  useEffect(() => {
    if (isAddSubmissionOpen) {
      const token = getAuthToken(); // JWT Token for NestJS/Admin
      if (token) {
        const decoded = parseJwt(token);
        const adminMeta = decoded?.admin_meta;
        if (adminMeta) {
          const { role, church_id, fellowship_id, cell_id } = adminMeta;

          setSubmissionForm((prev) => {
            let updates: any = {};
            if (
              role === 'church_pastor' ||
              role === 'fellowship_leader' ||
              role === 'cell_leader'
            ) {
              if (church_id) updates.church = church_id.toString();
            }
            if (role === 'fellowship_leader' || role === 'cell_leader') {
              if (fellowship_id) updates.fellowship = fellowship_id.toString();
            }
            if (role === 'cell_leader') {
              if (cell_id) updates.cell = cell_id.toString();
            }
            return { ...prev, ...updates };
          });
        }
      }
    }
  }, [isAddSubmissionOpen]);
  const [memberModalSearch, setMemberModalSearch] = useState('');
  const [showMemberModalSuggestions, setShowMemberModalSuggestions] =
    useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [churches, setChurches] = useState<any[]>([]);
  const [fellowships, setFellowships] = useState<any[]>([]);
  const [cells, setCells] = useState<any[]>([]);

  // Fetch Members and Structure Data
  const fetchMembers = async () => {
    try {
      const data = await memberAPI.getAllMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch members', error);
    }
  };

  const fetchStructureData = async () => {
    try {
      const [churchesData, fellowshipsData, cellsData] = await Promise.all([
        structureAPI.getChurches(),
        structureAPI.getFellowships(),
        structureAPI.getCells(),
      ]);
      setChurches(churchesData);
      setFellowships(fellowshipsData);
      setCells(cellsData);
    } catch (error) {
      console.error('Failed to fetch structure data', error);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchStructureData();
  }, []);

  // Filtered members for modal search
  // Filtered members for modal search
  const filteredModalMembers = members
    .filter((m) => {
      const searchLower = memberModalSearch.toLowerCase();
      const firstName = m.first_name?.toLowerCase() || '';
      const lastName = m.last_name?.toLowerCase() || '';
      const email = m.email?.toLowerCase() || '';
      const phone = m.phone || '';

      const matchesChurch =
        !submissionForm.church ||
        (m.church_id && m.church_id.toString() === submissionForm.church);
      const matchesFellowship =
        !submissionForm.fellowship ||
        submissionForm.fellowship === 'None' ||
        (m.fellowship_id &&
          m.fellowship_id.toString() === submissionForm.fellowship);
      const matchesCell =
        !submissionForm.cell ||
        submissionForm.cell === 'None' ||
        (m.cell_id && m.cell_id.toString() === submissionForm.cell);

      return (
        (firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower)) &&
        matchesChurch &&
        matchesFellowship &&
        matchesCell
      );
    })
    .slice(0, 5)
    .map((m) => ({
      id: m._id || m.id,
      name:
        m.first_name || m.last_name
          ? `${m.first_name || ''} ${m.last_name || ''}`.trim()
          : m.email,
      fellowship: m.fellowship_id
        ? `Fellowship ${m.fellowship_id}`
        : 'No Fellowship',
      cell: m.cell_id ? `Cell ${m.cell_id}` : 'No Cell',
    }));

  // Assignment Form State
  const [assignmentForm, setAssignmentForm] = useState({
    id: '',
    title: '',
    status: 'Active',
    summary: '',
    link: '',
    dueDate: '',
    dueTime: '',
    weekStartDate: '',
    weekEndDate: '',
    questions: '',
  });

  // Grading Form State
  const [gradeForm, setGradeForm] = useState({
    score: '',
    feedback: '',
  });

  const handleGradeSubmission = async (submissionId: string) => {
    try {
      if (!gradeForm.score) {
        alert('Please enter a score');
        return;
      }
      await studyGroupAPI.gradeSubmission(submissionId, {
        score: Number(gradeForm.score),
        feedback: gradeForm.feedback,
      });
      alert('Submission graded successfully');
      setExpandedSubmission(null);
      setGradeForm({ score: '', feedback: '' });
      // Refresh submissions to update UI
      fetchStudyGroupData();
    } catch (error) {
      console.error('Failed to grade submission', error);
      alert('Failed to grade submission');
    }
  };

  const handleRequestRedo = async (submissionId: string) => {
    try {
      if (!gradeForm.feedback) {
        alert('Please provide feedback/reason for redo');
        return;
      }
      await studyGroupAPI.requestRedo(submissionId, {
        redo_note: gradeForm.feedback, // Using feedback field for redo note
      });
      alert('Redo requested successfully');
      setExpandedSubmission(null);
      setGradeForm({ score: '', feedback: '' });
      fetchStudyGroupData();
    } catch (error) {
      console.error('Failed to request redo', error);
      alert('Failed to request redo');
    }
  };

  const handleCreateOrUpdateAssignment = async () => {
    try {
      const questionsArray = assignmentForm.questions
        .split('\n')
        .filter((q) => q.trim() !== '');
      const payload = {
        title: assignmentForm.title,
        status: assignmentForm.status.toLowerCase(),
        due_date: assignmentForm.dueDate
          ? new Date(
              `${assignmentForm.dueDate}T${assignmentForm.dueTime || '00:00'}`
            ).toISOString()
          : undefined,
        week_start_date: assignmentForm.weekStartDate
          ? new Date(assignmentForm.weekStartDate).toISOString()
          : undefined,
        week_end_date: assignmentForm.weekEndDate
          ? new Date(assignmentForm.weekEndDate).toISOString()
          : undefined,
        church_id: 1, // Defaulting to 1 as per admin context usually
        is_current_week: assignmentForm.status === 'Active', // Infer is_current_week from status
        questions: questionsArray,
      };

      if (assignmentForm.id) {
        await studyGroupAPI.updateAssignment(assignmentForm.id, payload);
      } else {
        await studyGroupAPI.createAssignment(payload);
      }

      setIsAddAssignmentOpen(false);
      setAssignmentForm({
        id: '',
        title: '',
        status: 'Active',
        summary: '',
        link: '',
        dueDate: '',
        dueTime: '',
        weekStartDate: '',
        weekEndDate: '',
        questions: '',
      });
      fetchStudyGroupData();
      alert(
        `Assignment ${assignmentForm.id ? 'updated' : 'created'} successfully!`
      );
    } catch (e) {
      console.error(e);
      alert(`Failed to ${assignmentForm.id ? 'update' : 'create'} assignment`);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        await studyGroupAPI.deleteAssignment(id);
        fetchStudyGroupData();
        alert('Assignment deleted successfully!');
      } catch (e) {
        console.error(e);
        alert('Failed to delete assignment');
      }
    }
  };

  const prepareEditAssignment = (assignment: any) => {
    const dateObj = new Date(assignment.dueDate);
    const dateStr = !isNaN(dateObj.getTime())
      ? dateObj.toISOString().split('T')[0]
      : '';

    setAssignmentForm({
      id: assignment.id,
      title: assignment.title,
      status: assignment.status,
      summary: '',
      link: '',
      dueDate: dateStr,
      dueTime: '',
      weekStartDate: assignment.weekStartDate || '',
      weekEndDate: assignment.weekEndDate || '',
      questions: Array.isArray(assignment.questions)
        ? assignment.questions.join('\n')
        : '',
    });
    setIsAddAssignmentOpen(true);
  };

  const handleSubmitAssignment = async () => {
    try {
      if (!submissionForm.assignment || !submissionForm.church) {
        alert('Please select a church and assignment');
        return;
      }

      // Check if selected member exists in our fetched list (Registered)
      const selectedMember = members.find((m) => {
        const displayName =
          m.first_name || m.last_name
            ? `${m.first_name || ''} ${m.last_name || ''}`.trim()
            : m.email;
        return displayName === submissionForm.member;
      });

      const payload: any = {
        study_group_id: submissionForm.assignment,
        assignment_link: submissionForm.link,
        submission_method: submissionForm.isOffline
          ? 'offline_by_leader'
          : 'online_by_leader',
        member_church_id: 1, // Default or derive from form
      };

      if (selectedMember) {
        // Registered Member Submission
        payload.member_id = selectedMember._id || selectedMember.id;
        console.log('Submitting for registered member:', payload);
        await studyGroupAPI.submitWorkerAssignment(payload);
      } else {
        // Unregistered Member Submission
        if (!submissionForm.member) {
          alert('Please enter a member name');
          return;
        }
        payload.member_name = submissionForm.member;
        payload.member_fellowship_id =
          submissionForm.fellowship !== 'None' ? 1 : undefined; // fierce simplification for now
        payload.member_cell_id = submissionForm.cell !== 'None' ? 1 : undefined;
        console.log('Submitting for unregistered member:', payload);
        await studyGroupAPI.submitWorkerAssignmentUnregistered(payload);
      }

      setIsAddSubmissionOpen(false);
      setMemberModalSearch('');
      setShowMemberModalSuggestions(false);
      setSubmissionForm({
        church: '',
        fellowship: 'None',
        cell: 'None',
        member: '',
        assignment: '',
        isOffline: false,
        link: '',
        notes: '',
      });
      fetchStudyGroupData();
      alert('Submission created successfully!');
    } catch (e: any) {
      console.error(e);
      alert(`Failed to submit: ${e.message || 'Unknown error'}`);
    }
  };

  // Filter States
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [workerSearch, setWorkerSearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilters, setStatusFilters] = useState<string[]>([]); // Active, Upcoming, Past
  const [submissionTypes, setSubmissionTypes] = useState<string[]>([]); // Pending, Late, Online, etc.

  // Study Group Data
  const [studyGroupAssignments, setStudyGroupAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<any>(null); // For "Current Week"
  const [isLoadingStudyGroup, setIsLoadingStudyGroup] = useState(false);

  // Fetch Study Group Data
  const fetchStudyGroupData = async () => {
    try {
      setIsLoadingStudyGroup(true);
      const [assignments, current, subs] = await Promise.all([
        studyGroupAPI.getAllAssignments(),
        studyGroupAPI.getCurrentAssignment().catch((err) => {
          console.warn('No current assignment found, continuing...', err);
          return null;
        }),
        studyGroupAPI.getSubmissions(),
      ]);

      const mappedAssignments = assignments.map((a: any) => ({
        id: a.id,
        title: a.title,
        week: a.week_start_date
          ? `Week of ${new Date(a.week_start_date).toLocaleDateString()}`
          : 'General',
        questions: a.questions || [],
        status:
          a.status === 'active'
            ? 'Active'
            : a.status === 'inactive' || a.status === 'completed'
              ? 'Past'
              : 'Closed',
        dueDate: a.due_date
          ? new Date(a.due_date).toLocaleDateString()
          : 'No Due Date',
      }));
      setStudyGroupAssignments(mappedAssignments);

      // Set Current Week Assignment
      if (current) {
        setActiveAssignment({
          id: current.id,
          title: current.title,
          questions: current.questions || [],
        });
      }

      // Map Submissions
      const mappedSubmissions = subs.map((s: any) => ({
        id: s.id,
        assignmentTitle:
          s.study_group_title || s.assignment_title || 'Unknown Assignment',
        submittedBy: s.member_name || 'Unknown Member',
        phone: s.member_phone || '',
        email: s.member_email || '',
        // count: 1, // Individual submission
        date: s.created_at || new Date().toISOString(),
        status: s.status || 'Pending', // Pending, Approved, Rejected
        week: s.week_number
          ? `Week ${s.week_number}`
          : s.week
            ? `Week ${s.week}`
            : 'Week --',
        member: s.member_name || 'Unknown Member', // For card display
        studentNotes: s.content || '', // Assuming 'content' field holds notes
        isLate: s.is_late,
        type: s.submission_method,
      }));
      setSubmissions(mappedSubmissions);
    } catch (error) {
      console.error('Failed to fetch study group data', error);
    } finally {
      setIsLoadingStudyGroup(false);
    }
  };

  useEffect(() => {
    fetchStudyGroupData();
  }, []);

  // Assignment Data
  // const assignments = [
  //   { id: '1', title: 'WCC 2020 Track 1', summary: 'Test', created: '12/31/2025', due: '1/3/2026', status: 'Active', questions: ['Question 1', 'Question 2', 'Question 3'] },
  //   { id: '2', title: 'Workers in Training Convention 2025 Track 6', summary: 'Jdiaksks', created: '11/26/2025', due: '12/6/2025', status: 'Past', questions: ['Discuss the role of service', 'Define loyalty in the local church'] },
  //   { id: '3', title: 'Workers in Training Convention 2025 Track 5', summary: 'Jdiaksks', created: '11/26/2025', due: '11/29/2025', status: 'Upcoming', questions: ['Question 1', 'Question 2'] },
  // ];

  // Submission Data
  // const submissions = [
  //   {
  //     id: 'sub1',
  //     assignmentTitle: 'Untitled Assignment',
  //     week: 'Week 48, 2025',
  //     member: 'Demilade Oyewusi',
  //     role: 'Worker in Training',
  //     phone: '+234 000 000 0000',
  //     email: 'worker@example.com',
  //     isLate: true,
  //     deadline: 'December 3, 2025',
  //     submittedAt: 'November 26, 2025 at 2:44 AM',
  //     status: 'Pending Review'
  //   }
  // ];

  // History Data - Derived from Submissions
  const history = submissions
    .filter((s) => {
      const status = (s.status || '').toLowerCase();
      return status === 'graded' || status === 'approved';
    })
    .map((s) => ({
      id: s.id,
      title: s.assignmentTitle,
      week: s.week,
      member: s.submittedBy,
      role: 'Member', // Ideally role should come from API
      phone: s.phone,
      email: s.email,
      submitted: new Date(s.date).toLocaleString(),
      type: 'Online By Member', // Placeholder
      status: s.status,
      feedback: 'No feedback provided.', // Placeholder until feedback is mapped
      gradedBy: 'Admin', // Placeholder
      link: '#', // Placeholder
    }));

  const MOCK_MEMBERS_FULL = [
    {
      name: 'John Smith',
      fellowship: 'Oke Afa Fellowship',
      cell: 'Oke Afa cell 1',
    },
    {
      name: 'Sarah Miller',
      fellowship: 'Oke Afa Fellowship',
      cell: 'Aswan Cell',
    },
    { name: 'Michael B.', fellowship: 'Ire-Akari Fellowship', cell: 'Unit 1' },
    { name: 'Robert Peterson', fellowship: 'Grace Fellowship', cell: 'Unit 2' },
    { name: 'Mary Johnson', fellowship: 'Grace Fellowship', cell: 'Unit 2' },
    {
      name: 'Chinwe Onwe',
      fellowship: 'Ago-Ejigbo Fellowship',
      cell: 'Unit 3',
    },
    {
      name: 'Gbemi Goriola',
      fellowship: 'Ago-Ejigbo Fellowship',
      cell: 'Unit 3',
    },
    { name: 'Kelechi U.', fellowship: 'Ire-Akari Fellowship', cell: 'Unit 1' },
    {
      name: 'Joy E.',
      fellowship: 'Oke Afa Fellowship',
      cell: 'Oke Afa cell 1',
    },
  ];

  const toggleWorker = (name: string) => {
    setSelectedWorkers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
    setWorkerSearch('');
  };

  const toggleFilter = (
    list: string[],
    setList: (l: string[]) => void,
    item: string
  ) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  };

  const filteredMembers = MOCK_MEMBERS_FULL.filter(
    (m) =>
      m.name.toLowerCase().includes(workerSearch.toLowerCase()) &&
      !selectedWorkers.includes(m.name)
  ).slice(0, 5);

  return (
    <div className='space-y-8 animate-in fade-in duration-700'>
      {/* Top Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-black text-[#1A1C1E] tracking-tighter uppercase'>
            Study Group
          </h1>
          <p className='text-slate-500 text-sm mt-1'>
            Management and Grading Terminal
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <button
            onClick={() =>
              activeTab === 'Assignments'
                ? setIsAddAssignmentOpen(true)
                : setIsAddSubmissionOpen(true)
            }
            className='flex items-center gap-2 px-6 py-3 bg-[#E74C3C] text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all'
          >
            <Plus size={18} />{' '}
            {activeTab === 'Assignments' ? 'New Assignment' : 'New Record'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='flex border-b border-slate-100'>
        {(['Assignments', 'Submissions', 'History'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setIsFilterExpanded(false);
            }}
            className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-[#1A1C1E]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab}
            {activeTab === tab && (
              <div className='absolute bottom-0 left-0 right-0 h-1 bg-[#CCA856] rounded-t-full'></div>
            )}
          </button>
        ))}
      </div>

      {showEmptyState ? (
        <div className='flex flex-col items-center justify-center py-32 text-center animate-in zoom-in-95 duration-500'>
          <div className='w-56 h-56 bg-slate-50 rounded-[48px] flex items-center justify-center relative mb-10 overflow-hidden group'>
            <div className='w-28 h-28 bg-slate-200 rounded-3xl rotate-12 shadow-inner group-hover:rotate-45 transition-transform duration-700'></div>
            <div className='w-28 h-28 bg-slate-300 rounded-3xl -rotate-6 absolute shadow-lg group-hover:-rotate-12 transition-transform duration-700'></div>
            <div className='absolute top-6 right-6 text-yellow-400 animate-pulse'>
              <Sparkles size={24} />
            </div>
            <div className='absolute bottom-10 left-6 text-purple-300'>
              <Sparkles size={20} />
            </div>
          </div>
          <h3 className='text-2xl font-black text-[#1A1C1E] tracking-tight uppercase'>
            Database Empty
          </h3>
          <p className='text-slate-400 text-sm mt-3 max-w-sm leading-relaxed font-bold'>
            No records found matching your selection.
          </p>
        </div>
      ) : (
        <div className='space-y-6'>
          {/* Minimal Search & Filter Row */}
          <div className='flex justify-end items-center gap-3'>
            <div className='relative'>
              <Search
                size={18}
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-300'
              />
              <input
                type='text'
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                className='pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold w-64 shadow-sm focus:border-slate-300 focus:bg-white transition-all'
              />
            </div>
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`p-3 rounded-2xl border transition-all ${isFilterExpanded ? 'bg-[#1A1C1E] border-[#1A1C1E] text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:text-[#1A1C1E] shadow-sm'}`}
            >
              <Filter size={18} />
            </button>
          </div>

          {/* Inline Expandable Filter Section */}
          {isFilterExpanded && (
            <div className='bg-slate-50 border border-slate-100 rounded-xl p-8 animate-in slide-in-from-top-4 duration-500 space-y-8'>
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
                {/* Categorical Filters */}
                {(activeTab === 'Assignments' ||
                  activeTab === 'Submissions') && (
                  <div className='space-y-4'>
                    <h4 className='text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1C1E]'>
                      {activeTab === 'Assignments'
                        ? 'Filter by Status'
                        : 'Filter by Type'}
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {activeTab === 'Assignments'
                        ? ['Active', 'Upcoming', 'Past'].map((s) => (
                            <button
                              key={s}
                              onClick={() =>
                                toggleFilter(statusFilters, setStatusFilters, s)
                              }
                              className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${statusFilters.includes(s) ? 'bg-[#CCA856] border-[#CCA856] text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                            >
                              {s}
                            </button>
                          ))
                        : [
                            'Total Submissions',
                            'Pending Review',
                            'Late Submissions',
                            'Online Submissions',
                          ].map((t) => (
                            <button
                              key={t}
                              onClick={() =>
                                toggleFilter(
                                  submissionTypes,
                                  setSubmissionTypes,
                                  t
                                )
                              }
                              className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${submissionTypes.includes(t) ? 'bg-[#CCA856] border-[#CCA856] text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                            >
                              {t}
                            </button>
                          ))}
                    </div>
                  </div>
                )}

                {/* Worker Name Multi-Picker */}
                <div className='space-y-4'>
                  <h4 className='text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1C1E]'>
                    Worker Selection
                  </h4>
                  <div className='space-y-3'>
                    <div className='relative'>
                      <UserSearch
                        size={16}
                        className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-300'
                      />
                      <input
                        type='text'
                        value={workerSearch}
                        onChange={(e) => setWorkerSearch(e.target.value)}
                        placeholder='Search worker names...'
                        className='w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold shadow-sm focus:border-[#CCA856]'
                      />
                      {workerSearch && (
                        <div className='absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden'>
                          {filteredMembers.map((m) => (
                            <button
                              key={m.name}
                              onClick={() => toggleWorker(m.name)}
                              className='w-full text-left px-5 py-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-between'
                            >
                              {m.name}
                              <Plus size={14} className='text-slate-300' />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {selectedWorkers.map((w) => (
                        <div
                          key={w}
                          className='flex items-center gap-2 px-3 py-1.5 bg-[#1A1C1E] text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm animate-in zoom-in-95'
                        >
                          {w}
                          <button
                            onClick={() => toggleWorker(w)}
                            className='hover:text-red-400 transition-colors'
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date Range Picker */}
                <div className='space-y-4'>
                  <h4 className='text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1C1E]'>
                    Date Range Selection
                  </h4>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1'>
                      <label className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>
                        Start Date
                      </label>
                      <input
                        type='date'
                        value={dateRange.start}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, start: e.target.value })
                        }
                        className='w-full p-3 bg-white border border-slate-100 rounded-xl outline-none text-[10px] font-bold text-slate-600'
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>
                        End Date
                      </label>
                      <input
                        type='date'
                        value={dateRange.end}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, end: e.target.value })
                        }
                        className='w-full p-3 bg-white border border-slate-100 rounded-xl outline-none text-[10px] font-bold text-slate-600'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Footer */}
              <div className='flex justify-end gap-3 pt-6 border-t border-slate-200'>
                <button
                  onClick={() => {
                    setSelectedWorkers([]);
                    setStatusFilters([]);
                    setSubmissionTypes([]);
                    setDateRange({ start: '', end: '' });
                  }}
                  className='px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all'
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsFilterExpanded(false)}
                  className='px-8 py-2.5 bg-[#1A1C1E] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-black/10 hover:shadow-black/20'
                >
                  Apply Parameters
                </button>
              </div>
            </div>
          )}

          {/* Content for Tabs */}
          <div className='space-y-6'>
            {activeTab === 'Assignments' &&
              studyGroupAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className='bg-white border border-slate-200 rounded-xl p-8 space-y-6 hover:shadow-xl transition-shadow group'
                >
                  <div className='flex justify-between items-start'>
                    <div>
                      <h3 className='text-2xl font-black text-[#1A1C1E] tracking-tight group-hover:text-[#E74C3C] transition-colors'>
                        {assignment.title}
                      </h3>
                      <p className='text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest'>
                        {assignment.week} • Due: {assignment.dueDate}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        assignment.status === 'Active'
                          ? 'bg-green-50 text-green-600 border-green-100'
                          : assignment.status === 'Upcoming'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </div>

                  {expandedAssignment === assignment.id && (
                    <div className='mt-8 pt-8 border-t border-slate-50 animate-in slide-in-from-top-4 duration-500'>
                      <h4 className='text-[11px] font-black uppercase tracking-[0.2em] text-[#E74C3C] mb-6 flex items-center gap-2'>
                        <BookOpen size={16} /> Study Questions:
                      </h4>
                      <ul className='space-y-4'>
                        {assignment.questions.map((q: string, i: number) => (
                          <li
                            key={i}
                            className='flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100'
                          >
                            <span className='flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-[#1A1C1E]'>
                              {i + 1}
                            </span>
                            <span className='text-sm text-slate-600 font-bold leading-relaxed'>
                              {q}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className='flex justify-between items-center pt-6 border-t border-slate-50'>
                    <button
                      onClick={() =>
                        setExpandedAssignment(
                          expandedAssignment === assignment.id
                            ? null
                            : assignment.id
                        )
                      }
                      className='flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-[#1A1C1E] transition-all'
                    >
                      {expandedAssignment === assignment.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                      {expandedAssignment === assignment.id
                        ? 'Show Less'
                        : 'Show More'}
                    </button>
                    <div className='flex gap-4'>
                      <button
                        onClick={() => prepareEditAssignment(assignment)}
                        className='flex items-center gap-2 px-6 py-3 border border-slate-100 text-[#2563EB] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all'
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className='flex items-center gap-2 px-6 py-3 border border-slate-100 text-[#E74C3C] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all'
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {activeTab === 'Submissions' && (
            <div className='space-y-8'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <StatCard
                  title='Total Submissions'
                  value={submissions.length.toString()}
                  icon={<BookOpen size={20} />}
                  variant='default'
                />
                <StatCard
                  title='Pending Review'
                  value={submissions
                    .filter((s) => s.status === 'submitted')
                    .length.toString()}
                  icon={<Clock size={20} />}
                  variant='gold'
                />
                <StatCard
                  title='Late Submissions'
                  value={submissions.filter((s) => s.isLate).length.toString()}
                  icon={<AlertCircle size={20} />}
                  variant='red'
                />
                <StatCard
                  title='Online Submissions'
                  value={submissions
                    .filter(
                      (s) =>
                        s.type === 'online_by_member' ||
                        s.type === 'online_by_leader'
                    )
                    .length.toString()}
                  icon={<Globe size={20} />}
                  variant='default'
                />
              </div>

              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className='bg-white border border-slate-200 rounded-xl p-8 space-y-8 hover:shadow-xl transition-shadow group'
                >
                  <div className='flex justify-between items-start'>
                    <div>
                      <h3 className='text-2xl font-black text-[#1A1C1E] tracking-tight'>
                        {sub.assignmentTitle}
                      </h3>
                      <p className='text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest flex items-center gap-2'>
                        <Calendar size={14} /> {sub.week}
                      </p>
                    </div>
                    <span className='px-5 py-2 bg-orange-50 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-orange-100 shadow-sm'>
                      Pending Review
                    </span>
                  </div>

                  <div className='flex items-center gap-8 py-6 bg-slate-50/50 rounded-xl px-8 border border-slate-50'>
                    <div className='w-20 h-20 rounded-lg bg-white border-4 border-white shadow-lg flex items-center justify-center text-[#1A1C1E] font-black text-2xl'>
                      {sub.member.substring(0, 2).toUpperCase()}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-4'>
                        <h4 className='text-xl font-black text-[#1A1C1E] tracking-tight'>
                          {sub.member}{' '}
                          <span className='text-slate-400 font-bold'>
                            (worker)
                          </span>
                        </h4>
                        <span className='px-4 py-1.5 bg-[#2563EB]/10 text-[#2563EB] rounded-full text-[9px] font-black uppercase tracking-[0.1em]'>
                          Worker in Training
                        </span>
                      </div>
                      <div className='flex items-center gap-6 mt-3'>
                        <p className='text-sm font-bold text-slate-500 flex items-center gap-2'>
                          <Phone size={14} className='text-slate-300' />{' '}
                          {sub.phone}
                        </p>
                        <p className='text-sm font-bold text-slate-500 flex items-center gap-2'>
                          <Mail size={14} className='text-slate-300' />{' '}
                          {sub.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-between items-center border-t border-slate-50 pt-8'>
                    <button className='flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-[#2563EB] hover:scale-105 transition-transform group-hover:underline'>
                      <ExternalLinkIcon size={18} /> View Student Submission
                    </button>
                    <button
                      onClick={() =>
                        setExpandedSubmission(
                          expandedSubmission === sub.id ? null : sub.id
                        )
                      }
                      className='flex items-center gap-3 px-8 py-3 bg-[#1A1C1E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:shadow-black/20 transition-all'
                    >
                      {expandedSubmission === sub.id
                        ? 'Collapse Review Terminal'
                        : 'Expand Review Terminal'}
                      {expandedSubmission === sub.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>

                  {expandedSubmission === sub.id && (
                    <div className='mt-10 space-y-10 animate-in slide-in-from-top-6 duration-700'>
                      <div className='space-y-4'>
                        <h5 className='text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1C1E] flex items-center gap-2'>
                          <FileText size={16} className='text-[#CCA856]' />{' '}
                          Student Notes:
                        </h5>
                        <div className='p-8 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-600 leading-relaxed min-h-[100px]'>
                          "The study session was insightful. I focused on the
                          application of loyalty in everyday service within the
                          ushering department."
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                        <div className='space-y-4'>
                          <label className='text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1C1E]'>
                            Assignment Grade (%):
                          </label>
                          <div className='flex items-center gap-4'>
                            <input
                              type='number'
                              placeholder='0'
                              value={gradeForm.score}
                              onChange={(e) =>
                                setGradeForm({
                                  ...gradeForm,
                                  score: e.target.value,
                                })
                              }
                              className='w-32 px-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-black text-2xl text-center focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all shadow-inner'
                            />
                            <div className='text-3xl font-black text-slate-300'>
                              %
                            </div>
                          </div>
                        </div>
                        <div className='space-y-4'>
                          <label className='text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1C1E]'>
                            Grader Feedback Notes:
                          </label>
                          <textarea
                            placeholder='Add constructive feedback...'
                            value={gradeForm.feedback}
                            onChange={(e) =>
                              setGradeForm({
                                ...gradeForm,
                                feedback: e.target.value,
                              })
                            }
                            className='w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none min-h-[150px] text-sm font-bold focus:border-[#2563EB] transition-all shadow-inner'
                          ></textarea>
                        </div>
                      </div>

                      <div className='flex gap-6 pt-4'>
                        <button
                          onClick={() => handleRequestRedo(sub.id)}
                          className='flex-1 py-5 border border-red-100 text-red-500 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-all'
                        >
                          Request Redo
                        </button>
                        <button
                          onClick={() => handleGradeSubmission(sub.id)}
                          className='flex-1 py-5 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-green-500/30 hover:bg-green-600 hover:scale-[1.02] transition-all'
                        >
                          Publish Grade & Approve
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'History' && (
            <div className='space-y-8'>
              {history.map((item) => (
                <div
                  key={item.id}
                  className='bg-white border border-slate-100 rounded-2xl p-10 space-y-8 relative overflow-hidden group'
                >
                  <div className='absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50'></div>

                  <div className='flex justify-between items-start relative z-10'>
                    <div>
                      <h3 className='text-2xl font-black text-[#1A1C1E] tracking-tight'>
                        {item.title}
                      </h3>
                      <p className='text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest'>
                        {item.week}
                      </p>
                    </div>
                    <div className='flex flex-col items-end gap-2'>
                      <span className='px-5 py-2 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm'>
                        {item.status}
                      </span>
                      <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                        Graded by{' '}
                        <span className='text-slate-600'>{item.gradedBy}</span>
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-6 relative z-10'>
                    <div className='w-16 h-16 rounded-lg bg-[#1A1C1E] flex items-center justify-center text-white font-black text-xl shadow-lg'>
                      {item.member
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3'>
                        <h4 className='text-lg font-black text-[#1A1C1E]'>
                          {item.member}
                        </h4>
                        <span className='px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-100'>
                          {item.role}
                        </span>
                      </div>
                      <div className='flex items-center gap-4 mt-1'>
                        <p className='text-xs font-bold text-slate-400'>
                          {item.phone} • {item.email}
                        </p>
                        <span className='w-1.5 h-1.5 rounded-full bg-slate-200'></span>
                        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1'>
                          <Calendar size={12} /> {item.submitted}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10'>
                    <div className='bg-blue-50/50 border border-blue-100 rounded-xl p-8'>
                      <div className='flex items-start gap-4'>
                        <Info
                          className='text-[#2563EB] flex-shrink-0 mt-1'
                          size={20}
                        />
                        <div>
                          <p className='text-[11px] font-black text-[#1A1C1E] uppercase tracking-[0.2em] mb-2'>
                            Reviewer Feedback:
                          </p>
                          <p className='text-sm font-bold text-slate-500 italic'>
                            "{item.feedback}"
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='bg-slate-50 border border-slate-100 rounded-xl p-8 flex flex-col justify-center gap-4'>
                      <div className='flex items-center justify-between'>
                        <p className='text-[11px] font-black text-[#1A1C1E] uppercase tracking-[0.2em]'>
                          Assignment Access:
                        </p>
                        <div className='px-4 py-1 bg-white rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100 text-slate-400'>
                          PDF Document
                        </div>
                      </div>
                      <a
                        href={item.link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#1A1C1E] hover:bg-[#1A1C1E] hover:text-white transition-all group shadow-sm'
                      >
                        <ExternalLink
                          size={16}
                          className='group-hover:scale-110 transition-transform'
                        />
                        View Submission Content
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              {history.filter(
                (h) => h.status === 'Graded' || h.status === 'Approved'
              ).length === 0 && (
                <div className='py-20 text-center'>
                  <p className='text-slate-400 font-bold italic'>
                    No graded assignments in historical records.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Assignment Creation Modal */}
      <Modal
        isOpen={isAddAssignmentOpen}
        onClose={() => {
          setIsAddAssignmentOpen(false);
          setIsAddAssignmentOpen(false);
          setAssignmentForm({
            id: '',
            title: '',
            status: 'Active',
            summary: '',
            link: '',
            dueDate: '',
            dueTime: '',
            weekStartDate: '',
            weekEndDate: '',
            questions: '',
          });
        }}
        title={assignmentForm.id ? 'Edit Assignment' : 'Create New Assignment'}
        size='lg'
      >
        <div className='p-10 space-y-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='space-y-2'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400'>
                Assignment Title *
              </label>
              <input
                type='text'
                placeholder='Enter assignment title'
                className='w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-lg focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all shadow-inner'
                value={assignmentForm.title}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400'>
                Assignment Status *
              </label>
              <div className='relative'>
                <select
                  className='w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-sm appearance-none focus:border-[#2563EB] transition-all shadow-inner'
                  value={assignmentForm.status}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      status: e.target.value,
                    })
                  }
                >
                  <option value='Active'>Active</option>
                  <option value='Upcoming'>Upcoming</option>
                  <option value='Past'>Past</option>
                </select>
                <ChevronDown
                  className='absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                  size={20}
                />
              </div>
            </div>
          </div>
          <div className='space-y-2'>
            <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400'>
              Title Summary *
            </label>
            <input
              type='text'
              placeholder='Brief description of the assignment'
              className='w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:border-[#2563EB] transition-all shadow-inner'
              value={assignmentForm.summary}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  summary: e.target.value,
                })
              }
            />
          </div>
          <div className='space-y-2'>
            <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400'>
              Resource Download Link (Optional)
            </label>
            <div className='relative'>
              <Download
                size={18}
                className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-300'
              />
              <input
                type='text'
                placeholder='https://example.com/download-link'
                className='w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:border-[#2563EB] transition-all shadow-inner'
                value={assignmentForm.link}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, link: e.target.value })
                }
              />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-8'>
            <div className='space-y-2'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400'>
                Week Start Date *
              </label>
              <div className='relative'>
                <Calendar
                  size={18}
                  className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-300'
                />
                <input
                  type='date'
                  className='w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-sm'
                  value={assignmentForm.weekStartDate}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      weekStartDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400'>
                Week End Date *
              </label>
              <div className='relative'>
                <Calendar
                  size={18}
                  className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-300'
                />
                <input
                  type='date'
                  className='w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-sm'
                  value={assignmentForm.weekEndDate}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      weekEndDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-8'>
            <div className='space-y-2'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400'>
                Submission Due Date *
              </label>
              <div className='relative'>
                <Calendar
                  size={18}
                  className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-300'
                />
                <input
                  type='date'
                  className='w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-sm'
                  value={assignmentForm.dueDate}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      dueDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400'>
                Due Time (24h) *
              </label>
              <div className='relative'>
                <Clock
                  size={18}
                  className='absolute left-6 top-1/2 -translate-y-1/2 text-slate-300'
                />
                <input
                  type='time'
                  className='w-full pl-10 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-sm'
                  value={assignmentForm.dueTime}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      dueTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className='space-y-2'>
            <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400'>
              Study Group Questions *
            </label>
            <textarea
              placeholder='Enter study questions, one per line'
              className='w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none min-h-[150px] font-bold text-sm focus:border-[#2563EB] transition-all shadow-inner'
              value={assignmentForm.questions}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  questions: e.target.value,
                })
              }
            ></textarea>
            <p className='text-[10px] text-slate-300 font-bold italic'>
              PRO TIP: Enter each question on a new line to auto-format student
              responses.
            </p>
          </div>
          <div className='flex justify-end gap-6 pt-6 border-t border-slate-50'>
            <button
              onClick={() => setIsAddAssignmentOpen(false)}
              className='px-10 py-4 bg-white border border-slate-200 rounded-[20px] text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOrUpdateAssignment}
              className='px-10 py-4 bg-[#E74C3C] text-white rounded-[20px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-red-600'
            >
              {assignmentForm.id ? 'Save Changes' : 'Publish Assignment'}
            </button>
          </div>
        </div>
      </Modal>

      {/* New Submission Modal */}
      <Modal
        isOpen={isAddSubmissionOpen}
        onClose={() => {
          setIsAddSubmissionOpen(false);
          setMemberModalSearch('');
          setShowMemberModalSuggestions(false);
        }}
        title='Upload an Assignment'
        size='lg'
      >
        <div className='p-10 space-y-8'>
          <div>
            <p className='text-slate-400 text-sm font-bold'>
              Kindly fill in details of assignment below
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-2'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 text-red-500'>
                Church *
              </label>
              <div className='relative'>
                <select
                  className='w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none font-bold text-xs appearance-none focus:border-[#2563EB] transition-all shadow-inner'
                  value={submissionForm.church}
                  onChange={(e) =>
                    setSubmissionForm({
                      ...submissionForm,
                      church: e.target.value,
                      fellowship: 'None',
                      cell: 'None',
                    })
                  }
                >
                  <option value=''>Select a church</option>
                  {churches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                  size={16}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2'>
                Fellowship
              </label>
              <div className='relative'>
                <select
                  className='w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none font-bold text-xs appearance-none focus:border-[#2563EB] transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed'
                  value={submissionForm.fellowship}
                  onChange={(e) =>
                    setSubmissionForm({
                      ...submissionForm,
                      fellowship: e.target.value,
                      cell: 'None',
                    })
                  }
                  disabled={!submissionForm.church}
                >
                  <option value='None'>None</option>
                  {fellowships
                    .filter(
                      (f) =>
                        !submissionForm.church ||
                        f.church_id == submissionForm.church
                    )
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                </select>
                <ChevronDown
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                  size={16}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2'>
                Cell
              </label>
              <div className='relative'>
                <select
                  className='w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none font-bold text-xs appearance-none focus:border-[#2563EB] transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed'
                  value={submissionForm.cell}
                  onChange={(e) =>
                    setSubmissionForm({
                      ...submissionForm,
                      cell: e.target.value,
                    })
                  }
                  disabled={
                    !submissionForm.fellowship ||
                    submissionForm.fellowship === 'None'
                  }
                >
                  <option value='None'>None</option>
                  {cells
                    .filter((c) => {
                      const matchesFellowship =
                        submissionForm.fellowship !== 'None'
                          ? c.fellowship_id == submissionForm.fellowship
                          : true;
                      return matchesFellowship;
                    })
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <ChevronDown
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                  size={16}
                />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Searchable Member Field */}
            <div className='space-y-2 relative'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 text-red-500'>
                Member *
              </label>
              <div className='relative group'>
                <UserSearch
                  className={`absolute left-5 top-1/2-translate-y-1/2 transition-colors ${submissionForm.member ? 'text-[#CCA856]' : 'text-slate-300'}`}
                  size={18}
                />
                <input
                  type='text'
                  placeholder={
                    submissionForm.church
                      ? 'Search for a member...'
                      : 'Select a church first'
                  }
                  disabled={!submissionForm.church}
                  className='w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none font-bold text-xs focus:border-[#2563EB] transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed'
                  value={submissionForm.member || memberModalSearch}
                  onChange={(e) => {
                    setMemberModalSearch(e.target.value);
                    if (submissionForm.member)
                      setSubmissionForm({ ...submissionForm, member: '' });
                    setShowMemberModalSuggestions(true);
                  }}
                  onFocus={() =>
                    submissionForm.church && setShowMemberModalSuggestions(true)
                  }
                />
                {submissionForm.member && (
                  <button
                    onClick={() => {
                      setSubmissionForm({ ...submissionForm, member: '' });
                      setMemberModalSearch('');
                    }}
                    className='absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-all'
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Suggestions List */}
              {showMemberModalSuggestions && submissionForm.church && (
                <>
                  <div
                    className='fixed inset-0 z-30'
                    onClick={() => setShowMemberModalSuggestions(false)}
                  />
                  <div className='absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'>
                    {filteredModalMembers.length > 0 ? (
                      filteredModalMembers.map((m) => (
                        <button
                          key={m.name}
                          onClick={() => {
                            setSubmissionForm({
                              ...submissionForm,
                              member: m.name,
                            });
                            setMemberModalSearch(m.name);
                            setShowMemberModalSuggestions(false);
                          }}
                          className='w-full text-left px-6 py-4 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1A1C1E] transition-all flex items-center justify-between border-b border-slate-50 last:border-0'
                        >
                          <div className='flex flex-col'>
                            <span className='font-black uppercase tracking-wider'>
                              {m.name}
                            </span>
                            <span className='text-[9px] text-slate-400 font-medium'>
                              {m.fellowship} • {m.cell}
                            </span>
                          </div>
                          <ChevronRight size={14} className='text-slate-300' />
                        </button>
                      ))
                    ) : (
                      <div className='px-6 py-4 text-[10px] font-bold text-slate-400 italic'>
                        No members found matching "{memberModalSearch}"
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className='space-y-2'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 text-red-500'>
                Select Assignment *
              </label>
              <div className='relative'>
                <select
                  className='w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none font-bold text-xs appearance-none focus:border-[#2563EB] transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={!submissionForm.church}
                  value={submissionForm.assignment}
                  onChange={(e) =>
                    setSubmissionForm({
                      ...submissionForm,
                      assignment: e.target.value,
                    })
                  }
                >
                  <option value=''>
                    {submissionForm.church
                      ? 'Select assignment'
                      : 'Select a church first'}
                  </option>
                  {studyGroupAssignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                  size={16}
                />
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-fit'>
              <button
                onClick={() =>
                  setSubmissionForm({
                    ...submissionForm,
                    isOffline: !submissionForm.isOffline,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${submissionForm.isOffline ? 'bg-red-500' : 'bg-slate-300'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${submissionForm.isOffline ? 'left-7' : 'left-1'}`}
                />
              </button>
              <span className='text-xs font-black uppercase tracking-widest text-slate-600'>
                Offline Submission?
              </span>
            </div>

            {!submissionForm.isOffline && (
              <div className='space-y-2 animate-in fade-in slide-in-from-top-2 duration-300'>
                <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 text-red-500'>
                  Submission Link *
                </label>
                <div className='relative'>
                  <Link2
                    className='absolute left-5 top-1/2 -translate-y-1/2 text-slate-300'
                    size={18}
                  />
                  <input
                    type='text'
                    placeholder='Enter submission link (e.g., https://docs.google.com/...)'
                    className='w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none font-bold text-xs focus:border-[#2563EB] transition-all shadow-inner'
                    value={submissionForm.link}
                    onChange={(e) =>
                      setSubmissionForm({
                        ...submissionForm,
                        link: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <label className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2'>
                Notes (Optional)
              </label>
              <textarea
                placeholder='Add any additional notes or feedback...'
                className='w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-bold text-xs focus:border-[#2563EB] transition-all shadow-inner min-h-[100px]'
                value={submissionForm.notes}
                onChange={(e) =>
                  setSubmissionForm({
                    ...submissionForm,
                    notes: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className='flex justify-end gap-4 pt-6 border-t border-slate-50'>
            <button
              onClick={() => {
                setIsAddSubmissionOpen(false);
                setMemberModalSearch('');
                setShowMemberModalSuggestions(false);
              }}
              className='px-8 py-3.5 bg-white border border-slate-200 rounded-[20px] text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAssignment}
              className='px-10 py-3.5 bg-[#1A1C1E] text-white rounded-[20px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-slate-800'
            >
              Create Submission
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/**
 * MODULE: PRAYER GROUP
 */
const PrayerModule = () => {
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Prayer Meetings' | 'Prayer Submissions'
  >('Overview');
  const [meetingPeriod, setMeetingPeriod] = useState(
    'Friday Evening Prayer Meeting'
  );
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);
  const [meetingsFilter, setMeetingsFilter] = useState<'Past' | 'Ongoing'>(
    'Ongoing'
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

  const meetingPeriods = [
    'Monday Evening',
    'Tuesday Morning',
    'Tuesday Evening',
    'Wednesday Morning',
    'Thursday Morning',
    'Thursday Evening',
    'Friday Morning',
    'Friday Evening',
    'Saturday Morning',
    'Sunday',
  ];

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

  // Fetch Prayer Meetings
  const fetchMeetings = async () => {
    try {
      setIsLoadingMeetings(true);
      const data = await prayerGroupAPI.getAllMeetings();
      // Map backend data to frontend format
      const mapped = data.map((m: any) => ({
        id: m.id || m.prayergroup_id || Math.random(),
        day: m.prayergroup_day || m.day || 'Unknown Day',
        time:
          m.start_time && m.end_time
            ? `${m.start_time} - ${m.end_time}`
            : m.time || '00:00 - 00:00',
        church: m.church_name || 'Isolo Church',
        participants: m.attendees?.length || m.participants || 0,
        status: m.status || 'Ongoing',
        code: m.prayer_code || m.code || '------',
        expiresAt: m.expiresAt || Date.now() + 2 * 3600000, // Fallback expiry
      }));
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

  // Mock Submissions
  const submissions = [
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
        { name: 'Robert', cell: 'Unit 1' },
        { name: 'Mary J.', cell: 'Unit 2' },
        { name: 'Chinwe Onwe', cell: 'Unit 1' },
        { name: 'Gbemi Goriola', cell: 'Unit 3' },
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
  ];

  const handleGenerateCode = async () => {
    try {
      // Backend expects: { start_time, end_time, prayergroup_day, period, prayergroup_leader, ... }
      // We will assume defaults or derive from current state
      const meetingData = {
        prayergroup_day: meetingPeriod.replace(' Prayer Meeting', ''),
        start_time: '21:00', // Default
        end_time: '23:00', // Default
        period: 'Evening', // derived from meetingPeriod if possible
        prayergroup_leader: 'Current User', // Backend might override this
      };

      await prayerGroupAPI.createMeeting(meetingData);
      // Refresh list
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
      <div className='flex justify-between items-center'>
        <div className='relative'>
          <button
            onClick={() => setIsPeriodSelectorOpen(!isPeriodSelectorOpen)}
            className='flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all group'
          >
            <div className='w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#E74C3C]'>
              <Clock3 size={20} />
            </div>
            <span className='text-base font-black text-[#1A1C1E] uppercase tracking-wider'>
              {meetingPeriod}
            </span>
            <ChevronDown
              size={20}
              className={`text-slate-400 group-hover:text-[#1A1C1E] transition-transform ${isPeriodSelectorOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isPeriodSelectorOpen && (
            <>
              <div
                className='fixed inset-0 z-40'
                onClick={() => setIsPeriodSelectorOpen(false)}
              ></div>
              <div className='absolute top-full left-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 animate-in slide-in-from-top-2'>
                {meetingPeriods.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setMeetingPeriod(p + ' Prayer Meeting');
                      setIsPeriodSelectorOpen(false);
                    }}
                    className='w-full text-left px-5 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl text-slate-500 hover:bg-slate-50 hover:text-[#1A1C1E] transition-all'
                  >
                    {p}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {activeTab === 'Prayer Meetings' && (
          <button
            onClick={handleGenerateCode}
            className='flex items-center gap-2 px-6 py-3 bg-[#E74C3C] text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all'
          >
            <Zap size={18} /> Generate Prayer Code
          </button>
        )}
      </div>

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
              {(['Ongoing', 'Past'] as const).map((f) => (
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
                    Time
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
                {prayerMeetings
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
                          <span className='text-xs font-black text-[#1A1C1E] font-mono tracking-widest'>
                            {meeting.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${getTimerDisplay(meeting.expiresAt) === 'EXPIRED' ? 'text-red-500' : 'text-slate-400'}`}
                          >
                            {getTimerDisplay(meeting.expiresAt)}
                          </span>
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
                value='07:00'
                icon={<Clock size={20} />}
                variant='default'
              />
              <StatCard
                title='Time Ended'
                value='10:00'
                icon={<Clock3 size={20} />}
                variant='default'
              />
              <StatCard
                title='Date'
                value='3 Jan 2026'
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
              <button
                onClick={() => {
                  setSelectedFellowships([]);
                  setSelectedCells([]);
                  setSelectedParticipants([]);
                  setIsAddParticipantOpen(true);
                }}
                className='flex items-center gap-2 px-8 py-4 bg-[#1A1C1E] text-white rounded-xl font-black text-xs uppercase tracking-widest'
              >
                <Plus size={18} /> Add Participant
              </button>
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
                onClick={() => setReviewingSubmission(null)}
                className='flex-1 py-5 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-50 hover:border-red-100 transition-all'
              >
                Reject Entire Batch
              </button>
              <button
                onClick={() => setReviewingSubmission(null)}
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
                {/* Simulated unit breakdown */}
                <div className='p-8 bg-white border border-slate-100 rounded-2xl shadow-sm'>
                  <div className='flex justify-between items-center mb-6'>
                    <span className='text-base font-black text-[#1A1C1E]'>
                      Oke-afa Cell 1
                    </span>
                    <span className='text-xs font-black text-[#CCA856] uppercase tracking-widest'>
                      Participants: 3
                    </span>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    {detailsSubmission.participants.map(
                      (p: any, idx: number) => (
                        <div key={idx} className='flex items-center gap-3'>
                          <div className='w-2 h-2 rounded-full bg-green-500'></div>
                          <span className='text-sm font-bold text-slate-600'>
                            {p.name}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(!!getAuthToken());
  const [activeModule, setActiveModule] = useState<string>('Church Meetings');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  const navItems = [
    {
      id: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
    },
    { id: 'Analytics', icon: <TrendingUp size={18} />, label: 'Analytics' },
    {
      id: 'Church Meetings',
      icon: <Building2 size={18} />,
      label: 'Church Meetings',
    },
    { id: 'Evangelism', icon: <List size={18} />, label: 'Evangelism' },
    { id: 'Follow Up', icon: <UserPlus size={18} />, label: 'Follow Up' },
    { id: 'Prayer Group', icon: <Zap size={18} />, label: 'Prayer Group' },
    { id: 'Study Group', icon: <Sliders size={18} />, label: 'Study Group' },
    { id: 'Settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className='flex min-h-screen bg-white font-sans selection:bg-[#CCA856]/30'>
      <aside className='w-[280px] fixed inset-y-0 left-0 bg-white flex flex-col pt-10 z-50 border-r border-slate-100'>
        <Logo className='px-10 mb-16' />
        <nav className='flex-1 flex flex-col space-y-1'>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`group flex items-center w-full py-3.5 pl-10 pr-6 relative transition-all duration-300 ${activeModule === item.id ? 'text-[#1A1C1E]' : 'text-[#64748b] hover:bg-[#F8F9FA]'}`}
            >
              {activeModule === item.id && (
                <div className='absolute left-0 top-1 bottom-1 w-[4px] bg-[#CCA856] rounded-r'></div>
              )}
              <div
                className={`mr-4 transition-colors ${activeModule === item.id ? 'text-[#1A1C1E]' : 'text-[#64748b] opacity-70 group-hover:opacity-100'}`}
              >
                {item.icon}
              </div>
              <span
                className={`text-sm tracking-tight ${activeModule === item.id ? 'font-black' : 'font-semibold'}`}
              >
                {item.label}
              </span>
            </button>
          ))}
          <div className='mt-auto pb-8'>
            <button
              onClick={handleLogout}
              className='group flex items-center w-full py-4 pl-10 pr-6 text-[#64748b] hover:bg-[#F8F9FA] transition-all'
            >
              <LogOut
                size={18}
                className='mr-4 opacity-70 group-hover:opacity-100'
              />
              <span className='text-sm font-semibold tracking-tight'>
                Sign Out
              </span>
            </button>
          </div>
        </nav>
      </aside>
      <main className='flex-1 ml-[280px] bg-[#FAFAFA] min-h-screen p-12'>
        <header className='flex justify-between items-center mb-12'>
          <div className='flex flex-col'>
            <h1 className='text-2xl font-black text-[#1A1C1E] tracking-tight'>
              🌟 Hello!
            </h1>
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-70'>
              Admin HQ / {activeModule}
            </p>
          </div>
          <div className='flex items-center gap-6'>
            <div className='relative group'>
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors'
                size={18}
              />
              <input
                type='text'
                placeholder='Find records...'
                className='pl-12 pr-6 py-2.5 bg-white border border-slate-200 rounded outline-none font-bold text-sm w-[300px] shadow-sm focus:ring-1 focus:ring-[#CCA856]/20 transition-all'
              />
            </div>
            <button className='p-3 bg-white rounded border border-slate-200 shadow-sm text-slate-400 hover:text-[#1A1C1E] relative transition-all'>
              <Bell size={20} />
              <div className='absolute top-2 right-2 w-2 h-2 bg-[#E74C3C] rounded-full border border-white'></div>
            </button>
            <div className='w-12 h-12 rounded border-2 border-white shadow shadow-slate-200 overflow-hidden flex-shrink-0'>
              <img
                src='https://picsum.photos/seed/pastor/200'
                className='w-full h-full object-cover'
                alt='User'
              />
            </div>
          </div>
        </header>
        <div className='max-w-[1300px] mx-auto pb-20'>
          {activeModule === 'Dashboard' && <DashboardModule />}
          {activeModule === 'Analytics' && <AnalyticsModule />}
          {activeModule === 'Evangelism' && <EvangelismModule />}
          {activeModule === 'Follow Up' && <FollowUpModule />}
          {activeModule === 'Church Meetings' && <ChurchMeetingsModule />}
          {activeModule === 'Study Group' && <StudyGroupModule />}
          {activeModule === 'Prayer Group' && <PrayerModule />}
        </div>
      </main>
    </div>
  );
};

export default App;
