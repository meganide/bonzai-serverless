import { db } from "@/services"
import { EntityTypes, RoomItem, RoomType } from "@/types"
import { DocumentClient } from "aws-sdk/clients/dynamodb"

function shuffleArray<T>(array: T[]) {
  // Fisher-Yates shuffle algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

function createRoomParamsList() {
  const roomTypes: RoomType[] = [
    RoomType.SINGLE,
    RoomType.DOUBLE,
    RoomType.SUITE
  ]

  shuffleArray(roomTypes)

  const paramsList = []

  for (let i = 0; i < 20; i++) {
    const roomType = roomTypes[i % roomTypes.length] // Cycle through shuffled room types
    const params = {
      PutRequest: {
        Item: {
          PK: `r#${i + 1}`,
          SK: `r#${i + 1}`,
          GSI1PK: EntityTypes.ROOM,
          GSI1SK: roomType,
          EntityType: EntityTypes.ROOM,
          Type: roomType,
          MaxGuests:
            roomType === RoomType.SINGLE
              ? 1
              : roomType === RoomType.DOUBLE
              ? 2
              : 3,
          PricePerNight:
            roomType === RoomType.SINGLE
              ? 500
              : roomType === RoomType.DOUBLE
              ? 1000
              : 1500
        } as RoomItem
      }
    }

    paramsList.push(params)
  }

  return paramsList
}

export async function createRooms() {
  const paramsList = createRoomParamsList()

  await db
    .batchWrite({
      RequestItems: {
        Bonzai: [...paramsList]
      }
    })
    .promise()
}
