'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function WhenToMeetPage() {
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [dateColumns, setDateColumns] = useState<string[]>([])
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())

    // Define time slots
    const timeSlots = [
        '8:30am-10:00am',
        '10:10am-11:40am',
        '11:50am-1:20pm',
        '1:30pm-2:30pm',
        '2:30pm-3:00pm',
        '3:00pm-4:30pm',
        '4:40pm-6:10pm',
        '6:20pm-7:50pm',
    ]

    // Generate evening slots (8:00pm - 3:00am in 30-min intervals)
    const generateEveningSlots = () => {
        const slots = []
        let startHour = 20
        let startMin = 0

        while (startHour < 27) {
            const endMin = startMin + 30
            const endHour = startHour + Math.floor(endMin / 60)
            const finalEndMin = endMin % 60

            const formatTime = (hour: number, min: number) => {
                const adjustedHour = hour >= 24 ? hour - 24 : hour
                const period = adjustedHour >= 12 ? 'pm' : 'am'
                const displayHour = adjustedHour > 12 ? adjustedHour - 12 : adjustedHour === 0 ? 12 : adjustedHour
                return `${displayHour}:${min.toString().padStart(2, '0')}${period}`
            }

            slots.push(`${formatTime(startHour, startMin)}-${formatTime(endHour, finalEndMin)}`)

            startMin += 30
            if (startMin >= 60) {
                startMin = 0
                startHour += 1
            }
        }

        return slots
    }

    const allTimeSlots = [...timeSlots, ...generateEveningSlots()]

    // Generate date columns when start/end dates change
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)

            // Calculate difference in days
            const diffTime = Math.abs(end.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays > 7) {
                alert('Maximum difference between dates is 7 days')
                setEndDate('')
                setDateColumns([])
                return
            }

            // Generate array of dates
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

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-semibold text-center mb-6">When to Meet</h1>

                {/* Date inputs */}
                <div className="flex gap-4 mb-6 justify-center">
                    <div>
                        <label className="block text-sm mb-2">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            min={startDate}
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Only share my chosen slots with people</label>
                        <input
                            type="checkbox"
                            value={endDate}
                            // onChange={(e) => handleFormTimeSlotsSharingMode(e.target.value)}
                            min={startDate}
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                    </div>

                    <Button
                        // onClick={generateLink}
                        className="bg-primary text-white hover:bg-primary/90"
                    >
                        Generate Shareable Link
                    </Button>
                </div>

            </div>

            {/* Timetable */}
            {dateColumns.length > 0 && (
                <div className="overflow-x-auto">
                    <div className="inline-block">
                        <div className="h-[400px] overflow-y-auto border border-gray-700">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-[#1a1a1a] z-10">
                                    <tr>
                                        <th className="border border-gray-700 p-2 w-[150px] bg-[#1a1a1a]">
                                            Time
                                        </th>
                                        {dateColumns.map((date) => {
                                            const { day, date: dateDisplay } = formatDateDisplay(date)
                                            return (
                                                <th key={date} className="border border-gray-700 p-2 w-[10px] bg-[#1a1a1a]">
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
                                                        ? 'bg-green-600'
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
            )}
        </div>
    )
}