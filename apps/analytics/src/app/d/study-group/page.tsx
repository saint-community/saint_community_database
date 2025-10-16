import { Button } from '@/@workspace/ui/components/button';
import AssignmentsTab from '@/src/components/pages/study-group/Assignments';
import SubmissionsTab from '@/src/components/pages/study-group/Submissions';
import HistoryTab from '@/src/components/pages/study-group/History';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';

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
        </div>
        <TabsContent value='assignments' className='pt-12'>
          <AssignmentsTab />
        </TabsContent>
        <TabsContent value='submissions' className='pt-12'>
          <SubmissionsTab />
        </TabsContent>
        <TabsContent value='history' className='pt-12'>
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
