import { db } from "@/services"
import { sendResponse } from "@/utils"
import { APIGatewayProxyEvent,APIGatewayProxyResult, Context } from "aws-lambda"


async function findMyBooking(partitionKey :number) {
  const params: any = {
    TableName: "Bonzai",
    KeyConditionExpression: 'PK = :partitionKey',
    ExpressionAttributeValues: {':partitionKey': 'b#' + partitionKey}
  }

  const {Items} = await db
    .query(params, (error, data) => {
      if (error) {
        console.log(error)
      } else {
        console.log(data)
      }
    })
    .promise()
return Items
}


export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { bookingId } = event.pathParameters
    const booking = await findMyBooking(bookingId)
    console.log("😀", booking)
    return sendResponse(200, { booking })
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "Something went wrong, could not get any events."
    })
  }
}
