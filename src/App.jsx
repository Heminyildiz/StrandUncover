import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DailyGame from "./pages/DailyGame";
import ZenGame from "./pages/ZenGame";
import Header from "./components/Header";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<DailyGame />} />
          <Route path="/zen" element={<ZenGame />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

