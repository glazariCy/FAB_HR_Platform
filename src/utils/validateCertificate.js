// Letters, numbers, whitespace (spaces + line breaks) and basic address punctuation: , . -
// (a '-' at the end of [...] means a literal hyphen, not a range)
const ADDRESS_PATTERN = /^[a-zA-Z0-9\s,.-]+$/
const PURPOSE_MIN_LENGTH = 50
const EMPLOYEE_ID_PATTERN = /^\d+$/

// Formats a Date as 'YYYY-MM-DD' in the user's local time,
// the same format an <input type="date"> gives us.
function toDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayString() {
  return toDateString(new Date())
}

// Returns an object with one error message per invalid field.
// An empty object means the form is valid.
export function validateCertificate(values) {
  const errors = {}

  // 1. address_to: required + allowed characters
  const addressTo = values.address_to.trim()
  if (addressTo === '') {
    errors.address_to = 'Address to is required.'
  } else if (!ADDRESS_PATTERN.test(addressTo)) {
    errors.address_to = 'Address to may only contain letters, numbers, spaces and , . -'
  }

  // 2. purpose: required + at least 50 characters (trimmed)
  const purpose = values.purpose.trim()
  if (purpose === '') {
    errors.purpose = 'Purpose is required.'
  } else if (purpose.length < PURPOSE_MIN_LENGTH) {
    errors.purpose = `Purpose must be at least ${PURPOSE_MIN_LENGTH} characters (currently ${purpose.length}).`
  }

  // 3. issued_on: required + today or later
  // 'YYYY-MM-DD' strings compare correctly as plain text
  const issuedOn = values.issued_on.trim()
  if (issuedOn === '') {
    errors.issued_on = 'Issued on is required.'
  } else if (issuedOn < getTodayString()) {
    errors.issued_on = 'Issued on cannot be in the past.'
  }

  // 4. employee_id: required + digits only
  const employeeId = values.employee_id.trim()
  if (employeeId === '') {
    errors.employee_id = 'Employee ID is required.'
  } else if (!EMPLOYEE_ID_PATTERN.test(employeeId)) {
    errors.employee_id = 'Employee ID must contain numbers only.'
  }

  return errors
}
