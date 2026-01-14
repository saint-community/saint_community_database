"use client";

import * as React from "react";
import { useFollowUpSessions, useDeleteFollowUpSession } from "@/hooks/useFollowUpGroups";
import { formatFollowUpSessionForTable } from "@/services/followUp";
import { TableCard } from "./TableCard";
import { useMemo } from "react";
import { toast } from "@workspace/ui/lib/sonner";

interface FollowUpSessionsTableProps {
  className?: string;
  onSessionSelect?: (id: string, selected: boolean) => void;
  onViewDetails?: (id: string) => void;
  churchId?: string;
  followUpGroupId?: string;
}

export function FollowUpSessionsTable({
  onViewDetails,
  churchId,
  followUpGroupId,
}: FollowUpSessionsTableProps): React.JSX.Element {
  const {
    data: followUpSessionsData,
    isLoading,
    error,
  } = useFollowUpSessions({
    church_id: churchId,
    followup_group_id: followUpGroupId,
    limit: 10,
  });

  const deleteFollowUpSessionMutation = useDeleteFollowUpSession();

  const formattedData = useMemo(() => {
    return followUpSessionsData?.map(formatFollowUpSessionForTable) || [];
  }, [followUpSessionsData]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this follow-up session? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteFollowUpSessionMutation.mutateAsync(sessionId);
      toast.success("Follow-up session deleted successfully");
    } catch (error) {
      toast.error("Failed to delete follow-up session. Please try again.");
    }
  };

  return (
    <TableCard
      title="Recent Follow-Up Sessions"
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
      pathName="d/follow-up"
      isLoading={isLoading || deleteFollowUpSessionMutation.isPending}
      page={1}
      totalPages={1}
      hasNextPage={false}
      hasPreviousPage={false}
      onDeleteMeeting={handleDeleteSession}
    />
  );
}