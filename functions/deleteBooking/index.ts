import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { sendResponse } from "../../responses/index.ts"
import { db } from "../../services/db.ts"

async function findMyBooking(partitionKey, sortKey) {
  const params = {
    TableName: "Bonzai",
    Key: { PK: `b#${partitionKey}`, SK: `b#${sortKey}` }
  }

  const { Item } = await db
    .get(params, (error, data) => {
      if (error) {
        console.log(error)
      } else {
        console.log(data.Item)
      }
    })
    .promise()
  return Item
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: APIGatewayProxyResult
) => {
  try {
    const { bookingId } = event.pathParameters
    console.log(event)
    console.log("😂", bookingId)
    const test = await findMyBooking(bookingId, bookingId)
    console.log("😀", test)
    return sendResponse(200, { test: "hej" })
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "Something went wrong, could not get any events."
    })
  }
}
