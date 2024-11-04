import { Room } from "../types";

function RoomPreview({ file, name, participants }: Room) {
  const emails: string[] = participants.map((participant) => participant.email);

  return (
    <div className="flex items-center p-4 border rounded-lg shadow-md bg-white">
      <div className="flex-shrink-0">
        <img
          src={file}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
      </div>

      <div className="ml-4">
        <h2 className="text-lg font-semibold">{name}</h2>
        <ul className="mt-2">
          {emails.map((email, index) => (
            <li key={index} className="text-sm text-gray-600">
              {email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RoomPreview;
