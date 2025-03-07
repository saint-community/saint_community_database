'use client';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import imageFile from '@/assets/svgs/back.svg';
import forgotImage from '@/assets/svgs/forgot.svg';
import standPassImage from '@/assets/svgs/stand-pass.svg';
import mailerImage from '@/assets/svgs/mailer.svg';
import ChevIcon from '@/assets/svgs/chev-right.svg';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const PAGE_STATES = {
  EMAIL: 'EMAIL',
  OTP: 'OTP',
  NEW_PASSWORD: 'NEW_PASSWORD',
};

export default function ForgotPasswordPage() {
  const [state, setState] = useState(PAGE_STATES.EMAIL);

  return (
    <div className='flex h-svh'>
      <div className='flex flex-1 bg-slate-600 overflow-hidden relative justify-center items-center'>
        <p className='z-10 text-center text-[58px] text-white font-serif'>
          SAINTS COMMUNITY
        </p>
        <Image
          src={imageFile}
          alt='Logo'
          className='w-full absolute top-0 left-0 right-0 bottom-0 blur-sm '
          priority
          objectFit='cover'
        />
      </div>
      <div className='flex flex-1 max-w-[650px] flex-col items-center gap-5 pt-[100px] bg-white'>
        {state === PAGE_STATES.EMAIL && <EmailSection setState={setState} />}
        {state === PAGE_STATES.OTP && <OTPSection setState={setState} />}
        {state === PAGE_STATES.NEW_PASSWORD && (
          <NewPasswordSection setState={setState} />
        )}
      </div>
    </div>
  );
}

const EmailSection = ({
  setState,
}: {
  setState: (state: keyof typeof PAGE_STATES) => void;
}) => {
  return (
    <div className='flex flex-col items-center gap-4 w-[450px] px-[56px]'>
      <h1 className='text-2xl font-bold text-black'>Reset Password</h1>

      <Image
        src={forgotImage}
        alt='Forgot Image'
        className='mt-6 mb-8'
        width={304}
        height={284}
        priority
      />

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

      <Button
        className='w-full h-[48px] font-medium mt-10'
        onClick={() => setState('OTP')}
      >
        Send OTP
      </Button>
      <div className='mt-2'>
        <Link href='/login'>
          <p className='text-sm group'>
            Remember Password?{' '}
            <span className='group-hover:underline text-primary'>Sign In</span>
          </p>
        </Link>
      </div>
    </div>
  );
};
const OTPSection = ({
  setState,
}: {
  setState: (state: keyof typeof PAGE_STATES) => void;
}) => {
  return (
    <div className='flex flex-col items-center gap-4 w-[450px] px-[56px]'>
      <div className='flex relative w-full justify-center'>
        <div
          className='absolute left-0 top-0 cursor-pointer'
          onClick={() => setState('EMAIL')}
        >
          <Image
            src={ChevIcon}
            alt='Back'
            className=''
            width={32}
            height={32}
            priority
          />
        </div>
        <h1 className='text-2xl font-bold text-black text-center'>
          Reset Password
        </h1>
      </div>

      <Image
        src={mailerImage}
        alt='Forgot Image'
        className='mt-6'
        width={304}
        height={284}
        priority
      />
      <p className='text-[16px] text-center mb-8'>
        A One Time Passcode reset link has been sent to your Email
      </p>

      <div className='w-full'>
        <Label htmlFor='email' className='text-sm text-muted-foreground'>
          Enter OTP
        </Label>
        <Input
          id='otp'
          className='w-full text-[14px] h-[48px]'
          placeholder='0000'
        />
      </div>

      <Button
        className='w-full h-[48px] font-medium mt-10'
        onClick={() => setState('NEW_PASSWORD')}
      >
        Reset Password
      </Button>
      <div className='mt-2'>
        <Link href='/login'>
          <p className='text-sm group'>
            Didn’t get the OTP?{' '}
            <span className='group-hover:underline text-primary'>
              Resend OTP
            </span>
          </p>
        </Link>
      </div>
    </div>
  );
};
const NewPasswordSection = ({
  setState,
}: {
  setState: (state: keyof typeof PAGE_STATES) => void;
}) => {
  return (
    <div className='flex flex-col items-center gap-4 w-[450px] px-[56px]'>
      <div className='flex relative w-full justify-center'>
        <div
          className='absolute left-0 top-0 cursor-pointer'
          onClick={() => setState('OTP')}
        >
          <Image
            src={ChevIcon}
            alt='Back'
            className=''
            width={32}
            height={32}
            priority
          />
        </div>
        <h1 className='text-2xl font-bold text-black text-center'>
          Reset Password
        </h1>
      </div>

      <Image
        src={standPassImage}
        alt='Forgot Image'
        className='mt-6'
        width={304}
        height={284}
        priority
      />
      <p className='text-[16px] text-center mb-8'>Type in your New Password</p>

      <div className='w-full'>
        <Label htmlFor='email' className='text-sm text-muted-foreground'>
          Enter New Password
        </Label>
        <Input
          id='password'
          className='w-full text-[14px] h-[48px]'
          placeholder='Enter Your Email'
        />
      </div>

      <Button className='w-full h-[48px] font-medium mt-10'>
        Reset Password
      </Button>
    </div>
  );
};
