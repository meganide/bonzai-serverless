import { db } from "@/services"
import { getDaysBetween } from "@/utils"
import dayjs from "dayjs"
import createHttpError from "http-errors"

function createDeleteExpressions(booking: Record<string, string>[]) {
  return booking.map((bookingItem) => ({
    DeleteRequest: {
      TableName: "Bonzai",
      Key: { PK: bookingItem.PK, SK: bookingItem.SK }
    }
  }))
}

export async function deleteBooking(booking: Record<string, string>[]) {
  const deleteExpressions = createDeleteExpressions(booking)

  try {
    await db
      .batchWrite({
        RequestItems: {
          Bonzai: deleteExpressions
        }
      })
      .promise()
  } catch (error) {
    console.log(error)
  }
}

export function checkDatePolicy(checkInDate: string, requestDate: string) {
  const isCancelBookingAccepted = getDaysBetween(
    dayjs(checkInDate),
    dayjs(requestDate)
  )

  if (isCancelBookingAccepted <= 2) {
    throw new createHttpError.BadRequest(
      "Booking cannot be canceled less than 48 hours before check in"
    )
  }
}
