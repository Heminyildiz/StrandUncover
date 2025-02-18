import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Hangi moddaysak onu göster
  let currentMode = "Daily";
  if (location.pathname.includes("/zen")) {
    currentMode = "Zen";
  }

  const toggleDropdown = () => setOpen(!open);
  const closeDropdown = () => setOpen(false);

  return (
    <header className="bg-white p-4 shadow-sm">
      <nav className="container mx-auto flex items-center justify-between relative">
        <h1 className="text-xl font-bold text-brandPrimary">
          Strand Uncover
        </h1>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="px-3 py-1 rounded bg-brandPrimary text-white hover:bg-brandSecondary transition"
          >
            {currentMode}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded">
              <Link
                to="/daily"
                onClick={closeDropdown}
                className="block px-4 py-2 hover:bg-brandLight"
              >
                Daily
              </Link>
              <Link
                to="/zen"
                onClick={closeDropdown}
                className="block px-4 py-2 hover:bg-brandLight"
              >
                Zen
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;




