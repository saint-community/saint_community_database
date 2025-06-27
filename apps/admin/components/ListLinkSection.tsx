import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generateWorkerForm } from '@/services/workers';
import { toast } from '@workspace/ui/lib/sonner';
import { useMe } from '@/hooks/useMe';
import { CheckIcon, Copy, Loader2, PartyPopper } from 'lucide-react';
import { useLocalStorage } from '@/hooks/storage';

interface IList {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const baseUrl = `${window.location.protocol}//${window.location.host}`;

export const ListLinkSection = ({ list }: { list: IList[] }) => {
  const { data } = useMe();
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useLocalStorage(
    'generatedLink',
    true
  );

  const mutation = useMutation({
    mutationFn: generateWorkerForm,
    onSuccess: ({ data }) => {
      const link = `${baseUrl}/register?token=${data.token}`;
      console.log({ link });
      setGeneratedLink(link, new Date(data.expires_at));
      toast.success('Link generated successfully');
    },
    onError: (error) => {
      console.error('Failed to generate link:', error);
      toast.error('Failed to generate link');
    },
  });

  return (
    <div className='flex flex-col gap-5 h-full'>
      <Card className='bg-white flex-1 p-4 px-5 flex flex-col justify-around'>
        {list.map((item) => (
          <div className='flex items-center gap-4' key={item.title}>
            {item.icon}
            <div>
              <p className='text-sm'>{item.title}</p>
              <p className='text-[23px] font-semibold text-[#705C2F]'>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </Card>
      <Card className='bg-white px-5 py-4'>
        <p>Generate Registration Link</p>
        <div className='mt-2 h-[42px] relative flex items-center gap-1'>
          <Input
            value={generatedLink || ''}
            placeholder=''
            className='h-[42px]'
            readOnly
          />
          <Button
            className='h-[42px]'
            onClick={() => {
              if (generatedLink) {
                navigator.clipboard.writeText(generatedLink);
                toast.success('Link copied to clipboard');
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
                return;
              }

              if (data?.church_id) {
                mutation.mutate({
                  church_id: data?.church_id || 1,
                  fellowship_id: data?.fellowship_id,
                  cell_id: data?.cell_id,
                });
              } else {
                toast.error('Cannot generate link');
              }
            }}
            disabled={mutation.isPending}
          >
            {generatedLink ? (
              copied ? (
                <CheckIcon />
              ) : (
                <Copy />
              )
            ) : mutation.isPending ? (
              <Loader2 className='animate-spin' />
            ) : (
              <PartyPopper />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
