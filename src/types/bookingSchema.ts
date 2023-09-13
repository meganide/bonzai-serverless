import { RoomType } from "@/types"
import z from "zod"

export const BookingSchema = z.object({
  firstName: z
    .string({
      required_error: "First name is required.",
      invalid_type_error: "First name must be a string."
    })
    .min(1),
  lastName: z
    .string({
      required_error: "Last name is required.",
      invalid_type_error: "Last name must be a string."
    })
    .min(1),
  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string."
    })
    .email(),
  numberGuests: z
    .number({
      required_error: "Number of guests is required.",
      invalid_type_error: "Number of guests must be a number."
    })
    .min(1),
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

function isValidDateFormat(input: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD format
  return dateRegex.test(input)
}

const HasId = z.object({ id: z.string().min(1) })
const BookingWithIdSchema = BookingSchema.merge(HasId)

export type Booking = Required<z.infer<typeof BookingSchema>>
export type BookingWithId = Required<z.infer<typeof BookingWithIdSchema>>
export type RoomsAmount = Pick<Booking, "rooms">["rooms"]
