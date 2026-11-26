"use client"

import { useEffect, useState } from "react"
import { CalendarHeart } from "lucide-react"
import { daysUntil } from "../utils"
import { Chip, type CHIP_TONE } from "./chip"

interface CountdownProps {
    eventDate: string
    tone?: keyof typeof CHIP_TONE
}

/** "12 days to go". Computed on the client so the server's clock and time zone never leak in. */
export function Countdown({ eventDate, tone = "onColour" }: CountdownProps) {
    const [days, setDays] = useState<number | null>(null)

    useEffect(() => {
        setDays(daysUntil(eventDate))
    }, [eventDate])

    const label = days === null ? "" : days === 0 ? "It's today" : days === 1 ? "1 day to go" : `${days} days to go`

    return (
        <Chip tone={tone} className="min-w-[6.5rem]">
            <CalendarHeart className="size-3.5" aria-hidden="true" />
            <span aria-live="polite">{label}</span>
        </Chip>
    )
}
