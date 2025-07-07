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
import { useFellowshipsOption } from '@/hooks/fellowships';
import { createCell } from '@/services/cell';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMe } from '@/hooks/useMe';
import { QUERY_PATHS, ROLES } from '@/utils/constants';
import { LeaderSelector } from './WorkerSelector';

const formSchema = z.object({
  church_id: z.string().min(1, {
    message: 'Please select a church.',
  }),
  fellowship_id: z.string().min(1, {
    message: 'Please select a fellowship.',
  }),
  cellName: z.string().min(2, {
    message: 'Cell name must be at least 2 characters.',
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

export function AddNewCellSheet() {
  const [open, setOpen] = useState(false);
  const { data: user, isAdmin } = useMe();

  const form = useForm({
    defaultValues: {
      church_id: user?.church_id?.toString() || '',
      fellowship_id: user?.fellowship_id?.toString() || '',
      cellName: '',
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

      mutate({
        church_id: Number(value.church_id),
        fellowship_id: Number(value.fellowship_id),
        name: value.cellName,
        address: value.address,
        leader_id: Number(value.leader_id),
        active: true,
        meeting_days: 1,
        start_date: startDate || '',
      });
    },
    onSubmitInvalid(props) {
      console.log(props);
    },
  });

  const lockChurchSelect =
    !!user && ![ROLES.ADMIN, ROLES.PASTOR].includes(user?.role);
  const { data: churches } = useChurchesOption(!lockChurchSelect);
  const churchId = useStore(form.store, (state) => state.values.church_id);
  const { data: fellowships } = useFellowshipsOption(churchId);
  const queryClient = useQueryClient();

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

  const { mutate, isPending } = useMutation({
    mutationFn: createCell,
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [QUERY_PATHS.CELLS],
      });
      form.reset();
    },
    onError: () => {
      console.log('Error');
    },
  });

  return (
    <Modal
      trigger={
        <Button className='text-sm h-[44px]'>
          <SquarePlus size={30} />
          Add new cell
        </Button>
      }
      open={open}
      setOpen={setOpen}
      title='Create new cell'
      description=''
      // footer={
      //   <form.Subscribe
      //     selector={(state) => [state.canSubmit, state.isSubmitting]}
      //     children={([canSubmit, isSubmitting]) => (
      //       <Button
      //         type='submit'
      //         onClick={() => form.handleSubmit()}
      //         className='w-full'
      //         disabled={!canSubmit}
      //       >
      //         {isSubmitting ? '...' : 'Add Cell'}
      //       </Button>
      //     )}
      //   />
      // }
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
          <Label htmlFor='fellowship_id'>Fellowship</Label>
          <form.Field
            name='fellowship_id'
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
          <Label htmlFor='cellName'>Cell Name</Label>
          <form.Field
            name='cellName'
            children={(field) => (
              <>
                <Input
                  id='cellName'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter cell name'
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
          <Label htmlFor='address'>Cell Address</Label>
          <form.Field
            name='address'
            children={(field) => (
              <>
                <Textarea
                  id='address'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter cell address'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='leaderName'>Name of Leader</Label>
          <form.Field
            name='leader_id'
            children={(field) => (
              <>
                <LeaderSelector
                  selectedWorker={field.state.value}
                  setSelectedWorker={(worker) => {
                    field.handleChange(`${worker}`);
                  }}
                  churchId={isAdmin ? undefined : user?.church_id?.toString()}
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
              <DatePicker
                value={field.state.value}
                onChange={(date) => field.handleChange(date || new Date())}
              />
            )}
          />
        </div>
        <div className='w-full mt-4'>
          <form.Subscribe
            selector={(state) => [state.canSubmit, isPending]}
            children={([canSubmit]) => (
              <Button
                type='submit'
                // onClick={() => form.handleSubmit()}
                className='w-full'
                disabled={!canSubmit || isPending}
              >
                {isPending ? '...' : 'Add Cell'}
              </Button>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
