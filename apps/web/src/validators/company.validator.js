import { VALIDATION_ERRORS } from "../constants/validation.js";

export function validateCompany(company) {
  const errors = {};
  if (!company.name || !company.name.trim()) {
    errors.name = VALIDATION_ERRORS.COMPANY_NAME_REQUIRED;
  }
  if (!company.cin || !company.cin.trim()) {
    errors.cin = VALIDATION_ERRORS.COMPANY_CIN_REQUIRED;
  } else if (company.cin.trim().length !== 21) {
    errors.cin = VALIDATION_ERRORS.COMPANY_CIN_INVALID;
  }
  return Object.keys(errors).length > 0 ? errors : null;
}
