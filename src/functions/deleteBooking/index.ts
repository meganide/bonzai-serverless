import { db } from "@/services"
import { sendResponse } from "@/utils"
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda"

import { getBookingById } from "../updateBooking/helpers"

async function deleteBooking(partitionKey: number | string) {
  const params = {
    TableName: "Bonzai",
    Key: { PK: "b#" + partitionKey, SK: "b#" + partitionKey }
  }

  await db
    .delete(params, (error, data) => {
      if (error) {
        console.log(error)
      } else {
        console.log(data)
      }
    })
    .promise()
}

function cancelMyBooking(checkInDate: string): boolean {
  const twoDaysInMilliseconds = 24 * 60 * 60 * 1000 * 2 // 172800000 MS
  const bookedDateInMilliseconds = new Date(checkInDate).getTime() // booking CheckInDate in MS
  const now = new Date().getTime() // When request is sent to database, we get the request date in ms
  const distance = bookedDateInMilliseconds - now

  if (distance >= twoDaysInMilliseconds) {
    return true
  } else {
    return false
  }
}
type PathParameters = {
  bookingId: string
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { bookingId } = event.pathParameters as unknown as PathParameters
    const booking = await getBookingById(bookingId)

    if (!booking || !booking.length) {
      throw new Error("No booking found")
    }

    const cancelBooking = cancelMyBooking(booking[0].CheckInDate)

    if (cancelBooking) {
      await deleteBooking(bookingId)

      return sendResponse(200, {
        success: true,
        message: `Booking ${booking[0].PK} has successfully been canceled. `
      })
    }

    return sendResponse(404, {
      success: false,
      message:
        "Sorry! Check In is in less than 48 hours. It's not possible to cancel this booking"
    })
  } catch (error: any) {
    return sendResponse(500, {
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong. Booking could not be canceled."
    })
  }
}
