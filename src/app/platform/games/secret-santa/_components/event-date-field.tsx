"use client"

import { useMemo, useState } from "react"
import { Clock } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { haptic } from "@/lib/haptics"

/** Half-hour slots from 8:00 AM to 11:30 PM, as "HH:MM". */
const SLOTS = Array.from({ length: 32 }, (_, i) => {
    const minutes = 8 * 60 + i * 30
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
})

const DEFAULT_TIME = "18:00"

function timeLabel(slot: string): string {
    const [h = 0, m = 0] = slot.split(":").map(Number)
    const period = h >= 12 ? "PM" : "AM"
    const hour = h % 12 === 0 ? 12 : h % 12
    return `${hour}:${String(m).padStart(2, "0")} ${period}`
}

function timeOf(date: Date): string {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

function compose(day: Date, slot: string): string {
    const [h = 18, m = 0] = slot.split(":").map(Number)
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m).toISOString()
}

interface EventDateFieldProps {
    /** ISO string, or "" when nothing is picked. */
    value: string
    onChange: (iso: string) => void
    id?: string
}

/**
 * Exchange date and time, built from the platform's DatePicker and Select. Times are in the
 * viewer's own time zone and sent as ISO.
 */
export function EventDateField({ value, onChange, id }: EventDateFieldProps) {
    const picked = useMemo(() => {
        const date = value ? new Date(value) : null
        return date && !Number.isNaN(date.getTime()) ? date : null
    }, [value])
    const [time, setTime] = useState(picked ? timeOf(picked) : DEFAULT_TIME)
    const slots = SLOTS.includes(time) ? SLOTS : [...SLOTS, time].sort()

    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <DatePicker
                id={id}
                date={picked}
                minDate={new Date()}
                clearable={false}
                placeholder="Pick a date"
                className="h-10"
                onChange={(day) => {
                    void haptic.select()
                    onChange(day ? compose(day, time) : "")
                }}
            />
            <Select
                value={time}
                onValueChange={(slot) => {
                    void haptic.select()
                    setTime(slot)
                    if (picked) onChange(compose(picked, slot))
                }}
            >
                <SelectTrigger className="h-10 w-full" aria-label="Time">
                    <Clock className="size-4 text-primary opacity-80" aria-hidden="true" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                    {slots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                            {timeLabel(slot)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
