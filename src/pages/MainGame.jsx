import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import WordGrid from "../components/WordGrid";
import HintModal from "../components/HintModal";

/**
 * Challenge aşamaları:
 * - 1) 60 saniye, 5 kelime
 * - 2) 45 saniye, 6 kelime
 * - 3) 30 saniye, 7 kelime
 * - 4) 15 saniye, 8 kelime
 * Son aşama bitince: "Well Done! Massive Win"
 */
const challengeStages = [
  { time: 60, wordsNeeded: 5 },
  { time: 45, wordsNeeded: 6 },
  { time: 30, wordsNeeded: 7 },
  { time: 15, wordsNeeded: 8 }
];

function MainGame() {
  // İki mod: "zen" veya "challenge"
  const [mode, setMode] = useState("zen");

  // Puzzle verisi (Zen / Challenge)
  const [puzzle, setPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [message, setMessage] = useState("");
  const [partialWord, setPartialWord] = useState("");

  // Challenge state
  const [currentStage, setCurrentStage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [challengeFailed, setChallengeFailed] = useState(false);

  const timerRef = useRef(null);
  const [challengePuzzles, setChallengePuzzles] = useState([]);
  const [usedIndices, setUsedIndices] = useState([]);

  useEffect(() => {
    if (mode === "zen") {
      loadZenPuzzle();
    } else if (mode === "challenge") {
      // challenge moduna ilk kez girince puzzle listesini çek
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

    // Cleanup timer
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
        resetCommon();
      })
      .catch((err) => console.error(err));
  };

  const resetCommon = () => {
    setFoundWords([]);
    setMessage("");
    setPartialWord("");
    setChallengeComplete(false);
    setChallengeFailed(false);
  };

  // Challenge mod
  const startChallenge = (stageIndex, zList = []) => {
    if (timerRef.current) clearInterval(timerRef.current);

    setCurrentStage(stageIndex);
    resetCommon();

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

  // Rastgele puzzle seç
  const pickNewPuzzle = (zList) => {
    if (!zList.length) return null;

    let available = zList.map((_, i) => i).filter((i) => !usedIndices.includes(i));
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

  useEffect(() => {
    if (mode !== "challenge") return;
    if (!puzzle) return;

    const stageInfo = challengeStages[currentStage];
    if (!stageInfo) return;

    if (foundWords.length >= stageInfo.wordsNeeded) {
      // geç aşamaya
      if (currentStage < challengeStages.length - 1) {
        startChallenge(currentStage + 1);
      } else {
        // son aşama
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

  // Timer UI (challenge)
  let challengeTimerUI = null;
  if (mode === "challenge" && puzzle) {
    const mm = Math.floor(timeLeft / 60);
    const ss = timeLeft % 60;
    const timeStr = `${mm}:${ss < 10 ? "0" + ss : ss}`;
    challengeTimerUI = (
      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow-md text-brandRed font-bold z-10">
        Time= {timeStr}
      </div>
    );
  }

  // Challenge popup
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

      <div className="container mx-auto p-4 flex flex-col items-center relative">
        {challengeTimerUI}

        {/* Harf Izgarası */}
        {puzzle && (
          <WordGrid
            grid={puzzle.grid}
            words={puzzle.words}
            onWordFound={handleWordFound}
            onPartialWordChange={setPartialWord}
          />
        )}

        {/* Zen alt kısım */}
        {mode === "zen" && puzzle && (
          <div classN





