/* eslint-disable react/no-children-prop */
'use client';

import { Button } from '@workspace/ui/components/button';
import { useForm, useStore } from '@workspace/ui/lib/react-hook-form';
import { z } from 'zod';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Modal } from '@workspace/ui/components/modal';
import { useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { FieldInfo } from '@workspace/ui/components/field-info';
import { useMutation } from '@tanstack/react-query';
import { useMe } from '@/hooks/useMe';
import { ROLES } from '@/utils/constants';
import { useAccounts } from '@/hooks/auth';
import { useChurchesOption } from '@/hooks/churches';
import { registerUser } from '@/services/auth';
import { toast } from '@workspace/ui/lib/sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Name must be at least 2 characters.',
    }),
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    church_id: z.string(),
    fellowship_id: z.string(),
    cell_id: z.string(),
    password: z.string(),
    role: z.string().min(1, {
      message: 'Please select a role.',
    }),
  })
  .superRefine((value, ctx) => {
    if (
      [ROLES.CHURCH_PASTOR, ROLES.CHURCH_ADMIN].includes(value.role) &&
      !value.church_id
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['church_id'],
        message: 'Please select the church this user belongs to.',
      });
    }

    if (
      ![ROLES.ADMIN, ROLES.CHURCH_ADMIN].includes(value.role) &&
      !value.password
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Please enter a valid password.',
      });
    }
  });

export function AddNewAdmin() {
  const [open, setOpen] = useState(false);
  const { refetch } = useAccounts();
  const { data: user } = useMe();
  const { data: churches } = useChurchesOption(
    open && user?.role === ROLES.ADMIN
  );

  // const lockChurchSelect =
  //   !!user && ![ROLES.ADMIN, ROLES.PASTOR].includes(user?.role);
  // const lockFellowshipSelect =
  //   !!user &&
  //   ![ROLES.ADMIN, ROLES.PASTOR, ROLES.CHURCH_PASTOR].includes(user?.role);
  // const lockCellSelect =
  //   !!user &&
  //   ![
  //     ROLES.ADMIN,
  //     ROLES.PASTOR,
  //     ROLES.CHURCH_PASTOR,
  //     ROLES.FELLOWSHIP_LEADER,
  //   ].includes(user?.role);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Admin created successfully');
      setOpen(false);
      refetch();
      form.reset();
    },
    onError: () => {
      toast.error('Failed to create admin');
    },
  });

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      church_id: user?.church_id?.toString() || '',
      fellowship_id: user?.fellowship_id?.toString() || '',
      cell_id: user?.cell_id?.toString() || '',
      role: 'admin',
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        ...(value.church_id ? { church_id: Number(value.church_id) } : {}),
        ...(value.fellowship_id
          ? { fellowship_id: Number(value.fellowship_id) }
          : {}),
        ...(value.cell_id ? { cell_id: Number(value.cell_id) } : {}),
        name: value.name,
        password: value.password,
        email: value.email,
        role: value.role,
      });
    },
    onSubmitInvalid(props) {
      console.log(props);
    },
  });

  const selectedRole = useStore(form.store, (state) => state.values.role);

  useEffect(() => {
    if (user?.role !== ROLES.CHURCH_ADMIN) return;

    form.setFieldValue('role', ROLES.CHURCH_PASTOR);
    form.setFieldValue('church_id', user?.church_id?.toString() || '');
  }, [form, user]);

  const roleOptions = useMemo(
    () => {
      if (user?.role === ROLES.CHURCH_ADMIN) {
        return [
          ROLES.CHURCH_PASTOR,
          ROLES.FELLOWSHIP_LEADER,
          ROLES.CELL_LEADER,
        ];
      }

      return Object.values(ROLES).filter(
        (role) => role !== ROLES.CHURCH_ADMIN || user?.role === ROLES.ADMIN
      );
    },
    [user?.role]
  );

  const churchOptions = useMemo(() => {
    if (user?.role === ROLES.CHURCH_ADMIN) {
      return [
        {
          value: user?.church_id?.toString() || '',
          label: user?.church_name || 'Current church',
        },
      ].filter((church) => church.value);
    }

    return churches || [];
  }, [churches, user]);

  return (
    <Modal
      trigger={<Button variant='outline'>Add new user</Button>}
      open={open}
      setOpen={setOpen}
      title='Create new user'
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
            name='name'
            children={(field) => (
              <>
                <Input
                  id='name'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter name'
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
          <Label htmlFor='role'>Role</Label>
          <form.Field
            name='role'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    if ([ROLES.ADMIN, ROLES.CHURCH_ADMIN].includes(value)) {
                      form.setFieldValue('password', '');
                    }
                    if (
                      ![ROLES.CHURCH_PASTOR, ROLES.CHURCH_ADMIN].includes(value) &&
                      user?.role === ROLES.ADMIN
                    ) {
                      form.setFieldValue('church_id', '');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role?.replace('_', ' ')?.charAt(0)?.toUpperCase() +
                          role?.replace('_', ' ')?.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        {[ROLES.CHURCH_PASTOR, ROLES.CHURCH_ADMIN].includes(selectedRole) ? (
          <div className='space-y-2'>
            <Label htmlFor='church_id'>Church</Label>
            <form.Field
              name='church_id'
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    disabled={user?.role === ROLES.CHURCH_ADMIN}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select church' />
                    </SelectTrigger>
                    <SelectContent>
                      {churchOptions.map(
                        (church: { value: string; label: string }) => (
                          <SelectItem
                            key={church.value}
                            value={String(church.value)}
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
        ) : null}

        {![ROLES.ADMIN, ROLES.CHURCH_ADMIN].includes(selectedRole) ? (
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <form.Field
              name='password'
              children={(field) => (
                <>
                  <Input
                    id='password'
                    type='password'
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='Enter password'
                  />
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>
        ) : null}

        <div className='w-full mt-4'>
          <form.Subscribe
            selector={(state) => [state.canSubmit, mutation.isPending]}
            children={([canSubmit, isPending]) => (
              <Button type='submit' className='w-full' disabled={!canSubmit}>
                {isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  'Add User'
                )}
              </Button>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
