'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { toast } from '@workspace/ui/lib/sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useMe } from '@/hooks/useMe';
import {
  useEntityOwnership,
  useOwnershipOptions,
  useUserOwnership,
} from '@/hooks/ownership';
import {
  addOwnership,
  removeOwnership,
  type OwnershipEntityType,
} from '@/services/ownership';
import { useModalStore } from '@/store';
import { QUERY_PATHS, ROLES } from '@/utils/constants';

type InspectMode = 'entity' | 'user';

const entityTypes: Array<{ value: OwnershipEntityType; label: string }> = [
  { value: 'church', label: 'Church' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'cell', label: 'Cell' },
];

const display = (value: any) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return String(value);
};

const userLabel = (user: any) =>
  user?.name || user?.email || (user?.id ? `User #${user.id}` : 'Unknown user');

const entityLabel = (entity: any) => {
  if (!entity) return 'Unknown entity';
  const meta = [
    entity.church?.name || entity.church_name,
    entity.fellowship?.name || entity.fellowship_name,
  ].filter(Boolean);

  return meta.length ? `${entity.name} (${meta.join(' / ')})` : entity.name;
};

export default function OwnershipSettingsPage() {
  const { data: user } = useMe();
  const queryClient = useQueryClient();
  const openAlertModal = useModalStore(({ openAlertModal }) => openAlertModal);
  const [mode, setMode] = useState<InspectMode>('entity');
  const [entityType, setEntityType] = useState<OwnershipEntityType>('church');
  const [entityId, setEntityId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newOwnerUserId, setNewOwnerUserId] = useState('');
  const [newOwnerEntityType, setNewOwnerEntityType] =
    useState<OwnershipEntityType>('church');
  const [newOwnerEntityId, setNewOwnerEntityId] = useState('');

  const isAdmin = user?.role === ROLES.ADMIN;
  const { data: options = {}, isLoading: optionsLoading } = useOwnershipOptions();

  const entityOwnership = useEntityOwnership(entityType, entityId);
  const userOwnership = useUserOwnership(selectedUserId);

  const users = options.users || [];
  const entityOptions = useMemo(() => {
    if (entityType === 'church') return options.churches || [];
    if (entityType === 'fellowship') return options.fellowships || [];
    return options.cells || [];
  }, [entityType, options]);

  const addMutation = useMutation({
    mutationFn: addOwnership,
    onSuccess: () => {
      toast.success('Ownership added');
      setNewOwnerUserId('');
      queryClient.invalidateQueries({ queryKey: [QUERY_PATHS.OWNERSHIP_ENTITY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_PATHS.OWNERSHIP_USER] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add ownership');
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeOwnership,
    onSuccess: () => {
      toast.success('Ownership removed');
      queryClient.invalidateQueries({ queryKey: [QUERY_PATHS.OWNERSHIP_ENTITY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_PATHS.OWNERSHIP_USER] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to remove ownership');
    },
  });

  const removeWithConfirm = (ownership: any) => {
    openAlertModal({
      title: 'Remove ownership',
      description: 'Are you sure you want to remove this ownership record?',
      okText: 'Remove',
      onConfirm: () => removeMutation.mutate(ownership.id),
    });
  };

  const handleAddForEntity = () => {
    if (!newOwnerUserId || !entityId) {
      toast.error('Select a user and an entity first');
      return;
    }

    addMutation.mutate({
      user_id: newOwnerUserId,
      entity_type: entityType,
      entity_id: entityId,
    });
  };

  const handleAddForUser = () => {
    if (!selectedUserId || !newOwnerEntityId) {
      toast.error('Select a user and an entity first');
      return;
    }

    addMutation.mutate({
      user_id: selectedUserId,
      entity_type: newOwnerEntityType,
      entity_id: newOwnerEntityId,
    });
  };

  const addEntityOptions = useMemo(() => {
    if (newOwnerEntityType === 'church') return options.churches || [];
    if (newOwnerEntityType === 'fellowship') return options.fellowships || [];
    return options.cells || [];
  }, [newOwnerEntityType, options]);

  if (user && !isAdmin) {
    return (
      <div className='p-6 text-sm text-gray-600'>
        You do not have permission to access ownership settings.
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold mb-2'>Ownership Settings</h1>
        <p className='text-gray-600'>
          Review and manage user ownership of churches, fellowships, and cells.
        </p>
      </div>

      <Card className='p-4 space-y-4'>
        <div className='grid gap-4 md:grid-cols-3'>
          <div className='space-y-2'>
            <Label>Inspect by</Label>
            <Select value={mode} onValueChange={(value) => setMode(value as InspectMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='entity'>Church, Fellowship, or Cell</SelectItem>
                <SelectItem value='user'>User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === 'entity' ? (
            <>
              <div className='space-y-2'>
                <Label>Entity type</Label>
                <Select
                  value={entityType}
                  onValueChange={(value) => {
                    setEntityType(value as OwnershipEntityType);
                    setEntityId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Select entity</Label>
                <Select value={entityId} onValueChange={setEntityId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select entity' />
                  </SelectTrigger>
                  <SelectContent>
                    {entityOptions.map((entity: any) => (
                      <SelectItem key={entity.id} value={String(entity.id)}>
                        {entityLabel(entity)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className='space-y-2 md:col-span-2'>
              <Label>Select user</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder='Select user' />
                </SelectTrigger>
                <SelectContent>
                  {users.map((account: any) => (
                    <SelectItem key={account.id} value={String(account.id)}>
                      {userLabel(account)} - {display(account.role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {optionsLoading ? (
        <div className='flex items-center gap-2 text-gray-500'>
          <Loader2 className='h-4 w-4 animate-spin' />
          Loading ownership options...
        </div>
      ) : null}

      {mode === 'entity' ? (
        <Card className='p-4 space-y-4'>
          <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
            <div>
              <h2 className='text-lg font-semibold'>Entity Owners</h2>
              <p className='text-sm text-gray-500'>
                Users attached to the selected {entityType}.
              </p>
            </div>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-end'>
              <div className='space-y-2 min-w-[260px]'>
                <Label>Add owner</Label>
                <Select value={newOwnerUserId} onValueChange={setNewOwnerUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select user' />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((account: any) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {userLabel(account)} - {display(account.role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className='text-white'
                disabled={!entityId || !newOwnerUserId || addMutation.isPending}
                onClick={handleAddForEntity}
              >
                <Plus className='h-4 w-4 mr-2' />
                Add
              </Button>
            </div>
          </div>

          <OwnershipTable
            rows={entityOwnership.data?.owners || []}
            loading={entityOwnership.isLoading}
            view='owners'
            onRemove={removeWithConfirm}
          />
        </Card>
      ) : (
        <Card className='p-4 space-y-4'>
          <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
            <div>
              <h2 className='text-lg font-semibold'>User Ownership</h2>
              <p className='text-sm text-gray-500'>
                Churches, fellowships, and cells owned by the selected user.
              </p>
            </div>
            <div className='grid gap-2 sm:grid-cols-[160px_260px_auto] sm:items-end'>
              <div className='space-y-2'>
                <Label>Entity type</Label>
                <Select
                  value={newOwnerEntityType}
                  onValueChange={(value) => {
                    setNewOwnerEntityType(value as OwnershipEntityType);
                    setNewOwnerEntityId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Add entity</Label>
                <Select value={newOwnerEntityId} onValueChange={setNewOwnerEntityId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select entity' />
                  </SelectTrigger>
                  <SelectContent>
                    {addEntityOptions.map((entity: any) => (
                      <SelectItem key={entity.id} value={String(entity.id)}>
                        {entityLabel(entity)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className='text-white'
                disabled={
                  !selectedUserId || !newOwnerEntityId || addMutation.isPending
                }
                onClick={handleAddForUser}
              >
                <Plus className='h-4 w-4 mr-2' />
                Add
              </Button>
            </div>
          </div>

          <OwnershipTable
            rows={userOwnership.data?.ownerships || []}
            loading={userOwnership.isLoading}
            view='entities'
            onRemove={removeWithConfirm}
          />
        </Card>
      )}
    </div>
  );
}

function OwnershipTable({
  rows,
  loading,
  view,
  onRemove,
}: {
  rows: any[];
  loading: boolean;
  view: 'owners' | 'entities';
  onRemove: (ownership: any) => void;
}) {
  if (loading) {
    return (
      <div className='flex items-center gap-2 rounded-md border border-gray-100 p-4 text-gray-500'>
        <Loader2 className='h-4 w-4 animate-spin' />
        Loading ownership records...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className='rounded-md border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500'>
        No ownership records found.
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-md border border-gray-200'>
      <Table>
        <TableHeader>
          <TableRow>
            {view === 'owners' ? (
              <>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </>
            ) : (
              <>
                <TableHead>Entity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent</TableHead>
              </>
            )}
            <TableHead>Added</TableHead>
            <TableHead className='text-right'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((ownership) => (
            <TableRow key={ownership.id}>
              {view === 'owners' ? (
                <>
                  <TableCell className='font-medium'>
                    {userLabel(ownership.user)}
                  </TableCell>
                  <TableCell>{display(ownership.user?.email)}</TableCell>
                  <TableCell>
                    <Badge className='capitalize font-normal'>
                      {display(ownership.user?.role).replaceAll('_', ' ')}
                    </Badge>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className='font-medium'>
                    {display(ownership.entity?.name)}
                  </TableCell>
                  <TableCell>
                    <Badge className='capitalize font-normal'>
                      {display(ownership.entity_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {[ownership.entity?.church_name, ownership.entity?.fellowship_name]
                      .filter(Boolean)
                      .join(' / ') || 'N/A'}
                  </TableCell>
                </>
              )}
              <TableCell>
                {ownership.created_at
                  ? new Date(ownership.created_at).toLocaleDateString()
                  : 'N/A'}
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  variant='outline'
                  size='sm'
                  className='bg-white text-red-700 hover:text-red-800'
                  onClick={() => onRemove(ownership)}
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
