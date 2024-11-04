import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { Room } from "./pages/Room";
import { isLoggedIn } from "./auth";
import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  const loggedIn = isLoggedIn();

  // if (!loggedIn) {
  //   //TODO: Redirect to login page
  //   return (
  //     <div>
  //       <h1>Not logged in</h1>
  //     </div>
  //   );
  // }

  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/:roomId" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
