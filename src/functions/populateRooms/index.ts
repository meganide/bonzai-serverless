import { sendResponse } from "@/utils"
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda"
import { AWSError } from "aws-sdk/lib/error"

import { createRooms } from "./helpers"

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    await createRooms()

    return sendResponse(201, { sucess: true })
  } catch (error) {
    console.log(error)
    const awsError = error as AWSError
    return sendResponse(awsError.statusCode ?? 500, {
      success: false,
      message: awsError.message
    })
  }
}
