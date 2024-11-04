import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { privateApiRequest } from "../api";
import { type Room } from "../types";
import Loading from "../components/Loading";
import { RoomViewWithLiveblocks } from "../components/RoomView";
import { useAuth } from "../hooks/useAuth";
import { type Annotation } from "../types";

export function Room() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const getRoom = async () => {
      if (!user) return;

      const [roomResponse, annotationsResponse] = await Promise.all([
        privateApiRequest<Room>(`/room/${roomId}`),
        privateApiRequest<{ annotations: Annotation[] }>(
          `/room/${roomId}/annotations`
        ),
      ]);

      if (roomResponse.error) {
        alert(roomResponse.error);
        return;
      }

      setRoom({
        ...roomResponse,
        annotations: annotationsResponse.annotations
          ? annotationsResponse.annotations.map((a) => ({
              ...a,
              createdAt: new Date(a.createdAt).toISOString(),
            }))
          : [],
      });
    };

    getRoom();
  }, [roomId, user]);

  if (!room) {
    return <Loading />;
  }

  return (
    <RoomViewWithLiveblocks
      id={room.id}
      image={room.imageUrl ?? undefined}
      name={room.name}
      ownerUserId={room.ownerUserId}
      participants={room.participants ?? []}
      initialAnnotations={room.annotations}
      currentUserId={user?.id}
    />
  );
}
