'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ListFilter, MoreHorizontal, UserCheck, UserX, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import Link from 'next/link';

interface TableCardProps {
  title: string;
  action?: React.ReactNode;
  data: unknown[];
  columnKeys: {
    name: string;
    type?: 'string' | 'number';
    title: string;
    compoundKey?: string;
  }[];
  searchKeys?: string[];
  pathName?: string;
  hasNextPage?: boolean;
  onNextPage?: () => void;
  isLoading?: boolean;
  perPage?: number;
  page?: number;
  hasPreviousPage?: boolean;
  onPreviousPage?: () => void;
  totalPages?: number;
  onMarkPresent?: (id: string) => void;
  onMarkAbsent?: (id: string) => void;
  onRemoveParticipant?: (id: string) => void;
}

function getCompoundKeyValue(row: Row<unknown>, compoundKey?: string) {
  const keys = compoundKey?.split(',') || [];
  const values = [];

  for (const key of keys) {
    values.push((row.original as any)[key]);
  }

  return values.join(' ');
}

function getCellHeaderComp<T>(
  type: 'string' | 'number',
  id: string,
  title: string,
  compoundKey?: string
) {
  switch (type) {
    case 'string':
      return {
        accessorKey: id,
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => {
                switch (column.getIsSorted()) {
                  case 'asc':
                    column.toggleSorting(true);
                    break;
                  case 'desc':
                    column.clearSorting();
                    break;
                  case false:
                    column.toggleSorting(false);
                    break;
                  default:
                    column.clearSorting();
                }
              }}
            >
              {title}
              <ArrowUpDown />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className={compoundKey ? 'capitalize' : 'lowercase'}>
            {compoundKey
              ? getCompoundKeyValue(row, compoundKey)
              : row.getValue(id)}
          </div>
        ),
      } satisfies ColumnDef<T>;
    case 'number':
      return {
        accessorKey: id,
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              {title}
              <ArrowUpDown />
            </Button>
          );
        },
        cell: ({ row }) => <div className='lowercase'>{row?.getValue(id)}</div>,
      } satisfies ColumnDef<T>;
  }
}

function buildColumns(
  data: {
    name: string;
    type?: 'string' | 'number';
    title: string;
    compoundKey?: string;
  }[],
  pathName?: string,
  onMarkPresent?: (id: string) => void,
  onMarkAbsent?: (id: string) => void,
  onRemoveParticipant?: (id: string) => void
) {
  const columns: ColumnDef<unknown>[] = [];

  data?.forEach(({ name, title, type = 'string', compoundKey }) => {
    columns.push(getCellHeaderComp(type, name, title, compoundKey));
  });

  columns.push({
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const participantId = (row?.original as any)?.id;
      
      return (
        <div className="flex items-center gap-2">
          {pathName && (
            <Link href={`/${pathName}/${participantId}`}>
              <Button variant='link'>View Details</Button>
            </Link>
          )}
          
          {(onMarkPresent || onMarkAbsent || onRemoveParticipant) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onMarkPresent && (
                  <DropdownMenuItem
                    onClick={() => onMarkPresent(participantId)}
                    className="cursor-pointer"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Mark Present
                  </DropdownMenuItem>
                )}
                {onMarkAbsent && (
                  <DropdownMenuItem
                    onClick={() => onMarkAbsent(participantId)}
                    className="cursor-pointer"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Mark Absent
                  </DropdownMenuItem>
                )}
                {onRemoveParticipant && (
                  <DropdownMenuItem
                    onClick={() => onRemoveParticipant(participantId)}
                    className="cursor-pointer text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Participant
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      );
    },
  } satisfies ColumnDef<unknown>);

  return columns;
}

export function TableCard({
  title,
  action,
  data,
  columnKeys,
  searchKeys = ['name'],
  pathName,
  hasNextPage,
  onNextPage,
  isLoading,
  perPage,
  page,
  hasPreviousPage,
  onPreviousPage,
  totalPages,
  onMarkPresent,
  onMarkAbsent,
  onRemoveParticipant,
}: TableCardProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns = React.useMemo(
    () => buildColumns(columnKeys, pathName, onMarkPresent, onMarkAbsent, onRemoveParticipant),
    [columnKeys, pathName, onMarkPresent, onMarkAbsent, onRemoveParticipant]
  );
  const [search, setSearch] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    rowCount: perPage || 10,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: page || 1,
        pageSize: perPage || 10,
      },
    },
  });

  React.useEffect(() => {
    searchKeys.forEach((key) => {
      table.getColumn(key)?.setFilterValue(search);
    });
  }, [search, searchKeys, table]);

  return (
    <Card className='bg-white p-4 sm:px-9 sm:py-5'>
      <div className='w-full'>
        <div className='flex sm:items-center mb-6 justify-between flex-col sm:flex-row gap-4'>
          <h2 className='font-medium text-xl'>{title}</h2>
          <Input
            placeholder='Search prayer meetings...'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className='sm:max-w-[300px] placeholder:text-xs h-[40px]'
          />
          {/* <div className='font-normal text-[16px] items-center cursor-pointer hidden sm:flex'>
            <ListFilter className='text-primary' size={24} />
            Filter by
          </div> */}
          {/* {action} */}
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader className='bg-primary h-[44px]'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className='text-white'>
                        {!header.isPlaceholder && flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table && table?.getRowModel?.()?.rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='h-[44px]'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-[200px] text-center'
                  >
                    <div className='text-gray-500'>
                      {isLoading ? 'Loading...' : 'No prayer meetings found'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='flex-1 text-sm text-muted-foreground'>
            Page {page} of {totalPages || '∞'}
          </div>
          <div className='space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                onPreviousPage?.();
                table.previousPage();
              }}
              disabled={isLoading || !hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                onNextPage?.();
                table.nextPage();
              }}
              disabled={isLoading || !hasNextPage}
            >
              Next
            </Button>
          </div>
        </div> */}
      </div>
    </Card>
  );
}