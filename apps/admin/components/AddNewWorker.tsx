/* eslint-disable react/no-children-prop */
'use client';

import { Button } from '@workspace/ui/components/button';
import { useForm, useStore } from '@workspace/ui/lib/react-hook-form';
import { z } from 'zod';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { Modal } from '@workspace/ui/components/modal';
import { SquarePlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DatePicker } from '@workspace/ui/components/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { FieldInfo } from '@workspace/ui/components/field-info';
import { useChurchesOption } from '@/hooks/churches';
import { useDepartmentsOption } from '@/hooks/departments';
import { useFellowshipsOption } from '@/hooks/fellowships';
import { useCellsOption } from '@/hooks/cell';
import { useMutation } from '@tanstack/react-query';
import { createWorker } from '@/services/workers';
import { useWorkers } from '@/hooks/workers';
import { useMe } from '@/hooks/useMe';
import { COUNTRIES, ROLES } from '@/utils/constants';
import { usePrayerGroupOption } from '@/hooks/prayer_groups';
import { toast } from '@workspace/ui/lib/sonner';

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
  dateJoinedChurch: z.date().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    {
      message: 'Please enter a valid date.',
    }
  ),
  prayerGroup: z.string().min(1, {
    message: 'Please select a prayer group.',
  }),
  country: z.string().min(2, {
    message: 'Country is required',
  }),
  state: z.string().min(1, {
    message: 'State is required',
  }),
});

const genders = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
];

export function AddNewWorkerSheet({
  page,
  church_id,
}: {
  page?: number;
  church_id?: number;
}) {
  const [open, setOpen] = useState(false);
  const { data: user } = useMe();

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      gender: '',
      phoneNumber: '',
      church: user?.church_id?.toString() || '',
      fellowship: user?.fellowship_id?.toString() || '',
      cell: user?.cell_id?.toString() || '',
      homeAddress: '',
      workAddress: '',
      dateOfBirth: new Date(),
      department: '',
      dateJoinedChurch: new Date(),
      prayerGroup: '',
      country: 'Nigeria',
      state: '',
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
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
        prayer_group_id: value.prayerGroup,
        department_id: value.department ? Number(value.department) : undefined,
        country: value.country,
        state: value.state,
      });
    },
    onSubmitInvalid(props) {
      console.log(props);
    },
  });

  const lockChurchSelect =
    !!user && ![ROLES.ADMIN, ROLES.PASTOR].includes(user?.role);
  const { data: churches } = useChurchesOption(!lockChurchSelect);
  const { data: departments } = useDepartmentsOption();
  const churchId = useStore(form.store, (state) => state.values.church);
  const { data: fellowships } = useFellowshipsOption(churchId);
  const fellowshipId = useStore(form.store, (state) => state.values.fellowship);
  const { data: cells } = useCellsOption(fellowshipId);
  const { refetch } = useWorkers({
    church_id: church_id?.toString() || '',
    page,
  });
  const { data: prayerGroups } = usePrayerGroupOption();

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
    mutationFn: createWorker,
    onSuccess: () => {
      toast.success('Worker created successfully');
      setOpen(false);
      refetch();
      form.reset();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to create worker';
      toast.error(errorMessage);
    },
  });

  return (
    <Modal
      trigger={
        <Button className='text-sm h-[44px]'>
          <SquarePlus size={30} />
          Add new worker
        </Button>
      }
      open={open}
      setOpen={setOpen}
      title='Create new worker'
      description=''
    >
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
                  <SelectTrigger>
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
            listeners={{
              onChange: () => {
                form.setFieldValue('fellowship', '');
                form.setFieldValue('cell', '');
              },
            }}
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  disabled={lockChurchSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a church' />
                  </SelectTrigger>
                  <SelectContent>
                    {churchOptions?.map(
                      (church: { value: string; label: string }) => (
                        <SelectItem
                          key={church.value}
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
            listeners={{
              onChange: () => {
                form.setFieldValue('cell', '');
              },
            }}
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  disabled={lockFellowshipSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a fellowship' />
                  </SelectTrigger>
                  <SelectContent>
                    {fellowshipOptions?.length === 0 ? (
                      <SelectItem value='empty' disabled>
                        No fellowship found
                      </SelectItem>
                    ) : (
                      fellowshipOptions?.map(
                        (fellowship: { value: string; label: string }) => (
                          <SelectItem
                            key={fellowship.value}
                            value={`${fellowship.value}`}
                          >
                            {fellowship.label}
                          </SelectItem>
                        )
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
                  disabled={lockCellSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a cell' />
                  </SelectTrigger>
                  <SelectContent>
                    {cellOptions?.length === 0 ? (
                      <SelectItem value='empty' disabled>
                        No cell found
                      </SelectItem>
                    ) : (
                      cellOptions?.map(
                        (cell: { value: string; label: string }) => (
                          <SelectItem key={cell.value} value={`${cell.value}`}>
                            {cell.label}
                          </SelectItem>
                        )
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
          <Label htmlFor='state'>State</Label>
          <form.Field
            name='state'
            children={(field) => (
              <>
                <Input
                  id='state'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter state'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='country'>Country</Label>
          <form.Field
            name='country'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={(e) => field.handleChange(e)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a country' />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
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
          <Label htmlFor='dateOfBirth'>Date of Birth</Label>
          <br />
          <form.Field
            name='dateOfBirth'
            children={(field) => (
              <>
                <DatePicker
                  value={field.state.value}
                  onChange={(date) => field.handleChange(date || new Date())}
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='w-full mt-4'>
          <form.Subscribe
            selector={(state) => [state.canSubmit, mutation.isPending]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type='submit'
                className='w-full'
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? '...' : 'Add Worker'}
              </Button>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
