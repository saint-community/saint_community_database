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
import { FieldInfo } from '@workspace/ui/components/field-info';
import { TimePicker } from './ui/TimePicker';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import { toast } from '@workspace/ui/lib/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, SquarePlus } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import { z } from 'zod';

import { useWorkerOption } from '@/hooks/workers';
import { useMe } from '@/hooks/useMe';
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
import { formatTimeTo12Hr } from '@/utils/helper';

const formSchema = z.object({
  prayergroupDay: z
    .string()
    .min(1, { message: 'Please select a day of the week.' }),
  period: z.string().min(1, { message: 'Please select a period.' }),
  startTime: z.string().min(1, { message: 'Start time is required.' }),
  endTime: z.string().min(1, { message: 'End time is required.' }),
  prayergroupLeader: z.string().min(1, { message: 'Please select a leader.' }),
});

type PrayerGroupResponse = AdminPrayerGroupMeetingPayload & {
  id?: number;
};

type AddNewPrayerMeetingProps = {
  mode?: 'create' | 'edit';
  prayerGroup?: PrayerGroupResponse;
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
  const { data: user } = useMe();

  const isEdit = mode === 'edit';

  const defaultValues = useMemo(
    () => ({
      prayergroupDay: prayerGroup?.day || '',
      period: prayerGroup?.period || '',
      startTime: prayerGroup?.start_time || '',
      endTime: prayerGroup?.end_time || '',
      prayergroupLeader: prayerGroup?.leader_id
        ? String(prayerGroup.leader_id)
        : '',
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
      id,
      payload,
    }: {
      id: number;
      payload: AdminPrayerGroupMeetingPayload;
    }) => updateAdminPrayerGroupMeeting(String(id), payload),
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
      // Format schedule as "10am to 2pm"
      const schedule = `${formatTimeTo12Hr(value.startTime)} to ${formatTimeTo12Hr(value.endTime)}`;

      const payload: AdminPrayerGroupMeetingPayload = {
        church_id: user?.church_id || 0,
        leader_id: Number(value.prayergroupLeader) || 0,
        start_time: value.startTime,
        end_time: value.endTime,
        period: value.period,
        day: value.prayergroupDay,
        schedule,
      };

      if (isEdit && prayerGroup?.id) {
        updateMutation.mutate({ id: prayerGroup.id, payload });
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
          <Label htmlFor='prayergroupLeader'>Prayer Group Leader</Label>
          <form.Field
            name='prayergroupLeader'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        workersLoading ? 'Loading leaders...' : 'Select leader'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {workerOptions?.map(
                      (worker: { value: number; label: string }) => (
                        <SelectItem
                          key={worker.value}
                          value={String(worker.value)}
                        >
                          {worker.label}
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
