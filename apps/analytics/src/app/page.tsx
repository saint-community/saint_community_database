/* eslint-disable react/no-children-prop */
'use client';
import { useRouter } from 'next/navigation';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@workspace/ui/lib/sonner';
import { loginUser } from '../services/auth';
import imageFile from '@/src/assets/bg1.png';
import { EyeIcon, EyeOffIcon, Loader2, Lock, Mail } from 'lucide-react';
import { Label } from '@workspace/ui/components/label';
import { FieldInfo } from '@workspace/ui/components/field-info';
import Link from 'next/link';
import { Button } from '@/@workspace/ui/components/button';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from '@/@workspace/ui/components/input-group';
import { useState } from 'react';
import Image from 'next/image';
import Logo from '@/src/assets/svgs/logo.svg';

const formSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export default function LoginPage() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
    <div className='flex h-svh w-full'>
      <div className='flex-1  p-6 '>
        <div
          className='w-full h-full bg-white rounded-xl  bg-center bg-cover bg-no-repeat relative'
          style={{ backgroundImage: `url(${imageFile.src})` }}
        >
          <div className='w-full h-full bg-black/50 rounded-xl absolute top-0 left-0 right-0 bottom-0 flex flex-col  justify-between z-10'>
            <Image src={Logo} alt='Logo' className='mt-8 invert mx-4' />
            <div className='flex flex-col items-center justify-center gap-2 py-12'>
              <h2 className='text-white text-3xl font-bold'>
                Analytics Portal
              </h2>
              <p className='text-white text-lg max-w-md text-center'>
                Lorem ipsum dolor cadet imanu hitoshi utare gabe chim du interi
                dolor cadet.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='flex-1 p-6 items-center justify-center flex my-auto'>
        <div className='w-full h-full p-6 max-w-[500px]'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className='flex flex-col items-center gap-4'
          >
            <h1 className='text-2xl font-bold text-black'>Hello Again!</h1>
            <Button className='font-medium my-4 bg-white text-black border-6 h-[40px] border-black'>
              Login
            </Button>

            <div className='w-full flex items-center gap-5'>
              <div className='w-full flex-1 h-[0.5px] bg-gray-500' />
              <p className='text-sm text-black font-medium'>
                Log in with your details
              </p>
              <div className='w-full flex-1 h-[0.5px] bg-gray-500' />
            </div>

            <div className='w-full'>
              <Label htmlFor='email' className='text-sm text-muted-foreground'>
                Email Address
              </Label>
              <form.Field
                name='email'
                children={(field) => (
                  <>
                    <InputGroup className='w-full text-[14px] h-[50px]'>
                      <InputGroupInput
                        placeholder='Enter Your Email'
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <InputGroupAddon className='text-muted-foreground'>
                        <Mail />
                      </InputGroupAddon>
                    </InputGroup>
                    {/* <Input
                      id='email'
                      className='w-full text-[14px]'
                      placeholder='Enter Your Email'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    /> */}
                    <FieldInfo field={field} />
                  </>
                )}
              />
            </div>
            <div className='w-full'>
              <Label
                htmlFor='password'
                className='text-sm text-muted-foreground'
              >
                Enter Password
              </Label>
              <form.Field
                name='password'
                children={(field) => (
                  <>
                    <InputGroup className='w-full text-[14px] h-[50px]'>
                      <InputGroupInput
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder='Enter Your Password'
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <InputGroupAddon className='text-muted-foreground'>
                        <Lock />
                      </InputGroupAddon>
                      <InputGroupAddon
                        align='inline-end'
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      >
                        {!isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                      </InputGroupAddon>
                    </InputGroup>
                    {/* <PasswordInput
                      className='w-full text-[14px]'
                      placeholder='Enter Your Password'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    /> */}
                    <FieldInfo field={field} />
                  </>
                )}
              />
              <div className='flex justify-between w-full mt-4'>
                <div className='flex items-center gap-2'>
                  <input type='checkbox' id='remember' />
                  <Label htmlFor='remember'>Remember me</Label>
                </div>
                <Link href='/reset-password'>
                  <p className='text-sm hover:underline text-blue-600'>
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
                  className='w-full font-medium mt-8 h-[60px]'
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
    </div>
    // <div className='flex h-svh flex-col sm:flex-row w-full overflow-hidden'>
    //   <div className='flex sm:flex-1 bg-slate-600 overflow-hidden relative justify-center items-center p-12 sm:p-0'>
    //     <Image
    //       src={imageFile}
    //       alt='Background'
    //       className='w-full absolute top-0 left-0 right-0 bottom-0 blur-sm'
    //       priority
    //       objectFit='cover'
    //     />
    //   </div>
    //   <div className='flex flex-1 flex-col items-center gap-5 py-10  bg-white'>
    //     <form
    //       onSubmit={(e) => {
    //         e.preventDefault();
    //         e.stopPropagation();
    //         void form.handleSubmit();
    //       }}
    //       className='flex flex-col items-center gap-4 w-[450px] px-[56px]'
    //     >
    //       <h1 className='text-2xl font-bold text-black'>Hello Again!</h1>
    //       <Button className='font-medium mt-10 bg-white text-black border-2 border-black'>
    //         Login
    //       </Button>

    //       <div className='w-full flex items-center gap-2'>
    //         <div className='w-full flex-1 h-2 bg-black' />
    //         <p className='text-sm text-muted-foreground'>
    //           Log in with your details
    //         </p>
    //         <div className='w-full flex-1 h-2 bg-black' />
    //       </div>

    //       <div className='w-full'>
    //         <Label htmlFor='email' className='text-sm text-muted-foreground'>
    //           Email Address
    //         </Label>
    //         <form.Field
    //           name='email'
    //           children={(field) => (
    //             <>
    //               <Input
    //                 id='email'
    //                 className='w-full text-[14px]'
    //                 placeholder='Enter Your Email'
    //                 value={field.state.value}
    //                 onChange={(e) => field.handleChange(e.target.value)}
    //               />
    //               <FieldInfo field={field} />
    //             </>
    //           )}
    //         />
    //       </div>
    //       <div className='w-full'>
    //         <Label htmlFor='password' className='text-sm text-muted-foreground'>
    //           Enter Password
    //         </Label>
    //         <form.Field
    //           name='password'
    //           children={(field) => (
    //             <>
    //               <PasswordInput
    //                 className='w-full text-[14px]'
    //                 placeholder='Enter Your Password'
    //                 value={field.state.value}
    //                 onChange={(e) => field.handleChange(e.target.value)}
    //               />
    //               <FieldInfo field={field} />
    //             </>
    //           )}
    //         />
    //         <div className='flex justify-end w-full mt-2'>
    //           <Link href='/reset-password'>
    //             <p className='text-sm hover:underline text-primary'>
    //               Forgot Password?
    //             </p>
    //           </Link>
    //         </div>
    //       </div>
    //       <form.Subscribe
    //         selector={(state) => [state.canSubmit, state.isSubmitting]}
    //         children={([canSubmit, isSubmitting]) => (
    //           <Button
    //             type='submit'
    //             className='w-full font-medium mt-10'
    //             disabled={!canSubmit || loginMutation.isPending}
    //           >
    //             {loginMutation.isPending || isSubmitting ? (
    //               <Loader2 className='w-4 h-4 animate-spin' />
    //             ) : (
    //               'Sign In'
    //             )}
    //           </Button>
    //         )}
    //       />
    //     </form>
    //   </div>
    // </div>
  );
}
