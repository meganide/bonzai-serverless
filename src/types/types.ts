export enum RoomType {
  SINGLE = "SINGLE",
  DOUBLE = "DOUBLE",
  SUITE = "SUITE"
}

export enum EntityTypes {
  BOOKING = "Booking",
  ROOM = "Room"
}

export interface RoomItem {
  entityType: string
  type: string
  maxGuests: number
  pricePerNight: number
}
