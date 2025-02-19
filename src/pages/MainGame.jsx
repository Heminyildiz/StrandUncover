import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WordGrid from "../components/WordGrid";

const challengeStages = [
  { time: 60, wordsNeeded: 5 },
  { time: 45, wordsNeeded: 6 },
  { time: 30, wordsNeeded: 7 },
  { time: 15, wordsNeeded: 8 },
];

function MainGame() {
  // "zen" veya "challenge"
  const [mode, setMode] = useState("zen");
  const [puzzle, setPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [message, setMessage] = useState("");
  const [partialWord, setPartialWord] = useState("");

  // Zen mod için Hint butonu
  const [zenHintUsed, setZenHintUsed] = useState(false);

  // Challenge
  const [currentStage, setCurrentStage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [challengeFailed, setChallengeFailed] = useState(false);
  const timerRef = useRef(null);

  const [challengePuzzles, setChallengePuzzles] = useState([]);
  const [usedIndices, setUsedIndices] = useState([]);

  // Puzzle yükleme
  useEffect(() => {
    if (mode === "zen") {
      loadZenPuzzle();
    } else if (mode === "challenge") {
      fetch("./puzzleData.json")
        .then((res) => {
          if (!res.ok) throw new Error("Puzzle data fetch failed.");
          return res.json();
        })
        .then((data) => {
          const zList = data.zenPuzzles || [];
          setChallengePuzzles(zList);
          startChallenge(0, zList);
        })
        .catch((err) => console.error(err));
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode]);

  const loadZenPuzzle = () => {
    fetch("./puzzleData.json")
      .then((res) => {
        if (!res.ok) throw new Error("Puzzle data fetch failed.");
        return res.json();
      })
      .then((data) => {
        const zList = data.zenPuzzles || [];
        if (zList.length > 0) {
          const idx = Math.floor(Math.random() * zList.length);
          setPuzzle(zList[idx]);
        }
        resetCommonStates();
      })
      .catch((err) => console.error(err));
  };

  const resetCommonStates = () => {
    setFoundWords([]);
    setMessage("");
    setPartialWord("");
    setChallengeComplete(false);
    setChallengeFailed(false);

    // Zen Hint, her yeni puzzle geldiğinde sıfırlansın.
    setZenHintUsed(false);
  };

  // Challenge
  const startChallenge = (stageIndex, zList = []) => {
    if (timerRef.current) clearInterval(timerRef.current);

    setCurrentStage(stageIndex);
    resetCommonStates();

    if (zList.length === 0) {
      zList = challengePuzzles;
    }
    const newPuzzle = pickNewPuzzle(zList);
    setPuzzle(newPuzzle);

    const stageInfo = challengeStages[stageIndex];
    setTimeLeft(stageInfo.time);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleChallengeFail();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pickNewPuzzle = (zList) => {
    if (!zList.length) return null;
    let available = zList
      .map((_, i) => i)
      .filter((i) => !usedIndices.includes(i));

    if (available.length === 0) {
      setUsedIndices([]);
      available = zList.map((_, i) => i);
    }

    const randomIdx = available[Math.floor(Math.random() * available.length)];
    setUsedIndices((prev) => [...prev, randomIdx]);
    return zList[randomIdx];
  };

  const handleWordFound = (word) => {
    if (foundWords.includes(word)) {
      setMessage("Already found!");
    } else {
      setFoundWords([...foundWords, word]);
      setMessage(`Found "${word}"!`);
    }
  };

  // Challenge => yeterli kelime bulunmuş mu?
  useEffect(() => {
    if (mode !== "challenge" || !puzzle) return;

    const stageInfo = challengeStages[currentStage];
    if (!stageInfo) return;

    if (foundWords.length >= stageInfo.wordsNeeded) {
      if (currentStage < challengeStages.length - 1) {
        startChallenge(currentStage + 1);
      } else {
        handleChallengeComplete();
      }
    }
  }, [foundWords, puzzle, mode, currentStage]);

  const handleChallengeComplete = () => {
    setChallengeComplete(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleChallengeFail = () => {
    setChallengeFailed(true);
  };

  const handleNewChallengeGame = () => {
    startChallenge(0);
    setChallengeFailed(false);
  };

  // Time sayacı
  let challengeTimerUI = null;
  if (mode === "challenge" && puzzle) {
    const mm = Math.floor(timeLeft / 60);
    const ss = timeLeft % 60;
    const timeStr = `${mm}:${ss < 10 ? "0" + ss : ss}`;

    // Daha aşağı al, bold, text #92555B
    challengeTimerUI = (
      <div
        className="
          absolute
          top-6  /* biraz daha aşağı */
          right-0
          text-[#92555B]
          font-bold
          z-10
        "
      >
        Time: {timeStr}
      </div>
    );
  }

  // Zen'de Hint butonu
  const handleZenHint = () => {
    if (!puzzle) return;
    // Bulunmamış kelimeleri listele
    const notFound = puzzle.words.filter(
      (w) => !foundWords.includes(w.toUpperCase())
    );
    if (notFound.length === 0) {
      // Tüm kelimeler bulunmuş, ipucu gerek yok
      setMessage("All words found!");
      return;
    }
    // Rastgele bir kelime seç
    const randomWord = notFound[Math.floor(Math.random() * notFound.length)];
    // İlk harf
    const firstLetter = randomWord[0].toUpperCase();
    setMessage(`Hint: The first letter is "${firstLetter}".`);
    setZenHintUsed(true);
  };

  // Challenge popups
  const challengePopups = (
    <>
      {challengeComplete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">
              Well Done! Massive Win
            </h2>
            <button
              onClick={() => {
                setChallengeComplete(false);
                setMode("zen");
              }}
              className="px-4 py-2 bg-[#92555B] text-white rounded hover:opacity-80"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {challengeFailed && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">
              Oops! Go ahead and try again.
            </h2>
            <button
              onClick={handleNewChallengeGame}
              className="px-4 py-2 bg-[#92555B] text-white rounded hover:opacity-80"
            >
              New Game
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (!puzzle && mode === "challenge") {
    return (
      <>
        <Header mode={mode} setMode={setMode} />
        <div className="flex items-center justify-center h-full p-6">
          <p>Loading challenge puzzle...</p>
        </div>
      </>
    );
  } else if (!puzzle && mode === "zen") {
    return (
      <>
        <Header mode={mode} setMode={setMode} />
        <div className="flex items-center justify-center h-full p-6">
          <p>Loading zen puzzle...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header mode={mode} setMode={setMode} />

      {/* Timer ve ızgara */}
      <div className="container mx-auto p-4 flex flex-col items-center">
        <div className="relative">
          {challengeTimerUI}

          {puzzle && (
            <WordGrid
              grid={puzzle.grid}
              words={puzzle.words}
              onWordFound={handleWordFound}
              onPartialWordChange={setPartialWord}
            />
          )}
        </div>

        {/* Zen alt kısım: Confirm Word butonu WordGrid'de
            Hint butonu burada */}
        {mode === "zen" && puzzle && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-base text-brandSecondary min-h-[1.5rem]">
              {message}
            </p>
            <p className="text-lg font-medium">
              Found {foundWords.length} of {puzzle.words.length}
            </p>
            {/* Hint Butonu */}
            {!zenHintUsed && (
              <button
                onClick={handleZenHint}
                className="px-4 py-2 mt-2 bg-[#bfdc80] text-black rounded hover:opacity-80"
              >
                Hint
              </button>
            )}
          </div>
        )}

        {/* Challenge alt kısım */}
        {mode === "challenge" && puzzle && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-base text-brandSecondary min-h-[1.5rem]">
              {message}
            </p>
            <p className="text-lg font-medium">
              Found: {foundWords.length}
            </p>
          </div>
        )}
      </div>

      {challengePopups}

      <Footer />
    </>
  );
}

export default MainGame;









