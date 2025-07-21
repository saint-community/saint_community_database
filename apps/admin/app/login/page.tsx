/* eslint-disable react/no-children-prop */
'use client';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { PasswordInput } from '@workspace/ui/components/password-input';
import imageFile from '@/assets/svgs/back.svg';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/services/auth';
import { FieldInfo } from '@workspace/ui/components/field-info';
import { toast } from '@workspace/ui/lib/sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export default function LoginPage() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      loginMutation.mutate(value);
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      toast.success('Login successful');
      router.push('/d');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  return (
    <div className='flex h-svh flex-col sm:flex-row w-full overflow-hidden'>
      <div className='flex sm:flex-1 bg-slate-600 overflow-hidden relative justify-center items-center p-12 sm:p-0'>
        <p className='z-10 text-center sm:text-[58px] text-md text-white font-serif'>
          SAINTS COMMUNITY
        </p>
        <Image
          src={imageFile}
          alt='Background'
          className='w-full absolute top-0 left-0 right-0 bottom-0 blur-sm'
          priority
          objectFit='cover'
        />
      </div>
      <div className='flex flex-1 sm:max-w-[650px] max-w-auto flex-col items-center gap-5 py-10 sm:pt-[100px] bg-white'>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className='flex flex-col items-center gap-4 w-[450px] px-[56px]'
        >
          <h1 className='text-2xl font-bold text-primary'>Sign In</h1>
          <p className='text-center text-sm text-muted-foreground'>
            Welcome Back! <br />
            Sign In to access your account
          </p>

          <div className='w-full'>
            <Label htmlFor='email' className='text-sm text-muted-foreground'>
              Email Address
            </Label>
            <form.Field
              name='email'
              children={(field) => (
                <>
                  <Input
                    id='email'
                    className='w-full text-[14px] h-[48px]'
                    placeholder='Enter Your Email'
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>
          <div className='w-full'>
            <Label htmlFor='password' className='text-sm text-muted-foreground'>
              Enter Password
            </Label>
            <form.Field
              name='password'
              children={(field) => (
                <>
                  <PasswordInput
                    className='w-full text-[14px] h-[48px]'
                    placeholder='Enter Your Password'
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              )}
            />
            <div className='flex justify-end w-full mt-2'>
              <Link href='/reset-password'>
                <p className='text-sm hover:underline text-primary'>
                  Forgot Password?
                </p>
              </Link>
            </div>
          </div>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type='submit'
                className='w-full h-[48px] font-medium mt-10'
                disabled={!canSubmit || loginMutation.isPending}
              >
                {loginMutation.isPending || isSubmitting ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  'Sign In'
                )}
              </Button>
            )}
          />
        </form>
      </div>
    </div>
  );
}
