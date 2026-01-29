'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Filter, Building, Users, MapPin, Phone, User, Briefcase, UserCheck, X, Check } from 'lucide-react';
import { useChurchesOption } from '@/hooks/churches';
import { useFellowshipsOption } from '@/hooks/fellowships';
import { useCellsByFellowship, useCellsOption } from '@/hooks/cell';
import { useDepartmentsOption } from '@/hooks/departments';
import { useState, useEffect, use } from 'react';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import { useWorkerUrlParams } from '@/hooks/useWorkerUrlParams';

// Worker status options based on roles
const WORKER_STATUSES = [
  { value: 'admin', label: 'Admin' },
  { value: 'pastor', label: 'Pastor' },
  { value: 'church_pastor', label: 'Church Pastor' },
  { value: 'fellowship_leader', label: 'Fellowship Leader' },
  { value: 'cell_leader', label: 'Cell Leader' },
  { value: 'worker', label: 'Worker' },
  { value: 'member', label: 'Member' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

interface WorkerFiltersProps {
  setNameSearchValue?: (value: string) => void;
}

export function WorkerFilters({
  setNameSearchValue
}: WorkerFiltersProps) {
  const { filters, updateParams, clearFilters } = useWorkerUrlParams();
  const { name, phone, church, fellowship, cell, gender, status, department } = filters;
  const { data: churches, isLoading: churchesLoading } = useChurchesOption();
  
  // Local state for modal
  const [isOpen, setIsOpen] = useState(false);
  
  // React Hook Form setup
  const form = useForm({
    defaultValues: {
      name: name || '',
      phone: phone || '',
      church: church || 'all',
      fellowship: fellowship || 'all',
      cell: cell || 'all',
      gender: gender || 'all',
      status: status || 'all',
      department: department || 'all',
    },
  });

  const { Subscribe, setFieldValue } = form;

  const hasActiveFilters = name || phone || church || fellowship || cell || gender || status || department;
  const activeFilterCount = [name, phone, church, fellowship, cell, gender, status, department].filter(Boolean).length;

  // Reset form values when modal opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // setFieldValue('name', name || '');
      setNameSearchValue?.(''); 
      setFieldValue('name', '');
      setFieldValue('phone', phone || '');
      setFieldValue('church', church || 'all');
      setFieldValue('fellowship', fellowship || 'all');
      setFieldValue('cell', cell || 'all');
      setFieldValue('gender', gender || 'all');
      setFieldValue('status', status || 'all');
      setFieldValue('department', department || 'all');
    }
    setIsOpen(open);
  };

  // Apply filters and close modal
  const handleApplyFilters = (formState: any) => {
    const values = formState.values;
    
    updateParams({
      name: values.name === '' ? undefined : values.name,
      phone: values.phone === '' ? undefined : values.phone,
      church: values.church === 'all' ? undefined : values.church,
      fellowship: values.fellowship === 'all' ? undefined : values.fellowship,
      cell: values.cell === 'all' ? undefined : values.cell,
      gender: values.gender === 'all' ? undefined : values.gender,
      status: values.status === 'all' ? undefined : values.status,
      department: values.department === 'all' ? undefined : values.department,
    });
    
    setIsOpen(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setNameSearchValue?.(''); 
    setFieldValue('name', '');
    setFieldValue('phone', '');
    setFieldValue('church', 'all');
    setFieldValue('fellowship', 'all');
    setFieldValue('cell', 'all');
    setFieldValue('gender', 'all');
    setFieldValue('status', 'all');
    setFieldValue('department', 'all');
    clearFilters();
    setIsOpen(false);
  };

  // Cancel and revert to original values
  const handleCancel = () => {
    setFieldValue('name', name || '');
    setFieldValue('phone', phone || '');
    setFieldValue('church', church || 'all');
    setFieldValue('fellowship', fellowship || 'all');
    setFieldValue('cell', cell || 'all');
    setFieldValue('gender', gender || 'all');
    setFieldValue('status', status || 'all');
    setFieldValue('department', department || 'all');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-4">
          <Button 
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2 py-3"
          >
            <Filter size={16} />
            Worker Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>
          
          {/* Quick Clear Button - Only show when filters are active */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent modal from opening
                handleClearFilters();
              }}
              className="flex items-center gap-1 text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <X size={14} />
              Clear
            </Button>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filter Workers
          </DialogTitle>
          <DialogDescription>
            Filter workers by name, phone, church, fellowship, cell, gender, status, and department. Changes will be applied when you click "Apply Filters".
          </DialogDescription>
        </DialogHeader>

        <Subscribe
          selector={(state) => state.values}
          children={(values) => {
            // Load dependent data based on selected values
            const { data: fellowships, isLoading: fellowshipsLoading } = useFellowshipsOption(
              values.church === 'all' ? undefined : values.church
            );
            const { data: cells, isLoading: cellsLoading } = useCellsByFellowship(
              values.fellowship === 'all' ? undefined : values.fellowship
            );
         
            
            const { data: departments, isLoading: departmentsLoading } = useDepartmentsOption();

            // Reset dependent filters when parent changes
            useEffect(() => {
              if (isOpen && values.church === 'all') {
                setFieldValue('fellowship', 'all');
                setFieldValue('cell', 'all');
              }
            }, [values.church]);

            useEffect(() => {
              if (isOpen && values.fellowship === 'all') {
                setFieldValue('cell', 'all');
              }
            }, [values.fellowship]);

            return (
              <div className="space-y-6 py-4">
                {/* Search Fields */}
                {/* <div className="grid gap-4">
                  <h4 className="text-sm font-medium text-gray-700">Search Fields</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Phone size={16} className="text-gray-500" />
                        Name
                      </label>
                      <form.Field
                        name="name"
                        children={(field) => (
                          <Input
                            placeholder="Search by name..."
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Phone size={16} className="text-gray-500" />
                        Phone
                      </label>
                      <form.Field
                        name="phone"
                        children={(field) => (
                          <Input
                            placeholder="Search by phone..."
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div> */}

                {/* Location Filters */}
                <div className="grid gap-4">
                  <h4 className="text-sm font-medium text-gray-700">Location Filters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Building size={16} className="text-gray-500" />
                        Church
                      </label>
                      <form.Field
                        name="church"
                        children={(field) => (
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                            disabled={churchesLoading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Church" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Churches</SelectItem>
                              {churches?.map((churchOption: { value: string; label: string }) => (
                                <SelectItem key={churchOption.value} value={String(churchOption.value)}>
                                  {churchOption.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Users size={16} className="text-gray-500" />
                        Fellowship
                      </label>
                      <form.Field
                        name="fellowship"
                        children={(field) => (
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                            disabled={fellowshipsLoading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Fellowship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {values.church && values.church !== 'all' ? 'All Fellowships in Church' : 'All Fellowships'}
                              </SelectItem>
                              {fellowships?.map((fellowshipOption: { value: string; label: string }) => (
                                <SelectItem key={fellowshipOption.value} value={String(fellowshipOption.value)}>
                                  {fellowshipOption.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <MapPin size={16} className="text-gray-500" />
                        Cell
                      </label>
                      <form.Field
                        name="cell"
                        children={(field) => (
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                            disabled={cellsLoading || values.fellowship === 'all'}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Cell" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {values.fellowship && values.fellowship !== 'all' ? 'All Cells in Fellowship' : 'All Cells'}
                              </SelectItem>
                              {cells?.cells?.map((cellOption: { id: string; name: string }) => (
                                <SelectItem key={cellOption.id} value={String(cellOption.id)}>
                                  {cellOption.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Personal & Role Filters */}
                <div className="grid gap-4">
                  <h4 className="text-sm font-medium text-gray-700">Personal & Role Filters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <User size={16} className="text-gray-500" />
                        Gender
                      </label>
                      <form.Field
                        name="gender"
                        children={(field) => (
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Genders</SelectItem>
                              {GENDER_OPTIONS.map((genderOption) => (
                                <SelectItem key={genderOption.value} value={genderOption.value}>
                                  {genderOption.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <UserCheck size={16} className="text-gray-500" />
                        Status/Role
                      </label>
                      <form.Field
                        name="status"
                        children={(field) => (
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              {WORKER_STATUSES.map((statusOption) => (
                                <SelectItem key={statusOption.value} value={statusOption.value}>
                                  {statusOption.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Briefcase size={16} className="text-gray-500" />
                        Department
                      </label>
                      <form.Field
                        name="department"
                        children={(field) => (
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                            disabled={departmentsLoading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Departments</SelectItem>
                              {departments?.map((departmentOption: { value: string; label: string }) => (
                                <SelectItem key={departmentOption.value} value={String(departmentOption.value)}>
                                  {departmentOption.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        />

        <Subscribe
          selector={(state) => state}
          children={(formState) => (
            <DialogFooter className="flex gap-2 sm:gap-2">
              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X size={14} />
                  Clear All
                </Button>
              )}
              
              {/* Cancel */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              
              {/* Apply Filters */}
              <Button
                size="sm"
                onClick={() => handleApplyFilters(formState)}
                className="flex items-center gap-1"
              >
                <Check size={14} />
                Apply Filters
              </Button>
            </DialogFooter>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}