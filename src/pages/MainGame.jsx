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
  }, [mode]);

  const loadPuzzle = () => {
    fetch("./puzzleData.json") // <-- Önemli: relative path
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Puzzle data fetch failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (mode === "daily") {
          const today = new Date().toISOString().split("T")[0];
          // Tarihle eşleşen puzzle bul
          const dailyPuzzle = data.dailyPuzzles.find((p) => p.date === today);
          setPuzzle(dailyPuzzle || data.dailyPuzzles[0]);
        } else {
          // Zen puzzle => rastgele bir tane
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
      .catch((err) => {
        console.error("Puzzle fetch error:", err);
      });
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

  const totalWords = puzzle.words?.length || 0;
  const allFound = foundWords.length === totalWords;
  // Daily modda hint, eğer puzzle varsa ve tüm kelimeler bulunmadıysa göster
  const showHintButton = (mode === "daily" && puzzle.hint && !allFound);

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
        words={puzzle.words || []}
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

      {/* Hint Modal (Sadece daily modda) */}
      {mode === "daily" && puzzle.hint && (
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

