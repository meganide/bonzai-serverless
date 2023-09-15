import { db } from "@/services"
import { EntityTypes } from "@/types"

export async function getBookings() {
  return await db
    .query({
      TableName: "Bonzai",
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pkValue",
      ExpressionAttributeValues: {
        ":pkValue": EntityTypes.BOOKING
      },
      ProjectionExpression:
        "bookingNumber, checkInDate, checkOutDate, numberGuests, numberOfRooms, firstName, lastName"
    })
    .promise()
}
