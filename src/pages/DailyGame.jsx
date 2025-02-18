import React, { useEffect, useState } from "react";
import WordGrid from "../components/WordGrid";
import HintModal from "../components/HintModal";

function DailyGame() {
  const [puzzle, setPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [hintOpen, setHintOpen] = useState(false);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0]; // "2025-02-18"

  useEffect(() => {
    fetch("/puzzleData.json")
      .then((res) => res.json())
      .then((data) => {
        if (!data.dailyPuzzles) return;
        const puzzleOfTheDay = data.dailyPuzzles.find((p) => p.date === today);

        if (puzzleOfTheDay) {
          setPuzzle(puzzleOfTheDay);
        } else {
          // Eğer bugüne ait puzzle yoksa ilk daily puzzle'ı alalım
          setPuzzle(data.dailyPuzzles[0]);
        }
      })
      .catch((err) => console.error(err));
  }, [today]);

  const handleWordFound = (word) => {
    // Zaten bulundu mu?
    if (foundWords.includes(word)) {
      setMessage("Already found!");
      return;
    }
    setFoundWords([...foundWords, word]);
    setMessage(`Found "${word}"!`);
  };

  if (!puzzle) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p>Loading daily puzzle...</p>
      </div>
    );
  }

  const totalWords = puzzle.words.length;
  const remaining = totalWords - foundWords.length;
  const allFound = remaining === 0;

  return (
    <main className="container mx-auto p-4 flex flex-col md:flex-row items-start md:items-start gap-8 justify-center">
      {/* Sol Bilgi Alanı */}
      <div className="flex flex-col items-center md:items-start gap-4">
        <div className="px-4 py-2 rounded shadow text-center md:text-left bg-pastel-100">
          <p className="text-sm text-gray-500 font-semibold">TODAY’S THEME</p>
          <h2 className="text-xl font-bold">{puzzle.themeTitle}</h2>
        </div>

        <p className="text-lg font-medium">
          {foundWords.length} of {totalWords} found.
        </p>

        {!allFound && (
          <button
            onClick={() => setHintOpen(true)}
            className="px-4 py-1 bg-pastel-200 rounded hover:bg-pastel-300 transition"
          >
            Hint
          </button>
        )}

        <p className="text-base text-pastel-400 min-h-[1.5rem]">{message}</p>
      </div>

      {/* Harf Izgarası */}
      <div className="relative">
        <WordGrid
          grid={puzzle.grid}
          words={puzzle.words}
          foundWords={foundWords}
          onWordFound={handleWordFound}
        />
        {allFound && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-green-100 px-4 py-2 rounded mt-2">
            <p className="text-green-700 font-semibold">
              All words found! Great job!
            </p>
          </div>
        )}
      </div>

      <HintModal
        isOpen={hintOpen}
        hint={puzzle.hint}
        onClose={() => setHintOpen(false)}
      />
    </main>
  );
}

export default DailyGame;


