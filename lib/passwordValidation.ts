/**
 * Password and email validation utilities.
 *
 * These are used by the signup, set-password, and forgot-password pages.
 * All validation is purely client-side (UX only); the server re-validates.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordRequirements {
  hasMinLength: boolean;   // ≥ 8 characters
  hasUppercase: boolean;   // at least one uppercase letter
  hasLowercase: boolean;   // at least one lowercase letter
  hasNumber: boolean;      // at least one digit
  hasSpecial: boolean;     // at least one special character
}

export interface PasswordValidation extends ValidationResult {
  requirements: PasswordRequirements;
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) return { isValid: false, error: "Email is required" };
  if (!EMAIL_RE.test(trimmed))
    return { isValid: false, error: "Please enter a valid email address" };
  return { isValid: true };
}

// ---------------------------------------------------------------------------
// Password
// ---------------------------------------------------------------------------

export function validatePassword(password: string): PasswordValidation {
  const requirements: PasswordRequirements = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
  };

  const allMet = Object.values(requirements).every(Boolean);

  return {
    isValid: allMet,
    requirements,
    error: allMet ? undefined : "Password does not meet all requirements",
  };
}

// ---------------------------------------------------------------------------
// Confirm password
// ---------------------------------------------------------------------------

export function doPasswordsMatch(a: string, b: string): boolean {
  return a === b;
}
