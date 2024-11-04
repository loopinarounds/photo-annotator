import { useEffect, useState } from "react";
import { User } from "../types";

export const useUser = () => {
  const [user, setUser] = useState<Omit<User, "rooms"> | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");

    if (!id || !email) {
      return;
    }
    setUser({
      id: parseInt(id),
      email: email,
    });
  }, []);

  return user;
};
