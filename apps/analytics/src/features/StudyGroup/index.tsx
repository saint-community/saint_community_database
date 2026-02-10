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
import ExternalLinkIcon from '../../components/ExternalLinkIcon';
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
const StudyGroupModule = ({ user, selectedChurch }: { user: any; selectedChurch: any }) => {
  // const { user, selectedChurch } = useOutletContext<any>(); // Removed: App uses conditional rendering, not Outlet
  const [activeTab, setActiveTab] = useState<
    'Assignments' | 'Submissions' | 'History'
  >('Assignments');
  /* 
   * FIX: Renamed back to isAddAssignmentOpen to match usages throughout the file 
   */
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
    church: user?.church_id?.toString() || user?.admin_meta?.church_id?.toString() || '',
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
      if (user?.church_id) {
        setSubmissionForm(prev => ({ ...prev, church: user.church_id.toString() }));
      }
      // Keep existing logic as fallback
      const token = getAuthToken(); // JWT Token for NestJS/Admin
      if (token) {
        const decoded = parseJwt(token);
        const adminMeta = decoded?.admin_meta;
        if (adminMeta) {
          const { role, church_id, fellowship_id, cell_id } = adminMeta;

          setSubmissionForm((prev) => {
            let updates: any = {};
            if (church_id && !prev.church) updates.church = church_id.toString(); // Only set if empty

            // Auto-fill fellowship and cell irrespective of role if available
            if (fellowship_id && !prev.fellowship || prev.fellowship === 'None') {
              updates.fellowship = fellowship_id.toString();
            }
            if (cell_id && !prev.cell || prev.cell === 'None') {
              updates.cell = cell_id.toString();
            }

            // Also check for flat user object properties
            if (user?.fellowship_id && (!prev.fellowship || prev.fellowship === 'None')) {
              updates.fellowship = user.fellowship_id.toString();
            }
            if (user?.cell_id && (!prev.cell || prev.cell === 'None')) {
              updates.cell = user.cell_id.toString();
            }

            return { ...prev, ...updates };
          });
        }
      }
    }
  }, [isAddSubmissionOpen, user]);
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
        // Use user.churches if available to avoid 403 on /churches/all
        (user?.churches && user.churches.length > 0) ? Promise.resolve(user.churches) : structureAPI.getChurches().catch(e => []),
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
  }, [user]);

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
  /* 
   * FIX: Pass selectedChurch to usage of API so we fetch data for the intended church, 
   * not just the user's home church.
   */
  const fetchStudyGroupData = async () => {
    try {
      setIsLoadingStudyGroup(true);
      // Use selectedChurch if available, or fall back to user's church
      const targetChurchId = selectedChurch ? Number(selectedChurch) : (user?.church_id || user?.admin_meta?.church_id);

      console.log('DEBUG: Fetching StudyGroup data for church:', targetChurchId);

      const [assignments, current, subs] = await Promise.all([
        studyGroupAPI.getAllAssignments(targetChurchId),
        studyGroupAPI.getCurrentAssignment(targetChurchId).catch((err) => {
          console.warn('No current assignment found, continuing...', err);
          return null;
        }),
        studyGroupAPI.getSubmissions(targetChurchId),
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
      const mappedSubmissions = subs.map((s: any) => {
        // Try to find assignment title from the just-fetched assignments list
        const relatedAssignment = assignments.find((a: any) => a.id === s.study_group_id);
        const derivedTitle = relatedAssignment ? relatedAssignment.title : 'Unknown Assignment';

        return {
          id: s._id || s.id, // Handle MongoDB _id
          studyGroupId: s.study_group_id,
          memberId: s.member_id,
          assignmentTitle: s.study_group_title || s.assignment_title || derivedTitle,
          submittedBy: s.member_name || 'Unknown Member', // Will enrich this in render if still unknown
          phone: s.member_phone || '',
          email: s.member_email || '',
          date: s.created_at || new Date().toISOString(),
          status: s.status || 'Pending',
          week: s.week_number ? `Week ${s.week_number}` : (s.week ? `Week ${s.week}` : 'Week --'),
          member: s.member_name || 'Unknown Member',
          studentNotes: s.content || '',
          isLate: s.is_late,
          type: s.submission_method,
        };
      });
      setSubmissions(mappedSubmissions);
    } catch (error) {
      console.error('Failed to fetch study group data', error);
    } finally {
      setIsLoadingStudyGroup(false);
    }
  };

  useEffect(() => {
    fetchStudyGroupData();
  }, [selectedChurch]); // Refetch when church changes

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
      // FIX: Revert to only showing processed submissions in History
      return ['graded', 'approved'].includes(status);
    })
    .map((s) => {
      // Enrich member name if unknown
      let memberName = s.member;
      if (memberName === 'Unknown Member' && s.memberId) {
        const foundMember = members.find((m: any) => (m._id === s.memberId || m.id === s.memberId));
        if (foundMember) {
          memberName = foundMember.first_name || foundMember.last_name
            ? `${foundMember.first_name || ''} ${foundMember.last_name || ''}`.trim()
            : foundMember.email;
        }
      }

      return {
        id: s.id,
        title: s.assignmentTitle,
        week: s.week,
        member: memberName,
        role: 'Member',
        phone: s.phone,
        email: s.email,
        submitted: new Date(s.date).toLocaleString(),
        type: 'Online By Member',
        status: s.status,
        feedback: 'No feedback provided.',
        gradedBy: 'Admin',
        link: '#',
      };
    });

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
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${assignment.status === 'Active'
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

              {submissions
                .filter(
                  (s) =>
                    s.status !== 'graded' &&
                    s.status !== 'approved' &&
                    s.status !== 'Approved'
                )
                .map((sub) => (
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
                      <span
                        className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${sub.status === 'late'
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-orange-50 text-orange-600 border-orange-100'
                          }`}
                      >
                        {sub.status === 'late'
                          ? 'Late Submission'
                          : 'Pending Review'}
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
export default StudyGroupModule;
