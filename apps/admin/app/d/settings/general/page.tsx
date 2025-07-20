'use client';
import { useMe } from '@/hooks/useMe';
import { updateAccount } from '@/services/auth';
import { useMutation } from '@tanstack/react-query';
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
import { toast } from '@workspace/ui/lib/sonner';
import { useState } from 'react';

export default function GeneralSettingsPage() {
  const { data: user } = useMe();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const onCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const mutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      updateAccount(data),
    onSuccess: () => {
      toast.success('Password updated successfully');
      onCancel();
    },
    onError: () => {
      toast.error('Failed to update password');
    },
  });

  const onSave = () => {
    if (currentPassword === newPassword) {
      toast.error('New password cannot be the same as the current password');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    mutation.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    });
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
                  <Input id='name' defaultValue={user?.name} disabled />
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
                </div>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='current-password'>Current Password</Label>
                <Input
                  id='current-password'
                  type='password'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='new-password'>New Password</Label>
                <Input
                  id='new-password'
                  type='password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='confirm-new-password'>
                  Confirm New Password
                </Label>
                <Input
                  id='confirm-new-password'
                  type='password'
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
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
