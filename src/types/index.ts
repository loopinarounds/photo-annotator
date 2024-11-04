export type Annotation = {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
};

export type LoginResponse = {
  token: string;
  userId: string;
  userEmail: string;
  error?: string;
};

export type RoomResponse = {
  room: Room;
  error?: string;
};

export type RoomsResponse = {
  rooms: Room[];
  error?: string;
};

export type User = {
  id: number;
  email: string;
  rooms: Room[];
};

export type Room = {
  id: number;
  name: string;
  ownerUserId: number;
  image: string;
  participants: User[];
};
