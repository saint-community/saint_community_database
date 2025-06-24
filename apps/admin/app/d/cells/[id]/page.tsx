'use client';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useParams } from 'next/navigation';
import { useCellById } from '@/hooks/cell';
import { CalendarIcon, Pencil, Users, Users2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { updateCell } from '@/services/cell';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Cell name must be at least 2 characters.',
  }),
  leader: z.string().min(2, {
    message: 'Leader name must be at least 2 characters.',
  }),
  church: z.string().min(2, {
    message: 'Church is required',
  }),
  fellowship: z.string().min(2, {
    message: 'Fellowship is required',
  }),
  location: z.string().min(2, {
    message: 'Location must be at least 2 characters.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
});

export default function CellDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: cell, isLoading, refetch } = useCellById(id);
  const [editedData, setEditedData] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => updateCell(id, data),
    onSuccess: () => {
      refetch();
      setEditedData(null);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>Loading...</div>
    );
  }

  if (!cell) {
    return (
      <div className='flex justify-center items-center h-full'>
        Cell not found
      </div>
    );
  }

  const cellData = {
    name: cell.name || 'Kobiti',
    leader: cell.leader_name || 'Seun Odunola',
    church: cell.church_name || 'Surulere',
    fellowship: cell.fellowship_name || 'Surulere',
    location: cell.location || 'Kobiti',
    address: cell.address || '4, Kobiti Street, off Agege motor road, Mushin',
    dateStarted: cell.date_started
      ? new Date(cell.date_started)
      : new Date('2022-10-22'),
    workersInTraining: 5,
    members: 50,
  };

  const currentData = editedData || cellData;

  const handleEdit = (field: string, value: string) => {
    setEditedData({
      ...currentData,
      [field]: value,
    });
  };

  const handleReset = () => {
    setEditedData(null);
  };

  const handleSave = () => {
    mutation.mutate(editedData);
  };

  const formattedDate = format(cellData.dateStarted, 'do MMM. yyyy');

  return (
    <div className='flex-1 flex p-6 w-full flex-col gap-6'>
      {/* Stats Cards Row */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        <StatCard
          icon={<CalendarIcon className='text-red-500' />}
          label='Date Started'
          value={formattedDate}
        />
        <StatCard
          icon={<Users2 className='text-red-500' />}
          label='No. of Workers-In-Training:'
          value={cellData.workersInTraining.toString()}
        />
        <StatCard
          icon={<Users className='text-red-500' />}
          label='No. of members:'
          value={cellData.members.toString()}
        />
      </div>

      {/* Main Content Card */}
      <Card className='border border-blue-400 p-6 bg-white'>
        <h2 className='text-2xl font-semibold text-red-500 mb-8 text-center'>
          {currentData.name}
        </h2>

        {/* Cell Details Form */}
        <div className='space-y-5 mx-auto'>
          <FormField
            label='Name of Cell Leader'
            value={currentData.leader}
            onEdit={(value) => handleEdit('leader', value)}
            isEditing={!!editedData}
          />

          <FormField
            label='Church'
            value={currentData.church}
            onEdit={(value) => handleEdit('church', value)}
            isEditing={!!editedData}
          />

          <FormField
            label='Fellowship/PCF'
            value={currentData.fellowship}
            onEdit={(value) => handleEdit('fellowship', value)}
            isEditing={!!editedData}
          />

          <FormField
            label='Location'
            value={currentData.location}
            onEdit={(value) => handleEdit('location', value)}
            isEditing={!!editedData}
          />

          <FormField
            label='Address'
            value={currentData.address}
            onEdit={(value) => handleEdit('address', value)}
            isEditing={!!editedData}
          />

          <div className='pt-8 flex justify-center gap-6'>
            <Button
              variant='outline'
              className='border-red-300 text-red-500 px-8'
              onClick={handleReset}
              disabled={!editedData}
            >
              Reset
            </Button>
            <Button
              className='bg-red-500 hover:bg-red-600 px-8'
              onClick={handleSave}
              disabled={!editedData || mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card className='bg-white border-none shadow-sm'>
      <CardContent className='p-4 flex items-center gap-4'>
        <div className='h-12 w-12 flex items-center justify-center'>{icon}</div>
        <div>
          <p className='text-sm text-gray-600'>{label}</p>
          <p className='text-2xl font-semibold text-[#705C2F]'>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onEdit: (value: string) => void;
  isEditing: boolean;
}

function FormField({ label, value, onEdit, isEditing }: FormFieldProps) {
  const [isFieldEditing, setIsFieldEditing] = useState(false);

  return (
    <div className='space-y-2'>
      <label className='block text-sm font-medium'>{label}</label>
      <div className='relative'>
        <div className='relative'>
          <Input
            value={value}
            className='w-full border-gray-300 rounded-md pr-10'
            readOnly={!isFieldEditing}
            onChange={(e) => onEdit(e.target.value)}
          />
          <span
            className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'
            onClick={() => setIsFieldEditing(!isFieldEditing)}
          >
            <Pencil
              size={18}
              className={`${isFieldEditing ? 'text-green-500' : 'text-red-500'}`}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
