import { VALIDATION_ERRORS } from "../constants/validation.js";

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return VALIDATION_ERRORS.EMAIL_INVALID;
  }
  return null;
}

export function validatePassword(password) {
  if (password.length < 6) {
    return VALIDATION_ERRORS.PASSWORD_LENGTH;
  }
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (!hasNumber || !hasSpecial) {
    return VALIDATION_ERRORS.PASSWORD_STRENGTH;
  }
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (password !== confirmPassword) {
    return VALIDATION_ERRORS.PASSWORD_MISMATCH;
  }
  return null;
}
