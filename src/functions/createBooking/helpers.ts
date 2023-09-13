import { db } from "@/services"
import { Booking, RoomType, RoomsAmount } from "@/types"
import { roomTypeInfo } from "@/utils/constants"

export function calculateMaxGuestsAllowed(rooms: RoomsAmount) {
  let maxGuestsAllowed = 0
  Object.values(RoomType).forEach((roomType) => {
    maxGuestsAllowed += roomTypeInfo[roomType].maxGuests * rooms[roomType]
  })
  return maxGuestsAllowed
}

export function calculateTotalRoomsBooked(rooms: RoomsAmount) {
  return Object.values(rooms).reduce((total, roomCount) => total + roomCount, 0)
}

export function calculateTotalPrice(totalDays: number, rooms: RoomsAmount) {
  let totalPrice = 0
  Object.values(RoomType).forEach((roomType) => {
    totalPrice +=
      rooms[roomType] * roomTypeInfo[roomType].pricePerNight * totalDays
  })
  return totalPrice
}

export async function getRooms() {
  const { Items: rooms } = await db
    .query({
      TableName: "Bonzai",
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pkValue",
      ExpressionAttributeValues: {
        ":pkValue": "Room"
      }
    })
    .promise()
  return rooms
}
