import { Room } from "../types";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

interface RoomsListProps {
  rooms: Room[];
}

export function RoomsList({ rooms }: RoomsListProps) {
  const { user } = useAuth();

  const ownedRooms = rooms.filter((room) => room.ownerUserId === user?.id);
  const participantRooms = rooms.filter(
    (room) => room.ownerUserId !== user?.id
  );

  return (
    <div className="space-y-8 h-full overflow-y-auto">
      <section>
        <h2 className="text-xl font-semibold mb-4">Owned Maps</h2>
        {ownedRooms.length === 0 ? (
          <p className="text-gray-500">No owned maps</p>
        ) : (
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {ownedRooms.map((room) => (
              <li key={room.id} className="bg-white rounded-lg shadow p-4">
                <Link to={`/room/${room.id}`} className="hover:opacity-75">
                  {room.imageUrl && (
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full h-40 object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="font-medium">{room.name}</h3>
                  <p className="text-sm text-gray-500">
                    {room.participants?.length || 0} participants
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Participant Maps</h2>
        {participantRooms.length === 0 ? (
          <p className="text-gray-500">No participant maps</p>
        ) : (
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {participantRooms.map((room) => (
              <li key={room.id} className="bg-white rounded-lg shadow p-4">
                <Link to={`/room/${room.id}`} className="hover:opacity-75">
                  {room.imageUrl && (
                    <img
                      src={room.imageUrl}
                      alt={room.imageFileName || ""}
                      className="w-full h-40 object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="font-medium">{room.name}</h3>
                  <p className="text-sm text-gray-500">
                    {room.participants?.length || 0} participants
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
