import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import "./index.css"
import History from "./pages/History.jsx";
import Home from "./pages/Home.jsx";
import Track from "./pages/Track.jsx"
import Booking from "./pages/Booking.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import { TrackProvider } from "./useTrack.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TrackProvider>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="history" element={<History />} />
            <Route path="track" element={<Track />} />
            <Route path="booking" element={<Booking />}></Route>
            <Route path="admin" element={<Admin />}></Route>
            <Route path="login" element={<Login />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </TrackProvider>
  </React.StrictMode>
);