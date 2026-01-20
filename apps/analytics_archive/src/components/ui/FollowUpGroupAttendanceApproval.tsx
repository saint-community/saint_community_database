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

interface FollowUpGroupAttendanceApprovalProps {
  className?: string;
  requests?: AttendanceRequest[];
}

const mockRequests: AttendanceRequest[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Follow-Up Coordinator',
    email: 'Johnsmith@gmail.com',
    phone: '+234 8129969837',
    attendanceDates: ['Wednesday 26 June, 2025 at 2:00 PM', 'Wednesday 26 June, 2025 at 2:00 PM'],
    avatar: '/figma-assets/4d5d5bfd6e6f27925ae75d463859d9e06e4b41f6.png'
  },
  {
    id: '2',
    name: 'Jane Doe',
    role: 'New Convert Mentor',
    email: 'janedoe@gmail.com',
    phone: '+234 8129969838',
    attendanceDates: ['Wednesday 26 June, 2025 at 2:00 PM'],
    avatar: '/figma-assets/4d5d5bfd6e6f27925ae75d463859d9e06e4b41f6.png'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    role: 'Discipleship Leader',
    email: 'michael.j@gmail.com',
    phone: '+234 8129969839',
    attendanceDates: ['Wednesday 26 June, 2025 at 2:00 PM'],
    avatar: '/figma-assets/4d5d5bfd6e6f27925ae75d463859d9e06e4b41f6.png'
  },
  {
    id: '4',
    name: 'Sarah Williams',
    role: 'Care Team Member',
    email: 'sarahw@gmail.com',
    phone: '+234 8129969840',
    attendanceDates: ['Wednesday 26 June, 2025 at 2:00 PM'],
    avatar: '/figma-assets/4d5d5bfd6e6f27925ae75d463859d9e06e4b41f6.png'
  }
];

export function FollowUpGroupAttendanceApproval({ 
  className, 
  requests = mockRequests 
}: FollowUpGroupAttendanceApprovalProps): React.JSX.Element {
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
          Follow-Up Sessions
        </h1>
      </div>

      <TableCard
        title="Follow-Up Sessions"
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
        pathName="d/follow-up/attendance"
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