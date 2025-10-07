'use client';
import { Button } from '@/@workspace/ui/components/button';
import { useState } from 'react';
import EmptyIcon from '@/src/assets/svgs/empty.svg';
import Image from 'next/image';

export default function AssignmentsTab() {
  const [assignments, setAssignments] = useState<any[]>([]);
  return (
    <div className='flex flex-col gap-4 min-h-[calc(100vh-250px)]'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Weekly Assignments</h1>
        <Button className='text-xl h-[54px]'>Add Assignment</Button>
      </div>

      <div className='flex flex-col items-center justify-center flex-1 gap-6'>
        <Image src={EmptyIcon} alt='Empty' />
        <div className='flex flex-col items-center justify-center'>
          <h1 className='text-2xl font-bold text-[#667085] mb-2'>
            No Assignment History
          </h1>
          <p className='text-sm text-[#667085]'>
            Click on the “Add Assignment” button to begin
          </p>
        </div>
      </div>
    </div>
  );
}
