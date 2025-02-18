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
 * Son aşamayı da bitirince: "Well Done! Massive Win"
 */
const challengeStages = [
  { time: 60, wordsNeeded: 5 },
  { time: 45, wordsNeeded: 6 },
  { time: 30, wordsNeeded: 7 },
  { time: 15, wordsNeeded: 8 }
];

function MainGame() {
  // "daily" / "zen" / "challenge"
  const [mode, setMode] = useState("daily");

  // Puzzle verisi (Daily / Zen / Challenge)
  const [puzzle, setPuzzle] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [message, setMessage] = useState("");
  const [hintOpen, setHintOpen] = useState(false);
  const [partialWord, setPartialWord] = useState("");

  // *** CHALLENGE Modu Durumları ***
  const [currentStage, setCurrentStage] = useState(0);  // 0..3
  const [timeLeft, setTimeLeft] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [challengeFailed, setChallengeFailed] = useState(false);

  // Timer ref
  const timerRef = useRef(null);

  // Eklendi: Challenge modunda kullanılacak puzzles ve usedIndices:
  const [challengePuzzles, setChallengePuzzles] = useState([]); 
  const [usedIndices, setUsedIndices] = useState([]);

  useEffect(() => {
    if (mode === "daily") {
      loadDailyPuzzle();
    } else if (mode === "zen") {
      loadZenPuzzle();
    } else if (mode === "challenge") {
      // Challenge moduna ilk geçtiğimizde puzzle listesini çekelim
      // (sadece bir kez çekeceğiz, startChallenge(0) içinde fetch yerine)
      fetch("./puzzleData.json")
        .then((res) => {
          if (!res.ok) throw new Error("Puzzle data fetch failed.");
          return res.json();
        })
        .then((data) => {
          const zList = data.zenPuzzles || [];
          setChallengePuzzles(zList);  // listemizi kaydedelim
          // İlk aşamayı başlat
          startChallenge(0, zList);
        })
        .catch((err) => console.error(err));
    }

    // Cleanup: Timer sıfırlama
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Daily puzzle yükle
  const loadDailyPuzzle = () => {
    fetch("./puzzleData.json")
      .then((res) => {
        if (!res.ok) throw new Error("Puzzle data fetch failed.");
        return res.json();
      })
      .then((data) => {
        const today = new Date().toISOString().split("T")[0];
        const daily = data.dailyPuzzles.find((p) => p.date === today);
        setPuzzle(daily || data.dailyPuzzles[0]);
        resetCommonStates();
      })
      .catch((err) => console.error(err));
  };

  // Zen puzzle yükle
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

  /** Challenge modunu aşamaIndex'ten başlatır. 
   * zList parametresi: challengePuzzles (zenPuzzles) 
   */
  const startChallenge = (stageIndex, zList = []) => {
    // Timer temizliği
    if (timerRef.current) clearInterval(timerRef.current);

    setCurrentStage(stageIndex);
    setChallengeComplete(false);
    setChallengeFailed(false);
    resetCommonStates();

    // Yeni puzzle seç
    if (zList.length === 0) {
      // eğer henüz yoksa state'ten al
      zList = challengePuzzles;
    }
    const newPuzzle = pickNewPuzzle(zList);
    setPuzzle(newPuzzle);

    // Aşamanın süresini timeLeft'e atayıp sayacı başlat
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

  // Rastgele puzzle seçer, daha önce kullanılmamışsa ekliyoruz.
  // Kullanılmamış puzzle kalmazsa usedIndices sıfırlanır (isteğe bağlı).
  const pickNewPuzzle = (zList) => {
    if (!zList.length) return null;

    let availableIndices = zList.map((_, i) => i).filter((i) => !usedIndices.includes(i));
    if (availableIndices.length === 0) {
      // Tükettiysek sıfırla
      setUsedIndices([]);
      availableIndices = zList.map((_, i) => i);
    }
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedIndices((prev) => [...prev, randomIndex]);
    return zList[randomIndex];
  };

  // Common state'leri sıfırla
  const resetCommonStates = () => {
    setFoundWords([]);
    setMessage("");
    setHintOpen(false);
    setPartialWord("");
  };

  // Kelime bulunması
  const handleWordFound = (word) => {
    if (foundWords.includes(word)) {
      setMessage("Already found!");
      return;
    }
    setFoundWords([...foundWords, word]);
    setMessage(`Found "${word}"!`);
  };

  // Challenge her buluş sonrası kelime kontrolü
  useEffect(() => {
    if (mode !== "challenge") return;
    if (!puzzle) return;

    const stageInfo = challengeStages[currentStage];
    if (!stageInfo) return;

    // Gerekli kelime sayısı: stageInfo.wordsNeeded
    if (foundWords.length >= stageInfo.wordsNeeded) {
      // Bu aşamayı bitirdik => sonraki aşamaya geç
      if (currentStage < challengeStages.length - 1) {
        startChallenge(currentStage + 1);
      } else {
        // Son aşamaydı
        handleChallengeComplete();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundWords, puzzle]);

  const handleChallengeComplete = () => {
    setChallengeComplete(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleChallengeFail = () => {
    setChallengeFailed(true);
  };

  // "New Game" => tekrar en başa
  const handleNewChallengeGame = () => {
    startChallenge(0);
    setChallengeFailed(false);
  };

  // Timer UI
  const isChallenge = (mode === "challenge");
  let challengeTimerUI = null;
  if (isChallenge && puzzle) {
    const mm = Math.floor(timeLeft / 60);
    const ss = timeLeft % 60;
    const timeStr = `${mm}:${ss < 10 ? "0" + ss : ss}`;
    challengeTimerUI = (
      <div className="absolute top-0 right-0 mt-2 mr-2 bg-white px-2 py-1 rounded shadow-md text-brandRed font-bold">
        Time= {timeStr}
      </div>
    );
  }

  // Challenge'ta pop-up
  const challengePopups = (
    <>
      {challengeComplete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Well Done! Massive Win</h2>
            <button
              onClick={() => {
                setChallengeComplete(false);
                setMode("daily");
              }}
              className="px-4 py-1 bg-brandGreen text-white rounded"
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
              className="px-4 py-1 bg-brandPrimary text-white rounded"
            >
              New Game
            </button>
          </div>
        </div>
      )}
    </>
  );

  // Puzzle yüklenmemiş (güncel mod "challenge" ama puzzle gelmemiş vs.)
  if (mode !== "challenge" && !puzzle) {
    return (
      <div>
        <Header mode={mode} setMode={setMode} />
        <div className="flex items-center justify-center h-full p-6">
          <p>Loading puzzle...</p>
        </div>
      </div>
    );
  }

  // Render
  return (
    <>
      <Header mode={mode} setMode={setMode} />

      <div className="container mx-auto p-4 flex flex-col items-center relative">
        {/* Timer (challenge modunda) */}
        {challengeTimerUI}

        {/* Harf Izgarası */}
        {puzzle && (
          <WordGrid
            grid={puzzle.grid}
            words={puzzle.words || []}
            onWordFound={handleWordFound}
            onPartialWordChange={setPartialWord}
          />
        )}

        {/* Daily / Zen alt kısım */}
        {mode !== "challenge" && puzzle && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-base text-brandSecondary min-h-[1.5rem]">
              {message}
            </p>
            <p className="text-lg font-medium">
              {foundWords.length} of {puzzle.words.length} found
            </p>

            {/* Hint sadece Daily modda */}
            {mode === "daily" && puzzle.hint && foundWords.length < puzzle.words.length && (
              <button
                onClick={() => setHintOpen(true)}
                className="px-4 py-1 bg-brandPrimary text-white rounded hover:bg-brandSecondary transition"
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
            {/* hangi aşamadayız? */}
            <p className="text-sm text-gray-500">
              Need {challengeStages[currentStage]?.wordsNeeded} words
            </p>
          </div>
        )}

        {/* Daily mod Hint Modal */}
        {mode === "daily" && puzzle?.hint && (
          <HintModal
            isOpen={hintOpen}
            hint={puzzle.hint}
            onClose={() => setHintOpen(false)}
          />
        )}

        {/* Challenge başarı / başarısız popup */}
        {challengePopups}
      </div>
    </>
  );
}

export default MainGame;




