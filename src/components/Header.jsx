import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-pastel-300 p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Strands Clone
        </Link>
        <div className="flex gap-4">
          <Link
            to="/daily"
            className="px-3 py-1 bg-pastel-500 rounded hover:bg-pastel-600 transition"
          >
            Daily
          </Link>
          <Link
            to="/zen"
            className="px-3 py-1 bg-pastel-500 rounded hover:bg-pastel-600 transition"
          >
            Zen
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
