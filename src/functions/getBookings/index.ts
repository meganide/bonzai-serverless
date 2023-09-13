import { db } from "@/services"
import { sendResponse } from "@/utils"
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda"
import { AWSError } from "aws-sdk/lib/error"

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { Items: allBookings } = await db
      .scan({
        TableName: "Bonzai",
        FilterExpression: "begins_with(PK, :pk)",
        ExpressionAttributeValues: {
          ":pk": "b"
        }
      })
      .promise()

    return sendResponse(200, { sucess: true, allBookings })
  } catch (error) {
    console.log(error)
    if (error instanceof Error) {
      return sendResponse(500, {
        success: false,
        message: error.message
      })
    }
    const awsError = error as AWSError
    return sendResponse(awsError.statusCode ?? 500, {
      success: false,
      message: awsError.message
    })
  }
}
