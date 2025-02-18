import React, { useEffect, useState } from "react";

function ZenGame() {
  const [zenList, setZenList] = useState([]);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/puzzleData.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.zenPuzzles) {
          setZenList(data.zenPuzzles);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (zenList.length > 0) {
      loadRandomPuzzle();
    }
  }, [zenList]);

  const loadRandomPuzzle = () => {
    const randomIndex = Math.floor(Math.random() * zenList.length);
    setCurrentPuzzle(zenList[randomIndex]);
    setFoundWords([]);
    setGuess("");
    setMessage("");
  };

  const handleGuess = () => {
    if (!currentPuzzle) return;
    const upperGuess = guess.trim().toUpperCase();

    if (foundWords.includes(upperGuess)) {
      setMessage("Already found!");
    } else if (currentPuzzle.words.includes(upperGuess)) {
      setFoundWords([...foundWords, upperGuess]);
      setMessage(`You found "${upperGuess}"!`);
    } else {
      setMessage("Not correct. Try again!");
    }
    setGuess("");
  };

  if (!currentPuzzle) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading Zen puzzle...</p>
      </div>
    );
  }

  const allFound = foundWords.length === currentPuzzle.words.length;

  return (
    <main className="container mx-auto p-4 text-center">
      <h2 className="text-xl font-bold mb-2">Zen Puzzle</h2>
      <p className="mb-4">
        Find all words in this puzzle. A new puzzle appears when you solve it!
      </p>

      {allFound ? (
        <div>
          <p className="text-green-600 font-semibold">
            You found all words! Loading a new puzzle...
          </p>
          {/* Yeni puzzle için küçük bir gecikme veya buton */}
          <button
            onClick={loadRandomPuzzle}
            className="mt-3 px-3 py-1 bg-pastel-500 hover:bg-pastel-600 rounded"
          >
            Next Puzzle
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex gap-2">
            <input
              type="text"
              className="border border-pastel-400 rounded px-2 py-1"
              placeholder="Enter a word..."
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGuess();
              }}
            />
            <button
              onClick={handleGuess}
              className="px-3 py-1 bg-pastel-500 rounded hover:bg-pastel-600 transition"
            >
              Guess
            </button>
          </div>
          <p className="mt-2 text-pastel-800">{message}</p>
        </div>
      )}
    </main>
  );
}

export default ZenGame;
