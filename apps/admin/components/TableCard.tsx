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
} from '@workspace/ui/components/react-table';
import { ArrowUpDown, ListFilter } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';
import Image from 'next/image';
import EmptyTableImage from '@/assets/svgs/empty-table.svg';
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
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterComponent?: React.ReactNode;
}

export type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

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
                // column.toggleSorting(column.getIsSorted() === 'asc')
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
  pathName?: string
) {
  const columns: ColumnDef<unknown>[] = [
    // {
    //   id: 'select',
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && 'indeterminate')
    //       }
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label='Select all'
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label='Select row'
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
  ];

  data?.forEach(({ name, title, type = 'string', compoundKey }) => {
    columns.push(getCellHeaderComp(type, name, title, compoundKey));
  });

  columns.push({
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        // @ts-expect-error - id is always present
        <Link href={`/${pathName}/${row?.original?.id}`}>
          <Button variant='link'>View Details</Button>
        </Link>
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
  searchKeys = ['email'],
  pathName,
  hasNextPage,
  onNextPage,
  isLoading,
  perPage,
  page,
  hasPreviousPage,
  onPreviousPage,
  totalPages,
  searchValue: externalSearchValue,
  onSearchChange: externalOnSearchChange,
  filterComponent,
}: TableCardProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns = React.useMemo(
    () => buildColumns(columnKeys, pathName),
    [columnKeys, pathName]
  );
  
  // Use external search state if provided, otherwise use internal state
  const [internalSearch, setInternalSearch] = React.useState('');
  const search = externalSearchValue !== undefined ? externalSearchValue : internalSearch;
  const setSearch = externalOnSearchChange || setInternalSearch;

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
    // console.log(search, searchKeys);

    searchKeys.forEach((key) => {
      // console.log({ key });
      table.getColumn(key)?.setFilterValue(search);
    });
  }, [search, searchKeys, table]);

  return (
    <Card className='bg-white p-4 sm:px-9 sm:py-5'>
      <div className='w-full'>
        <div className='flex sm:items-center mb-6 justify-between flex-col sm:flex-row gap-4'>
          <h2 className='font-medium text-xl'>{title}</h2>
          <Input
            placeholder='Church, Fellowship, Cell, members'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            // value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
            // onChange={(event) =>
            //   table.getColumn('email')?.setFilterValue(event.target.value)
            // }
            className='sm:max-w-[300px] placeholder:text-xs h-[40px]'
          />
          <div className="flex gap-2 items-center">
             <ListFilter className='text-primary mr-2' size={20} />
                  Filter by 

                  {filterComponent}
          </div>
         
          {action}
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader className='bg-primary h-[44px]'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className='text-white'>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
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
                    className='h-[500px] text-center'
                  >
                    <Image src={EmptyTableImage} alt='' className='mx-auto' />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
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
              // disabled={!table.getCanPreviousPage()}
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
              // disabled={!table.getCanNextPage()}
              disabled={isLoading || !hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
