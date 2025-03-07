'use client';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { PasswordInput } from '@workspace/ui/components/password-input';
import imageFile from '@/assets/svgs/back.svg';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className='flex h-svh'>
      <div className='flex flex-1 bg-slate-600 overflow-hidden relative justify-center items-center'>
        <p className='z-10 text-center text-[58px] text-white font-serif'>
          SAINTS COMMUNITY
        </p>
        <Image
          src={imageFile}
          alt='Background'
          className='w-full absolute top-0 left-0 right-0 bottom-0 blur-sm '
          priority
          objectFit='cover'
        />
      </div>
      <div className='flex flex-1 max-w-[650px] flex-col items-center gap-5 pt-[100px] bg-white'>
        <div className='flex flex-col items-center gap-4 w-[450px] px-[56px]'>
          <h1 className='text-2xl font-bold text-primary'>Sign In</h1>
          <p className='text-center text-sm text-muted-foreground'>
            Welcome Back! <br />
            Sign In to access your account
          </p>

          <div className='w-full'>
            <Label htmlFor='email' className='text-sm text-muted-foreground'>
              Email Address
            </Label>
            <Input
              id='email'
              className='w-full text-[14px] h-[48px]'
              placeholder='Enter Your Email'
            />
          </div>
          <div className='w-full'>
            <Label htmlFor='email' className='text-sm text-muted-foreground'>
              Enter Password
            </Label>
            <PasswordInput
              className='w-full text-[14px] h-[48px]'
              placeholder='Enter Your Password'
            />
            <div className='flex  justify-end w-full mt-2'>
              <Link href='/reset-password'>
                <p className='text-sm hover:underline text-primary'>
                  Forgot Password?
                </p>
              </Link>
            </div>
          </div>
          <Button
            className='w-full h-[48px] font-medium mt-10'
            onClick={() => {
              router.push('/d');
            }}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
