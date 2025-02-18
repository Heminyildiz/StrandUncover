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

  // Puzzle verisi (Daily / Zen)
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

  // Puzzle yükleme (Daily veya Zen). 
  // Challenge modunda puzzle'ı biz sabit tutabilir veya
  // puzzleData.json içindeki "zenPuzzles"dan rastgele seçebiliriz.
  // Burada basitçe “zenPuzzles”dan seçeceğiz (veya sabit 1 puzzle).
  useEffect(() => {
    if (mode === "daily") {
      loadDailyPuzzle();
    } else if (mode === "zen") {
      loadZenPuzzle();
    } else if (mode === "challenge") {
      startChallenge(0); // aşama 0'dan başlat
    }
    // Cleanup
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Eğer puzzle var ve challenge dışındaysak; 
  // "foundWords" vs. defaultlanabilir
  // Challenge modunda startChallenge fonksiyonu yönetiyor.
  
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

  /** Challenge modunu başlatmak / aşamalar arası geçiş yapmak. */
  const startChallenge = (stageIndex) => {
    // Timer temizliği
    if (timerRef.current) clearInterval(timerRef.current);

    setCurrentStage(stageIndex);
    setChallengeComplete(false);
    setChallengeFailed(false);
    resetCommonStates();

    // Puzzle'ı zenPuzzles listesinden rastgele çekiyoruz (örnek)
    // Dilerseniz sabit bir puzzle array'i de koyabilirsiniz.
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
        // Aşamanın süresini timeLeft'e atayıp sayacı başlat
        const stageInfo = challengeStages[stageIndex];
        setTimeLeft(stageInfo.time);

        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // Süre bitti
              clearInterval(timerRef.current);
              handleChallengeFail();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      })
      .catch((err) => console.error(err));
  };

  const resetCommonStates = () => {
    setFoundWords([]);
    setMessage("");
    setHintOpen(false);
    setPartialWord("");
  };

  /** Bir kelime bulunduğunda */
  const handleWordFound = (word) => {
    if (foundWords.includes(word)) {
      setMessage("Already found!");
      return;
    }
    setFoundWords([...foundWords, word]);
    setMessage(`Found "${word}"!`);
  };

  /** Her render sonrasında challenge aşamasını kontrol edelim */
  useEffect(() => {
    if (mode !== "challenge") return;
    if (!puzzle) return;

    const stageInfo = challengeStages[currentStage];
    if (!stageInfo) return;

    // Gerekli kelime sayısı: stageInfo.wordsNeeded
    if (foundWords.length >= stageInfo.wordsNeeded) {
      // Bu aşamayı bitirdik => sonraki aşamaya geç
      if (currentStage < challengeStages.length - 1) {
        // Bir sonraki stage
        startChallenge(currentStage + 1);
      } else {
        // Son aşamaydı, challenge bitti => başarı
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

  /** Challenge'da fail olduktan sonra "New Game" butonuna basılırsa */
  const handleNewChallengeGame = () => {
    // Tekrar 0. aşamaya dön
    startChallenge(0);
    setChallengeFailed(false);
  };

  // Ekranda puzzle yoksa
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

  // CHALLENGE modunda puzzle yüklendiğinde, ekranda Timer göster
  // Daily / Zen modunda bu timer yok.
  const isChallenge = (mode === "challenge");
  let challengeTimerUI = null;
  if (isChallenge && puzzle) {
    // mm:ss format
    const mm = Math.floor(timeLeft / 60);
    const ss = timeLeft % 60;
    const timeStr = `${mm}:${ss < 10 ? "0" + ss : ss}`;
    // Sağ üst köşenin hemen üstüne sabitle
    challengeTimerUI = (
      <div className="absolute top-0 right-0 mt-2 mr-2 bg-white px-2 py-1 rounded shadow-md text-brandRed font-bold">
        Time= {timeStr}
      </div>
    );
  }

  // CHALLENGE modunda "Well Done" veya "Oops" popup
  const challengePopups = (
    <>
      {challengeComplete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-md text-center">
            <h2 className="text-xl font-semibold mb-2">Well Done! Massive Win</h2>
            <button
              onClick={() => {
                // Kapatıp Daily veya Zen'e mi gitsin?
                // Veya resetleyerek en başa?
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

  // =============== RENDER ===============
  return (
    <>
      <Header mode={mode} setMode={setMode} />

      <div className="container mx-auto p-4 flex flex-col items-center relative">
        {/* Timer (sadece challenge modunda) */}
        {challengeTimerUI}

        {/* Harf Izgarası (Daily / Zen / Challenge) */}
        {puzzle && (
          <WordGrid
            grid={puzzle.grid}
            words={puzzle.words || []}
            onWordFound={handleWordFound}
            onPartialWordChange={setPartialWord}
          />
        )}

        {/* Alt Kısım (Daily / Zen) */}
        {mode !== "challenge" && puzzle && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-base text-brandSecondary min-h-[1.5rem]">
              {message}
            </p>
            <p className="text-lg font-medium">
              {foundWords.length} of {puzzle.words.length} found
            </p>

            {/* Hint Butonu sadece Daily modda ve puzzle.hint varsa */}
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

        {/* Challenge'ta, kelime durumunu ızgaranın altında göstermek istersen */}
        {mode === "challenge" && puzzle && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-base text-brandSecondary min-h-[1.5rem]">
              {message}
            </p>
            <p className="text-lg font-medium">
              Found: {foundWords.length}
            </p>
            {/* Gerekli kelime sayısını göstersin */}
            <p className="text-sm text-gray-500">
              Need {challengeStages[currentStage]?.wordsNeeded} words
            </p>
          </div>
        )}

        {/* Daily modda hint modal */}
        {mode === "daily" && puzzle?.hint && (
          <HintModal
            isOpen={hintOpen}
            hint={puzzle.hint}
            onClose={() => setHintOpen(false)}
          />
        )}

        {/* Challenge Pop-ups */}
        {challengePopups}
      </div>
    </>
  );
}

export default MainGame;



