'use client';
import { useMe } from '@/hooks/useMe';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Separator } from '@workspace/ui/components/separator';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

export default function GeneralSettingsPage() {
  const { data: user } = useMe();
  const [name, setName] = useState(user?.name);

  const onCancel = () => {
    setName(user?.name);
  };

  const onSave = () => {
    console.log('save');
  };

  return (
    <div className='space-y-6 bg-white p-4 sm:p-6'>
      <div>
        <h3 className='text-lg font-medium'>General</h3>
        <p className='text-sm text-muted-foreground'>
          Update your account settings
        </p>
      </div>
      <Separator />
      <div className='grid gap-6'>
        <Card className='bg-white border-none max-w-2xl'>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update your account details and settings
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>Full Name</Label>
                <div className='relative'>
                  <Input
                    id='name'
                    defaultValue={user?.name}
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                  />
                  <Button
                    size='icon'
                    variant='ghost'
                    className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4'
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email Address</Label>
                <div className='relative'>
                  <Input
                    id='email'
                    type='email'
                    defaultValue={user?.email}
                    disabled
                  />
                  <Button
                    size='icon'
                    variant='ghost'
                    className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4'
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <div className='relative'>
                  <Input
                    id='phone'
                    defaultValue={user?.phone}
                    autoComplete='off'
                    aria-autocomplete='none'
                  />
                  <Button
                    size='icon'
                    variant='ghost'
                    className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4'
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='current-password'>Create a New Password</Label>
                <Input id='current-password' type='password' />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='new-password'>Conform New Password</Label>
                <Input id='new-password' type='password' />
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
