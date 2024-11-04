export type Annotation = {
  id: number;
  x: number;
  y: number;
  text: string;
  authorId: number;
  roomId: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    email: string;
  };
};

export type LoginResponse = {
  token: string;
  userId: string;
  userEmail: string;
  error?: string;
};

export type Room = {
  id: number;
  name: string;
  ownerUserId: number;
  liveblocksRoomId: string;
  imageUrl: string | null;
  imageFileName: string | null;
  createdAt: Date;
  updatedAt: Date;
  participants: Array<{
    id: number;
    email: string;
  }>;
  annotations: Annotation[];
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
  error?: string;
};
