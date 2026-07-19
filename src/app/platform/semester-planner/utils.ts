/**
 * Formats a professor's name or list of names.
 * Handles email addresses (e.g. "name@domain.com" -> "Name") and comma-separated lists.
 * Capitalizes each word in the name.
 * 
 * @param nameString The raw professor name string from the data.
 * @returns The formatted name string.
 */
export const formatProfessorName = (nameString: string): string => {
    if (!nameString) return "TBA";

    // Split by comma in case of multiple professors
    const names = nameString.split(',').map(name => name.trim());

    return names.map(name => {
        let displayName = name;

        // specific fix for "Ashoka Edu In" trailing text if it exists in data incorrectly parsed previously
        // though the user example "Ekanto Ghosh@ashoka Edu In" implies the json might just have that string.
        // Let's handle standard email format first.

        if (name.includes("@")) {
            // Extract part before @
            displayName = name.split("@")[0];
        }

        // Replace dots with spaces (common in emails like firstname.lastname)
        displayName = displayName.replace(/\./g, ' ');

        // Capitalize each word
        return displayName
            .split(' ')
            .filter(part => part.length > 0)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    }).join(', ');
};

/**
 * Parses a time string (e.g. "10:10am", "1:20pm", "8:30am") into minutes since midnight.
 */
export const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.trim().match(/^(\d+):(\d+)(am|pm)$/i);
    if (!match) return 0;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toLowerCase();

    if (ampm === "pm" && hours < 12) {
        hours += 12;
    } else if (ampm === "am" && hours === 12) {
        hours = 0;
    }

    return hours * 60 + minutes;
};

/**
 * Checks if two time slots overlap.
 * Time slots can be in formats like "10:10am-1:20pm".
 * If a slot is not in that format (e.g., "LUNCH"), they must match exactly to overlap.
 */
export const slotsOverlap = (slotA: string, slotB: string): boolean => {
    if (slotA === slotB) return true;

    const partsA = slotA.split("-");
    const partsB = slotB.split("-");

    if (partsA.length !== 2 || partsB.length !== 2) {
        return slotA === slotB;
    }

    const startA = parseTimeToMinutes(partsA[0]);
    const endA = parseTimeToMinutes(partsA[1]);
    const startB = parseTimeToMinutes(partsB[0]);
    const endB = parseTimeToMinutes(partsB[1]);

    // Two time ranges overlap if startA < endB and startB < endA
    return startA < endB && startB < endA;
};
