'use client';

import * as React from 'react';
import { useState } from 'react';
import AddEvangelismRecordModal from '@/components/ui/AddEvangelismRecord';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/Tabs';
import OverviewTab from './components/OverviewTab';
import RecordsTab from './components/RecordsTab';
import EvangelismReportsTab from './components/EvangelismReportsTab';

export default function EvangelismPage(): React.JSX.Element {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const { push } = useRouter();

  const handleAddRecord = () => {
    setIsRecordModalOpen(true);
  };

  const handleSessionSelect = (id: string, selected: boolean) => {
    console.log('Session selected:', id, selected);
  };

  const handleViewDetails = (id: string) => {
   push(`/d/evangelism/${id}`);
  };

  const handleReportSuccess = () => {
    // Refresh the page or update state to show new report
    window.location.reload();
  };

  return (
     <div className="flex h-screen bg-background">
    

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* <header className="bg-white border-b border-border px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">☀️ Good Morning, Pastor Robert!</h1>
            <p className="text-sm text-muted-foreground mt-1">ADMIN HQ / EVANGELISM</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Find records..."
                className="pl-10 pr-4 py-2 bg-gray-100 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Bell className="h-5 w-5 text-muted-foreground cursor-pointer" />
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold">R</span>
            </div>
          </div>
        </header> */}

        {/* Content */}
        <main className="flex-1 overflow-auto p-8 bg-gray-50">
          {/* Section Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Evangelism Outreach</h2>
              <p className="text-muted-foreground">Spiritual impact tracking and soul-winning directory.</p>
            </div>
            <Button className="bg-red-500 hover:bg-red-600 text-white gap-2" onClick={handleAddRecord}>
              <span>+</span> Add Evangelism Record
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
                  <EvangelismReportsTab
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
        <AddEvangelismRecordModal
          onClose={() => setIsRecordModalOpen(false)}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
}