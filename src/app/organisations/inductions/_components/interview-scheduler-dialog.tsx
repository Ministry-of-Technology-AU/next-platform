'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  AlertTriangle,
  Mail,
  MapPin,
  Check,
  Copy,
  ExternalLink,
  Plus,
  X,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';
import { format, parseISO, addDays, isBefore, isAfter, startOfDay } from 'date-fns';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { InterviewConfig, PipelineRound } from '../types';

const ALL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const DAY_ABBRS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const ASHOKA_INTERVIEW_SLOTS = [
  '8:30am-10:00am',
  '10:10am-11:40am',
  '11:50am-1:20pm',
  '1:30pm-2:30pm',
  '2:30pm-3:00pm',
  '3:00pm-4:30pm',
  '4:40pm-6:10pm',
  '6:20pm-7:50pm',
  '8:00pm-9:00pm',
  '9:00pm-10:00pm',
  '10:00pm-11:00pm',
  '11:00pm-12:00am',
] as const;

function generateTimeSlots(durationMinutes: number, startHour = 8, endHour = 23): string[] {
  const slots: string[] = [];
  let currentMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  const formatTime = (totalMins: number) => {
    let hours = Math.floor(totalMins / 60) % 24;
    const mins = totalMins % 60;
    const modifier = hours >= 12 && hours < 24 ? 'pm' : 'am';
    let displayHours = hours % 12;
    if (displayHours === 0) displayHours = 12;
    return mins === 0 ? `${displayHours}:00${modifier}` : `${displayHours}:${String(mins).padStart(2, '0')}${modifier}`;
  };

  while (currentMinutes + durationMinutes <= endMinutes) {
    const startStr = formatTime(currentMinutes);
    const endStr = formatTime(currentMinutes + durationMinutes);
    slots.push(`${startStr}-${endStr}`);
    currentMinutes += durationMinutes;
  }

  return slots;
}

const DEFAULT_DISCLAIMER =
  'Please do not modify the event title, timings, location, or host invitees when adding this to your Google Calendar. Tampering with event details may result in your slot not being recognized and could compromise your application process.';

interface InterviewSchedulerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  round: PipelineRound | null;
  defaultRoleName?: string;
  defaultOrgEmail?: string;
  onSave: (config: InterviewConfig, label?: string, description?: string) => void;
}

export function InterviewSchedulerDialog({
  open,
  onOpenChange,
  round,
  defaultRoleName = 'Role',
  defaultOrgEmail,
  onSave,
}: InterviewSchedulerDialogProps) {
  const existingConfig = round?.interviewConfig;

  // Basic Details
  const [eventTitle, setEventTitle] = useState(
    existingConfig?.eventTitle || round?.label || `${defaultRoleName} Interview`,
  );
  const [eventDescription, setEventDescription] = useState(
    existingConfig?.eventDescription ||
      round?.description ||
      'Congratulations on advancing! Please select an interview time slot from the available options. Make sure to be on time.',
  );
  const [location, setLocation] = useState(existingConfig?.location || 'Google Meet');
  const [invitees, setInvitees] = useState<string[]>(
    existingConfig?.invitees || (defaultOrgEmail ? [defaultOrgEmail] : []),
  );
  const [newInvitee, setNewInvitee] = useState('');

  // Mode & Dates
  const [dateMode, setDateMode] = useState<'dates' | 'days'>(existingConfig?.dateMode || 'dates');
  const [startDate, setStartDate] = useState(
    existingConfig?.startDate || format(new Date(), 'yyyy-MM-dd'),
  );
  const [endDate, setEndDate] = useState(
    existingConfig?.endDate || format(addDays(new Date(), 4), 'yyyy-MM-dd'),
  );
  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    new Set(existingConfig?.selectedDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
  );

  // Popover state
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  // Slot settings
  const [slotMode, setSlotMode] = useState<'default' | 'ashoka' | 'custom'>(
    existingConfig?.slotMode || 'custom',
  );
  const [slotDuration, setSlotDuration] = useState<number>(existingConfig?.slotDuration || 30);

  // Selected Slots
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(
    new Set(existingConfig?.selectedSlots || []),
  );

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Disclaimer
  const [disclaimer, setDisclaimer] = useState(existingConfig?.disclaimer || DEFAULT_DISCLAIMER);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      const cfg = round?.interviewConfig;
      setEventTitle(cfg?.eventTitle || round?.label || `${defaultRoleName} Interview`);
      setEventDescription(
        cfg?.eventDescription ||
          round?.description ||
          'Congratulations on advancing! Please select an interview time slot from the available options. Make sure to be on time.',
      );
      setLocation(cfg?.location || 'Google Meet');
      setInvitees(
        cfg?.invitees && cfg.invitees.length > 0
          ? cfg.invitees
          : defaultOrgEmail
          ? [defaultOrgEmail]
          : [],
      );
      setDateMode(cfg?.dateMode || 'dates');
      setStartDate(cfg?.startDate || format(new Date(), 'yyyy-MM-dd'));
      setEndDate(cfg?.endDate || format(addDays(new Date(), 4), 'yyyy-MM-dd'));
      setSelectedDays(new Set(cfg?.selectedDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']));
      setSlotMode(cfg?.slotMode || 'custom');
      setSlotDuration(cfg?.slotDuration || 30);
      setSelectedSlots(new Set(cfg?.selectedSlots || []));
      setDisclaimer(cfg?.disclaimer || DEFAULT_DISCLAIMER);
    }
  }, [open, round, defaultRoleName, defaultOrgEmail]);

  // Compute Columns
  const dateColumns = useMemo(() => {
    if (dateMode === 'days') {
      return DAY_ABBRS.filter((abbr) => selectedDays.has(abbr));
    }
    if (!startDate || !endDate) return [];
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      if (isAfter(start, end)) return [];
      const cols: string[] = [];
      let current = start;
      while (!isAfter(current, end)) {
        cols.push(format(current, 'yyyy-MM-dd'));
        current = addDays(current, 1);
        if (cols.length > 30) break; // cap at 30 days max
      }
      return cols;
    } catch {
      return [];
    }
  }, [dateMode, selectedDays, startDate, endDate]);

  // Compute Time Slots
  const timeSlots = useMemo(() => {
    if (slotMode === 'ashoka') {
      return [...ASHOKA_INTERVIEW_SLOTS];
    }
    return generateTimeSlots(slotDuration, 8, 23);
  }, [slotMode, slotDuration]);

  // Handle Drag Selection
  const handleDragStart = (dateStr: string, timeSlotStr: string) => {
    const key = `${dateStr}-${timeSlotStr}`;
    const willAdd = !selectedSlots.has(key);
    setDragMode(willAdd ? 'add' : 'remove');
    setIsDragging(true);

    const next = new Set(selectedSlots);
    if (willAdd) {
      next.add(key);
    } else {
      next.delete(key);
    }
    setSelectedSlots(next);
  };

  const handleDragEnter = (dateStr: string, timeSlotStr: string) => {
    if (!isDragging) return;
    const key = `${dateStr}-${timeSlotStr}`;
    const next = new Set(selectedSlots);
    if (dragMode === 'add') {
      next.add(key);
    } else {
      next.delete(key);
    }
    setSelectedSlots(next);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Quick Select Tools
  const selectAll = () => {
    const next = new Set<string>();
    dateColumns.forEach((d) => {
      timeSlots.forEach((t) => {
        next.add(`${d}-${t}`);
      });
    });
    setSelectedSlots(next);
  };

  const selectMorning = () => {
    const next = new Set(selectedSlots);
    dateColumns.forEach((d) => {
      timeSlots.forEach((t) => {
        if (t.includes('am') || t.startsWith('12:')) {
          next.add(`${d}-${t}`);
        }
      });
    });
    setSelectedSlots(next);
  };

  const selectEvening = () => {
    const next = new Set(selectedSlots);
    dateColumns.forEach((d) => {
      timeSlots.forEach((t) => {
        if (t.includes('pm') && !t.startsWith('12:')) {
          next.add(`${d}-${t}`);
        }
      });
    });
    setSelectedSlots(next);
  };

  const clearSelection = () => {
    setSelectedSlots(new Set());
  };

  // Add/Remove Invitee
  const handleAddInvitee = () => {
    const email = newInvitee.trim().toLowerCase();
    if (!email) return;
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (invitees.includes(email)) {
      toast.info('Email already added');
      return;
    }
    setInvitees([...invitees, email]);
    setNewInvitee('');
  };

  const handleRemoveInvitee = (indexToRemove: number) => {
    setInvitees(invitees.filter((_, i) => i !== indexToRemove));
  };

  // Save
  const handleConfirmSave = () => {
    if (!eventTitle.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    if (selectedSlots.size === 0) {
      toast.error('Please select at least one available time slot on the grid');
      return;
    }

    const config: InterviewConfig = {
      eventTitle: eventTitle.trim(),
      eventDescription: eventDescription.trim(),
      location: location.trim() || undefined,
      invitees,
      dateMode,
      startDate: dateMode === 'dates' ? startDate : null,
      endDate: dateMode === 'dates' ? endDate : null,
      selectedDays: dateMode === 'days' ? Array.from(selectedDays) : undefined,
      slotMode,
      slotDuration,
      selectedSlots: Array.from(selectedSlots),
      disclaimer: disclaimer.trim() || DEFAULT_DISCLAIMER,
      bookings: existingConfig?.bookings || [],
    };

    onSave(config, eventTitle.trim(), eventDescription.trim());
    toast.success('Interview schedule updated');
    onOpenChange(false);
  };

  // Booking Link
  const shareableUrl =
    round?.id && typeof window !== 'undefined'
      ? `${window.location.origin}/platform/inductions/interviews/${round.id}`
      : '';

  const handleCopyShareableLink = async () => {
    if (!shareableUrl) return;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2000);
      toast.success('Candidate booking link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary-extradark dark:text-secondary flex items-center justify-center border border-secondary/30">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  Interview Scheduling Setup
                  <Badge variant="outline" className="text-xs font-normal border-primary/30 text-primary">
                    When2Meet Grid
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Configure fixed appointment slots for candidate bookings and Google Calendar invites.
                </DialogDescription>
              </div>
            </div>

            {shareableUrl && (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={handleCopyShareableLink}
                >
                  {isCopiedLink ? <Check className="h-3.5 w-3.5 text-green" /> : <Copy className="h-3.5 w-3.5" />}
                  {isCopiedLink ? 'Copied' : 'Copy Booking Link'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => window.open(shareableUrl, '_blank')}
                  title="Preview booking page"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Top Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Event Details */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-title" className="text-sm font-semibold">
                  Event Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="event-title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Core Team Interview - Round 2"
                />
                <p className="text-[11px] text-muted-foreground">
                  This will be the title of the calendar event created by students.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-desc" className="text-sm font-semibold">
                  Event Description & Instructions
                </Label>
                <Textarea
                  id="event-desc"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Include interview format, what candidates should prepare, Google Meet / room details..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-loc" className="text-sm font-semibold flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Location / Venue
                  </Label>
                  <Input
                    id="event-loc"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Google Meet or Room 204"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Schedule By</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={dateMode === 'dates' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setDateMode('dates')}
                    >
                      Dates
                    </Button>
                    <Button
                      type="button"
                      variant={dateMode === 'days' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setDateMode('days')}
                    >
                      Days of Week
                    </Button>
                  </div>
                </div>
              </div>

              {/* Host & Panelist Invitees */}
              <div className="space-y-2 pt-1">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  Organiser & Panelist Emails (Invitees)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newInvitee}
                    onChange={(e) => setNewInvitee(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInvitee();
                      }
                    }}
                    placeholder="e.g. panelist@ashoka.edu.in"
                    className="text-sm"
                  />
                  <Button type="button" size="sm" onClick={handleAddInvitee} className="shrink-0 gap-1">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {invitees.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">
                      No host invitees added yet. Add an email to be invited to the calendar event.
                    </span>
                  ) : (
                    invitees.map((email, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveInvitee(idx)}
                          className="hover:text-destructive transition-colors ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  These emails will automatically be invited (`add=`) when candidates add the booking to Google Calendar.
                </p>
              </div>
            </div>

            {/* Right Col: Range & Duration */}
            <div className="lg:col-span-6 space-y-4 bg-muted/30 p-4 rounded-xl border border-border flex flex-col justify-between">
              <div className="space-y-4">
                {dateMode === 'dates' ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between font-normal text-xs h-9">
                            {startDate ? format(parseISO(startDate), 'dd/MM/yyyy') : 'Start date'}
                            <CalendarIcon className="h-3.5 w-3.5 opacity-60" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate ? parseISO(startDate) : undefined}
                            onSelect={(date) => {
                              if (date) setStartDate(format(date, 'yyyy-MM-dd'));
                              setStartDatePickerOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between font-normal text-xs h-9">
                            {endDate ? format(parseISO(endDate), 'dd/MM/yyyy') : 'End date'}
                            <CalendarIcon className="h-3.5 w-3.5 opacity-60" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate ? parseISO(endDate) : undefined}
                            fromDate={startDate ? parseISO(startDate) : undefined}
                            onSelect={(date) => {
                              if (date) setEndDate(format(date, 'yyyy-MM-dd'));
                              setEndDatePickerOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Active Days of Week</Label>
                    <div className="flex gap-1">
                      {DAY_ABBRS.map((day) => {
                        const active = selectedDays.has(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const next = new Set(selectedDays);
                              if (active) {
                                if (next.size > 1) next.delete(day);
                              } else {
                                next.add(day);
                              }
                              setSelectedDays(next);
                            }}
                            className={`flex-1 h-8 rounded-lg text-xs font-semibold border transition-all ${
                              active
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-background text-muted-foreground border-border hover:bg-muted'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Slot Duration */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Interview Slot Duration</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[15, 30, 45, 60].map((dur) => (
                      <Button
                        key={dur}
                        type="button"
                        size="sm"
                        variant={slotMode === 'custom' && slotDuration === dur ? 'default' : 'outline'}
                        className="text-xs h-8"
                        onClick={() => {
                          setSlotMode('custom');
                          setSlotDuration(dur);
                        }}
                      >
                        {dur} mins
                      </Button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={slotMode === 'ashoka' ? 'default' : 'outline'}
                    className="w-full text-xs h-8 mt-1 gap-1.5"
                    onClick={() => setSlotMode('ashoka')}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-secondary" />
                    Use Ashoka Standard Slots
                  </Button>
                </div>
              </div>

              {/* Anti-Tamper Notice Preview */}
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-3 text-xs space-y-1 mt-3">
                <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Anti-Tamper Candidate Notice
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Candidates will see a strict disclaimer warning them not to change event details, titles, timings, or host invitees on Google Calendar so their induction application is not invalidated.
                </p>
              </div>
            </div>
          </div>

          {/* When2Meet Grid Section */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <Label className="text-base font-bold flex items-center gap-2">
                  Select Available Interview Slots
                  <Badge variant="secondary" className="font-semibold bg-primary/10 text-primary border border-primary/20">
                    {selectedSlots.size} slots selected ({Math.round(((selectedSlots.size * slotDuration) / 60) * 10) / 10} hrs)
                  </Badge>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Click and drag across the grid to select time blocks when your team is available for interviews.
                </p>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs px-2" onClick={selectAll}>
                  Select All
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs px-2" onClick={selectMorning}>
                  Mornings
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs px-2" onClick={selectEvening}>
                  Afternoons/Eve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
                  onClick={clearSelection}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Timetable Grid Container */}
            <div
              ref={gridRef}
              className="rounded-xl border border-border bg-card overflow-hidden select-none"
            >
              {dateColumns.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Please select a valid date range or active days of week to display the timetable grid.
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto overflow-x-auto force-scrollbar">
                  <table className="border-separate min-w-full text-xs" style={{ borderSpacing: '3px' }}>
                    <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur">
                      <tr>
                        <th className="p-2 w-28 text-left font-semibold text-muted-foreground border border-border/80 rounded-md bg-muted">
                          Time
                        </th>
                        {dateColumns.map((col) => (
                          <th
                            key={col}
                            className="p-2 min-w-[90px] text-center font-semibold border border-border/80 rounded-md bg-muted"
                          >
                            {dateMode === 'days' ? (
                              <span>{col}</span>
                            ) : (
                              <div>
                                <div className="text-[11px] text-muted-foreground">
                                  {format(parseISO(col), 'EEE')}
                                </div>
                                <div className="text-xs font-bold text-foreground">
                                  {format(parseISO(col), 'dd MMM')}
                                </div>
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((timeSlot) => (
                        <tr key={timeSlot}>
                          <td className="p-1.5 font-medium text-[11px] text-muted-foreground bg-muted/50 sticky left-0 z-10 border border-border/60 rounded-md whitespace-nowrap">
                            {timeSlot}
                          </td>
                          {dateColumns.map((colDate) => {
                            const cellKey = `${colDate}-${timeSlot}`;
                            const isSelected = selectedSlots.has(cellKey);

                            return (
                              <td
                                key={cellKey}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleDragStart(colDate, timeSlot);
                                }}
                                onMouseEnter={() => {
                                  setHoveredCell(cellKey);
                                  handleDragEnter(colDate, timeSlot);
                                }}
                                onMouseLeave={() => setHoveredCell(null)}
                                className={`p-1 text-center cursor-pointer rounded-md transition-all border ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-sm scale-[0.98]'
                                    : 'bg-background hover:bg-primary/10 border-border/60 text-transparent hover:text-muted-foreground'
                                }`}
                                title={`${colDate} @ ${timeSlot}`}
                              >
                                <div className="h-5 flex items-center justify-center text-[10px]">
                                  {isSelected ? 'Available' : '+'}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="h-4 w-4 text-primary" />
            <span>Students will only be able to book from highlighted available slots.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} className="gap-1.5 font-semibold">
              <Check className="h-4 w-4" />
              Save Schedule Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
