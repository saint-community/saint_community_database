'use client';

import { ReactNode, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Building2, Edit3, Loader2, SquarePlus, Trash2, User } from 'lucide-react';

import ConfirmDialog from '@/components/ConfirmAlertDialog';
import { useChurchAccountOptions } from '@/hooks/auth';
import { useDepartments } from '@/hooks/departments';
import { useMe } from '@/hooks/useMe';
import { useModalStore } from '@/store';
import {
  createDepartment,
  deleteDepartment,
  Department,
  DepartmentPayload,
  updateDepartment,
} from '@/services/departments';
import { QUERY_PATHS, ROLES } from '@/utils/constants';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { FieldInfo } from '@workspace/ui/components/field-info';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Modal } from '@workspace/ui/components/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import { toast } from '@workspace/ui/lib/sonner';
import { redirect } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Department name is required.' }),
  leader_id: z.string().optional().default(''),
});

type DepartmentFormProps = {
  mode?: 'create' | 'edit';
  department?: Department;
  trigger?: ReactNode;
};

function DepartmentForm({
  mode = 'create',
  department,
  trigger,
}: DepartmentFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const { data: leaderOptions, isLoading: leadersLoading } =
    useChurchAccountOptions(user?.church_id);
  const isEdit = mode === 'edit';

  const defaultValues = useMemo(
    () => ({
      name: department?.name || '',
      leader_id: department?.leader_id ? String(department.leader_id) : '',
    }),
    [department]
  );

  const invalidateDepartments = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_PATHS.DEPARTMENTS, user?.church_id],
    });
  };

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success('Department created');
      setOpen(false);
      invalidateDepartments();
      form.reset();
    },
    onError: () => {
      toast.error('Failed to create department');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DepartmentPayload }) =>
      updateDepartment(String(id), payload),
    onSuccess: () => {
      toast.success('Department updated');
      setOpen(false);
      invalidateDepartments();
    },
    onError: () => {
      toast.error('Failed to update department');
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
      const payload: DepartmentPayload = {
        church_id: user?.church_id || 0,
        leader_id:
          value.leader_id && value.leader_id !== 'none'
            ? Number(value.leader_id)
            : null,
        name: value.name,
      };

      if (isEdit && department?.id) {
        updateMutation.mutate({ id: department.id, payload });
      } else {
        createMutation.mutate(payload);
      }
    },
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      trigger={
        trigger ?? (
          <Button className='h-[44px] text-sm'>
            <SquarePlus size={22} />
            Add department
          </Button>
        )
      }
      open={open}
      setOpen={setOpen}
      title={isEdit ? 'Edit department' : 'Add department'}
      description='Manage a department for the current church'
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
          <Label htmlFor='name'>Department name</Label>
          <form.Field
            name='name'
            children={(field) => (
              <>
                <Input
                  id='name'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter department name'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='leader_id'>Department leader</Label>
          <form.Field
            name='leader_id'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
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

        <form.Subscribe
          selector={(state) => [state.canSubmit, pending]}
          children={([canSubmit]) => (
            <Button
              type='submit'
              className='w-full'
              disabled={!canSubmit || pending}
            >
              {pending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Add department'
              )}
            </Button>
          )}
        />
      </form>
    </Modal>
  );
}

export default function DepartmentsSettingsPage() {
  const { data: user } = useMe();
  const { data: departments = [] } = useDepartments(user?.church_id);
  const queryClient = useQueryClient();
  const openAlertModal = useModalStore(({ openAlertModal }) => openAlertModal);

  const isAllowed =
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.PASTOR ||
    user?.role === ROLES.CHURCH_PASTOR;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      toast.success('Department deleted');
      queryClient.invalidateQueries({
        queryKey: [QUERY_PATHS.DEPARTMENTS, user?.church_id],
      });
    },
    onError: () => {
      toast.error('Failed to delete department');
    },
  });

  const handleDelete = (department: Department) => {
    openAlertModal({
      title: 'Delete department',
      description: `Are you sure you want to delete ${department.name}?`,
      okText: 'Yes, delete',
      onConfirm: () => deleteMutation.mutate(String(department.id)),
    });
  };

  if (user && !isAllowed) {
    redirect('/d/cells');
  }

  return (
    <div className='space-y-6 bg-white p-4 sm:p-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-lg font-medium'>Department Settings</h3>
          <p className='text-sm text-muted-foreground'>
            Create and manage departments for your current church.
          </p>
        </div>
        <DepartmentForm />
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {departments.map((department: Department) => (
          <Card key={department.id} className='border-0 bg-white shadow-md'>
            <CardHeader className='flex flex-row items-start justify-between gap-3'>
              <div className='space-y-2'>
                <div className='flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700'>
                  <Building2 className='h-5 w-5' />
                </div>
                <CardTitle className='text-xl font-medium'>
                  {department.name}
                </CardTitle>
              </div>
              <div className='flex items-center gap-2 text-amber-700'>
                <DepartmentForm
                  mode='edit'
                  department={department}
                  trigger={
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-9 w-9 rounded-full text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                      aria-label='Edit department'
                    >
                      <Edit3 className='h-5 w-5' />
                    </Button>
                  }
                />
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-9 w-9 rounded-full text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                  aria-label='Delete department'
                  onClick={() => handleDelete(department)}
                >
                  <Trash2 className='h-5 w-5' />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                <User className='h-5 w-5 text-amber-600' />
                <div>
                  <div className='text-base text-foreground'>
                    {department.leader?.name || 'No leader assigned'}
                  </div>
                  <CardDescription className='text-xs'>
                    Department Leader
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {departments.length === 0 && (
        <div className='rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground'>
          No departments have been created for this church yet.
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}
