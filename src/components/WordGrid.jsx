import React, { useEffect, useState } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * 8 yönlü "komşu" check
 */
function isNeighbor(a, b) {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  if (rowDiff === 0 && colDiff === 0) return false; 
  return rowDiff <= 1 && colDiff <= 1;
}

/**
 * Yön bulma
 */
function getDirection(a, b) {
  return { dr: b.row - a.row, dc: b.col - a.col };
}

/**
 * checkShapeAllowed => path'te directionChange=0 (hiç dönüş yok)
 * => düz çizgi
 */
function checkShapeAllowed(path) {
  if (path.length < 2) return true; // tek hücre => ok

  let directionChangeCount = 0;
  let prevDir = null;

  for (let i = 1; i < path.length; i++) {
    const dir = getDirection(path[i - 1], path[i]);
    if (i === 1) {
      prevDir = dir;
      continue;
    } else {
      // sonraki segment
      if (dir.dr !== prevDir.dr || dir.dc !== prevDir.dc) {
        // yön değişti => “L” shape
        directionChangeCount++;
        if (directionChangeCount > 0) {
          // 0'dan fazla => red
          return false;
        }
        prevDir = dir;
      }
    }
  }

  return true; // 0 change => düz çizgi (yatay, dikey, diagonal)
}

function buildStringFromPath(path, grid) {
  return path.map((p) => grid[p.row][p.col]).join("");
}

function WordGrid({ grid: initialGrid, words, onWordFound, onPartialWordChange }) {
  const [grid, setGrid] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [warning, setWarning] = useState("");

  // Boş hücreleri random harf
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

  // Toggle cell
  const handleCellClick = (row, col) => {
    // Zaten path'te mi?
    const existingIndex = selectedPath.findIndex((p) => p.row === row && p.col === col);
    if (existingIndex !== -1) {
      // path'ten çıkar
      setSelectedPath((prev) => {
        const newPath = [...prev];
        newPath.splice(existingIndex, 1);
        return newPath;
      });
      return;
    }

    // Yeni hücre ekle
    if (selectedPath.length === 0) {
      // path boşsa direkt ekle
      setSelectedPath([{ row, col }]);
    } else {
      // son hücreye komşu mu
      const lastCell = selectedPath[selectedPath.length - 1];
      if (!isNeighbor(lastCell, { row, col })) return;

      const newPath = [...selectedPath, { row, col }];
      // check shape
      if (!checkShapeAllowed(newPath)) {
        return; // düz çizgi değil => reddet
      }

      if (newPath.length <= 10) {
        setSelectedPath(newPath);
      }
    }
  };

  const finalizeSelection = () => {
    if (selectedPath.length > 0 && selectedPath.length <= 10) {
      const selectedWord = buildStringFromPath(selectedPath, grid);
      // YALNIZCA normal yön => ters yok
      const found = words.find(
        (w) => w.toUpperCase() === selectedWord
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











