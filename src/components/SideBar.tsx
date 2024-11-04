import { useNavigate } from "react-router-dom";
import CreateRoomDialog from "./CreateRoomDialog";
import { useState } from "react";
import { privateApiRequest } from "../api";
import { useAuth } from "../hooks/useAuth";

export function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false);

  const openRoomDialog = () => {
    setIsCreateRoomDialogOpen(true);
  };

  const handleLogout = async () => {
    await privateApiRequest("/logout", {
      method: "POST",
    });
    navigate("/login");
  };

  return (
    <div className="w-64 h-full bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Welcome {user?.email}</h2>
      </div>
      <div className="flex-grow p-4">
        {" "}
        <nav className="flex-grow">
          <ul className="space-y-4">
            <li>
              <a href="/" className="block p-2 rounded hover:bg-gray-700">
                Home
              </a>
            </li>
            <li>
              <button
                className="block p-2 rounded hover:bg-gray-700"
                onClick={openRoomDialog}
              >
                Create a Room
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="p-4 mt-auto mb-4">
        {" "}
        {/* Added mb-4 for margin-bottom */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      <CreateRoomDialog
        isOpen={isCreateRoomDialogOpen}
        onClose={() => setIsCreateRoomDialogOpen(false)}
      />
    </div>
  );
}

export default Sidebar;
