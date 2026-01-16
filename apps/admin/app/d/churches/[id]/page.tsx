'use client';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useParams } from 'next/navigation';
import { useChurchById } from '@/hooks/churches';
import { CalendarIcon, Loader2, Pencil, Users, Users2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updateChurch } from '@/services/churches';
import { DatePicker } from '@workspace/ui/components/date-picker';
import { FormSelectField } from '@/components/forms';
// import { COUNTRIES } from '@/utils/constants';
import { Label } from '@workspace/ui/components/label';
import { toast } from '@workspace/ui/lib/sonner';

export default function ChurchDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: church, isLoading, refetch } = useChurchById(id);
    const [countries, setCountries] = useState<{ code: string; name: string }[]>(
        []
      );
 
  const [editedData, setEditedData] = useState<any>(null);
   useEffect(() => {
    import("@/utils/countries.json").then((mod) => {
      setCountries(mod.default || mod);
    });
  }, []);

  const mutation = useMutation({
    mutationFn: (data: any) => updateChurch(id, data),
    onSuccess: () => {
      refetch();
      setEditedData(null);
      toast.success('Church updated successfully');
    },
    onError: (error) => {
      console.log(error);
      toast.error('Failed to update church');
    },
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>Loading...</div>
    );
  }

  if (!church) {
    return (
      <div className='flex justify-center items-center h-full'>
        Church not found
      </div>
    );
  }

  const churchData = {
    name: church.name,
    pastor: church.pastorName,
    location: church.state,
    address: church.address,
    dateStarted: church.start_date
      ? new Date(church.start_date)
      : new Date('2022-10-22'),
    lma: 15,
    leaders: church?.leaders?.length || 0,
    workers: church?.workers?.length || 0,
    members: church?.members?.length || 0,
    country: church?.country || '',
  };

  const currentData = editedData || churchData;

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
      pastorName: editedData.pastor,
      state: editedData.location,
      address: editedData.address,
      start_date: editedData.dateStarted?.toISOString()?.split('T')[0],
      country: editedData.country,

    });
  };



  return (
    <div className='flex-1 flex p-4 sm:p-6 w-full flex-col sm:gap-6 gap-4 bg-[#fafafa]'>
      {/* Stats Cards Row */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-3'>
        <StatCard
          icon={<CalendarIcon className='text-red-500' />}
          label='Date Started'
          value={formattedDate}
        />
        <StatCard
          icon={<Users className='text-red-500' />}
          label='No. of LMA'
          value={currentData.lma.toString()}
        />
        <StatCard
          icon={<Users className='text-red-500' />}
          label='No. of Leaders'
          value={currentData.leaders.toString()}
        />
        <StatCard
          icon={<Users2 className='text-red-500' />}
          label='No. of Workers'
          value={currentData.workers.toString()}
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

        {/* Church Details Form */}
        <div className='space-y-6 max-w-3xl mx-auto'>
          <FormField
            label='Church Name'
            value={currentData.name}
            onEdit={(value) => handleEdit('name', value)}
          />

          {/* <FormField
            label='Name of Pastor'
            value={currentData.pastor}
            onEdit={(value) => handleEdit('pastor', value)}
          /> */}

          <FormField
            label='Church Address'
            value={currentData.address}
            onEdit={(value) => handleEdit('address', value)}
          />

          <FormField
            label='Church Location'
            value={currentData.location}
            onEdit={(value) => handleEdit('location', value)}
          />

          <FormSelectField
            label='Country'
            value={currentData.country}
            onEdit={(value) => handleEdit('country', value)}
            options={countries.map((country) => ({
              value: country.name,
              label: country.name,
            }))}
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
    <Card className='bg-white border-none shadow-md'>
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
