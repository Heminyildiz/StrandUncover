import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Welcome to Strands Clone</h1>
      <p className="mb-6">A daily & zen word-search puzzle game.</p>
      <div className="flex justify-center gap-4">
        <Link
          to="/daily"
          className="px-5 py-2 bg-pastel-200 rounded hover:bg-pastel-300 transition"
        >
          Daily Mode
        </Link>
        <Link
          to="/zen"
          className="px-5 py-2 bg-pastel-200 rounded hover:bg-pastel-300 transition"
        >
          Zen Mode
        </Link>
      </div>
    </main>
  );
}

export default Home;

