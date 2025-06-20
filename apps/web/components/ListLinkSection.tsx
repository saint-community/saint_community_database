import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generateWorkerForm } from '@/services/workers';
import { toast } from '@workspace/ui/lib/sonner';
import { useMe } from '@/hooks/useMe';

interface IList {
  title: string;
  value: number;
  icon: React.ReactNode;
}

export const ListLinkSection = ({ list }: { list: IList[] }) => {
  const [generatedLink, setGeneratedLink] = useState('');
  const { data } = useMe();

  const mutation = useMutation({
    mutationFn: generateWorkerForm,
    onSuccess: (data) => {
      setGeneratedLink(data.link);
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
        <div className='mt-2 h-[42px] relative'>
          <Input
            value={generatedLink}
            placeholder='bit.ly/1212'
            className='h-[42px]'
            readOnly
          />
          <Button
            className='absolute top-0 right-0 h-[42px]'
            onClick={() => {
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
            {mutation.isPending ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
