'use client';

import { Card } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useParams } from 'next/navigation';
import { useWorkerById } from '@/hooks/workers';
import { Check, Loader2, Pencil } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { updateWorker } from '@/services/workers';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@workspace/ui/lib/sonner';
import { useChurchesOption } from '@/hooks/churches';
import { useFellowshipsOption } from '@/hooks/fellowships';
import { useCellsOption } from '@/hooks/cell';
import { useDepartmentsOption } from '@/hooks/departments';
import { FormSelectField } from '@/components/forms';
import { usePrayerGroupOption } from '@/hooks/prayer_groups';
import { useMe } from '@/hooks/useMe';
import { ROLES } from '@/utils/constants';

export default function WorkerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [editedData, setEditedData] = useState<any>(null);
  const { data, isLoading } = useWorkerById(id);
  const { data: churches } = useChurchesOption();
  const { data: departments } = useDepartmentsOption();
  const [worker, setWorker] = useState<any>({
    first_name: '',
    last_name: '',
    gender: '',
    church_id: '',
    fellowship_id: '',
    cell_id: '',
    department_id: '',
    prayer_group_id: '',
  });
  const { data: fellowships } = useFellowshipsOption(worker.church_id);
  const { data: cells } = useCellsOption(worker.fellowship_id);
  const { data: user } = useMe();
  const { data: prayerGroups } = usePrayerGroupOption();

  const lockChurchSelect =
    !!user && ![ROLES.ADMIN, ROLES.PASTOR].includes(user?.role);

  const lockFellowshipSelect =
    !!user &&
    ![ROLES.ADMIN, ROLES.PASTOR, ROLES.CHURCH_PASTOR].includes(user?.role);
  const lockCellSelect =
    !!user &&
    ![
      ROLES.ADMIN,
      ROLES.PASTOR,
      ROLES.CHURCH_PASTOR,
      ROLES.FELLOWSHIP_LEADER,
    ].includes(user?.role);

  useEffect(() => {
    if (data) {
      setWorker({
        ...data,
        full_name: `${data.first_name} ${data.last_name}`,
        prayer_group_id: data.prayer_group_id?.toString() || '',
      });
    }
  }, [data]);

  const churchOptions = useMemo(() => {
    if (lockChurchSelect) {
      return [
        {
          value: user?.church_id?.toString(),
          label: user?.church_name || '',
        },
      ];
    }
    return churches;
  }, [user, churches, lockChurchSelect]);

  const fellowshipOptions = useMemo(() => {
    if (lockFellowshipSelect) {
      return [
        {
          value: user?.fellowship_id?.toString(),
          label: user?.fellowship_name || '',
        },
      ];
    }
    return fellowships;
  }, [user, fellowships, lockFellowshipSelect]);

  const cellOptions = useMemo(() => {
    if (lockCellSelect) {
      return [
        {
          value: user?.cell_id?.toString(),
          label: user?.cell_name || '',
        },
      ];
    }
    return cells;
  }, [user, cells, lockCellSelect]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      updateWorker(id, {
        ...data,
        church_id: Number(data.church_id),
        fellowship_id: Number(data.fellowship_id),
        cell_id: Number(data.cell_id),
        department_id: Number(data.department_id),
        prayer_group_id: Number(data.prayer_group_id),
        first_name: data.full_name.split(' ')[0],
        last_name: data.full_name.split(' ')[1],
      }),
    onSuccess: () => {
      toast.success('Worker updated successfully');
    },
    onError: () => {
      toast.error('Failed to update worker');
    },
  });

  const currentData = {
    ...worker,
    ...(editedData || {}),
  };

  const handleSave = () => {
    if (!editedData) return;

    mutation.mutate({
      ...currentData,
      active: true,
    });
  };

  const handleCancel = () => {
    setEditedData(null);
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>Loading...</div>
    );
  }

  if (!worker) {
    return (
      <div className='flex justify-center items-center h-full'>
        Worker not found
      </div>
    );
  }

  const onChange = (name: string) => (value: any) => {
    setEditedData((prev: any) => ({ ...prev, [name]: value.target.value }));
  };

  const onSelect = (name: string) => (value: any) => {
    setEditedData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className='flex-1 flex p-4 sm:p-6 w-full flex-col sm:gap-6 gap-4'>
      {/* Main Content Card */}
      <div className='flex justify-between items-center'>
        <div className='flex gap-6 w-full sm:flex-row flex-col'>
          {/* Date Joined Card */}
          <div className='bg-[#fff] rounded-lg p-4 flex-1 flex flex-col items-start shadow-sm min-w-[200px]'>
            <div className='flex items-center gap-2 mb-2'>
              <span>
                {/* Calendar Icon */}
                <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                  <rect
                    x='3'
                    y='5'
                    width='18'
                    height='16'
                    rx='2'
                    stroke='#E11D48'
                    strokeWidth='2'
                  />
                  <path
                    d='M16 3v4M8 3v4'
                    stroke='#E11D48'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                  <path d='M3 9h18' stroke='#E11D48' strokeWidth='2' />
                </svg>
              </span>
              <span className='text-xs text-gray-500 font-medium'>
                Date Joined
              </span>
            </div>
            <span className='text-lg font-bold text-[#7C6846]'>
              {worker.member_since
                ? new Date(worker.member_since).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '--'}
            </span>
          </div>
          {/* worker since Card */}
          <div className='bg-[#fff] rounded-lg p-4 flex-1 flex flex-col items-start shadow-sm min-w-[200px]'>
            <div className='flex items-center gap-2 mb-2'>
              <span>
                {/* Calendar Icon */}
                <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                  <rect
                    x='3'
                    y='5'
                    width='18'
                    height='16'
                    rx='2'
                    stroke='#E11D48'
                    strokeWidth='2'
                  />
                  <path
                    d='M16 3v4M8 3v4'
                    stroke='#E11D48'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                  <path d='M3 9h18' stroke='#E11D48' strokeWidth='2' />
                </svg>
              </span>
              <span className='text-xs text-gray-500 font-medium'>
                Worker since
              </span>
            </div>
            <span className='text-lg font-bold text-[#7C6846]'>
              {worker.worker_since
                ? new Date(worker.worker_since).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '--'}
            </span>
          </div>
          {/* Date of Birth Card */}
          <div className='bg-[#fff] rounded-lg p-4 flex-1 flex flex-col items-start shadow-sm min-w-[200px]'>
            <div className='flex items-center gap-2 mb-2'>
              <span>
                {/* User Icon */}
                <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                  <circle
                    cx='12'
                    cy='8'
                    r='4'
                    stroke='#E11D48'
                    strokeWidth='2'
                  />
                  <path
                    d='M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4'
                    stroke='#E11D48'
                    strokeWidth='2'
                  />
                </svg>
              </span>
              <span className='text-xs text-gray-500 font-medium'>
                Date of Birth
              </span>
            </div>
            <span className='text-lg font-bold text-[#7C6846]'>
              {worker.dob
                ? new Date(worker.dob).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '--'}
            </span>
          </div>
        </div>
      </div>

      <Card className='bg-white p-4 sm:p-8 rounded-lg flex-1'>
        <h2 className='text-2xl font-semibold text-red-500 mb-8 text-center'>
          {worker.first_name || 'Worker Details'}
        </h2>

        {/* Member Details Form */}
        <div className='space-y-6 max-w-2xl mx-auto'>
          <FormField
            label='Full Name'
            value={currentData.full_name}
            onChange={onChange('full_name')}
          />
          <FormSelectField
            label='Gender'
            value={currentData.gender}
            onEdit={onSelect('gender')}
            options={[
              {
                value: 'male',
                label: 'Male',
              },
              {
                value: 'female',
                label: 'Female',
              },
            ]}
          />

          <FormSelectField
            label='Church'
            value={`${currentData.church_id}`}
            onEdit={onSelect('church_id')}
            options={churchOptions}
          />

          <FormSelectField
            label='Fellowship/PCF'
            value={`${currentData.fellowship_id}`}
            onEdit={onSelect('fellowship_id')}
            options={fellowshipOptions}
          />

          <FormSelectField
            label='Cell'
            value={`${currentData.cell_id}`}
            onEdit={onSelect('cell_id')}
            options={cellOptions}
          />
          <FormSelectField
            label='Department'
            value={`${currentData.department_id}`}
            onEdit={onSelect('department_id')}
            options={departments}
          />

          <FormSelectField
            label='Assign a Role'
            value={currentData.status}
            onEdit={onSelect('status')}
            options={[
              {
                value: 'member',
                label: 'Member',
              },
              {
                value: 'worker',
                label: 'Worker',
              },
              {
                value: 'cell_leader',
                label: 'Cell Leader',
              },
              {
                value: 'fellowship_leader',
                label: 'Fellowship Leader',
              },
              {
                value: 'church_pastor',
                label: 'Church Pastor',
              },
            ]}
          />

          <FormField
            label='Phone Number'
            value={currentData.phone_number}
            onChange={onChange('phone_number')}
          />
          <FormField
            label='Home Address'
            value={currentData.house_address}
            onChange={onChange('house_address')}
          />
          <FormField
            label='Work Address'
            value={currentData.work_address}
            onChange={onChange('work_address')}
          />

          <FormSelectField
            label='Prayer Group'
            value={currentData.prayer_group_id}
            onEdit={onSelect('prayer_group_id')}
            options={prayerGroups}
          />

          <div className='pt-8 flex justify-center gap-6'>
            <Button
              variant='outline'
              className='border-red-300 text-red-500 px-8'
              onClick={handleCancel}
            >
              Reset
            </Button>
            <Button
              className='bg-red-500 hover:bg-red-600 px-8'
              onClick={handleSave}
              disabled={!editedData || mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  editable?: boolean;
  dropdown?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FormField({ label, value, onChange }: FormFieldProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className='space-y-2'>
      <label className='block text-sm font-medium'>{label}</label>
      <div className='relative'>
        <div className='relative'>
          <Input
            value={value}
            className='w-full border-gray-300 rounded-md pr-10'
            readOnly={!isEditing}
            onChange={onChange}
          />
          {isEditing ? (
            <span
              className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'
              onClick={() => setIsEditing(false)}
            >
              <Check size={18} className='text-green-500' />
            </span>
          ) : (
            <span
              className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={18} className='text-red-500' />
            </span>
          )}
          {/* {isEditing && (
            <span className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'>
              <X size={18} className='text-gray-400' />
            </span>
          )} */}
        </div>
      </div>
    </div>
  );
}
