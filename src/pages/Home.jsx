import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Welcome to Strands Clone</h1>
      <p className="mb-4">
        Choose your game mode and find the hidden words!
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/daily"
          className="px-5 py-2 bg-pastel-500 hover:bg-pastel-600 rounded"
        >
          Daily Mode
        </Link>
        <Link
          to="/zen"
          className="px-5 py-2 bg-pastel-500 hover:bg-pastel-600 rounded"
        >
          Zen Mode
        </Link>
      </div>
    </main>
  );
}

export default Home;
