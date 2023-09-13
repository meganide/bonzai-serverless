import { errorHandler, zodValidation } from "@/middlewares"
import { db } from "@/services"
import { Booking, BookingSchema, EntityTypes } from "@/types"
import { sendResponse } from "@/utils"
import { getDaysBetween } from "@/utils/date"
import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import dayjs from "dayjs"
import { nanoid } from "nanoid"

import {
  calculateMaxGuestsAllowed,
  calculateTotalPrice,
  calculateTotalRoomsBooked
} from "./helpers"

async function createBooking(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const bookingId = nanoid()
  const { rooms, ...bookingInputs } = event.body as unknown as Booking

  // --- TODO ---
  // Get corresponding roomIds for the rooms from DB and then map those in the batchWrite

  const maxGuestsAllowed = calculateMaxGuestsAllowed(rooms)
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

  const totalPrice = calculateTotalPrice(totalDaysBooked, rooms)

  const roomId = 3 // PLACEHOLDER

  try {
    await db
      .batchWrite({
        RequestItems: {
          Bonzai: [
            {
              PutRequest: {
                Item: {
                  PK: "b#" + bookingId,
                  SK: "b#" + bookingId,
                  EntityType: EntityTypes.BOOKING,
                  ...bookingInputs
                }
              }
            },
            {
              PutRequest: {
                Item: {
                  PK: "b#" + bookingId,
                  SK: "r#" + roomId,
                  EntityType: EntityTypes.ROOM,
                  GSI1PK: "r#" + roomId,
                  GSI1SK: "b#" + bookingId
                }
              }
            }
          ]
        }
      })
      .promise()

    return sendResponse(200, {
      success: true,
      booking: {
        bookingNumber: bookingId,
        firstName: bookingInputs.firstName,
        lastName: bookingInputs.lastName,
        checkInDate: bookingInputs.checkInDate,
        checkOutDate: bookingInputs.checkOutDate,
        numberRooms: calculateTotalRoomsBooked(rooms),
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
