import React from "react";
import ReactDOM from "react-dom/client";
// 1. Menggunakan HashRouter agar aman dari Error 404 saat di-refresh di GitHub Pages
import { HashRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import History from "./pages/History.jsx";
import Home from "./pages/Home.jsx";
import Track from "./pages/Track.jsx";
import Booking from "./pages/Booking.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import { TrackProvider } from "./useTrack.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TrackProvider>
      {/* 2. HashRouter tidak membutuhkan properti basename */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />}>
            {/* Menggunakan index untuk halaman utama di dalam layout App */}
            <Route index element={<Home />} />
            <Route path="history" element={<History />} />
            <Route path="track" element={<Track />} />
            <Route path="booking" element={<Booking />} />
            <Route path="admin" element={<Admin />} />
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </HashRouter>
    </TrackProvider>
  </React.StrictMode>
);