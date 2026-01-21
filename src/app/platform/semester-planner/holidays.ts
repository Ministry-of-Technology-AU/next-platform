// Academic Year 2025-2026 Holidays
// All dates are in ISO format (YYYY-MM-DD)

export interface Holiday {
    date: string; // ISO format: YYYY-MM-DD
    name: string;
    type: 'holiday' | 'break' | 'special';
}

export const HOLIDAYS_2025_2026: Holiday[] = [
    // August 2025
    { date: '2025-08-15', name: 'Independence Day', type: 'holiday' },

    // September 2025
    { date: '2025-09-05', name: 'Eid-e-Milad', type: 'holiday' },

    // October 2025
    { date: '2025-10-02', name: 'Mahatma Gandhi Jayanti/Dussehra', type: 'holiday' },
    { date: '2025-10-05', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2025-10-06', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2025-10-07', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2025-10-08', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2025-10-09', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2025-10-10', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2025-10-11', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2025-10-12', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2025-10-20', name: 'Diwali', type: 'holiday' },
    { date: '2025-10-21', name: 'Diwali', type: 'holiday' },

    // November 2025
    { date: '2025-11-05', name: 'Guru Nanak Dev Jayanti', type: 'holiday' },

    // December 2025
    { date: '2025-12-01', name: 'Reading Week', type: 'break' },
    { date: '2025-12-02', name: 'Reading Week', type: 'break' },
    { date: '2025-12-03', name: 'Reading Week', type: 'break' },
    { date: '2025-12-04', name: 'Reading Week', type: 'break' },
    { date: '2025-12-05', name: 'Reading Week', type: 'break' },
    { date: '2025-12-06', name: 'Reading Week', type: 'break' },
    { date: '2025-12-08', name: 'Exam Week', type: 'break' },
    { date: '2025-12-09', name: 'Exam Week', type: 'break' },
    { date: '2025-12-10', name: 'Exam Week', type: 'break' },
    { date: '2025-12-11', name: 'Exam Week', type: 'break' },
    { date: '2025-12-12', name: 'Exam Week', type: 'break' },
    { date: '2025-12-13', name: 'Exam Week', type: 'break' },
    { date: '2025-12-25', name: 'Christmas', type: 'holiday' },

    // January 2026
    { date: '2026-01-01', name: 'New Year\'s Day', type: 'holiday' },
    { date: '2026-01-26', name: 'Republic Day', type: 'holiday' },

    // March 2026
    { date: '2026-03-01', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2026-03-02', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2026-03-03', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2026-03-04', name: 'Spring Mid-term Break / Holi', type: 'break' },
    { date: '2026-03-05', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2026-03-06', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2026-03-07', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2026-03-08', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2026-03-20', name: 'Eid-ul-Fitr', type: 'holiday' },

    // April 2026
    { date: '2026-04-03', name: 'Good Friday', type: 'holiday' },
    { date: '2026-04-27', name: 'Reading Week', type: 'break' },
    { date: '2026-04-28', name: 'Reading Week', type: 'break' },
    { date: '2026-04-29', name: 'Reading Week', type: 'break' },
    { date: '2026-04-30', name: 'Reading Week', type: 'break' },

    // May 2026
    { date: '2026-05-01', name: 'Reading Week', type: 'break' },
    { date: '2026-05-02', name: 'Reading Week', type: 'break' },
    { date: '2026-05-04', name: 'Exam Week', type: 'break' },
    { date: '2026-05-05', name: 'Exam Week', type: 'break' },
    { date: '2026-05-06', name: 'Exam Week', type: 'break' },
    { date: '2026-05-07', name: 'Exam Week', type: 'break' },
    { date: '2026-05-08', name: 'Exam Week', type: 'break' },
    { date: '2026-05-09', name: 'Exam Week', type: 'break' },
];

// Helper function to check if a date is a holiday
export function isHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return HOLIDAYS_2025_2026.some(h => h.date === dateStr);
}

// Helper function to get holiday info for a date
export function getHolidayInfo(date: Date): Holiday | undefined {
    const dateStr = date.toISOString().split('T')[0];
    return HOLIDAYS_2025_2026.find(h => h.date === dateStr);
}

// Helper function to check if a date falls within the semester dates
export function isWithinSemester(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];

    // Monsoon Semester: 2025-08-25 to 2025-12-13
    const monsoonStart = '2025-08-25';
    const monsoonEnd = '2025-12-13';

    // Spring Semester: 2026-01-19 to 2026-05-09
    const springStart = '2026-01-19';
    const springEnd = '2026-05-09';

    return (dateStr >= monsoonStart && dateStr <= monsoonEnd) ||
        (dateStr >= springStart && dateStr <= springEnd);
}

// Helper function to check if a date is after April 2026
export function isAfterApril2026(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr > '2026-04-30';
}