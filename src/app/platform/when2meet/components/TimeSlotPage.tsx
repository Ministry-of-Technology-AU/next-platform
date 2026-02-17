'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TimeSlot, TimeTableGrid, TimeTableDraft, ASHOKA_TIME_SLOTS, HOUR_SLOTS, THIRTY_MIN_SLOTS, TIMESLOT_COLOR } from '../types'
import { CalendarIcon, Check, ChevronDownIcon, Copy, Loader2, Trophy, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TimeSlotPageProps {
    data: (TimeTableDraft & { isOwner: boolean }) | null
}

export default function TimeSlotPage({ data }: TimeSlotPageProps) {
    const router = useRouter()
    const [title, setTitle] = useState<string>('')
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [dateColumns, setDateColumns] = useState<string[]>([])
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
    const [activeConfig, setActiveConfig] = useState<TimeTableGrid['slotMode']>('ashoka')
    const [showCustomDropdown, setShowCustomDropdown] = useState<boolean>(false)
    const [customDuration, setCustomDuration] = useState<TimeTableGrid['customSlotDuration']>(60)
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

    const isOwner = data?.isOwner ?? true
    const isDisabled = !isOwner || !!currentUid

    // Fetch current user email
    useEffect(() => {
        async function fetchCurrentUser() {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'include' // Important: send cookies
                })

                if (response.ok) {
                    const result = await response.json()
                    console.log("User session data:", result)
                    if (result.email) {
                        setCurrentUserEmail(result.email)
                    }
                } else {
                    console.error('Failed to fetch user session:', response.status)
                    toast.error('Please log in to continue')
                }
            } catch (error) {
                console.error('Error fetching current user:', error)
                toast.error('Failed to fetch user session')
            }
        }
        fetchCurrentUser()
    }, [])

    // Initialize state from data when component mounts or data changes
    useEffect(() => {
        if (data) {
            setTitle(data.title || '')
            setActiveConfig(data.grid.slotMode)
            setCustomDuration(data.grid.customSlotDuration)
            setOnlyShareOwnerAvail(data.grid.onlyShareOwnerAvail)
            setCurrentUid(data.grid.uid || '')

            // Set participant emails from users array (filter out non-email entries like user IDs)
            setParticipantEmails((data.grid.users || []).filter((u: string) => u.includes('@')))

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
                        let dateStr: string
                        try {
                            // Use UTC methods to avoid timezone shift
                            const d = new Date(slot.date)
                            dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
                        } catch {
                            dateStr = String(slot.date).split('T')[0]
                        }
                        const timeSlot = `${slot.startTime}-${slot.endTime}`
                        selectedSet.add(`${dateStr}-${timeSlot}`)
                    })
                }

                setSelectedSlots(selectedSet)
            } else {
                setSelectedSlots(new Set())
            }
        }
    }, [data, currentUserEmail])

    // Generate date columns when dates change
    useEffect(() => {
        if (startDate && endDate) {
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
    }, [startDate, endDate])

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
                // Normalize the stored date to YYYY-MM-DD for comparison
                let slotDate: string
                try {
                    const d = new Date(slot.date)
                    slotDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
                } catch {
                    slotDate = String(slot.date).split('T')[0]
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
        const dateDisplay = `${date.getMonth() + 1}/${date.getDate()}`
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

            const parseTimeToDate = (timeStr: string, dateStr: string) => {
                const modifier = timeStr.slice(-2).toLowerCase(); // am or pm
                const timeOnly = timeStr.slice(0, -2); // e.g. "8:30"
                let [hours, minutes] = timeOnly.split(':').map(Number);
                if (isNaN(minutes)) minutes = 0;

                if (modifier === 'pm' && hours < 12) hours += 12;
                if (modifier === 'am' && hours === 12) hours = 0;

                // Parse date string parts to avoid timezone shifts
                const dateParts = dateStr.split('-').map(Number);
                // year, monthIndex (0-11), day, hours, minutes
                return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hours, minutes);
            };

            const startDt = parseTimeToDate(startRaw, slotDate);
            const endDt = parseTimeToDate(endRaw, slotDate);

            // Google Calendar Action TEMPLATE format: YYYYMMDDTHHmmSS
            const formatForGCal = (date: Date) => {
                const pad = (n: number) => String(n).padStart(2, '0');
                const y = date.getFullYear();
                const m = pad(date.getMonth() + 1);
                const d = pad(date.getDate());
                const hh = pad(date.getHours());
                const mm = pad(date.getMinutes());
                const ss = pad(date.getSeconds());
                return `${y}${m}${d}T${hh}${mm}${ss}`;
            };

            const dates = `${formatForGCal(startDt)}/${formatForGCal(endDt)}`;
            const add = invitees?.join(',') || '';

            const baseUrl = 'https://calendar.google.com/calendar/render';
            const params = new URLSearchParams({
                action: 'TEMPLATE',
                text: eventTitle,
                dates: dates,
                add: add,
                details: `Scheduled via When2Meet for ${slotDate} ${timeRange}.`,
                sf: 'true',
                output: 'xml'
            });

            window.open(`${baseUrl}?${params.toString()}`, '_blank');
        } catch (error) {
            console.error('Error generating calendar link:', error);
            toast.error('Failed to generate calendar invite');
        }
    }

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

        if (!startDate || !endDate) {
            toast.error('Please select start and end dates')
            return
        }

        setIsGeneratingLink(true)

        try {
            // Convert selected slots to TimeSlot format for owner's blocked times
            const ownerBlockedTimes: TimeSlot[] = []

            selectedSlots.forEach(cellKey => {
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
            })

            const timetable: TimeTableDraft = {
                title: title,
                grid: {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
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
                router.push(`/platform/when2meet/${uid}`)
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
                    <Card className="lg:w-80 h-[490px] overflow-y-auto">
                        <CardContent className="space-y-4 pt-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Event Title
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

                            {/* Date Range */}
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

                            {/* Time Slot Mode */}
                            <div className="space-y-2">
                                <Label>Time Slot Mode</Label>
                                <div className="space-y-2">
                                    <Button
                                        onClick={() => !isDisabled && setActiveConfig('ashoka')}
                                        disabled={isDisabled}
                                        variant={activeConfig === 'ashoka' ? 'default' : 'outline'}
                                        className="w-full"
                                    >
                                        Ashoka Schedule
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
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isOwner ? (
                                <>
                                    {!currentUid && (
                                        <Button
                                            onClick={handleGenerateLink}
                                            disabled={isGeneratingLink || !title.trim() || !startDate || !endDate}
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
                    <div className="lg:w-74 h-[490px] overflow-y-auto space-y-4 pr-2">
                        {/* Top TimeSlot */}
                        <Card className="h-fit">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Trophy className="h-5 w-5" />
                                    <span className="font-semibold text-sm">Top TimeSlot</span>
                                </div>
                                {(() => {
                                    if (!data?.grid.blockedTimes) return (
                                        <p className="text-sm text-muted-foreground">No availability data yet</p>
                                    )
                                    // Build a map of cellKey -> user count
                                    const slotCounts: Record<string, { date: string; timeSlot: string; count: number; users: string[] }> = {}
                                    Object.entries(data.grid.blockedTimes).forEach(([userEmail, slots]) => {
                                        if (!Array.isArray(slots)) return
                                        slots.forEach(slot => {
                                            let dateStr: string
                                            try {
                                                const d = new Date(slot.date)
                                                dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
                                            } catch {
                                                dateStr = String(slot.date).split('T')[0]
                                            }
                                            const key = `${dateStr}-${slot.startTime}-${slot.endTime}`
                                            if (!slotCounts[key]) {
                                                slotCounts[key] = { date: dateStr, timeSlot: `${slot.startTime}-${slot.endTime}`, count: 0, users: [] }
                                            }
                                            slotCounts[key].count++
                                            slotCounts[key].users.push(userEmail)
                                        })
                                    })
                                    const entries = Object.values(slotCounts)
                                    if (entries.length === 0) return (
                                        <p className="text-sm text-muted-foreground">No availability data yet</p>
                                    )
                                    const maxCount = Math.max(...entries.map(e => e.count))
                                    const topSlots = entries.filter(e => e.count === maxCount)
                                    const formatDate = (ds: string) => {
                                        const d = new Date(ds)
                                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                                        return `${days[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`
                                    }
                                    return (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {topSlots.map((slot, idx) => (
                                                <div key={idx} className="text-sm bg-muted px-3 py-2 rounded border border-border">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium">{formatDate(slot.date)}</div>
                                                            <div className="text-xs text-muted-foreground">{slot.timeSlot}</div>
                                                            <div className="text-xs text-primary font-medium mt-1">{slot.count} {slot.count === 1 ? 'person' : 'people'}</div>
                                                        </div>
                                                        {isOwner && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-xs h-7 px-2"
                                                                onClick={() => handleSendInvite(slot.date, slot.timeSlot, slot.users)}
                                                            >
                                                                Send Invite
                                                            </Button>
                                                        )}
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
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {participantEmails.map((email, idx) => {
                                            const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                                            return (
                                                <div
                                                    key={idx}
                                                    className="text-sm bg-muted px-3 py-2 rounded border border-border"
                                                >
                                                    <div className="font-medium">{name}</div>
                                                    <div className="text-xs text-muted-foreground">{email}</div>
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
                            <>
                                <Card className="flex-1 flex flex-col border-0 shadow-none">
                                    <CardContent className="p-0 flex-1">
                                        <div className="h-[490px] overflow-y-auto overflow-x-auto flex justify-center">
                                            <table className="border-separate" style={{ borderSpacing: '3px' }}>
                                                <thead className="sticky top-0 bg-card z-10">
                                                    <tr>
                                                        <th className="border border-border p-2 w-[150px] bg-card rounded-[3px]">
                                                            Time
                                                        </th>
                                                        {dateColumns.map((date) => {
                                                            const { day, date: dateDisplay } = formatDateDisplay(date)
                                                            return (
                                                                <th key={date} className="border border-border p-2 w-[60px] bg-card rounded-[3px]">
                                                                    <div className="text-sm">{day}</div>
                                                                    <div className="text-xs text-muted-foreground">{dateDisplay}</div>
                                                                </th>
                                                            )
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allTimeSlots.map((timeSlot) => (
                                                        <tr key={timeSlot}>
                                                            <td className="border border-border p-2 text-sm bg-muted sticky left-0 z-5 rounded-[3px]">
                                                                {timeSlot}
                                                            </td>
                                                            {dateColumns.map((date) => {
                                                                const cellKey = `${date}-${timeSlot}`
                                                                const blockedByUsers = getUsersWhoBlockedCell(date, timeSlot)
                                                                const userCount = blockedByUsers.length
                                                                const isSelected = isCellSelected(date, timeSlot)
                                                                // Count includes other users; if current user selected it, add 1 for visual intensity
                                                                const effectiveCount = userCount + (isSelected ? 1 : 0)

                                                                return (
                                                                    <td
                                                                        key={cellKey}
                                                                        onClick={() => handleCellClick(date, timeSlot)}
                                                                        onMouseEnter={() => setHoveredCell(cellKey)}
                                                                        onMouseLeave={() => setHoveredCell(null)}
                                                                        className={`border p-6 cursor-pointer transition-colors relative rounded-[3px] ${isSelected ? 'border-primary border-2' : 'border-border'}`}
                                                                        style={{
                                                                            backgroundColor: effectiveCount > 0
                                                                                ? `rgba(135, 40, 27, ${Math.min(effectiveCount / 5, 1) * 0.8})`
                                                                                : 'transparent'
                                                                        }}
                                                                    >
                                                                        {/* Tooltip on hover */}
                                                                        {hoveredCell === cellKey && blockedByUsers.length > 0 && (
                                                                            <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground border border-border rounded-md shadow-lg whitespace-nowrap text-xs">
                                                                                <div className="font-semibold mb-1">
                                                                                    {userCount} {userCount === 1 ? 'person' : 'people'} available:
                                                                                </div>
                                                                                {blockedByUsers.map((email, idx) => {
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
                            </>
                        ) : (
                            <Card>
                                <CardContent className="flex items-center justify-center h-[490px] text-muted-foreground">
                                    {data ? 'Select start and end dates to view the timetable' : 'Create a new timetable to get started'}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}