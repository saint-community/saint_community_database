/* eslint-disable react/no-children-prop */
'use client';

import { Button } from '@workspace/ui/components/button';
import { useForm, useStore } from '@workspace/ui/lib/react-hook-form';
import { z } from 'zod';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { Modal } from '@workspace/ui/components/modal';
import { Loader2, SquarePlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DatePicker } from '@workspace/ui/components/date-picker';
import { FieldInfo } from '@workspace/ui/components/field-info';
import { createChurch } from '@/services/churches';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@workspace/ui/lib/sonner';
import { QUERY_PATHS } from '@/utils/constants';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import countries from '@/utils/countries.json';

const uniqueCountries = Array.from(
  new Map((countries as any[]).map((country) => [country.name, country])).values()
);

const formSchema = z.object({
  churchName: z.string().min(2, {
    message: 'Church name must be at least 2 characters.',
  }),
  country: z.string(),
  state: z.string(),
  area: z.string(),
  address: z.string(),
  active: z.boolean(),
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
  const queryClient = useQueryClient();
  

  const mutation = useMutation({
    mutationFn: createChurch,
    onSuccess: () => {
      setOpen(false);
      toast.success('Church created successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_PATHS.CHURCHES] });
    },
    onError: (error) => {
      console.log(error);
      toast.error('Failed to create church');
    },
  });

  const form = useForm({
    defaultValues: {
      churchName: '',
      address: '',
      country: '',
      state: '',
      area: '',
      active: true,
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
        country: value.country || null,
        state: value.state || null,
        area: value.area || null,
        address: value.address || null,
        active: value.active,
        start_date: value.dateStarted?.toISOString()?.split('T')[0] || null,
      });
      // Handle form submission here
    },
    onSubmitInvalid(props) {
      console.log(props);
    },
  });

  const selectedCountry = useStore(form.store, (state) => state.values.country);
  const selectedState = useStore(form.store, (state) => state.values.state);

  const countryOptions = useMemo(
    () =>
      uniqueCountries.map((country) => ({
        value: country.name,
        label: country.name,
      })),
    []
  );

  const stateOptions = useMemo(() => {
    const country = uniqueCountries.find(
      (item) => item.name === selectedCountry
    );
    return (country?.states || []).map((state: any) => ({
      value: state.name,
      label: state.name,
    }));
  }, [selectedCountry]);

  const areaOptions = useMemo(() => {
    const country = uniqueCountries.find(
      (item) => item.name === selectedCountry
    );
    const state = country?.states?.find(
      (item: any) => item.name === selectedState
    );
    return (state?.subdivisions || state?.subdivision || []).map(
      (area: string) => ({
        value: area,
        label: area,
      })
    );
  }, [selectedCountry, selectedState]);

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

        <div className='space-y-2'>
          <Label htmlFor='country'>Country</Label>
          <form.Field
            name='country'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    form.setFieldValue('state', '');
                    form.setFieldValue('area', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a country' />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
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
          <Label htmlFor='state'>State</Label>
          <form.Field
            name='state'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    form.setFieldValue('area', '');
                  }}
                  disabled={!selectedCountry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select state' />
                  </SelectTrigger>
                  <SelectContent>
                    {stateOptions.map((state: { value: string; label: string }) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
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
          <Label htmlFor='area'>Area</Label>
          <form.Field
            name='area'
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  disabled={!selectedState || areaOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select area' />
                  </SelectTrigger>
                  <SelectContent>
                    {areaOptions.map((area: { value: string; label: string }) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className='flex items-center gap-3 rounded-md border border-gray-200 p-3'>
          <form.Field
            name='active'
            children={(field) => (
              <>
                <Checkbox
                  id='active'
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked === true)}
                />
                <Label htmlFor='active' className='text-sm font-medium'>
                  Active church
                </Label>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

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
            selector={(state) => [state.canSubmit, mutation.isPending]}
            children={([canSubmit]) => (
              <Button
                type='submit'
                className='w-full'
                disabled={!canSubmit || mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  'Add Church'
                )}
              </Button>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
