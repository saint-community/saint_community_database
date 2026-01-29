'use client';

import { useEffect, useState } from 'react';
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

interface ChurchFiltersProps {
  country?: string;
  onCountryChange: (country: string | undefined) => void;
  onClear: () => void;
}

export function ChurchFilters({ 
  country, 
  onCountryChange, 
  onClear 
}: ChurchFiltersProps) {
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    import('@/utils/countries.json').then((mod) => {
      setCountries(mod.default || mod);
    });
  }, []);

  const form = useForm({
    defaultValues: {
      country: country || 'all',
    },
  });

  // Update form when country prop changes
  useEffect(() => {
    form.setFieldValue('country', country || 'all');
  }, [country, form]);

  const hasActiveFilters = country;

  return (
    <div className="flex items-center gap-4">
      <form.Field
        name="country"
        children={(field) => (
          <Select
            value={field.state.value}
            onValueChange={(value) => {
              field.handleChange(value);
              onCountryChange(value === 'all' ? undefined : value);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((countryOption) => (
                <SelectItem key={countryOption.code} value={countryOption.name}>
                  {countryOption.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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