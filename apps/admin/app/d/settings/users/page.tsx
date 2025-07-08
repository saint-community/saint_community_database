'use client';

import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { useAccounts } from '@/hooks/auth';
import { Loader2, Trash } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { AddNewAdmin } from '@/components/AddNewAdmin';
import { QUERY_PATHS, ROLES } from '@/utils/constants';
import { useMe } from '@/hooks/useMe';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeAccount } from '@/services/auth';
import { toast } from '@workspace/ui/lib/sonner';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const { data } = useAccounts(page);
  const { data: user } = useMe();
  const accounts = data?.data || [];
  const queryClient = useQueryClient();
  const isAdmin = !!user && [ROLES.ADMIN, ROLES.PASTOR].includes(user?.role);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  console.log(data);

  const totalPages = useMemo(() => {
    const total = data?.total;
    const perPage = data?.per_page;
    return Math.ceil(total / perPage);
  }, [data]);

  const currentPage = useMemo(() => {
    return data?.current_page;
  }, [data]);

  const { mutate: removeMember, isPending } = useMutation({
    mutationFn: (id: number) => {
      return removeAccount(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_PATHS.ACCOUNTS] });
      toast.success('Member removed successfully');
      setSelectedMember(null);
    },
    onError: (error: any) => {
      console.log(error);
      toast.error(error?.message || 'Failed to remove member');
      setSelectedMember(null);
    },
  });

  const handleRemoveMember = (id: number) => {
    // Implement remove functionality
    console.log('Removing member:', id);
    setSelectedMember(id);
    removeMember(id);
  };

  const filteredMembers = accounts?.filter((account: any) =>
    Object.values(account).some((value: any) =>
      value?.toString()?.toLowerCase()?.includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-2'>Manage Users</h1>
      <p className='text-gray-600 mb-6'>Manage user data in the table below</p>

      <Card className='p-4'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold'>Users</h2>
          <div className='flex items-center gap-2'>
            <Input
              type='search'
              placeholder='Search users'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='max-w-[300px]'
            />
            {isAdmin && <AddNewAdmin />}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S/N</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              {isAdmin && <TableHead>Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers?.map((member: any, index: number) => (
              <TableRow key={member.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell className='text-sm'>{member.email}</TableCell>
                <TableCell>
                  <Badge className='text-xs' variant='secondary'>
                    {member.role?.replace('_', ' ')}
                  </Badge>
                </TableCell>

                {isAdmin && (
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant='destructive'
                          size='sm'
                          disabled={isPending}
                        >
                          {isPending && selectedMember === member.id ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : (
                            <Trash />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this account and remove their data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className='bg-red-500 hover:bg-red-600'
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center gap-2' />
          {/* <p className='text-sm text-red-600'>Changes have been saved!</p> */}
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((prev) => prev - 1)}
              disabled={data?.prev_page_url === null}
            >
              &lt;
            </Button>
            <span className='text-sm'>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((prev) => prev + 1)}
              disabled={data?.next_page_url === null}
            >
              &gt;
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
