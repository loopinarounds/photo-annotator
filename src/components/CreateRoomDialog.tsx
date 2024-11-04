import React, { useState } from "react";
import { privateApiRequest } from "../api";
import { useUser } from "../hooks/useUser";
import { RoomResponse } from "../types";

type CreateRoomDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreateRoomDialog({ isOpen, onClose }: CreateRoomDialogProps) {
  const [roomName, setRoomName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const user = useUser();

  const onSubmit = async (roomName: string, file: File | null) => {
    if (!user || !file) {
      alert("User or file not found");
      return;
    }

    console.log(file);
    const response = await privateApiRequest<RoomResponse>(`/create-room`, {
      method: "POST",
      body: {
        userId: user.id,
        name: roomName,
        file: File,
      },
    });

    if (response.error) {
      alert(response.error);
      return;
    }

    alert("Room created successfully");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(roomName, file);
    setRoomName("");
    setFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4 text-black">Create Room</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-black">Room Name</label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-black">Upload File</label>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded p-2 text-black"
              accept="image/*"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-red-300 text-gray-700 py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoomDialog;
