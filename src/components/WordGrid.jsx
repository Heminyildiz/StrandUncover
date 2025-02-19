import React, { useEffect, useState } from "react";

// Kullanacağımız harf seti
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Komşu kontrolü (8 yön)
 * rowDiff, colDiff <= 1 ve kendisi değilse => komşu (L, Z, vs. her eğik yol mümkün)
 */
function isNeighbor(a, b) {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  if (rowDiff === 0 && colDiff === 0) return false; // aynı hücre değil
  return rowDiff <= 1 && colDiff <= 1;
}

/**
 * Path'teki hücrelerden harfleri alıp string oluşturma
 */
function buildStringFromPath(path, grid) {
  return path.map((p) => grid[p.row][p.col]).join("");
}

/**
 * WordGrid Bileşeni
 * - Harf ızgarası
 * - Tıklanan hücreyi path'e ekleme/çıkarma
 * - Confirm Word butonu
 */
function WordGrid({ grid: initialGrid, words, onWordFound, onPartialWordChange }) {
  const [grid, setGrid] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [warning, setWarning] = useState("");

  // İlk yüklemede, boş hücrelere rastgele harf doldur
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
    setSelectedPath([]);
  }, [initialGrid]);

  // Path değişince partialWord güncelle
  useEffect(() => {
    if (selectedPath.length === 0) {
      onPartialWordChange?.("");
      return;
    }
    const partial = buildStringFromPath(selectedPath, grid);
    onPartialWordChange?.(partial);

    // 10 harf sınırı
    if (selectedPath.length > 10) {
      setWarning("Too long!");
      setTimeout(() => {
        setWarning("");
        resetSelection();
      }, 800);
    }
  }, [selectedPath, grid, onPartialWordChange]);

  // Hücreye tıklama => path'e ekle veya çıkar (toggle)
  const handleCellClick = (row, col) => {
    // Zaten path'te mi?
    const existingIndex = selectedPath.findIndex((p) => p.row === row && p.col === col);
    if (existingIndex !== -1) {
      // Path'ten çıkar (toggle off)
      setSelectedPath((prev) => {
        const newPath = [...prev];
        newPath.splice(existingIndex, 1);
        return newPath;
      });
      return;
    }

    // Yeni hücre ekle
    if (selectedPath.length === 0) {
      // Henüz seçili yoksa direkt ekle
      setSelectedPath([{ row, col }]);
    } else {
      // Son seçili hücreye komşu mu?
      const lastCell = selectedPath[selectedPath.length - 1];
      if (isNeighbor(lastCell, { row, col })) {
        if (selectedPath.length < 10) {
          setSelectedPath((prev) => [...prev, { row, col }]);
        }
      }
    }
  };

  // Confirm Word => kelime bulunmuş mu kontrol et
  const finalizeSelection = () => {
    if (selectedPath.length > 0 && selectedPath.length <= 10) {
      const selectedWord = buildStringFromPath(selectedPath, grid);
      const reversed = selectedWord.split("").reverse().join("");
      const found = words.find(
        (w) => w.toUpperCase() === selectedWord || w.toUpperCase() === reversed
      );
      if (found) {
        onWordFound?.(found.toUpperCase());
      }
    }
    resetSelection();
  };

  // Seçimi sıfırla
  const resetSelection = () => {
    setSelectedPath([]);
    onPartialWordChange?.("");
  };

  return (
    <div className="relative w-full flex flex-col items-center mt-4">
      {/* Uyarı (ör. "Too long!") */}
      {warning && (
        <div className="absolute top-0 bg-red-500 text-white px-2 py-1 rounded">
          {warning}
        </div>
      )}

      {/* Harf Izgarası */}
      <div className="grid grid-rows-7 grid-cols-6 gap-1 p-1">
        {grid.map((rowArray, rowIndex) =>
          rowArray.map((letter, colIndex) => {
            const isInPath = selectedPath.some(
              (p) => p.row === rowIndex && p.col === colIndex
            );
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={
                  "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center " +
                  "text-lg md:text-xl font-bold cursor-pointer select-none " +
                  (isInPath ? "bg-[#bfdc80] text-black" : "bg-white text-gray-900")
                }
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      {/* Kelimeyi Onayla Butonu */}
      <button
        onClick={finalizeSelection}
        className="mt-3 px-4 py-2 bg-[#92555B] text-white rounded hover:opacity-80"
      >
        Confirm Word
      </button>
    </div>
  );
}

export default WordGrid;









