'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';

type PasswordInputProps = React.ComponentProps<typeof Input> & {
  label?: string;
};

export function PasswordInput(props: PasswordInputProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className='*:not-first:mt-2'>
      {props.label && <Label htmlFor={id}>{props.label}</Label>}
      <div className='relative'>
        <Input
          id={id}
          placeholder='Password'
          type={isVisible ? 'text' : 'password'}
          {...props}
        />
        <button
          className='text-muted-foreground/80 hover:text-foreground outline-ring/30 dark:outline-ring/40 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
          type='button'
          onClick={toggleVisibility}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          aria-controls='password'
        >
          {isVisible ? (
            <EyeOffIcon
              size={20}
              aria-hidden='true'
              className='stroke-primary'
            />
          ) : (
            <EyeIcon size={20} aria-hidden='true' className='stroke-primary' />
          )}
        </button>
      </div>
    </div>
  );
}
