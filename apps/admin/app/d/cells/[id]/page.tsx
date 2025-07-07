'use client';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useParams } from 'next/navigation';
import { useCellById } from '@/hooks/cell';
import { CalendarIcon, Pencil, Users, Users2 } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updateCell } from '@/services/cell';
import { FormSelectField } from '@/components/forms';
import { useChurchesOption } from '@/hooks/churches';
import { useFellowshipsOption } from '@/hooks/fellowships';
import { LeaderSelector } from '@/components/WorkerSelector';
import { Label } from '@workspace/ui/components/label';
import { useMe } from '@/hooks/useMe';
import { MEETING_DAYS, ROLES } from '@/utils/constants';
import { DatePicker } from '@workspace/ui/components/date-picker';

// const formSchema = z.object({
//   name: z.string().min(2, {
//     message: 'Cell name must be at least 2 characters.',
//   }),
//   leader: z.string().min(2, {
//     message: 'Leader name must be at least 2 characters.',
//   }),
//   church: z.string().min(2, {
//     message: 'Church is required',
//   }),
//   fellowship: z.string().min(2, {
//     message: 'Fellowship is required',
//   }),
//   location: z.string().min(2, {
//     message: 'Location must be at least 2 characters.',
//   }),
//   address: z.string().min(5, {
//     message: 'Address must be at least 5 characters.',
//   }),
// });

export default function CellDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: cell, isLoading, refetch } = useCellById(id);
  const [editedData, setEditedData] = useState<any>(null);
  const { data: churches } = useChurchesOption();
  const { data: user, isAdmin } = useMe();

  const cellData = {
    name: cell?.name,
    leader_id: cell?.leader_id,
    church_id: cell?.church_id.toString(),
    fellowship_id: cell?.fellowship_id.toString(),
    location: cell?.location,
    address: cell?.address,
    dateStarted: cell?.start_date
      ? new Date(cell?.start_date)
      : new Date('2022-10-22'),
    workersInTraining: cell?.workers?.length || 0,
    members: cell?.members?.length || 0,
    meeting_days: cell?.meeting_days.toString(),
  };

  const currentData = {
    ...cellData,
    ...(editedData || {}),
  };

  const { data: fellowships } = useFellowshipsOption(currentData.church_id);

  const lockChurchSelect =
    !!user && ![ROLES.ADMIN, ROLES.PASTOR].includes(user?.role);

  const lockFellowshipSelect =
    !!user &&
    ![ROLES.ADMIN, ROLES.PASTOR, ROLES.CHURCH_PASTOR].includes(user?.role);

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

  const handleEdit = (field: string, value: string | Date | undefined) => {
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
            label='Cell Name'
            value={currentData.name}
            onEdit={(value) => handleEdit('name', value)}
          />

          <div className='space-y-2'>
            <Label className='block text-sm font-medium'>Name of Leader</Label>

            <LeaderSelector
              selectedWorker={currentData.leader_id}
              setSelectedWorker={(worker) => {
                handleEdit('leader_id', worker);
              }}
              churchId={isAdmin ? undefined : user?.church_id?.toString()}
            />
          </div>
          <FormSelectField
            label='Church'
            value={currentData.church_id}
            onEdit={(value) => handleEdit('church_id', value)}
            options={churchOptions}
          />

          <FormSelectField
            label='Fellowship/PCF'
            value={currentData.fellowship_id}
            onEdit={(value) => handleEdit('fellowship_id', value)}
            options={fellowshipOptions}
          />

          <FormSelectField
            label='Meeting Days'
            value={currentData.meeting_days}
            onEdit={(value) => handleEdit('meeting_days', value)}
            options={MEETING_DAYS}
          />

          <FormField
            label='Address'
            value={currentData.address}
            onEdit={(value) => handleEdit('address', value)}
          />

          <div className='space-y-2'>
            <Label className='block text-sm font-medium'>Date Started</Label>
            <DatePicker
              value={currentData.dateStarted}
              onChange={(date) => handleEdit('dateStarted', date)}
            />
          </div>

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
}

function FormField({ label, value, onEdit }: FormFieldProps) {
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
