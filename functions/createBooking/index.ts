import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

<<<<<<< HEAD
import { sendResponse } from "../../responses/index.ts"
import { db } from "../../services/db.ts"
=======
import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser"

>>>>>>> 02e9246 (feat: add error handling middleware)
import { nanoid } from "nanoid"

import { sendResponse } from "../../responses/index.ts"
import { BookingSchema } from "../../types/schema.ts"
import { schemaValidation } from "../../middlewares/schemaValidation.ts"
import { errorHandlers } from "../../middlewares/errorHandler.ts"

const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = event.body
  const bookingId = nanoid()
  return sendResponse(200, { test: "hej" })
}

export const handler = middy(lambdaHandler)

handler
  .use(jsonBodyParser())
  .use(schemaValidation(BookingSchema))
  .use(errorHandlers)
  .handler(lambdaHandler)
