import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { privateApiRequest } from "../api";
import { RoomResponse, type Room } from "../types";
import Loading from "../components/Loading";

export function Room() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    const getRoom = async () => {
      const response = await privateApiRequest<RoomResponse>(`/room/${roomId}`);

      if (response.error) {
        alert(response.error);
        return;
      }
      setRoom(response.room);
    };

    getRoom();
  }, [roomId, privateApiRequest]);

  if (!room) {
    return <Loading />;
  }

  return (
    <div>
      <h1>Room {room.id}</h1>
    </div>
  );
}
