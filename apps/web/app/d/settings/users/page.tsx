'use client';

import { useState } from 'react';
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

interface Member {
  id: number;
  name: string;
  gender: string;
  fellowship: string;
  cell: string;
  status: string;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual data fetching
  const members: Member[] = [
    {
      id: 1,
      name: 'Samni Kanyinsola',
      gender: 'M',
      fellowship: 'Barracks',
      cell: 'Kobili',
      status: 'Consistent',
    },
    // Add more mock data as needed
  ];

  const handleRemoveMember = (id: number) => {
    // Implement remove functionality
    console.log('Removing member:', id);
  };

  const filteredMembers = members.filter((member) =>
    Object.values(member).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-2'>Manage Users</h1>
      <p className='text-gray-600 mb-6'>Manage user data in the table below</p>

      <Card className='p-4'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold'>Members</h2>
          <div className='flex items-center gap-2'>
            <Input
              type='search'
              placeholder='Church, Fellowship...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='max-w-[300px]'
            />
            <Button variant='outline'>Filter</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S/N</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Fellowship/PCF</TableHead>
              <TableHead>Cell</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member, index) => (
              <TableRow key={member.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.gender}</TableCell>
                <TableCell>{member.fellowship}</TableCell>
                <TableCell>{member.cell}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      member.status === 'Consistent'
                        ? 'bg-green-100 text-green-800'
                        : member.status === 'Inconsistent'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {member.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remove mem.
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className='flex items-center justify-between mt-4'>
          <p className='text-sm text-red-600'>Changes have been saved!</p>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              &lt;
            </Button>
            <span className='text-sm'>Page 1 of 3</span>
            <Button variant='outline' size='sm'>
              &gt;
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
