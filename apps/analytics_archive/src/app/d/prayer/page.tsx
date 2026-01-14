'use client';

import * as React from 'react';
import { useState } from 'react';
import { PrayerGroupSelector } from '@/components/ui/PrayerGroupSelector';
import { ActivityTabs } from '@/components/ui/ActivityTabs';
import { PrayerChart } from '@/components/ui/PrayerChart';
import { GenerateCodeButton } from '@/components/ui/GenerateCodeButton';
import { PrayerMeetingsTable } from '@/components/ui/PrayerMeetingsTable';
import { Pagination } from '@/components/ui/Pagination';
import { GeneratePrayerCodeModal } from '@/components/ui/GeneratePrayerCodeModal';
import { PrayerGroupAttendanceApproval } from '@/components/ui/PrayerGroupAttendanceApproval';
import { useRouter } from 'next/navigation';

export default function PrayerPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'prayer' | 'activity'>('prayer');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { push } = useRouter();

  const handleGenerateCode = () => {
    setIsModalOpen(true);
  };

  const handleMeetingSelect = (id: string, selected: boolean) => {
    console.log('Meeting selected:', id, selected);
  };

  const handleViewDetails = (id: string) => {
   push(`/d/prayer/${id}`);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        {/* <PrayerGroupSelector /> */}
        {/* <ActivityTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        /> */}
      </div>

      {/* Description and Action Buttons */}
      <div className="flex items-center justify-between">
        <p className="text-lg text-gray-700">
          {activeTab === 'prayer' 
            ? 'Manage Prayer meetings and schedule sessions'
            : 'View prayer group attendance and member activity'
          }
        </p>
        {activeTab === 'prayer' && (
          <GenerateCodeButton onClick={handleGenerateCode} />
        )}
      </div>

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'prayer' ? (
        <>
          {/* Analytics Chart */}
          <PrayerChart />

          {/* Recent Prayer Meetings Section */}
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between py-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Recent Prayer Meetings
              </h2>
            </div>

            {/* Prayer Meetings Table */}
            <PrayerMeetingsTable 
              onMeetingSelect={handleMeetingSelect}
              onViewDetails={handleViewDetails}
            />

          
          </div>
        </>
      ) : (
        <>
          {/* Prayer Group Attendance Approval */}
          <PrayerGroupAttendanceApproval />
        </>
      )}

      {/* Schedule Prayer Meeting Modal */}
      <GeneratePrayerCodeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          console.log('Prayer meeting scheduled successfully!');
        }}
      />
    </div>
  );
}