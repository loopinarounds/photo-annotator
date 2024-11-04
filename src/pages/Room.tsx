import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { privateApiRequest } from "../api";
import { RoomResponse, type Room } from "../types";
import Loading from "../components/Loading";
import RoomView from "../components/RoomView";

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
    <>
      <RoomView
        id={room.id}
        image={room.image}
        name={room.name}
        ownerUserId={room.ownerUserId}
        participants={room.participants}
      />
    </>
  );
}
