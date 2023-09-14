import { db } from "@/services"
import { UpdateBookingBody } from "@/types/updateBookingSchema"
import { sendResponse } from "@/utils"
import { ExpressionAttributeNameMap } from "aws-sdk/clients/dynamodb"

type Expression = {
  UpdateExpression: string
  ExpressionAttributeNames: ExpressionAttributeNameMap
  ExpressionAttributeValues: { [key: string]: any }
}

function createExpression(
  body:
    | Omit<UpdateBookingBody, "rooms">
    | Pick<UpdateBookingBody, "rooms">["rooms"]
) {
  let expression: Expression = {
    UpdateExpression: "SET",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {}
  }

  for (const [key, value] of Object.entries(body!)) {
    expression.UpdateExpression += ` #${key} = :${key},`
    expression.ExpressionAttributeNames[`#${key}`] = key
    expression.ExpressionAttributeValues[`:${key}`] = value
    if (key === "checkInDate") {
      expression.UpdateExpression += ` #GSI1SK = :skValue,`
      expression.ExpressionAttributeNames[`#GSI1SK`] = "GSI1SK"
      expression.ExpressionAttributeValues[`:skValue`] = value
    }
  }
  expression.UpdateExpression = expression.UpdateExpression.slice(0, -1) // remove ',' from last key value string
  return expression
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

export async function updateBookingItem(
  booking: Record<string, string>[],
  updateBookingBody: UpdateBookingBody
) {
  const { rooms, ...rest } = updateBookingBody
  const bookingId = booking[0].PK
  const bookingUpdateExpression = createExpression(rest)
  const roomUpdateExpression = createExpression(rooms)

  await db
    .transactWrite({
      TransactItems: [
        {
          Update: {
            TableName: "Bonzai",
            Key: { PK: bookingId, SK: bookingId },
            UpdateExpression: bookingUpdateExpression.UpdateExpression,
            ExpressionAttributeNames:
              bookingUpdateExpression.ExpressionAttributeNames,
            ExpressionAttributeValues:
              bookingUpdateExpression.ExpressionAttributeValues
          }
        }
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
