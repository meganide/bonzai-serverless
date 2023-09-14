import { sendResponse } from "@/utils"
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda"
import { AWSError } from "aws-sdk/lib/error"

import { getBookings } from "./helpers"

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { Count: total, Items: bookings } = await getBookings()

    return sendResponse(200, {
      sucess: true,
      total,
      bookings
    })
  } catch (error) {
    console.log(error)
    const awsError = error as AWSError
    return sendResponse(awsError.statusCode ?? 500, {
      success: false,
      message: awsError.message
    })
  }
}
