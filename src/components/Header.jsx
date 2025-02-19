import React, { useState } from "react";

/**
 * Sadece "Zen" ve "Challenge" mod seçenekleri.
 * Buton renkleri #92555B ve boyutları eşitlendi.
 */
function Header({ mode, setMode }) {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(!open);
  const handleSelectMode = (m) => {
    setMode(m);
    setOpen(false);
  };

  return (
    <header className="bg-white p-4 shadow-sm w-full">
      <nav className="flex items-center justify-between container mx-auto relative">
        {/* Logo / Başlık */}
        <h1 className="text-xl font-bold text-brandPrimary">
          Strand Uncover
        </h1>

        {/* Sağ tarafta drop-down */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 rounded bg-[#92555B] text-white hover:opacity-80 transition"
          >
            {mode === "zen" ? "Zen" : "Challenge"}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded z-50">
              <button
                onClick={() => handleSelectMode("zen")}
                className="block w-full text-left px-4 py-2 hover:bg-brandLight"
              >
                Zen
              </button>
              <button
                onClick={() => handleSelectMode("challenge")}
                className="block w-full text-left px-4 py-2 hover:bg-brandLight"
              >
                Challenge
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;









