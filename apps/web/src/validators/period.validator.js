import { VALIDATION_ERRORS } from "../constants/validation.js";

export function validatePeriod(period) {
  const errors = {};
  if (!period.label || !period.label.trim()) {
    errors.label = VALIDATION_ERRORS.PERIOD_LABEL_REQUIRED;
  }
  
  if (period.startDate && period.endDate) {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    if (start >= end) {
      errors.dates = VALIDATION_ERRORS.PERIOD_DATES_INVALID;
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
}
