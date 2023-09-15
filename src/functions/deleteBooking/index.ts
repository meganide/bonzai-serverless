import { sendResponse } from "@/utils"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { HttpError } from "http-errors"

import { getBookingById } from "../updateBooking/helpers"
import { checkDatePolicy, deleteBooking } from "./helpers"

type PathParameters = {
  bookingId: string
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { bookingId } = event.pathParameters as unknown as PathParameters
    const requestDate = new Date().toISOString().split("T")[0]
    const booking = await getBookingById(bookingId)

    checkDatePolicy(booking[0].checkInDate, requestDate)

    await deleteBooking(booking)

    return sendResponse(200, {
      success: true,
      message: "Booking has successfully been deleted."
    })
  } catch (error: any) {
    console.log(error)
    if (error instanceof HttpError) {
      return sendResponse(error.statusCode, {
        success: false,
        message: error.message
      })
    }
    return sendResponse(500, {
      success: false,
      message: "Something went wrong. Booking could not be canceled."
    })
  }
}
