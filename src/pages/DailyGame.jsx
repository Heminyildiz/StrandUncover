import React, { useEffect, useState } from "react";
import HintModal from "../components/HintModal";

function DailyGame() {
  const [puzzle, setPuzzle] = useState(null);
  const [guess, setGuess] = useState("");
  const [foundWords, setFoundWords] = useState([]);
  const [message, setMessage] = useState("");
  const [showHint, setShowHint] = useState(false);

  // Bugünün tarihini YYYY-MM-DD olarak al
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // puzzleData.json'dan dailyPuzzles verisini çek
    fetch("/puzzleData.json")
      .then((res) => res.json())
      .then((data) => {
        const dailyList = data.dailyPuzzles;
        // Bugünkü puzzle'ı bul
        const todayPuzzle = dailyList.find((p) => p.date === today);

        // Eğer bugüne ait puzzle yoksa ilk puzzle'ı set edelim (örnek)
        // Gerçek proje mantığında "no puzzle found" gibi bir durum gösterebilirsiniz
        if (todayPuzzle) {
          setPuzzle(todayPuzzle);
        } else {
          setPuzzle(dailyList[0]);
        }
      })
      .catch((err) => console.error(err));
  }, [today]);

  const handleGuess = () => {
    if (!puzzle) return;

    const upperGuess = guess.trim().toUpperCase();

    if (foundWords.includes(upperGuess)) {
      setMessage("Already found!");
    } else if (puzzle.words.includes(upperGuess)) {
      setFoundWords([...foundWords, upperGuess]);
      setMessage(`You found "${upperGuess}"!`);
    } else {
      setMessage("Not correct. Try again!");
    }
    setGuess("");
  };

  if (!puzzle) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading today's puzzle...</p>
      </div>
    );
  }

  const allFound = foundWords.length === puzzle.words.length;

  return (
    <main className="container mx-auto p-4 text-center">
      <h2 className="text-xl font-bold mb-2">
        Daily Puzzle: {puzzle.themeTitle}
      </h2>

      {allFound ? (
        <div className="mt-4">
          <p className="text-green-600 font-semibold">
            Congratulations! You found all theme words!
          </p>
          <p className="text-sm mt-2">Come back tomorrow for a new puzzle!</p>
        </div>
      ) : (
        <div className="mb-4">
          <p>Find {puzzle.words.length} words related to this theme.</p>
          <div className="flex flex-col items-center mt-4">
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
        </div>
      )}

      {/* Hint Butonu */}
      {!allFound && (
        <div>
          <button
            onClick={() => setShowHint(true)}
            className="px-3 py-1 bg-pastel-200 rounded hover:bg-pastel-300 transition"
          >
            Hint
          </button>
        </div>
      )}

      <HintModal
        isOpen={showHint}
        hint={puzzle.hint}
        onClose={() => setShowHint(false)}
      />
    </main>
  );
}

export default DailyGame;
