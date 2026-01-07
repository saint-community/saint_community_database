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
import { Badge } from '@workspace/ui/components/badge';
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
import { deleteAdminPrayerGroupMeeting } from '@/services/admin_prayer_group';
import { toast } from '@workspace/ui/lib/sonner';

export default function Page() {
  const { data: user } = useMe();
  const { data: prayerGroups } = useAdminPrayerGroupMeetings();
  const { data: stats } = useStatistics();
  const queryClient = useQueryClient();
  const openAlertModal = useModalStore(({ openAlertModal }) => openAlertModal);

  const isAdmin =
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.PASTOR ||
    user?.role === ROLES.CHURCH_PASTOR;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminPrayerGroupMeeting(id),
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

  const handleDelete = (id?: string) => {
    if (!id) return;
    openAlertModal({
      title: 'Delete prayer meeting',
      description: 'Are you sure you want to delete this prayer meeting?',
      okText: 'Yes, delete',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const getDisplayTime = (pg: any) => {
    if (pg?.start_time && pg?.end_time) {
      return `${pg.start_time} - ${pg.end_time}`;
    }

    if (pg?.schedule) {
      return pg.schedule;
    }

    if (pg?.period) {
      return pg.period;
    }

    return 'Time not set';
  };

  const getPeriodBadge = (pg: any) => {
    if (pg?.period && pg?.period !== getDisplayTime(pg)) {
      return pg.period.toLowerCase();
    }
    return null;
  };

  if (user && !isAdmin) {
    redirect('/d/cells');
  }

  return (
    <div className='flex-1 flex p-4 sm:p-6 w-full flex-col sm:gap-6 gap-4 bg-[#fafafa]'>
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
                value:
                  prayerGroups?.filter((pg: any) => pg.active)?.length || 0,
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
          {(prayerGroups || []).map((pg: any) => {
            const displayTime = getDisplayTime(pg);
            const periodBadge = getPeriodBadge(pg);

            return (
              <Card
                key={pg.id || pg.day}
                className='bg-white shadow-md border-0'
              >
                <CardHeader className='flex flex-row items-start justify-between gap-3'>
                  <div className='space-y-3'>
                    <CardTitle className='text-xl capitalize font-medium'>
                      {pg?.prayergroup_day || pg?.day || 'Day'}
                    </CardTitle>
                    {periodBadge && (
                      <Badge
                        variant='secondary'
                        className='bg-amber-100 text-amber-800 px-2.5 py-0.5 text-sm rounded-full font-normal'
                      >
                        {periodBadge}
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center gap-2 text-amber-700'>
                    <AddNewPrayerMeeting
                      key={pg.id || pg.day}
                      mode='edit'
                      prayerGroup={pg}
                      onSuccess={() =>
                        queryClient.invalidateQueries({
                          queryKey: [QUERY_PATHS.PRAYER_GROUPS],
                        })
                      }
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
                        {pg?.prayergroup_leader || 'Prayer Leader'}
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
                        {displayTime}
                      </div>
                      <CardDescription className='text-xs'>
                        Duration
                      </CardDescription>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
}
