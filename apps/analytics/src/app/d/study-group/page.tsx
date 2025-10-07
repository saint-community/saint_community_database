import { Button } from '@/@workspace/ui/components/button';
import AssignmentsTab from '@/src/components/pages/study-group/Assignments';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Filter } from 'lucide-react';

export default function StudyGroupPage() {
  return (
    <div className='p-4 '>
      <Tabs defaultValue='assignments' className=''>
        <div className='flex justify-end items-center gap-4'>
          <TabsList className='p-2 h-auto bg-[#131313] text-white'>
            <TabsTrigger
              value='assignments'
              className='p-2 text-xl text-white data-[state=active]:text-[#131313] px-4'
            >
              Assignments
            </TabsTrigger>
            <TabsTrigger
              value='submissions'
              className='p-2 text-xl text-white data-[state=active]:text-[#131313] px-4'
            >
              Submissions
            </TabsTrigger>
            <TabsTrigger
              value='history'
              className='p-2 text-xl text-white data-[state=active]:text-[#131313] px-4'
            >
              History
            </TabsTrigger>
          </TabsList>
          <Button
            className='p-2 text-xl  px-4 bg-white text-black h-[56px]'
            variant='secondary'
          >
            <Filter className='size-6' />
            Filter
          </Button>
        </div>
        <TabsContent value='assignments' className='pt-12'>
          <AssignmentsTab />
        </TabsContent>
        <TabsContent value='submissions' className='pt-12'>
          Change your password here.
        </TabsContent>
        <TabsContent value='history' className='pt-12'>
          History here.
        </TabsContent>
      </Tabs>
    </div>
  );
}
