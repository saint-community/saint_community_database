"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AddParticipantModal } from "./AddParticipantModal";
import { TableCard } from "./TableCard";
import {
  usePrayerGroupAttendance,
  useMarkOnePresent,
  useMarkAllPresent,
  useMarkOneAbsent,
  useAddParticipant,
  useRemoveParticipant,
} from "@/hooks/usePrayerGroups";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Users,
  Download,
  UserCheck,
  UserX,
  Trash2,
  MoreHorizontal,
  UserPlus,
} from "lucide-react";
import { markOneAbsent, markOnePresent } from "@/services/prayerGroup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@workspace/ui/lib/sonner";
import dayjs from "dayjs";

interface Participant {
  id: string;
  name: string;
  fellowship: string;
  status: string;
  avatar: string;
  phone?: string;
  email?: string;
}

interface PrayerDetailsPageProps {
  prayerGroupId?: string;
  className?: string;
}

export default function PrayerDetailsPage({
  prayerGroupId: id,
  className,
}: PrayerDetailsPageProps): React.JSX.Element {
  const searchParams = useParams();
  const prayergroup_id = searchParams.id as string;
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();
  // Fetch attendance data from API
  const {
    data: attendanceData,
    isLoading,
    error,
  } = usePrayerGroupAttendance({ prayergroup_id: prayergroup_id });
  
  const parts = attendanceData?.date?.split('-') ?? []; 

  const rearrangedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

  // Attendance mutation hooks
  const markOnePresentMutation = useMutation({
    mutationFn: markOnePresent,
    onSuccess: () => {
      toast.success("Participant marked as present successfully");
      queryClient.invalidateQueries({ queryKey: ["prayerGroupAttendance"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "An error occurred");
    },
  });

  const markAllPresentMutation = useMarkAllPresent({
    prayergroup_id: prayergroup_id,
  });

  const markOneAbsentMutation = useMutation({
    mutationFn: markOneAbsent,
    onSuccess: () => {
      toast.success("Participant marked as absent successfully");
      queryClient.invalidateQueries({ queryKey: ["prayerGroupAttendance"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "An error occurred");
    },
  });

  // Participant management mutation hooks
  const addParticipantMutation = useAddParticipant();
  const removeParticipantMutation = useRemoveParticipant();

  // Transform API data to participants format
  useEffect(() => {
    if (attendanceData?.data) {
      const transformedParticipants: Participant[] = attendanceData.data.map(
        (record) => ({
          id: record.attendee_id,
          name: record.name,
          fellowship: record.fellowship || "--",
          status: record.status,
          avatar: "/figma-assets/4d5d5bfd6e6f27925ae75d463859d9e06e4b41f6.png",
          phone: "",
          email: "",
        })
      );
      setParticipants(transformedParticipants);
    } else {
      // No data available, set empty array
      setParticipants([]);
    }
  }, [attendanceData]);

  const handleBack = () => {
    router.back();
  };

  const handleSelectParticipant = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id)
        ? prev.filter((participantId) => participantId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedParticipants.length === participants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants.map((p) => p.id));
    }
  };

  const handleSaveParticipant = async (newParticipant: {
    name: string;
    church: string;
    fellowship: string;
    cell: string;
  }) => {
    // The API call is handled directly in the AddParticipantModal
    // The attendance data will be automatically refreshed via query invalidation
    // This function is kept for interface compatibility but no longer needs mock behavior
  };

  const handleExportList = () => {
    if (typeof window === "undefined") return;

    const exportData = participants.map((p) => ({
      Name: p.name,
      Fellowship: p.fellowship,
      Status: p.status,
      Phone: p.phone || "",
      Email: p.email || "",
    }));

    if (exportData.length === 0) return;

    const headers = ["Name", "Fellowship", "Status", "Phone", "Email"];
    const csvContent = [
      headers.join(","),
      ...exportData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prayer-group-participants.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRemoveParticipant = async (id: string) => {
    try {
      await removeParticipantMutation.mutateAsync({
        prayergroup_id: prayergroup_id!,
        attendee_id: id,
      });
      setSelectedParticipants((prev) =>
        prev.filter((participantId) => participantId !== id)
      );
    } catch (error) {
      console.error("Failed to remove participant:", error);
      alert("Failed to remove participant. Please try again.");
    }
  };

  const handleBulkRemove = async () => {
    if (selectedParticipants.length > 0) {
      const confirmed = window.confirm(
        `Are you sure you want to remove ${selectedParticipants.length} participant(s)?`
      );
      if (confirmed) {
        if (!prayergroup_id) {
          console.error("No prayer group ID available");
          return;
        }

        try {
          // Remove selected participants individually
          await Promise.all(
            selectedParticipants.map((participantId) =>
              removeParticipantMutation.mutateAsync({
                prayergroup_id: prayergroup_id,
                attendee_id: participantId,
              })
            )
          );
          setSelectedParticipants([]);
        } catch (error) {
          console.error("Failed to remove participants:", error);
          alert("Failed to remove participants. Please try again.");
        }
      }
    }
  };

  const handleMarkPresent = async (id: string) => {
    if (!prayergroup_id) {
      console.error("No prayer group ID available");
      return;
    }

    try {
      await markOnePresentMutation.mutate({
        attendee_id: id,
        prayergroup_id: prayergroup_id,
      });
    } catch (error) {
      console.error("Failed to mark participant as present:", error);
      alert("Failed to mark participant as present. Please try again.");
    }
  };

  const handleMarkAbsent = async (id: string) => {
    if (!prayergroup_id) {
      console.error("No prayer group ID available");
      return;
    }

    try {
      await markOneAbsentMutation.mutate({
        attendee_id: id,
        prayergroup_id: prayergroup_id,
      });
    } catch (error) {
      console.error("Failed to mark participant as absent:", error);
      alert("Failed to mark participant as absent. Please try again.");
    }
  };

  const handleMarkAllPresent = async () => {
    if (!prayergroup_id) {
      console.error("No prayer group ID available");
      return;
    }
    // Mark all participants present
    await markAllPresentMutation.mutateAsync();
  };

  // Show loading state
  if (prayergroup_id && isLoading) {
    return (
      <div
        className={`flex items-center justify-center py-12 ${className || ""}`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading prayer group data...</span>
      </div>
    );
  }

  // Show error state
  if (prayergroup_id && error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className || ""}`}
      >
        <div className="text-red-500 text-2xl mb-2">⚠️</div>
        <h3 className="text-lg font-medium text-red-900 mb-1">
          Error Loading Prayer Group
        </h3>
        <p className="text-red-700">
          Unable to load prayer group data. Please try again later.
        </p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-[35px] items-center relative size-full ${className || ""}`}
    >
      {/* Header Section */}
      <div className=" w-full">
        {/* Back Button */}
        <div className="content-stretch flex h-[100px] items-center justify-between relative shrink-0 w-[145px]">
          <button
            onClick={handleBack}
            className="content-stretch flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="overflow-clip relative shrink-0 size-[64px] flex items-center justify-center">
              <ArrowLeft size={32} className="text-[#cca856]" />
            </div>
            <div className="font-['Poppins'] font-semibold text-[24px] text-[#131313]">
              Back
            </div>
          </button>
        </div>

        {/* Prayer Group Details Cards */}
        <div className="flex items-center justify-between w-full">
          <div className="flex  items-center justify-between w-full ">
            {/* Time Started Card */}
            <div className="bg-white  relative rounded-[8px] shrink-0 w-[222px] shadow-[2px_2px_4px_0px_rgba(40,41,61,0.04),4px_0px_12px_0px_rgba(96,97,112,0.08)] border-[0.5px] border-[rgba(96,97,112,0.25)] p-2">
              <div className="box-border content-stretch flex gap-[16px] h-[100px] items-center overflow-clip pl-[16px] pr-[32px] py-[24px] relative w-[222px]">
                <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
                    <Clock size={24} className="text-[#131313]" />
                    <div className="font-['Inter'] text-[14px] text-[#131313]">
                      Time Started
                    </div>
                  </div>
                  <div className="font-['Poppins'] font-semibold text-[28px] text-[#131313]">
                    {attendanceData?.start_time}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-2 relative rounded-[8px] shrink-0 w-[222px] shadow-[2px_2px_4px_0px_rgba(40,41,61,0.04),4px_0px_12px_0px_rgba(96,97,112,0.08)] border-[0.5px] border-[rgba(96,97,112,0.25)]">
              <div className="box-border content-stretch flex gap-[16px] h-[100px] items-center overflow-clip pl-[16px] pr-[32px] py-[24px] relative w-[222px]">
                <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
                    <Clock size={24} className="text-[#131313]" />
                    <div className="font-['Inter'] text-[14px] text-[#131313]">
                      Time Ended
                    </div>
                  </div>
                  <div className="font-['Poppins'] font-semibold text-[28px] text-[#131313]">
                    {attendanceData?.end_time}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Card */}
            <div className="bg-white  p-2 relative rounded-[8px] shrink-0 shadow-[2px_2px_4px_0px_rgba(40,41,61,0.04),4px_0px_12px_0px_rgba(96,97,112,0.08)] border-[0.5px] border-[rgba(96,97,112,0.25)]">
              <div className="box-border content-stretch flex gap-[16px] h-[100px] items-center overflow-clip pl-[16px] pr-[32px] py-[24px] relative">
                <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
                    <Calendar size={24} className="text-[#131313]" />
                    <div className="font-['Inter'] text-[14px] text-[#131313]">
                      Date
                    </div>
                  </div>
                  <div className="font-['Poppins'] font-semibold text-[28px] text-[#131313]">
                    {attendanceData?.date 
                      ? dayjs(rearrangedDate).format('D MMM YYYY')
                      : "--- --th ---"}
                     
                  </div>
                </div>
              </div>
            </div>

            {/* Total Participants Card */}
            <div className="bg-white p-2 relative rounded-[8px] shrink-0 w-[222px] shadow-[2px_2px_4px_0px_rgba(40,41,61,0.04),4px_0px_12px_0px_rgba(96,97,112,0.08)] border-[0.5px] border-[rgba(96,97,112,0.25)]">
              <div className="box-border content-stretch flex gap-[16px] h-[100px] items-center overflow-clip pl-[16px] pr-[32px] py-[24px] relative w-[222px]">
                <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
                  <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
                    <Users size={24} className="text-[#131313]" />
                    <div className="font-['Inter'] text-[14px] text-[#131313]">
                      Total Participants
                    </div>
                  </div>
                  <div className="font-['Poppins'] font-semibold text-[28px] text-[#131313]">
                    {attendanceData?.number_of_attendees || participants.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" flex flex-col gap-[10px] relative  w-full">
        {/* Action Buttons */}
        <div className=" flex items-end justify-between relative shrink-0 w-full pb-4">
          {/* <div className="flex gap-4">
            <button
              onClick={handleExportList}
              className=" flex gap-[8px] items-center relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Download size={24} className="text-[#cca856]" />
              <div className="font-['Poppins'] text-[16px] text-[#cca856] underline leading-[24px]">
                Export List
              </div>
            </button>
          </div> */}
          {/* Add Participant Button */}
          <div className="content-stretch flex gap-[16px] items-end relative shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="content-stretch flex gap-[8px] items-center relative shrink-0 cursor-pointer hover:opacity-80 px-4 py-2 bg-black text-white rounded-lg font-medium transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Add Participant
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleMarkAllPresent}
              disabled={
                markAllPresentMutation.isPending ||
                markOnePresentMutation.isPending
              }
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markAllPresentMutation.isPending ||
              markOnePresentMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing...
                </span>
              ) : selectedParticipants.length > 0 ? (
                "Mark Selected Present"
              ) : (
                "Mark All Present"
              )}
            </button>
          </div>
        </div>

        {/* Participants Table */}
        <div className="w-full">
          <TableCard
            title="Prayer Group Participants"
            action={
              selectedParticipants.length > 0 ? (
                <button
                  onClick={handleBulkRemove}
                  disabled={removeParticipantMutation.isPending}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {removeParticipantMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Removing...
                    </span>
                  ) : (
                    `Remove Selected (${selectedParticipants.length})`
                  )}
                </button>
              ) : null
            }
            data={participants}
            columnKeys={[
              {
                name: "name",
                title: "Name",
              },
              {
                name: "fellowship",
                title: "Fellowship",
              },
              {
                name: "status",
                title: "Status",
              },
            ]}
            searchKeys={["name", "fellowship", "status"]}
            page={currentPage}
            totalPages={10}
            hasNextPage={currentPage < 10}
            hasPreviousPage={currentPage > 1}
            onNextPage={() => setCurrentPage((prev) => prev + 1)}
            onPreviousPage={() => setCurrentPage((prev) => prev - 1)}
            onMarkPresent={handleMarkPresent}
            onMarkAbsent={handleMarkAbsent}
            onRemoveParticipant={handleRemoveParticipant}
          />
        </div>
      </div>

      {/* Add Participant Modal */}
      <AddParticipantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveParticipant}
        prayerGroupId={prayergroup_id}
      />
    </div>
  );
}
