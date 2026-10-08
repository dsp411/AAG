/**
 * Account Username Validation & Formatting Rules:
 * 1. Only letters (a-z) and numbers (0-9) combinations
 * 2. Length must be between 3 and 10 characters
 * 3. No spaces or special characters allowed
 * 4. Case-insensitive / converted to lowercase
 * 5. Must be unique across all accounts
 */

export interface UsernameRuleStatus {
  noSpaces: boolean;
  validChars: boolean; // letters and numbers combinations
  noStartingPeriod: boolean;
  noEndingPeriod: boolean;
  noConsecutivePeriods: boolean;
  validLength: boolean; // 3-10 characters
  isAvailable: boolean;
}

export interface UsernameValidationResult {
  isValid: boolean;
  normalized: string;
  errorMessage?: string;
  rules: UsernameRuleStatus;
}

export function sanitizeAppUsername(input: string): string {
  if (!input) return '';
  // Convert to lowercase and strip all whitespace and non-alphanumeric chars
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export const sanitizeInstagramUsername = sanitizeAppUsername;

export function validateAppUsername(
  rawUsername: string,
  existingUsernames: string[] = [],
  currentUsername?: string
): UsernameValidationResult {
  const normalized = sanitizeAppUsername(rawUsername);

  const hasSpace = /\s/.test(rawUsername);
  // Strictly letters (a-z) and numbers (0-9)
  const validChars = /^[a-z0-9]+$/.test(normalized);
  const validLength = normalized.length >= 3 && normalized.length <= 10;

  const cleanCurrent = currentUsername?.toLowerCase().trim();
  const isSelf = cleanCurrent && cleanCurrent === normalized;
  const isAvailable =
    normalized.length === 0 ||
    isSelf ||
    !existingUsernames.some(u => u.toLowerCase() === normalized);

  const rules: UsernameRuleStatus = {
    noSpaces: !hasSpace,
    validChars: validChars && normalized.length > 0,
    noStartingPeriod: true,
    noEndingPeriod: true,
    noConsecutivePeriods: true,
    validLength,
    isAvailable,
  };

  let errorMessage: string | undefined;

  if (hasSpace) {
    errorMessage = 'Username cannot contain any spaces.';
  } else if (!normalized) {
    errorMessage = 'Username is required (3 to 10 letters or numbers).';
  } else if (normalized.length < 3) {
    errorMessage = 'Username is too short. Minimum 3 characters required.';
  } else if (normalized.length > 10) {
    errorMessage = 'Username is too long. Maximum 10 characters allowed.';
  } else if (!validChars) {
    errorMessage = 'Only letters (a-z) and numbers (0-9) combinations are allowed.';
  } else if (!isAvailable) {
    errorMessage = `@${normalized} is already taken. Please choose another username.`;
  }

  const isValid =
    rules.noSpaces &&
    rules.validChars &&
    rules.validLength &&
    rules.isAvailable;

  return {
    isValid,
    normalized,
    errorMessage,
    rules,
  };
}

export const validateInstagramUsername = validateAppUsername;
