import { db } from "@/services"
import {
  Booking,
  EntityTypes,
  NumberOfRoomTypes,
  RoomItem,
  RoomItemTypes,
  RoomType
} from "@/types"
import { roomTypeInfo } from "@/utils/constants"

export function calculateMaxGuestsAllowed(rooms: NumberOfRoomTypes) {
  let maxGuestsAllowed = 0
  Object.values(RoomType).forEach((roomType) => {
    maxGuestsAllowed += roomTypeInfo[roomType].maxGuests * rooms[roomType]
  })
  return maxGuestsAllowed
}

export function calculateTotalRoomsBooked(rooms: NumberOfRoomTypes) {
  return Object.values(rooms).reduce((total, roomCount) => total + roomCount, 0)
}

export function calculateTotalPrice(
  totalDays: number,
  rooms: NumberOfRoomTypes
) {
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

export function filterRoomsByType(rooms: RoomItem[], type: RoomType) {
  return rooms.filter((room) => room.Type === type)
}

export function filterAllRoomTypes(rooms: RoomItem[]) {
  return {
    [RoomType.SINGLE]: filterRoomsByType(rooms, RoomType.SINGLE),
    [RoomType.DOUBLE]: filterRoomsByType(rooms, RoomType.DOUBLE),
    [RoomType.SUITE]: filterRoomsByType(rooms, RoomType.SUITE)
  }
}

export function getAvailableRoomIds(
  rooms: RoomItemTypes,
  numberOfRooms: NumberOfRoomTypes
) {
  const availableRoomIds: string[] = []
  const roomsCopy = structuredClone(rooms)
  for (const [roomType, amountRooms] of Object.entries(numberOfRooms)) {
    const rooms = roomsCopy[roomType as RoomType].splice(0, amountRooms)
    availableRoomIds.push(...rooms.map((room) => room.PK))
  }
  return availableRoomIds
}

export async function createBookingItems(
  bookingId: string,
  bookingInputs: Omit<Booking, "rooms">,
  availableRoomIds: string[]
) {
  const bookingItems = availableRoomIds.map((roomId) => ({
    PutRequest: {
      Item: {
        PK: bookingId,
        SK: roomId,
        EntityType: EntityTypes.ROOM,
        GSI1PK: roomId,
        GSI1SK: bookingId
      }
    }
  }))

  bookingItems.unshift({
    PutRequest: {
      Item: {
        PK: bookingId,
        SK: bookingId,
        EntityType: EntityTypes.BOOKING,
        ...bookingInputs
      } as any
    }
  })

  await db
    .batchWrite({
      RequestItems: {
        Bonzai: bookingItems
      }
    })
    .promise()
}
