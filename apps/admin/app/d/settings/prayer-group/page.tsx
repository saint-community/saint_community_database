'use client';
import { AddNewPrayerMeeting } from '@/components/AddNewPrayerMeeting';
import ConfirmDialog from '@/components/ConfirmAlertDialog';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { useAdminPrayerGroupMeetings } from '@/hooks/admin_prayer_groups';
import { useStatistics } from '@/hooks/statistics';
import { useMe } from '@/hooks/useMe';
import { ROLES, QUERY_PATHS } from '@/utils/constants';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Edit3, Trash2, User, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useModalStore } from '@/store';
import { AdminPrayerGroupMeetingPayload, deleteAdminPrayerGroupMeeting } from '@/services/admin_prayer_group';
import { toast } from '@workspace/ui/lib/sonner';

type PrayerGroupMeeting = AdminPrayerGroupMeetingPayload & {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  leader?: {
    first_name: string;
    last_name: string;
    id: number;
  };
};

export default function PrayerGroupSettingsPage() {
  const { data: user } = useMe();
  const { data: prayerGroups } = useAdminPrayerGroupMeetings(user?.church_id);
  const { data: stats } = useStatistics();
  const queryClient = useQueryClient();
  const openAlertModal = useModalStore(({ openAlertModal }) => openAlertModal);

  const isSuperAdmin = user?.role === ROLES.ADMIN;

  const deleteMutation = useMutation({
    mutationFn: (_id: string) => deleteAdminPrayerGroupMeeting(_id),
    onSuccess: () => {
      toast.success('Prayer meeting deleted');
      queryClient.invalidateQueries({
        queryKey: [QUERY_PATHS.ADMIN_PRAYER_GROUP_ALL],
      });
    },
    onError: () => {
      toast.error('Failed to delete prayer meeting');
    },
  });

  const handleDelete = (id?: number) => {
    if (!id) return;
    openAlertModal({
      title: 'Delete prayer meeting',
      description: 'Are you sure you want to delete this prayer meeting?',
      okText: 'Yes, delete',
      onConfirm: () => deleteMutation.mutate(String(id)),
    });
  };

  if (user && !isSuperAdmin) {
    redirect('/d/cells');
  }

  return (
    <div className='space-y-6 bg-white p-4 sm:p-6'>
      <div>
        <h3 className='text-lg font-medium'>Prayer Group Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Manage prayer group meetings and configurations
        </p>
      </div>

      <div className='flex gap-6 sm:flex-row flex-col'>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
        <div className='flex-1 sm:min-w-[400px] w-auto'>
          <ListLinkSection
            list={[
              {
                title: 'Total Prayer Groups:',
                value: prayerGroups?.length || 0,
                icon: <Users size={24} className='stroke-red-500' />,
              },
              {
                title: 'Active Prayer Groups:',
                value: prayerGroups?.length || 0,
                icon: <Clock size={24} className='stroke-red-500' />,
              },
              {
                title: 'Prayer Group Leaders:',
                value: stats?.workers || 0,
                icon: <User size={24} className='stroke-red-500' />,
              },
            ]}
          />
        </div>
      </div>
      <div>
        <div className='flex items-center justify-between gap-3 mb-2'>
          <h2 className='text-2xl font-semibold text-foreground'>
            Prayer meetings
          </h2>
          <AddNewPrayerMeeting />
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {prayerGroups?.map((pg: PrayerGroupMeeting) => (
            <Card key={pg.id} className='bg-white shadow-md border-0'>
              <CardHeader className='flex flex-row items-center justify-between gap-3'>
                <div className='space-y-3'>
                  <CardTitle className='text-xl capitalize font-medium'>
                    {pg?.day || 'Day'}
                  </CardTitle>
                </div>
                <div className='flex items-center gap-2 text-amber-700'>
                  <AddNewPrayerMeeting
                    key={pg.id}
                    mode='edit'
                    prayerGroup={pg}
                    trigger={
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-9 w-9 rounded-full text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                        aria-label='Edit prayer meeting'
                      >
                        <Edit3 className='h-5 w-5' />
                      </Button>
                    }
                  />
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-9 w-9 rounded-full text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                    aria-label='Delete prayer meeting'
                    onClick={() => handleDelete(pg?.id)}
                  >
                    <Trash2 className='h-5 w-5' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-4 pt-0'>
                <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                  <User className='h-5 w-5 text-amber-600' />
                  <div>
                    <div className='text-base text-foreground'>
                    {pg?.leader?.first_name} {pg?.leader?.last_name || 'No leader assigned'}
                    </div>
                    <CardDescription className='text-xs'>
                      Prayer Leader
                    </CardDescription>
                  </div>
                </div>
                <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                  <Clock className='h-5 w-5 text-amber-600' />
                  <div>
                    <div className='text-base text-foreground'>
                      {pg?.schedule || 'Time not set'}
                    </div>
                    <CardDescription className='text-xs'>
                      Schedule
                    </CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
}
