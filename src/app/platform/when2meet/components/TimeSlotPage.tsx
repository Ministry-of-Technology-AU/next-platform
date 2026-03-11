'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TimeSlot, TimeTableGrid, TimeTableDraft, ASHOKA_TIME_SLOTS, HOUR_SLOTS, THIRTY_MIN_SLOTS, TIMESLOT_COLOR } from '../types'
import { CalendarIcon, Check, ChevronDownIcon, Copy, HelpCircle, Loader2, Trophy, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface TimeSlotPageProps {
    data: (TimeTableDraft & { isOwner: boolean }) | null
}

export default function TimeSlotPage({ data }: TimeSlotPageProps) {
    const router = useRouter()
    const { data: session } = useSession()
    const [title, setTitle] = useState<string>('')
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [dateColumns, setDateColumns] = useState<string[]>([])
    const [dateMode, setDateMode] = useState<'dates' | 'days'>('dates')
    const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set())

    const ALL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
    const [activeConfig, setActiveConfig] = useState<TimeTableGrid['slotMode']>('custom')
    const [showCustomDropdown, setShowCustomDropdown] = useState<boolean>(false)
    const [customDuration, setCustomDuration] = useState<TimeTableGrid['customSlotDuration']>(30)
    const [onlyShareOwnerAvail, setOnlyShareOwnerAvail] = useState<boolean>(false)
    const [isGeneratingLink, setIsGeneratingLink] = useState<boolean>(false)
    const [isSavingAvailability, setIsSavingAvailability] = useState<boolean>(false)
    const [shareableLink, setShareableLink] = useState<string>('')
    const [isCopied, setIsCopied] = useState<boolean>(false)
    const [currentUid, setCurrentUid] = useState<string>('')
    const [hoveredCell, setHoveredCell] = useState<string | null>(null)
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('')
    const [participantEmails, setParticipantEmails] = useState<string[]>([])
    const [startDatePickerOpen, setStartDatePickerOpen] = useState<boolean>(false)
    const [endDatePickerOpen, setEndDatePickerOpen] = useState<boolean>(false)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const dragModeRef = useRef<'select' | 'deselect'>('select')

    const isOwner = data?.isOwner ?? true
    const isDisabled = !isOwner || !!currentUid

    // Update current user email from session
    useEffect(() => {
        if (session?.user?.email) {
            setCurrentUserEmail(session.user.email)
        }
    }, [session])

    // Initialize state from data when component mounts or data changes
    useEffect(() => {
        if (data) {
            setTitle(data.title || '')
            setActiveConfig(data.grid.slotMode)
            setCustomDuration(data.grid.customSlotDuration)
            setOnlyShareOwnerAvail(data.grid.onlyShareOwnerAvail)
            setCurrentUid(data.grid.uid || '')
            setDateMode(data.grid.dateMode || 'dates')

            // Set selected days if in day mode
            if (data.grid.selectedDays && data.grid.selectedDays.length > 0) {
                setSelectedDays(new Set(data.grid.selectedDays))
            }

            // Set participant emails from users array (filter out duplicates and non-email entries)
            const uniqueEmails = Array.from(new Set((data.grid.users || []).filter((u: string) => u.includes('@'))))
            setParticipantEmails(uniqueEmails)

            // Set dates
            if (data.grid.startDate) {
                const d = new Date(data.grid.startDate)
                const startDateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
                setStartDate(startDateStr)
            }
            if (data.grid.endDate) {
                const d = new Date(data.grid.endDate)
                const endDateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
                setEndDate(endDateStr)
            }

            // If UID exists, set the shareable link
            if (data.grid.uid) {
                const baseUrl = window.location.origin
                setShareableLink(`${baseUrl}/w/${data.grid.uid}`)
            }

            // Load blocked times for current user
            if (currentUserEmail && data.grid.blockedTimes && data.grid.blockedTimes[currentUserEmail]) {
                const userBlockedSlots = data.grid.blockedTimes[currentUserEmail]
                const selectedSet = new Set<string>()

                if (Array.isArray(userBlockedSlots)) {
                    userBlockedSlots.forEach(slot => {
                        let colKey: string
                        if ((data.grid.dateMode || 'dates') === 'days') {
                            // In day mode, use abbreviated day name as column key
                            const dayAbbr = slot.day?.substring(0, 3) || 'Mon'
                            colKey = dayAbbr
                        } else {
                            try {
                                // Use UTC methods to avoid timezone shift
                                const d = new Date(slot.date)
                                colKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
                            } catch {
                                colKey = String(slot.date).split('T')[0]
                            }
                        }
                        const timeSlot = `${slot.startTime}-${slot.endTime}`
                        selectedSet.add(`${colKey}-${timeSlot}`)
                    })
                }

                setSelectedSlots(selectedSet)
            } else {
                setSelectedSlots(new Set())
            }
        }
    }, [data, currentUserEmail])

    // Generate date/day columns when dates or selected days change
    useEffect(() => {
        if (dateMode === 'days') {
            // In day mode, use the selected days as columns
            const orderedDays = ALL_DAYS.filter(d => selectedDays.has(d))
            setDateColumns(orderedDays)
        } else if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            const columns: string[] = []

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                columns.push(new Date(d).toISOString().split('T')[0])
            }

            setDateColumns(columns)
        } else {
            setDateColumns([])
        }
    }, [startDate, endDate, dateMode, selectedDays])

    // Get users who blocked a specific cell
    const getUsersWhoBlockedCell = (date: string, timeSlot: string): string[] => {
        if (!data?.grid.blockedTimes) return []

        const users: string[] = []
        const lastDash = timeSlot.lastIndexOf('-')
        const startTime = timeSlot.substring(0, lastDash)
        const endTime = timeSlot.substring(lastDash + 1)

        Object.entries(data.grid.blockedTimes).forEach(([userEmail, slots]) => {
            if (!Array.isArray(slots)) return

            const hasBlocked = slots.some(slot => {
                // Normalize the stored date to YYYY-MM-DD or day name for comparison
                let slotDate: string
                if (dateMode === 'days') {
                    slotDate = slot.day?.substring(0, 3) || String(slot.date)
                } else {
                    try {
                        const d = new Date(slot.date)
                        slotDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
                    } catch {
                        slotDate = String(slot.date).split('T')[0]
                    }
                }

                return slotDate === date &&
                    slot.startTime === startTime &&
                    slot.endTime === endTime
            })

            if (hasBlocked) {
                users.push(userEmail)
            }
        })

        return users
    }

    // Get time slots based on active configuration
    const getTimeSlotsForConfig = (): readonly string[] => {
        switch (activeConfig) {
            case 'ashoka':
                return ASHOKA_TIME_SLOTS
            case 'custom':
                return customDuration === 30 ? THIRTY_MIN_SLOTS : HOUR_SLOTS
            case 'default':
            default:
                return HOUR_SLOTS
        }
    }

    const allTimeSlots = getTimeSlotsForConfig()

    const formatDateDisplay = (dateStr: string) => {
        const date = new Date(dateStr)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const day = days[date.getDay()]
        const dateDisplay = `${date.getDate()}/${date.getMonth() + 1}`
        return { day, date: dateDisplay }
    }

    const isCellSelected = (date: string, timeSlot: string): boolean => {
        const cellKey = `${date}-${timeSlot}`
        return selectedSlots.has(cellKey)
    }

    const handleCellClick = (date: string, timeSlot: string) => {
        const cellKey = `${date}-${timeSlot}`
        const newSelectedSlots = new Set(selectedSlots)

        if (newSelectedSlots.has(cellKey)) {
            newSelectedSlots.delete(cellKey)
        } else {
            newSelectedSlots.add(cellKey)
        }

        setSelectedSlots(newSelectedSlots)
    }

    // Drag-to-select handlers
    const handleDragStart = useCallback((date: string, timeSlot: string) => {
        const cellKey = `${date}-${timeSlot}`
        const wasSelected = selectedSlots.has(cellKey)
        dragModeRef.current = wasSelected ? 'deselect' : 'select'
        setIsDragging(true)

        const newSelectedSlots = new Set(selectedSlots)
        if (wasSelected) {
            newSelectedSlots.delete(cellKey)
        } else {
            newSelectedSlots.add(cellKey)
        }
        setSelectedSlots(newSelectedSlots)
    }, [selectedSlots])

    const handleDragEnter = useCallback((date: string, timeSlot: string) => {
        if (!isDragging) return
        const cellKey = `${date}-${timeSlot}`
        setSelectedSlots(prev => {
            const newSet = new Set(prev)
            if (dragModeRef.current === 'select') {
                newSet.add(cellKey)
            } else {
                newSet.delete(cellKey)
            }
            return newSet
        })
    }, [isDragging])

    const handleDragEnd = useCallback(() => {
        setIsDragging(false)
    }, [])

    // Touch drag support: resolve cell from touch position
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return
        const touch = e.touches[0]
        const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null
        if (!el) return
        const td = el.closest('td[data-cell]') as HTMLElement | null
        if (!td?.dataset.cell) return
        const [date, ...rest] = td.dataset.cell.split('-')
        const dateStr = [date, rest[0], rest[1]].join('-')
        const timeSlot = rest.slice(2).join('-')
        if (dateStr && timeSlot) {
            handleDragEnter(dateStr, timeSlot)
        }
    }, [isDragging, handleDragEnter])

    // Global mouseup / touchend to stop dragging
    useEffect(() => {
        const stop = () => setIsDragging(false)
        window.addEventListener('mouseup', stop)
        window.addEventListener('touchend', stop)
        return () => {
            window.removeEventListener('mouseup', stop)
            window.removeEventListener('touchend', stop)
        }
    }, [])

    const handleCopyLink = async () => {
        if (shareableLink) {
            await navigator.clipboard.writeText(shareableLink)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
            toast.success('Link copied to clipboard!')
        }
    }

    const handleSendInvite = (slotDate?: string, timeRange?: string, invitees?: string[]) => {
        if (!slotDate || !timeRange) {
            toast.info('Please select a specific timeslot to send an invite.');
            return;
        }

        try {
            const eventTitle = title || "Meeting";
            const [startRaw, endRaw] = timeRange.split('-');

            const parseTimeParts = (timeStr: string) => {
                const modifier = timeStr.slice(-2).toLowerCase(); // "am" or "pm"
                const timeOnly = timeStr.slice(0, -2);            // e.g. "8:30"
                let [hours, minutes] = timeOnly.split(':').map(Number);
                if (isNaN(minutes)) minutes = 0;

                if (modifier === 'pm' && hours < 12) hours += 12;
                if (modifier === 'am' && hours === 12) hours = 0;

                return { hours, minutes };
            };

            const details = `Scheduled via When2Meet for ${slotDate} ${timeRange}.`;
            const add = invitees?.join(',') ?? '';

            let queryParams = [
                `action=TEMPLATE`,
                `text=${encodeURIComponent(eventTitle)}`,
                `ctz=Asia%2FKolkata`,                      // IST
                `details=${encodeURIComponent(details)}`,
                `sf=true`,
                `output=xml`,
                ...(add ? [`add=${encodeURIComponent(add)}`] : []),
            ];

            if (dateMode === 'days') {
                // slotDate is "Mon", "Tue", etc.
                const dayMap: Record<string, { byDay: string, offset: number }> = {
                    'Sun': { byDay: 'SU', offset: 0 },
                    'Mon': { byDay: 'MO', offset: 1 },
                    'Tue': { byDay: 'TU', offset: 2 },
                    'Wed': { byDay: 'WE', offset: 3 },
                    'Thu': { byDay: 'TH', offset: 4 },
                    'Fri': { byDay: 'FR', offset: 5 },
                    'Sat': { byDay: 'SA', offset: 6 }
                };

                const mapping = dayMap[slotDate] || { byDay: 'MO', offset: 1 };

                // Find next occurrence of this day
                const now = new Date();
                const today = now.getDay();
                let daysUntil = mapping.offset - today;
                if (daysUntil <= 0) daysUntil += 7; // Next occurrence

                const nextDate = new Date(now);
                nextDate.setDate(now.getDate() + daysUntil);

                const formatForGCal = (timeStr: string, dateObj: Date) => {
                    const { hours, minutes } = parseTimeParts(timeStr);
                    const pad = (n: number) => String(n).padStart(2, '0');
                    return `${dateObj.getFullYear()}${pad(dateObj.getMonth() + 1)}${pad(dateObj.getDate())}T${pad(hours)}${pad(minutes)}00`;
                };

                const startFormatted = formatForGCal(startRaw, nextDate);
                const endFormatted = formatForGCal(endRaw, nextDate);
                const dates = `${startFormatted}/${endFormatted}`;

                queryParams.push(`dates=${dates}`);
                queryParams.push(`recur=RRULE:FREQ=WEEKLY;BYDAY=${mapping.byDay}`);
            } else {
                // dateMode is 'dates', slotDate is "YYYY-MM-DD"
                const formatForGCal = (timeStr: string, dateStr: string) => {
                    const { hours, minutes } = parseTimeParts(timeStr);
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const pad = (n: number) => String(n).padStart(2, '0');
                    return `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
                };

                const startFormatted = formatForGCal(startRaw, slotDate);
                const endFormatted = formatForGCal(endRaw, slotDate);
                const dates = `${startFormatted}/${endFormatted}`;
                queryParams.push(`dates=${dates}`);
            }

            const query = queryParams.join('&');
            window.open(`https://calendar.google.com/calendar/render?${query}`, '_blank');
        } catch (error) {
            console.error('Error generating calendar link:', error);
            toast.error('Failed to generate calendar invite');
        }
    };

    // Save availability for any user (owner or participant)
    const handleSaveAvailability = async () => {
        if (!currentUserEmail) {
            console.log("Current user email is saved as ", currentUserEmail);
            toast.error('Please log in to save your availability')
            return
        }

        if (!currentUid) {
            toast.error('No timetable ID found')
            return
        }

        setIsSavingAvailability(true)

        try {
            // Convert selected slots to TimeSlot format
            const blockedTimes: TimeSlot[] = []

            selectedSlots.forEach(cellKey => {
                if (dateMode === 'days') {
                    // cellKey format: "Mon-8:30am-10:00am"
                    const firstDash = cellKey.indexOf('-')
                    const dayAbbr = cellKey.substring(0, firstDash)
                    const timeSlotStr = cellKey.substring(firstDash + 1)
                    const lastDash = timeSlotStr.lastIndexOf('-')
                    const startTime = timeSlotStr.substring(0, lastDash)
                    const endTime = timeSlotStr.substring(lastDash + 1)
                    const dayFullNames: Record<string, string> = { 'Sun': 'Sunday', 'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday' }

                    blockedTimes.push({
                        date: new Date(0), // placeholder date for day mode
                        day: dayFullNames[dayAbbr] as TimeSlot['day'],
                        startTime: startTime,
                        endTime: endTime,
                        slotMode: activeConfig
                    })
                } else {
                    // cellKey format: "2025-02-17-8:30am-10:00am"
                    // Date is always first 10 chars (YYYY-MM-DD), time slot is the rest
                    const dateStr = cellKey.substring(0, 10)
                    const timeSlotStr = cellKey.substring(11) // skip the dash after date
                    const lastDash = timeSlotStr.lastIndexOf('-')
                    const startTime = timeSlotStr.substring(0, lastDash)
                    const endTime = timeSlotStr.substring(lastDash + 1)
                    const date = new Date(dateStr)
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                    const day = dayNames[date.getDay()]

                    blockedTimes.push({
                        date: date,
                        day: day as TimeSlot['day'],
                        startTime: startTime,
                        endTime: endTime,
                        slotMode: activeConfig
                    })
                }
            })

            // Create updated timetable with current user's availability
            const updatedTimetable: TimeTableDraft = {
                title: title,
                grid: {
                    ...data!.grid,
                    blockedTimes: {
                        [currentUserEmail]: blockedTimes
                    }
                }
            }

            // Send update to API
            const response = await fetch('/api/platform/when2meet', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: currentUid,
                    timetable: updatedTimetable,
                    isAvailabilityUpdate: true
                }),
            })

            if (response.ok) {
                toast.success('Your availability has been saved!')
                // Refresh the page to show updated data
                router.refresh()
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to save availability')
            }
        } catch (error) {
            console.error('Error saving availability:', error)
            toast.error('An error occurred while saving your availability')
        } finally {
            setIsSavingAvailability(false)
        }
    }

    // Generate or update link (owner only)
    const handleGenerateLink = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title')
            return
        }

        if (dateMode === 'dates' && (!startDate || !endDate)) {
            toast.error('Please select start and end dates')
            return
        }

        if (dateMode === 'days' && selectedDays.size === 0) {
            toast.error('Please select at least one day')
            return
        }

        setIsGeneratingLink(true)

        try {
            // Convert selected slots to TimeSlot format for owner's blocked times
            const ownerBlockedTimes: TimeSlot[] = []

            selectedSlots.forEach(cellKey => {
                if (dateMode === 'days') {
                    const firstDash = cellKey.indexOf('-')
                    const dayAbbr = cellKey.substring(0, firstDash)
                    const timeSlotStr = cellKey.substring(firstDash + 1)
                    const lastDash = timeSlotStr.lastIndexOf('-')
                    const startTime = timeSlotStr.substring(0, lastDash)
                    const endTime = timeSlotStr.substring(lastDash + 1)
                    const dayFullNames: Record<string, string> = { 'Sun': 'Sunday', 'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday' }

                    ownerBlockedTimes.push({
                        date: new Date(0),
                        day: dayFullNames[dayAbbr] as TimeSlot['day'],
                        startTime: startTime,
                        endTime: endTime,
                        slotMode: activeConfig
                    })
                } else {
                    // cellKey format: "YYYY-MM-DD-startTime-endTime"
                    const dateStr = cellKey.substring(0, 10)
                    const timeSlotStr = cellKey.substring(11) // skip the dash after date
                    const lastDash = timeSlotStr.lastIndexOf('-')
                    const startTime = timeSlotStr.substring(0, lastDash)
                    const endTime = timeSlotStr.substring(lastDash + 1)
                    const date = new Date(dateStr)
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                    const day = dayNames[date.getDay()]

                    ownerBlockedTimes.push({
                        date: date,
                        day: day as TimeSlot['day'],
                        startTime: startTime,
                        endTime: endTime,
                        slotMode: activeConfig
                    })
                }
            })

            const timetable: TimeTableDraft = {
                title: title,
                grid: {
                    dateMode: dateMode,
                    startDate: dateMode === 'dates' ? new Date(startDate) : new Date(0),
                    endDate: dateMode === 'dates' ? new Date(endDate) : new Date(0),
                    selectedDays: dateMode === 'days' ? Array.from(selectedDays) : undefined,
                    slotMode: activeConfig,
                    customSlotDuration: customDuration,
                    owner: currentUserEmail,
                    users: [currentUserEmail], // Start with owner's email
                    blockedTimes: {
                        [currentUserEmail]: ownerBlockedTimes
                    },
                    onlyShareOwnerAvail: onlyShareOwnerAvail,
                    lockedTimes: [],
                    uid: currentUid
                }
            }

            let response
            if (currentUid) {
                // Update existing timetable
                response = await fetch('/api/platform/when2meet', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        uid: currentUid,
                        timetable: timetable,
                        isAvailabilityUpdate: false
                    }),
                })
            } else {
                // Create new timetable
                response = await fetch('/api/platform/when2meet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ timetable }),
                })
            }

            if (response.ok) {
                const result = await response.json()
                const uid = result.uid || currentUid

                setCurrentUid(uid)
                const baseUrl = window.location.origin
                const newLink = `${baseUrl}/w/${uid}`
                setShareableLink(newLink)

                toast.success(currentUid ? 'Link updated successfully!' : 'Shareable link generated!')

                // Navigate to the shareable link
                router.push(`/w/${uid}`)
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to generate link')
            }
        } catch (error) {
            console.error('Error generating link:', error)
            toast.error('An error occurred while generating the link')
        } finally {
            setIsGeneratingLink(false)
        }
    }

    return (
        <div className="bg-background text-foreground">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
                    {/* Left Side - Configuration */}
                    <Card className="lg:w-80 h-[520px] overflow-y-scroll force-scrollbar">
                        <CardContent className="space-y-4 pt-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Title <span className="text-primary">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={isDisabled}
                                    placeholder="Enter event title"
                                />
                            </div>

                            {/* Schedule Mode Toggle */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Label>Schedule By</Label>
                                    <div className="relative group">
                                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 bg-popover text-popover-foreground border border-border rounded-md shadow-lg text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                            <p><span className="font-semibold">Dates</span> — pick a specific date range (e.g. Mar 15–20).</p>
                                            <p className="mt-1"><span className="font-semibold">Days</span> — pick recurring weekdays (e.g. every Mon &amp; Wed), useful for weekly schedules.</p>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-popover" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => { if (!isDisabled) { setDateMode('dates'); setSelectedDays(new Set()); setSelectedSlots(new Set()) } }}
                                        disabled={isDisabled}
                                        variant={dateMode === 'dates' ? 'default' : 'outline'}
                                        className="flex-1"
                                        size="sm"
                                    >
                                        Dates
                                    </Button>
                                    <Button
                                        onClick={() => { if (!isDisabled) { setDateMode('days'); setStartDate(''); setEndDate(''); setSelectedSlots(new Set()) } }}
                                        disabled={isDisabled}
                                        variant={dateMode === 'days' ? 'default' : 'outline'}
                                        className="flex-1"
                                        size="sm"
                                    >
                                        Days
                                    </Button>
                                </div>
                            </div>

                            {dateMode === 'dates' ? (
                                /* Date Range Pickers */
                                <div className="space-y-2">
                                    <Label>Date Range</Label>
                                    <div className="space-y-2">
                                        <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-between font-normal"
                                                    disabled={isDisabled}
                                                >
                                                    {startDate
                                                        ? new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                        : 'Start date'}
                                                    <CalendarIcon className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate ? new Date(startDate) : undefined}
                                                    captionLayout="dropdown"
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            setStartDate(date.toISOString().split('T')[0])
                                                        }
                                                        setStartDatePickerOpen(false)
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-between font-normal"
                                                    disabled={isDisabled}
                                                >
                                                    {endDate
                                                        ? new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                        : 'End date'}
                                                    <CalendarIcon className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={endDate ? new Date(endDate) : undefined}
                                                    captionLayout="dropdown"
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            setEndDate(date.toISOString().split('T')[0])
                                                        }
                                                        setEndDatePickerOpen(false)
                                                    }}
                                                    fromDate={startDate ? new Date(startDate) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            ) : (
                                /* Day Selector */
                                <div className="space-y-2">
                                    <Label>Select Days</Label>
                                    <div className="flex gap-1">
                                        {ALL_DAYS.map((day) => {
                                            const isActive = selectedDays.has(day)
                                            const dayLabel = day.charAt(0) // S, M, T, W, T, F, S
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => {
                                                        if (isDisabled) return
                                                        const newDays = new Set(selectedDays)
                                                        if (newDays.has(day)) {
                                                            newDays.delete(day)
                                                        } else {
                                                            newDays.add(day)
                                                        }
                                                        setSelectedDays(newDays)
                                                    }}
                                                    disabled={isDisabled}
                                                    className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors border ${isActive
                                                        ? 'text-white border-transparent'
                                                        : 'bg-background border-border text-foreground hover:bg-muted'
                                                        }`}
                                                    style={isActive ? { backgroundColor: 'var(--color-primary)' } : undefined}
                                                    title={day}
                                                >
                                                    {dayLabel}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Time Slot Mode */}
                            <div className="space-y-2">
                                <Label>Time Slot Mode</Label>
                                <div className="space-y-2">
                                    <Button
                                        onClick={() => {
                                            if (!isDisabled) {
                                                setActiveConfig('custom')
                                                setCustomDuration(30)
                                            }
                                        }}
                                        disabled={isDisabled}
                                        variant={activeConfig === 'custom' ? 'default' : 'outline'}
                                        className="w-full"
                                    >
                                        30 minutes slot
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (!isDisabled) {
                                                setActiveConfig('default')
                                            }
                                        }}
                                        disabled={isDisabled}
                                        variant={activeConfig === 'default' ? 'default' : 'outline'}
                                        className="w-full"
                                    >
                                        1 hour slot
                                    </Button>
                                    <Button
                                        onClick={() => !isDisabled && setActiveConfig('ashoka')}
                                        disabled={isDisabled}
                                        variant={activeConfig === 'ashoka' ? 'default' : 'outline'}
                                        className="w-full"
                                    >
                                        Ashoka Schedule
                                    </Button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isOwner ? (
                                <>
                                    {!currentUid && (
                                        <Button
                                            onClick={handleGenerateLink}
                                            disabled={isGeneratingLink || !title.trim() || (dateMode === 'dates' ? (!startDate || !endDate) : selectedDays.size === 0)}
                                            className="w-full bg-primary text-white hover:bg-primary/90"
                                        >
                                            {isGeneratingLink ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                'Generate Shareable Link'
                                            )}
                                        </Button>
                                    )}

                                    {/* Show shareable link if it exists */}
                                    {shareableLink && (
                                        <div className="space-y-2">
                                            <Label>Shareable Link</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="text"
                                                    value={shareableLink}
                                                    readOnly
                                                    className="flex-1 text-sm"
                                                />
                                                <Button
                                                    onClick={handleCopyLink}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-shrink-0"
                                                >
                                                    {isCopied ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Save availability button for non-owners */
                                <Button
                                    onClick={handleSaveAvailability}
                                    disabled={isSavingAvailability}
                                    className="w-full bg-primary text-white hover:bg-primary/90"
                                >
                                    {isSavingAvailability ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save My Availability'
                                    )}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Middle Column */}
                    <div className="lg:w-74 h-[520px] overflow-y-scroll force-scrollbar space-y-4 pr-2">
                        {/* Top TimeSlot */}
                        <Card className="h-fit">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Trophy className="h-5 w-5" />
                                    <span className="font-semibold text-sm">Top time slots</span>
                                </div>
                                {(() => {
                                    if (!data?.grid.blockedTimes) return (
                                        <p className="text-sm text-muted-foreground">No availability data yet</p>
                                    )
                                    // Build a map of cellKey -> unique users
                                    const slotCounts: Record<string, { date: string; timeSlot: string; count: number; users: string[] }> = {}

                                    // 1. Process all saved blocked times
                                    Object.entries(data.grid.blockedTimes).forEach(([userEmail, slots]) => {
                                        if (!Array.isArray(slots)) return

                                        // Use a Set to ensure we only count the user once per slot (in case of data noise)
                                        const userSeenSlots = new Set<string>()

                                        slots.forEach(slot => {
                                            let dateStr: string
                                            if (dateMode === 'days') {
                                                dateStr = slot.day?.substring(0, 3) || 'Mon'
                                            } else {
                                                try {
                                                    const d = new Date(slot.date)
                                                    dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
                                                } catch {
                                                    dateStr = String(slot.date).split('T')[0]
                                                }
                                            }

                                            const timeRange = `${slot.startTime}-${slot.endTime}`
                                            const key = `${dateStr}-${timeRange}`

                                            if (!userSeenSlots.has(key)) {
                                                userSeenSlots.add(key)

                                                // If this is the current user, skip counting their SAVED state here
                                                // We will use their LOCAL state instead for real-time accuracy
                                                if (userEmail === currentUserEmail) return

                                                if (!slotCounts[key]) {
                                                    slotCounts[key] = { date: dateStr, timeSlot: timeRange, count: 0, users: [] }
                                                }
                                                slotCounts[key].count++
                                                slotCounts[key].users.push(userEmail)
                                            }
                                        })
                                    })

                                    // 2. Process current user's local selection
                                    if (currentUserEmail) {
                                        selectedSlots.forEach(cellKey => {
                                            if (!slotCounts[cellKey]) {
                                                // Need to parse cellKey to get date and time
                                                let dateStr: string
                                                let timeRange: string
                                                if (dateMode === 'days') {
                                                    // cellKey format: "Mon-8:30am-10:00am"
                                                    const firstDash = cellKey.indexOf('-')
                                                    dateStr = cellKey.substring(0, firstDash)
                                                    timeRange = cellKey.substring(firstDash + 1)
                                                } else {
                                                    // cellKey format: "YYYY-MM-DD-8:30am-10:00am"
                                                    // Date is always the first 10 chars
                                                    dateStr = cellKey.substring(0, 10)
                                                    timeRange = cellKey.substring(11)
                                                }
                                                slotCounts[cellKey] = { date: dateStr, timeSlot: timeRange, count: 0, users: [] }
                                            }
                                            slotCounts[cellKey].count++
                                            slotCounts[cellKey].users.unshift(currentUserEmail) // Add current user to the front
                                        })
                                    }

                                    const entries = Object.values(slotCounts)
                                    if (entries.length === 0) return (
                                        <p className="text-sm text-muted-foreground">No availability data yet</p>
                                    )

                                    const maxCount = Math.max(...entries.map(e => e.count))
                                    if (maxCount === 0) return <p className="text-sm text-muted-foreground">No availability data yet</p>

                                    const topSlots = entries.filter(e => e.count === maxCount)
                                    const formatDate = (ds: string) => {
                                        if (dateMode === 'days') return ds
                                        const d = new Date(ds)
                                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                                        return `${days[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`
                                    }
                                    return (
                                        <div className="space-y-2 max-h-40 overflow-y-scroll force-scrollbar">
                                            {topSlots.map((slot, idx) => (
                                                <div
                                                    key={idx}
                                                    className="text-sm px-3 py-2 rounded border border-primary/20"
                                                    style={{ backgroundColor: 'rgba(155, 78, 67, 0.1)' }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-semibold text-foreground">{formatDate(slot.date)}</div>
                                                            <div className="text-xs text-foreground/80">{slot.timeSlot}</div>
                                                            <div className="text-xs text-foreground font-medium mt-1">{slot.count} {slot.count === 1 ? 'person' : 'people'}</div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs h-7 px-2 text-foreground"
                                                            onClick={() => handleSendInvite(slot.date, slot.timeSlot, slot.users)}
                                                        >
                                                            Send Invite
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })()}
                            </CardContent>
                        </Card>

                        {/* People on Draft */}
                        <Card className="h-fit">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        <span className="font-semibold text-sm">People</span>
                                    </div>
                                    <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">{participantEmails.length}</span>
                                </div>
                                {participantEmails.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-scroll force-scrollbar">
                                        {participantEmails.map((email, idx) => {
                                            const name = email.split('@')[0].split('_')[0].replace(/[.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                                            return (
                                                <div
                                                    key={idx}
                                                    className="text-sm px-3 py-2"

                                                >
                                                    <div className="font-semibold text-foreground">{name}</div>
                                                    <div className="text-xs text-foreground/80">{email}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        When people join your calendar, it will show here
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Side - Timetable */}
                    <div className="flex-1 flex flex-col">
                        {dateColumns.length > 0 ? (
                            <div className="w-full lg:w-fit mx-auto lg:mx-0 lg:ml-auto">
                                <Card className="flex flex-col border-0 shadow-none bg-transparent">
                                    <CardContent className="p-0">
                                        <div className="h-[520px] overflow-y-scroll overflow-x-scroll force-scrollbar">
                                            <table className="border-separate" style={{ borderSpacing: '3px' }}>
                                                <thead className="sticky top-0 z-10 bg-primary-light/60 dark:bg-primary-dark/40 !text-white">
                                                    <tr>
                                                        <th className="border border-border p-2 w-[170px] rounded-[7px] text-white">
                                                            Time
                                                        </th>
                                                        {dateColumns.map((col) => {
                                                            if (dateMode === 'days') {
                                                                return (
                                                                    <th key={col} className="border border-border p-2 w-[60px] rounded-[7px] text-white">
                                                                        <div className="text-sm">{col}</div>
                                                                    </th>
                                                                )
                                                            }
                                                            const { day, date: dateDisplay } = formatDateDisplay(col)
                                                            return (
                                                                <th key={col} className="border border-border p-2 w-[60px] rounded-[7px]">
                                                                    <div className="text-sm">{day}</div>
                                                                    <div className="text-xs text-white/70">{dateDisplay}</div>
                                                                </th>
                                                            )
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allTimeSlots.map((timeSlot) => (
                                                        <tr key={timeSlot}>
                                                            <td className="border border-border p-2 text-sm bg-muted sticky left-0 z-5 rounded-[7px]">
                                                                {timeSlot}
                                                            </td>
                                                            {dateColumns.map((date) => {
                                                                const cellKey = `${date}-${timeSlot}`
                                                                const blockedByUsers = getUsersWhoBlockedCell(date, timeSlot)
                                                                const isSelected = isCellSelected(date, timeSlot)

                                                                // To avoid double-counting the current user if their availability is already saved:
                                                                // 1. Get unique users from blockedByUsers
                                                                // 2. If current user has it selected locally but isn't in blockedByUsers yet, add 1
                                                                // 3. If current user is in blockedByUsers but HASN'T selected it locally (deselected), subtract 1

                                                                const otherUsers = currentUserEmail ? blockedByUsers.filter(email => email !== currentUserEmail) : blockedByUsers
                                                                const effectiveCount = otherUsers.length + (isSelected ? 1 : 0)

                                                                return (
                                                                    <td
                                                                        key={cellKey}
                                                                        data-cell={cellKey}
                                                                        onMouseDown={(e) => { e.preventDefault(); handleDragStart(date, timeSlot) }}
                                                                        onMouseEnter={() => { setHoveredCell(cellKey); handleDragEnter(date, timeSlot) }}
                                                                        onMouseLeave={() => setHoveredCell(null)}
                                                                        onTouchStart={(e) => { e.preventDefault(); handleDragStart(date, timeSlot) }}
                                                                        onTouchMove={handleTouchMove}
                                                                        className={`border p-2 cursor-pointer transition-colors relative rounded-[7px] select-none ${isSelected ? 'border-primary border-2' : 'border-border'}`}
                                                                        style={{
                                                                            backgroundColor: effectiveCount > 0
                                                                                ? `rgba(135, 40, 27, ${Math.min(effectiveCount / 5, 1) * 0.8})`
                                                                                : 'transparent'
                                                                        }}
                                                                    >
                                                                        {/* Tooltip on hover */}
                                                                        {hoveredCell === cellKey && (effectiveCount > 0) && (
                                                                            <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground border border-border rounded-md shadow-lg whitespace-nowrap text-xs">
                                                                                <div className="font-semibold mb-1">
                                                                                    {effectiveCount} {effectiveCount === 1 ? 'person' : 'people'} available:
                                                                                </div>
                                                                                {/* Show current user first if selected */}
                                                                                {isSelected && currentUserEmail && (
                                                                                    <div className="font-medium text-primary">You</div>
                                                                                )}
                                                                                {otherUsers.map((email, idx) => {
                                                                                    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                                                                                    return (
                                                                                        <div key={idx} className="text-muted-foreground">
                                                                                            {name}
                                                                                        </div>
                                                                                    )
                                                                                })}
                                                                                {/* Arrow pointer */}
                                                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                                                                    <div className="border-4 border-transparent border-t-popover"></div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                )
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                                {currentUid && (
                                    <div className="flex justify-end mt-4">
                                        <Button
                                            onClick={handleSaveAvailability}
                                            disabled={isSavingAvailability || !currentUid}
                                            className="bg-primary text-white hover:bg-primary/90"
                                        >
                                            {isSavingAvailability ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Availability'
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex items-center justify-center h-[490px] text-muted-foreground">
                                    {data ? 'Select dates or days to view the timetable' : 'Create a new timetable to get started'}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}