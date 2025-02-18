import React, { useEffect, useState } from "react";
import WordGrid from "../components/WordGrid";

function ZenGame() {
  const [puzzles, setPuzzles] = useState([]);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [message, setMessage] = useState("");
  const [partialWord, setPartialWord] = useState("");

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
    setPartialWord("");
  };

  const handleWordFound = (word) => {
    if (foundWords.includes(word)) {
      setMessage("Already found!");
      return;
    }
    setFoundWords([...foundWords, word]);
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
  const allFound = foundWords.length === total;

  return (
    <main className="container mx-auto p-4 flex flex-col items-center">
      <h2 className="text-xl font-bold text-brandPrimary mb-2">Zen Puzzle</h2>
      <p className="text-sm text-gray-500">
        Find all words, then load a new puzzle!
      </p>

      <WordGrid
        grid={currentPuzzle.grid}
        words={currentPuzzle.words}
        foundWords={foundWords}
        onWordFound={handleWordFound}
        onPartialWordChange={setPartialWord}
      />

      {/* Alt kısım */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-base text-brandSecondary min-h-[1.5rem]">
          {message}
        </p>
        <p className="text-lg font-medium">
          {foundWords.length} / {total}
        </p>
        {allFound && (
          <div className="bg-brandGreen px-4 py-2 rounded text-white font-semibold">
            <p>All words found! Get another puzzle:</p>
            <button
              onClick={loadRandomPuzzle}
              className="mt-2 px-4 py-1 bg-white text-brandGreen rounded hover:bg-brandAccent hover:text-white transition"
            >
              Next Puzzle
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default ZenGame;






