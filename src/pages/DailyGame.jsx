import React, { useEffect, useState } from "react";
import WordGrid from "../components/WordGrid";
import HintModal from "../components/HintModal";

function DailyGame() {
  const [puzzle, setPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [hintOpen, setHintOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [partialWord, setPartialWord] = useState("");

  // Bugünün tarihi
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch("/puzzleData.json")
      .then((res) => res.json())
      .then((data) => {
        if (!data.dailyPuzzles) return;
        const puzzleOfTheDay = data.dailyPuzzles.find((p) => p.date === today);
        if (puzzleOfTheDay) {
          setPuzzle(puzzleOfTheDay);
        } else {
          // fallback
          setPuzzle(data.dailyPuzzles[0]);
        }
      })
      .catch((err) => console.error(err));
  }, [today]);

  const handleWordFound = (word) => {
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
  const allFound = foundWords.length === totalWords;

  return (
    <main className="container mx-auto p-4 flex flex-col items-center">
      {/* Harf Izgarası */}
      <WordGrid
        grid={puzzle.grid}
        words={puzzle.words}
        foundWords={foundWords}
        onWordFound={handleWordFound}
        onPartialWordChange={(pw) => setPartialWord(pw)}
      />

      {/* Alt kısım: durum, mesaj, hint */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-base text-brandSecondary min-h-[1.5rem]">
          {message}
        </p>

        <p className="text-lg font-medium">
          {foundWords.length} of {totalWords} found
        </p>

        {!allFound && (
          <button
            onClick={() => setHintOpen(true)}
            className="px-4 py-1 bg-brandPrimary text-white rounded hover:bg-brandSecondary transition"
          >
            Hint
          </button>
        )}
      </div>

      {/* Hint Modal */}
      <HintModal
        isOpen={hintOpen}
        hint={puzzle.hint}
        onClose={() => setHintOpen(false)}
      />
    </main>
  );
}

export default DailyGame;





