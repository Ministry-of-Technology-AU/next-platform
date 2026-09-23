// Academic Year Holidays & Semester Definitions
// All dates are in ISO format (YYYY-MM-DD)

export interface Holiday {
    date: string; // ISO format: YYYY-MM-DD
    name: string;
    type: 'holiday' | 'break' | 'special';
}

export interface Semester {
    name: string;
    start: string;
    end: string;
    classEnd: string;
}

// Active Academic Year Label used for Google Calendar EVENT_IDENTIFIER
export const ACADEMIC_YEAR_LABEL = '2026_2027';

// The overall date boundaries for checking events in Google Calendar
export const ACADEMIC_YEAR_BOUNDS = {
    start: '2026-08-24', // First semester start
    end: '2027-08-31',   // Last semester end (with cushion to the end of August)
};

// Semester boundaries and class end dates
export const SEMESTERS: Semester[] = [
    { name: 'Monsoon', start: '2026-08-24', end: '2026-12-12', classEnd: '2026-11-28' },
    { name: 'Spring', start: '2027-01-18', end: '2027-05-08', classEnd: '2027-04-24' },
    { name: 'Summer', start: '2027-07-05', end: '2027-08-13', classEnd: '2027-08-13' }
];

export const HOLIDAYS: Holiday[] = [
    // August 2026
    { date: '2026-08-15', name: 'Independence Day', type: 'holiday' },
    { date: '2026-08-26', name: 'Eid-e-Milad', type: 'holiday' },

    // September 2026
    { date: '2026-09-04', name: 'Janmashtami', type: 'holiday' },

    // October 2026
    { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', type: 'holiday' },
    // Monsoon Mid-term Break: 4 October - 11 October (Sunday - Sunday)
    { date: '2026-10-04', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2026-10-05', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2026-10-06', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2026-10-07', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2026-10-08', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2026-10-09', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2026-10-10', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2026-10-11', name: 'Monsoon Mid-term Break', type: 'break' },
    { date: '2026-10-20', name: 'Dussehra', type: 'holiday' },

    // November 2026
    { date: '2026-11-08', name: 'Diwali', type: 'holiday' },
    { date: '2026-11-09', name: 'Diwali', type: 'holiday' },
    { date: '2026-11-24', name: 'Guru Nanak Dev Jayanti', type: 'holiday' },

    // December 2026
    // Reading Week: 30 November - 5 December
    { date: '2026-11-30', name: 'Reading Week', type: 'break' },
    { date: '2026-12-01', name: 'Reading Week', type: 'break' },
    { date: '2026-12-02', name: 'Reading Week', type: 'break' },
    { date: '2026-12-03', name: 'Reading Week', type: 'break' },
    { date: '2026-12-04', name: 'Reading Week', type: 'break' },
    { date: '2026-12-05', name: 'Reading Week', type: 'break' },
    // Exam Week: 7 December - 12 December
    { date: '2026-12-07', name: 'Exam Week', type: 'break' },
    { date: '2026-12-08', name: 'Exam Week', type: 'break' },
    { date: '2026-12-09', name: 'Exam Week', type: 'break' },
    { date: '2026-12-10', name: 'Exam Week', type: 'break' },
    { date: '2026-12-11', name: 'Exam Week', type: 'break' },
    { date: '2026-12-12', name: 'Exam Week', type: 'break' },
    { date: '2026-12-25', name: 'Christmas', type: 'holiday' },

    // January 2027
    { date: '2027-01-01', name: 'New Year\'s Day', type: 'holiday' },
    { date: '2027-01-26', name: 'Republic Day', type: 'holiday' },

    // March 2027
    // Spring Mid-term Break: 7 March - 14 March (Sunday - Sunday)
    // Eid-ul-Fitr is on March 10, which falls inside the break
    { date: '2027-03-07', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2027-03-08', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2027-03-09', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2027-03-10', name: 'Spring Mid-term Break / Eid-ul-Fitr', type: 'break' },
    { date: '2027-03-11', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2027-03-12', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2027-03-13', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2027-03-14', name: 'Spring Mid-term Break', type: 'break' },
    { date: '2027-03-22', name: 'Holi', type: 'holiday' },
    { date: '2027-03-26', name: 'Good Friday', type: 'holiday' },

    // April / May 2027
    // Reading Week: 26 April - 1 May (Monday - Saturday)
    { date: '2027-04-26', name: 'Reading Week', type: 'break' },
    { date: '2027-04-27', name: 'Reading Week', type: 'break' },
    { date: '2027-04-28', name: 'Reading Week', type: 'break' },
    { date: '2027-04-29', name: 'Reading Week', type: 'break' },
    { date: '2027-04-30', name: 'Reading Week', type: 'break' },
    { date: '2027-05-01', name: 'Reading Week', type: 'break' },
    // Exam Week: 3 May - 8 May (Monday - Saturday)
    { date: '2027-05-03', name: 'Exam Week', type: 'break' },
    { date: '2027-05-04', name: 'Exam Week', type: 'break' },
    { date: '2027-05-05', name: 'Exam Week', type: 'break' },
    { date: '2027-05-06', name: 'Exam Week', type: 'break' },
    { date: '2027-05-07', name: 'Exam Week', type: 'break' },
    { date: '2027-05-08', name: 'Exam Week', type: 'break' },
];

// Helper function to check if a date is a holiday
export function isHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return HOLIDAYS.some(h => h.date === dateStr);
}

// Helper function to get holiday info for a date
export function getHolidayInfo(date: Date): Holiday | undefined {
    const dateStr = date.toISOString().split('T')[0];
    return HOLIDAYS.find(h => h.date === dateStr);
}

// Helper function to check if a date falls within the semester dates
export function isWithinSemester(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return SEMESTERS.some(s => dateStr >= s.start && dateStr <= s.end);
}

// Helper function to check if an event instance should be deleted (pruned).
// An event should be deleted if:
// 1. It falls on a holiday or break (e.g. mid-term break, reading week, exam week).
// 2. Or, it does not fall within the active class-running period of any semester.
export function shouldDeleteEvent(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];

    if (isHoliday(date)) return true;

    const isInClassPeriod = SEMESTERS.some(
        s => dateStr >= s.start && dateStr <= s.classEnd
    );

    return !isInClassPeriod;
}