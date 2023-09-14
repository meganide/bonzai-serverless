import { db } from "@/services"
import { EntityTypes } from "@/types"
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
    const { Count: total, Items: bookings } = await db
      .query({
        TableName: "Bonzai",
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pkValue",
        ExpressionAttributeValues: {
          ":pkValue": EntityTypes.BOOKING
        }
      })
      .promise()

    return sendResponse(200, {
      sucess: true,
      total,
      bookings
    })
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
