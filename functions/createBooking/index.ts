import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { nanoid } from "nanoid"

import { errorHandler } from "../../middlewares/jsonErrorHandler.ts"
import { schemaValidation } from "../../middlewares/schemaValidation.ts"
import { sendResponse } from "../../responses/index.ts"
import { BookingSchema } from "../../types/bookingSchema.ts"

const createBooking = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = event.body
  const bookingId = nanoid()
  return sendResponse(200, { test: "hej" })
}

export const handler = middy(createBooking)
  .use(jsonBodyParser())
  .use(schemaValidation(BookingSchema))
  .use(errorHandler())
  .handler(createBooking)
