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
  PK: string
  SK: string
  EntityType: string
  Type: RoomType
  MaxGuests: number
  PricePerNight: number
}
