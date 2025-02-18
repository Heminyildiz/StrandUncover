import React, { useState } from "react";

function Header({ mode, setMode }) {
  const [open, setOpen] = useState(false);

  const handleToggleDropdown = () => {
    setOpen(!open);
  };

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
    setOpen(false);
  };

  return (
    <header className="bg-white p-4 shadow-sm w-full">
      <nav className="flex items-center justify-between container mx-auto relative">
        {/* Sol taraf: logo veya başlık */}
        <h1 className="text-xl font-bold text-brandPrimary">Strand Uncover</h1>

        {/* Sağ taraf: drop-down */}
        <div className="relative">
          <button
            onClick={handleToggleDropdown}
            className="px-3 py-1 rounded bg-brandPrimary text-white hover:bg-brandSecondary transition"
          >
            {mode === "daily" ? "Daily" : "Zen"}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-24 bg-white shadow-md rounded">
              <button
                onClick={() => handleSelectMode("daily")}
                className="block w-full text-left px-4 py-2 hover:bg-brandLight"
              >
                Daily
              </button>
              <button
                onClick={() => handleSelectMode("zen")}
                className="block w-full text-left px-4 py-2 hover:bg-brandLight"
              >
                Zen
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;






