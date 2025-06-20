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
import { FieldInfo } from '@workspace/ui/components/field-info';
import { createChurch } from '@/services/churches';
import { useMutation } from '@tanstack/react-query';

const formSchema = z.object({
  churchName: z.string().min(2, {
    message: 'Church name must be at least 2 characters.',
  }),
  location: z.string().min(2, {
    message: 'Location must be at least 2 characters.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  // country: z.string().min(2, {
  //   message: 'Country is required',
  // }),
  // pastorName: z.string().min(2, {
  //   message: 'Pastor name must be at least 2 characters.',
  // }),
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

export function AddNewChurchSheet() {
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: createChurch,
    onSuccess: () => {
      setOpen(false);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const form = useForm({
    defaultValues: {
      churchName: '',
      location: '',
      address: '',
      // country: '',
      // pastorName: '',
      dateStarted: new Date(),
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      mutation.mutate({
        name: value.churchName,
        // country: value.country,
        state: value.location,
        address: value.address,
        church: true,
      });
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
          Add new church
        </Button>
      }
      open={open}
      setOpen={setOpen}
      title='Create new church'
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
          <Label htmlFor='churchName'>Church Name</Label>
          <form.Field
            name='churchName'
            children={(field) => (
              <>
                <Input
                  id='churchName'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter church name'
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
          <Label htmlFor='address'>Church Address</Label>
          <form.Field
            name='address'
            children={(field) => (
              <>
                <Textarea
                  id='address'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter church address'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        {/* <div className='space-y-2'>
          <Label htmlFor='country'>Country</Label>
          <form.Field
            name='country'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={(e) => field.handleChange(e)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a country' />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div> */}

        {/* <div className='space-y-2'>
          <Label htmlFor='pastorName'>Name of Pastor</Label>
          <form.Field
            name='pastorName'
            children={(field) => (
              <>
                <Input
                  id='pastorName'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter pastor name'
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div> */}

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
                {isSubmitting ? '...' : 'Add Church'}
              </Button>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
