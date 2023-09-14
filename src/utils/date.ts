import dayjs, { Dayjs } from "dayjs"

export function getDaysBetween(laterDate: Dayjs, earlierDate: Dayjs) {
  return dayjs(laterDate).diff(dayjs(earlierDate), "day")
}

export function isValidDateFormat(input: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD format
  return dateRegex.test(input)
}
