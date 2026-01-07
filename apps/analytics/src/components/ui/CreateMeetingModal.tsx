"use client"

import type React from "react"
import { useState } from "react"
import { X, Clock, MapPin, Calendar, Users } from "lucide-react"
import { createChurchMeeting, CreateChurchMeetingData } from '@/services/churchMeetings'

interface CreateMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  name: string;
  type: 'sunday_service' | 'midweek_service' | 'prayer_meeting' | 'special_service' | 'other';
  description: string;
  church_id: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
  frequency: 'once' | 'weekly' | 'monthly' | 'yearly';
  max_participants: string;
}

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0]!;
};

export function CreateMeetingModal({ isOpen, onClose, onSuccess }: CreateMeetingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "sunday_service",
    description: "",
    church_id: "church-1", // Default church ID - should be dynamic in real app
    location: "",
    date: getTodayDateString(),
    start_time: "08:00",
    end_time: "10:00",
    frequency: "weekly",
    max_participants: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.location.trim()) {
      alert("Please fill in all required fields (Name and Location)");
      return;
    }

    setIsLoading(true);

    const meetingData: CreateChurchMeetingData = {
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description.trim() || undefined,
      church_id: formData.church_id,
      location: formData.location.trim(),
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time || undefined,
      frequency: formData.frequency,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
    };

    try {
      await createChurchMeeting(meetingData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error creating church meeting:", error);
      alert("Failed to create meeting. Please try again.");
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
          <h2 className="text-xl font-semibold text-foreground">Create New Meeting</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">MEETING NAME *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Sunday Morning Service"
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">MEETING TYPE</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="sunday_service">Sunday Service</option>
                <option value="midweek_service">Midweek Service</option>
                <option value="prayer_meeting">Prayer Meeting</option>
                <option value="special_service">Special Service</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Location and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">LOCATION *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Main Auditorium"
                  className="w-full rounded border border-input bg-white pl-10 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">DATE</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full rounded border border-input bg-white pl-10 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Time and Frequency */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">START TIME</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full rounded border border-input bg-white pl-10 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">END TIME</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full rounded border border-input bg-white pl-10 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">FREQUENCY</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="w-full rounded border border-input bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="once">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Max Participants */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">MAX PARTICIPANTS</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
                className="w-full rounded border border-input bg-white pl-10 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">DESCRIPTION</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description or special instructions"
              rows={3}
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
            className="rounded px-6 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'CREATING...' : 'CREATE MEETING'}
          </button>
        </div>
      </div>
    </div>
  )
}