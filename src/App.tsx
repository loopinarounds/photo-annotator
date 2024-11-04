import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/home";
import { Room } from "./pages/Room";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { isLoggedIn } from "./auth";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const isAuthenticated = isLoggedIn();

  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute
                element={<Home />}
                isAuthenticated={isAuthenticated}
              />
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute
                element={<Room />}
                isAuthenticated={isAuthenticated}
              />
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
