'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Mail,
  MapPin,
  Check,
  Copy,
  ExternalLink,
  Plus,
  X,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  Share2,
  Users,
  FileText,
} from 'lucide-react';
import { format, parseISO, addDays, isAfter } from 'date-fns';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { InterviewConfig, PipelineRound } from '../types';

const DAY_ABBRS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function generateTimeSlots(durationMinutes: number, startHour = 8, endHour = 23): string[] {
  const slots: string[] = [];
  let currentMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  const formatTime = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60) % 24;
    const mins = totalMins % 60;
    const modifier = hours >= 12 && hours < 24 ? 'pm' : 'am';
    let displayHours = hours % 12;
    if (displayHours === 0) displayHours = 12;
    return mins === 0
      ? `${displayHours}:00${modifier}`
      : `${displayHours}:${String(mins).padStart(2, '0')}${modifier}`;
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
  'Please do not modify the event title, timings, location, or host invitees when adding this to your Google Calendar.';

interface InterviewSchedulerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  round: PipelineRound | null;
  defaultRoleName?: string;
  /**
   * Organisation contact addresses. The org running the cycle is always an
   * invitee on candidate calendar invites, so it seeds the invitee list here.
   */
  defaultOrgEmails?: string[];
  onSave: (config: InterviewConfig, label?: string, description?: string) => void;
}

export function InterviewSchedulerDialog({
  open,
  onOpenChange,
  round,
  defaultRoleName = 'Role',
  defaultOrgEmails = [],
  onSave,
}: InterviewSchedulerDialogProps) {
  const existingConfig = round?.interviewConfig;

  // Normalised + referentially stable, so the hydrate effect below does not
  // re-run (and wipe in-progress edits) on every parent render.
  const orgEmails = useMemo(
    () =>
      Array.from(
        new Set(defaultOrgEmails.map((e) => e.trim().toLowerCase()).filter((e) => e.includes('@'))),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultOrgEmails.join(',')],
  );

  // Multi-step state: 1 = Details, 2 = Availability Grid, 3 = Review & Share
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Event Details
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [location, setLocation] = useState('Google Meet');
  const [invitees, setInvitees] = useState<string[]>([]);
  const [newInvitee, setNewInvitee] = useState('');

  // Step 2: Dates & Grid Selection
  const [dateMode, setDateMode] = useState<'dates' | 'days'>('dates');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 4), 'yyyy-MM-dd'));
  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
  );
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  // Slot settings
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');
  const gridRef = useRef<HTMLDivElement>(null);

  // Copy state
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  // Reset / Hydrate state when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      const cfg = round?.interviewConfig;
      setEventTitle(cfg?.eventTitle || round?.label || `${defaultRoleName} Interview`);
      setEventDescription(
        cfg?.eventDescription ||
          round?.description ||
          'Congratulations on advancing! Please select an interview time slot from the available options.',
      );
      setLocation(cfg?.location || 'Google Meet');
      // Org addresses are always present; saved panelists are merged in after.
      setInvitees(
        Array.from(
          new Set([
            ...orgEmails,
            ...(cfg?.invitees ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean),
          ]),
        ),
      );
      setDateMode(cfg?.dateMode || 'dates');
      setStartDate(cfg?.startDate || format(new Date(), 'yyyy-MM-dd'));
      setEndDate(cfg?.endDate || format(addDays(new Date(), 4), 'yyyy-MM-dd'));
      setSelectedDays(new Set(cfg?.selectedDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']));
      setSlotDuration(cfg?.slotDuration || 30);
      setSelectedSlots(new Set(cfg?.selectedSlots || []));
      setNewInvitee('');
    }
  }, [open, round, defaultRoleName, orgEmails]);

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
    return generateTimeSlots(slotDuration, 8, 23);
  }, [slotDuration]);

  // Handle Drag Selection
  const handleDragStart = (dateStr: string, timeSlotStr: string) => {
    const key = `${dateStr}-${timeSlotStr}`;
    const willAdd = !selectedSlots.has(key);
    setDragMode(willAdd ? 'add' : 'remove');
    setIsDragging(true);

    const next = new Set(selectedSlots);
    if (willAdd) next.add(key);
    else next.delete(key);
    setSelectedSlots(next);
  };

  const handleDragEnter = (dateStr: string, timeSlotStr: string) => {
    if (!isDragging) return;
    const key = `${dateStr}-${timeSlotStr}`;
    const next = new Set(selectedSlots);
    if (dragMode === 'add') next.add(key);
    else next.delete(key);
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

  // Step Navigation
  const goToStep2 = () => {
    if (!eventTitle.trim()) {
      toast.error('Please enter an event title');
      return;
    }
    setCurrentStep(2);
  };

  const goToStep3 = () => {
    if (selectedSlots.size === 0) {
      toast.error('Please select at least one available time slot on the grid');
      return;
    }
    setCurrentStep(3);
  };

  // Save Final Configuration
  const handleConfirmSave = () => {
    if (!eventTitle.trim()) {
      toast.error('Please enter an event title');
      setCurrentStep(1);
      return;
    }

    if (selectedSlots.size === 0) {
      toast.error('Please select at least one available time slot on the grid');
      setCurrentStep(2);
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
      slotMode: 'custom',
      slotDuration,
      selectedSlots: Array.from(selectedSlots),
      disclaimer: DEFAULT_DISCLAIMER,
      bookings: existingConfig?.bookings || [],
    };

    onSave(config, eventTitle.trim(), eventDescription.trim());
    toast.success('Interview schedule updated successfully');
    onOpenChange(false);
  };

  // Shareable Link
  const roundId = round?.id || 'preview';
  const shareableUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/platform/inductions/interviews/${roundId}`
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

  const totalHours = Math.round(((selectedSlots.size * slotDuration) / 60) * 10) / 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Header with Step Indicator */}
        <div className="px-6 py-4 border-b border-border bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold !text-left">
                  Interview Scheduling Setup
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground !text-left">
                  {currentStep === 1 && 'Step 1 of 3: Event details & panelist emails'}
                  {currentStep === 2 && 'Step 2 of 3: Dates & availability timetable grid'}
                  {currentStep === 3 && 'Step 3 of 3: Review summary & candidate booking link'}
                </DialogDescription>
              </div>
            </div>

            {/* Stepper Navigation Pills */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/70 text-xs">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  currentStep === 1
                    ? 'bg-background text-foreground shadow-sm border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
                Details
              </button>

              <div className="w-2 h-px bg-border" />

              <button
                type="button"
                onClick={() => {
                  if (eventTitle.trim()) setCurrentStep(2);
                  else toast.error('Please enter an event title first');
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  currentStep === 2
                    ? 'bg-background text-foreground shadow-sm border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] flex items-center justify-center font-bold">
                  2
                </span>
                Grid
                {selectedSlots.size > 0 && (
                  <Badge variant="secondary" className="h-3.5 px-1 text-[9px] font-bold">
                    {selectedSlots.size}
                  </Badge>
                )}
              </button>

              <div className="w-2 h-px bg-border" />

              <button
                type="button"
                onClick={() => {
                  if (!eventTitle.trim()) {
                    toast.error('Please enter an event title first');
                    return;
                  }
                  if (selectedSlots.size === 0) {
                    toast.error('Please select time slots on the grid');
                    return;
                  }
                  setCurrentStep(3);
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  currentStep === 3
                    ? 'bg-background text-foreground shadow-sm border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
                Review
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Step Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar [scrollbar-gutter:stable]">
          {/* ========================================================================= */}
          {/* STEP 1: Event Details & Invitees                                          */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="event-title" className="text-xs font-semibold">
                  Event Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="event-title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Core Team Technical Interview"
                  className="text-sm font-medium"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">
                  The calendar event title seen by candidates and panel hosts.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-loc" className="text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Location / Meeting Link
                </Label>
                <Input
                  id="event-loc"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Google Meet or Room 204"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-desc" className="text-xs font-semibold">
                  Description & Candidate Instructions
                </Label>
                <Textarea
                  id="event-desc"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Tell candidates what to prepare, how long the interview is, or what to bring..."
                  rows={3}
                  className="text-xs leading-relaxed"
                />
              </div>

              {/* Host & Panelist Emails */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
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
                  <Button type="button" size="sm" onClick={handleAddInvitee} className="shrink-0 gap-1 font-medium">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>

                <div className="min-h-[48px] p-2.5 rounded-xl border border-border bg-muted/20 flex flex-wrap gap-1.5 items-center">
                  {invitees.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">
                      No additional panelist emails added. Only the booking candidate will be invited.
                    </span>
                  ) : (
                    invitees.map((email, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 px-2.5 py-0.5 text-xs bg-background border border-border">
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveInvitee(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                          aria-label={`Remove ${email}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  These emails will automatically be invited to the calendar event when candidates schedule a slot.
                  Your organisation is always invited, even if removed from this list.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Date Range, Slot Duration & When2Meet Grid                        */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              {/* Controls bar: Dates & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-3.5 rounded-xl border border-border bg-muted/20">
                {/* Date mode & selection */}
                <div className="md:col-span-7 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Schedule Mode & Dates</Label>
                    <div className="flex gap-1 bg-background p-0.5 rounded-lg border border-border text-[11px]">
                      <button
                        type="button"
                        onClick={() => setDateMode('dates')}
                        className={`px-2 py-0.5 rounded font-medium transition-all ${
                          dateMode === 'dates' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Specific Dates
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateMode('days')}
                        className={`px-2 py-0.5 rounded font-medium transition-all ${
                          dateMode === 'days' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Days of Week
                      </button>
                    </div>
                  </div>

                  {dateMode === 'dates' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between font-normal text-xs h-8 bg-background">
                            <span>{startDate ? format(parseISO(startDate), 'dd MMM yyyy') : 'Start date'}</span>
                            <CalendarIcon className="h-3.5 w-3.5 opacity-60 ml-1" />
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
                          <Button variant="outline" className="w-full justify-between font-normal text-xs h-8 bg-background">
                            <span>{endDate ? format(parseISO(endDate), 'dd MMM yyyy') : 'End date'}</span>
                            <CalendarIcon className="h-3.5 w-3.5 opacity-60 ml-1" />
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
                  ) : (
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
                  )}
                </div>

                {/* Duration */}
                <div className="md:col-span-5 space-y-1.5">
                  <Label className="text-xs font-semibold">Slot Duration</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[15, 30, 45, 60].map((dur) => (
                      <Button
                        key={dur}
                        type="button"
                        size="sm"
                        variant={slotDuration === dur ? 'default' : 'outline'}
                        className="text-xs h-8 bg-background"
                        onClick={() => setSlotDuration(dur)}
                      >
                        {dur}m
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* When2Meet Grid */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-bold">Select Available Slots</Label>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 text-xs">
                      {selectedSlots.size} slots ({totalHours} hrs)
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button type="button" size="sm" variant="outline" className="h-7 text-xs px-2" onClick={selectAll}>
                      All
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

                {/* Grid Table */}
                <div
                  ref={gridRef}
                  className="rounded-xl border border-border bg-card overflow-hidden select-none"
                >
                  {dateColumns.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      Please select a valid date range or active days of week to display the timetable grid.
                    </div>
                  ) : (
                    <div className="max-h-[360px] overflow-y-auto overflow-x-auto custom-scrollbar [scrollbar-gutter:stable]">
                      <table className="border-separate min-w-full text-xs" style={{ borderSpacing: '3px' }}>
                        <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur">
                          <tr>
                            <th className="p-2 w-24 text-left font-semibold text-muted-foreground border border-border/80 rounded-md bg-muted">
                              Time
                            </th>
                            {dateColumns.map((col) => (
                              <th
                                key={col}
                                className="p-1.5 min-w-[84px] text-center font-semibold border border-border/80 rounded-md bg-muted"
                              >
                                {dateMode === 'days' ? (
                                  <span className="text-xs font-bold">{col}</span>
                                ) : (
                                  <div>
                                    <div className="text-[10px] text-muted-foreground">
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
                              <td className="p-1 font-medium text-[10px] text-muted-foreground bg-muted/50 sticky left-0 z-10 border border-border/60 rounded-md whitespace-nowrap">
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
                                    onMouseEnter={() => handleDragEnter(colDate, timeSlot)}
                                    className={`p-1 text-center cursor-pointer rounded-md transition-all border ${
                                      isSelected
                                        ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-sm'
                                        : 'bg-background hover:bg-primary/10 border-border/60 text-transparent hover:text-muted-foreground'
                                    }`}
                                    title={`${colDate} @ ${timeSlot}`}
                                  >
                                    <div className="h-4 flex items-center justify-center text-[9px]">
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
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Review & Copy Booking Link                                        */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
              {/* Summary Card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground !text-left">{eventTitle}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {location || 'Google Meet'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold border-primary/30 text-primary">
                    {selectedSlots.size} slots ({totalHours} hrs)
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <p className="font-semibold text-muted-foreground flex items-center gap-1.5">
                      <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                      Schedule Window
                    </p>
                    <p className="font-medium text-foreground">
                      {dateMode === 'dates'
                        ? `${format(parseISO(startDate), 'dd MMM yyyy')} – ${format(parseISO(endDate), 'dd MMM yyyy')}`
                        : `Every ${Array.from(selectedDays).join(', ')}`}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {slotDuration} mins per interview slot
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <p className="font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      Host Invitees ({invitees.length})
                    </p>
                    <p className="font-medium text-foreground truncate">
                      {invitees.length === 0 ? 'None set (only candidate)' : invitees.join(', ')}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Will be auto-invited on Google Calendar
                    </p>
                  </div>
                </div>

                {eventDescription && (
                  <div className="text-xs p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1">
                    <p className="font-semibold text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Instructions Preview
                    </p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">
                      {eventDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Shareable Booking Link Box */}
              <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5 text-primary" />
                    Candidate Booking Link
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs px-2 text-primary hover:text-primary hover:bg-primary/10 gap-1 font-medium"
                    onClick={() => window.open(shareableUrl, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Live Preview
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={shareableUrl}
                    className="text-xs bg-background select-all font-mono"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCopyShareableLink}
                    className="shrink-0 gap-1.5 font-medium"
                  >
                    {isCopiedLink ? <Check className="h-3.5 w-3.5 text-green" /> : <Copy className="h-3.5 w-3.5" />}
                    {isCopiedLink ? 'Copied' : 'Copy Link'}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Candidates who advance to this round can click this link to pick their slot directly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Step-aware Actions */}
        <div className="px-6 py-3.5 border-t border-border bg-card flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((prev) => (prev === 3 ? 2 : 1))}
                className="gap-1.5 text-xs font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs text-muted-foreground"
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep === 1 && (
              <Button
                type="button"
                size="sm"
                onClick={goToStep2}
                className="gap-1.5 font-medium text-xs"
              >
                Next: Availability Grid
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                type="button"
                size="sm"
                onClick={goToStep3}
                className="gap-1.5 font-medium text-xs"
              >
                Next: Review &amp; Share
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmSave}
                className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                Save Schedule Settings
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
