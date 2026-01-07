'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/libutils';
import { TableCard } from './TableCard';
import { Button } from '@workspace/ui/components/button';

interface AttendanceRequest {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  attendanceDates: string[];
  avatar: string;
}

interface EvangelismGroupAttendanceApprovalProps {
  className?: string;
  requests?: AttendanceRequest[];
}

const mockRequests: AttendanceRequest[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Evangelism Team Lead',
    email: 'Johnsmith@gmail.com',
    phone: '+234 8129969837',
    attendanceDates: ['Saturday 25 June, 2025 at 10:00 AM', 'Saturday 25 June, 2025 at 10:00 AM'],
    avatar: '/figma-assets/4d5d5bfd6e6f27925ae75d463859d9e06e4b41f6.png'
  },
  {
    id: '2',
    name: 'Jane Doe',
    role: 'Outreach Coordinator',
    email: 'janedoe@gmail.com',
    phone: '+234 8129969838',
    attendanceDates: ['Saturday 25 June, 2025 at 10:00 AM'],
    avatar: '/figma-assets/4d5d5bfd6e6f27925ae75d463859d9e06e4b41f6.png'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    role: 'Street Evangelist',
    email: 'michael.j@gmail.com',
    phone: '+234 8129969839',
    attendanceDates: ['Saturday 25 June, 2025 at 10:00 AM'],
    avatar: '/figma-assets/4d5d5bfd6e6f27925ae75d463859d9e06e4b41f6.png'
  },
  {
    id: '4',
    name: 'Sarah Williams',
    role: 'Community Outreach',
    email: 'sarahw@gmail.com',
    phone: '+234 8129969840',
    attendanceDates: ['Saturday 25 June, 2025 at 10:00 AM'],
    avatar: '/figma-assets/4d5d5bfd6e6f27925ae75d463859d9e06e4b41f6.png'
  }
];

export function EvangelismGroupAttendanceApproval({ 
  className, 
  requests = mockRequests 
}: EvangelismGroupAttendanceApprovalProps): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);

  const handleApprove = (id: string) => {
    console.log('Approving request:', id);
  };

  const handleDecline = (id: string) => {
    console.log('Declining request:', id);
  };

  const markAllPresent = () => {
    console.log('Marking all present');
  };

  const formattedRequests = requests.map(request => ({
    ...request,
    attendanceDates: request.attendanceDates.join(', ')
  }));

  const actionButton = (
    <Button onClick={markAllPresent}>
      Mark all Present
    </Button>
  );

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      <div className="flex justify-between items-center">
        <h1 className="text-[32px] font-semibold text-black font-['Poppins']">
          Evangelism Sessions
        </h1>
      </div>

      <TableCard
        title="Evangelism Sessions"
        action={actionButton}
        data={formattedRequests}
        columnKeys={[
          {
            name: 'name',
            title: 'Name',
          },
          {
            name: 'role',
            title: 'Role',
          },
          {
            name: 'email',
            title: 'Email',
          },
          {
            name: 'phone',
            title: 'Phone',
          },
          {
            name: 'attendanceDates',
            title: 'Attendance Dates',
          },
        ]}
        searchKeys={['name', 'email', 'role']}
        pathName="d/evangelism/attendance"
        page={currentPage}
        totalPages={3}
        hasNextPage={currentPage < 3}
        hasPreviousPage={currentPage > 1}
        onNextPage={() => setCurrentPage(prev => prev + 1)}
        onPreviousPage={() => setCurrentPage(prev => prev - 1)}
      />
    </div>
  );
}