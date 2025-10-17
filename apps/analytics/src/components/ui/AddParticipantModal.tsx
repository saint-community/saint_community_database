"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { X, UserPlus, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/libutils";
import {
  useChurches,
  useFellowships,
  useCells,
} from "@/hooks/useOrganizational";
import { useMe } from "@/hooks/useMe";
import { useAddParticipant } from "@/hooks/usePrayerGroups";
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
  name: z.string().min(2, {
    message: "Participant name must be at least 2 characters.",
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
    name: string;
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
  const queryClient = useQueryClient();
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
      name: "",
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
        name: value.name,
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

  const handleClose = () => {
    form.reset();
    setShowSuccess(false);
    setIsLoading(false);
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

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Participant Name</Label>
            <form.Field
              name="name"
              children={(field) => (
                <>
                  <Input
                    id="name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter participant name"
                    className="h-[48px]"
                  />
                  <FieldInfo field={field} />
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
