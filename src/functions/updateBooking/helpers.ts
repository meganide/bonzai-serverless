import { db } from "@/services"
import { Booking } from "@/types"
import {
  DocumentClient,
  ExpressionAttributeNameMap
} from "aws-sdk/clients/dynamodb"

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

// async function getRoomIds(rooms) {

// }

export async function updateBookingItem(
  booking: DocumentClient.ItemList,
  bookingInputs: Booking
) {
  const { PK: bookingId, rooms } = booking[0]
  const { numberGuests, checkInDate, checkOutDate } = bookingInputs

  //   const roomIds = getRoomIds(rooms)

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
        }
        // {
        //   Delete: {
        //     TableName: "Bonzai",
        //     Key: { PK: "b#" + bookingId },
        //     ConditionExpression: "begins_with(SK, :prefix)",
        //     ExpressionAttributeValues: {
        //       ":prefix": "r#"
        //     }
        //   }
        // }
        // {
        //   Update: {
        //     TableName: "Bonzai",
        //     Key: { PK: "b#" + bookingId, SK: "b#" + bookingId },
        //     UpdateExpression: bookingUpdateExpression.UpdateExpression,
        //     ExpressionAttributeNames:
        //       bookingUpdateExpression.ExpressionAttributeNames,
        //     ExpressionAttributeValues:
        //       bookingUpdateExpression.ExpressionAttributeValues
        //   }
        // }
      ]
    })
    .promise()
}
