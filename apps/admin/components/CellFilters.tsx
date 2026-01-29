'use client';

import { Button } from '@workspace/ui/components/button';
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
import { Filter, Building, Users, X, Check } from 'lucide-react';
import { useChurchesOption } from '@/hooks/churches';
import { useFellowshipsOption } from '@/hooks/fellowships';
import { useState, useEffect } from 'react';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import { useCellUrlParams } from '@/hooks/useCellUrlParams';

interface CellFiltersProps {
}


export function CellFilters({ 


}: CellFiltersProps) {

  const { filters, updateParams, clearFilters } = useCellUrlParams();
  const { church, fellowship } = filters;
  const { data: churches, isLoading: churchesLoading } = useChurchesOption();
  
  // Local state for modal
  const [isOpen, setIsOpen] = useState(false);
  
  // React Hook Form setup
  const form = useForm({
    defaultValues: {
      church: church || 'all',
      fellowship: fellowship || 'all',
    },
  });

  const { Subscribe, setFieldValue } = form;

  const hasActiveFilters = church || fellowship;
  const activeFilterCount = [church, fellowship].filter(Boolean).length;

  // Reset form values when modal opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setFieldValue('church', church || 'all');
      setFieldValue('fellowship', fellowship || 'all');
    }
    setIsOpen(open);
  };

  // Apply filters and close modal
  const handleApplyFilters = (formState: any) => {
 
    const churchValue =  formState.values.church;
    const fellowshipValue =  formState.values.fellowship;
    
    updateParams({
      church: churchValue,
      fellowship: fellowshipValue,
    });
    

    setIsOpen(false);
  };

  // Clear all filters
  const handleClearFilters = () => {

    setFieldValue('church', 'all');
    setFieldValue('fellowship', 'all');
    clearFilters();
    setIsOpen(false);
  };

  // Cancel and revert to original values
  const handleCancel = () => {

    setFieldValue('church', church || 'all');
    setFieldValue('fellowship', fellowship || 'all');
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
            Church & Fellowship
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
                clearFilters();
              }}
              className="flex items-center gap-1 text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <X size={14} />
              Clear
            </Button>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filter Cells
          </DialogTitle>
          <DialogDescription>
            Filter cells by church and fellowship. Changes will be applied when you click "Apply Filters".
          </DialogDescription>
        </DialogHeader>

        <Subscribe
          selector={(state) => state.values}
          children={(values) => {
            // Load fellowships based on selected church
            const { data: fellowships, isLoading: fellowshipsLoading } = useFellowshipsOption(
              values.church === 'all' ? undefined : values.church
            );

            // Reset fellowship when church changes to 'all'
            useEffect(() => {
              if (isOpen && values.church === 'all') {
                setFieldValue('fellowship', 'all');
              }
            }, [values.church]);

            return (
              <div className="space-y-6 py-4">
                {/* Church Filter */}
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
                        onValueChange={(value) => {
                          console.log('Church selection changed:', value);
                          field.handleChange(value);
                        }}
                        disabled={churchesLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a church" />
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

                {/* Fellowship Filter */}
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
                        onValueChange={(value) => {
                          console.log('Fellowship selection changed:', value);
                          field.handleChange(value);
                        }}
                        disabled={fellowshipsLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a fellowship" />
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

                {/* Current Filter Summary */}
               
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