'use client';

import { Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimePicker({
  value,
  onChange,
  className,
  placeholder = 'Select time',
}: TimePickerProps) {
  // Generate time options (every 15 minutes)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
      timeOptions.push({ value: time24, label: time12 });
    }
  }

  const selectedTime = timeOptions.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <div className='flex items-center'>
          <Clock className='mr-2 h-4 w-4' />
          <SelectValue placeholder={placeholder}>
            {selectedTime ? selectedTime.label : placeholder}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className='max-h-64'>
        {timeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
