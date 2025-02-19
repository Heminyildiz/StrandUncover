import React, { useState } from "react";

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
        {/* Başlık metninin rengi #92555B */}
        <h1 className="text-xl font-bold text-[#92555B]">
          Strand Uncover
        </h1>

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
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Zen
              </button>
              <button
                onClick={() => handleSelectMode("challenge")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
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










