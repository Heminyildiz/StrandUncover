import React, { useEffect, useState } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Komşu mu? (8 yön)
 */
function isNeighbor(a, b) {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  if (rowDiff === 0 && colDiff === 0) return false; // aynı hücre
  return rowDiff <= 1 && colDiff <= 1;
}

/**
 * Yönü (dr, dc) bul, normalleştirmeye gerek yok, 
 * ama 8 yön olduğu için -1..1 arası
 */
function getDirection(a, b) {
  return { dr: b.row - a.row, dc: b.col - a.col };
}

/**
 * 2 consecutive pairs => compare direction 
 * eğer direction != bir önceki direction => directionChangeCount++
 * directionChangeCount > 1 => return false
 */
function checkShapeAllowed(path) {
  if (path.length < 2) return true; // tek hücre veya nokta => ok

  let directionChangeCount = 0;
  let prevDir = null;

  for (let i = 1; i < path.length; i++) {
    const dir = getDirection(path[i - 1], path[i]);
    if (i === 1) {
      // ilk segment
      prevDir = dir;
      continue;
    } else {
      // sonraki segment
      if (dir.dr !== prevDir.dr || dir.dc !== prevDir.dc) {
        // yön değişti
        directionChangeCount++;
        if (directionChangeCount > 1) {
          return false; // 2'den fazla dönüş => Z, S vb.
        }
        prevDir = dir; // yeni direction
      }
    }
  }

  return true; // 0 veya 1 dönüş => L, düz çizgi, diag
}

/** Path => string */
function buildStringFromPath(path, grid) {
  return path.map((p) => grid[p.row][p.col]).join("");
}

function WordGrid({ grid: initialGrid, words, onWordFound, onPartialWordChange }) {
  const [grid, setGrid] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [warning, setWarning] = useState("");

  // Boş hücreye random harf
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

  // partialWord
  useEffect(() => {
    if (selectedPath.length === 0) {
      onPartialWordChange?.("");
      return;
    }
    const partial = buildStringFromPath(selectedPath, grid);
    onPartialWordChange?.(partial);

    if (selectedPath.length > 10) {
      setWarning("Too long!");
      setTimeout(() => {
        setWarning("");
        resetSelection();
      }, 800);
    }
  }, [selectedPath, grid, onPartialWordChange]);

  const handleCellClick = (row, col) => {
    // Toggle?
    const existingIndex = selectedPath.findIndex((p) => p.row === row && p.col === col);
    if (existingIndex !== -1) {
      // Seçimi kaldır
      setSelectedPath((prev) => {
        const newPath = [...prev];
        newPath.splice(existingIndex, 1);
        return newPath;
      });
      return;
    }

    // Yeni hücre ekleme
    if (selectedPath.length === 0) {
      // path boşsa direkt ekle
      setSelectedPath([{ row, col }]);
    } else {
      // son hücreye komşu mu
      const lastCell = selectedPath[selectedPath.length - 1];
      if (!isNeighbor(lastCell, { row, col })) return;

      // önce path'e ekleyelim, sonra shape check
      const newPath = [...selectedPath, { row, col }];
      if (!checkShapeAllowed(newPath)) {
        // L, düz veya diag değil => reddet
        return;
      }

      if (newPath.length <= 10) {
        setSelectedPath(newPath);
      }
    }
  };

  // Kelime finalize
  const finalizeSelection = () => {
    if (selectedPath.length > 0 && selectedPath.length <= 10) {
      const selWord = buildStringFromPath(selectedPath, grid);
      const reversed = selWord.split("").reverse().join("");
      const found = words.find(
        (w) => w.toUpperCase() === selWord || w.toUpperCase() === reversed
      );
      if (found) {
        onWordFound?.(found.toUpperCase());
      }
    }
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedPath([]);
    onPartialWordChange?.("");
  };

  return (
    <div className="relative w-full flex flex-col items-center mt-4">
      {warning && (
        <div className="absolute top-0 bg-red-600 text-white px-2 py-1 rounded">
          {warning}
        </div>
      )}

      <div className="grid grid-rows-7 grid-cols-6 gap-1 p-1">
        {grid.map((rowArr, rowIndex) =>
          rowArr.map((letter, colIndex) => {
            const inPath = selectedPath.some(
              (p) => p.row === rowIndex && p.col === colIndex
            );
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={
                  "w-12 h-12 md:w-14 md:h-14 flex items-center justify-center " +
                  "text-lg md:text-xl font-bold cursor-pointer select-none " +
                  (inPath
                    ? "bg-[#bfdc80] text-black"
                    : "bg-white text-gray-900")
                }
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

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










