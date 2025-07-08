"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

export function DatePicker({
  value,
  onChange,
  className,
  captionLayout,
}: {
  value: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
  captionLayout?: "dropdown" | "buttons" | "dropdown-buttons" | undefined;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-white",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          className="w-[--radix-popover-trigger-width] sm:w-auto"
          captionLayout={captionLayout}
        />
      </PopoverContent>
    </Popover>
  );
}
