export interface TimeSlot {
    date: Date,
    day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday",
    startTime: string,
    endTime: string
    slotMode: "default" | "ashoka" | "custom",
}

export interface TimeTableGrid {
    startDate: Date,
    endDate: Date,
    slotMode: "default" | "ashoka" | "custom",
    customSlotDuration: 30 | 60,
    owner: string,
    users: string[], // list of user ids
    blockedTimes: Record<string, TimeSlot[]>, // figure out how to represent user 
    onlyShareOwnerAvail: boolean,
    lockedTimes: TimeSlot[], // Times locked by the event owner,
    uid: string, // unique id for the timetable, can be generated using uuid
}

// Let the TimeTableGrid contain all the info of the config, this just has the title and the grid 
export interface TimeTableDraft {
    title: string,
    grid: TimeTableGrid
}

export interface TimeTableWithOwnership extends TimeTableDraft {
    isOwner: boolean;
}

export interface When2MeetPageProps {
    params: {
        uid?: string;
    };
}

export const TIMESLOT_COLOR = "bg-[#87281B]/20" // just use this at transparency 20% for all users so that the most selected slot appears darkest 

export const ASHOKA_TIME_SLOTS = [
    "8:30am-10:00am",
    "10:10am-11:40am",
    "11:50am-1:20pm",
    "1:30pm-2:30pm",
    "2:30pm-3:00pm",
    "3:00pm-4:30pm",
    "4:40pm-6:10pm",
    "6:20pm-7:50pm",
    "8:00pm-9:00pm",
    "9:00pm-10:00pm",
    "10:00pm-11:00pm",
    "11:00pm-12:00am",
    "12:00am-1:00am",
    "1:00am-2:00am",
    "2:00am-3:00am",
] as const;

export const HOUR_SLOTS = [
    "8:00am-9:00am",
    "9:00am-10:00am",
    "10:00am-11:00am",
    "11:00am-12:00pm",
    "12:00pm-1:00pm",
    "1:00pm-2:00pm",
    "2:00pm-3:00pm",
    "3:00pm-4:00pm",
    "4:00pm-5:00pm",
    "5:00pm-6:00pm",
    "6:00pm-7:00pm",
    "7:00pm-8:00pm",
    "8:00pm-9:00pm",
    "9:00pm-10:00pm",
    "10:00pm-11:00pm",
    "11:00pm-12:00am",
    "12:00am-1:00am",
    "1:00am-2:00am",
    "2:00am-3:00am",
] as const;

export const THIRTY_MIN_SLOTS = [
    "8:00am-8:30am",
    "8:30am-9:00am",
    "9:00am-9:30am",
    "9:30am-10:00am",
    "10:00am-10:30am",
    "10:30am-11:00am",
    "11:00am-11:30am",
    "11:30am-12:00pm",
    "12:00pm-12:30pm",
    "12:30pm-1:00pm",
    "1:00pm-1:30pm",
    "1:30pm-2:00pm",
    "2:00pm-2:30pm",
    "2:30pm-3:00pm",
    "3:00pm-3:30pm",
    "3:30pm-4:00pm",
    "4:00pm-4:30pm",
    "4:30pm-5:00pm",
    "5:00pm-5:30pm",
    "5:30pm-6:00pm",
    "6:00pm-6:30pm",
    "6:30pm-7:00pm",
    "7:00pm-7:30pm",
    "7:30pm-8:00pm",
    "8:00pm-8:30pm",
    "8:30pm-9:00pm",
    "9:00pm-9:30pm",
    "9:30pm-10:00pm",
    "10:00pm-10:30pm",
    "10:30pm-11:00pm",
    "11:00pm-11:30pm",
    "11:30pm-12:00am",
    "12:00am-12:30am",
    "12:30am-1:00am",
    "1:00am-1:30am",
    "1:30am-2:00am",
    "2:00am-2:30am",
    "2:30am-3:00am",
] as const;

export const CUSTOM_SLOT_DURATIONS = [30, 60] as const;
