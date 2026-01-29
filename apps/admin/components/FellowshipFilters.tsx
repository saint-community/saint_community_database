'use client';

import { Button } from '@workspace/ui/components/button';
import { useForm } from '@workspace/ui/lib/react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useChurchesOption } from '@/hooks/churches';

interface FellowshipFiltersProps {
  church?: string;
  onChurchChange: (church: string | undefined) => void;
  onClear: () => void;
}

export function FellowshipFilters({ 
  church, 
  onChurchChange, 
  onClear 
}: FellowshipFiltersProps) {
  const { data: churches, isLoading } = useChurchesOption();

  const form = useForm({
    defaultValues: {
      church: church ? String(church) : 'all',
    },
  });

  // Update form when church prop changes
  useEffect(() => {
    const newValue = church ? String(church) : 'all';
    form.setFieldValue('church', newValue);
  }, [church, form]);

 
  const hasActiveFilters = church;

  return (
    <div className="flex items-center gap-4">
      <form.Field
        name="church"
        children={(field) => {
       
          return (
            <Select
              value={field.state.value}
              onValueChange={(value) => {
              
                field.handleChange(value);
                onChurchChange(value === 'all' ? undefined : value);
              }}
              disabled={isLoading}
            >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Church" />
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
          );
        }}
      />
      
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="flex items-center gap-1"
        >
          <X size={14} />
          Clear Filters
        </Button>
      )}
    </div>
  );
}