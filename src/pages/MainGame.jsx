import React, { useEffect, useState } from "react";
import WordGrid from "../components/WordGrid";
import HintModal from "../components/HintModal";

function MainGame() {
  const [mode, setMode] = useState("daily"); 
  // "daily" veya "zen"
  const [puzzle, setPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [message, setMessage] = useState("");
  const [hintOpen, setHintOpen] = useState(false);
  const [partialWord, setPartialWord] = useState("");

  useEffect(() => {
    loadPuzzle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const loadPuzzle = () => {
    fetch("/puzzleData.json")
      .then((res) => res.json())
      .then((data) => {
        if (mode === "daily") {
          // Tek bir daily puzzle var. Tarihe göre
          const today = new Date().toISOString().split("T")[0];
          const dailyPuzzle = data.dailyPuzzles.find((p) => p.date === today);
          setPuzzle(dailyPuzzle || data.dailyPuzzles[0]);
        } else {
          // Zen puzzle. Rastgele seç
          const zList = data.zenPuzzles || [];
          if (zList.length > 0) {
            const idx = Math.floor(Math.random() * zList.length);
            setPuzzle(zList[idx]);
          }
        }
        setFoundWords([]);
        setMessage("");
        setHintOpen(false);
        setPartialWord("");
      })
      .catch((err) => console.error(err));
  };

  const handleSwitchDaily = () => {
    setMode("daily");
  };

  const handleSwitchZen = () => {
    setMode("zen");
  };

  const handleWordFound = (word) => {
    if (foundWords.includes(word)) {
      setMessage("Already found!");
    } else {
      setFoundWords([...foundWords, word]);
      setMessage(`Found "${word}"!`);
    }
  };

  if (!puzzle) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p>Loading puzzle...</p>
      </div>
    );
  }

  const totalWords = puzzle.words.length;
  const allFound = foundWords.length === totalWords;

  const showHintButton = mode === "daily" && !allFound; // Sadece daily modda hint

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      {/* Üstte mod seçme butonları */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleSwitchDaily}
          className={`px-4 py-1 rounded ${
            mode === "daily"
              ? "bg-brandPrimary text-white"
              : "bg-white border border-brandPrimary text-brandPrimary"
          }`}
        >
          Daily
        </button>
        <button
          onClick={handleSwitchZen}
          className={`px-4 py-1 rounded ${
            mode === "zen"
              ? "bg-brandPrimary text-white"
              : "bg-white border border-brandPrimary text-brandPrimary"
          }`}
        >
          Zen
        </button>
      </div>

      {/* Harf Izgarası */}
      <WordGrid
        grid={puzzle.grid}
        words={puzzle.words}
        onWordFound={handleWordFound}
        onPartialWordChange={setPartialWord}
      />

      {/* Alt Kısım: mesaj, found sayısı, hint */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-base text-brandSecondary min-h-[1.5rem]">
          {message}
        </p>
        <p className="text-lg font-medium">
          {foundWords.length} of {totalWords} found
        </p>

        {showHintButton && (
          <button
            onClick={() => setHintOpen(true)}
            className="px-4 py-1 bg-brandPrimary text-white rounded hover:bg-brandSecondary transition"
          >
            Hint
          </button>
        )}
      </div>

      {/* Hint Modal (Daily) */}
      {mode === "daily" && (
        <HintModal
          isOpen={hintOpen}
          hint={puzzle.hint}
          onClose={() => setHintOpen(false)}
        />
      )}
    </div>
  );
}

export default MainGame;
