import React, { useEffect, useState } from "react";
import WordGrid from "../components/WordGrid";
import HintModal from "../components/HintModal";

function DailyGame() {
  const [puzzle, setPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [hintOpen, setHintOpen] = useState(false);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0]; 
  // Örnek: "2025-02-18"

  useEffect(() => {
    fetch("/puzzleData.json")
      .then((res) => res.json())
      .then((data) => {
        if (!data.dailyPuzzles) return;
        const puzzleOfTheDay = data.dailyPuzzles.find((p) => p.date === today);

        // Eğer bugüne ait puzzle yoksa bir tane fallback alalım (veya hata verilebilir)
        if (puzzleOfTheDay) {
          setPuzzle(puzzleOfTheDay);
        } else {
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
    setFoundWords((prev) => [...prev, word]);
    setMessage(`Found "${word}"!`);
  };

  if (!puzzle) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading today's puzzle...</p>
      </div>
    );
  }

  const totalWords = puzzle.words.length;
  const remaining = totalWords - foundWords.length;
  const allFound = remaining === 0;

  return (
    <main className="container mx-auto p-4 flex flex-col md:flex-row items-center md:items-start justify-center gap-8">
      {/* Sol Kısım: Tema, Sayac, Hint */}
      <div className="flex flex-col items-center md:items-start gap-4">
        <div className="bg-pastel-100 px-4 py-2 rounded shadow text-center md:text-left">
          <p className="text-sm text-gray-500 font-semibold">TODAY’S THEME</p>
          <h2 className="text-xl font-bold">{puzzle.themeTitle}</h2>
        </div>

        <p className="text-lg font-medium">
          {foundWords.length} of {totalWords} theme words found.
        </p>

        {!allFound && (
          <button
            onClick={() => setHintOpen(true)}
            className="px-4 py-1 bg-pastel-200 rounded hover:bg-pastel-300 transition"
          >
            Hint
          </button>
        )}

        <p className="text-base text-pastel-400 h-6">{message}</p>
      </div>

      {/* Sağ Kısım: Harf Izgarası */}
      <div>
        <WordGrid
          grid={puzzle.grid}
          words={puzzle.words}
          foundWords={foundWords}
          onWordFound={handleWordFound}
        />
      </div>

      {/* Eğer tüm kelimeler bulunduysa tebrik mesajı */}
      {allFound && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 px-4 py-2 rounded">
          <p className="text-green-700 font-semibold">
            Congratulations! You found all words!
          </p>
        </div>
      )}

      <HintModal
        isOpen={hintOpen}
        hint={puzzle.hint}
        onClose={() => setHintOpen(false)}
      />
    </main>
  );
}

export default DailyGame;

