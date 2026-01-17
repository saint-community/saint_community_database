
import { EvangelismSession, FollowUpSession, AttendanceRecord, ChartData, Meeting, AttendanceSubmission, FunnelData, HeatmapData } from '../types';

export const mockMeetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Global Sunday Service',
    type: 'Sunday Service',
    frequency: 'Weekly',
    scope: 'Church-wide',
    time: '08:00',
    location: 'Main Auditorium',
    assignedEntities: ['All Members'],
    status: 'Active'
  },
  {
    id: 'meet-2',
    title: 'Grace Fellowship Midweek',
    type: 'Midweek Service',
    frequency: 'Weekly',
    scope: 'Fellowship',
    time: '18:00',
    location: 'Grace Hall',
    assignedEntities: ['Grace Fellowship'],
    status: 'Active'
  }
];

export const mockAttendanceSubmissions: AttendanceSubmission[] = [
  {
    id: 'sub-1',
    meetingId: 'meet-1',
    meetingTitle: 'Global Sunday Service',
    submittedBy: 'Pastor Robert, Gbenga Adeniji, Funmi Adeniji',
    date: '2024-05-19',
    participants: ['Sarah Smith', 'James O.', 'Mary J.', 'Aanu Lawson', 'Chinwe Onwe', 'Gbemi Goriola', 'Stephen King', 'Victor L.', 'Tunde G.'],
    firstTimers: ['Alex Great', 'Razak Okoya', 'Bola Ahmed Tinubu', 'Layal Tinubu'],
    code: '123456',
    status: 'Approved',
    createdAt: '2024-05-19T10:30:00Z'
  },
  {
    id: 'sub-2',
    meetingId: 'meet-2',
    meetingTitle: 'Grace Fellowship Midweek',
    submittedBy: 'Sarah Smith, Pastor John',
    date: '2024-05-15',
    participants: ['John Doe', 'Sarah Miller', 'David K.', 'Chioma N.'],
    firstTimers: ['Joy E.'],
    code: '654321',
    status: 'Approved',
    createdAt: '2024-05-15T19:00:00Z'
  },
  {
    id: 'sub-pending-1',
    meetingId: 'meet-1',
    meetingTitle: 'Sunday Celebration',
    submittedBy: 'Michael B.',
    date: '2024-05-26',
    participants: ['Joy E.', 'Kelechi U.'],
    firstTimers: ['New Soul 1'],
    code: 'PEND-001',
    status: 'Pending',
    createdAt: '2024-05-26T12:00:00Z'
  }
];

export const mockEvangelismSessions: EvangelismSession[] = [
  {
    id: 'session-101',
    date: '2024-05-10',
    time: '14:30',
    location: 'Oregun Mall',
    participants: ['John Doe', 'Sarah Smith'],
    createdAt: '2024-05-10T15:00:00Z',
    records: [
      {
        id: 'rec-1',
        personReached: 'Sarah Miller',
        gender: 'Female',
        age: 28,
        phone: '08012345678',
        address: '12 Alausa Way, Ikeja',
        isSaved: true,
        isFilled: true,
        isHealed: false,
        comments: 'Very open to coming to church on Sunday.'
      },
      {
        id: 'rec-2',
        personReached: 'James O.',
        gender: 'Male',
        age: 31,
        phone: '08099887766',
        address: '15 Alausa Way, Ikeja',
        isSaved: true,
        isFilled: false,
        isHealed: true,
        healedConditionBefore: 'Migraine',
        healedConditionAfter: 'Pain vanished',
        comments: 'Testified immediately.'
      }
    ]
  }
];

export const mockFollowUpSessions: FollowUpSession[] = [
  {
    id: 'fu-session-1',
    date: '2024-05-14',
    worker: 'Pastor Robert',
    participants: ['Pastor Robert'],
    createdAt: '2024-05-14T10:00:00Z',
    records: [
      {
        id: 'fu-rec-1',
        personFollowedUp: 'Sarah Miller',
        subjectTaught: 'The Nature of God',
        materialSource: 'Written Note',
        duration: '00:45:00',
        comments: 'Great session, she is ready for foundation school.'
      }
    ]
  }
];

export const evangelismMonthlyTrend: ChartData[] = [
  { name: 'Jan', value: 45, value2: 30 },
  { name: 'Feb', value: 52, value2: 40 },
  { name: 'Mar', value: 48, value2: 35 },
  { name: 'Apr', value: 70, value2: 50 },
  { name: 'May', value: 85, value2: 60 },
  { name: 'Jun', value: 65, value2: 45 },
  { name: 'Jul', value: 90, value2: 70 },
  { name: 'Aug', value: 75, value2: 55 },
  { name: 'Sep', value: 80, value2: 65 },
  { name: 'Oct', value: 95, value2: 75 },
  { name: 'Nov', value: 110, value2: 85 },
  { name: 'Dec', value: 130, value2: 100 },
];

export const mockAttendance: AttendanceRecord[] = [
  { id: '1', date: '2024-05-12', serviceType: 'Sunday Service', count: 450, recordedBy: 'Admin', fellowship: 'Grace Fellowship' }
];

export const attendanceTrend: ChartData[] = [
  { name: 'Week 1', value: 380 },
  { name: 'Week 2', value: 410 },
  { name: 'Week 3', value: 450 },
  { name: 'Week 4', value: 430 },
];

export const subjectDistribution: ChartData[] = [
  { name: 'Love of God', value: 40 },
  { name: 'Faith', value: 30 },
  { name: 'Holy Spirit', value: 20 },
  { name: 'Salvation', value: 10 },
];

export const attendanceComparisonData: ChartData[] = [
  { name: 'Sunday', value: 450 },
  { name: 'Midweek', value: 280 },
  { name: 'Fellowship', value: 120 },
  { name: 'Cell', value: 85 },
  { name: 'Campmeeting', value: 1200 },
  { name: 'Convention', value: 950 },
  { name: 'World Changers', value: 1100 },
];

export const conversionFunnel: FunnelData[] = [
  { stage: 'Outreach', count: 1250, percentage: 100, color: '#2D3E50' },
  { stage: 'First Visit', count: 850, percentage: 68, color: '#3E5C76' },
  { stage: 'Follow-Up', count: 520, percentage: 41, color: '#CCA856' },
  { stage: 'Member', count: 310, percentage: 24, color: '#E74C3C' }
];

export const memberTypeDistribution: ChartData[] = [
  { name: 'Regular Members', value: 850 },
  { name: 'New Believers', value: 120 },
  { name: 'First Timers', value: 45 },
  { name: 'Visitors', value: 25 }
];

export const weeklyHeatmap: HeatmapData[] = [
  { day: 'Mon', hour: '8am', value: 5 }, { day: 'Mon', hour: '12pm', value: 12 }, { day: 'Mon', hour: '6pm', value: 45 },
  { day: 'Tue', hour: '8am', value: 8 }, { day: 'Tue', hour: '12pm', value: 15 }, { day: 'Tue', hour: '6pm', value: 38 },
  { day: 'Wed', hour: '8am', value: 12 }, { day: 'Wed', hour: '12pm', value: 25 }, { day: 'Wed', hour: '6pm', value: 150 },
  { day: 'Thu', hour: '8am', value: 7 }, { day: 'Thu', hour: '12pm', value: 10 }, { day: 'Thu', hour: '6pm', value: 30 },
  { day: 'Fri', hour: '8am', value: 15 }, { day: 'Fri', hour: '12pm', value: 20 }, { day: 'Fri', hour: '6pm', value: 210 },
  { day: 'Sat', hour: '8am', value: 45 }, { day: 'Sat', hour: '12pm', value: 80 }, { day: 'Sat', hour: '6pm', value: 120 },
  { day: 'Sun', hour: '8am', value: 480 }, { day: 'Sun', hour: '12pm', value: 550 }, { day: 'Sun', hour: '6pm', value: 95 }
];

