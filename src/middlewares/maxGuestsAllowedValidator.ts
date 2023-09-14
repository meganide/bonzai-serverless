import { Booking, RoomType } from "@/types"
import { roomTypeInfo } from "@/utils"
import middy from "@middy/core"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import createHttpError from "http-errors"

export function maxGuestsAllowedValidator(): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> {
  return {
    before: async (handler) => {
      const { rooms, numberGuests } = handler.event.body as unknown as Booking

      let maxGuestsAllowed = 0
      Object.values(RoomType).forEach((roomType) => {
        maxGuestsAllowed += roomTypeInfo[roomType].maxGuests * rooms[roomType]
      })

      if (numberGuests > maxGuestsAllowed) {
        throw new createHttpError.BadRequest(
          `Number of guests (${numberGuests}) exceeds the maximum number of guests allowed (${maxGuestsAllowed}) in the chosen rooms.`
        )
      }
    }
  }
}
