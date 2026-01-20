"use client";

import * as React from "react";
import { useEvangelismSessions, useDeleteEvangelismSession } from "@/hooks/useEvangelismGroups";
import { formatEvangelismSessionForTable } from "@/services/evangelism";
import { TableCard } from "./TableCard";
import { useMemo } from "react";
import { toast } from "@workspace/ui/lib/sonner";

interface EvangelismSessionsTableProps {
  className?: string;
  onSessionSelect?: (id: string, selected: boolean) => void;
  onViewDetails?: (id: string) => void;
  churchId?: string;
  evangelismGroupId?: string;
}

export function EvangelismSessionsTable({
  onViewDetails,
  churchId,
  evangelismGroupId,
}: EvangelismSessionsTableProps): React.JSX.Element {
  const {
    data: evangelismSessionsData,
    isLoading,
    error,
  } = useEvangelismSessions({
    church_id: churchId,
    evangelism_group_id: evangelismGroupId,
    limit: 10,
  });

  const deleteEvangelismSessionMutation = useDeleteEvangelismSession();

  const formattedData = useMemo(() => {
    return evangelismSessionsData?.map(formatEvangelismSessionForTable) || [];
  }, [evangelismSessionsData]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this evangelism session? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteEvangelismSessionMutation.mutateAsync(sessionId);
      toast.success("Evangelism session deleted successfully");
    } catch (error) {
      toast.error("Failed to delete evangelism session. Please try again.");
    }
  };

  return (
    <TableCard
      title="Recent Evangelism Sessions"
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
      pathName="d/evangelism"
      isLoading={isLoading || deleteEvangelismSessionMutation.isPending}
      page={1}
      totalPages={1}
      hasNextPage={false}
      hasPreviousPage={false}
      onDeleteMeeting={handleDeleteSession}
    />
  );
}