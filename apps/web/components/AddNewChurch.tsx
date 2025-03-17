'use client';

import { Button } from '@workspace/ui/components/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import { SquarePlus } from 'lucide-react';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import { zodResolver } from '@workspace/ui/lib/form-helpers';
import { z } from 'zod';

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
});

export function AddNewChurchSheet() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className='text-sm h-[44px]'>
          <SquarePlus size={30} />
          Add new church
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='w-[600px] flex flex-col'>
        <SheetHeader>
          <SheetTitle>Create new church</SheetTitle>
          {/* <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription> */}
        </SheetHeader>

        <div className='flex-1 overflow-y-auto w-[600px]'></div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type='submit'>Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
