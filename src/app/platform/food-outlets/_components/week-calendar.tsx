"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeekCalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    onWeekChange: (startOfWeek: Date) => void;
    weekStart: Date;
}

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

export default function WeekCalendar({ selectedDate, onSelectDate, onWeekChange, weekStart }: WeekCalendarProps) {
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const weekDays = useMemo(() => {
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            days.push(d);
        }
        return days;
    }, [weekStart]);

    const monthYear = useMemo(() => {
        const months = weekDays.map(d => d.toLocaleDateString("en-US", { month: "short" }));
        const years = weekDays.map(d => d.getFullYear());
        const uniqueMonths = [...new Set(months)];
        const year = years[years.length - 1];
        return `${uniqueMonths.join(" / ")} ${year}`;
    }, [weekDays]);

    const prevWeek = () => {
        const prev = new Date(weekStart);
        prev.setDate(prev.getDate() - 7);
        onWeekChange(prev);
    };

    const nextWeek = () => {
        const next = new Date(weekStart);
        next.setDate(next.getDate() + 7);
        onWeekChange(next);
    };

    return (
        <div>
            {/* Month / Year + Navigation */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{monthYear}</h3>
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={prevWeek} className="h-8 w-8 p-0">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={nextWeek} className="h-8 w-8 p-0">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {DAY_LABELS.map(label => (
                    <div key={label} className="text-center text-xs font-medium text-muted-foreground">
                        {label}
                    </div>
                ))}
            </div>

            {/* Day numbers */}
            <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day, i) => {
                    const isToday = isSameDay(day, today);
                    const isSelected = isSameDay(day, selectedDate);

                    return (
                        <button
                            key={i}
                            onClick={() => onSelectDate(day)}
                            className={`
                relative flex items-center justify-center h-10 rounded-full text-sm font-medium transition-all
                ${isSelected && isToday
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : isSelected
                                        ? "bg-primary/10 text-primary ring-2 ring-primary"
                                        : isToday
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-foreground"
                                }
              `}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export { getMonday };
