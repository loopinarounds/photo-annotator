// SignupForm.jsx
import { useState } from "react";
import { apiRequest } from "../api";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await apiRequest("/public/signup", {
      method: "POST",
      body: { email, password },
    });

    if (response.error) {
      alert(response.error);
    }

    const { token, userId } = response;

    localStorage.setItem("authToken", token);
    localStorage.setItem("userId", userId);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded"
          >
            Sign Up
          </button>
        </form>
        <div className="text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default Signup;
