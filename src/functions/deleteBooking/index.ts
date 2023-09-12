import { sendResponse } from "@/utils"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { DocumentClient } from "aws-sdk/clients/dynamodb"

import { db } from "../../services/db.ts"
import { RoomItem } from "../../types/types.ts"

const params: DocumentClient.BatchWriteItemInput = {
  RequestItems: {
    Bonzai: [
      {
        PutRequest: {
          Item: {
            entityType: "Room",
            type: "SINGLE",
            maxGuests: 1,
            pricePerNight: 500
          } as RoomItem
        }
      },
      {
        PutRequest: {
          Item: {
            entityType: "Room",
            type: "DOUBLE",
            maxGuests: 2,
            pricePerNight: 1000
          } as RoomItem
        }
      },
      {
        PutRequest: {
          Item: {
            entityType: "Room",
            type: "SUITE",
            maxGuests: 3,
            pricePerNight: 1500
          } as RoomItem
        }
      }
    ]
  }
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: APIGatewayProxyResult
) => {
  try {
    await db.batchWrite(params, (err, data) => {})
    return sendResponse(200, { test: "hej" })
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "Something went wrong, could not get any events."
    })
  }
}
