import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { privateApiRequest } from "../api";
import { type Room } from "../types";
import Loading from "../components/Loading";
import RoomView from "../components/RoomView";
import { useAuth } from "../hooks/useAuth";

export function Room() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const getRoom = async () => {
      if (!user) return;

      const response = await privateApiRequest<Room>(`/room/${roomId}`);

      if (response.error) {
        alert(response.error);
        return;
      }

      setRoom(response);
    };

    getRoom();
  }, [roomId, user]);

  if (!room) {
    return <Loading />;
  }

  return (
    <RoomView
      id={room.id}
      image={room.image}
      name={room.name}
      ownerUserId={room.ownerUserId}
      participants={room.participants ?? []}
    />
  );
}
