import { db } from "@/services"
import { sendResponse } from "@/utils"
import { APIGatewayProxyEvent } from "aws-lambda"

interface ValidBodyRequest {
  NumberGuests?: number
  Type?: string
  CheckInDate?: string
  CheckOut?: string
}
interface EmptyObj {
  [key: string | number]: any
}

interface Booking {
  primaryKey: number | string
  UpdateExpression: string
  ExpressionAttributeNames: {}
  ExpressionAttributeValues: {}
}
interface BookingId extends APIGatewayProxyEvent {
  bookingId: string | number
}

interface ValidBody extends APIGatewayProxyEvent {
  NumberGuests?: number
  Type?: string
  CheckInDate?: string
  CheckOut?: string
}

interface Expression {
  UpdateExpression: string
  ExpressionAttributeNames: { [key: string | number]: {} }
  ExpressionAttributeValues: { [key: string | number]: ValidBodyRequest }
}

function filterUnwantedProperties(body: ValidBodyRequest): ValidBodyRequest {
  const validProperties = ["NumberGuests", "Type", "CheckInDate", "CheckOut"]
  const validBody: EmptyObj = {}
  for (const property of validProperties) {
    if (body.hasOwnProperty(property)) {
      validBody[property] = body[property as keyof ValidBodyRequest]
    }
  }
  console.log(validBody)
  return validBody as ValidBodyRequest
}

function createExpression(body: ValidBodyRequest) {
  let expression: Expression = {
    UpdateExpression: "SET",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {}
  }

  for (const [key, value] of Object.entries(body)) {
    expression.UpdateExpression += ` #${key} = :${key},`
    expression.ExpressionAttributeNames[`#${key}`] = key
    expression.ExpressionAttributeValues[`:${key}`] = value
  }
  expression.UpdateExpression = expression.UpdateExpression.slice(0, -1) // remove ',' from last key value string
  console.log("💀expression", expression)
  return expression

  /* EXAMPLE */

  // TableName: 'Bonzai',
  // Key: { PK: 'b#2', SK: 'b#2' },
  // UpdateExpression: 'SET #NumberGuests = :NumberGuests, #CheckInDate = :CheckInDate, #Type = :Type',
  // ExpressionAttributeNames: {
  //   '#NumberGuests': 'NumberGuests',
  //   '#CheckInDate': 'CheckInDate',
  //   '#Type': 'Type'
  // },
  // ExpressionAttributeValues: {
  //   ':NumberGuests': 5,
  //   ':CheckInDate': '2022-09-14T12:06:51.977Z',
  //   ':Type': 'SUITE'
  // },
}

async function updateMyBooking(
  primaryKey,
  UpdateExpression,
  ExpressionAttributeNames,
  ExpressionAttributeValues
) {
  const params = {
    TableName: "Bonzai",
    Key: { PK: "b#" + primaryKey, SK: "b#" + primaryKey },
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW"
  }
  console.log("params", params)

  await db
    .update(params, (error, data) => {
      if (error) {
        console.log(error)
      } else {
        console.log("✅", data)
      }
    })
    .promise()
}

export const handler = async (event: APIGatewayProxyEvent) => {
  const body: ValidBody = JSON.parse(event.body!)
  const filteredRequest = filterUnwantedProperties(body)

  const { bookingId } = event.pathParameters as unknown as BookingId

  const {
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues
  } = createExpression(filteredRequest as ValidBodyRequest)

  try {
    const updatedBooking = await updateMyBooking(
      bookingId,
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    )
    return sendResponse(200, {
      success: true,
      message: "Booking has successfully been updated"
    })
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "Something went wrong, could not update booking."
    })
  }
}
