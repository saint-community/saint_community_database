'use client';

import { Card } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useParams } from 'next/navigation';
import { useWorkerById } from '@/hooks/workers';
import { Check, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { updateWorker } from '@/services/workers';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@workspace/ui/lib/sonner';

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useWorkerById(id);
  const [member, setMember] = useState<any>({
    first_name: '',
    last_name: '',
    gender: '',
    church_name: '',
    fellowship_name: '',
    cell_name: '',
    department_name: '',
  });

  useEffect(() => {
    if (data) {
      setMember({
        ...data,
        full_name: `${data.first_name} ${data.last_name}`,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (data: any) => updateWorker(id, data),
    onSuccess: () => {
      toast.success('Worker updated successfully');
    },
    onError: () => {
      toast.error('Failed to update worker');
    },
  });

  const handleSave = () => {
    mutation.mutate(member);
  };

  const handleCancel = () => {
    setMember({
      ...data,
      full_name: `${data.first_name} ${data.last_name}`,
    });
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>Loading...</div>
    );
  }

  if (!member) {
    return (
      <div className='flex justify-center items-center h-full'>
        Member not found
      </div>
    );
  }

  const onChange =
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setMember((prev: any) => ({ ...prev, [name]: e.target.value }));
    };

  return (
    <div className='flex-1 flex p-6 w-full flex-col gap-6'>
      {/* Main Content Card */}
      <div className='flex justify-between items-center'>
        <div className='flex gap-6 w-full'>
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
              {member.member_since
                ? new Date(member.member_since).toLocaleDateString('en-GB', {
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
              {member.dob
                ? new Date(member.dob).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '--'}
            </span>
          </div>
        </div>
      </div>

      <Card className='bg-white p-8 rounded-lg flex-1'>
        <h2 className='text-2xl font-semibold text-red-500 mb-8 text-center'>
          {member.first_name || 'Member Details'}
        </h2>

        {/* Member Details Form */}
        <div className='space-y-6 max-w-2xl mx-auto'>
          <FormField
            label='Full Name'
            value={member.full_name}
            onChange={onChange('full_name')}
          />
          <FormField label='Gender' value={member.gender} dropdown />
          <FormField
            label='Church'
            value={member.church_name}
            dropdown
            onChange={onChange('church')}
          />
          <FormField
            label='Fellowship/PCF'
            value={member.fellowship_name}
            dropdown
            onChange={onChange('fellowship')}
          />
          <FormField
            label='Cell'
            value={member.cell_name}
            dropdown
            onChange={onChange('cell')}
          />
          <FormField
            label='Department'
            value={member.department}
            dropdown
            onChange={onChange('department')}
          />
          <FormField
            label='Role'
            value={member.role}
            dropdown
            onChange={onChange('role')}
          />
          <FormField
            label='Phone Number'
            value={member.phone_number}
            onChange={onChange('phone_number')}
          />
          <FormField
            label='Home Address'
            value={member.house_address}
            onChange={onChange('house_address')}
          />
          <FormField
            label='Work Address'
            value={member.work_address}
            onChange={onChange('work_address')}
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
            >
              Save
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
