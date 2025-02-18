import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-pastel-100 p-4 shadow-sm">
      <nav className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          STRANDS CLONE
        </Link>
        <div className="flex gap-4">
          <Link
            to="/daily"
            className="px-3 py-1 bg-pastel-200 rounded hover:bg-pastel-300 transition"
          >
            Daily
          </Link>
          <Link
            to="/zen"
            className="px-3 py-1 bg-pastel-200 rounded hover:bg-pastel-300 transition"
          >
            Zen
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;

