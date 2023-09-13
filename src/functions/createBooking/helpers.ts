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
