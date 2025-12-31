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
