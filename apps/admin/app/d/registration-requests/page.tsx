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
import { Card, CardContent } from '@workspace/ui/components/card';
import { toast } from '@workspace/ui/lib/sonner';
import { cn } from '@workspace/ui/lib/utils';
import { Clock, Mail, Phone, MapPin, CakeIcon, Loader } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { isEmpty } from 'lodash';

const RegistrationRequests = () => {
  const { push } = useRouter();
  const openAlertModal = useModalStore(({ openAlertModal }) => openAlertModal);

  // Get the current search parameters
  const searchParams = useSearchParams();
  const slug = searchParams.get('status') ?? '';
  const {
    data: workers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteWorkersRegistration(slug);

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
    mutationFn: (id: any) => rejectWorker(id),
    onSuccess: () => {
      refetch();
      toast.success('Worker successfully rejected');
    },
    onError: (error) => {
      console.log(error);
      toast.error('Failed to reject worker');
    },
  });

  const handleApprove = (id: string) => {
    mutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  const workersRequestData = useMemo(() => {
    const data = workers?.pages.flatMap((page) => page.data.data) || [];
    return data.map((worker: any) => ({
      id: worker.id,
      name: `${worker.first_name} ${worker.last_name}`,
      status: worker.status,
      statusColor: 'bg-yellow-100 text-yellow-800',
      submittedDate: new Date(worker.created_at).toLocaleString(),
      email: worker.email || 'N/A',
      phone: worker.phone_number || 'N/A',
      homeAddress: worker.house_address || 'N/A',
      workAddress: worker.work_address || 'N/A',
      birthDate: worker.dob ? new Date(worker.dob).toLocaleDateString() : 'N/A',
      church: worker.church?.name, // Assuming church_id is a string
      pastor: "Pastor's Name", // Placeholder, replace with actual data if available
      fellowship: worker.fellowship?.name, // Assuming fellowship_id is a string
      fellowshipLeader: "Fellowship Leader's Name", // Placeholder, replace with actual data if available
      cell: worker.cell?.name, // Assuming cell_id is a string
      cellLeader: "Cell Leader's Name", // Placeholder, replace with actual data if available
      department: worker.department_id, // Assuming department_id is a string
      memberSince: worker.member_since
        ? new Date(worker.member_since).toLocaleDateString()
        : 'N/A',
      workerSince: worker.worker_since
        ? new Date(worker.worker_since).toLocaleDateString()
        : 'N/A',
      slug: worker.slug,
      approved: worker.approved,
      active: worker.active,
      facebookUsername: worker.facebook_username || 'N/A',
      twitterUsername: worker.twitter_username || 'N/A',
      instagramUsername: worker.instagram_username || 'N/A',
      prayerGroupId: worker.prayer_group_id || 'N/A',
      departmentId: worker.department_id || 'N/A',
      dateJoinedChurch: worker.date_joined_church
        ? new Date(worker.date_joined_church).toLocaleDateString()
        : 'N/A',
      dateBecameWorker: worker.date_became_worker
        ? new Date(worker.date_became_worker).toLocaleDateString()
        : 'N/A',
    }));
  }, [workers]);

  const handleNavigation = (path: string) => {
    push(path);
  };
  return (
    <div className='flex-1 flex flex-col'>
      {/* Content */}
      <div className='flex-1 p-6'>
        {/* Filter Tabs */}
        <div className='flex justify-end mb-6'>
          <div className='flex items-center gap-2 bg-black py-2 px-4 rounded-md'>
            <Button
              variant='ghost'
              className={cn(' text-white', {
                'bg-white text-black': slug === 'pending',
              })}
              onClick={() =>
                handleNavigation('/d/registration-requests/?status=pending')
              }
            >
              Pending
            </Button>
            <Button
              variant='ghost'
              className={cn(' text-white', {
                'bg-white text-black': slug === 'approved',
              })}
              onClick={() =>
                handleNavigation('/d/registration-requests/?status=approved')
              }
            >
              Approved
            </Button>
            <Button
              variant='ghost'
              className={cn(' text-white', {
                'bg-white text-black': slug === 'rejected',
              })}
              onClick={() =>
                handleNavigation('/d/registration-requests/?status=rejected')
              }
            >
              Rejected
            </Button>
            {/* <Button variant="outline" size="sm" className="ml-4 bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button> */}
          </div>
        </div>

        <h1 className='text-2xl font-bold mb-6 capitalize'>{slug} List</h1>

        {/* Member Cards */}
        {isLoading ? (
          <div className='flex flex-col items-center justify-center h-screen  mx-auto '>
            <Loader className='w-12 h-12 animate-spin mb-4 text-gray-400' />
            <span className='text-gray-500'>
              Hang tight, we're loading registration list 🚀
            </span>
          </div>
        ) : isEmpty(workersRequestData) ? (
          <div className='flex flex-col items-center justify-center h-screen  mx-auto '>
            <span className='text-gray-500'>
              {`There are no ${slug} registration requests at the moment.`}
            </span>
          </div>
        ) : (
          <div className='space-y-4'>
            {workersRequestData.map((member) => (
              <Card key={member.id} className='relative rounded-lg'>
                <CardContent className='p-6 bg-white rounded-lg'>
                  <div className='flex items-start justify-between mb-4 flex-col sm:flex-row gap-4'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='w-12 h-12'>
                        <AvatarImage src='/placeholder.svg?height=48&width=48' />
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-semibold'>{member.name}</h3>
                          <Badge
                            className={`text-xs text-[#2563EB] bg-[#C8D9FF] capitalize`}
                          >
                            <span className='text-xs font-thin'>
                              {member.status.replaceAll('_', ' ')}
                            </span>
                          </Badge>
                        </div>
                        <div className='text-sm text-gray-500 flex items-center gap-1'>
                          <Clock className='w-3 h-3' />
                          Submitted {member.submittedDate}
                        </div>
                      </div>
                    </div>
                    <Badge className='bg-yellow-100 text-yellow-800 capitalize font-thin '>
                      {member.approved === 'true'
                        ? 'Approved'
                        : member.approved}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className='grid sm:grid-cols-3 grid-cols-1 gap-4 mb-4 '>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm'>
                        <Mail className='w-4 h-4 text-gray-400' />
                        <span>{member.email}</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <Phone className='w-4 h-4 text-gray-400' />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm'>
                        <MapPin className='w-4 h-4 text-gray-400' />{' '}
                        <span>Home - </span>
                        <span>{member.homeAddress}</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <MapPin className='w-4 h-4 text-gray-400' />{' '}
                        <span>Work - </span>
                        <span>{member.workAddress}</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-4 mb-4 text-sm'>
                      <div className='flex items-center gap-1'>
                        <span className='text-gray-500'>
                          <CakeIcon className='text-gray-400' />
                        </span>
                        <span>{member.birthDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Other Details */}
                  <div className='mb-6 pt-4'>
                    <h4 className='font-semibold mb-3'>Other Details:</h4>
                    <div className='grid sm:grid-cols-3 grid-cols-1 gap-4 text-sm'>
                      <div className='flex flex-col gap-2'>
                        <div className='text-gray-600'>
                          CHURCH: {member.church}
                        </div>
                        <div className='text-gray-600'>
                          Pastor: {member?.pastor}
                        </div>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='text-gray-600'>
                          Fellowship: {member.fellowship}
                        </div>
                        <div className='text-gray-600'>
                          Fellowship/PCF Leader: {member?.fellowshipLeader}
                        </div>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='text-gray-600'>Cell: {member.cell}</div>
                        <div className='text-gray-600'>
                          Cell Leader: {member?.cellLeader}
                        </div>
                        <div className='text-gray-600'>
                          Department: {member.department}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {member.approved === 'pending' ? (
                    <div className='flex gap-3'>
                      <Button
                        className='bg-green-700/90 hover:bg-green-600 text-white'
                        onClick={() =>
                          openAlertModal({
                            title: 'Approve Worker',
                            description: `Are you sure you want to approve ${member.name}?`,
                            okText: 'Approve',
                            onConfirm: () => handleApprove(member.id),
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant='outline'
                        className='text-gray-600 bg-transparent'
                        onClick={() =>
                          openAlertModal({
                            title: 'Reject Worker',
                            description: `Are you sure you want to reject ${member.name}?`,
                            okText: 'Reject',
                            onConfirm: () => handleReject(member.id),
                          })
                        }
                      >
                        Reject
                      </Button>
                      {/* <Button
                      variant="outline"
                      className="text-yellow-600 border-yellow-300 bg-transparent"
                    >
                      Leave Pending
                    </Button> */}
                    </div>
                  ) : null}

                  {member.approved === 'false' && (
                    <div className='flex gap-3'>
                      <Button
                        className='bg-gray-500 text-white'
                        onClick={() => {}}
                      >
                        Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className='flex items-center justify-center gap-2 mt-8'>
          {hasNextPage && (
            <Button
              // variant="ghost"
              size='lg'
              className='text-white'
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <>
                  <svg
                    className='animate-spin h-4 w-4 mr-2 inline-block text-gray-400'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : hasNextPage ? (
                'Load More'
              ) : null}
            </Button>
          )}
        </div>
        {/* <ConfirmDialog open={openAlert} onConfirm={handleOpenAlert} /> */}
      </div>
    </div>
  );
};

export default RegistrationRequests;
