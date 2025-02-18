import React, { useEffect, useState, useRef } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Sadece son seçili harfin 8 komşusundan biri mi?
function isNeighbor(last, next) {
  const rowDiff = Math.abs(next.row - last.row);
  const colDiff = Math.abs(next.col - last.col);
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

function buildStringFromPath(path, grid) {
  return path.map((p) => grid[p.row][p.col]).join("");
}

function WordGrid({
  grid: initialGrid,
  words,
  onWordFound,
  onPartialWordChange
}) {
  const [grid, setGrid] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [warning, setWarning] = useState("");
  const pointerDownRef = useRef(false);

  useEffect(() => {
    // Boş hücrelere ("" ya da " ") rastgele harf
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

  const handlePointerDown = (e) => {
    e.preventDefault();
    pointerDownRef.current = true;
    setSelectedPath([]);
  };

  const handlePointerMove = (e) => {
    if (!pointerDownRef.current) return;
    e.preventDefault();

    // Hangi hücreye geldik?
    const target = e.target;
    if (!target.dataset.row) return;

    const row = parseInt(target.dataset.row, 10);
    const col = parseInt(target.dataset.col, 10);

    // Path'te zaten var mı?
    const exists = selectedPath.some((p) => p.row === row && p.col === col);
    if (exists) return;

    // İlk hücreyse direkt ekle
    if (selectedPath.length === 0) {
      setSelectedPath([{ row, col }]);
    } else {
      // Sondaki hücreye komşu mu?
      const lastCell = selectedPath[selectedPath.length - 1];
      if (isNeighbor(lastCell, { row, col })) {
        if (selectedPath.length < 10) {
          setSelectedPath((prev) => [...prev, { row, col }]);
        }
      }
    }
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    pointerDownRef.current = false;
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

  const resetSelection = () => {
    setSelectedPath([]);
    onPartialWordChange?.("");
  };

  return (
    <div className="relative w-full flex justify-center mt-4">
      {warning && (
        <div className="absolute top-0 bg-brandRed text-white px-2 py-1 rounded">
          {warning}
        </div>
      )}

      <div
        className="grid grid-rows-7 grid-cols-6 gap-1 p-1"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {grid.map((rowArray, rowIndex) =>
          rowArray.map((letter, colIndex) => {
            const isSelected = selectedPath.some(
              (p) => p.row === rowIndex && p.col === colIndex
            );
            return (
              <div
                key={`${rowIndex},${colIndex}`}
                data-row={rowIndex}
                data-col={colIndex}
                className={`
                  w-12 h-12 md:w-14 md:h-14 
                  flex items-center justify-center 
                  text-lg md:text-xl font-bold 
                  cursor-pointer select-none
                  ${
                    isSelected
                      ? "bg-[#bfdc80] text-black"
                      : "bg-white text-gray-900"
                  }
                `}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default WordGrid;






