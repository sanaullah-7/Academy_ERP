export function errorResponse({ code, message, requestId, fieldErrors = null, details = null }) {
  const errorObj = {
    code,
    message,
  }

  if (fieldErrors && typeof fieldErrors === 'object' && Object.keys(fieldErrors).length > 0) {
    errorObj.fieldErrors = fieldErrors
  }

  if (Array.isArray(details) && details.length > 0) {
    errorObj.details = details
  }

  errorObj.requestId = requestId

  return {
    error: errorObj,
  }
}
