import React, { useEffect, useState } from "react";
import WordGrid from "../components/WordGrid";

function ZenGame() {
  const [puzzles, setPuzzles] = useState([]);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
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

  // puzzles yüklendiğinde rastgele puzzle seç
  useEffect(() => {
    if (puzzles.length > 0) {
      loadRandomPuzzle();
    }
  }, [puzzles]);

  const loadRandomPuzzle = () => {
    const idx = Math.floor(Math.random() * puzzles.length);
    setCurrentPuzzle(puzzles[idx]);
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

  if (!currentPuzzle) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p>Loading zen puzzle...</p>
      </div>
    );
  }

  const total = currentPuzzle.words.length;
  const foundCount = foundWords.length;
  const allFound = foundCount === total;

  return (
    <main className="container mx-auto p-4 flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Zen Puzzle</h2>
      <p className="text-sm text-gray-500">
        Find all words. Then load a new puzzle!
      </p>

      <WordGrid
        grid={currentPuzzle.grid}
        words={currentPuzzle.words}
        foundWords={foundWords}
        onWordFound={handleWordFound}
      />

      <p className="text-base text-pastel-400 h-6">{message}</p>

      {allFound ? (
        <div className="bg-green-100 px-4 py-2 rounded">
          <p className="text-green-700 font-semibold">
            All words found! Load another puzzle:
          </p>
          <button
            onClick={loadRandomPuzzle}
            className="mt-2 px-4 py-1 bg-pastel-200 rounded hover:bg-pastel-300"
          >
            Next Puzzle
          </button>
        </div>
      ) : (
        <p className="text-lg font-medium">
          {foundCount} / {total}
        </p>
      )}
    </main>
  );
}

export default ZenGame;


