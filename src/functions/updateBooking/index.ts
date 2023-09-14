import { errorHandler, zodValidation } from "@/middlewares"
import {
  UpdateBookingBody,
  UpdateBookingSchema
} from "@/types/updateBookingSchema"
import { sendResponse } from "@/utils"
import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser"
import { APIGatewayProxyEvent } from "aws-lambda"

import { getBookingById, updateBookingItem } from "./helpers"

type PathParameters = {
  bookingId: string
}

export const updateBooking = async (event: APIGatewayProxyEvent) => {
  const body = event.body as unknown as UpdateBookingBody
  const { bookingId } = event.pathParameters as unknown as PathParameters

  try {
    const booking = await getBookingById(bookingId)

    if (!booking || booking.length === 0) {
      return sendResponse(404, {
        success: false,
        message: `Booking with id ${bookingId} could not be found.`
      })
    }

    const updatedBooking = await updateBookingItem(booking, body)

    return sendResponse(200, {
      success: true,
      message: "Booking has successfully been updated",
      body,
      bookingId,
      booking
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
  .use(zodValidation(UpdateBookingSchema))
  .use(errorHandler())
  .handler(updateBooking)
