import React, { useState } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(!open);
  const closeDropdown = () => setOpen(false);

  return (
    <header className="bg-pastel-100 p-4 shadow-sm">
      <nav className="container mx-auto flex items-center justify-between relative">
        <div className="text-xl font-bold">STRANDS CLONE</div>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="px-3 py-1 bg-pastel-200 rounded hover:bg-pastel-300 transition"
          >
            Game Mode
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded">
              <Link
                to="/daily"
                onClick={closeDropdown}
                className="block px-4 py-2 hover:bg-pastel-100"
              >
                Daily
              </Link>
              <Link
                to="/zen"
                onClick={closeDropdown}
                className="block px-4 py-2 hover:bg-pastel-100"
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


