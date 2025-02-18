import React, { useEffect, useState, useRef } from "react";

// Rastgele harf kaynağı
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** path içindeki hücrelerin tam bir çizgi oluşturup oluşturmadığını kontrol */
function isStraightLine(path) {
  if (path.length < 2) return true; // Tek hücre de geçerli
  // Her adım arasındaki fark aynı mı?
  const rowDiff = path[1].row - path[0].row;
  const colDiff = path[1].col - path[0].col;
  for (let i = 2; i < path.length; i++) {
    const rDiff = path[i].row - path[i - 1].row;
    const cDiff = path[i].col - path[i - 1].col;
    if (rDiff !== rowDiff || cDiff !== colDiff) {
      return false;
    }
  }
  return true;
}

// path'ten kelime oluştur
function buildStringFromPath(path, grid) {
  return path.map(({ row, col }) => grid[row][col]).join("");
}

function WordGrid({ grid: initialGrid, words, foundWords, onWordFound, onPartialWordChange }) {
  const [grid, setGrid] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const isPointerDown = useRef(false);
  const [warning, setWarning] = useState("");

  // Boş hücreleri random harfle doldur
  useEffect(() => {
    const filled = initialGrid.map((row) =>
      row.map((cell) => {
        if (!cell || cell.trim() === "") {
          return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
        return cell.toUpperCase();
      })
    );
    setGrid(filled);
  }, [initialGrid]);

  // path değiştikçe partialWord hesaplayalım
  useEffect(() => {
    if (!selectedPath.length) {
      onPartialWordChange?.("");
      return;
    }
    const partial = buildStringFromPath(selectedPath, grid);
    onPartialWordChange?.(partial);

    // 10 karakteri aşarsa uyarı ver ve resetle
    if (selectedPath.length > 10) {
      setWarning("Too long!");
      // Biraz bekleyip reset
      setTimeout(() => {
        setSelectedPath([]);
        onPartialWordChange?.("");
        setWarning("");
      }, 800);
    }
  }, [selectedPath, grid, onPartialWordChange]);

  // pointerDown => path'i başlat
  const handlePointerDown = (row, col) => {
    // Seçimi sıfırla ve o hücreyle başla
    isPointerDown.current = true;
    setSelectedPath([{ row, col }]);
  };

  // pointerEnter => eğer pointerDown ise path'e ekle
  const handlePointerEnter = (row, col) => {
    if (!isPointerDown.current) return;
    // Son eklenen hücreyle aynı değilse ekle
    const last = selectedPath[selectedPath.length - 1];
    if (last && last.row === row && last.col === col) return;

    // 10 sınırını geçmiyorsak ekleyelim
    if (selectedPath.length < 10) {
      setSelectedPath((prev) => [...prev, { row, col }]);
    }
  };

  // pointerUp => path'i değerlendir
  const handlePointerUp = () => {
    // eğer 1 veya daha fazla hücre seçildiyse
    if (selectedPath.length > 0 && selectedPath.length <= 10) {
      // Tek çizgi mi?
      if (isStraightLine(selectedPath)) {
        const selectedWord = buildStringFromPath(selectedPath, grid);
        const reversed = selectedWord.split("").reverse().join("");

        // words listesinde var mı?
        const matched = words.find(
          (w) => w.toUpperCase() === selectedWord || w.toUpperCase() === reversed
        );
        if (matched) {
          onWordFound(matched.toUpperCase());
        }
      }
    }

    // Son olarak pointerDown=false, path sıfırla
    setSelectedPath([]);
    isPointerDown.current = false;
  };

  // mouse/touch alandan çıkarsa up olayını tetikle
  const handlePointerLeave = () => {
    if (isPointerDown.current) {
      handlePointerUp();
    }
  };

  return (
    <div
      className="inline-block select-none relative"
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* Uyarı mesajı */}
      {warning && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-red-200 text-red-700 px-2 py-1 rounded">
          {warning}
        </div>
      )}

      {grid.map((rowArray, rowIndex) => (
        <div key={rowIndex} className="flex">
          {rowArray.map((letter, colIndex) => {
            const isSelected = selectedPath.some(
              (p) => p.row === rowIndex && p.col === colIndex
            );

            return (
              <div
                key={colIndex}
                onPointerDown={() => handlePointerDown(rowIndex, colIndex)}
                onPointerEnter={() => handlePointerEnter(rowIndex, colIndex)}
                className={` 
                  w-8 h-8 md:w-10 md:h-10 
                  flex items-center justify-center 
                  text-lg md:text-xl font-bold cursor-pointer
                  ${
                    isSelected 
                      ? "bg-brandAccent text-white" 
                      : "bg-transparent text-gray-900"
                  }
                `}
                style={{ transition: "background-color 0.1s" }}
              >
                {letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default WordGrid;


