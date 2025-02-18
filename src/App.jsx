import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import DailyGame from "./pages/DailyGame";
import ZenGame from "./pages/ZenGame";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/daily" replace />} />
          <Route path="/daily" element={<DailyGame />} />
          <Route path="/zen" element={<ZenGame />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;



