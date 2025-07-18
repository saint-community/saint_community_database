/* eslint-disable react/no-children-prop */
'use client';

import { Button } from '@workspace/ui/components/button';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import { z } from 'zod';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Modal } from '@workspace/ui/components/modal';
import { useState } from 'react';
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
import { registerUser } from '@/services/auth';
import { toast } from '@workspace/ui/lib/sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  church_id: z.string().min(1, {
    message: 'Please select a church.',
  }),
  fellowship_id: z.string().min(1, {
    message: 'Please select a fellowship.',
  }),
  cell_id: z.string().min(1, {
    message: 'Please select a cell.',
  }),
  password: z.string().min(1, {
    message: 'Please enter a valid password.',
  }),
  role: z.string().min(1, {
    message: 'Please select a role.',
  }),
});

export function AddNewAdmin() {
  const [open, setOpen] = useState(false);
  // const { data: churches } = useChurchesOption();
  // const { data: departments } = useDepartmentsOption();
  // const { data: fellowships } = useFellowshipsOption();
  // const { data: cells } = useCellsOption();
  const { refetch } = useAccounts();
  const { data: user } = useMe();

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
        church_id: Number(value.church_id),
        fellowship_id: Number(value.fellowship_id),
        cell_id: Number(value.cell_id),
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

  return (
    <Modal
      trigger={<Button variant='outline'>Add new user</Button>}
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
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ROLES).map((role) => (
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
