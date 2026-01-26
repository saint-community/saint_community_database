'use client';

import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Modal } from '@workspace/ui/components/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { MultiSelect } from './ui/multi-select';
import { FieldInfo } from '@workspace/ui/components/field-info';
import { TimePicker } from './ui/TimePicker';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import { toast } from '@workspace/ui/lib/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, SquarePlus } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import { z } from 'zod';

import { useWorkerOption } from '@/hooks/workers';
import {
  createAdminPrayerGroupMeeting,
  updateAdminPrayerGroupMeeting,
  AdminPrayerGroupMeetingPayload,
} from '@/services/admin_prayer_group';
import {
  MEETING_DAYS,
  PRAYER_GROUP_PERIODS,
  QUERY_PATHS,
} from '@/utils/constants';

const formSchema = z.object({
  prayergroupDay: z
    .string()
    .min(1, { message: 'Please select a day of the week.' }),
  period: z.string().min(1, { message: 'Please select a period.' }),
  startTime: z.string().min(1, { message: 'Start time is required.' }),
  endTime: z.string().min(1, { message: 'End time is required.' }),
  prayergroupLeader: z.array(z.string()).optional(),
});

type AddNewPrayerMeetingProps = {
  mode?: 'create' | 'edit';
  prayerGroup?: AdminPrayerGroupMeetingPayload & { _id?: string };
  trigger?: ReactNode;
  onSuccess?: () => void;
};

export function AddNewPrayerMeeting({
  mode = 'create',
  prayerGroup,
  trigger,
  onSuccess,
}: AddNewPrayerMeetingProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: workerOptions, isLoading: workersLoading } = useWorkerOption();

  const isEdit = mode === 'edit';

  const defaultValues = useMemo(
    () => ({
      prayergroupDay: prayerGroup?.prayergroup_day || '',
      period: prayerGroup?.period || '',
      startTime: prayerGroup?.start_time || '',
      endTime: prayerGroup?.end_time || '',
      prayergroupLeader: prayerGroup?.prayergroup_leader
        ? Array.isArray(prayerGroup.prayergroup_leader)
          ? prayerGroup.prayergroup_leader
          : [prayerGroup.prayergroup_leader]
        : [],
    }),
    [prayerGroup]
  );

  const createMutation = useMutation({
    mutationFn: createAdminPrayerGroupMeeting,
    onSuccess: () => {
      toast.success('Prayer meeting added');
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [QUERY_PATHS.ADMIN_PRAYER_GROUP_ALL],
      });
      form.reset();
      onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to add prayer meeting');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      _id,
      payload,
    }: {
      _id: string;
      payload: AdminPrayerGroupMeetingPayload;
    }) => updateAdminPrayerGroupMeeting(_id, payload),
    onSuccess: () => {
      toast.success('Prayer meeting updated');
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [QUERY_PATHS.ADMIN_PRAYER_GROUP_ALL],
      });
      onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to update prayer meeting');
    },
  });

  const form = useForm({
    defaultValues,
    validators: {
      // @ts-ignore
      onChange: formSchema,
        // @ts-ignore
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        prayergroup_day: value.prayergroupDay,
        period: value.period,
        start_time: value.startTime,
        end_time: value.endTime,
        prayergroup_leader: value.prayergroupLeader?.length ? value.prayergroupLeader.join(', ') : '',
      };

      if (isEdit && prayerGroup?._id) {
        updateMutation.mutate({ _id: prayerGroup._id, payload });
      } else {
        createMutation.mutate(payload);
      }
    },
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  const triggerNode =
    trigger ??
    (isEdit ? (
      <Button variant='outline' size='sm'>
        Edit Prayer meeting
      </Button>
    ) : (
      <Button className='text-sm h-[44px]'>
        <SquarePlus size={30} />
        Add Prayer meeting
      </Button>
    ));

  return (
    <Modal
      trigger={triggerNode}
      open={open}
      setOpen={setOpen}
      title={isEdit ? 'Edit Prayer meeting' : 'Add Prayer meeting'}
      description={
        isEdit
          ? 'Kindly edit the fields below to effect changes'
          : 'Please fill details below to add a prayer meeting'
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className='flex-1 w-full space-y-4 p-1 md:px-0'
      >
        <div className='space-y-2'>
          <Label htmlFor='prayergroupDay'>Day of the week</Label>
          <form.Field
            name='prayergroupDay'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select day' />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_DAYS.map((day) => (
                      <SelectItem key={day.value} value={day.label}>
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
          <Label htmlFor='period'>Period</Label>
          <form.Field
            name='period'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select period' />
                  </SelectTrigger>
                  <SelectContent>
                    {PRAYER_GROUP_PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
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
          <Label htmlFor='startTime'>Start Time</Label>
          <form.Field
            name='startTime'
            children={(field) => (
              <>
                <TimePicker
                  value={field.state.value}
                  onChange={(time: string) => field.handleChange(time)}
                  placeholder='Select start time'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='endTime'>End Time</Label>
          <form.Field
            name='endTime'
            children={(field) => (
              <>
                <TimePicker
                  value={field.state.value}
                  onChange={(time: string) => field.handleChange(time)}
                  placeholder='Select end time'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='prayergroupLeader'>Prayer Group Leaders</Label>
          <form.Field
            name='prayergroupLeader'
            children={(field) => (
              <>
                <MultiSelect
                  options={workerOptions?.map((worker: { value: number; label: string }) => ({
                    value: worker.label,
                    label: worker.label
                  })) || []}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                  placeholder={
                    workersLoading ? 'Loading leaders...' : 'Select leaders'
                  }
                  searchable={false}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='pt-2'>
          <form.Subscribe
            selector={(state) => [state.canSubmit, pending]}
            children={([canSubmit]) => (
              <Button
                type='submit'
                className='w-full'
                disabled={!canSubmit || pending}
              >
                {pending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : isEdit ? (
                  'Save changes'
                ) : (
                  'Add Prayer day'
                )}
              </Button>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
