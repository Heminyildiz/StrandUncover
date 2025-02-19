import React from "react";
import { Routes, Route } from "react-router-dom";
import MainGame from "./pages/MainGame";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";

function App() {
  return (
    <Routes>
      {/* Ana oyunumuz */}
      <Route path="/" element={<MainGame />} />

      {/* Footer linkleri */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/contact" element={<Contact />} />

      {/* Catch-all => yönlendirme */}
      <Route path="*" element={<MainGame />} />
    </Routes>
  );
}

export default App;








