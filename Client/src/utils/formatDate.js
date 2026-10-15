/**
 * Purpose: Will define format Date for the utils area of the Academy frontend.
 * Module: utils
 * Status: Implemented — local date-only formatting for date inputs and financial day boundaries.
 */

export function getLocalDateOnly(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
