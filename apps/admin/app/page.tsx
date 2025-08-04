'use client';
import { useMe } from '@/hooks/useMe';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const { data: user, isLoading } = useMe();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = [
    'Setting things right...',
    'Loading your workspace...',
    'Almost there...',
    'Preparing dashboard...',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentMessageIndex < loadingMessages.length - 1) {
        setCurrentMessageIndex((prev) => prev + 1);
      } else {
        clearInterval(timer);
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [currentMessageIndex]);

  if (user && !isLoading) {
    redirect('/d');
  }
  if (!isLoading && !user) {
    redirect('/login');
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-svh'>
      <Loader2 className='animate-spin w-10 h-10 text-primary mb-2' />
      <p className='text-sm text-muted-foreground'>
        {loadingMessages[currentMessageIndex]}
      </p>
    </div>
  );
}
