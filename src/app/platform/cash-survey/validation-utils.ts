import { CASHSurveyData } from "./types";
import { REQUIRED_FIELDS, CONDITIONAL_REQUIRED_FIELDS } from "./validation-config";

/**
 * Check if a field value is empty
 */
function isEmpty(value: any): boolean {
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "number") return value === undefined || value === null;
  return value === null || value === undefined;
}

/**
 * Get the required fields for a specific section, including conditional requirements
 */
function getRequiredFieldsForSection(
  sectionKey: string,
  sectionData: any
): Set<string> {
  const requiredFields = new Set(REQUIRED_FIELDS[sectionKey] || []);
  const conditionalFields = CONDITIONAL_REQUIRED_FIELDS[sectionKey] || {};

  // Check conditional requirements
  for (const [triggerField, conditions] of Object.entries(conditionalFields)) {
    const triggerValue = sectionData[triggerField];

    // Handle array values (multiple selections)
    if (Array.isArray(triggerValue)) {
      for (const value of triggerValue) {
        const conditionalReqs = conditions[value];
        if (conditionalReqs) {
          conditionalReqs.forEach((field) => requiredFields.add(field));
        }
      }
    } else {
      // Handle string values (single selections)
      const conditionalReqs = conditions[triggerValue];
      if (conditionalReqs) {
        conditionalReqs.forEach((field) => requiredFields.add(field));
      }
    }
  }

  return requiredFields;
}

/**
 * Validate if a section is complete (all required fields are filled)
 */
export function isSectionComplete(
  sectionKey: string,
  sectionData: any
): boolean {
  if (!sectionData) return false;

  const requiredFields = getRequiredFieldsForSection(sectionKey, sectionData);

  // Check if all required fields have values
  for (const field of requiredFields) {
    const value = sectionData[field];
    if (isEmpty(value)) {
      return false;
    }
  }

  return true;
}

/**
 * Get a human-readable list of missing required fields
 */
export function getMissingFields(
  sectionKey: string,
  sectionData: any
): string[] {
  if (!sectionData) return [];

  const requiredFields = getRequiredFieldsForSection(sectionKey, sectionData);
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = sectionData[field];
    if (isEmpty(value)) {
      missingFields.push(field);
    }
  }

  return missingFields;
}
