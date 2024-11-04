import { useState, useEffect } from "react";
import type { Room, RoomsResponse } from "../types";
import { privateApiRequest } from "../api";
import Loading from "../components/Loading";
import { useUser } from "../hooks/useUser";

export function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();

  useEffect(() => {
    const getRooms = async () => {
      setLoading(true);

      if (!user?.id) {
        setLoading(false);
        return;
      }

      const response = await privateApiRequest<RoomsResponse>(
        `/${user.id}/rooms`
      );

      if (response.error) {
        alert(response.error);
        setLoading(false);
        return;
      }

      setRooms(Array.isArray(response.rooms) ? response.rooms : []);
      setLoading(false);
    };

    getRooms();
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1>Rooms</h1>
      {rooms.length === 0 ? (
        <p>No rooms found</p>
      ) : (
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>{room.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
