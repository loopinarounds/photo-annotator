import { useState, useEffect } from "react";
import type { Room, RoomsResponse } from "../types";
import { privateApiRequest } from "../api";
import Loading from "../components/Loading";
import { useUser } from "../hooks/useUser";

export function Home() {
  const [rooms, setRooms] = useState<Room[] | []>([]);
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
        `/${user?.id}/rooms`
      );

      if (response.error) {
        alert(response.error);
        setLoading(false);
        return;
      }
      setRooms(response.rooms);
      setLoading(false);
    };

    getRooms();
  }, [privateApiRequest, user]);

  if (loading) {
    return <Loading />;
  }

  if (rooms.length === 0) {
    return (
      <div>
        <h1>No rooms found</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
