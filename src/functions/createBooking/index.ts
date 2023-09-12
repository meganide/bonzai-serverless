import { errorHandler, zodValidation } from "@/middlewares"
import { db } from "@/services"
import { Booking, BookingSchema, EntityTypes, RoomType } from "@/types"
import { sendResponse } from "@/utils"
import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { nanoid } from "nanoid"

const roomTypeInfo = {
  [RoomType.SINGLE]: {
    maxGuests: 1,
    pricePerNight: 500
  },
  [RoomType.DOUBLE]: {
    maxGuests: 2,
    pricePerNight: 1000
  },
  [RoomType.SUITE]: {
    maxGuests: 3,
    pricePerNight: 1500
  }
} as const

function calculateMaxGuestsAllowed(rooms: Pick<Booking, "rooms">["rooms"]) {
  let maxGuestsAllowed = 0
  Object.values(RoomType).forEach((roomType) => {
    maxGuestsAllowed += roomTypeInfo[roomType].maxGuests * rooms[roomType]
  })
  return maxGuestsAllowed
}

async function createBooking(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const bookingId = nanoid()
  const { rooms, ...bookingInputs } = event.body as unknown as Booking

  // --- TODO ---
  // Get all rooms and check number of guests for each room type.
  // Calculate the number of allowed guests by the sum of MAX_GUESTS (you get max guests for each room type from the DB) for each room * number of those rooms in booking
  // Compare against

  // Get corresponding roomIds from DB and then map those in the batchWrite

  const maxGuestsAllowed = calculateMaxGuestsAllowed(rooms)
  if (bookingInputs.numberGuests > maxGuestsAllowed) {
    return sendResponse(400, {
      success: false,
      message: `Number of guests (${bookingInputs.numberGuests}) exceeds the maximum number of guests allowed (${maxGuestsAllowed}) in the chosen rooms.`
    })
  }

  const numberOfDays = 2

  const totalPrice =
    rooms.SINGLE * roomTypeInfo[RoomType.SINGLE].pricePerNight * numberOfDays +
    rooms.DOUBLE * roomTypeInfo[RoomType.DOUBLE].pricePerNight * numberOfDays +
    rooms.SUITE * roomTypeInfo[RoomType.SUITE].pricePerNight * numberOfDays

  const roomId = 3

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
        numberRooms: 3,
        price: 5800
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
