import React, { useEffect, useState } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// 8 yönlü “komşu” kontrolü
function isNeighbor(a, b) {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  // Kendisi değil ve fark <=1 => komşu
  return !(rowDiff === 0 && colDiff === 0) && rowDiff <= 1 && colDiff <= 1;
}

function buildStringFromPath(path, grid) {
  return path.map((p) => grid[p.row][p.col]).join("");
}

function WordGrid({ grid: initialGrid, words, onWordFound, onPartialWordChange }) {
  const [grid, setGrid] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    // Boş hücrelere random harf doldur
    const filled = initialGrid.map(row =>
      row.map(cell => {
        if (!cell || cell.trim() === "") {
          return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
        return cell.toUpperCase();
      })
    );
    setGrid(filled);
    setSelectedPath([]);
  }, [initialGrid]);

  useEffect(() => {
    if (!selectedPath.length) {
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

  // Hücreye tıklayınca path'e ekle
  const handleCellClick = (row, col) => {
    // Zaten path'te var mı?
    const alreadyInPath = selectedPath.some(p => p.row === row && p.col === col);
    if (alreadyInPath) return; // Tekrar eklemeyelim

    // Path boşsa direkt ekle
    if (selectedPath.length === 0) {
      setSelectedPath([{ row, col }]);
      return;
    }
    // Değilse, son seçili hücreye komşu mu?
    const lastCell = selectedPath[selectedPath.length - 1];
    if (isNeighbor(lastCell, { row, col })) {
      if (selectedPath.length < 10) {
        setSelectedPath([...selectedPath, { row, col }]);
      }
    }
  };

  // Seçim bitti sayılır -> kelime var mı kontrol
  const finalizeSelection = () => {
    if (selectedPath.length > 0 && selectedPath.length <= 10) {
      const selectedWord = buildStringFromPath(selectedPath, grid);
      const reversed = selectedWord.split("").reverse().join("");
      const found = words.find(
        w => w.toUpperCase() === selectedWord || w.toUpperCase() === reversed
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
        <div className="absolute top-0 bg-brandRed text-white px-2 py-1 rounded">
          {warning}
        </div>
      )}

      {/* 
        GRID 7x6 
        Tıklandığında handleCellClick => path'e ekle 
        finalizeSelection butonu => kelime kontrol
      */}
      <div className="grid grid-rows-7 grid-cols-6 gap-1 p-1">
        {grid.map((rowArray, rowIndex) =>
          rowArray.map((letter, colIndex) => {
            const isSelected = selectedPath.some(
              p => p.row === rowIndex && p.col === colIndex
            );
            const cellCls = `
              w-12 h-12 md:w-14 md:h-14
              flex items-center justify-center
              text-lg md:text-xl font-bold
              cursor-pointer select-none
              ${
                isSelected
                  ? "bg-[#bfdc80] text-black"
                  : "bg-white text-gray-900"
              }
            `;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={cellCls}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      {/* Buton: finalize selection */}
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







