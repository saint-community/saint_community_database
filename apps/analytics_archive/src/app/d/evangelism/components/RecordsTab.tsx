'use client';

import * as React from 'react';
import { EvangelismSessionsTable } from '@/components/ui/EvangelismSessionsTable';
import { EvangelismGroupAttendanceApproval } from '@/components/ui/EvangelismGroupAttendanceApproval';

interface RecordsTabProps {
  onSessionSelect?: (id: string, selected: boolean) => void;
  onViewDetails?: (id: string) => void;
}

export default function RecordsTab({
  onSessionSelect,
  onViewDetails,
}: RecordsTabProps): React.JSX.Element {
  return (
    <div className="space-y-8">
      

      {/* Attendance Management */}
      <div className=" ">
        <EvangelismGroupAttendanceApproval />
      </div>
    </div>
  );
}