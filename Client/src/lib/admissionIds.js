export function admissionNumberFromId(value) {
  if (typeof value !== 'string' || !/^ADM-(?:\d+|\d{1,3}(?:,\d{3})+)$/i.test(value)) return null
  const number = Number(value.slice(4).replaceAll(',', ''))
  return Number.isSafeInteger(number) && number > 0 ? number : null
}

export const formatAdmissionId = (number) => `ADM-${number.toLocaleString('en-US')}`
