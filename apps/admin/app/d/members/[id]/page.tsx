'use client';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useParams } from 'next/navigation';
import { useWorkerById } from '@/hooks/workers';
import { CalendarIcon, ChevronDown, Pencil, Users, Users2 } from 'lucide-react';
import { format } from 'date-fns';

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: member, isLoading } = useWorkerById(id);

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

  // For demo purposes, using static data to match the design
  const memberData = {
    name:
      member.first_name && member.last_name
        ? `${member.first_name} ${member.last_name}`
        : 'Seun Odunola',
    church: member.church_name || 'Surulere',
    location: member.location || 'Surulere',
    address:
      member.house_address || '4, Kobiti Street, off Agege motor road, Mushin',
    dateStarted: member.member_since
      ? new Date(member.member_since)
      : new Date('2022-10-22'),
    cellLeaders: 15,
    workersInTraining: 150,
    members: 600,
  };

  // Format date as "22st Oct. 2022"
  const formattedDate = format(memberData.dateStarted, 'do MMM. yyyy');

  return (
    <div className='flex-1 flex p-6 w-full flex-col gap-6'>
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
          value={memberData.cellLeaders.toString()}
        />
        <StatCard
          icon={<Users2 className='text-red-500' />}
          label='No. of Workers-In-Training:'
          value={memberData.workersInTraining.toString()}
        />
        <StatCard
          icon={<Users className='text-red-500' />}
          label='No. of members:'
          value={memberData.members.toString()}
        />
      </div>

      {/* Main Content Card */}
      <Card className='bg-white p-8 rounded-lg flex-1'>
        <h2 className='text-2xl font-semibold text-red-500 mb-8 text-center'>
          {memberData.name}
        </h2>

        {/* Member Details Form */}
        <div className='space-y-6 max-w-2xl mx-auto'>
          <FormField label='Name of Leader' value={memberData.name} editable />

          <FormField label='Church' value={memberData.church} dropdown />

          <FormField label='Location' value={memberData.location} editable />

          <FormField label='Address' value={memberData.address} editable />

          <div className='pt-8 flex justify-center gap-6'>
            <Button
              variant='outline'
              className='border-red-300 text-red-500 px-8'
            >
              Reset
            </Button>
            <Button className='bg-red-500 hover:bg-red-600 px-8'>Save</Button>
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
  editable?: boolean;
  dropdown?: boolean;
}

function FormField({ label, value, editable, dropdown }: FormFieldProps) {
  return (
    <div className='space-y-2'>
      <label className='block text-sm font-medium'>{label}</label>
      <div className='relative'>
        {dropdown ? (
          <div className='border rounded-md p-3 flex justify-between items-center bg-white'>
            <span>{value}</span>
            <ChevronDown className='h-5 w-5 text-gray-400' />
          </div>
        ) : (
          <div className='relative'>
            <Input
              value={value}
              className='w-full border-gray-300 rounded-md pr-10'
              readOnly
            />
            {editable && (
              <span className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'>
                <Pencil size={18} className='text-red-500' />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
