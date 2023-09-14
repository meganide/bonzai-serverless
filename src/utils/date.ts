import dayjs, { Dayjs } from "dayjs"

export function getDaysBetween(laterDate: Dayjs, earlierDate: Dayjs) {
  return dayjs(laterDate).diff(dayjs(earlierDate), "day")
}
