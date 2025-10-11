"use client";

import { usePrayerMeetings } from "@/hooks/usePrayerGroups";
import { formatPrayerMeetingForTable } from "@/services/prayerGroup";
import { TableCard } from "./TableCard";
import { useMemo } from "react";

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
}: PrayerMeetingsTableProps) {
  const {
    data: prayerMeetingsData,
    isLoading,
    error,
  } = usePrayerMeetings({
    church_id: churchId,
    prayer_group_id: prayerGroupId,
    limit: 10,
  });

  const formattedData = useMemo(() => {
    return prayerMeetingsData?.map(formatPrayerMeetingForTable) || [];
  }, [prayerMeetingsData]);
  

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
          title: "Date & Time",
          compoundKey: "date,time",
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
      isLoading={isLoading}
      page={1}
      totalPages={1}
      hasNextPage={false}
      hasPreviousPage={false}
    />
  );
}
