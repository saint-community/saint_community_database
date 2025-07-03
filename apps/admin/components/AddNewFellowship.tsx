/* eslint-disable react/no-children-prop */
'use client';

import { Button } from '@workspace/ui/components/button';
import { useForm } from '@workspace/ui/lib/react-hook-form';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFellowship } from '@/services/fellowships';
import { useMe } from '@/hooks/useMe';
import { toast } from '@workspace/ui/lib/sonner';
import { QUERY_PATHS, ROLES } from '@/utils/constants';
import { LeaderSelector } from './WorkerSelector';

const formSchema = z.object({
  church_id: z.string().min(1, {
    message: 'Please select a church.',
  }),
  fellowshipName: z.string().min(2, {
    message: 'Fellowship name must be at least 2 characters.',
  }),
  location: z.string().min(2, {
    message: 'Location must be at least 2 characters.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  leader_id: z.string().min(1, {
    message: 'Please select a leader.',
  }),
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

  const form = useForm({
    defaultValues: {
      church_id: user?.church_id?.toString() || '',
      fellowshipName: '',
      location: '',
      address: '',
      leader_id: '',
      dateStarted: new Date(),
    },
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
        cordinator_id: Number(value.leader_id),
        active: true,
        start_date: startDate || '',
      });
    },
    onSubmitInvalid(props) {
      console.log(props);
      toast.error('Please fill in all fields');
    },
  });

  const lockChurchSelect =
    !!user && ![ROLES.ADMIN, ROLES.PASTOR].includes(user?.role);
  console.log(lockChurchSelect);

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
          <Label htmlFor='location'>Location</Label>
          <form.Field
            name='location'
            children={(field) => (
              <>
                <Input
                  id='location'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter location'
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
          <Label htmlFor='leader_id'>Name of Leader</Label>

          <form.Field
            name='leader_id'
            children={(field) => (
              <>
                <LeaderSelector
                  selectedWorker={field.state.value}
                  setSelectedWorker={(worker) => {
                    field.handleChange(`${worker}`);
                  }}
                />
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
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type='submit' className='w-full' disabled={!canSubmit}>
                {isSubmitting ? '...' : 'Add Fellowship'}
              </Button>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
