import { sendResponse } from "@/utils"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

export const handler = async (
  event: APIGatewayProxyEvent,
  context: APIGatewayProxyResult
) => {
  try {
    return sendResponse(200, { test: "hej" })
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "Something went wrong, could not get any events."
    })
  }
}
