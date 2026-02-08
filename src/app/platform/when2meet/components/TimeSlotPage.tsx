'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { TimeSlot, TimeTableGrid, TimeTableDraft, ASHOKA_TIME_SLOTS, HOUR_SLOTS, THIRTY_MIN_SLOTS, TIMESLOT_COLOR } from '../types'
import { Check, Copy, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
    const [shareableLink, setShareableLink] = useState<string>('')
    const [isCopied, setIsCopied] = useState<boolean>(false)
    const [currentUid, setCurrentUid] = useState<string>('')

    const isOwner = data?.isOwner ?? true
    const isDisabled = !isOwner

    // Initialize state from data when component mounts or data changes
    useEffect(() => {
        if (data) {
            setTitle(data.title || '')
            setActiveConfig(data.grid.slotMode)
            setCustomDuration(data.grid.customSlotDuration)
            setOnlyShareOwnerAvail(data.grid.onlyShareOwnerAvail)
            setCurrentUid(data.grid.uid || '')

            // Set dates
            if (data.grid.startDate) {
                const startDateStr = new Date(data.grid.startDate).toISOString().split('T')[0]
                setStartDate(startDateStr)
            }
            if (data.grid.endDate) {
                const endDateStr = new Date(data.grid.endDate).toISOString().split('T')[0]
                setEndDate(endDateStr)
            }

            // If UID exists, set the shareable link
            if (data.grid.uid) {
                const baseUrl = window.location.origin
                setShareableLink(`${baseUrl}/when2meet/${data.grid.uid}`)
            }

            // Load blocked times for current user (if applicable)
            setSelectedSlots(new Set())
        }
    }, [data])

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

    // Generate date columns when start/end dates change
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)

            const diffTime = Math.abs(end.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays > 7) {
                alert('Maximum difference between dates is 7 days')
                setEndDate('')
                setDateColumns([])
                return
            }

            const dates: string[] = []
            const currentDate = new Date(start)

            while (currentDate <= end) {
                dates.push(new Date(currentDate).toISOString().split('T')[0])
                currentDate.setDate(currentDate.getDate() + 1)
            }

            setDateColumns(dates)
        } else {
            setDateColumns([])
        }
    }, [startDate, endDate])

    // Format date for display
    const formatDateDisplay = (dateStr: string) => {
        const date = new Date(dateStr)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        return {
            day: days[date.getDay()],
            date: `${months[date.getMonth()]} ${date.getDate()}`
        }
    }

    // Handle cell click
    const handleCellClick = (date: string, timeSlot: string) => {
        const key = `${date}-${timeSlot}`
        const newSelected = new Set(selectedSlots)

        if (newSelected.has(key)) {
            newSelected.delete(key)
        } else {
            newSelected.add(key)
        }

        setSelectedSlots(newSelected)
    }

    // Check if a cell is selected
    const isCellSelected = (date: string, timeSlot: string) => {
        return selectedSlots.has(`${date}-${timeSlot}`)
    }

    // Handle end date validation
    const handleEndDateChange = (value: string) => {
        if (isDisabled) return

        if (startDate && value) {
            const start = new Date(startDate)
            const end = new Date(value)

            if (end < start) {
                alert('End date must be after start date')
                return
            }
        }
        setEndDate(value)
    }

    // Generate shareable link
    const handleGenerateLink = async () => {
        if (!title.trim()) {
            alert('Please enter a title for your timetable')
            return
        }

        if (!startDate || !endDate) {
            alert('Please select start and end dates')
            return
        }

        setIsGeneratingLink(true)

        try {
            // Prepare timetable data
            const timetableData: TimeTableDraft = {
                title,
                grid: {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    slotMode: activeConfig,
                    customSlotDuration: customDuration,
                    owner: '', // Will be set by the API
                    users: data?.grid.users || [],
                    blockedTimes: data?.grid.blockedTimes || {},
                    onlyShareOwnerAvail: onlyShareOwnerAvail,
                    lockedTimes: data?.grid.lockedTimes || [],
                    uid: currentUid || '' // Will be generated if empty
                }
            }

            // Determine if this is a new timetable or an update
            const isUpdate = !!currentUid

            const response = await fetch('/api/platform/when2meet', {
                method: isUpdate ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    isUpdate
                        ? { uid: currentUid, timetable: timetableData }
                        : { timetable: timetableData }
                )
            })

            const result = await response.json()

            if (result.success) {
                const uid = isUpdate ? currentUid : result.uid
                const baseUrl = window.location.origin
                const link = `${baseUrl}/when2meet/${uid}`

                setShareableLink(link)
                setCurrentUid(uid)

                // If this was a new timetable, redirect to the UID URL
                if (!isUpdate) {
                    router.push(`/when2meet/${uid}`)
                }
            } else {
                alert(`Failed to generate link: ${result.error}`)
            }
        } catch (error) {
            console.error('Error generating link:', error)
            alert('An error occurred while generating the link')
        } finally {
            setIsGeneratingLink(false)
        }
    }

    // Copy link to clipboard
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareableLink)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
            alert('Failed to copy link to clipboard')
        }
    }

    const handleSendInvite = () => {
        // TODO: Implement send calendar invite logic
        console.log('Send calendar invite')
    }

    return (
        <div className="min-h-screen text-white p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex gap-[100px] justify-center items-start mt-20 border border-gray-700 p-10">
                    {/* Left Sidebar - Controls */}
                    <div className={`w-80 flex-shrink-0 space-y-6 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div>
                            <label className="block text-sm mb-2">Title</label>
                            <input
                                type="text"
                                placeholder="Meeting Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isDisabled}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-2">People on your draft</label>
                            <div className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-15">
                                {data?.grid.users && data.grid.users.length > 0 ? (
                                    <span className="text-sm text-gray-400">
                                        {data.grid.users.length} participant{data.grid.users.length !== 1 ? 's' : ''}
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-400">No participants yet</span>
                                )}
                            </div>
                        </div>

                        {/* Date inputs */}
                        <div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        disabled={isDisabled}
                                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => handleEndDateChange(e.target.value)}
                                        min={startDate}
                                        disabled={isDisabled}
                                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Slots config */}
                        <div>
                            <label className="block text-sm mb-2">Slots</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (!isDisabled) {
                                            setActiveConfig('ashoka')
                                            setShowCustomDropdown(false)
                                        }
                                    }}
                                    disabled={isDisabled}
                                    className={`w-[70px] px-2 py-2 rounded border border-gray-700 transition-colors text-xs ${activeConfig === 'ashoka'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-transparent text-gray-500 hover:bg-gray-800/50'
                                        } disabled:cursor-not-allowed`}
                                >
                                    Ashoka Timetable
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            if (!isDisabled) {
                                                setActiveConfig('custom')
                                                setShowCustomDropdown(!showCustomDropdown)
                                            }
                                        }}
                                        disabled={isDisabled}
                                        className={`w-[70px] px-2 py-2 rounded border border-gray-700 transition-colors text-xs ${activeConfig === 'custom'
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-transparent text-gray-500 hover:bg-gray-800/50'
                                            } disabled:cursor-not-allowed`}
                                    >
                                        Choose Slots
                                    </button>
                                    {showCustomDropdown && activeConfig === 'custom' && !isDisabled && (
                                        <div className="absolute top-full mt-1 left-0 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
                                            <button
                                                onClick={() => {
                                                    setCustomDuration(60)
                                                    setShowCustomDropdown(false)
                                                }}
                                                className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-white whitespace-nowrap text-sm"
                                            >
                                                1 hour
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCustomDuration(30)
                                                    setShowCustomDropdown(false)
                                                }}
                                                className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-white whitespace-nowrap text-sm"
                                            >
                                                30 mins
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {activeConfig === 'custom' && customDuration && (
                                <div className="mt-2 inline-block">
                                    <span className="px-3 py-1 rounded-full bg-yellow-200/20 text-yellow-300 text-xs">
                                        {customDuration === 60 ? '1 hour' : `${customDuration} mins`}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Checkbox option */}
                        <div>
                            <label className="flex items-start gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={onlyShareOwnerAvail}
                                    onChange={(e) => setOnlyShareOwnerAvail(e.target.checked)}
                                    disabled={isDisabled}
                                    className="mt-1 bg-gray-800 border border-gray-700 rounded disabled:cursor-not-allowed"
                                />
                                <span>Only share my chosen slots with people</span>
                            </label>
                        </div>

                        {/* Action buttons - only show for owner */}
                        {isOwner && (
                            <>
                                <Button
                                    onClick={handleGenerateLink}
                                    disabled={isGeneratingLink}
                                    className="w-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {isGeneratingLink ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        currentUid ? 'Update Link' : 'Generate Shareable Link'
                                    )}
                                </Button>

                                {/* Show shareable link if it exists */}
                                {shareableLink && (
                                    <div className="space-y-2">
                                        <label className="block text-sm">Shareable Link</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={shareableLink}
                                                readOnly
                                                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
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

                                <Button
                                    onClick={handleSendInvite}
                                    className="w-full bg-primary text-white hover:bg-primary/90"
                                >
                                    Send Calendar Invite
                                </Button>
                            </>
                        )}

                        {/* Save availability button for non-owners */}
                        {!isOwner && (
                            <Button
                                onClick={() => console.log('Save availability')}
                                className="w-full bg-primary text-white hover:bg-primary/90"
                            >
                                Save My Availability
                            </Button>
                        )}
                    </div>

                    {/* Right Side - Timetable */}
                    <div className="flex-1">
                        {dateColumns.length > 0 ? (
                            <div className="overflow-x-auto">
                                <div className="inline-block">
                                    <div className="h-[500px] overflow-y-auto border border-gray-700">
                                        <table className="w-full border-collapse">
                                            <thead className="sticky top-0 bg-[#1a1a1a] z-10">
                                                <tr>
                                                    <th className="border border-gray-700 p-2 w-[150px] bg-[#1a1a1a]">
                                                        Time
                                                    </th>
                                                    {dateColumns.map((date) => {
                                                        const { day, date: dateDisplay } = formatDateDisplay(date)
                                                        return (
                                                            <th key={date} className="border border-gray-700 p-2 w-[70px] bg-[#1a1a1a]">
                                                                <div className="text-sm">{day}</div>
                                                                <div className="text-xs text-gray-400">{dateDisplay}</div>
                                                            </th>
                                                        )
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allTimeSlots.map((timeSlot) => (
                                                    <tr key={timeSlot}>
                                                        <td className="border border-gray-700 p-2 text-sm bg-gray-900 sticky left-0 z-5">
                                                            {timeSlot}
                                                        </td>
                                                        {dateColumns.map((date) => (
                                                            <td
                                                                key={`${date}-${timeSlot}`}
                                                                onClick={() => handleCellClick(date, timeSlot)}
                                                                className={`border border-gray-700 p-6 cursor-pointer transition-colors hover:bg-gray-700 ${isCellSelected(date, timeSlot)
                                                                    ? `${TIMESLOT_COLOR}`
                                                                    : 'bg-transparent'
                                                                    }`}
                                                            >
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[500px] border border-gray-700 rounded text-gray-400">
                                {data ? 'Select start and end dates to view the timetable' : 'Create a new timetable to get started'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}