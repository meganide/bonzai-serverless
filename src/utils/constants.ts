import { RoomType } from "@/types"

export const roomTypeInfo = {
  [RoomType.SINGLE]: {
    maxGuests: 1,
    pricePerNight: 500
  },
  [RoomType.DOUBLE]: {
    maxGuests: 2,
    pricePerNight: 1000
  },
  [RoomType.SUITE]: {
    maxGuests: 3,
    pricePerNight: 1500
  }
} as const
