"use client";

import * as React from "react";
import { useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/libutils";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimePicker({ value, onChange, className, placeholder = "Select time" }: TimePickerProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

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

  const selectedTime = timeOptions.find(option => option.value === value);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}
    modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-white",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {selectedTime ? selectedTime.label : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="max-h-64 overflow-y-auto">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              className={cn(
                "w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors",
                option.value === value && "bg-blue-50 text-blue-600"
              )}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}