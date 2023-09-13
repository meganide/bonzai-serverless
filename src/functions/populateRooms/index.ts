import { db } from "@/services"
import { EntityTypes, RoomItem, RoomType } from "@/types"
import { sendResponse } from "@/utils"
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda"
import { DocumentClient } from "aws-sdk/clients/dynamodb"
import { AWSError } from "aws-sdk/lib/error"

function shuffleArray<T>(array: T[]) {
  // Fisher-Yates shuffle algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

const roomTypes: RoomType[] = [RoomType.SINGLE, RoomType.DOUBLE, RoomType.SUITE]
shuffleArray(roomTypes)

const paramsList: DocumentClient.BatchWriteItemInput[] = []

for (let i = 0; i < 20; i++) {
  const roomType = roomTypes[i % roomTypes.length] // Cycle through shuffled room types
  const params: DocumentClient.BatchWriteItemInput = {
    RequestItems: {
      Bonzai: [
        {
          PutRequest: {
            Item: {
              PK: `r#${i + 1}`,
              SK: `r#${i + 1}`,
              GSI1PK: EntityTypes.ROOM,
              GSI1SK: roomType,
              EntityType: EntityTypes.ROOM,
              Type: roomType,
              MaxGuests:
                roomType === RoomType.SINGLE
                  ? 1
                  : roomType === RoomType.DOUBLE
                  ? 2
                  : 3,
              PricePerNight:
                roomType === RoomType.SINGLE
                  ? 500
                  : roomType === RoomType.DOUBLE
                  ? 1000
                  : 1500
            } as RoomItem
          }
        }
      ]
    }
  }

  paramsList.push(params)
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(paramsList)
    for (const params of paramsList) {
      await db.batchWrite(params).promise()
    }

    return sendResponse(200, { sucess: true })
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
