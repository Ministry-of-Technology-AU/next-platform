// Phone number type - must be a valid 10-digit Indian mobile number or null
export type PhoneNumber = string | null;

// Phone number validation result
export interface PhoneValidation {
  isValid: boolean;
  error?: string;
}

// Profile update request type for API
export interface ProfileUpdateRequest {
  phone_number?: PhoneNumber;
}

// API response types
export interface ProfileApiResponse {
  success: boolean;
  data?: UserData;
  error?: string;
  source?: 'session-only' | 'strapi-merged' | 'session-fallback';
  warning?: string;
}

// Legacy interface - now using inline types in component
// This matches the Strapi user structure
export interface UserProfile {
  id: number;
  email: string;
  username?: string;
  phone_number?: PhoneNumber;
  batch?: string;
  profile_image?: string;
  verified?: boolean;
}

export interface UserData {
  id: number;
  email: string;
  username?: string;
  phone_number?: PhoneNumber;
  batch?: string;
  profile_image?: string;
  verified?: boolean;
}

// Phone number validation utility
export const validatePhoneNumber = (phone: string): PhoneValidation => {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Empty is allowed
  }
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    return {
      isValid: false,
      error: "Phone number must be exactly 10 digits"
    };
  }
  
  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      error: "Phone number must start with 6, 7, 8, or 9"
    };
  }
  
  return { isValid: true };
};