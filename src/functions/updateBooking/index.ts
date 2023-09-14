import { errorHandler, zodValidation } from "@/middlewares"
import { Booking, BookingSchema, RoomItem } from "@/types"
import { sendResponse } from "@/utils"
import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser"
import { APIGatewayProxyEvent } from "aws-lambda"
import { AWSError } from "aws-sdk/lib/error"

import {
  calculateMaxGuestsAllowed,
  filterAllRoomTypes,
  getAvailableRoomIds,
  getRooms
} from "../createBooking/helpers"
import { getBookingById, updateBookingItem } from "./helpers"

type PathParameters = {
  bookingId: string
}

export const updateBooking = async (event: APIGatewayProxyEvent) => {
  const bookingInputs = event.body as unknown as Booking
  const { bookingId } = event.pathParameters as unknown as PathParameters

  try {
    const maxGuestsAllowed = calculateMaxGuestsAllowed(bookingInputs.rooms)
    if (bookingInputs.numberGuests > maxGuestsAllowed) {
      return sendResponse(400, {
        success: false,
        message: `Number of guests (${bookingInputs.numberGuests}) exceeds the maximum number of guests allowed (${maxGuestsAllowed}) in the chosen rooms.`
      })
    }

    const booking = await getBookingById(bookingId)

    if (!booking || booking.length === 0) {
      return sendResponse(404, {
        success: false,
        message: `Booking with the specified id ${bookingId} could not be found.`
      })
    }

    const availableRooms = (await getRooms()) as unknown as
      | RoomItem[]
      | undefined

    if (!availableRooms || availableRooms?.length == 0) {
      return sendResponse(404, {
        success: false,
        message: "Could not find any rooms."
      })
    }

    const roomsByType = filterAllRoomTypes(availableRooms)
    const {
      SINGLE: singleRooms,
      DOUBLE: doubleRooms,
      SUITE: suiteRooms
    } = roomsByType

    if (
      bookingInputs.rooms.SINGLE > singleRooms.length ||
      bookingInputs.rooms.DOUBLE > doubleRooms.length ||
      bookingInputs.rooms.SUITE > suiteRooms.length
    ) {
      return sendResponse(400, {
        success: false,
        message: "Can't book more rooms than the available amount."
      })
    }

    const availableRoomIds = getAvailableRoomIds(
      roomsByType,
      bookingInputs.rooms
    )

    await updateBookingItem(booking, bookingInputs, availableRoomIds)

    return sendResponse(200, {
      success: true,
      message: "Booking has successfully been updated."
    })
  } catch (error) {
    console.log(error)
    return sendResponse(500, {
      success: false,
      message: "Something went wrong, could not update booking."
    })
  }
}

export const handler = middy(updateBooking)
  .use(jsonBodyParser())
  .use(zodValidation(BookingSchema))
  .use(errorHandler())
  .handler(updateBooking)
