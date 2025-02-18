import React, { useEffect, useState } from "react";
import WordGrid from "../components/WordGrid";

function ZenGame() {
  const [puzzles, setPuzzles] = useState([]);
  const [current, setCurrent] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/puzzleData.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.zenPuzzles) {
          setPuzzles(data.zenPuzzles);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // zenPuzzles yüklendiğinde rastgele puzzle seç
  useEffect(() => {
    if (puzzles.length > 0) {
      loadRandomPuzzle();
    }
  }, [puzzles]);

  const loadRandomPuzzle = () => {
    const index = Math.floor(Math.random() * puzzles.length);
    setCurrent(puzzles[index]);
    setFoundWords([]);
    setMessage("");
  };

  const handleWordFound = (word) => {
    if (foundWords.includes(word)) {
      setMessage("Already found!");
      return;
    }
    setFoundWords((prev) => [...prev, word]);
    setMessage(`Found "${word}"!`);
  };

  if (!current) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading Zen puzzle...</p>
      </div>
    );
  }

  const totalWords = current.words.length;
  const remaining = totalWords - foundWords.length;
  const allFound = remaining === 0;

  return (
    <main className="container mx-auto p-4 text-center flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Zen Puzzle</h2>
      <p className="text-sm text-gray-500">
        Find all words! Then grab a new puzzle.
      </p>

      {/* Harf Izgarası */}
      <WordGrid
        grid={current.grid}
        words={current.words}
        foundWords={foundWords}
        onWordFound={handleWordFound}
      />

      <p className="text-base text-pastel-400 h-6">{message}</p>

      {allFound ? (
        <div className="bg-green-100 px-4 py-2 rounded">
          <p className="text-green-700 font-semibold">
            All words found! Get a new puzzle:
          </p>
          <button
            onClick={loadRandomPuzzle}
            className="mt-2 px-4 py-1 bg-pastel-200 rounded hover:bg-pastel-300 transition"
          >
            Next Puzzle
          </button>
        </div>
      ) : (
        <p className="text-lg">
          {foundWords.length} of {totalWords} found.
        </p>
      )}
    </main>
  );
}

export default ZenGame;

