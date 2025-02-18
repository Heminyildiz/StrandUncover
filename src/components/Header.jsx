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
        {/* Sol taraf: Başlık */}
        <h1 className="text-xl font-bold text-brandPrimary">Strand Uncover</h1>

        {/* Sağ tarafta drop-down */}
        <div className="relative">
          <button
            onClick={handleToggleDropdown}
            className="px-3 py-1 rounded bg-brandPrimary text-white hover:bg-brandSecondary transition"
          >
            {mode === "daily"
              ? "Daily"
              : mode === "zen"
              ? "Zen"
              : "Challenge"}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded z-50">
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








