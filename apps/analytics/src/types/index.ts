
export enum UserRole {
  PASTOR = 'Church Pastor',
  ADMIN = 'Church Admin',
  EVANGELISM_LEADER = 'Evangelism Leader',
  FOLLOW_UP_LEADER = 'Follow-Up Leader',
  ATTENDANCE_LEADER = 'Attendance Leader'
}

export type ModuleType = 'Dashboard' | 'Analytics' | 'Church Meetings' | 'Evangelism' | 'Follow Up' | 'Prayer' | 'Study Group' | 'Settings';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: UserRole[];
  profileImage?: string;
}

export interface EvangelismRecord {
  id: string;
  personReached: string;
  gender: 'Male' | 'Female';
  age: number;
  phone: string;
  address: string;
  isSaved: boolean;
  isFilled: boolean;
  isHealed: boolean;
  healedConditionBefore?: string;
  healedConditionAfter?: string;
  comments: string;
}

export interface EvangelismSession {
  id: string;
  date: string;
  time: string;
  location: string;
  participants: string[];
  records: EvangelismRecord[];
  createdAt: string;
}

export interface FollowUpRecord {
  id: string;
  personFollowedUp: string;
  subjectTaught: string;
  materialSource?: string;
  duration: string; // hh:mm:ss
  comments: string;
}

export interface FollowUpSession {
  id: string;
  date: string;
  time?: string;
  worker: string;
  location?: string;
  summary?: string;
  participants: string[];
  records: FollowUpRecord[];
  createdAt: string;
}

export type MeetingType =
  | 'Sunday Service'
  | 'Midweek Service'
  | 'Vigil'
  | 'Special Program'
  | 'Cell Meeting'
  | 'Fellowship Meeting'
  | 'Charis Campmeeting'
  | 'Believers Convention'
  | 'World Changers Conference'
  | 'Workers Convention'
  | 'Workers Meetings / Congresses'
  | 'Soul Winners Conference'
  | 'Fortress Campmeeting';

export type MeetingFrequency = 'Weekly' | 'Monthly' | 'Yearly' | 'One-off';
export type MeetingScope = string;

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  frequency: MeetingFrequency;
  scope: MeetingScope;
  scope_type?: string;
  scope_id?: string | number;
  date?: string;
  time: string;
  location: string;
  assignedEntities: string[]; // Names of fellowships/cells
  status: 'Active' | 'Archived';
}

export interface AttendanceSubmission {
  id: string;
  meetingId: string;
  meetingTitle: string;
  submittedBy: string;
  date: string;
  participants: string[]; // List of member names
  firstTimers: string[]; // List of first timer names
  code: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  serviceType: string;
  count: number;
  recordedBy: string;
  fellowship: string;
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number;
}

export interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export interface HeatmapData {
  day: string;
  hour: string;
  value: number;
}


export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}
