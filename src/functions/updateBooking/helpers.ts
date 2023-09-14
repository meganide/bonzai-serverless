import { db } from "@/services"
import { Booking, EntityTypes, RoomItem } from "@/types"
import {
  DocumentClient,
  ExpressionAttributeNameMap
} from "aws-sdk/clients/dynamodb"
import createHttpError from "http-errors"

type Expression = {
  UpdateExpression: string
  ExpressionAttributeNames: ExpressionAttributeNameMap
  ExpressionAttributeValues: { [key: string]: any }
}

export async function getBookingById(bookingId: string) {
  const params = {
    TableName: "Bonzai",
    KeyConditionExpression: "PK = :partitionKey",
    ExpressionAttributeValues: { ":partitionKey": "b#" + bookingId }
  }

  const { Items } = await db.query(params).promise()

  return Items
}

function getRoomIds(booking: Record<string, string>[]) {
  return booking
    .filter((booking) => booking.EntityType === EntityTypes.ROOM)
    .map((room) => room?.SK)
}

export async function updateBookingItem(
  booking: DocumentClient.ItemList,
  bookingInputs: Booking,
  availableRoomIds: string[]
) {
  const { PK: bookingId } = booking[0]
  const { numberGuests, checkInDate, checkOutDate } = bookingInputs

  const roomIds = getRoomIds(booking)

  const deleteRoomExpressions = roomIds.map((roomId) => ({
    Delete: {
      TableName: "Bonzai",
      Key: { PK: bookingId, SK: roomId }
    }
  }))

  const createRoomExpressions = availableRoomIds.map((roomId) => ({
    Put: {
      TableName: "Bonzai",
      Item: {
        PK: bookingId,
        SK: roomId,
        EntityType: EntityTypes.ROOM,
        GSI1PK: roomId,
        GSI1SK: bookingId
      }
    }
  }))

  try {
    await db
      .transactWrite({
        TransactItems: [
          {
            Update: {
              TableName: "Bonzai",
              Key: { PK: bookingId, SK: bookingId },
              UpdateExpression:
                "SET numberGuests = :numberGuests, checkInDate = :checkInDate, checkOutDate = :checkOutDate, GSI1SK = :GSI1SK",
              ExpressionAttributeValues: {
                ":numberGuests": numberGuests,
                ":checkInDate": checkInDate,
                ":checkOutDate": checkOutDate,
                ":GSI1SK": checkInDate
              },
              ConditionExpression: "attribute_exists(PK)"
            }
          },
          ...deleteRoomExpressions
        ]
      })
      .promise()

    await db
      .transactWrite({
        TransactItems: createRoomExpressions
      })
      .promise()
  } catch (error) {
    throw new createHttpError.BadRequest("Bad request.")
  }
}
