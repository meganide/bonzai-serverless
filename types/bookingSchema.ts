import z from "zod"

import { RoomType } from "./types.ts"

export const BookingSchema = z.object({
  firstName: z.string({ required_error: "First name is required." }).min(1),
  lastName: z.string({ required_error: "Last name is required." }).min(1),
  email: z.string({ required_error: "Email is required." }).email(),
  numberGuests: z
    .number({ required_error: "Number of guests is required." })
    .min(1)
    .max(3),
  checkInDate: z
    .string({ required_error: "Check in date is required." })
    .refine(isValidDateFormat, {
      message: "Invalid date format. Use YYYY-MM-DD."
    }),
  checkOutDate: z
    .string({ required_error: "Check out date is required." })
    .refine(isValidDateFormat, {
      message: "Invalid date format. Use YYYY-MM-DD."
    }),
  rooms: z
    .object({
      [RoomType.SINGLE]: z.number().min(0),
      [RoomType.DOUBLE]: z.number().min(0),
      [RoomType.SUITE]: z.number().min(0)
    })
    .refine(
      (rooms) => {
        const sumRooms =
          rooms[RoomType.SINGLE] +
          rooms[RoomType.DOUBLE] +
          rooms[RoomType.SUITE]
        return sumRooms >= 1
      },
      {
        message: "You must book at least one room!"
      }
    )
    .optional()
    .refine((value) => value !== undefined, {
      message: "Rooms is required."
    })
})

export function isValidDateFormat(input: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD format
  return dateRegex.test(input)
}
