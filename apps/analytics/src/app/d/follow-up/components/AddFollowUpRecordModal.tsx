"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { submitFollowUpReport, CreateFollowUpReportData } from '@/services/followUp'

interface LogFollowUpSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  member_id: string;
  member_name: string;
  date: string;
  duration: string;
  topic: string;
  method: 'in_person' | 'phone_call' | 'video_call' | 'text_message' | 'other';
  location: string;
  progress_level: 'beginner' | 'intermediate' | 'advanced' | 'mature';
  areas_discussed: string;
  prayer_requests: string;
  challenges_faced: string;
  next_steps: string;
  follow_up_needed: boolean;
  follow_up_date: string;
  notes: string;
  materials_used: string;
  spiritual_growth_indicators: string;
  attendance_status: 'present' | 'absent' | 'partial';
}

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0]!;
};

export function LogFollowUpSessionModal({ isOpen, onClose, onSuccess }: LogFollowUpSessionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    member_id: "",
    member_name: "Mary J.",
    date: getTodayDateString(),
    duration: "",
    topic: "",
    method: "in_person" as const,
    location: "",
    progress_level: "beginner" as const,
    areas_discussed: "",
    prayer_requests: "",
    challenges_faced: "",
    next_steps: "",
    follow_up_needed: false,
    follow_up_date: "",
    notes: "",
    materials_used: "",
    spiritual_growth_indicators: "",
    attendance_status: "present" as const,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSave = async () => {
    if (!formData.member_name.trim() || !formData.topic.trim() || !formData.duration) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const reportData: CreateFollowUpReportData = {
        member_id: formData.member_id || `member-${Date.now()}`, // Generate if not provided
        date: formData.date,
        duration: parseInt(formData.duration) || 0,
        topic: formData.topic,
        method: formData.method,
        location: formData.location || undefined,
        progress_level: formData.progress_level,
        areas_discussed: formData.areas_discussed ? formData.areas_discussed.split(',').map(s => s.trim()) : [],
        ...(formData.prayer_requests && { prayer_requests: formData.prayer_requests.split(',').map(s => s.trim()) }),
        ...(formData.challenges_faced && { challenges_faced: formData.challenges_faced }),
        ...(formData.next_steps && { next_steps: formData.next_steps.split(',').map(s => s.trim()) }),
        follow_up_needed: formData.follow_up_needed,
        ...(formData.follow_up_date && { follow_up_date: formData.follow_up_date }),
        ...(formData.notes && { notes: formData.notes }),
        ...(formData.materials_used && { materials_used: formData.materials_used.split(',').map(s => s.trim()) }),
        ...(formData.spiritual_growth_indicators && { spiritual_growth_indicators: formData.spiritual_growth_indicators.split(',').map(s => s.trim()) }),
        attendance_status: formData.attendance_status,
      };

      await submitFollowUpReport(reportData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error submitting follow-up report:", error);
      alert("Failed to submit follow-up report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Log Follow-Up Session</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">MEMBER *</label>
              <select
                name="member_name"
                value={formData.member_name}
                onChange={handleInputChange}
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Mary J.</option>
                <option>John D.</option>
                <option>Sarah M.</option>
                <option>David K.</option>
                <option>Grace L.</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">DATE *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Topic and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">TOPIC / SUBJECT *</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="e.g. Foundation School Class 1"
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">DURATION (MIN) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="60"
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Method and Progress Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">METHOD</label>
              <select
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="in_person">In Person</option>
                <option value="phone_call">Phone Call</option>
                <option value="video_call">Video Call</option>
                <option value="text_message">Text Message</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">PROGRESS LEVEL</label>
              <select
                name="progress_level"
                value={formData.progress_level}
                onChange={handleInputChange}
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="mature">Mature</option>
              </select>
            </div>
          </div>

          {/* Location and Attendance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">LOCATION</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Church Office"
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">ATTENDANCE</label>
              <select
                name="attendance_status"
                value={formData.attendance_status}
                onChange={handleInputChange}
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>

          {/* Areas Discussed */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">AREAS DISCUSSED</label>
            <input
              type="text"
              name="areas_discussed"
              value={formData.areas_discussed}
              onChange={handleInputChange}
              placeholder="Prayer, Bible Study, Personal Growth (comma separated)"
              className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Prayer Requests and Challenges */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">PRAYER REQUESTS</label>
              <textarea
                name="prayer_requests"
                value={formData.prayer_requests}
                onChange={handleInputChange}
                placeholder="Specific prayer needs (comma separated)"
                rows={3}
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">CHALLENGES FACED</label>
              <textarea
                name="challenges_faced"
                value={formData.challenges_faced}
                onChange={handleInputChange}
                placeholder="Any difficulties or obstacles discussed"
                rows={3}
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          {/* Follow-up Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                name="follow_up_needed"
                checked={formData.follow_up_needed}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-xs font-semibold text-muted-foreground tracking-wide">FOLLOW-UP NEEDED</label>
            </div>
            {formData.follow_up_needed && (
              <input
                type="date"
                name="follow_up_date"
                value={formData.follow_up_date}
                onChange={handleInputChange}
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">NOTES</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional observations, outcomes, or remarks"
              rows={4}
              className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded px-6 py-2 text-sm font-semibold text-foreground border border-input hover:bg-muted transition-colors disabled:opacity-50"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="rounded px-6 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'SAVING...' : 'SAVE SESSION'}
          </button>
        </div>
      </div>
    </div>
  )
}
