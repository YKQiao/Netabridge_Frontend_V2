// Password and email validation utilities

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  checks: {
    minLength: boolean;
    maxLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

export function validatePassword(password: string): PasswordValidation {
  const checks = {
    minLength: password.length >= MIN_PASSWORD_LENGTH,
    maxLength: password.length <= MAX_PASSWORD_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const errors: string[] = [];
  if (!checks.minLength) errors.push('At least 12 characters');
  if (!checks.maxLength) errors.push('Maximum 128 characters');
  if (!checks.hasUppercase) errors.push('One uppercase letter');
  if (!checks.hasLowercase) errors.push('One lowercase letter');
  if (!checks.hasNumber) errors.push('One number');
  if (!checks.hasSpecial) errors.push('One special character');

  const passedChecks = Object.values(checks).filter(Boolean).length;
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (passedChecks >= 6) strength = 'strong';
  else if (passedChecks >= 4) strength = 'medium';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    checks,
  };
}

export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

// Email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
