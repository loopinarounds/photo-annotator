export type Annotation = {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
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
  file: string;
  participants: User[];
};
