import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

import { sendResponse } from "../../responses/index.ts"
import { db } from "../../services/db.ts"
import { nanoid } from "nanoid"
import { BookingSchema } from "../../types/schema.ts"
import { validateSchema } from "../../utils/schemaValidation.ts"

export const handler = async (
  event: APIGatewayProxyEvent,
  context: APIGatewayProxyResult
) => {
  if (!event.body) {
    return sendResponse(400, {
      success: false,
      message: "The request body is missing or empty."
    })
  }
  const body = JSON.parse(event.body)

  try {
    await validateSchema(BookingSchema, body)
    const bookingId = nanoid()

    return sendResponse(200, { test: "hej" })
  } catch (error) {
    console.log(error)
    return sendResponse(500, {
      success: false,
      message: "Something went wrong, could not get any events."
    })
  }
}
