'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/libutils';
import { Button } from '@workspace/ui/components/button';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import { z } from 'zod';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { FieldInfo } from '@workspace/ui/components/field-info';
// import { Checkbox } from '@workspace/ui/components/checkbox';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionsApi, CreateSubmissionDto } from '@/src/services/submissions';
import { studyGroupApi } from '@/src/services/studyGroup';
import { getChurches, getFellowships, getCells, Church, Fellowship, Cell } from '@/src/services/organizational';
import { AdminApiCaller } from '@/src/services/init';
import { QUERY_PATHS } from '@/src/utils/constants';
import { useMe } from '@/hooks/useMe';
import { useMembersOptions } from '@/hooks/useMembers';
import { toast } from '@workspace/ui/lib/sonner';

const formSchema = z.object({
  member_id: z.string().min(1, {
    message: 'Please select a member.',
  }),
  church_id: z.string().min(1, {
    message: 'Please select a church.',
  }),
  fellowship_id: z.string().optional(),
  cell_id: z.string().optional(),
  study_group_id: z.string().min(1, {
    message: 'Please select an assignment.',
  }),
  assignment_link: z.string().optional(),
  is_offline: z.boolean().default(false),
  feedback: z.string().optional(),
}).refine((data) => {
  // If not offline, assignment link is required
  if (!data.is_offline && (!data.assignment_link || data.assignment_link.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Submission link is required for online submissions.',
  path: ['assignment_link'],
});

interface AddSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
}

export function AddSubmissionModal({
  isOpen,
  onClose,
  onSuccess,
  className,
}: AddSubmissionModalProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const [fellowships, setFellowships] = useState<Fellowship[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [studyGroups, setStudyGroups] = useState<any[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    churches: true,
    fellowships: false,
    cells: false,
    studyGroups: false,
    members: false,
  });

  const queryClient = useQueryClient();
  const { data: user } = useMe();

  const form = useForm({
    defaultValues: {
      member_id: '',
      church_id: user?.church_id?.toString() || '',
      fellowship_id: 'none',
      cell_id: 'none',
      study_group_id: '',
      assignment_link: '',
      is_offline: false,
      feedback: '',
    },
    onSubmit: async ({ value }) => {
      // Validate manually since the schema validation isn't working well with TanStack Form
      if (!value.member_id) {
        throw new Error('Member selection is required');
      }
      if (!value.church_id) {
        throw new Error('Church selection is required');
      }
      if (!value.study_group_id) {
        throw new Error('Assignment selection is required');
      }
      if (!value.is_offline && !value.assignment_link?.trim()) {
        throw new Error('Submission link is required for online submissions');
      }
      
      await handleCreateSubmission(value);
    },
  });

  // Watch form values for dependent data loading
  const [churchId, setChurchId] = useState(user?.church_id?.toString() || '');
  const [fellowshipId, setFellowshipId] = useState('none');
  const [isOffline, setIsOffline] = useState(false);

  // Use members hook to fetch church members
  const { data: members = [], isLoading: membersLoading, error: membersError } = useMembersOptions(churchId);

  // Create submission mutation
  const createSubmissionMutation = useMutation({
    mutationFn: submissionsApi.create,
    onSuccess: () => {
      toast.success('Submission added successfully');
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      handleClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create submission');
    },
  });

  const handleCreateSubmission = async (formData: any) => {
    setIsLoading(true);
    try {
      // Get member name from the members options
      const memberName = members.find(m => m.value === formData.member_id)?.label || 'Unknown Member';
      
      const submissionData: CreateSubmissionDto = {
        member_name: memberName,
        study_group_id: formData.study_group_id,
        assignment_link: formData.is_offline ? undefined : formData.assignment_link?.trim(),
        submission_method: formData.is_offline ? 'offline_by_leader' : 'online_by_member',
        submitter_role: 'leader', // Assuming admin/leader is creating submission
        member_church_id: parseInt(formData.church_id),
        member_fellowship_id: formData.fellowship_id && formData.fellowship_id !== 'none' ? parseInt(formData.fellowship_id) : undefined,
        member_id: formData.cell_id && formData.cell_id !== 'none' ? parseInt(formData.cell_id) : undefined,
        feedback: formData.feedback?.trim() || undefined,
      };

      await createSubmissionMutation.mutateAsync(submissionData);
    } catch (error) {
      console.error('Error creating submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update form and state when user data becomes available
  useEffect(() => {
    if (user && isOpen) {
      // Update form values - only pre-select church
      form.setFieldValue('church_id', user.church_id?.toString() || '');
      form.setFieldValue('fellowship_id', 'none');
      form.setFieldValue('cell_id', 'none');
      form.setFieldValue('member_id', '');
      
      // Update local state
      setChurchId(user.church_id?.toString() || '');
      setFellowshipId('none');
    }
  }, [user, isOpen, form]);

  // Load churches on mount
  useEffect(() => {
    if (!isOpen) return;

    const loadChurches = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, churches: true }));
        
        // Call API directly to handle the response structure
        const response = await AdminApiCaller.get(QUERY_PATHS.CHURCHES);
        console.log('Churches raw API response:', response.data); // Debug log
        
        // Extract churches from nested response structure
        let churchesData = [];
        if (response.data?.data?.data) {
          churchesData = response.data.data.data;
        } else if (response.data?.data) {
          churchesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          churchesData = response.data;
        }
        
        setChurches(Array.isArray(churchesData) ? churchesData : []);
      } catch (error) {
        console.error('Error loading churches:', error);
        toast.error('Failed to load churches');
        setChurches([]);
      } finally {
        setLoadingStates(prev => ({ ...prev, churches: false }));
      }
    };

    loadChurches();
  }, [isOpen]);

  // Load fellowships when church changes
  useEffect(() => {
    if (!churchId) {
      setFellowships([]);
      setCells([]);
      form.setFieldValue('fellowship_id', 'none');
      form.setFieldValue('cell_id', 'none');
      form.setFieldValue('member_id', '');
      return;
    }

    const loadFellowships = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, fellowships: true }));
        
        // Call API directly to handle the response structure
        const response = await AdminApiCaller.get(QUERY_PATHS.FELLOWSHIPS, {
          params: { church_id: churchId },
        });
        console.log('Fellowships raw API response:', response.data); // Debug log
        
        // Extract fellowships from nested response structure
        let fellowshipsData = [];
        if (response.data?.data?.data) {
          fellowshipsData = response.data.data.data;
        } else if (response.data?.data) {
          fellowshipsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          fellowshipsData = response.data;
        }
        
        const fellowshipsArray = Array.isArray(fellowshipsData) ? fellowshipsData : [];
        setFellowships(fellowshipsArray);
      } catch (error) {
        console.error('Error loading fellowships:', error);
        toast.error('Failed to load fellowships');
        setFellowships([]);
      } finally {
        setLoadingStates(prev => ({ ...prev, fellowships: false }));
      }
    };

    loadFellowships();
  }, [churchId, form, user]);

  // Load cells when church changes (not fellowship dependent)
  useEffect(() => {
    if (!churchId) {
      setCells([]);
      form.setFieldValue('cell_id', 'none');
      return;
    }

    const loadCells = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, cells: true }));
        
        // Call API directly to handle the response structure
        const response = await AdminApiCaller.get(QUERY_PATHS.CELLS, {
          params: { church_id: churchId },
        });
        console.log('Cells raw API response:', response.data); // Debug log
        
        // Extract cells from nested response structure
        let cellsData = [];
        if (response.data?.data?.data) {
          cellsData = response.data.data.data;
        } else if (response.data?.data) {
          cellsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          cellsData = response.data;
        }
        
        const cellsArray = Array.isArray(cellsData) ? cellsData : [];
        setCells(cellsArray);
      } catch (error) {
        console.error('Error loading cells:', error);
        toast.error('Failed to load cells');
        setCells([]);
      } finally {
        setLoadingStates(prev => ({ ...prev, cells: false }));
      }
    };

    loadCells();
  }, [churchId, form, user]);

  // Load study groups when church changes
  useEffect(() => {
    if (!churchId) {
      setStudyGroups([]);
      form.setFieldValue('study_group_id', '');
      return;
    }

    const loadStudyGroups = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, studyGroups: true }));
        const studyGroupsData = await studyGroupApi.getAll({ 
          church_id: parseInt(churchId),
          status: 'active'
        });
        setStudyGroups(Array.isArray(studyGroupsData) ? studyGroupsData : []);
      } catch (error) {
        console.error('Error loading study groups:', error);
        toast.error('Failed to load assignments');
      } finally {
        setLoadingStates(prev => ({ ...prev, studyGroups: false }));
      }
    };

    loadStudyGroups();
  }, [churchId, form]);

  const handleClose = () => {
    form.reset();
    setIsLoading(false);
    // Reset state - only church pre-selected
    setChurchId(user?.church_id?.toString() || '');
    setFellowshipId('none');
    setIsOffline(false);
    setChurches([]);
    setFellowships([]);
    setCells([]);
    setStudyGroups([]);
    setLoadingStates({
      churches: true,
      fellowships: false,
      cells: false,
      studyGroups: false,
      members: false,
    });
    onClose();
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload an Assignment</h2>
              <p className="text-sm text-gray-500">Kindly fill in details of assignment below</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex-1 w-full space-y-6 p-6"
        >
          {/* Church Field */}
          <div className="space-y-2">
            <Label htmlFor="church_id">Church *</Label>
            <form.Field
              name="church_id"
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value);
                      setChurchId(value);
                    }}
                    disabled={loadingStates.churches}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue 
                        placeholder={
                          loadingStates.churches ? "Loading churches..." : "Select a church"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {churches.map((church) => (
                        <SelectItem key={church.id} value={church.id.toString()}>
                          {church.name}
                        </SelectItem>
                      ))}
                      {churches.length === 0 && !loadingStates.churches && (
                        <SelectItem value="no-churches" disabled>
                          No churches found
                        </SelectItem>
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
            <Label htmlFor="fellowship_id">Fellowship</Label>
            <form.Field
              name="fellowship_id"
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value);
                      setFellowshipId(value);
                    }}
                    disabled={loadingStates.fellowships || !churchId}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue
                        placeholder={
                          !churchId
                            ? "Select a church first"
                            : loadingStates.fellowships
                              ? "Loading fellowships..."
                              : "Select a fellowship (optional)"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {fellowships.map((fellowship) => (
                        <SelectItem key={fellowship.id} value={fellowship.id.toString()}>
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
            <Label htmlFor="cell_id">Cell</Label>
            <form.Field
              name="cell_id"
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    disabled={loadingStates.cells || !churchId}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue
                        placeholder={
                          !churchId
                            ? "Select a church first"
                            : loadingStates.cells
                              ? "Loading cells..."
                              : "Select a cell (optional)"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {cells.map((cell) => (
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

          {/* Member Selection Field */}
          <div className="space-y-2">
            <Label htmlFor="member_id">Member *</Label>
            <form.Field
              name="member_id"
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    disabled={!churchId || membersLoading}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue
                        placeholder={
                          !churchId
                            ? "Select a church first"
                            : membersLoading
                              ? "Loading members..."
                              : "Select a member"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.value} value={member.value}>
                          {member.label}
                        </SelectItem>
                      ))}
                      {members.length === 0 && !membersLoading && (
                        <SelectItem value="no-members" disabled>
                          No members found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                  {membersError && (
                    <p className="text-sm text-red-500">Failed to load members</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Select Assignment Field */}
          <div className="space-y-2">
            <Label htmlFor="study_group_id">Select Assignment *</Label>
            <form.Field
              name="study_group_id"
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    disabled={loadingStates.studyGroups || !churchId}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue
                        placeholder={
                          !churchId
                            ? "Select a church first"
                            : loadingStates.studyGroups
                              ? "Loading assignments..."
                              : "Select an assignment"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {studyGroups.map((studyGroup) => (
                        <SelectItem key={studyGroup.id} value={studyGroup.id}>
                          {studyGroup.title}
                          {studyGroup.week_number && (
                            <span className="ml-2 text-xs text-gray-500">
                              (Week {studyGroup.week_number})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>

          {/* Offline Submission Checkbox */}
          <div className="space-y-2">
            <form.Field
              name="is_offline"
              children={(field) => (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_offline"
                    checked={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.checked);
                      setIsOffline(e.target.checked);
                      if (e.target.checked) {
                        form.setFieldValue('assignment_link', '');
                      }
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="is_offline" className="text-sm font-normal">
                    Offline Submission?
                  </Label>
                </div>
              )}
            />
          </div>

          {/* Submission Link Field - Only show if not offline */}
          {!isOffline && (
            <div className="space-y-2">
              <Label htmlFor="assignment_link">Submission Link *</Label>
              <form.Field
                name="assignment_link"
                children={(field) => (
                  <>
                    <Input
                      id="assignment_link"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter submission link (e.g., https://docs.google.com/...)"
                      className="h-[48px]"
                      type="url"
                    />
                    <FieldInfo field={field} />
                  </>
                )}
              />
            </div>
          )}

          {/* Feedback Field */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Notes (Optional)</Label>
            <form.Field
              name="feedback"
              children={(field) => (
                <>
                  <textarea
                    id="feedback"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Add any additional notes or feedback..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-[48px] px-6"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-[48px] px-6 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Submission'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}