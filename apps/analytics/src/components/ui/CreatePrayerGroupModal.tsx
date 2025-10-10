'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/libutils';
import { useCreatePrayerGroup } from '@/hooks/usePrayerGroups';
import type { CreatePrayerGroupData } from '@/services/prayerGroup';

interface CreatePrayerGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreatePrayerGroupModal({
  isOpen,
  onClose,
  onSuccess
}: CreatePrayerGroupModalProps) {
  const [formData, setFormData] = useState<CreatePrayerGroupData>({
    name: '',
    description: '',
    church_id: '',
    leader_id: '',
    meeting_day: '',
    meeting_time: '',
    location: '',
    max_participants: undefined,
  });

  const createPrayerGroup = useCreatePrayerGroup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createPrayerGroup.mutateAsync({
        ...formData,
        max_participants: formData.max_participants || undefined,
      });
      
      setFormData({
        name: '',
        description: '',
        church_id: '',
        leader_id: '',
        meeting_day: '',
        meeting_time: '',
        location: '',
        max_participants: undefined,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create prayer group:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_participants' ? (value ? parseInt(value, 10) : undefined) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Create Prayer Group</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Prayer Group Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter prayer group name"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter prayer group description"
            />
          </div>

          {/* Church ID */}
          <div>
            <label htmlFor="church_id" className="block text-sm font-medium text-gray-700 mb-2">
              Church ID *
            </label>
            <input
              type="text"
              id="church_id"
              name="church_id"
              value={formData.church_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter church ID"
            />
          </div>

          {/* Leader ID */}
          <div>
            <label htmlFor="leader_id" className="block text-sm font-medium text-gray-700 mb-2">
              Leader ID
            </label>
            <input
              type="text"
              id="leader_id"
              name="leader_id"
              value={formData.leader_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter leader ID"
            />
          </div>

          {/* Meeting Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="meeting_day" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Day
              </label>
              <select
                id="meeting_day"
                name="meeting_day"
                value={formData.meeting_day}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select day</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>

            <div>
              <label htmlFor="meeting_time" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Time
              </label>
              <input
                type="time"
                id="meeting_time"
                name="meeting_time"
                value={formData.meeting_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Location and Max Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter meeting location"
              />
            </div>

            <div>
              <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants
              </label>
              <input
                type="number"
                id="max_participants"
                name="max_participants"
                value={formData.max_participants || ''}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter max participants"
              />
            </div>
          </div>

          {/* Error Display */}
          {createPrayerGroup.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                Failed to create prayer group. Please try again.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none"
              disabled={createPrayerGroup.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPrayerGroup.isPending || !formData.name || !formData.church_id}
              className={cn(
                'px-4 py-2 bg-red-500 text-white rounded-md focus:outline-none',
                'hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center space-x-2'
              )}
            >
              {createPrayerGroup.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{createPrayerGroup.isPending ? 'Creating...' : 'Create Prayer Group'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}