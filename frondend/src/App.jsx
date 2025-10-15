import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom"; // Thêm dòng này
import HomePage from "./pages/HomePage";
import SignUpForm from "./pages/SignUpForm";

export default function App() {
  return (
    <div className="font-sans">
      <Routes>
        {/* Tuyến đường mặc định cho HomePage */}
        <Route path="/" element={<HomePage />} />

        {/* Tuyến đường cho SignUpForm */}
        <Route path="/register" element={<SignUpForm />} />
      </Routes>
    </div>
  );
}