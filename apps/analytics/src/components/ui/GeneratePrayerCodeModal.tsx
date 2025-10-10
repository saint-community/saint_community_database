"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  Heart,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/libutils";
import { useCreatePrayerMeeting } from "@/hooks/usePrayerGroups";
import { CreatePrayerMeetingResponse } from "@/services/prayerGroup";
import { DatePicker } from "@workspace/ui/components/date-picker";
import { TimePicker } from "@/components/ui/TimePicker";
import dayjs from "dayjs";

interface GeneratePrayerCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
}

interface PrayerMeetingForm {
  date: string;
  start_time: string;
  end_time: string;
  prayer_group_id: string;
}

export function GeneratePrayerCodeModal({
  isOpen,
  onClose,
  onSuccess,
  className,
}: GeneratePrayerCodeModalProps) {
  const [formData, setFormData] = useState<PrayerMeetingForm>({
    date: "",
    start_time: "",
    end_time: "",
    prayer_group_id: "1", // Default prayer group - you can make this dynamic
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [result, setResult] = useState<Partial<CreatePrayerMeetingResponse>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createMutation = useCreatePrayerMeeting();

  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validation
    if (!selectedDate) {
      setValidationError("Please select a meeting date");
      return;
    }

    if (!formData.start_time) {
      setValidationError("Please select a start time");
      return;
    }

    if (!formData.end_time) {
      setValidationError("Please select an end time");
      return;
    }

    // Validate that end time is after start time
    const startTime = dayjs(`2025-01-01 ${formData.start_time}`);
    const endTime = dayjs(`2025-01-01 ${formData.end_time}`);

    if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
      setValidationError("End time must be after start time");
      return;
    }

    // Validate that the date is not in the past
    if (dayjs(selectedDate).isBefore(dayjs(), "day")) {
      setValidationError("Meeting date cannot be in the past");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createMutation.mutateAsync({
        prayer_group_id: formData.prayer_group_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
      });

      setShowSuccess(true);
      setResult(result);

      onSuccess?.();
    } catch (error) {
      console.error("Failed to create prayer meeting:", error);
      setValidationError(
        "Failed to schedule prayer meeting. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof PrayerMeetingForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      setFormData((prev) => ({
        ...prev,
        date: formattedDate,
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      date: "",
      start_time: "",
      end_time: "",
      prayer_group_id: "1",
    });
    setSelectedDate(undefined);
    setShowSuccess(false);
    setIsLoading(false);
    setCopied(false);
    setValidationError("");
    onClose();
  };

  const handleCopyCode = async () => {
    if (result && typeof result === "object" && result?.prayer_code) {
      try {
        await navigator.clipboard.writeText(result?.prayer_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  if (!isOpen) return null;

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
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Schedule Prayer Group Meeting
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
        {showSuccess ? (
          <div className="p-8 text-center">
            <div className="relative">
              {/* Animated background circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-green-100 rounded-full animate-ping opacity-30"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-green-200 rounded-full animate-pulse"></div>
              </div>
              {/* Main success icon */}
              <div className="relative w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <h4 className="font-semibold text-3xl text-green-900">
                  {result?.prayer_code}
                </h4>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">
                Prayer Meeting Scheduled!
              </h3>

              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                <p className="text-green-800 font-medium mb-2">
                  Successfully scheduled for:
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-900">
                      {selectedDate
                        ? dayjs(selectedDate).format("dddd, MMMM D, YYYY")
                        : "Invalid Date"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-900">
                      {formData.start_time
                        ? dayjs(`2025-01-01 ${formData.start_time}`).format(
                            "h:mm A"
                          )
                        : "--"}{" "}
                      -{" "}
                      {formData.end_time
                        ? dayjs(`2025-01-01 ${formData.end_time}`).format(
                            "h:mm A"
                          )
                        : "--"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prayer Code Section */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 font-medium mb-2 text-center">
                  Prayer Code:
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="bg-white px-4 py-2 rounded-lg border border-blue-300">
                    <span className="font-bold text-2xl text-blue-900">
                      {result?.prayer_code}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    title={copied ? "Copied!" : "Copy to clipboard"}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm text-center">
                Share this code with participants so they can join the prayer
                meeting.
              </p>

              <button
                onClick={handleClose}
                className="w-full h-[48px] px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="flex-1 w-full space-y-6 p-6">
            <div className="space-y-4">
              {/* Date Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Date
                </label>
                <DatePicker
                  value={selectedDate || new Date()}
                  onChange={handleDateChange}
                  className="h-[48px]"
                />
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <TimePicker
                    value={formData.start_time}
                    onChange={(time) => handleChange("start_time", time)}
                    className="h-[48px]"
                    placeholder="Select start time"
                  />
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <TimePicker
                    value={formData.end_time}
                    onChange={(time) => handleChange("end_time", time)}
                    className="h-[48px]"
                    placeholder="Select end time"
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {(validationError || createMutation.error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {validationError ||
                    "Failed to schedule prayer meeting. Please try again."}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="h-[48px] px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.date ||
                  !formData.start_time ||
                  !formData.end_time
                }
                className={cn(
                  "h-[48px] px-6 py-2 bg-red-500 text-white rounded-lg font-medium",
                  "hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300",
                  "transition-colors duration-200",
                  "flex items-center justify-center space-x-2"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Code</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
