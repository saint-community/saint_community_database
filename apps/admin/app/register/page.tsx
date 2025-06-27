/* eslint-disable react/no-children-prop */
'use client';

import { Button } from '@workspace/ui/components/button';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import { z } from 'zod';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { DatePicker } from '@workspace/ui/components/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { FieldInfo } from '@workspace/ui/components/field-info';
import { useMutation } from '@tanstack/react-query';
import { createWorker } from '@/services/workers';
import { useWorkerForm } from '@/hooks/workers';
import { Loader } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@workspace/ui/lib/sonner';
import { Suspense } from 'react';

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Full name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  gender: z.string().min(1, {
    message: 'Please select a gender.',
  }),
  phoneNumber: z.string().min(10, {
    message: 'Please enter a valid phone number.',
  }),
  church: z.string().min(1, {
    message: 'Please select a church.',
  }),
  fellowship: z.string().min(1, {
    message: 'Please select a fellowship.',
  }),
  cell: z.string().min(1, {
    message: 'Please select a cell.',
  }),
  homeAddress: z.string().min(5, {
    message: 'Please enter a valid home address.',
  }),
  workAddress: z.string().min(5, {
    message: 'Please enter a valid work address.',
  }),
  dateOfBirth: z.date().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    {
      message: 'Please enter a valid date of birth.',
    }
  ),
  department: z.string().min(1, {
    message: 'Please select a department.',
  }),
  prayerGroup: z.string().min(1, {
    message: 'Please select a prayer group.',
  }),
  dateJoinedChurch: z.date().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    {
      message: 'Please enter a valid date.',
    }
  ),
});

const genders = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
];

function RegisterPageMain() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { data } = useWorkerForm(token || '');
  const router = useRouter();

  const user = data?.data?.user?.user;
  const church = user?.church;
  const fellowships = user?.fellowships;
  const cells = user?.cells;
  const prayerGroups = data?.data?.prayerGroups?.map(
    (prayerGroup: { day: string; schedule: string; id: string }) => ({
      value: prayerGroup.id,
      label: `${prayerGroup.day} (${prayerGroup.schedule})`,
    })
  );

  const departments = data?.data?.departments?.map(
    (department: { name: string; id: string }) => ({
      value: department.id,
      label: department.name,
    })
  );

  const mutation = useMutation({
    mutationFn: createWorker,
    onSuccess: () => {
      toast.success('Account created successfully');
      form.reset();
      router.push('/completed');
    },
    onError: () => {
      toast.error('Failed to create account');
    },
  });

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      gender: '',
      phoneNumber: '',
      church: church?.id?.toString() || '',
      fellowship: fellowships?.[0]?.id?.toString() || '',
      cell: cells?.[0]?.id?.toString() || '',
      homeAddress: '',
      workAddress: '',
      dateOfBirth: new Date(),
      department: '',
      dateJoinedChurch: new Date(),
      prayerGroup: '',
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      // Handle form submission here

      mutation.mutate({
        church_id: Number(value.church),
        fellowship_id: Number(value.fellowship),
        cell_id: Number(value.cell),
        first_name: value.fullName.split(' ')[0] || '',
        last_name: value.fullName.split(' ')[1] || '',
        dob: value.dateOfBirth.toISOString().split('T')[0],
        gender: value.gender,
        status: 'worker',
        phone_number: value.phoneNumber,
        email: value.email,
        facebook_username: '',
        twitter_username: '',
        instagram_username: '',
        house_address: value.homeAddress,
        work_address: value.workAddress,
        member_since: value.dateJoinedChurch.toISOString().split('T')[0],
        worker_since: value.dateJoinedChurch.toISOString().split('T')[0],
        active: true,
        prayer_group_id: Number(value.prayerGroup),
        department_id: value.department ? Number(value.department) : undefined,
      });
    },
    onSubmitInvalid(props) {
      console.log(props);
    },
  });

  if (!token) {
    return (
      <div className='flex flex-col items-center justify-center h-screen max-w-[375px] mx-auto bg-white'>
        Token not found
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center max-w-[375px] mx-auto bg-white py-[100px]'>
      <h1 className='text-2xl font-bold'>Member Registration</h1>
      <p className='text-sm text-gray-500 mb-[36px]'>
        Kindly fill the form below
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className='flex-1 w-full space-y-4 p-4 md:px-0'
      >
        <div className='space-y-2'>
          <Label htmlFor='fullName'>Full Name</Label>
          <form.Field
            name='fullName'
            children={(field) => (
              <>
                <Input
                  id='fullName'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter full name'
                  className='h-[48px]'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email'>Email Address</Label>
          <form.Field
            name='email'
            children={(field) => (
              <>
                <Input
                  id='email'
                  type='email'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter email address'
                  className='h-[48px]'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='gender'>Gender</Label>
          <form.Field
            name='gender'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className='h-[48px]'>
                    <SelectValue placeholder='Select gender' />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender.id} value={gender.id}>
                        {gender.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='phoneNumber'>Phone Number</Label>
          <form.Field
            name='phoneNumber'
            children={(field) => (
              <>
                <Input
                  id='phoneNumber'
                  type='tel'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter phone number'
                  className='h-[48px]'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='church'>Church</Label>
          <form.Field
            name='church'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  disabled
                >
                  <SelectTrigger className='h-[48px]'>
                    <SelectValue placeholder='Select a church' />
                  </SelectTrigger>
                  <SelectContent>
                    {[{ value: church?.id, label: church?.name }]?.map(
                      (church: { value: string; label: string }) => (
                        <SelectItem
                          key={church.value || ''}
                          value={`${church.value}`}
                        >
                          {church.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='fellowship'>Fellowship</Label>
          <form.Field
            name='fellowship'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className='h-[48px]'>
                    <SelectValue placeholder='Select a fellowship' />
                  </SelectTrigger>
                  <SelectContent>
                    {fellowships?.map(
                      (fellowship: { id: string; name: string }) => (
                        <SelectItem
                          key={fellowship.id}
                          value={`${fellowship.id}`}
                        >
                          {fellowship.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='cell'>Cell</Label>
          <form.Field
            name='cell'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className='h-[48px]'>
                    <SelectValue placeholder='Select a cell' />
                  </SelectTrigger>
                  <SelectContent>
                    {cells?.map((cell: { id: string; name: string }) => (
                      <SelectItem key={cell.id} value={`${cell.id}`}>
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

        <div className='space-y-2'>
          <Label htmlFor='homeAddress'>Home Address</Label>
          <form.Field
            name='homeAddress'
            children={(field) => (
              <>
                <Textarea
                  id='homeAddress'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter home address'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='workAddress'>Work Address</Label>
          <form.Field
            name='workAddress'
            children={(field) => (
              <>
                <Textarea
                  id='workAddress'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter work address'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='dateOfBirth'>Date of Birth</Label>
          <br />
          <form.Field
            name='dateOfBirth'
            children={(field) => (
              <>
                <DatePicker
                  value={field.state.value}
                  onChange={(date) => field.handleChange(date || new Date())}
                  className='h-[48px]'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='department'>Department</Label>
          <form.Field
            name='department'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className='h-[48px]'>
                    <SelectValue placeholder='Select a department' />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map(
                      (department: { value: string; label: string }) => (
                        <SelectItem
                          key={department.value}
                          value={`${department.value}`}
                        >
                          {department.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='prayerGroup'>Prayer Group</Label>
          <form.Field
            name='prayerGroup'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className='h-[48px]'>
                    <SelectValue placeholder='Select a prayer group' />
                  </SelectTrigger>
                  <SelectContent>
                    {prayerGroups?.map(
                      (prayerGroup: { value: string; label: string }) => (
                        <SelectItem
                          key={prayerGroup.value}
                          value={`${prayerGroup.value}`}
                        >
                          {prayerGroup.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='dateJoinedChurch'>Date Joined Church</Label>
          <br />
          <form.Field
            name='dateJoinedChurch'
            children={(field) => (
              <>
                <DatePicker
                  value={field.state.value}
                  onChange={(date) => field.handleChange(date || new Date())}
                  className='h-[48px]'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='w-full '>
          <form.Subscribe
            selector={(state) => [state.canSubmit, mutation.isPending]}
            children={([canSubmit, isPending]) => (
              <Button
                type='submit'
                className='w-full h-[48px] mt-[36px]'
                disabled={!canSubmit}
              >
                {isPending ? <Loader className='animate-spin' /> : 'Submit'}
              </Button>
            )}
          />
        </div>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageMain />
    </Suspense>
  );
}
