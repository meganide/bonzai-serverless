export function isValidDateFormat(input: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD format
  return dateRegex.test(input)
}
