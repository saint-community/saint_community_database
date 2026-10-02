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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMe } from '@/hooks/useMe';
import { QUERY_PATHS, ROLES, STORAGE_KEYS } from '@/utils/constants';
import { useChurchesOption } from '@/hooks/churches';
import {
  registerUser,
  updateManagedUser,
  type ManagedUser,
  type ManagedUserUpdate,
} from '@/services/auth';
import { toast } from '@workspace/ui/lib/sonner';
import { Loader2 } from 'lucide-react';
import { getChurchById, getChurches } from '@/services/churches';
import { getFellowshipById } from '@/services/fellowships';

const churchRoles = [
  ROLES.CHURCH_PASTOR,
  ROLES.CHURCH_ADMIN,
  ROLES.FELLOWSHIP_LEADER,
  ROLES.CELL_LEADER,
];
const fellowshipRoles = [ROLES.FELLOWSHIP_LEADER, ROLES.CELL_LEADER];

const createFormSchema = (isEditing: boolean) =>
  z
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
      if (churchRoles.includes(value.role) && !value.church_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['church_id'],
          message: 'Please select the church this user belongs to.',
        });
      }

      for (const [required, field, label] of [
        [fellowshipRoles.includes(value.role), 'fellowship_id', 'fellowship'],
        [value.role === ROLES.CELL_LEADER, 'cell_id', 'cell'],
      ] as const) {
        if (required && !value[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `Please select a ${label}.`,
          });
        }
      }

      if (
        !isEditing &&
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

export function AddNewAdmin({ account }: { account?: ManagedUser }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const isEditing = !!account;
  const formSchema = useMemo(() => createFormSchema(isEditing), [isEditing]);
  const mutation = useMutation({
    mutationFn: (payload: ManagedUserUpdate & { password?: string }) => {
      if (account) return updateManagedUser(account.id, payload);
      return registerUser({
        ...payload,
        church_id: payload.church_id ?? undefined,
        fellowship_id: payload.fellowship_id ?? undefined,
        cell_id: payload.cell_id ?? undefined,
      });
    },
    onSuccess: (response) => {
      toast.success(
        isEditing ? 'User updated successfully' : 'User created successfully'
      );
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: [QUERY_PATHS.ACCOUNTS] });
      if (account) {
        void queryClient.invalidateQueries({
          queryKey: [
            QUERY_PATHS.ACCOUNT_DETAIL.replace(':id', String(account.id)),
          ],
        });
        if (account.id === user?.id && response.data) {
          const storedUser = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.USER) || '{}'
          );
          localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify({ ...storedUser, ...response.data })
          );
          window.location.reload();
        }
      }
    },
    onError: (error: any) => {
      const response = error?.response?.data;
      const errors = response?.errors
        ? Object.values(response.errors).flat().join(' ')
        : '';
      toast.error(
        errors ||
          response?.message ||
          (isEditing ? 'Failed to update user' : 'Failed to create user')
      );
    },
  });

  const form = useForm({
    defaultValues: {
      name: account?.name || '',
      email: account?.email || '',
      password: '',
      church_id: account?.church_id?.toString() || '',
      fellowship_id: account?.fellowship_id?.toString() || '',
      cell_id: account?.cell_id?.toString() || '',
      role: account?.role || 'admin',
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        church_id: value.church_id ? Number(value.church_id) : null,
        fellowship_id:
          fellowshipRoles.includes(value.role) && value.fellowship_id
            ? Number(value.fellowship_id)
            : null,
        cell_id:
          value.role === ROLES.CELL_LEADER && value.cell_id
            ? Number(value.cell_id)
            : null,
        name: value.name,
        ...(!isEditing ? { password: value.password } : {}),
        email: value.email,
        role: value.role,
      });
    },
    onSubmitInvalid(props) {
      console.log(props);
    },
  });

  const selectedRole = useStore(form.store, (state) => state.values.role);
  const selectedChurch = useStore(
    form.store,
    (state) => state.values.church_id
  );
  const selectedFellowship = useStore(
    form.store,
    (state) => state.values.fellowship_id
  );
  const lockChurch = user?.role === ROLES.CHURCH_ADMIN;
  const isAdmin = user?.role === ROLES.ADMIN;
  const scopedChurches = useChurchesOption(
    open && !!user && !lockChurch && !isAdmin
  );
  const allChurches = useQuery({
    queryKey: ['user-form-all-churches'],
    enabled: open && isAdmin,
    queryFn: async () => {
      const churches: Array<{ id: number | string; name: string }> = [];
      let page = 1;
      while (true) {
        const result = await getChurches({ page });
        churches.push(...(Array.isArray(result) ? result : result.data || []));
        if (
          Array.isArray(result) ||
          !(result.next_page_url || page < Number(result.last_page))
        )
          break;
        page += 1;
      }
      return churches.map((church) => ({
        value: String(church.id),
        label: church.name,
      }));
    },
  });
  const {
    data: churches,
    isLoading: churchesLoading,
    isError: churchesError,
  } = isAdmin ? allChurches : scopedChurches;
  const fellowshipQuery = useQuery({
    queryKey: ['user-form-fellowships', selectedChurch],
    queryFn: () => getChurchById(selectedChurch),
    enabled: open && fellowshipRoles.includes(selectedRole) && !!selectedChurch,
    select: (data) =>
      (data?.fellowships || []) as Array<{ id: number | string; name: string }>,
  });
  const cellQuery = useQuery({
    queryKey: ['user-form-cells', selectedFellowship],
    queryFn: () => getFellowshipById(selectedFellowship),
    enabled: open && selectedRole === ROLES.CELL_LEADER && !!selectedFellowship,
    select: (data) =>
      (data?.cells || []) as Array<{ id: number | string; name: string }>,
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: account?.name || '',
      email: account?.email || '',
      password: '',
      role:
        account?.role ||
        (user?.role === ROLES.CHURCH_ADMIN ? ROLES.CHURCH_PASTOR : ROLES.ADMIN),
      church_id: String(account?.church_id || user?.church_id || ''),
      fellowship_id: String(account?.fellowship_id || ''),
      cell_id: String(account?.cell_id || ''),
    });
  }, [open, account, user?.church_id, user?.role, form]);

  const roleOptions = useMemo(() => {
    if (user?.role === ROLES.CHURCH_ADMIN) {
      return [ROLES.CHURCH_PASTOR, ROLES.FELLOWSHIP_LEADER, ROLES.CELL_LEADER];
    }

    return Object.values(ROLES).filter(
      (role) => role !== ROLES.CHURCH_ADMIN || user?.role === ROLES.ADMIN
    );
  }, [user?.role]);

  const churchOptions = useMemo(() => {
    if (lockChurch) {
      return [
        {
          value: user?.church_id?.toString() || '',
          label: user?.church_name || 'Current church',
        },
      ].filter((church) => church.value);
    }

    return churches || [];
  }, [churches, user, lockChurch]);

  return (
    <Modal
      trigger={
        <Button variant='outline' size={isEditing ? 'sm' : 'default'}>
          {isEditing ? 'Edit' : 'Add new user'}
        </Button>
      }
      open={open}
      setOpen={(nextOpen) => {
        if (!mutation.isPending) setOpen(nextOpen);
      }}
      title={isEditing ? 'Edit user' : 'Create new user'}
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
                    form.setFieldValue('fellowship_id', '');
                    form.setFieldValue('cell_id', '');
                    form.setFieldValue(
                      'church_id',
                      user?.role === ROLES.CHURCH_ADMIN
                        ? user?.church_id?.toString() || ''
                        : ''
                    );
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

        {churchRoles.includes(selectedRole) ? (
          <div className='space-y-2'>
            <Label htmlFor='church_id'>Church</Label>
            <form.Field
              name='church_id'
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value);
                      form.setFieldValue('fellowship_id', '');
                      form.setFieldValue('cell_id', '');
                    }}
                    disabled={lockChurch || churchesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          churchesLoading && !lockChurch
                            ? 'Loading churches...'
                            : 'Select church'
                        }
                      />
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

        {churchRoles.includes(selectedRole) &&
          (lockChurch
            ? !user?.church_id
            : churchesError ||
              (!churchesLoading && churchOptions.length === 0)) && (
            <p role='status' className='text-sm text-red-500'>
              {lockChurch
                ? 'Your account has no current church assigned.'
                : churchesError
                  ? 'Unable to load churches. Please try again.'
                  : 'No churches available.'}
            </p>
          )}

        {(
          [
            {
              name: 'fellowship_id',
              label: 'Fellowship',
              visible: fellowshipRoles.includes(selectedRole),
              parent: selectedChurch,
              query: fellowshipQuery,
            },
            {
              name: 'cell_id',
              label: 'Cell',
              visible: selectedRole === ROLES.CELL_LEADER,
              parent: selectedFellowship,
              query: cellQuery,
            },
          ] as const
        )
          .filter(({ visible }) => visible)
          .map(({ name, label, parent, query }) => (
            <div key={name} className='space-y-2'>
              <Label htmlFor={name}>{label}</Label>
              <form.Field name={name}>
                {(field) => (
                  <>
                    <Select
                      value={field.state.value}
                      disabled={
                        !parent ||
                        query.isLoading ||
                        query.isError ||
                        !query.data?.length
                      }
                      onValueChange={(value) => {
                        field.handleChange(value);
                        if (name === 'fellowship_id')
                          form.setFieldValue('cell_id', '');
                      }}
                    >
                      <SelectTrigger id={name}>
                        <SelectValue
                          placeholder={
                            query.isLoading
                              ? 'Loading...'
                              : 'Select ' + label.toLowerCase()
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(query.data || []).map((option) => (
                          <SelectItem key={option.id} value={String(option.id)}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldInfo field={field} />
                    {parent && query.isError && (
                      <p role='alert' className='text-sm text-red-500'>
                        Unable to load {label.toLowerCase()} options.{' '}
                        <button
                          type='button'
                          className='underline'
                          onClick={() => void query.refetch()}
                        >
                          Retry
                        </button>
                      </p>
                    )}
                    {parent &&
                      !query.isLoading &&
                      !query.isError &&
                      !query.data?.length && (
                        <p role='status' className='text-sm text-gray-500'>
                          No {label.toLowerCase()} options available for this
                          selection.
                        </p>
                      )}
                  </>
                )}
              </form.Field>
            </div>
          ))}

        {!isEditing &&
        ![ROLES.ADMIN, ROLES.CHURCH_ADMIN].includes(selectedRole) ? (
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
              <Button
                type='submit'
                className='w-full'
                disabled={!canSubmit || isPending}
              >
                {isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : isEditing ? (
                  'Save changes'
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
