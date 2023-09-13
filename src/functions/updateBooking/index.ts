import { db } from "@/services"
import { sendResponse } from "@/utils"
import { APIGatewayProxyEvent } from "aws-lambda"

type PrimaryKey = number | string
interface ValidBodyRequest {
  NumberGuests?: number
  Type?: string
  CheckInDate?: string
  CheckOut?: string
}
async function updateMyBooking(
  partitionKey: PrimaryKey,
  sortKey: PrimaryKey,
  body: ValidBodyRequest
) {
  let exp = {
    UpdateExpression: "SET",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {}
  }

  // const params = {
  //   TableName: "bonzai",
  //   Key: { PK: partitionKey, SK: sortKey },
  //   UpdateExpression: `SET `
  // }
}

export const handler = async (event: APIGatewayProxyEvent) => {
  const body = JSON.parse(event.body)
  console.log(body)
  let exp = {
    UpdateExpression: "SET ",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {}
  }
  for (const [key, value] of Object.entries(body)) {
    // console.log(key, value)
    // console.log((exp.UpdateExpression += `#${key} = :${key},`))
    exp.UpdateExpression += `#${key} = :${key},`
    exp.ExpressionAttributeNames[`#${key}`] = key
    exp.ExpressionAttributeValues[`:${key}`] = value
  }
  exp.UpdateExpression = exp.UpdateExpression.slice(0, -1)
  console.log(exp)
  return exp
  try {
    return sendResponse(200, { test: "hej" })
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "Something went wrong, could not update booking."
    })
  }
}
