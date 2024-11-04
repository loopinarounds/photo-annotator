import { createClient, BaseUserMeta } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  authEndpoint: async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/liveblocks-auth",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to authenticate with Liveblocks");
      }

      return response.json();
    } catch (error) {
      console.error("Liveblocks authentication error:", error);
      throw error;
    }
  },
});
type Presence = {
  cursor: { x: number; y: number } | null;
  isTyping: boolean;
};

type Storage = {
  annotations: Array<{
    x: number;
    y: number;
    text: string;
    authorId: string;
  }>;
};

type UserMeta = BaseUserMeta & {
  name: string;
  email: string;
  avatar?: string;
};

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useStorage,
  useMutation,
} = createRoomContext<Presence, Storage, UserMeta>(client);
