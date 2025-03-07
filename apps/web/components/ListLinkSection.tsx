import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import React from 'react';

interface IList {
  title: string;
  value: number;
  icon: React.ReactNode;
}

export const ListLinkSection = ({ list }: { list: IList[] }) => {
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
          <Input placeholder='bit.ly/1212' className='h-[42px]' />
          <Button className='absolute top-0 right-0 h-[42px]'>Generate</Button>
        </div>
      </Card>
    </div>
  );
};
