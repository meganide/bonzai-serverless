import { errorHandler, zodValidation } from "@/middlewares"
import { Booking, BookingSchema, RoomItem } from "@/types"
import { sendResponse } from "@/utils"
import { getDaysBetween } from "@/utils"
import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import dayjs from "dayjs"
import { nanoid } from "nanoid"

import {
  calculateMaxGuestsAllowed,
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

  const maxGuestsAllowed = calculateMaxGuestsAllowed(numberOfRooms)
  if (bookingInputs.numberGuests > maxGuestsAllowed) {
    return sendResponse(400, {
      success: false,
      message: `Number of guests (${bookingInputs.numberGuests}) exceeds the maximum number of guests allowed (${maxGuestsAllowed}) in the chosen rooms.`
    })
  }

  const totalDaysBooked =
    getDaysBetween(
      dayjs(bookingInputs.checkOutDate),
      dayjs(bookingInputs.checkInDate)
    ) + 1

  const totalPrice = calculateTotalPrice(totalDaysBooked, numberOfRooms)

  try {
    const availableRooms = (await getRooms()) as unknown as
      | RoomItem[]
      | undefined

    if (!availableRooms || availableRooms?.length == 0) {
      return sendResponse(404, {
        success: false,
        message: "Could not find any rooms."
      })
    }

    const totalRoomsBooked = calculateTotalRoomsBooked(numberOfRooms)
    const roomsByType = filterAllRoomTypes(availableRooms)
    const {
      SINGLE: singleRooms,
      DOUBLE: doubleRooms,
      SUITE: suiteRooms
    } = roomsByType

    if (
      numberOfRooms.SINGLE > singleRooms.length ||
      numberOfRooms.DOUBLE > doubleRooms.length ||
      numberOfRooms.SUITE > suiteRooms.length
    ) {
      return sendResponse(400, {
        success: false,
        message: "Can't book more rooms than the available amount."
      })
    }

    const availableRoomIds = getAvailableRoomIds(roomsByType, numberOfRooms)

    await createBookingItems(bookingId, bookingInputs, availableRoomIds)

    return sendResponse(200, {
      success: true,
      booking: {
        bookingNumber: bookingId,
        firstName: bookingInputs.firstName,
        lastName: bookingInputs.lastName,
        checkInDate: bookingInputs.checkInDate,
        checkOutDate: bookingInputs.checkOutDate,
        numberRooms: totalRoomsBooked,
        price: totalPrice
      }
    })
  } catch (error) {
    console.log(error)
    return sendResponse(500, {
      success: false,
      message: "Something went wrong, could not create a booking."
    })
  }
}

export const handler = middy(createBooking)
  .use(jsonBodyParser())
  .use(zodValidation(BookingSchema))
  .use(errorHandler())
  .handler(createBooking)
