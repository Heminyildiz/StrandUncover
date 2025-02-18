import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import WordGrid from "../components/WordGrid";
import HintModal from "../components/HintModal";

function MainGame() {
  // Tek sayfada "daily" veya "zen" mod
  const [mode, setMode] = useState("daily");

  const [puzzle, setPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [message, setMessage] = useState("");
  const [hintOpen, setHintOpen] = useState(false);
  const [partialWord, setPartialWord] = useState("");

  useEffect(() => {
    loadPuzzle();
  }, [mode]);

  const loadPuzzle = () => {
    fetch("./puzzleData.json") 
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Puzzle data fetch failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (mode === "daily") {
          const today = new Date().toISOString().split("T")[0];
          const dailyPuzzle = data.dailyPuzzles.find((p) => p.date === today);
          setPuzzle(dailyPuzzle || data.dailyPuzzles[0]);
        } else {
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
      <div>
        <Header mode={mode} setMode={setMode} />
        <div className="flex items-center justify-center h-full p-6">
          <p>Loading puzzle...</p>
        </div>
      </div>
    );
  }

  const totalWords = puzzle.words?.length || 0;
  const allFound = foundWords.length === totalWords;
  const showHintButton = (mode === "daily" && puzzle.hint && !allFound);

  return (
    <>
      <Header mode={mode} setMode={setMode} />

      <div className="container mx-auto p-4 flex flex-col items-center">
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

        {/* Hint Modal (Daily) */}
        {mode === "daily" && puzzle.hint && (
          <HintModal
            isOpen={hintOpen}
            hint={puzzle.hint}
            onClose={() => setHintOpen(false)}
          />
        )}
      </div>
    </>
  );
}

export default MainGame;


