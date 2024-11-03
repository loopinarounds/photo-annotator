import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { Room } from "./pages/Room";

function App() {
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:roomId" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
