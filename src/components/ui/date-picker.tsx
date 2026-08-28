'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DatePickerProps {
  date?: Date | null;
  value?: string | Date | null;
  onChange?: (date: Date | undefined, dateString: string) => void;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  id?: string;
}

export function DatePicker({
  date,
  value,
  onChange,
  onSelect,
  placeholder = 'Pick a date',
  className,
  disabled = false,
  clearable = true,
  minDate,
  maxDate,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Normalize selected date from date prop or value string
  const selectedDate = React.useMemo(() => {
    if (date instanceof Date) return date;
    if (value instanceof Date) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return undefined;
  }, [date, value]);

  const handleSelect = (selected: Date | undefined) => {
    if (selected) {
      const year = selected.getFullYear();
      const month = String(selected.getMonth() + 1).padStart(2, '0');
      const day = String(selected.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      onChange?.(selected, dateStr);
      onSelect?.(selected);
    } else {
      onChange?.(undefined, '');
      onSelect?.(undefined);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined, '');
    onSelect?.(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-between text-left font-normal h-9 px-3 text-xs sm:text-sm rounded-xl border-border/80 hover:bg-muted/50 transition-colors',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 text-primary shrink-0 opacity-80" />
            <span className="truncate">
              {selectedDate ? format(selectedDate, 'PPP') : placeholder}
            </span>
          </span>
          {clearable && selectedDate && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClear(e as any);
              }}
              className="p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer ml-1"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl shadow-lg border-border" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          disabled={(d) => {
            if (minDate && d < minDate) return true;
            if (maxDate && d > maxDate) return true;
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
