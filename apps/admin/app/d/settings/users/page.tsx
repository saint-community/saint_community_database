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
import { Trash } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { AddNewAdmin } from '@/components/AddNewAdmin';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const { data } = useAccounts(page);

  const accounts = data?.data || [];

  console.log(data);

  const totalPages = useMemo(() => {
    const total = data?.total;
    const perPage = data?.per_page;
    return Math.ceil(total / perPage);
  }, [data]);

  const currentPage = useMemo(() => {
    return data?.current_page;
  }, [data]);

  const handleRemoveMember = (id: number) => {
    // Implement remove functionality
    console.log('Removing member:', id);
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
            <AddNewAdmin />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S/N</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Action</TableHead>
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

                <TableCell>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash />
                  </Button>
                </TableCell>
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
