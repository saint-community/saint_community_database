"use client";

import * as React from "react";
import { usePrayerMeetings, useDeletePrayerMeeting } from "@/hooks/usePrayerGroups";
import { formatPrayerMeetingForTable } from "@/services/prayerGroup";
import { TableCard } from "./TableCard";
import { useMemo } from "react";
import { toast } from "@workspace/ui/lib/sonner";

interface PrayerMeetingsTableProps {
  className?: string;
  onMeetingSelect?: (id: string, selected: boolean) => void;
  onViewDetails?: (id: string) => void;
  churchId?: string;
  prayerGroupId?: string;
}

export function PrayerMeetingsTable({
  onViewDetails,
  churchId,
  prayerGroupId,
}: PrayerMeetingsTableProps): React.JSX.Element {
  const {
    data: prayerMeetingsData,
    isLoading,
    error,
  } = usePrayerMeetings({
    church_id: churchId,
    prayer_group_id: prayerGroupId,
    limit: 10,
  });

  const deletePrayerMeetingMutation = useDeletePrayerMeeting();

  const formattedData = useMemo(() => {
    return prayerMeetingsData?.map(formatPrayerMeetingForTable) || [];
  }, [prayerMeetingsData]);

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this prayer meeting? This action cannot be undone.")) {
      return;
    }

    try {
      await deletePrayerMeetingMutation.mutateAsync(meetingId);
      toast.success("Prayer meeting deleted successfully");
    } catch (error) {
      toast.error("Failed to delete prayer meeting. Please try again.");
    }
  };
  

  return (
    <TableCard
      title="Recent Prayer Meetings"
      data={formattedData}
      columnKeys={[
        {
          name: "day",
          title: "Day & Period",
          compoundKey: "day,period",
        },
        {
          name: "date",
          title: "Time",
          compoundKey: "time",
        },
        {
          name: "church",
          title: "Church",
        },
        {
          name: "participants",
          title: "Participants",
          type: "number",
        },
        {
          name: "status",
          title: "Status",
        },
      ]}
      searchKeys={["church", "day"]}
      pathName="d/prayer"
      isLoading={isLoading || deletePrayerMeetingMutation.isPending}
      page={1}
      totalPages={1}
      hasNextPage={false}
      hasPreviousPage={false}
      onDeleteMeeting={handleDeleteMeeting}
    />
  );
}
