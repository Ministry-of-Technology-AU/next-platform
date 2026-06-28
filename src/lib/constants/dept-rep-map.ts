// Maps department representative emails to their department codes
// Used for authorization in rep dashboard

export const REP_TO_DEPT: Record<string, string> = {
    // "vansh.bothra_ug25@ashoka.edu.in": "CS",
    "cs.rep@ashoka.edu.in": "CS",
    // "soham.tulsyan_ug2023@ashoka.edu.in": "CS",
    "phys.rep@ashoka.edu.in": "PHY",
    "math.rep@ashoka.edu.in": "MATH",
    "biology_ugrep@ashoka.edu.in": "BIO",
    "econreps@ashoka.edu.in": "ECO",
    "english.rep@ashoka.edu.in": "ENG",
    "historyrepresentatives@ashoka.edu.in": "HIST",
    "psy.rep@ashoka.edu.in": "PSY",
    "soa.rep@ashoka.edu.in": "SOC",
    "polsci.rep@ashoka.edu.in": "POL",
    "chem.rep@ashoka.edu.in": "CHM",
    "philosophy.rep@ashoka.edu.in": "PHIL",
}

// Get department code for a rep email
export function getDeptForRep(email: string): string | null {
    return REP_TO_DEPT[email.toLowerCase()] ?? null
}

// Check if an email is a valid rep
export function isValidRep(email: string): boolean {
    return email.toLowerCase() in REP_TO_DEPT
}

// Department display names
export const DEPT_NAMES: Record<string, string> = {
    "CS": "Computer Science",
    "PHY": "Physics",
    "MATH": "Mathematics",
    "BIO": "Biology",
    "ECO": "Economics",
    "ENG": "English",
    "HIST": "History",
    "PSY": "Psychology",
    "SOC": "Sociology/Anthropology",
    "POL": "Political Science",
    "CHM": "Chemistry",
    "PHIL": "Philosophy",
}
