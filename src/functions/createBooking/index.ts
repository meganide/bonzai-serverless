import { errorHandler, zodValidation } from "@/middlewares"
import { maxGuestsAllowedValidator } from "@/middlewares/maxGuestsAllowedValidator"
import { Booking, BookingSchema, RoomItem } from "@/types"
import { sendResponse } from "@/utils"
import { getDaysBetween } from "@/utils"
import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import dayjs from "dayjs"
import { HttpError } from "http-errors"
import { nanoid } from "nanoid"

import {
  calculateTotalPrice,
  calculateTotalRoomsBooked,
  createBookingItems,
  filterAllRoomTypes,
  getAvailableRoomIds,
  getRooms
} from "./helpers"

async function createBooking(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const bookingId = nanoid()
  const { rooms: numberOfRooms, ...bookingInputs } =
    event.body as unknown as Booking
  const { email, numberGuests, ...bookingResponse } = bookingInputs

  const totalDaysBooked =
    getDaysBetween(
      dayjs(bookingInputs.checkOutDate),
      dayjs(bookingInputs.checkInDate)
    ) + 1

  try {
    const availableRooms = (await getRooms()) as unknown as RoomItem[]
    const roomsByType = filterAllRoomTypes(availableRooms, numberOfRooms)
    const availableRoomIds = getAvailableRoomIds(roomsByType, numberOfRooms)
    await createBookingItems(bookingId, bookingInputs, availableRoomIds)

    return sendResponse(201, {
      success: true,
      booking: {
        bookingNumber: bookingId,
        ...bookingResponse,
        numberRooms: calculateTotalRoomsBooked(numberOfRooms),
        price: calculateTotalPrice(totalDaysBooked, numberOfRooms)
      }
    })
  } catch (error) {
    console.log(error)
    if (error instanceof HttpError) {
      return sendResponse(error.statusCode, {
        success: false,
        message: error.message
      })
    }
    return sendResponse(500, {
      success: false,
      message: "Something went wrong, could not create a booking."
    })
  }
}

export const handler = middy(createBooking)
  .use(jsonBodyParser())
  .use(zodValidation(BookingSchema))
  .use(maxGuestsAllowedValidator())
  .use(errorHandler())
  .handler(createBooking)
