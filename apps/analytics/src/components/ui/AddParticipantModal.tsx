"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { X, UserPlus, Loader2, CheckCircle, ChevronDown } from "lucide-react";
import { cn } from "@/libutils";
import {
  useChurches,
  useFellowships,
  useCells,
} from "@/hooks/useOrganizational";
import { useMe } from "@/hooks/useMe";
import { useAddParticipant } from "@/hooks/usePrayerGroups";
import { useMembersOptions } from "@/hooks/useMembers";
import { Button } from "@workspace/ui/components/button";
import { useForm } from "@workspace/ui/lib/react-hook-form";
import { z } from "zod";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { FieldInfo } from "@workspace/ui/components/field-info";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addParticipant } from "@/services/prayerGroup";
import { toast } from "@workspace/ui/lib/sonner";
import router from "next/router";

const formSchema = z.object({
  participant_name: z.string().min(1, {
    message: "Please enter participant name.",
  }),
  church: z.string().min(1, {
    message: "Please select a church.",
  }),
  fellowship: z.string().min(1, {
    message: "Please select a fellowship.",
  }),
  cell: z.string().min(1, {
    message: "Please select a cell.",
  }),
});

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (participant: {
    participant_name: string;
    church: string;
    fellowship: string;
    cell: string;
  }) => Promise<void>;
  prayerGroupId?: string;
  className?: string;
}

export function AddParticipantModal({
  isOpen,
  onClose,
  onSave,
  prayerGroupId,
  className,
}: AddParticipantModalProps): React.JSX.Element {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  // Get current user info
  const { data: user } = useMe();

  // Add participant mutation
  // const addParticipantMutation = useAddParticipant();

  // Fetch data from APIs
  const {
    data: churches,
    isLoading: churchesLoading,
    error: churchesError,
  } = useChurches();

  const { church } = useMemo(() => {
    const church = {
      id: user?.church_id || "",
      name: user?.church_name || `Church ${user?.church_id}`,
    };

    return { church, fellowships: [], cells: [] };
  }, [user]);

  const addParticipantMutation = useMutation({
    mutationFn: addParticipant,
    onSuccess: () => {
      toast.success("Participant added successfully");
      queryClient.invalidateQueries({ queryKey: ["prayerGroupAttendance"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "An error occurred");
    },
  });

  const form = useForm({
    defaultValues: {
      participant_name: "",
      church: user?.church_id?.toString() || "",
      fellowship: user?.fellowship_id?.toString() || "",
      cell: user?.cell_id?.toString() || "",
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
      onChangeAsync: ({ formApi }) => {
        formApi.setFieldValue("church", user?.church_id?.toString() || "");
        if (user?.fellowship_id) {
          formApi.setFieldValue("fellowship", user?.fellowship_id?.toString());
        }
        if (user?.cell_id) {
          formApi.setFieldValue("cell", user?.cell_id?.toString());
        }
      },
    },
    onSubmit: async ({ value }) => {
      if (!prayerGroupId) {
        console.error("No prayer group ID available");
        return;
      }

      setIsLoading(true);

      addParticipantMutation.mutate({
        prayergroup_id: prayerGroupId,
        fellowship_id: String(user?.fellowship_id),
        name: value.participant_name,
      });
    },
  });

  // Get current form values for dependent queries
  // const currentChurch = form.useStore((state) => state.values.church);
  // const currentFellowship = form.useStore((state) => state.values.fellowship);

  // Fetch dependent data
  const {
    data: fellowships,
    isLoading: fellowshipsLoading,
    error: fellowshipsError,
  } = useFellowships(user?.church_id);
  const {
    data: cells,
    isLoading: cellsLoading,
    error: cellsError,
  } = useCells(user?.fellowship_id, user?.church_id);

  // Fetch members for the church
  const { data: members = [], isLoading: membersLoading, error: membersError } = useMembersOptions(user?.church_id);

  // Filter members based on search value
  const filteredMembers = useMemo(() => {
    if (!searchValue) return members.slice(0, 10); // Show first 10 when no search
    return members.filter(member => 
      member.label.toLowerCase().includes(searchValue.toLowerCase())
    ).slice(0, 10); // Limit to 10 results
  }, [members, searchValue]);

  const handleClose = () => {
    form.reset();
    setShowSuccess(false);
    setIsLoading(false);
    setShowDropdown(false);
    setSearchValue("");
    onClose();
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={cn(
          "bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Add Participant
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex-1 w-full space-y-4 p-6"
        >
          {/* Church Field */}
          <div className="space-y-2">
            <Label htmlFor="church">Church</Label>
            <form.Field
              name="church"
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    disabled
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue placeholder="Select a church" />
                    </SelectTrigger>
                    <SelectContent>
                      {[{ value: church?.id, label: church?.name }].map(
                        (churchItem) => (
                          <SelectItem
                            key={churchItem.value}
                            value={`${churchItem.value}`}
                          >
                            {churchItem.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>

          {/* Fellowship Field */}
          <div className="space-y-2">
            <Label htmlFor="fellowship">Fellowship</Label>
            <form.Field
              name="fellowship"
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    disabled={fellowshipsLoading || !user?.church_id}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue
                        placeholder={
                          !user?.church_id
                            ? "Select a church first"
                            : fellowshipsLoading
                              ? "Loading fellowships..."
                              : fellowshipsError
                                ? "Error loading fellowships"
                                : "Select a fellowship"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(fellowships?.data) &&
                        fellowships?.data?.map((fellowship: any) => (
                          <SelectItem
                            key={fellowship.id}
                            value={fellowship.id.toString()}
                          >
                            {fellowship.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>

          {/* Cell Field */}
          <div className="space-y-2">
            <Label htmlFor="cell">Cell</Label>
            <form.Field
              name="cell"
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    disabled={cellsLoading || !user?.fellowship_id}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue
                        placeholder={
                          !user?.fellowship_id
                            ? "Select a fellowship first"
                            : cellsLoading
                              ? "Loading cells..."
                              : cellsError
                                ? "Error loading cells"
                                : "Select a cell"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(cells?.data) &&
                        cells?.data?.map((cell: any) => (
                          <SelectItem key={cell.id} value={cell.id.toString()}>
                            {cell.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>

          {/* Participant Name Combobox Field */}
          <div className="space-y-2 relative">
            <Label htmlFor="participant_name">Participant Name *</Label>
            <form.Field
              name="participant_name"
              children={(field) => (
                <>
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      id="participant_name"
                      value={field.state.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.handleChange(value);
                        setSearchValue(value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => {
                        // Delay hiding dropdown to allow for selection
                        setTimeout(() => setShowDropdown(false), 150);
                      }}
                      placeholder={
                        !user?.church_id
                          ? "Select a church first"
                          : membersLoading
                            ? "Loading members..."
                            : "Type participant name or select from list"
                      }
                      className="h-[48px] pr-10"
                      disabled={!user?.church_id || membersLoading}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    
                    {/* Dropdown with member suggestions */}
                    {showDropdown && user?.church_id && !membersLoading && filteredMembers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredMembers.map((member) => (
                          <button
                            key={member.value}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevent input blur
                              field.handleChange(member.label);
                              setSearchValue(member.label);
                              setShowDropdown(false);
                            }}
                          >
                            <div className="text-sm">{member.label}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <FieldInfo field={field} />
                  {membersError && (
                    <p className="text-sm text-red-500">Failed to load members</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="w-full">
            <form.Subscribe
              selector={(state) => [state.canSubmit, isLoading]}
              children={([canSubmit]) => (
                <div className="flex justify-center space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="h-[48px]"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-[48px]"
                    disabled={!canSubmit || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      "Add Participant"
                    )}
                  </Button>
                </div>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
