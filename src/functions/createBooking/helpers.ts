import { db } from "@/services"
import {
  Booking,
  EntityTypes,
  NumberOfRoomTypes,
  RoomItem,
  RoomItemTypes,
  RoomType
} from "@/types"
import { roomTypeInfo } from "@/utils"
import createHttpError from "http-errors"

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
  const { Items: rooms, Count } = await db
    .query({
      TableName: "Bonzai",
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pkValue",
      ExpressionAttributeValues: {
        ":pkValue": EntityTypes.ROOM
      }
    })
    .promise()

  if (!rooms || Count === 0) {
    throw new createHttpError.NotFound("Could not find any rooms.")
  }

  return rooms
}

export function filterRoomsByType(rooms: RoomItem[], type: RoomType) {
  return rooms.filter((room) => room.Type === type)
}

export function filterAllRoomTypes(
  rooms: RoomItem[],
  numberOfRooms: NumberOfRoomTypes
) {
  const roomTypes = {
    [RoomType.SINGLE]: filterRoomsByType(rooms, RoomType.SINGLE),
    [RoomType.DOUBLE]: filterRoomsByType(rooms, RoomType.DOUBLE),
    [RoomType.SUITE]: filterRoomsByType(rooms, RoomType.SUITE)
  }

  if (
    numberOfRooms.SINGLE > roomTypes.SINGLE.length ||
    numberOfRooms.DOUBLE > roomTypes.DOUBLE.length ||
    numberOfRooms.SUITE > roomTypes.SUITE.length
  ) {
    throw new createHttpError.BadRequest(
      "Can't book more rooms than the available amount."
    )
  }

  return roomTypes
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

function createBookingItemExpressions(
  bookingId: string,
  bookingInputs: Omit<Booking, "rooms">,
  availableRoomIds: string[]
) {
  const bookingItems = availableRoomIds.map((roomId) => ({
    PutRequest: {
      Item: {
        PK: "b#" + bookingId,
        SK: roomId,
        EntityType: EntityTypes.ROOM,
        GSI1PK: roomId,
        GSI1SK: "b#" + bookingId
      }
    }
  }))

  bookingItems.unshift({
    PutRequest: {
      Item: {
        PK: "b#" + bookingId,
        SK: "b#" + bookingId,
        GSI1PK: EntityTypes.BOOKING,
        GSI1SK: bookingInputs.checkInDate,
        EntityType: EntityTypes.BOOKING,
        ...bookingInputs,
        bookingNumber: bookingId,
        numberOfRooms: availableRoomIds.length
      } as any
    }
  })

  return bookingItems
}

export async function createBookingItems(
  bookingId: string,
  bookingInputs: Omit<Booking, "rooms">,
  availableRoomIds: string[]
) {
  const bookingItemExpressions = createBookingItemExpressions(
    bookingId,
    bookingInputs,
    availableRoomIds
  )

  await db
    .batchWrite({
      RequestItems: {
        Bonzai: bookingItemExpressions
      }
    })
    .promise()
}
