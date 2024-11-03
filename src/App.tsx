import "./App.css";
import { BrowserRouter, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>{/* <Route path="/" element={<Home />} /> */}</Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
