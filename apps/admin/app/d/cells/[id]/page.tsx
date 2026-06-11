'use client';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useParams } from 'next/navigation';
import { useCellById } from '@/hooks/cell';
import { CalendarIcon, Loader2, Pencil, Users, Users2 } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updateCell } from '@/services/cell';
import { FormSelectField } from '@/components/forms';
import { useChurchesOption } from '@/hooks/churches';
import { useFellowshipsOption } from '@/hooks/fellowships';
import { Label } from '@workspace/ui/components/label';
import { useMe } from '@/hooks/useMe';
import { ROLES } from '@/utils/constants';
import { DatePicker } from '@workspace/ui/components/date-picker';
import { toast } from '@workspace/ui/lib/sonner';
import { useChurchAccountOptions } from '@/hooks/auth';
import countries from '@/utils/countries.json';

const uniqueCountries = Array.from(
  new Map((countries as any[]).map((country) => [country.name, country])).values()
);

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
  const { data: leaderOptions } = useChurchAccountOptions(
    cell?.church_id || user?.church_id
  );

  const cellData = {
    name: cell?.name,
    leader_id: cell?.leader_id,
    church_id: cell?.church_id.toString(),
    fellowship_id: cell?.fellowship_id.toString(),
    country: cell?.country || '',
    state: cell?.state || '',
    area: cell?.area || '',
    address: cell?.address || '',
    active: cell?.active || 'yes',
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

  const countryOptions = useMemo(
    () =>
      uniqueCountries.map((country) => ({
        value: country.name,
        label: country.name,
      })),
    []
  );

  const selectedCountry = editedData?.country ?? cell?.country ?? '';
  const selectedState = editedData?.state ?? cell?.state ?? '';

  const stateOptions = useMemo(() => {
    const country = uniqueCountries.find(
      (item) => item.name === selectedCountry
    );
    return (country?.states || []).map((state: any) => ({
      value: state.name,
      label: state.name,
    }));
  }, [selectedCountry]);

  const areaOptions = useMemo(() => {
    const country = uniqueCountries.find(
      (item) => item.name === selectedCountry
    );
    const state = country?.states?.find(
      (item: any) => item.name === selectedState
    );
    return (state?.subdivisions || state?.subdivision || []).map(
      (area: string) => ({
        value: area,
        label: area,
      })
    );
  }, [selectedCountry, selectedState]);

  const meetingDayOptions = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '7', label: 'Sunday' },
  ];

  const mutation = useMutation({
    mutationFn: (data: any) => updateCell(id, data),
    onSuccess: () => {
      refetch();
      setEditedData(null);
      toast.success('Cell updated successfully');
    },
    onError: (error) => {
      console.log(error);
      toast.error('Failed to update cell');
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
    if (field === 'country') {
      setEditedData({
        ...currentData,
        country: value,
        state: '',
        area: '',
      });
      return;
    }

    if (field === 'state') {
      setEditedData({
        ...currentData,
        state: value,
        area: '',
      });
      return;
    }

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
      name: currentData.name,
      church_id: Number(currentData.church_id),
      fellowship_id: Number(currentData.fellowship_id),
      leader_id:
        currentData.leader_id && currentData.leader_id !== 'none'
          ? Number(currentData.leader_id)
          : null,
      country: currentData.country || null,
      state: currentData.state || null,
      area: currentData.area || null,
      address: currentData.address || null,
      meeting_days: Number(currentData.meeting_days),
      active: currentData.active,
      start_date: currentData.dateStarted?.toISOString()?.split('T')[0],
    });
  };

  const formattedDate = format(cellData.dateStarted, 'do MMM. yyyy');

  return (
    <div className='flex-1 flex p-4 sm:p-6 w-full flex-col sm:gap-6 gap-4 bg-[#fafafa]'>
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
      <Card className='border border-blue-400 p-4 sm:p-6 bg-white'>
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

            <FormSelectField
              label=''
              value={currentData.leader_id?.toString() || ''}
              onEdit={(value) => handleEdit('leader_id', value)}
              options={[
                { value: 'none', label: 'No leader assigned' },
                ...(leaderOptions || []).map(
                  (leader: { value: number; label: string }) => ({
                    value: String(leader.value),
                    label: leader.label,
                  })
                ),
              ]}
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
            options={meetingDayOptions}
          />

          <FormField
            label='Address'
            value={currentData.address}
            onEdit={(value) => handleEdit('address', value)}
          />

          <FormSelectField
            label='Country'
            value={currentData.country}
            onEdit={(value) => handleEdit('country', value)}
            options={countryOptions}
          />

          <FormSelectField
            label='State'
            value={currentData.state}
            onEdit={(value) => handleEdit('state', value)}
            options={stateOptions}
          />

          <FormSelectField
            label='Area'
            value={currentData.area}
            onEdit={(value) => handleEdit('area', value)}
            options={areaOptions}
          />

          <FormSelectField
            label='Active'
            value={currentData.active}
            onEdit={(value) => handleEdit('active', value)}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
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
