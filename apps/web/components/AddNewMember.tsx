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
import { useState } from 'react';
import { DatePicker } from '@workspace/ui/components/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { FieldInfo } from '@workspace/ui/components/field-info';

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
});

// Temporary data for dropdowns - replace with actual data from your backend
const churches = [
  { id: '1', name: 'Church 1' },
  { id: '2', name: 'Church 2' },
  { id: '3', name: 'Church 3' },
];

const fellowships = [
  { id: '1', name: 'Fellowship 1' },
  { id: '2', name: 'Fellowship 2' },
  { id: '3', name: 'Fellowship 3' },
];

const cells = [
  { id: '1', name: 'Cell 1' },
  { id: '2', name: 'Cell 2' },
  { id: '3', name: 'Cell 3' },
];

const departments = [
  { id: '1', name: 'Department 1' },
  { id: '2', name: 'Department 2' },
  { id: '3', name: 'Department 3' },
];

const genders = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
];

export function AddNewMemberSheet() {
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      gender: '',
      phoneNumber: '',
      church: '',
      fellowship: '',
      cell: '',
      homeAddress: '',
      workAddress: '',
      dateOfBirth: new Date(),
      department: '',
      dateJoinedChurch: new Date(),
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      // Handle form submission here
    },
    onSubmitInvalid(props) {
      console.log(props);
    },
  });

  return (
    <Modal
      trigger={
        <Button className='text-sm h-[44px]'>
          <SquarePlus size={30} />
          Add new member
        </Button>
      }
      open={open}
      setOpen={setOpen}
      title='Create new member'
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
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a church' />
                  </SelectTrigger>
                  <SelectContent>
                    {churches.map((church) => (
                      <SelectItem key={church.id} value={church.id}>
                        {church.name}
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
          <Label htmlFor='fellowship'>Fellowship</Label>
          <form.Field
            name='fellowship'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a fellowship' />
                  </SelectTrigger>
                  <SelectContent>
                    {fellowships.map((fellowship) => (
                      <SelectItem key={fellowship.id} value={fellowship.id}>
                        {fellowship.name}
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
          <Label htmlFor='cell'>Cell</Label>
          <form.Field
            name='cell'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a cell' />
                  </SelectTrigger>
                  <SelectContent>
                    {cells.map((cell) => (
                      <SelectItem key={cell.id} value={cell.id}>
                        {cell.name}
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
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
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
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type='submit' className='w-full' disabled={!canSubmit}>
                {isSubmitting ? '...' : 'Add Member'}
              </Button>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
