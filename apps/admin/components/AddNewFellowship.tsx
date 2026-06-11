/* eslint-disable react/no-children-prop */
'use client';

import { Button } from '@workspace/ui/components/button';
import { useForm, useStore } from '@workspace/ui/lib/react-hook-form';
import { z } from 'zod';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { Modal } from '@workspace/ui/components/modal';
import { Loader2, SquarePlus } from 'lucide-react';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFellowship } from '@/services/fellowships';
import { useMe } from '@/hooks/useMe';
import { toast } from '@workspace/ui/lib/sonner';
import { QUERY_PATHS, ROLES } from '@/utils/constants';
import { useChurchAccountOptions } from '@/hooks/auth';
import countries from '@/utils/countries.json';

const uniqueCountries = Array.from(
  new Map((countries as any[]).map((country) => [country.name, country])).values()
);

const formSchema = z.object({
  church_id: z.string().min(1, {
    message: 'Please select a church.',
  }),
  fellowshipName: z.string().min(2, {
    message: 'Fellowship name must be at least 2 characters.',
  }),
  country: z.string().optional(),
  state: z.string().optional(),
  area: z.string().optional(),
  meeting_days: z.string().min(1, {
    message: 'Please select a meeting day.',
  }),
  active: z.enum(['yes', 'no']),
  address: z.string().optional(),
  leader_id: z.string().optional(),
  dateStarted: z.date().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    {
      message: 'Please enter a valid date.',
    }
  ),
});

export function AddNewFellowshipSheet() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const { data: leaderOptions, isLoading: leadersLoading } =
    useChurchAccountOptions(user?.church_id);

  const form = useForm({
    defaultValues: {
      church_id: user?.church_id?.toString() || '',
      fellowshipName: '',
      country: '',
      state: '',
      area: '',
      meeting_days: '4',
      active: 'yes',
      address: '',
      leader_id: '',
      dateStarted: new Date(),
    } as any,
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      const startDate = value.dateStarted.toISOString()?.split('T')[0];

      mutation.mutate({
        church_id: Number(value.church_id),
        name: value.fellowshipName,
        address: value.address,
        cordinator_id:
          value.leader_id && value.leader_id !== 'none'
            ? Number(value.leader_id)
            : null,
        country: value.country || null,
        state: value.state || null,
        area: value.area || null,
        meeting_days: Number(value.meeting_days),
        active: value.active,
        start_date: startDate || '',
      });
    },
    onSubmitInvalid(props) {
      toast.error('Please fill in all fields');
    },
  });

  const selectedCountry = useStore(form.store, (state) => state.values.country);
  const selectedState = useStore(form.store, (state) => state.values.state);

  const lockChurchSelect =
    !!user && ![ROLES.ADMIN, ROLES.PASTOR].includes(user?.role);

  const { data: churches } = useChurchesOption(!lockChurchSelect);

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

  const countryOptions = useMemo(
    () =>
      uniqueCountries.map((country) => ({
        value: country.name,
        label: country.name,
      })),
    []
  );

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
    mutationFn: createFellowship,
    onSuccess: () => {
      toast.success('Fellowship created successfully');
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [QUERY_PATHS.FELLOWSHIPS, user?.church_id?.toString()],
      });
      form.reset();
    },
    onError: () => {
      toast.error('Failed to create fellowship');
    },
  });

  return (
    <Modal
      trigger={
        <Button className='text-sm h-[44px]'>
          <SquarePlus size={30} />
          Add new fellowship
        </Button>
      }
      open={open}
      setOpen={setOpen}
      title='Create new fellowship'
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
          <Label htmlFor='church'>Church</Label>
          <form.Field
            name='church_id'
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
          <Label htmlFor='fellowshipName'>Fellowship Name</Label>
          <form.Field
            name='fellowshipName'
            children={(field) => (
              <>
                <Input
                  id='fellowshipName'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter fellowship name'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='address'>Fellowship Address</Label>
          <form.Field
            name='address'
            children={(field) => (
              <>
                <Textarea
                  id='address'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter fellowship address'
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
                  onValueChange={(value) => {
                    field.handleChange(value);
                    form.setFieldValue('state', '');
                    form.setFieldValue('area', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select country' />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
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
          <Label htmlFor='state'>State</Label>
          <form.Field
            name='state'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    form.setFieldValue('area', '');
                  }}
                  disabled={!selectedCountry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select state' />
                  </SelectTrigger>
                  <SelectContent>
                    {stateOptions.map((state: { value: string; label: string }) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
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
          <Label htmlFor='area'>Area</Label>
          <form.Field
            name='area'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  disabled={!selectedState || areaOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select area' />
                  </SelectTrigger>
                  <SelectContent>
                    {areaOptions.map((area: { value: string; label: string }) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
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
          <Label htmlFor='meeting_days'>Meeting Day</Label>
          <form.Field
            name='meeting_days'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select meeting day' />
                  </SelectTrigger>
                  <SelectContent>
                    {meetingDayOptions.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
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
          <Label htmlFor='active'>Active</Label>
          <form.Field
            name='active'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='yes'>Yes</SelectItem>
                    <SelectItem value='no'>No</SelectItem>
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='leader_id'>Name of Leader</Label>

          <form.Field
            name='leader_id'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        leadersLoading ? 'Loading leaders...' : 'Select leader'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>No leader assigned</SelectItem>
                    {leaderOptions?.map(
                      (leader: { value: number; label: string }) => (
                        <SelectItem
                          key={leader.value}
                          value={String(leader.value)}
                        >
                          {leader.label}
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
          <Label htmlFor='dateStarted'>Date Started</Label>
          <br />
          <form.Field
            name='dateStarted'
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
            children={([canSubmit]) => (
              <Button
                type='submit'
                className='w-full'
                disabled={!canSubmit || mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  'Add Fellowship'
                )}
              </Button>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
