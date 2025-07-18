'use client';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { useParams } from 'next/navigation';
import { useFellowshipById } from '@/hooks/fellowships';
import { CalendarIcon, Loader2, Users, Users2 } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updateFellowship } from '@/services/fellowships';
import { LeaderSelector } from '@/components/WorkerSelector';
import { Label } from '@workspace/ui/components/label';
import { useChurchesOption } from '@/hooks/churches';
import { FormSelectField, FormField } from '@/components/forms';
import { useMe } from '@/hooks/useMe';
import { DatePicker } from '@workspace/ui/components/date-picker';
import { ROLES } from '@/utils/constants';

// const formSchema = z.object({
//   name: z.string().min(2, {
//     message: 'Fellowship name must be at least 2 characters.',
//   }),
//   leader: z.string().min(2, {
//     message: 'Leader name must be at least 2 characters.',
//   }),
//   church: z.string().min(2, {
//     message: 'Church is required',
//   }),
//   location: z.string().min(2, {
//     message: 'Location must be at least 2 characters.',
//   }),
//   address: z.string().min(5, {
//     message: 'Address must be at least 5 characters.',
//   }),
// });

export default function FellowshipDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: fellowship, isLoading, refetch } = useFellowshipById(id);
  const [editedData, setEditedData] = useState<any>(null);
  const { data: churches } = useChurchesOption();
  const { data: user, isAdmin } = useMe();

  const lockChurchSelect =
    !!user && ![ROLES.ADMIN, ROLES.PASTOR].includes(user?.role);

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

  const mutation = useMutation({
    mutationFn: (data: any) => updateFellowship(id, data),
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

  if (!fellowship) {
    return (
      <div className='flex justify-center items-center h-full'>
        Fellowship not found
      </div>
    );
  }

  const fellowshipData = {
    name: fellowship.name,
    cordinator_id: fellowship.cordinator_id,
    church_id: fellowship.church_id.toString(),
    location: fellowship.location,
    address: fellowship.address || '',
    dateStarted: fellowship.start_date
      ? new Date(fellowship.start_date)
      : new Date('2022-10-22'),
    cellLeaders: 15,
    workersInTraining: fellowship?.workers?.length || 0,
    members: fellowship?.members?.length || 0,
  };

  const currentData = {
    ...fellowshipData,
    ...(editedData || {}),
  };

  const formattedDate = format(currentData.dateStarted, 'do MMM. yyyy');

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
    if (!editedData) return;

    mutation.mutate({
      name: editedData.name,
      cordinator_id: editedData.cordinator_id,
      church_id: editedData.church_id,
      location: editedData.location,
      address: editedData.address,
      start_date: editedData.dateStarted,
    });
  };

  return (
    <div className='flex-1 flex p-4 sm:p-6 w-full flex-col sm:gap-6 gap-4'>
      {/* Stats Cards Row */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <StatCard
          icon={<CalendarIcon className='text-red-500' />}
          label='Date Started'
          value={formattedDate}
        />
        <StatCard
          icon={<Users className='text-red-500' />}
          label='No. of Cell Leaders'
          value={currentData.cellLeaders.toString()}
        />
        <StatCard
          icon={<Users2 className='text-red-500' />}
          label='No. of Workers-In-Training:'
          value={currentData.workersInTraining.toString()}
        />
        <StatCard
          icon={<Users className='text-red-500' />}
          label='No. of members:'
          value={currentData.members.toString()}
        />
      </div>

      {/* Main Content Card */}
      <Card className='bg-white p-4 sm:p-8 rounded-lg flex-1'>
        <h2 className='text-2xl font-semibold text-red-500 mb-8 text-center'>
          {currentData.name}
        </h2>

        {/* Fellowship Details Form */}
        <div className='space-y-6 max-w-2xl mx-auto'>
          <FormField
            label='Fellowship Name'
            value={currentData.name}
            onEdit={(value) => handleEdit('name', value)}
          />

          <div className='space-y-2'>
            <Label className='block text-sm font-medium'>Name of Leader</Label>

            <LeaderSelector
              selectedWorker={currentData.cordinator_id}
              setSelectedWorker={(worker) => {
                handleEdit('cordinator_id', worker);
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
