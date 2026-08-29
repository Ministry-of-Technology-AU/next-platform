'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Mail,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
  User,
  Building2,
  Loader2,
  Share2,
} from 'lucide-react';
import { format, parseISO, addDays, isAfter } from 'date-fns';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { TourStep } from '@/components/guided-tour';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { PopulatedPipelineRound } from '@/lib/inductions/strapi-inductions';
import type { InterviewBooking } from '@/app/organisations/inductions/types';

interface InterviewBookingClientProps {
  round: PopulatedPipelineRound;
  currentUser: {
    email: string;
    name?: string | null;
  } | null;
}

export function InterviewBookingClient({ round, currentUser }: InterviewBookingClientProps) {
  const config = round.interviewConfig || {
    eventTitle: round.label,
    eventDescription: round.description || '',
    location: 'Google Meet',
    invitees: [],
    dateMode: 'dates',
    slotMode: 'default',
    slotDuration: 30,
    selectedSlots: [],
    disclaimer:
      'Please do not modify the event title, timings, location, or host invitees when adding this to your Google Calendar. Altering event details may invalidate your interview slot and compromise your application process.',
    bookings: [],
  };

  const org = round.organisation;
  const role = round.role;
  const cycle = round.cycle;

  // Selected Date Tab
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Selected Slot to Book
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);

  // Candidate Details Form
  const [candidateName, setCandidateName] = useState(currentUser?.name || '');
  const [candidateEmail, setCandidateEmail] = useState(currentUser?.email || '');

  // Booking states
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSuccess, setBookedSuccess] = useState<InterviewBooking | null>(null);
  const [generatedGcalUrl, setGeneratedGcalUrl] = useState<string | null>(null);
  const [isCopiedGcal, setIsCopiedGcal] = useState(false);

  /**
   * Everyone invited to the generated calendar event alongside the candidate.
   * The organisation that owns this cycle is always first — panelists the org
   * added in the scheduler follow, de-duped case-insensitively.
   */
  const orgInvitees = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    const add = (raw: string | null | undefined) => {
      const email = raw?.trim().toLowerCase();
      if (!email || !email.includes('@') || seen.has(email)) return;
      seen.add(email);
      list.push(email);
    };

    for (const email of org?.emails ?? []) add(email);
    add(org?.email);
    for (const email of config.invitees ?? []) add(email);

    return list;
  }, [org?.emails, org?.email, config.invitees]);

  const [liveBookings, setLiveBookings] = useState<InterviewBooking[]>(config.bookings || []);

  const refreshSlots = async () => {
    try {
      const res = await fetch(`/api/platform/inductions/interviews/${round.id}`, { cache: 'no-store' });
      const json = await res.json();
      if (json?.success && json.data?.interviewConfig?.bookings) {
        setLiveBookings(json.data.interviewConfig.bookings);
      }
    } catch {
      // silent fallback
    }
  };

  // Existing Bookings
  const existingBookings = useMemo(() => {
    return liveBookings;
  }, [liveBookings]);

  // Booked Slot Keys set
  const bookedSlotKeys = useMemo(() => {
    return new Set(existingBookings.map((b) => b.slotKey));
  }, [existingBookings]);

  // Check if current user already has a booking
  const userExistingBooking = useMemo(() => {
    if (!currentUser?.email) return null;
    return existingBookings.find(
      (b) => b.candidateEmail.toLowerCase() === currentUser.email.toLowerCase(),
    );
  }, [existingBookings, currentUser]);

  // Process configured available slots
  // selectedSlots are in format: "YYYY-MM-DD-startTime-endTime" or "Mon-startTime-endTime"
  const parsedSlots = useMemo(() => {
    const rawSlots = config.selectedSlots || [];
    const dateMap: Record<
      string,
      Array<{
        slotKey: string;
        dateStr: string;
        startTime: string;
        endTime: string;
        timeRange: string;
        isBooked: boolean;
      }>
    > = {};

    rawSlots.forEach((cellKey) => {
      let datePart = '';
      let timePart = '';

      if (config.dateMode === 'days') {
        // e.g. "Mon-10:00am-10:30am"
        const firstDash = cellKey.indexOf('-');
        datePart = cellKey.substring(0, firstDash);
        timePart = cellKey.substring(firstDash + 1);
      } else {
        // e.g. "2026-08-25-10:00am-10:30am"
        datePart = cellKey.substring(0, 10);
        timePart = cellKey.substring(11);
      }

      const lastDash = timePart.lastIndexOf('-');
      const startTime = timePart.substring(0, lastDash);
      const endTime = timePart.substring(lastDash + 1);

      if (!dateMap[datePart]) {
        dateMap[datePart] = [];
      }

      dateMap[datePart].push({
        slotKey: cellKey,
        dateStr: datePart,
        startTime,
        endTime,
        timeRange: timePart,
        isBooked: bookedSlotKeys.has(cellKey),
      });
    });

    // Sort slots by time
    Object.keys(dateMap).forEach((d) => {
      dateMap[d].sort((a, b) => {
        const parseTimeMins = (t: string) => {
          const mod = t.slice(-2).toLowerCase();
          const [h, m] = t.slice(0, -2).split(':').map(Number);
          let hours = h % 12;
          if (mod === 'pm') hours += 12;
          return hours * 60 + (m || 0);
        };
        return parseTimeMins(a.startTime) - parseTimeMins(b.startTime);
      });
    });

    return dateMap;
  }, [config.selectedSlots, config.dateMode, bookedSlotKeys]);

  const availableDates = useMemo(() => {
    return Object.keys(parsedSlots);
  }, [parsedSlots]);

  // Set default selected date
  React.useEffect(() => {
    if (availableDates.length > 0 && (!selectedDate || !parsedSlots[selectedDate])) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate, parsedSlots]);

  // Slots for the active date tab
  const activeSlots = useMemo(() => {
    return parsedSlots[selectedDate] || [];
  }, [parsedSlots, selectedDate]);

  // Group slots into Morning, Afternoon, Evening
  const groupedSlots = useMemo(() => {
    const morning: typeof activeSlots = [];
    const afternoon: typeof activeSlots = [];
    const evening: typeof activeSlots = [];

    activeSlots.forEach((slot) => {
      const isPm = slot.startTime.toLowerCase().includes('pm');
      const [hourStr] = slot.startTime.split(':');
      const hour = parseInt(hourStr, 10);

      if (!isPm || (hour === 12 && isPm)) {
        if (hour === 12) {
          afternoon.push(slot);
        } else {
          morning.push(slot);
        }
      } else if (hour < 5) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [activeSlots]);

  // Helper to generate Google Calendar Event URL
  const buildGoogleCalendarUrl = (slotDate: string, timeRange: string) => {
    const [startRaw, endRaw] = timeRange.split('-');

    const parseTimeParts = (timeStr: string) => {
      const modifier = timeStr.slice(-2).toLowerCase();
      const timeOnly = timeStr.slice(0, -2);
      let [hours, minutes] = timeOnly.split(':').map(Number);
      if (isNaN(minutes)) minutes = 0;
      if (modifier === 'pm' && hours < 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;
      return { hours, minutes };
    };

    const eventTitle = config.eventTitle || round.label || 'Induction Interview';
    const loc = config.location || 'Google Meet';

    const addParam = orgInvitees.join(',');

    // Rich Details with strict disclaimer
    const details = `${config.eventDescription || 'Interview for ' + (role?.name || 'Inductions')}\n\n📍 Location: ${loc}\n🏢 Organisation: ${org?.name || 'Organisation'}\n💼 Role: ${role?.name || 'Candidate'}\n👤 Candidate: ${candidateName || 'Applicant'} (${candidateEmail})\n\n⚠️ IMPORTANT APPLICATION NOTICE:\n${config.disclaimer || 'Do not modify the event title, timings, or host invitees when saving to Google Calendar. Any alterations may invalidate your interview booking.'}`;

    const queryParams = [
      `action=TEMPLATE`,
      `text=${encodeURIComponent(eventTitle)}`,
      `ctz=Asia%2FKolkata`,
      `details=${encodeURIComponent(details)}`,
      `location=${encodeURIComponent(loc)}`,
      `sf=true`,
      `output=xml`,
      ...(addParam ? [`add=${encodeURIComponent(addParam)}`] : []),
    ];

    if (config.dateMode === 'days') {
      const dayMap: Record<string, { byDay: string; offset: number }> = {
        Sun: { byDay: 'SU', offset: 0 },
        Mon: { byDay: 'MO', offset: 1 },
        Tue: { byDay: 'TU', offset: 2 },
        Wed: { byDay: 'WE', offset: 3 },
        Thu: { byDay: 'TH', offset: 4 },
        Fri: { byDay: 'FR', offset: 5 },
        Sat: { byDay: 'SA', offset: 6 },
      };

      const mapping = dayMap[slotDate] || { byDay: 'MO', offset: 1 };
      const now = new Date();
      const today = now.getDay();
      let daysUntil = mapping.offset - today;
      if (daysUntil <= 0) daysUntil += 7;

      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + daysUntil);

      const formatForGCal = (timeStr: string, dateObj: Date) => {
        const { hours, minutes } = parseTimeParts(timeStr);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${dateObj.getFullYear()}${pad(dateObj.getMonth() + 1)}${pad(dateObj.getDate())}T${pad(hours)}${pad(minutes)}00`;
      };

      const startFormatted = formatForGCal(startRaw, nextDate);
      const endFormatted = formatForGCal(endRaw, nextDate);
      queryParams.push(`dates=${startFormatted}/${endFormatted}`);
    } else {
      const formatForGCal = (timeStr: string, dateStr: string) => {
        const { hours, minutes } = parseTimeParts(timeStr);
        const [year, month, day] = dateStr.split('-').map(Number);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
      };

      const startFormatted = formatForGCal(startRaw, slotDate);
      const endFormatted = formatForGCal(endRaw, slotDate);
      queryParams.push(`dates=${startFormatted}/${endFormatted}`);
    }

    return `https://calendar.google.com/calendar/render?${queryParams.join('&')}`;
  };

  // Trigger Booking & Calendar Redirect
  const handleConfirmBooking = async () => {
    if (!selectedSlotKey) {
      toast.error('Please select an interview time slot');
      return;
    }

    if (!candidateEmail.trim() || !candidateEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsBooking(true);

    try {
      // 1. Record the slot reservation in the backend
      const res = await fetch(`/api/platform/inductions/interviews/${round.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotKey: selectedSlotKey,
          candidateEmail: candidateEmail.trim(),
          candidateName: candidateName.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        await refreshSlots();
        setSelectedSlotKey(null);
        throw new Error(json.error || 'Failed to reserve interview slot');
      }

      // 2. Generate the Google Calendar URL
      const currentSlot = activeSlots.find((s) => s.slotKey === selectedSlotKey);
      if (!currentSlot) throw new Error('Slot details not found');

      const gcalUrl = buildGoogleCalendarUrl(currentSlot.dateStr, currentSlot.timeRange);
      setGeneratedGcalUrl(gcalUrl);

      const bookingRecord: InterviewBooking = {
        slotKey: selectedSlotKey,
        candidateEmail: candidateEmail.trim(),
        candidateName: candidateName.trim() || undefined,
        bookedAt: new Date().toISOString(),
      };
      setBookedSuccess(bookingRecord);

      // 3. Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore confetti errors
      }

      toast.success('Interview slot reserved! Opening Google Calendar...');

      // 4. Open Google Calendar in new tab
      window.open(gcalUrl, '_blank');
    } catch (err: any) {
      toast.error(err.message || 'Could not complete interview booking');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedGcalUrl) return;
    try {
      await navigator.clipboard.writeText(generatedGcalUrl);
      setIsCopiedGcal(true);
      setTimeout(() => setIsCopiedGcal(false), 2000);
      toast.success('Google Calendar event link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  // Format date display for tab headers
  const formatDateHeader = (dStr: string) => {
    if (config.dateMode === 'days') return dStr;
    try {
      const d = parseISO(dStr);
      return {
        weekday: format(d, 'EEE'),
        day: format(d, 'd'),
        month: format(d, 'MMM'),
      };
    } catch {
      return { weekday: '', day: dStr, month: '' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/platform/inductions"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Applications
        </Link>
        <div className="flex items-center gap-2">
          {/* The booking tour is reachable from the global help button. */}
          <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5 gap-1.5 py-1 px-3">
            <Clock className="h-3.5 w-3.5" />
            Live Slot Scheduling
          </Badge>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Org & Event Metadata & Anti-Tamper Notice */}
        <TourStep
          id="interview-details"
          order={1}
          position="bottom"
          title="Interview Overview"
          content="Review the interview details, host organisation, and important instructions before reserving your slot."
          className="lg:col-span-5 space-y-6"
        >
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 space-y-5">
              {/* Org Header */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-border/80">
                {org?.logoUrl ? (
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-muted border border-border/80 flex-shrink-0">
                    <Image
                      src={org.logoUrl}
                      alt={org.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 flex-shrink-0">
                    {org?.name ? org.name.substring(0, 2).toUpperCase() : 'OR'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-foreground text-base leading-snug">
                    {org?.name || 'Organisation'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {role?.name && (
                      <span className="text-xs font-semibold text-primary">{role.name}</span>
                    )}
                    {cycle?.name && (
                      <span className="text-xs text-muted-foreground">· {cycle.name}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Title & Round Name */}
              <div className="space-y-1">
                <Badge variant="secondary" className="text-[11px] mb-1 text-secondary-extradark dark:text-secondary bg-secondary/15 border-secondary/30">
                  {round.label}
                </Badge>
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                  {config.eventTitle || round.label || 'Interview Round'}
                </h1>
              </div>

              {/* Meta details (Duration, Location, Organisers) */}
              <div className="space-y-2.5 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      {config.slotDuration || 30} minutes
                    </span>{' '}
                    per interview session
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      {config.location || 'Google Meet'}
                    </span>
                  </div>
                </div>

                {orgInvitees.length > 0 && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Host Panelists:</span>{' '}
                      <span className="text-muted-foreground">
                        {orgInvitees.join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {config.eventDescription && (
                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-foreground/90 whitespace-pre-line leading-relaxed">
                  {config.eventDescription}
                </div>
              )}
            </div>
          </Card>

          {/* Strict Anti-Tamper Notice Banner */}
          <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 p-5 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              Important Notice: Do Not Edit Calendar Details
            </div>
            <p className="text-xs text-amber-950/80 dark:text-amber-200/90 leading-relaxed">
              {config.disclaimer ||
                'Please do not modify the event title, timings, location, or host invitees when adding this to your Google Calendar. Any alterations will prevent your interview from being recognized and may invalidate your application.'}
            </p>
          </div>
        </TourStep>

        {/* Right Side: Appointment Slot Booking Picker */}
        <TourStep
          id="interview-slot-picker"
          order={2}
          position="top"
          title="Select an Interview Slot"
          content="Browse available dates across the tabs and choose an open time slot that fits your schedule."
          className="lg:col-span-7 space-y-6"
        >
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Select an Interview Slot</h2>
                  <p className="text-xs text-muted-foreground">
                    Choose from the fixed available appointments below (IST timezone).
                  </p>
                </div>
                <Badge variant="outline" className="w-fit text-xs font-semibold">
                  {activeSlots.filter((s) => !s.isBooked).length} slots available
                </Badge>
              </div>

              {/* Date Tabs (Horizontal Strip) */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select Date
                </Label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {availableDates.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No interview dates currently open for booking.
                    </p>
                  ) : (
                    availableDates.map((dateStr) => {
                      const isSelected = selectedDate === dateStr;
                      const header = formatDateHeader(dateStr);

                      if (config.dateMode === 'days') {
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setSelectedSlotKey(null);
                            }}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-background hover:bg-muted text-foreground border-border'
                            }`}
                          >
                            Every {dateStr}
                          </button>
                        );
                      }

                      const h = header as { weekday: string; day: string; month: string };
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSelectedSlotKey(null);
                          }}
                          className={`flex flex-col items-center justify-center w-20 py-2 rounded-xl border transition-all shrink-0 ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20'
                              : 'bg-background hover:bg-muted text-foreground border-border'
                          }`}
                        >
                          <span className="text-[10px] font-semibold opacity-80 uppercase">
                            {h.weekday}
                          </span>
                          <span className="text-lg font-black leading-tight">{h.day}</span>
                          <span className="text-[10px] font-medium opacity-80">{h.month}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Fixed Slots Grid (Grouped by time of day) */}
              <div className="space-y-5 pt-2">
                {activeSlots.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No slots configured for this date.
                  </div>
                ) : (
                  <>
                    {/* Morning */}
                    {groupedSlots.morning.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> Morning
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {groupedSlots.morning.map((slot) => {
                            const isSelected = selectedSlotKey === slot.slotKey;
                            return (
                              <button
                                key={slot.slotKey}
                                type="button"
                                disabled={slot.isBooked}
                                onClick={() => setSelectedSlotKey(slot.slotKey)}
                                className={`p-3 rounded-xl border text-left transition-all text-xs font-semibold relative ${
                                  slot.isBooked
                                    ? 'bg-muted/40 text-muted-foreground/50 border-border/50 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/30'
                                    : 'bg-background hover:border-primary/60 text-foreground border-border hover:bg-primary/5'
                                }`}
                              >
                                <div>{slot.startTime}</div>
                                <div className="text-[11px] opacity-80 mt-0.5">to {slot.endTime}</div>
                                {slot.isBooked && (
                                  <span className="text-[9px] font-normal no-underline block text-destructive mt-1">
                                    Booked
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Afternoon */}
                    {groupedSlots.afternoon.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> Afternoon
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {groupedSlots.afternoon.map((slot) => {
                            const isSelected = selectedSlotKey === slot.slotKey;
                            return (
                              <button
                                key={slot.slotKey}
                                type="button"
                                disabled={slot.isBooked}
                                onClick={() => setSelectedSlotKey(slot.slotKey)}
                                className={`p-3 rounded-xl border text-left transition-all text-xs font-semibold relative ${
                                  slot.isBooked
                                    ? 'bg-muted/40 text-muted-foreground/50 border-border/50 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/30'
                                    : 'bg-background hover:border-primary/60 text-foreground border-border hover:bg-primary/5'
                                }`}
                              >
                                <div>{slot.startTime}</div>
                                <div className="text-[11px] opacity-80 mt-0.5">to {slot.endTime}</div>
                                {slot.isBooked && (
                                  <span className="text-[9px] font-normal no-underline block text-destructive mt-1">
                                    Booked
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Evening */}
                    {groupedSlots.evening.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> Evening
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {groupedSlots.evening.map((slot) => {
                            const isSelected = selectedSlotKey === slot.slotKey;
                            return (
                              <button
                                key={slot.slotKey}
                                type="button"
                                disabled={slot.isBooked}
                                onClick={() => setSelectedSlotKey(slot.slotKey)}
                                className={`p-3 rounded-xl border text-left transition-all text-xs font-semibold relative ${
                                  slot.isBooked
                                    ? 'bg-muted/40 text-muted-foreground/50 border-border/50 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/30'
                                    : 'bg-background hover:border-primary/60 text-foreground border-border hover:bg-primary/5'
                                }`}
                              >
                                <div>{slot.startTime}</div>
                                <div className="text-[11px] opacity-80 mt-0.5">to {slot.endTime}</div>
                                {slot.isBooked && (
                                  <span className="text-[9px] font-normal no-underline block text-destructive mt-1">
                                    Booked
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Confirmation & Google Calendar Generation Box */}
              {selectedSlotKey && (
                <TourStep
                  id="interview-confirm-sync"
                  order={3}
                  position="top"
                  title="Confirm and Add to Calendar"
                  content="Verify your contact details and click Book Interview to reserve your slot and generate a Google Calendar invite."
                >
                  <div className="pt-4 border-t border-border space-y-4 bg-muted/20 -mx-6 -mb-6 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Confirm Your Details</h4>
                        <p className="text-xs text-muted-foreground">
                          Selected: <span className="font-semibold text-primary">{selectedSlotKey}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="cand-name" className="text-xs">
                          Your Full Name
                        </Label>
                        <Input
                          id="cand-name"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="text-xs h-9 bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cand-email" className="text-xs">
                          Your Ashoka Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="cand-email"
                          value={candidateEmail}
                          onChange={(e) => setCandidateEmail(e.target.value)}
                          placeholder="e.g. yourname@ashoka.edu.in"
                          className="text-xs h-9 bg-background"
                        />
                      </div>
                    </div>

                    {/* Submit Action */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        onClick={handleConfirmBooking}
                        disabled={isBooking || !candidateEmail}
                        className="flex-1 gap-2 font-bold py-5 shadow-lg bg-primary hover:bg-primary/90 text-white"
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Reserving Slot...
                          </>
                        ) : (
                          <>
                            <CalendarIcon className="h-4 w-4" />
                            Book Slot &amp; Open Google Calendar
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Post-booking quick link */}
                    {bookedSuccess && generatedGcalUrl && (
                      <div className="rounded-xl bg-green/15 border border-green/30 p-4 space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-green-dark dark:text-green-light font-bold text-xs">
                          <CheckCircle2 className="h-4 w-4" />
                          Slot Reserved Successfully!
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          If the Google Calendar tab did not open automatically, use the buttons below:
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 gap-1.5"
                            onClick={() => window.open(generatedGcalUrl, '_blank')}
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Open Google Calendar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-8 gap-1.5"
                            onClick={handleCopyLink}
                          >
                            {isCopiedGcal ? <Check className="h-3.5 w-3.5 text-green" /> : <Copy className="h-3.5 w-3.5" />}
                            {isCopiedGcal ? 'Copied' : 'Copy Calendar URL'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TourStep>
              )}
            </div>
          </Card>
        </TourStep>
      </div>
    </div>
  );
}
