'use client';

import { useInfiniteWorkersRegistration } from '@/hooks/workers';
import { useModalStore } from '@/store';
import { approveWorker, rejectWorker } from '@/services/workers';
import { useMutation } from '@tanstack/react-query';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { toast } from '@workspace/ui/lib/sonner';
import { cn } from '@workspace/ui/lib/utils';
import {
  BadgeCheck,
  CalendarDays,
  CakeIcon,
  Church,
  Loader,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { isEmpty } from 'lodash';

const approvalStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const display = (value: any) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === 1 || value === '1') return 'Yes';
  if (value === 0 || value === '0') return 'No';
  return String(value);
};

const formatDate = (value: any) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? display(value) : date.toLocaleDateString();
};

const formatDateTime = (value: any) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? display(value) : date.toLocaleString();
};

const formatStatus = (value: any) => display(value).replaceAll('_', ' ');

const prayerGroupName = (worker: any) => {
  if (worker.prayer_group_name) return worker.prayer_group_name;
  const group = worker.prayer_group;
  if (!group) return 'N/A';

  return [
    group.day,
    group.schedule ? `(${group.schedule})` : null,
    group.start_time && group.end_time
      ? `${group.start_time} - ${group.end_time}`
      : null,
  ]
    .filter(Boolean)
    .join(' ');
};

const detailGroups = (worker: any) => [
  {
    title: 'Personal',
    icon: CakeIcon,
    fields: [
      ['First name', worker.first_name],
      ['Last name', worker.last_name],
      ['Gender', worker.gender],
      ['Date of birth', formatDate(worker.date_of_birth || worker.dob)],
      ['Status', formatStatus(worker.status)],
      ['Active', display(worker.active)],
    ],
  },
  {
    title: 'Contact',
    icon: Phone,
    fields: [
      ['Email', worker.email],
      ['Phone number', worker.phone_number],
    ],
  },
  {
    title: 'Location',
    icon: MapPin,
    fields: [
      ['Country', worker.country],
      ['State', worker.state],
      ['Area', worker.area],
      ['House address', worker.house_address],
      ['Work address', worker.work_address],
    ],
  },
  {
    title: 'Ministry',
    icon: Church,
    fields: [
      ['Church', worker.church_name || worker.church?.name],
      ['Fellowship', worker.fellowship_name || worker.fellowship?.name],
      ['Cell', worker.cell_name || worker.cell?.name],
      ['Prayer group', prayerGroupName(worker)],
      ['Department', worker.department_name || worker.department?.name],
    ],
  },
  {
    title: 'Dates',
    icon: CalendarDays,
    fields: [
      ['Member since', formatDate(worker.member_since)],
      ['Worker since', formatDate(worker.worker_since)],
      ['Submitted', formatDateTime(worker.created_at)],
      ['Updated', formatDateTime(worker.updated_at)],
      ['Deleted', formatDateTime(worker.deleted_at)],
    ],
  },
  {
    title: 'Social',
    icon: Users,
    fields: [
      ['Facebook', worker.facebook_username],
      ['Twitter', worker.twitter_username],
      ['Instagram', worker.instagram_username],
    ],
  },
  {
    title: 'Compliance',
    icon: ShieldCheck,
    fields: [
      ['Terms accepted', formatDateTime(worker.terms_accepted_at)],
      ['Terms version', worker.terms_version],
      ['Privacy acknowledged', formatDateTime(worker.privacy_acknowledged_at)],
      ['Privacy version', worker.privacy_policy_version],
    ],
  },
];

const RegistrationRequests = () => {
  const { push } = useRouter();
  const openAlertModal = useModalStore(({ openAlertModal }) => openAlertModal);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRejectWorker, setSelectedRejectWorker] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const searchParams = useSearchParams();
  const slug = searchParams.get('status') ?? 'pending';
  const {
    data: workers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteWorkersRegistration({ action: slug });

  const mutation = useMutation({
    mutationFn: (id: any) => approveWorker(id),
    onSuccess: () => {
      refetch();
      toast.success('Worker successfully approved');
    },
    onError: (error) => {
      console.log(error);
      toast.error('Failed to approve worker');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectWorker({ id, reason }),
    onSuccess: () => {
      refetch();
      setRejectDialogOpen(false);
      setSelectedRejectWorker(null);
      setRejectionReason('');
      toast.success('Worker successfully rejected');
    },
    onError: (error) => {
      console.log(error);
      toast.error('Failed to reject worker');
    },
  });

  const workersRequestData = useMemo(
    () => workers?.pages.flatMap((page) => page.data.data) || [],
    [workers]
  );

  const openRejectDialog = (member: { id: string; name: string }) => {
    setSelectedRejectWorker(member);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  return (
    <div className='flex-1 flex flex-col bg-[#fafafa]'>
      <div className='flex-1 p-6'>
        <div className='flex justify-end mb-6'>
          <div className='flex items-center gap-2 bg-black py-2 px-4 rounded-md'>
            {['pending', 'approved', 'rejected'].map((status) => (
              <Button
                key={status}
                variant='ghost'
                className={cn('text-white capitalize', {
                  'bg-white text-black': slug === status,
                })}
                onClick={() =>
                  push(`/d/registration-requests/?status=${status}`)
                }
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <h1 className='text-2xl font-bold mb-6 capitalize'>{slug} List</h1>

        {isLoading ? (
          <div className='flex flex-col items-center justify-center h-screen mx-auto'>
            <Loader className='w-12 h-12 animate-spin mb-4 text-gray-400' />
            <span className='text-gray-500'>
              Hang tight, we're loading registration list
            </span>
          </div>
        ) : isEmpty(workersRequestData) ? (
          <div className='flex flex-col items-center justify-center h-screen mx-auto'>
            <span className='text-gray-500'>
              {`There are no ${slug} registration requests at the moment.`}
            </span>
          </div>
        ) : (
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[980px] text-sm'>
                <thead className='bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500'>
                  <tr>
                    <th className='px-4 py-3 font-semibold'>Worker</th>
                    <th className='px-4 py-3 font-semibold'>Contact</th>
                    <th className='px-4 py-3 font-semibold'>Church</th>
                    <th className='px-4 py-3 font-semibold'>Fellowship / Cell</th>
                    <th className='px-4 py-3 font-semibold'>Prayer / Department</th>
                    <th className='px-4 py-3 font-semibold'>Worker Status</th>
                    <th className='px-4 py-3 font-semibold'>Submitted</th>
                    <th className='px-4 py-3 font-semibold'>Approval</th>
                    <th className='px-4 py-3 font-semibold text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
            {workersRequestData.map((worker: any) => {
              const name = `${worker.first_name || ''} ${worker.last_name || ''}`.trim();
              const initials = `${worker.first_name?.[0] || ''}${worker.last_name?.[0] || ''}` || 'W';

              return (
                <tr
                  key={worker.id}
                  className='cursor-pointer bg-white transition-colors hover:bg-gray-50'
                  onClick={() => setSelectedWorker(worker)}
                >
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-3'>
                        <Avatar className='w-10 h-10'>
                          <AvatarImage src={worker.profile_image_url || ''} />
                          <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className='min-w-0'>
                          <div className='font-semibold text-gray-900'>{name || 'Unnamed worker'}</div>
                          <div className='text-xs text-gray-500'>{display(worker.gender)}</div>
                        </div>
                      </div>
                  </td>
                  <td className='px-4 py-3 text-gray-700'>
                    <div className='max-w-[180px] truncate'>{display(worker.email)}</div>
                    <div className='text-xs text-gray-500'>{display(worker.phone_number)}</div>
                  </td>
                  <td className='px-4 py-3 text-gray-700'>
                    <div className='max-w-[180px] truncate'>
                      {display(worker.church_name || worker.church?.name)}
                    </div>
                  </td>
                  <td className='px-4 py-3 text-gray-700'>
                    <div className='max-w-[180px] truncate'>
                      {display(worker.fellowship_name || worker.fellowship?.name)}
                    </div>
                    <div className='max-w-[180px] truncate text-xs text-gray-500'>
                      {display(worker.cell_name || worker.cell?.name)}
                    </div>
                  </td>
                  <td className='px-4 py-3 text-gray-700'>
                    <div className='max-w-[200px] truncate'>{display(prayerGroupName(worker))}</div>
                    <div className='max-w-[200px] truncate text-xs text-gray-500'>
                      {display(worker.department_name || worker.department?.name)}
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <Badge className='text-xs text-[#2563EB] bg-[#C8D9FF] capitalize font-normal'>
                      {formatStatus(worker.status)}
                    </Badge>
                  </td>
                  <td className='px-4 py-3 text-gray-700'>{formatDate(worker.created_at)}</td>
                  <td className='px-4 py-3'>
                    <Badge
                      className={cn(
                        'capitalize font-normal',
                        approvalStyles[worker.approved] ||
                          'bg-gray-100 text-gray-800'
                      )}
                    >
                      {display(worker.approved)}
                    </Badge>
                  </td>
                  <td className='px-4 py-3'>
                      {worker.approved === 'pending' ? (
                        <div className='flex justify-end gap-2'>
                          <Button
                            size='sm'
                            className='bg-green-700/90 hover:bg-green-600 text-white'
                            disabled={mutation.isPending}
                            onClick={(event) => {
                              event.stopPropagation();
                              openAlertModal({
                                title: 'Approve Worker',
                                description: `Are you sure you want to approve ${name}?`,
                                okText: 'Approve',
                                onConfirm: () => mutation.mutate(worker.id),
                              });
                            }}
                          >
                            <BadgeCheck className='w-4 h-4 mr-2' />
                            Approve
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            className='text-gray-600 bg-transparent'
                            onClick={(event) => {
                              event.stopPropagation();
                              openRejectDialog({ id: worker.id, name });
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : null}
                  </td>
                </tr>
              );
            })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className='flex items-center justify-center gap-2 mt-8'>
          {hasNextPage && (
            <Button
              size='lg'
              className='text-white'
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={!!selectedWorker} onOpenChange={(open) => !open && setSelectedWorker(null)}>
        <DialogContent className='bg-white sm:max-w-5xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {selectedWorker
                ? `${selectedWorker.first_name || ''} ${selectedWorker.last_name || ''}`.trim() ||
                  'Worker details'
                : 'Worker details'}
            </DialogTitle>
          </DialogHeader>

          {selectedWorker ? (
            <div className='space-y-4'>
              <div className='flex flex-wrap items-center gap-3 border-b border-gray-100 pb-4'>
                <Avatar className='w-14 h-14'>
                  <AvatarImage src={selectedWorker.profile_image_url || ''} />
                  <AvatarFallback>
                    {`${selectedWorker.first_name?.[0] || ''}${selectedWorker.last_name?.[0] || ''}`.toUpperCase() ||
                      'W'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge className='text-xs text-[#2563EB] bg-[#C8D9FF] capitalize font-normal'>
                      {formatStatus(selectedWorker.status)}
                    </Badge>
                    <Badge
                      className={cn(
                        'capitalize font-normal',
                        approvalStyles[selectedWorker.approved] ||
                          'bg-gray-100 text-gray-800'
                      )}
                    >
                      {display(selectedWorker.approved)}
                    </Badge>
                  </div>
                  <div className='mt-1 text-sm text-gray-500'>
                    Submitted {formatDateTime(selectedWorker.created_at)}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {detailGroups(selectedWorker).map((group) => {
                  const Icon = group.icon;

                  return (
                    <div
                      key={group.title}
                      className='rounded-md border border-gray-100 p-4'
                    >
                      <div className='flex items-center gap-2 font-semibold text-sm mb-3 text-gray-800'>
                        <Icon className='w-4 h-4 text-gray-500' />
                        {group.title}
                      </div>
                      <dl className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                        {group.fields.map(([label, value]) => (
                          <div key={label} className='min-w-0'>
                            <dt className='text-gray-500'>{label}</dt>
                            <dd className='text-gray-900 break-words'>
                              {display(value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </div>

              {selectedWorker.rejection_reason ? (
                <div className='rounded-md border border-red-100 bg-red-50 p-4 text-sm'>
                  <div className='font-semibold text-red-800 mb-1'>
                    Rejection reason
                  </div>
                  <p className='text-red-700'>{selectedWorker.rejection_reason}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className='bg-white sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Reject Worker</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              Add the reason that will be sent to{' '}
              {selectedRejectWorker?.name || 'this applicant'}.
            </p>
            <div className='space-y-2'>
              <Label htmlFor='rejectionReason'>Reason</Label>
              <Textarea
                id='rejectionReason'
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder='Explain what was wrong with the application'
                rows={6}
              />
            </div>
            <div className='flex justify-end gap-3'>
              <Button
                type='button'
                variant='outline'
                className='bg-white'
                onClick={() => setRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type='button'
                className='bg-red-700 text-white hover:bg-red-600'
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                onClick={() => {
                  if (!selectedRejectWorker) return;
                  openAlertModal({
                    title: 'Reject Worker',
                    description: `Are you sure you want to reject ${selectedRejectWorker.name}?`,
                    okText: 'Reject',
                    onConfirm: () =>
                      rejectMutation.mutate({
                        id: selectedRejectWorker.id,
                        reason: rejectionReason.trim(),
                      }),
                  });
                }}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrationRequests;
