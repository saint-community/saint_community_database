'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { toast } from '@workspace/ui/lib/sonner';
import { Loader2, Send } from 'lucide-react';
import { sendOnboardingInvite } from '@/services/onboarding';
import { useMe } from '@/hooks/useMe';
import { ROLES } from '@/utils/constants';

export default function OnboardingSettingsPage() {
  const { data: user } = useMe();
  const [email, setEmail] = useState('');

  const mutation = useMutation({
    mutationFn: sendOnboardingInvite,
    onSuccess: () => {
      setEmail('');
      toast.success('Onboarding link sent');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send onboarding link');
    },
  });

  if (user && user.role !== ROLES.ADMIN) {
    return (
      <div className='p-6 text-sm text-gray-500'>
        You do not have permission to access onboarding settings.
      </div>
    );
  }

  return (
    <div className='space-y-6 p-4 md:p-0'>
      <div>
        <h3 className='text-lg font-medium'>Onboarding</h3>
        <p className='text-sm text-gray-500'>
          Send a root church pastor onboarding link.
        </p>
      </div>

      <Card className='bg-white'>
        <CardContent className='space-y-4 p-5'>
          <div className='space-y-2'>
            <Label htmlFor='onboarding-email'>Church pastor email</Label>
            <Input
              id='onboarding-email'
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='pastor@example.com'
            />
          </div>
          <div className='rounded-md bg-gray-50 p-3 text-sm text-gray-600'>
            Role will be set to church pastor automatically. The link expires
            after 24 hours.
          </div>
          <Button
            disabled={!email || mutation.isPending}
            onClick={() =>
              mutation.mutate({
                email,
                role: 'church_pastor',
                app_url: window.location.origin,
              })
            }
          >
            {mutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
            Send link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
