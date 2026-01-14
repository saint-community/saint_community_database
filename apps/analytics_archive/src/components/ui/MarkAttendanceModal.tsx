"use client"

import type React from "react"
import { useState } from "react"
import { X, Hash, MessageSquare } from "lucide-react"
import { markAttendance, MarkAttendanceData } from '@/services/churchMeetings'

interface MarkAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function MarkAttendanceModal({ isOpen, onClose, onSuccess }: MarkAttendanceModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [attendanceCode, setAttendanceCode] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async () => {
    if (!attendanceCode.trim()) {
      alert("Please enter the attendance code");
      return;
    }

    setIsLoading(true);

    const attendanceData: MarkAttendanceData = {
      attendance_code: attendanceCode.trim(),
      notes: notes.trim() || undefined,
    };

    try {
      await markAttendance(attendanceData);
      
      alert("Attendance marked successfully!");
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      setAttendanceCode("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Failed to mark attendance. Please check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setAttendanceCode(value);
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Mark Attendance</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* Instructions */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Enter the 6-digit attendance code provided by your meeting leader to mark your attendance.
            </p>
          </div>

          {/* Attendance Code Input */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">
              ATTENDANCE CODE *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={attendanceCode}
                onChange={handleCodeChange}
                placeholder="123456"
                maxLength={6}
                className="w-full rounded border border-input bg-white pl-12 pr-3 py-3 text-lg text-center font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring tracking-widest"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter the 6-digit code (numbers only)
            </p>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground tracking-wide">
              NOTES (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full rounded border border-input bg-white pl-10 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
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
            onClick={handleSubmit}
            disabled={isLoading || !attendanceCode.trim()}
            className="rounded px-6 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'MARKING...' : 'MARK ATTENDANCE'}
          </button>
        </div>
      </div>
    </div>
  )
}