import React, { useEffect, useState } from "react";
import WordGrid from "../components/WordGrid";
import HintModal from "../components/HintModal";

function DailyGame() {
  const [puzzle, setPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [hintOpen, setHintOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [partialWord, setPartialWord] = useState("");

  const today = new Date().toISOString().split("T")[0]; // or example "2025-02-18"

  useEffect(() => {
    fetch("/puzzleData.json")
      .then((res) => res.json())
      .then((data) => {
        if (!data.dailyPuzzles) return;
        // Bugünün puzzle'ı
        const puzzleOfTheDay = data.dailyPuzzles.find((p) => p.date === today);
        if (puzzleOfTheDay) {
          setPuzzle(puzzleOfTheDay);
        } else {
          // fallback: ilk puzzle
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
  const remaining = totalWords - foundWords.length;
  const allFound = remaining === 0;

  return (
    <main className="container mx-auto p-4 flex flex-col md:flex-row items-start gap-8 justify-center">
      {/* Sol kısım: Tema, Hint, durum */}
      <div className="flex flex-col items-center md:items-start gap-4">
        <div className="px-4 py-2 rounded shadow text-center md:text-left bg-white">
          <p className="text-sm text-gray-500 font-semibold">TODAY’S THEME</p>
          <h2 className="text-xl font-bold text-brandPrimary">
            {puzzle.themeTitle}
          </h2>
        </div>

        <p className="text-lg font-medium">
          {foundWords.length} of {totalWords} found.
        </p>

        {!allFound && (
          <button
            onClick={() => setHintOpen(true)}
            className="px-4 py-1 bg-brandPrimary text-white rounded hover:bg-brandSecondary transition"
          >
            Hint
          </button>
        )}

        <p className="text-base text-brandSecondary min-h-[1.5rem]">{message}</p>
      </div>

      {/* Sağ kısım: Izgara ve partial word */}
      <div className="relative flex flex-col items-center">
        {/* Seçilen harflerden oluşan kelime */}
        <div className="mb-2 text-brandSecondary font-bold text-xl h-6">
          {partialWord}
        </div>

        <WordGrid
          grid={puzzle.grid}
          words={puzzle.words}
          foundWords={foundWords}
          onWordFound={handleWordFound}
          onPartialWordChange={(pw) => setPartialWord(pw)}
        />

        {allFound && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-brandGreen px-4 py-2 rounded mt-2 text-white font-semibold">
            All words found! Great job!
          </div>
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



