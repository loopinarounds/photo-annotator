import { useState } from "react";
import { privateApiRequest } from "../api";

type InviteUserDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
};

export function InviteUserDialog({
  isOpen,
  onClose,
  roomId,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await privateApiRequest<any>(
        `/${roomId}/invite-to-room`,
        {
          method: "POST",
          body: { email, roomId },
        }
      );

      if (response.error) {
        alert(response.error);
        return;
      }

      setEmail("");
      onClose();
      alert("User invited successfully");
    } catch (error) {
      alert("Failed to invite user");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Invite a user</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
