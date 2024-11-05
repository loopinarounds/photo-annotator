import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { privateApiRequest } from "../api";
import { type Room as RoomType } from "../types";
import Loading from "../components/Loading";
import { RoomViewWithLiveblocks } from "../components/RoomView";
import { useAuth } from "../hooks/useAuth";
import { type Annotation } from "../types";

export function Room() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const getRoom = async () => {
      if (!user) return;

      const [roomResponse, annotationsResponse] = await Promise.all([
        privateApiRequest<RoomType>(`/room/${roomId}`),
        privateApiRequest<Annotation[]>(`/room/${roomId}/annotations`),
      ]);

      if (roomResponse.error) {
        alert(roomResponse.error);
        return;
      }

      setRoom(roomResponse);
      setAnnotations(annotationsResponse || []);
    };

    getRoom();
  }, [roomId, user]);

  if (!room) {
    return <Loading />;
  }

  return (
    <RoomViewWithLiveblocks
      id={room.id}
      imageUrl={room.imageUrl!}
      name={room.name}
      participants={room.participants ?? []}
      currentUserId={user?.id}
      initialAnnotations={annotations}
    />
  );
}
