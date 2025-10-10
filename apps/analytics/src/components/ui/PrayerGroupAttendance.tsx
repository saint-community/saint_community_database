'use client';

import { useState, useMemo } from 'react';
import { Search, Users, Calendar, MapPin, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/libutils';
import { usePrayerGroupAttendance } from '@/hooks/usePrayerGroups';

interface AttendanceMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  lastAttendance: string;
  attendanceCount: number;
  totalMeetings: number;
  status: 'active' | 'inactive' | 'new';
  avatar?: string;
}

interface PrayerGroupAttendanceProps {
  className?: string;
  groupName?: string;
  prayerGroupId?: string;
}

const mockAttendanceData: AttendanceMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+234 801 234 5678',
    location: 'Lagos, Nigeria',
    joinedDate: '2024-01-15',
    lastAttendance: '2024-01-20',
    attendanceCount: 18,
    totalMeetings: 20,
    status: 'active',
  },
  {
    id: '2',
    name: 'Mary Johnson',
    email: 'mary.j@email.com',
    phone: '+234 802 345 6789',
    location: 'Abuja, Nigeria',
    joinedDate: '2024-02-01',
    lastAttendance: '2024-01-20',
    attendanceCount: 15,
    totalMeetings: 18,
    status: 'active',
  },
  {
    id: '3',
    name: 'David Wilson',
    email: 'david.w@email.com',
    phone: '+234 803 456 7890',
    location: 'Port Harcourt, Nigeria',
    joinedDate: '2023-11-10',
    lastAttendance: '2024-01-18',
    attendanceCount: 25,
    totalMeetings: 30,
    status: 'active',
  },
  {
    id: '4',
    name: 'Sarah Brown',
    email: 'sarah.b@email.com',
    phone: '+234 804 567 8901',
    location: 'Kaduna, Nigeria',
    joinedDate: '2024-01-01',
    lastAttendance: '2024-01-12',
    attendanceCount: 8,
    totalMeetings: 15,
    status: 'inactive',
  },
  {
    id: '5',
    name: 'Michael Davis',
    email: 'michael.d@email.com',
    phone: '+234 805 678 9012',
    location: 'Ibadan, Nigeria',
    joinedDate: '2024-01-18',
    lastAttendance: '2024-01-20',
    attendanceCount: 3,
    totalMeetings: 3,
    status: 'new',
  },
  {
    id: '6',
    name: 'Grace Ojo',
    email: 'grace.ojo@email.com',
    phone: '+234 806 789 0123',
    location: 'Kano, Nigeria',
    joinedDate: '2023-09-15',
    lastAttendance: '2024-01-19',
    attendanceCount: 32,
    totalMeetings: 35,
    status: 'active',
  },
];

export function PrayerGroupAttendance({ 
  className, 
  groupName = "Friday Morning Prayer Group",
  prayerGroupId
}: PrayerGroupAttendanceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'new'>('all');
  
  // Use real API data when prayerGroupId is provided, otherwise fallback to mock data
  const { data: attendanceData, isLoading, error } = usePrayerGroupAttendance(
    prayerGroupId ? { prayergroup_id: prayerGroupId, limit: 100 } : undefined
  );

  // Transform API data to match component interface or use mock data
  const membersData = useMemo(() => {
    if (prayerGroupId && attendanceData?.data) {
      // Transform attendance records to member format
      // For now, return empty array - this would need backend support for member aggregation
      return [];
    }
    return mockAttendanceData;
  }, [prayerGroupId, attendanceData]);

  const filteredMembers = useMemo(() => {
    return membersData.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, membersData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAttendanceRate = (attended: number, total: number) => {
    return Math.round((attended / total) * 100);
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Show loading state
  if (prayerGroupId && isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading attendance data...</span>
      </div>
    );
  }

  // Show error state
  if (prayerGroupId && error) {
    return (
      <div className={cn('bg-red-50 border border-red-200 rounded-lg p-6 text-center', className)}>
        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-red-900 mb-1">Error Loading Attendance</h3>
        <p className="text-red-700">Unable to load attendance data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{groupName} - Attendance</h2>
          <p className="text-gray-600 mt-1">
            {filteredMembers.length} members • {filteredMembers.filter(m => m.status === 'active').length} active
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-lg border border-gray-200">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="new">New Members</option>
        </select>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => {
          const attendanceRate = getAttendanceRate(member.attendanceCount, member.totalMeetings);
          
          return (
            <div
              key={member.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Member Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <span className={cn(
                      'inline-block px-2 py-1 text-xs font-medium rounded-full border',
                      getStatusColor(member.status)
                    )}>
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{member.location}</span>
                </div>
              </div>

              {/* Attendance Stats */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                  <span className={cn(
                    'text-sm font-medium',
                    getAttendanceColor(attendanceRate)
                  )}>
                    {attendanceRate}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all',
                      attendanceRate >= 80 ? 'bg-green-500' :
                      attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{member.attendanceCount}/{member.totalMeetings} meetings</span>
                  <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-1 mt-2 text-xs">
                  {new Date(member.lastAttendance) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Recently active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-600">Needs follow-up</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No members have been added to this prayer group yet.'
            }
          </p>
        </div>
      )}

      {/* Summary Stats */}
      {filteredMembers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredMembers.length}</div>
              <div className="text-sm text-gray-600">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredMembers.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(filteredMembers.reduce((acc, m) => acc + getAttendanceRate(m.attendanceCount, m.totalMeetings), 0) / filteredMembers.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Attendance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredMembers.filter(m => m.status === 'new').length}
              </div>
              <div className="text-sm text-gray-600">New This Month</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}