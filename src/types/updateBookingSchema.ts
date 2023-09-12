import { z } from "zod"

import { RoomType } from "./types"

const updateBookingSchema = z.object({
  numberGuests: z
    .number({ invalid_type_error: "numberGuests must be a number" })
    .min(1)
    .optional(),
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
    .optional(),
  checkInDate: z
    .string({
      required_error: "Check in date is required.",
      invalid_type_error: "Check in date must be a string."
    })
    .refine(isValidDateFormat, {
      message: "Invalid date format. Use YYYY-MM-DD."
    }),
  checkOutDate: z
    .string({
      required_error: "Check out date is required.",
      invalid_type_error: "Check out date must be a string."
    })
    .refine(isValidDateFormat, {
      message: "Invalid date format. Use YYYY-MM-DD."
    })
})
