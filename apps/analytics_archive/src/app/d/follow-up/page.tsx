'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/Tabs';
import OverviewTab from './components/OverviewTab';
import RecordsTab from './components/RecordsTab';
import FollowUpReportsTab from './components/FollowUpReportsTab';
import { LogFollowUpSessionModal } from './components/AddFollowUpRecordModal';


export default function FollowUpPage(): React.JSX.Element {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const { push } = useRouter();

  const handleAddRecord = () => {
    setIsRecordModalOpen(true);
  };

  const handleSessionSelect = (id: string, selected: boolean) => {
    console.log('Session selected:', id, selected);
  };

  const handleViewDetails = (id: string) => {
   push(`/d/follow-up/${id}`);
  };

  const handleReportSuccess = () => {
    // Refresh the page or update state to show new report
    window.location.reload();
  };

  return (
     <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-auto p-8 bg-gray-50">
          {/* Section Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Follow-Up Ministry</h2>
              <p className="text-muted-foreground">New member care and discipleship tracking.</p>
            </div>
            <Button className="bg-red-500 hover:bg-red-600 text-white gap-2" onClick={handleAddRecord}>
              <span>+</span> Add Follow-Up Record
            </Button>
          </div>

          {/* Tabs */}
          <Tabs
            defaultTab="overview"
            tabs={[
              {
                id: 'overview',
                label: 'Overview',
                content: <OverviewTab />
              },
              {
                id: 'reports',
                label: 'Reports',
                content: (
                  <FollowUpReportsTab
                    onViewDetails={handleViewDetails}
                    onAddReport={handleAddRecord}
                    userRole="admin"
                  />
                )
              },
              {
                id: 'sessions',
                label: 'Sessions',
                content: (
                  <RecordsTab
                    onSessionSelect={handleSessionSelect}
                    onViewDetails={handleViewDetails}
                  />
                )
              }
            ]}
          />
        </main>
      </div>

      {/* Modals */}
      {isRecordModalOpen && (
        <LogFollowUpSessionModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
}